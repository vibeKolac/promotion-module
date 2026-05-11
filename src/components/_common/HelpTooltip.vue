<template>
  <v-tooltip :text="text" location="bottom" max-width="300">
    <template #activator="{ props: tp }">
      <v-icon v-bind="{ ...$attrs, ...tp }" :icon="icon" size="18" color="grey-darken-1" class="help-tooltip-icon" />
    </template>
  </v-tooltip>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  text: { type: String, required: true },
  icon: { type: String, default: 'mdi-help-box' },
})
</script>

<style scoped>
.help-tooltip-icon {
  cursor: help;
  vertical-align: middle;
}
</style>
