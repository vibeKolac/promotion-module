<!-- src/components/layout/ItalyLayout.vue -->
<template>
  <AppTopBar italy-mode @toggle-nav="drawerOpen = !drawerOpen" />
  <AppSidebar v-model="drawerOpen" italy-mode />
  <MaxikHelper />
  <v-main>
    <router-view />
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppTopBar from './AppTopBar.vue'
import AppSidebar from './AppSidebar.vue'
import MaxikHelper from '../MaxikHelper.vue'
import { useSettingsStore } from '../../stores/settings'

const drawerOpen = ref(true)
const settings = useSettingsStore()

onMounted(() => {
  if (!settings.excludedSkus.includes('100200309')) {
    settings.save({ excludedSkus: [...settings.excludedSkus, '100200309'] })
  }
})
</script>
