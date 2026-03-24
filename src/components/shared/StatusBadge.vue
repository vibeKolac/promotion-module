<!-- src/components/shared/StatusBadge.vue -->
<template>
  <v-chip
    :color="config.color"
    :variant="config.variant"
    size="small"
    label
  >{{ config.label }}</v-chip>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ status: { type: String, required: true } })
const config = computed(() => ({
  active:    { color: 'success',  variant: 'tonal',    label: 'Active' },
  inactive:  { color: 'default',  variant: 'outlined', label: 'Inactive' },
  scheduled: { color: 'info',     variant: 'tonal',    label: 'Scheduled' },
  paused:    { color: 'warning',  variant: 'tonal',    label: 'Paused' },
  expired:   { color: 'default',  variant: 'outlined', label: 'Expired' },
  ended:     { color: 'default',  variant: 'outlined', label: 'Ended' },
}[props.status] ?? { color: 'default', variant: 'outlined', label: props.status }))
</script>
