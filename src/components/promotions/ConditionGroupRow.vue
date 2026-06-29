<!-- src/components/promotions/ConditionGroupRow.vue -->
<template>
  <div class="condition-group rounded border">
    <div class="group-header d-flex align-center px-3 py-2">
      <v-icon size="16" color="primary" class="mr-1">mdi-layers-outline</v-icon>
      <span class="text-caption font-weight-bold text-primary text-uppercase">Condition group</span>
      <v-spacer />
      <v-btn
        icon="mdi-delete-outline"
        size="x-small"
        variant="text"
        color="error"
        density="comfortable"
        title="Remove group"
        @click="$emit('remove')"
      />
    </div>

    <div class="group-body pa-3">
      <ConditionsEditor
        v-model="conditions"
        :allow-groups="false"
        :show-preset="false"
        :show-header="false"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ConditionsEditor from './ConditionsEditor.vue'

const props = defineProps({
  group: { type: Object, required: true },
  scope: { type: String, default: 'cart' },
})
const emit = defineEmits(['update:group', 'remove'])

const conditions = computed({
  get: () => props.group.conditions,
  set: (val) => emit('update:group', { ...props.group, conditions: val }),
})
</script>

<style scoped>
.condition-group {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  flex: 1;
  min-width: 0;
}

.group-header {
  background: rgba(var(--v-theme-primary), 0.06);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.15);
  border-radius: 4px 4px 0 0;
}
</style>
