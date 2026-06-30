<!-- src/components/layout/DefaultLayout.vue -->
<template>
  <AppTopBar @toggle-nav="drawerOpen = !drawerOpen" />
  <AppSidebar v-model="drawerOpen" />
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
