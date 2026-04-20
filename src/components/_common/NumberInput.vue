<template>
  <div>
    <v-text-field
      v-bind="$attrs"
      :model-value="modelValue"
      :label="label"
      :hint="helpText"
      :persistent-hint="!!helpText"
      :disabled="disabled"
      :error-messages="errorMessages"
      type="number"
      :density="dense ? 'compact' : undefined"
      variant="outlined"
      @update:model-value="$emit('update:modelValue', $event === '' ? null : $event)"
    />
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: { type: Number, default: null },
  label: { type: String, default: '' },
  helpText: { type: String, default: '' },
  dense: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  errorMessages: { type: [String, Array], default: () => [] },
})

defineEmits(['update:modelValue'])
</script>
