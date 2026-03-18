<!-- src/components/shared/FilterTabs.vue -->
<template>
  <div class="d-flex gap-2 flex-wrap">
    <v-chip
      v-for="tab in tabs"
      :key="tab.value"
      :variant="modelValue === tab.value ? 'flat' : 'outlined'"
      :color="modelValue === tab.value ? 'primary' : undefined"
      size="small"
      class="cursor-pointer"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
      <v-badge
        v-if="tab.count !== undefined"
        :content="tab.count"
        inline
        color="success"
        class="ml-1"
      />
    </v-chip>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>
