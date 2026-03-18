<!-- src/components/promotions/ConflictWarningBanner.vue -->
<template>
  <v-alert
    v-if="conflicts.length"
    type="warning"
    variant="tonal"
    density="compact"
    class="mt-3"
    icon="mdi-alert"
  >
    <div v-for="c in conflicts" :key="c.giftSku">{{ c.message }}</div>
  </v-alert>
</template>

<script setup>
defineProps({ conflicts: { type: Array, default: () => [] } })
</script>
