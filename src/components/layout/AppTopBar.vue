<!-- src/components/layout/AppTopBar.vue -->
<template>
  <v-app-bar color="white" border="b" elevation="0" height="52">
    <v-app-bar-nav-icon v-if="mobile" @click="$emit('toggle-nav')" />
    <div class="d-flex align-center pl-4 gap-3">
      <div class="dr-max-logo text-caption font-weight-bold rounded px-2 py-1">Dr.Max</div>
      <span class="text-body-2 font-weight-semibold">Eshop Admin</span>
      <v-chip v-if="italyMode" size="x-small" color="success" variant="tonal" label class="font-weight-bold">ITA</v-chip>
      <v-chip v-if="serbiaMode" size="x-small" color="info" variant="tonal" label class="font-weight-bold">SRB</v-chip>
    </div>
    <v-spacer />
    <v-btn
      v-if="!mobile && !italyMode && !serbiaMode"
      variant="text"
      size="small"
      class="text-caption text-medium-emphasis mr-2 text-none"
      prepend-icon="mdi-robot-happy-outline"
      @click="toggle"
    >Ask Maxík</v-btn>
    <v-btn
      v-if="!mobile && !italyMode && !serbiaMode"
      variant="outlined"
      size="small"
      class="text-caption mr-2 text-none"
      prepend-icon="mdi-flag-outline"
      color="success"
      to="/italy"
    >Test ITA</v-btn>
    <v-btn
      v-if="!mobile && !italyMode && !serbiaMode"
      variant="outlined"
      size="small"
      class="text-caption mr-2 text-none"
      prepend-icon="mdi-flag-outline"
      color="info"
      to="/serbia"
    >Test SRB</v-btn>
    <v-menu location="bottom end">
      <template #activator="{ props: menuProps }">
        <v-btn v-bind="menuProps" icon="mdi-account-circle" variant="text" class="mr-2" />
      </template>
      <v-list density="compact" min-width="240">
        <v-list-item
          v-if="italyMode || serbiaMode"
          prepend-icon="mdi-arrow-left"
          title="Main prototype"
          to="/promotions"
        />
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
import { useMaxik } from '../../composables/useMaxik'
defineProps({
  italyMode: { type: Boolean, default: false },
  serbiaMode: { type: Boolean, default: false },
})
defineEmits(['toggle-nav'])
const { mobile } = useDisplay()
const { toggle, isOpen } = useMaxik()

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
