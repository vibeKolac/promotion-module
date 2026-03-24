import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseRuleFromNaturalLanguage } from '../utils/naturalLanguageParser'
import { usePromotionsStore } from './promotions'
import { v4 as uuid } from 'uuid'
import { calculateDatesFromDuration } from '../utils/wizardStateManager'

export const useUiStore = defineStore('ui', () => {
  const aiPanelOpen = ref(false)
  const aiMessages = ref([])
  const aiTyping = ref(false)
  const pendingParsedRule = ref(null)

  const wizardActive = ref(false)
  const wizardCollapsed = ref(false)
  const wizardMode = ref(null)
  const wizardStep = ref(0)
  const wizardData = ref({})

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
    const parsed = {
      type: template.ruleType,
      value: template.defaultValue,
      valueUnit: template.defaultValueUnit,
      conditions: template.defaultConditions,
      confidence: 1.0,
      missingFields: [],
    }
    pendingParsedRule.value = parsed
    aiMessages.value.push({
      id: uuid(),
      role: 'assistant',
      text: `Template "${template.label}" ready. Review and apply below.`,
      parsedRule: parsed,
    })
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

  function startWizard(mode) {
    wizardActive.value = true
    wizardMode.value = mode
    wizardStep.value = mode === null ? 0 : 1
    wizardData.value = {}
  }

  function wizardNext(stepId, value) {
    wizardData.value = { ...wizardData.value, [stepId]: value }
    wizardStep.value++
  }

  function wizardBack() {
    if (wizardStep.value > 1) wizardStep.value--
  }

  function wizardGoToStep(n) {
    if (n >= 1 && n < wizardStep.value) wizardStep.value = n
  }

  function wizardReset() {
    wizardActive.value = false
    wizardCollapsed.value = false
    wizardMode.value = null
    wizardStep.value = 0
    wizardData.value = {}
  }

  function toggleWizardCollapsed() {
    wizardCollapsed.value = !wizardCollapsed.value
  }

  function wizardSetData(data) {
    wizardData.value = { ...wizardData.value, ...data }
  }

  function applyWizardDraft() {
    const d = wizardData.value
    const parsed = { confidence: 1.0, missingFields: [] }

    parsed.type = d.type ?? 'discount'
    parsed.name = d.name || null

    if (d.type === 'multi_buy') {
      const [buy, free] = (d.value ?? '2+1').split('+')
      parsed.buyQty = Number(buy); parsed.freeQty = Number(free)
      parsed.value = d.value; parsed.valueUnit = '%'
    } else if (d.type === 'gift') {
      parsed.value = 'Free Gift'; parsed.valueUnit = '%'
      parsed.gifts = [{ sku: d.value || 'GIFT-001', quantity: 1, price: 0.01 }]
    } else if (d.type === 'step_discount') {
      parsed.value = d.value; parsed.stepValue = d.stepValue
      parsed.valueUnit = 'fixed'
    } else {
      parsed.value = String(d.value ?? '').replace('%', '')
      parsed.valueUnit = '%'
    }

    if (d.duration) {
      const dates = calculateDatesFromDuration(d.duration)
      parsed.startDate = dates.startDate; parsed.endDate = dates.endDate
    }

    if (!d.target || d.target === 'all') {
      parsed.conditions = []
    } else if (d.target.startsWith('brand:')) {
      parsed.conditions = [{ field: 'brands', mode: 'include', values: [d.target.slice(6).trim()] }]
    } else if (d.target.startsWith('subtotal:')) {
      const amount = d.target.slice(9).trim()
      parsed.conditions = [{ field: 'subtotal', mode: 'include', values: [amount], operator: '>=' }]
    } else {
      parsed.conditions = [{ field: 'categories', mode: 'include', values: [d.target] }]
    }

    usePromotionsStore().applyParsedRule(parsed)
  }

  return {
    aiPanelOpen, aiMessages, aiTyping, pendingParsedRule,
    openAiPanel, closeAiPanel, sendMessage, selectTemplate, applyPendingRule, clearPendingRule,
    wizardActive, wizardCollapsed, wizardMode, wizardStep, wizardData,
    startWizard, wizardNext, wizardBack, wizardGoToStep, wizardReset,
    toggleWizardCollapsed, wizardSetData, applyWizardDraft,
  }
})
