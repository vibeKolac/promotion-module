<template>
  <div class="d-flex justify-center align-center pa-8">
    <v-progress-circular indeterminate :color="color" :size="size" />
  </div>
</template>

<script setup>
defineProps({
  color: { type: String, default: 'primary' },
  size: { type: [String, Number], default: 'default' },
})
</script>
