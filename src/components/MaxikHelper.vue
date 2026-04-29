<!-- src/components/MaxikHelper.vue -->
<template>
  <Transition name="maxik-slide">
    <div v-if="visible" class="maxik-wrapper" @click.stop>

      <!-- Speech bubble -->
      <Transition name="bubble-pop">
        <v-card
          v-if="bubbleVisible"
          elevation="4"
          rounded="xl"
          width="252"
          class="maxik-bubble pa-1 mr-4"
        >
          <v-card-text class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-body-2 font-weight-bold">Hi, I'm Maxík! 👋</span>
              <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                density="comfortable"
                @click="dismiss"
              />
            </div>
            <p class="text-caption text-medium-emphasis mb-0" style="line-height:1.45">
              Need help setting something up?<br>I'm here for you!
            </p>
          </v-card-text>

          <v-card-actions class="pa-3 pt-1 flex-column align-stretch" style="gap:6px">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              rounded="lg"
              block
              @click="dismiss"
            >
              Show me around
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              rounded="lg"
              block
              @click="dismiss"
            >
              I'm good, thanks
            </v-btn>
          </v-card-actions>
        </v-card>
      </Transition>

      <!-- Maxík character -->
      <div class="maxik-character" @click="bubbleVisible = !bubbleVisible">
        <img src="/maxik.png" alt="Maxík" class="maxik-img" draggable="false" />
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const bubbleVisible = ref(false)

const INACTIVITY_MS = 30_000
const POLL_MS = 2_000

let lastActivity = Date.now()
let pollInterval = null

function onActivity() {
  lastActivity = Date.now()
}

function show() {
  visible.value = true
  setTimeout(() => { bubbleVisible.value = true }, 600)
}

function dismiss() {
  bubbleVisible.value = false
  setTimeout(() => {
    visible.value = false
    lastActivity = Date.now() // reset clock after dismissal
  }, 350)
}

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

onMounted(() => {
  EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }))
  pollInterval = setInterval(() => {
    if (!visible.value && Date.now() - lastActivity >= INACTIVITY_MS) {
      show()
    }
  }, POLL_MS)
})

onUnmounted(() => {
  clearInterval(pollInterval)
  EVENTS.forEach(e => window.removeEventListener(e, onActivity))
})
</script>

<style scoped>
.maxik-wrapper {
  position: fixed;
  bottom: 24px;
  right: 0;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  pointer-events: none;
}

.maxik-wrapper > * {
  pointer-events: all;
}

.maxik-bubble {
  border: 1px solid rgba(var(--v-theme-primary), 0.15) !important;
}

.maxik-character {
  cursor: pointer;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,.22));
  animation: maxik-float 3s ease-in-out infinite;
}

.maxik-img {
  width: 130px;
  height: auto;
  display: block;
  margin-right: -10px;
}

@keyframes maxik-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}

/* Slide-in from right */
.maxik-slide-enter-active { transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .4s ease; }
.maxik-slide-leave-active { transition: transform .35s cubic-bezier(.55,0,1,.45), opacity .3s ease; }
.maxik-slide-enter-from  { transform: translateX(160px); opacity: 0; }
.maxik-slide-leave-to    { transform: translateX(160px); opacity: 0; }

/* Bubble pop */
.bubble-pop-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.bubble-pop-leave-active { transition: transform .2s ease, opacity .2s ease; }
.bubble-pop-enter-from   { transform: scale(.85) translateY(6px); opacity: 0; }
.bubble-pop-leave-to     { transform: scale(.85) translateY(6px); opacity: 0; }
</style>
