<!-- src/components/shared/StatusBadge.vue -->
<template>
  <v-chip
    :color="status === 'active' ? 'success' : undefined"
    :variant="status === 'active' ? 'tonal' : 'outlined'"
    size="small"
    label
  >
    {{ status === 'active' ? 'Active' : 'Inactive' }}
  </v-chip>
</template>

<script setup>
defineProps({ status: { type: String, required: true } })
</script>
