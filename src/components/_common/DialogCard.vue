<template>
  <v-dialog v-bind="$attrs" :model-value="isOpen" @update:model-value="onOverlayUpdate">
    <v-card>
      <v-card-title v-if="$slots.title" class="pa-5 pb-2 text-h6">
        <slot name="title" />
      </v-card-title>
      <v-card-text class="pa-5 pt-2">
        <slot />
      </v-card-text>
      <v-card-actions v-if="$slots.actions" class="pa-5 pt-0">
        <v-spacer />
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })

const isOpen = ref(false)

function open() { isOpen.value = true }
function close() { isOpen.value = false }
function onOverlayUpdate(val) { if (!val) isOpen.value = false }

defineExpose({ open, close })
</script>
