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
import { ref } from 'vue'
import AppTopBar from './AppTopBar.vue'
import AppSidebar from './AppSidebar.vue'
import MaxikHelper from '../MaxikHelper.vue'

const drawerOpen = ref(true)
</script>
