<!-- src/components/ai/AiAssistantPanel.vue -->
<template>
  <v-navigation-drawer
    v-model="uiStore.aiPanelOpen"
    location="right"
    width="420"
    temporary
  >
    <div class="d-flex flex-column" style="height: 100%">
      <!-- Header -->
      <div class="d-flex align-center pa-4 border-b">
        <v-icon color="primary" class="mr-2">mdi-creation</v-icon>
        <span class="text-body-1 font-weight-bold flex-grow-1">AI Assistant</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="uiStore.closeAiPanel()" />
      </div>

      <!-- Template quick actions -->
      <div class="pa-3 border-b">
        <div class="text-caption text-medium-emphasis mb-2">QUICK TEMPLATES</div>
        <div class="d-flex flex-wrap gap-1">
          <v-chip
            v-for="tpl in templatesStore.items"
            :key="tpl.id"
            size="small"
            variant="outlined"
            color="primary"
            class="cursor-pointer"
            @click="applyTemplate(tpl)"
          >
            {{ tpl.label }}
          </v-chip>
        </div>
      </div>

      <!-- Message history -->
      <div ref="messagesEl" class="flex-grow-1 overflow-y-auto pa-4" style="min-height: 0">
        <div v-if="!uiStore.aiMessages.length" class="text-center text-medium-emphasis pa-8">
          <v-icon size="40" class="mb-3">mdi-chat-outline</v-icon>
          <div class="text-body-2">Describe a promotion in plain language</div>
          <div class="text-caption mt-1">e.g. "20% off Nike sneakers over $100"</div>
        </div>

        <div v-for="msg in uiStore.aiMessages" :key="msg.id" class="mb-3">
          <div
            class="rounded pa-3 text-body-2"
            :class="msg.role === 'user'
              ? 'bg-grey-lighten-3 ml-8'
              : 'bg-primary-bg mr-8'"
          >
            {{ msg.text }}
          </div>
          <SmartRulePreview
            v-if="msg.parsedRule && uiStore.pendingParsedRule === msg.parsedRule"
            :parsed="msg.parsedRule"
            class="mt-2 mr-8"
            @apply="uiStore.applyPendingRule()"
            @edit="editParsedRule()"
            @dismiss="uiStore.clearPendingRule()"
          />
        </div>

        <div v-if="uiStore.aiTyping" class="d-flex align-center gap-2 text-medium-emphasis text-caption">
          <v-progress-circular indeterminate size="14" width="2" />
          Analysing…
        </div>
      </div>

      <!-- Input -->
      <div class="pa-3 border-t">
        <v-text-field
          v-model="inputText"
          placeholder="Describe a promotion rule…"
          variant="outlined"
          density="compact"
          hide-details
          append-inner-icon="mdi-send"
          @keyup.enter="send"
          @click:append-inner="send"
        />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../../stores/ui'
import { useTemplatesStore } from '../../stores/templates'
import SmartRulePreview from './SmartRulePreview.vue'

const uiStore = useUiStore()
const templatesStore = useTemplatesStore()
const router = useRouter()
const inputText = ref('')
const messagesEl = ref(null)

onMounted(() => templatesStore.fetchAll())

function send() {
  if (!inputText.value.trim()) return
  uiStore.sendMessage(inputText.value.trim())
  inputText.value = ''
}

function editParsedRule() {
  uiStore.applyPendingRule()
  router.push('/promotions/new')
}

function applyTemplate(tpl) {
  uiStore.selectTemplate(tpl)
}

watch(
  () => uiStore.aiMessages.length,
  () => nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
)
</script>
