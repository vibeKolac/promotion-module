<template>
  <div class="d-flex flex-column flex-sm-row align-start align-sm-center mb-5 gap-3 content-header">
    <div class="d-flex align-center gap-2 flex-wrap">
      <slot />
    </div>
    <v-spacer class="d-none d-sm-flex" />
    <div v-if="$slots.right" class="action-btn-row flex-shrink-0">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.content-header {
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>
