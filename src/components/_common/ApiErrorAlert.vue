<template>
  <v-alert
    v-if="error"
    type="error"
    variant="tonal"
    density="compact"
    closable
    class="mb-4"
    @click:close="$emit('dismiss')"
  >
    {{ message }}
  </v-alert>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: { type: [Error, Object, String], default: null },
  fallback: { type: String, default: 'An unexpected error occurred.' },
})

defineEmits(['dismiss'])

const message = computed(() => {
  if (!props.error) return ''
  if (typeof props.error === 'string') return props.error
  return props.error?.response?.data?.error ?? props.error?.message ?? props.fallback
})
</script>
