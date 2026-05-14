<!-- src/components/promotions/ConflictBadge.vue -->
<template>
  <v-tooltip :text="tooltipText" location="top">
    <template #activator="{ props }">
      <div v-bind="props" class="conflict-badge">
        <v-icon size="13">mdi-alert</v-icon>
        <span>{{ count }}</span>
      </div>
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

<style scoped>
.conflict-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  background: rgba(var(--v-theme-warning), 0.15);
  color: rgb(var(--v-theme-warning));
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 500;
  line-height: 20px;
  cursor: default;
}
</style>
