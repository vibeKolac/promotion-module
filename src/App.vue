<!-- src/App.vue -->
<template>
  <PasswordGate>
    <v-app>
      <AppTopBar @toggle-nav="drawerOpen = !drawerOpen" />
      <AppSidebar v-model="drawerOpen" />
      <AiAssistantPanel />
      <v-main>
        <router-view />
      </v-main>
    </v-app>
  </PasswordGate>
</template>

<script setup>
import { ref } from 'vue'
import AppTopBar from './components/layout/AppTopBar.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AiAssistantPanel from './components/ai/AiAssistantPanel.vue'
import PasswordGate from './components/PasswordGate.vue'

const drawerOpen = ref(true)
</script>
