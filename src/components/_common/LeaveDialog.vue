<template>
  <DialogCard v-model="model" max-width="560">
    <template #title>Leave this section?</template>
    <p class="text-body-2 text-medium-emphasis mb-2">
      You're about to navigate away. Any unsaved changes will be lost.
    </p>
    <template #actions>
      <v-btn variant="text" @click="emit('cancel')">Stay</v-btn>
      <v-btn variant="text" @click="emit('leave')">Leave without saving</v-btn>
    </template>
  </DialogCard>
</template>

<script setup>
import DialogCard from './DialogCard.vue'

const model = defineModel()

const emit = defineEmits(['cancel', 'leave'])
</script>
