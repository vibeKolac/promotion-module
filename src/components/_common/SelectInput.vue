<template>
  <div>
    <v-select
      v-bind="$attrs"
      :model-value="modelValue"
      :label="label"
      :hint="helpText"
      :persistent-hint="!!helpText"
      :disabled="disabled"
      :error-messages="errorMessages"
      :items="normalizedItems"
      :item-title="itemText"
      :item-value="itemValue"
      :multiple="multiple"
      :return-object="returnObject"
      :density="dense ? 'compact' : undefined"
      variant="outlined"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { default: null },
  label: { type: String, default: '' },
  helpText: { type: String, default: '' },
  dense: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  errorMessages: { type: [String, Array], default: () => [] },
  data: { type: Array, default: () => [] },
  itemText: { type: String, default: 'label' },
  itemValue: { type: String, default: 'key' },
  multiple: { type: Boolean, default: false },
  returnObject: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// Accept both { key, label } (ADO shape) and { value, title } (Vuetify shape) transparently
const normalizedItems = computed(() =>
  props.data.map(item => {
    if (typeof item !== 'object' || item === null) return item
    if ('key' in item || 'label' in item) return item
    // Vuetify shape → ADO shape
    const mapped = { ...item }
    if ('value' in item && !('key' in item)) mapped.key = item.value
    if ('title' in item && !('label' in item)) mapped.label = item.title
    return mapped
  })
)
</script>
