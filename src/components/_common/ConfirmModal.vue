<template>
  <v-dialog v-model="isOpen" max-width="400">
    <v-card>
      <v-card-title class="pa-5 pb-2 text-h6">
        <slot name="header">Confirm</slot>
      </v-card-title>
      <v-card-text class="pa-5 pt-2">
        <slot name="body" />
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <slot name="actions">
          <v-btn variant="text" @click="resolve(false)">Cancel</v-btn>
          <v-btn :color="confirmColor" variant="flat" :loading="loading" @click="resolve(true)">
            {{ confirmText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  confirmText: { type: String, default: 'Confirm' },
  confirmColor: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
})

const isOpen = ref(false)
let _resolve = null

function open() {
  isOpen.value = true
  return new Promise((res) => { _resolve = res })
}

function resolve(value) {
  isOpen.value = false
  _resolve?.(value)
  _resolve = null
}

defineExpose({ open })
</script>
