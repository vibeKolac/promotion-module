<!-- src/components/promotions/ConditionValuePicker.vue
     Searchable multi-select for list-type condition fields (categories, brands,
     product lines, customer groups, etc.). Marks globally-excluded items with a
     "Not allowed" chip so users can see them but understand they are restricted.
     Any extra props/attrs (label, chips, closable-chips, placeholder, class…)
     are forwarded to the underlying v-autocomplete via v-bind="$attrs". -->
<template>
  <v-autocomplete
    v-bind="$attrs"
    :model-value="modelValue"
    :items="items"
    variant="outlined"
    density="compact"
    hide-details
    placeholder="Search or select…"
    multiple
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :disabled="item.raw.disabled">
        <template v-if="item.raw.disabled" #append>
          <v-chip size="x-small" color="error" variant="tonal" label>Not allowed</v-chip>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { TYPE_OPTIONS } from '../../utils/conditionTypes'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  field:       { type: String,  required: true },
  modelValue:  { type: Array,   default: () => [] },
  disabled:    { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const settingsStore = useSettingsStore()

const excluded = computed(() => {
  if (props.field === 'categories')    return settingsStore.excludedCategories
  if (props.field === 'brands')        return settingsStore.excludedBrands
  if (props.field === 'product_lines') return settingsStore.excludedProductLines
  return []
})

const items = computed(() => {
  const excludedSet = new Set(excluded.value)
  return (TYPE_OPTIONS[props.field] ?? []).map(v => ({
    title: v,
    value: v,
    disabled: excludedSet.has(v),
  }))
})
</script>
