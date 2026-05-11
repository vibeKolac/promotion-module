<template>
  <v-overlay
    :model-value="isLoading"
    contained
    class="align-center justify-center"
    :scrim="scrim"
    :opacity="opacity"
  >
    <v-progress-circular indeterminate :color="color" />
  </v-overlay>
</template>

<script setup>
defineProps({
  isLoading: { type: Boolean, default: false },
  color: { type: String, default: 'primary' },
  scrim: { type: String, default: 'white' },
  opacity: { type: [String, Number], default: 0.7 },
})
</script>
