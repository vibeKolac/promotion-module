<!-- src/components/promotions/LiveDescriptionAlert.vue -->
<template>
  <v-alert
    border="start"
    color="grey"
    variant="tonal"
    density="compact"
    icon="mdi-text-box-check-outline"
    class="text-caption"
  >
    <span v-if="text">{{ text }}</span>
    <span v-else-if="placeholder" class="text-medium-emphasis">{{ placeholder }}</span>
  </v-alert>
</template>

<script setup>
defineProps({
  text: { type: String, default: null },
  placeholder: { type: String, default: null },
})
</script>
