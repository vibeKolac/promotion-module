import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseRuleFromNaturalLanguage } from '../utils/naturalLanguageParser'
import { usePromotionsStore } from './promotions'
import { v4 as uuid } from 'uuid'

export const useUiStore = defineStore('ui', () => {
  const aiPanelOpen = ref(false)
  const aiMessages = ref([])
  const aiTyping = ref(false)
  const pendingParsedRule = ref(null)

  function openAiPanel() { aiPanelOpen.value = true }
  function closeAiPanel() { aiPanelOpen.value = false }

  function sendMessage(input) {
    aiMessages.value.push({ id: uuid(), role: 'user', text: input })
    aiTyping.value = true
    setTimeout(() => {
      const parsed = parseRuleFromNaturalLanguage(input)
      pendingParsedRule.value = parsed
      aiTyping.value = false
      aiMessages.value.push({
        id: uuid(), role: 'assistant',
        text: `I found a ${parsed.type} rule with confidence ${Math.round(parsed.confidence * 100)}%. Review and apply below.`,
        parsedRule: parsed,
      })
    }, 600)
  }

  function selectTemplate(template) {
    pendingParsedRule.value = {
      type: template.ruleType,
      value: template.defaultValue,
      valueUnit: template.defaultValueUnit,
      conditions: template.defaultConditions,
      confidence: 1.0,
      missingFields: [],
    }
  }

  function applyPendingRule() {
    if (!pendingParsedRule.value) return
    usePromotionsStore().applyParsedRule(pendingParsedRule.value)
    pendingParsedRule.value = null
    closeAiPanel()
  }

  function clearPendingRule() {
    pendingParsedRule.value = null
  }

  return {
    aiPanelOpen, aiMessages, aiTyping, pendingParsedRule,
    openAiPanel, closeAiPanel, sendMessage, selectTemplate, applyPendingRule, clearPendingRule,
  }
})
