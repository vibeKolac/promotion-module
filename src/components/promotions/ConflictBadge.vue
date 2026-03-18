<!-- src/components/promotions/ConflictBadge.vue -->
<template>
  <v-tooltip :text="tooltipText" location="top">
    <template #activator="{ props }">
      <v-chip v-bind="props" color="warning" variant="tonal" size="x-small" label prepend-icon="mdi-alert">
        {{ count }}
      </v-chip>
    </template>
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  conflicts: { type: Array, default: () => [] },
})
const count = computed(() => props.conflicts.length)
const tooltipText = computed(() =>
  props.conflicts.map(c => c.message).join(' • ')
)
</script>
