<!-- src/components/MaxikHelper.vue -->
<template>
  <Transition name="maxik-slide">
    <div v-if="visible" class="maxik-wrapper" @click.stop>

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
              <v-btn icon="mdi-close" size="x-small" variant="text" density="comfortable" @click="dismiss" />
            </div>
            <p class="text-caption text-medium-emphasis mb-0" style="line-height:1.45">
              Need help setting something up?<br>I'm here for you!
            </p>
          </v-card-text>
          <v-card-actions class="pa-3 pt-1 flex-column align-stretch" style="gap:6px">
            <v-btn color="primary" variant="flat" size="small" rounded="lg" block @click="dismiss">
              Show me around
            </v-btn>
            <v-btn variant="outlined" size="small" rounded="lg" block @click="dismiss">
              I'm good, thanks
            </v-btn>
          </v-card-actions>
        </v-card>
      </Transition>

      <!-- Character: tilt wrapper (parallax) → float wrapper (idle anim) → image -->
      <div class="maxik-character" @click="bubbleVisible = !bubbleVisible">
        <div class="maxik-tilt" :style="tiltStyle">
          <div class="maxik-float" :style="floatStyle">
            <div class="maxik-shadow" />
            <img src="/maxik.png" alt="Maxík" class="maxik-img" draggable="false" />
          </div>
        </div>
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ── Visibility ────────────────────────────────────────────────────────────────
const visible = ref(false)
const bubbleVisible = ref(false)
const waving = ref(false)

// ── Parallax tilt (lerped toward mouse) ───────────────────────────────────────
const tiltX = ref(0)
const tiltY = ref(0)
let targetX = 0
let targetY = 0
let rafId = null

const tiltStyle = computed(() => ({
  transform: `perspective(700px) rotateX(${tiltX.value.toFixed(2)}deg) rotateY(${tiltY.value.toFixed(2)}deg)`,
}))

// Switch animation name when waving so it overrides the idle loop
const floatStyle = computed(() => ({
  animationName: waving.value ? 'maxik-attention' : 'maxik-idle',
  animationDuration: waving.value ? '0.9s' : '4s',
  animationTimingFunction: waving.value ? 'cubic-bezier(.36,.07,.19,.97)' : 'ease-in-out',
  animationIterationCount: waving.value ? '1' : 'infinite',
  animationFillMode: waving.value ? 'both' : 'none',
}))

function lerpFrame() {
  const L = 0.07
  tiltX.value += (targetX - tiltX.value) * L
  tiltY.value += (targetY - tiltY.value) * L
  rafId = requestAnimationFrame(lerpFrame)
}

// ── Inactivity detection ──────────────────────────────────────────────────────
const INACTIVITY_MS = 30_000
const POLL_MS = 2_000
let lastActivity = Date.now()
let pollInterval = null

function onActivity(e) {
  lastActivity = Date.now()
  if (e?.type === 'mousemove' && visible.value) {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    targetY = ((e.clientX - cx) / cx) * 9
    targetX = ((e.clientY - cy) / cy) * -6
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
function show() {
  visible.value = true
  setTimeout(() => { bubbleVisible.value = true }, 600)
  lerpFrame()
  scheduleWave()
}

function dismiss() {
  bubbleVisible.value = false
  clearTimeout(waveTimer)
  setTimeout(() => {
    visible.value = false
    lastActivity = Date.now()
    cancelAnimationFrame(rafId); rafId = null
    targetX = 0; targetY = 0
    tiltX.value = 0; tiltY.value = 0
  }, 350)
}

// ── Random wave ───────────────────────────────────────────────────────────────
let waveTimer = null

function triggerWave() {
  if (waving.value) return
  waving.value = true
  setTimeout(() => { waving.value = false }, 900)
}

function scheduleWave() {
  const delay = 8_000 + Math.random() * 7_000
  waveTimer = setTimeout(() => {
    if (visible.value) { triggerWave(); scheduleWave() }
  }, delay)
}

// ── Mount / unmount ───────────────────────────────────────────────────────────
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

onMounted(() => {
  EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }))
  pollInterval = setInterval(() => {
    if (!visible.value && Date.now() - lastActivity >= INACTIVITY_MS) show()
  }, POLL_MS)
})

onUnmounted(() => {
  clearInterval(pollInterval)
  clearTimeout(waveTimer)
  cancelAnimationFrame(rafId)
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
.maxik-wrapper > * { pointer-events: all; }

.maxik-bubble {
  border: 1px solid rgba(var(--v-theme-primary), 0.15) !important;
}

/* ── Character layers ── */
.maxik-character {
  cursor: pointer;
}

.maxik-tilt {
  transform-style: preserve-3d;
  /* no transition here — lerp handles smoothing */
}

.maxik-float {
  position: relative;
  transform-origin: center bottom;
  /* animation injected via :style binding */
}

.maxik-img {
  width: 130px;
  height: auto;
  display: block;
  margin-right: -10px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 12px 28px rgba(0,0,0,.28));
}

/* Ground shadow that squishes when he floats up */
.maxik-shadow {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-60%);
  width: 70px;
  height: 18px;
  background: radial-gradient(ellipse, rgba(76,184,68,.55) 0%, transparent 70%);
  animation: maxik-shadow-pulse 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* ── Keyframes ── */

/* Idle: float up+down with gentle sway and a hint of breathing */
@keyframes maxik-idle {
  0%   { transform: translateY(0px)   rotate(-1deg)   scaleY(1); }
  20%  { transform: translateY(-6px)  rotate(0.2deg)  scaleY(1.01); }
  45%  { transform: translateY(-13px) rotate(1.2deg)  scaleY(1); }
  65%  { transform: translateY(-9px)  rotate(0.6deg)  scaleY(1.01); }
  80%  { transform: translateY(-3px)  rotate(-0.5deg) scaleY(1); }
  100% { transform: translateY(0px)   rotate(-1deg)   scaleY(1); }
}

/* Shadow shrinks as he floats up */
@keyframes maxik-shadow-pulse {
  0%,100% { transform: translateX(-60%) scaleX(1);    opacity: 0.9; }
  45%     { transform: translateX(-60%) scaleX(0.55); opacity: 0.4; }
}

/* Attention/wave: joyful bounce with rotation */
@keyframes maxik-attention {
  0%   { transform: scale(1)    rotate(0deg); }
  12%  { transform: scale(1.2)  rotate(-7deg); }
  28%  { transform: scale(0.9)  rotate(5deg); }
  48%  { transform: scale(1.12) rotate(-3deg); }
  65%  { transform: scale(0.96) rotate(2deg); }
  82%  { transform: scale(1.05) rotate(-1deg); }
  100% { transform: scale(1)    rotate(0deg); }
}

/* ── Slide-in from right ── */
.maxik-slide-enter-active { transition: transform .6s cubic-bezier(.22,1,.36,1), opacity .4s ease; }
.maxik-slide-leave-active { transition: transform .38s cubic-bezier(.55,0,1,.45), opacity .3s ease; }
.maxik-slide-enter-from   { transform: translateX(170px); opacity: 0; }
.maxik-slide-leave-to     { transform: translateX(170px); opacity: 0; }

/* ── Bubble pop ── */
.bubble-pop-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.bubble-pop-leave-active { transition: transform .2s ease, opacity .2s ease; }
.bubble-pop-enter-from   { transform: scale(.85) translateY(6px); opacity: 0; }
.bubble-pop-leave-to     { transform: scale(.85) translateY(6px); opacity: 0; }
</style>
