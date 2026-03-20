<template>
  <slot v-if="unlocked" />

  <v-app v-else>
    <v-main style="background: #f8fafc;">
      <div class="d-flex align-center justify-center" style="min-height: 100vh;">
        <v-card border elevation="0" width="360" class="pa-8">
          <div class="text-center mb-6">
            <v-icon size="40" color="primary" class="mb-3">mdi-shield-lock-outline</v-icon>
            <div class="text-h6 font-weight-bold">Promotions wireframe</div>
            <div class="text-caption text-medium-emphasis mt-1">Enter password to continue</div>
          </div>

          <v-text-field
            v-model="input"
            label="Password"
            variant="outlined"
            density="compact"
            :type="show ? 'text' : 'password'"
            :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
            :error-messages="error"
            autofocus
            @click:append-inner="show = !show"
            @keyup.enter="submit"
          />

          <v-btn
            color="primary"
            block
            class="mt-2 text-uppercase"
            :loading="checking"
            @click="submit"
          >
            Enter
          </v-btn>
        </v-card>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const PASSWORD = import.meta.env.VITE_APP_PASSWORD

// If no password configured, always unlocked (local dev)
const SESSION_KEY = 'proto_unlocked'
const unlocked = ref(!PASSWORD || sessionStorage.getItem(SESSION_KEY) === '1')

const input = ref('')
const show = ref(false)
const error = ref('')
const checking = ref(false)

function submit() {
  if (!input.value) { error.value = 'Required'; return }
  checking.value = true
  setTimeout(() => {
    if (input.value === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      unlocked.value = true
    } else {
      error.value = 'Incorrect password'
      input.value = ''
    }
    checking.value = false
  }, 300)
}
</script>
