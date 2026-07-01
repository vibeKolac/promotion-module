<template>
  <v-menu v-model="open" :close-on-content-click="false" min-width="auto">
    <template #activator="{ props: menuProps }">
      <v-text-field
        :model-value="displayValue"
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-calendar"
        readonly
        clearable
        v-bind="{ ...$attrs, ...menuProps }"
        @click:clear="onClear"
      />
    </template>
    <v-date-picker
      :model-value="internalValue"
      :min="minDate"
      :allowed-dates="allowedDates ?? undefined"
      @update:model-value="onPick"
    />
  </v-menu>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: String, default: null },
  min: { type: String, default: null },
  allowedDates: { type: [Function, Array], default: null },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)

const internalValue = computed(() => {
  if (!props.modelValue) return null
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, d)
})

const minDate = computed(() => {
  if (!props.min) return undefined
  const [y, m, d] = props.min.split('-').map(Number)
  return new Date(y, m - 1, d)
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const [y, m, d] = props.modelValue.split('-')
  return `${d}.${m}.${y}`
})

function onPick(val) {
  if (!val) return
  const d = val instanceof Date ? val : new Date(val)
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  emit('update:modelValue', iso)
  open.value = false
}

function onClear() {
  emit('update:modelValue', null)
  open.value = false
}
</script>
