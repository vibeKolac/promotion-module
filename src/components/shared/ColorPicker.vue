<!-- src/components/shared/ColorPicker.vue -->
<template>
  <div class="d-flex flex-wrap gap-2">
    <div
      v-for="color in presetColors"
      :key="color"
      class="color-swatch"
      :style="{ backgroundColor: color }"
      :class="{ 'color-swatch--selected': modelValue === color }"
      @click="$emit('update:modelValue', color)"
    >
      <v-icon v-if="modelValue === color" size="14" color="white">mdi-check</v-icon>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '#3B82F6',
  },
})

defineEmits(['update:modelValue'])

const presetColors = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
]
</script>

<style scoped>
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.color-swatch:hover {
  border-color: rgba(0, 0, 0, 0.3);
}

.color-swatch--selected {
  border-color: rgba(0, 0, 0, 0.5);
}
</style>
