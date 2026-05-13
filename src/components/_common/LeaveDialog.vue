<template>
  <DialogCard v-model="model" max-width="560">
    <template #title>Leave this section?</template>
    <p class="text-body-2 text-medium-emphasis mb-2">
      You're about to navigate away. Any unsaved changes will be lost.
    </p>
    <p v-if="showSave" class="text-body-2 text-medium-emphasis">
      Save before leaving to keep your work.
    </p>
    <template #actions>
      <v-btn variant="text" @click="emit('cancel')">Stay</v-btn>
      <v-btn variant="text" @click="emit('leave')">Leave without saving</v-btn>
      <v-btn v-if="showSave" color="success" :loading="saving" @click="emit('save-and-leave')">
        Save and leave
      </v-btn>
    </template>
  </DialogCard>
</template>

<script setup>
import DialogCard from './DialogCard.vue'

const model = defineModel()

defineProps({
  saving: { type: Boolean, default: false },
  showSave: { type: Boolean, default: true },
})

const emit = defineEmits(['cancel', 'leave', 'save-and-leave'])
</script>
