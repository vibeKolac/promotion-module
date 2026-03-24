<!-- src/components/promotions/StackingGroupSelect.vue -->
<template>
  <div>
    <v-select
      :model-value="modelValue"
      :items="groupItems"
      :loading="store.loading"
      label="Assign to stacking group"
      variant="outlined"
      density="compact"
      hint="Rules in the same group stack together."
      persistent-hint
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStackingGroupsStore } from '../../stores/stackingGroups'

defineProps({ modelValue: { type: String, default: null } })
defineEmits(['update:modelValue'])

const store = useStackingGroupsStore()
const groupItems = computed(() =>
  store.items.map(g => ({ value: g.id, title: g.name }))
)

onMounted(() => store.fetchAll())
</script>
