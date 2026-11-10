<!-- src/components/promotions/ConditionGroupRow.vue -->
<template>
  <div class="condition-group rounded-lg border pa-5">
    <div class="d-flex align-center flex-wrap mb-4" style="gap: 12px">
      <span class="text-h6 font-weight-bold text-medium-emphasis text-uppercase">Group {{ index }}</span>
      <v-spacer />
      <span v-if="group.conditions.length > 1" class="text-body-1 text-medium-emphasis">Combine with</span>
      <v-btn-toggle
        v-if="group.conditions.length > 1"
        :model-value="groupOp"
        mandatory
        density="comfortable"
        variant="outlined"
        divided
        @update:model-value="editorRef?.setGroupOp($event)"
      >
        <v-btn value="AND" size="small">AND</v-btn>
        <v-btn value="OR" size="small">OR</v-btn>
      </v-btn-toggle>
      <v-btn prepend-icon="mdi-delete-outline" variant="text" color="error" @click="$emit('remove')">
        Remove group
      </v-btn>
    </div>

    <ConditionsEditor
      ref="editorRef"
      v-model="conditions"
      :allow-groups="false"
      :show-preset="false"
      :show-header="false"
      :show-combine="false"
      :allowed-types="allowedTypes"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ConditionsEditor from './ConditionsEditor.vue'

const props = defineProps({
  group: { type: Object, required: true },
  scope: { type: String, default: 'cart' },
  index: { type: Number, default: 1 },
  allowedTypes: { type: Array, default: null },
})
const emit = defineEmits(['update:group', 'remove'])

const editorRef = ref(null)
const groupOp = computed(() => props.group.conditions.find(c => c.logicalOp)?.logicalOp ?? 'AND')

const conditions = computed({
  get: () => props.group.conditions,
  set: (val) => emit('update:group', { ...props.group, conditions: val }),
})
</script>

<style scoped>
.condition-group {
  flex: 1;
  min-width: 0;
}
</style>
