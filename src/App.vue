<!-- src/App.vue -->
<template>
  <v-app>
    <AppTopBar />
    <AppSidebar />
    <!-- AiAssistantPanel added in Task 10 -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import AppTopBar from './components/layout/AppTopBar.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
</script>
