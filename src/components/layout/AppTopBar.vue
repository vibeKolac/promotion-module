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
    <v-menu location="bottom end">
      <template #activator="{ props: menuProps }">
        <v-btn v-bind="menuProps" icon="mdi-account-circle" variant="text" class="mr-2" />
      </template>
      <v-list density="compact" min-width="240">
        <v-list-item
          prepend-icon="mdi-presentation"
          title="Promotions analysis"
          subtitle="Prototype presentation"
          @click="openAnalysis"
        />
        <v-list-item
          prepend-icon="mdi-book-open-outline"
          title="Analysis output"
          subtitle="Cross-country Confluence page"
          href="https://mydrmax.atlassian.net/wiki/spaces/GLECOM/pages/5520097300/Promotions+analysis+output+cross+country"
          target="_blank"
          rel="noopener"
        />
      </v-list>
    </v-menu>
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
