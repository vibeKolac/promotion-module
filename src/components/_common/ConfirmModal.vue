<template>
  <v-dialog v-model="isOpen" max-width="400">
    <v-card v-if="isOpen">
      <v-card-title class="pa-5 pb-2 text-h6">
        <slot name="header" :item="item">Confirm</slot>
      </v-card-title>
      <v-card-text class="pa-5 pt-2">
        <slot name="body" :item="item" />
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <slot name="actions" :item="item" :cancel="cancel" :confirm="confirm">
          <v-btn variant="text" color="info" @click="cancel">Cancel</v-btn>
          <v-btn :color="confirmColor" :loading="loading" @click="confirm">
            {{ confirmText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  confirmText: { type: String, default: 'Confirm' },
  confirmColor: { type: String, default: 'error' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'confirm'])

const isOpen = ref(false)
const item = ref(null)
let _resolve = null

watch(isOpen, (val) => { if (!val) cancel() })

function open(payload = true) {
  item.value = payload
  isOpen.value = true
  return new Promise((res) => { _resolve = res })
}

function cancel() {
  if (!_resolve) return
  isOpen.value = false
  _resolve(false)
  _resolve = null
  item.value = null
  emit('cancel')
}

function confirm() {
  isOpen.value = false
  _resolve?.(true)
  _resolve = null
  item.value = null
  emit('confirm')
}

defineExpose({ open, close: cancel })
</script>
