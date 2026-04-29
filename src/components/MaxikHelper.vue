<!-- src/components/MaxikHelper.vue -->
<template>
  <Transition name="maxik-slide">
    <div v-if="visible" class="maxik-wrapper" @click.stop>
      <!-- Speech bubble -->
      <Transition name="bubble-pop">
        <div v-if="bubbleVisible" class="maxik-bubble">
          <button class="maxik-dismiss" @click="dismiss" aria-label="Dismiss">×</button>
          <div class="maxik-bubble-title">Hi, I'm Maxík! 👋</div>
          <div class="maxik-bubble-text">Need help setting something up? I'm here for you!</div>
          <div class="maxik-bubble-actions">
            <button class="maxik-btn-help" @click="dismiss">Show me around</button>
            <button class="maxik-btn-skip" @click="dismiss">I'm good, thanks</button>
          </div>
        </div>
      </Transition>

      <!-- Maxík image -->
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

let inactivityTimer = null
const INACTIVITY_MS = 30_000

function resetTimer() {
  clearTimeout(inactivityTimer)
  if (visible.value) return
  inactivityTimer = setTimeout(show, INACTIVITY_MS)
}

function show() {
  visible.value = true
  setTimeout(() => { bubbleVisible.value = true }, 600)
}

function dismiss() {
  bubbleVisible.value = false
  setTimeout(() => {
    visible.value = false
    resetTimer()
  }, 350)
}

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

onMounted(() => {
  EVENTS.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
  resetTimer()
})

onUnmounted(() => {
  clearTimeout(inactivityTimer)
  EVENTS.forEach(e => window.removeEventListener(e, resetTimer))
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

/* Character */
.maxik-character {
  cursor: pointer;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,.22));
  animation: maxik-float 3s ease-in-out infinite;
}

.maxik-img {
  width: 130px;
  height: auto;
  display: block;
  /* clip so he peeks from the right edge */
  margin-right: -10px;
}

@keyframes maxik-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}

/* Speech bubble */
.maxik-bubble {
  position: relative;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  padding: 14px 16px 12px;
  width: 230px;
  margin-right: 18px;
  border: 1.5px solid #e8f5e9;
}

.maxik-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 36px;
  border: 10px solid transparent;
  border-top-color: #fff;
  border-bottom: 0;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,.08));
}

.maxik-dismiss {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  color: #aaa;
  padding: 0 2px;
}
.maxik-dismiss:hover { color: #555; }

.maxik-bubble-title {
  font-size: .82rem;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 5px;
  padding-right: 18px;
}

.maxik-bubble-text {
  font-size: .74rem;
  color: #555;
  line-height: 1.45;
  margin-bottom: 10px;
}

.maxik-bubble-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.maxik-btn-help {
  background: #4CB844;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: .74rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.maxik-btn-help:hover { background: #3da036; }

.maxik-btn-skip {
  background: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: .72rem;
  color: #888;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.maxik-btn-skip:hover { border-color: #aaa; color: #555; }

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
