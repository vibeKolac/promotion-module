<!-- src/components/promotions/StepDiscountEditor.vue -->
<template>
  <div>
    <div v-for="(step, idx) in modelValue" :key="step.id" class="d-flex align-center gap-3 mb-2">
      <v-text-field
        :model-value="autoThreshold ? autoThreshold(idx) : step.threshold"
        :label="stepType === 'QTY' ? (autoThreshold ? `Tier ${idx + 1} — qty` : 'Quantity') : (autoThreshold ? `Tier ${idx + 1} — spend (€)` : 'Min spend')"
        :prefix="stepType === 'SPENT' ? '€' : undefined"
        variant="outlined"
        density="compact"
        type="number"
        min="1"
        hide-details
        style="max-width: 160px"
        :readonly="!!autoThreshold"
        :bg-color="autoThreshold ? 'grey-lighten-4' : undefined"
        @update:model-value="!autoThreshold && update(idx, 'threshold', $event)"

      />
      <span class="text-medium-emphasis">→</span>
      <v-text-field
        :model-value="step.value"
        :label="amountType === 'PERCENT' ? 'Discount %' : 'Discount €'"
        :suffix="amountType === 'PERCENT' ? '%' : '€'"
        variant="outlined"
        density="compact"
        type="number"
        min="0"
        hide-details
        style="max-width: 140px"
        @update:model-value="update(idx, 'value', $event)"
      />
      <v-btn icon="mdi-delete" variant="text" color="error" size="small" @click="remove(idx)" />
    </div>
    <v-btn
      v-if="!maxSteps || modelValue.length < Number(maxSteps)"
      prepend-icon="mdi-plus"
      variant="text"
      color="primary"
      size="small"
      @click="addStep"
    >
      {{ maxSteps && modelValue.length === 0 ? `Add ${maxSteps} tiers` : 'Add tier' }}
    </v-btn>
    <p v-else class="text-caption text-medium-emphasis mt-1">
      Maximum {{ maxSteps }} tier(s) reached.
    </p>
    <p v-if="autoThreshold" class="text-caption text-medium-emphasis mt-1">
      Thresholds are auto-calculated from the step increment.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { v4 as uuid } from 'uuid'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  stepType: { type: String, default: 'SPENT' },
  amountType: { type: String, default: 'PERCENT' },
  stepValue: { type: [Number, String], default: null },
  maxSteps: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:modelValue'])

const autoThreshold = computed(() =>
  props.stepValue && Number(props.stepValue) > 0
    ? (idx) => (idx + 1) * Number(props.stepValue)
    : null
)

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
  const max = Number(props.maxSteps)
  const sv = Number(props.stepValue)
  if (max > 0 && props.modelValue.length === 0) {
    emit('update:modelValue', Array.from({ length: max }, (_, i) => ({
      id: uuid(),
      threshold: sv > 0 ? (i + 1) * sv : '',
      value: '',
    })))
  } else {
    const nextIdx = props.modelValue.length
    emit('update:modelValue', [...props.modelValue, {
      id: uuid(),
      threshold: sv > 0 ? (nextIdx + 1) * sv : '',
      value: '',
    }])
  }
}
</script>
