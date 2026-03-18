<!-- src/components/shared/ConfirmDeleteDialog.vue -->
<template>
  <v-dialog :model-value="modelValue" max-width="400" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6">Delete promotion rule?</v-card-title>
      <v-card-text>
        This action cannot be undone. The rule <strong>{{ itemName }}</strong> will be permanently deleted.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="error" variant="flat" :loading="loading" @click="$emit('confirm')">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  itemName: String,
  loading: Boolean,
})
defineEmits(['update:modelValue', 'confirm'])
</script>
