<!-- src/components/promotions/StepDiscountEditor.vue -->
<template>
  <div>
    <div v-for="(step, idx) in modelValue" :key="step.id" class="d-flex align-center gap-3 mb-2">
      <v-text-field
        :model-value="step.threshold"
        label="Spend at least"
        prefix="$"
        variant="outlined"
        density="compact"
        type="number"
        hide-details
        style="max-width: 160px"
        @update:model-value="update(idx, 'threshold', $event)"
      />
      <span class="text-medium-emphasis">→ get</span>
      <v-text-field
        :model-value="step.value"
        label="Discount"
        variant="outlined"
        density="compact"
        type="number"
        hide-details
        style="max-width: 120px"
        @update:model-value="update(idx, 'value', $event)"
      />
      <v-select
        :model-value="step.valueUnit"
        :items="[{ value: '%', title: '%' }, { value: 'fixed', title: '$ off' }]"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 100px"
        @update:model-value="update(idx, 'valueUnit', $event)"
      />
      <v-btn icon="mdi-delete" variant="text" color="error" size="small" @click="remove(idx)" />
    </div>
    <v-btn prepend-icon="mdi-plus" variant="text" color="primary" size="small" @click="addStep">
      Add tier
    </v-btn>
  </div>
</template>

<script setup>
import { v4 as uuid } from 'uuid'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

function update(idx, key, val) {
  const steps = [...props.modelValue]
  steps[idx] = { ...steps[idx], [key]: val }
  emit('update:modelValue', steps)
}

function remove(idx) {
  const steps = [...props.modelValue]
  steps.splice(idx, 1)
  emit('update:modelValue', steps)
}

function addStep() {
  emit('update:modelValue', [...props.modelValue, { id: uuid(), threshold: '', value: '', valueUnit: '%' }])
}
</script>
