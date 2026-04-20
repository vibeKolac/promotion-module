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
      :type="showPassword ? 'text' : type"
      :density="dense ? 'compact' : undefined"
      variant="outlined"
      :append-inner-icon="type === 'password' ? (showPassword ? 'mdi-eye-off' : 'mdi-eye') : appendIcon"
      @update:model-value="$emit('update:modelValue', $event)"
      @click:append-inner="type === 'password' && (showPassword = !showPassword)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  helpText: { type: String, default: '' },
  dense: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  errorMessages: { type: [String, Array], default: () => [] },
  type: { type: String, default: 'text' },
  appendIcon: { type: String, default: undefined },
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)
</script>
