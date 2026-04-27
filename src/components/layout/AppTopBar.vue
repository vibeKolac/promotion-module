<!-- src/components/layout/AppTopBar.vue -->
<template>
  <v-app-bar color="white" border="b" elevation="0" height="52">
    <v-app-bar-nav-icon v-if="mobile" @click="$emit('toggle-nav')" />
    <div class="d-flex align-center pl-4 gap-3">
      <div class="dr-max-logo text-caption font-weight-bold rounded px-2 py-1">Dr.Max</div>
      <span class="text-body-2 font-weight-semibold">Eshop Admin</span>
    </div>
    <v-spacer />
    <span v-if="!mobile" class="text-caption text-medium-emphasis mr-4">client v0.1.0</span>
    <v-btn icon="mdi-account-circle" variant="text" class="mr-2" @click="openAnalysis" />
  </v-app-bar>
</template>

<script setup>
import { useDisplay } from 'vuetify'
defineEmits(['toggle-nav'])
const { mobile } = useDisplay()

function openAnalysis() {
  window.open('/promotions-analysis.html', '_blank', 'width=1280,height=800,noopener')
}
</script>

<style scoped>
.dr-max-logo {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 11px;
}
</style>
