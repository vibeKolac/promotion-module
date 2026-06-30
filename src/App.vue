<!-- src/App.vue -->
<template>
  <PasswordGate>
    <v-app>
      <router-view />
    </v-app>
  </PasswordGate>
</template>

<script setup>
import PasswordGate from './components/PasswordGate.vue'
</script>
