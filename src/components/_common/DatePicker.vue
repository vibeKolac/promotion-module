<template>
  <v-date-input
    :model-value="modelValue"
    variant="outlined"
    density="compact"
    prepend-inner-icon="mdi-calendar"
    prepend-icon=""
    clearable
    v-bind="$attrs"
    @update:model-value="onUpdate"
  />
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])

function onUpdate(val) {
  if (!val) { emit('update:modelValue', null); return }
  const d = new Date(val)
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  emit('update:modelValue', iso)
}
</script>
