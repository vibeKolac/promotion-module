<!-- src/components/MaxikHelper.vue -->
<template>
  <!-- FAB trigger — hidden once user dismisses Maxík -->
  <Transition name="maxik-fab-pop">
    <button v-if="!visible && !dismissed" class="maxik-fab" aria-label="Open Maxík" @click="open">
      <img src="/maxik.png" class="maxik-fab-img" draggable="false" />
    </button>
  </Transition>

  <!-- Main overlay — slides in from right on open -->
  <Transition name="maxik-slide">
    <div v-if="visible" class="maxik-wrapper" @click.stop>

      <!-- Chat panel -->
      <Transition name="bubble-pop">
        <v-card
          v-if="chatOpen"
          elevation="4"
          rounded="lg"
          width="320"
          class="maxik-chat mr-4"
        >
          <div class="d-flex align-center justify-space-between pa-4 pb-3">
            <span class="text-body-2 font-weight-bold">Maxík</span>
            <v-btn icon="mdi-close" size="x-small" variant="text" density="comfortable" @click="dismiss" />
          </div>
          <v-divider />

          <!-- Messages area -->
          <div class="maxik-messages" ref="messagesEl">
            <!-- Empty state -->
            <template v-if="!messages.length">
              <p class="text-caption text-medium-emphasis mb-3">
                Hi! I can help with promotion rules. Ask me anything or pick a topic:
              </p>
              <div class="d-flex flex-column" style="gap: 8px">
                <v-btn
                  v-for="topic in TOPICS"
                  :key="topic.id"
                  variant="tonal"
                  color="primary"
                  size="small"
                  class="justify-start text-none"
                  @click="askTopic(topic.id, topic.label)"
                >{{ topic.label }}</v-btn>
              </div>
            </template>

            <!-- Conversation -->
            <template v-else>
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="maxik-msg-row"
                :class="msg.role"
              >
                <div class="maxik-bubble">{{ msg.text }}</div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isTyping" class="maxik-msg-row assistant">
                <div class="maxik-bubble maxik-typing-bubble">
                  <span class="maxik-dot" />
                  <span class="maxik-dot" />
                  <span class="maxik-dot" />
                </div>
              </div>

              <!-- Follow-up suggestions -->
              <div v-if="followUps.length && !isTyping" class="maxik-followups">
                <button
                  v-for="fu in followUps"
                  :key="fu.id"
                  class="maxik-followup-chip"
                  @click="sendFollowUp(fu)"
                >{{ fu.label }}</button>
              </div>

              <!-- FAQ shortcuts -->
              <div v-if="!isTyping" class="maxik-faq-shortcuts">
                <p class="text-caption text-medium-emphasis mb-1">Or ask about:</p>
                <div class="d-flex flex-wrap" style="gap: 8px">
                  <v-btn
                    v-for="topic in TOPICS"
                    :key="topic.id"
                    variant="outlined"
                    size="x-small"
                    class="text-none"
                    @click="askTopic(topic.id, topic.label)"
                  >{{ topic.label }}</v-btn>
                </div>
              </div>
            </template>
          </div>

          <!-- Input -->
          <v-divider />
          <div class="pa-3">
            <v-text-field
              v-model="userInput"
              placeholder="Ask Maxík..."
              variant="outlined"
              density="compact"
              hide-details
              :disabled="isTyping"
              @keydown.enter.prevent="sendMessage"
            >
              <template #append-inner>
                <v-icon
                  size="18"
                  :color="userInput.trim() && !isTyping ? 'primary' : ''"
                  style="cursor: pointer"
                  @click="sendMessage"
                >mdi-send</v-icon>
              </template>
            </v-text-field>
          </div>
        </v-card>
      </Transition>

      <!-- Character row: dismiss button + character -->
      <div class="maxik-bottom-row">
        <button class="maxik-dismiss" aria-label="Close Maxík" @click.stop="dismiss">×</button>
        <div class="maxik-character" @click="chatOpen = !chatOpen">
          <div class="maxik-tilt" :style="tiltStyle">
            <div class="maxik-float" :style="floatStyle">
              <div class="maxik-shadow" />
              <img src="/maxik.png" alt="Maxík" class="maxik-img" draggable="false" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMaxik } from '../composables/useMaxik'

// ── Visibility ────────────────────────────────────────────────────────────────
const { openTrigger, closeTrigger, isOpen } = useMaxik()
const visible = ref(false)
const dismissed = ref(false)

watch(openTrigger, () => { if (!visible.value) open() })
watch(closeTrigger, () => { if (visible.value) dismiss() })

const chatOpen = ref(false)
const waving = ref(false)

function open() {
  visible.value = true
  isOpen.value = true
  setTimeout(() => { chatOpen.value = true }, 400)
  lerpFrame()
  scheduleWave()
}

function close() {
  chatOpen.value = false
  clearTimeout(waveTimer)
  setTimeout(() => {
    visible.value = false
    isOpen.value = false
    cancelAnimationFrame(rafId); rafId = null
    targetX = 0; targetY = 0
    tiltX.value = 0; tiltY.value = 0
  }, 350)
}

function dismiss() {
  dismissed.value = true
  close()
}

// ── Chat ──────────────────────────────────────────────────────────────────────
const messages = ref([])
const userInput = ref('')
const isTyping = ref(false)
const followUps = ref([])
const messagesEl = ref(null)

const TOPICS = [
  { id: 'step_discount', label: 'How does step discount work?' },
  { id: 'discount',      label: 'Standard discount' },
  { id: 'multi_buy',     label: 'Multi-buy deals' },
  { id: 'gift',          label: 'Free gift rules' },
  { id: 'priority',      label: 'Priority & groups' },
]

const RESPONSES = {
  step_discount:
`Step discount rewards customers with bigger savings as their order value grows.

You define spending thresholds — each with its own discount percentage. When a cart qualifies for multiple tiers, only the highest tier applies.

Configure the thresholds in the Step Conditions section of the rule editor.`,

  discount:
`A standard discount applies a percentage or fixed-amount reduction to matching items or the whole order.

Use conditions to target specific products, categories, or customer groups. Add a usage limit to cap how many times the rule fires per customer or in total.

Tip: combine with an Action Label so the discount is visible in the cart UI.`,

  multi_buy:
`Multi-buy runs "buy X, get Y" deals — for example, buy 3 items and only pay for 2.

You define the qualifying quantity (X) and how many items are discounted (Y). The cheapest qualifying items get the discount automatically.

Use a Gift rule instead if you want to add a free product to the cart rather than discount existing items.`,

  gift:
`A gift rule automatically adds a free product to the cart when the conditions are met.

Configure the gift SKU, quantity, and the trigger condition (e.g. minimum order value, specific product in cart).

By default only one gift rule fires per order — control this through the stacking group settings.`,

  priority:
`Priority controls which rules fire first when multiple rules match a cart. Lower number = higher priority (rule 1 fires before rule 5).

Stacking groups let you decide whether rules combine or compete. Within a group you can set "only best applies" — so the customer always gets the most beneficial rule, not a random combination.

Assign a group and priority to each rule in the Priority & Grouping section.`,

  step_discount_example:
`Here's a typical step discount configuration:

• Tier 1: spend €50+ → 5% off
• Tier 2: spend €100+ → 10% off
• Tier 3: spend €150+ → 15% off

In the rule editor, go to Step Conditions and add each tier. Each needs a minimum cart value and a discount percentage. The customer always gets the highest tier they qualify for — tiers don't stack.`,

  step_discount_stacking:
`Step discount rules compete within their stacking group.

If you assign multiple step discount rules to the same group with "only best applies", the customer gets the highest discount from whichever rule wins — not a combination of both.

If you want a step discount to stack on top of other promotion types, assign it to a separate stacking group with no restriction.`,

  fallback:
`I'm not sure I have that specific detail, but I can help with step discounts, standard discounts, multi-buy deals, free gifts, or priority and stacking groups. Which of these would be helpful?`,
}

const FOLLOW_UPS = {
  step_discount: [
    { id: 'step_discount_example',  label: 'Show me a config example' },
    { id: 'step_discount_stacking', label: 'How does it stack with other rules?' },
  ],
}

function scrollToBottom() {
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function addMessage(role, text) {
  messages.value.push({ id: Date.now() + Math.random(), role, text })
  nextTick(scrollToBottom)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function simulateResponse(topicId) {
  isTyping.value = true
  followUps.value = []
  await nextTick(scrollToBottom)

  if (topicId === 'step_discount') {
    // Simulate reading documentation
    await sleep(700)
    isTyping.value = false
    addMessage('assistant', 'Let me check the documentation for step discounts... 📄')
    await sleep(300)
    isTyping.value = true
    await nextTick(scrollToBottom)
    await sleep(1500)
  } else {
    await sleep(900)
  }

  isTyping.value = false
  addMessage('assistant', RESPONSES[topicId] || RESPONSES.fallback)

  if (FOLLOW_UPS[topicId]) {
    followUps.value = FOLLOW_UPS[topicId]
    nextTick(scrollToBottom)
  }
}

function askTopic(id, label) {
  addMessage('user', label)
  simulateResponse(id)
}

function sendFollowUp(fu) {
  followUps.value = []
  addMessage('user', fu.label)
  simulateResponse(fu.id)
}

function matchTopic(text) {
  const t = text.toLowerCase()
  if (t.includes('step') || t.includes('threshold') || t.includes('tier')) return 'step_discount'
  if (t.includes('gift') || t.includes('free product') || t.includes('free item')) return 'gift'
  if (t.includes('multi') || t.includes('buy x') || t.includes('buy 2') || t.includes('buy 3')) return 'multi_buy'
  if (t.includes('priority') || t.includes('group') || t.includes('stack')) return 'priority'
  if (t.includes('discount') || t.includes('percent') || t.includes('fixed')) return 'discount'
  return 'fallback'
}

function sendMessage() {
  const text = userInput.value.trim()
  if (!text || isTyping.value) return
  userInput.value = ''
  followUps.value = []
  addMessage('user', text)
  simulateResponse(matchTopic(text))
}

// ── Parallax tilt ─────────────────────────────────────────────────────────────
const tiltX = ref(0)
const tiltY = ref(0)
let targetX = 0
let targetY = 0
let rafId = null

const tiltStyle = computed(() => ({
  transform: `perspective(700px) rotateX(${tiltX.value.toFixed(2)}deg) rotateY(${tiltY.value.toFixed(2)}deg)`,
}))

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

function onMouseMove(e) {
  if (!visible.value) return
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  targetY = ((e.clientX - cx) / cx) * 9
  targetX = ((e.clientY - cy) / cy) * -6
}

// ── Wave animation ────────────────────────────────────────────────────────────
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

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onUnmounted(() => {
  clearTimeout(waveTimer)
  cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
/* ── FAB trigger ── */
.maxik-fab {
  position: fixed;
  bottom: 20px;
  right: 12px;
  z-index: 9000;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-primary));
  background: white;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,.18);
  transition: transform .18s ease, box-shadow .18s ease;
}
.maxik-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0,0,0,.24);
}
.maxik-fab-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Overlay wrapper ── */
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

/* ── Chat panel ── */
.maxik-chat {
  border: 1px solid rgba(var(--v-theme-primary), 0.15) !important;
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.maxik-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
}

/* ── Message bubbles ── */
.maxik-msg-row {
  display: flex;
}
.maxik-msg-row.user      { justify-content: flex-end; }
.maxik-msg-row.assistant { justify-content: flex-start; }

.maxik-bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.maxik-msg-row.user .maxik-bubble {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-bottom-right-radius: 4px;
}
.maxik-msg-row.assistant .maxik-bubble {
  background: #f5f5f5;
  color: #333;
  border-bottom-left-radius: 4px;
}

/* ── Typing indicator ── */
.maxik-typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px !important;
}
.maxik-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  display: inline-block;
  animation: maxik-blink 1.4s ease-in-out infinite;
}
.maxik-dot:nth-child(2) { animation-delay: 0.2s; }
.maxik-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes maxik-blink {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30%           { opacity: 1;   transform: scale(1); }
}

/* ── Follow-up chips ── */
.maxik-followups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.maxik-followup-chip {
  padding: 4px 10px;
  border: 1px solid rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  transition: background .15s;
}
.maxik-followup-chip:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

/* ── FAQ shortcuts ── */
.maxik-faq-shortcuts {
  margin-top: 16px;
  padding: 16px;
  border-top: 1px solid rgba(0,0,0,.06);
}

/* ── Character row ── */
.maxik-bottom-row {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.maxik-dismiss {
  align-self: center;
  margin-bottom: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(0,0,0,.18);
  background: white;
  color: #555;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,.15);
  transition: background .15s, color .15s, border-color .15s;
  flex-shrink: 0;
  pointer-events: all;
}
.maxik-dismiss:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.maxik-character { cursor: pointer; }

.maxik-tilt { transform-style: preserve-3d; }

.maxik-float {
  position: relative;
  transform-origin: center bottom;
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
@keyframes maxik-idle {
  0%   { transform: translateY(0px)   rotate(-1deg)   scaleY(1); }
  20%  { transform: translateY(-6px)  rotate(0.2deg)  scaleY(1.01); }
  45%  { transform: translateY(-13px) rotate(1.2deg)  scaleY(1); }
  65%  { transform: translateY(-9px)  rotate(0.6deg)  scaleY(1.01); }
  80%  { transform: translateY(-3px)  rotate(-0.5deg) scaleY(1); }
  100% { transform: translateY(0px)   rotate(-1deg)   scaleY(1); }
}

@keyframes maxik-shadow-pulse {
  0%,100% { transform: translateX(-60%) scaleX(1);    opacity: 0.9; }
  45%     { transform: translateX(-60%) scaleX(0.55); opacity: 0.4; }
}

@keyframes maxik-attention {
  0%   { transform: scale(1)    rotate(0deg); }
  12%  { transform: scale(1.2)  rotate(-7deg); }
  28%  { transform: scale(0.9)  rotate(5deg); }
  48%  { transform: scale(1.12) rotate(-3deg); }
  65%  { transform: scale(0.96) rotate(2deg); }
  82%  { transform: scale(1.05) rotate(-1deg); }
  100% { transform: scale(1)    rotate(0deg); }
}

/* ── Transitions ── */
.maxik-fab-pop-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s ease; }
.maxik-fab-pop-leave-active { transition: transform .2s ease, opacity .15s ease; }
.maxik-fab-pop-enter-from   { transform: scale(.6); opacity: 0; }
.maxik-fab-pop-leave-to     { transform: scale(.6); opacity: 0; }

.maxik-slide-enter-active { transition: transform .6s cubic-bezier(.22,1,.36,1), opacity .4s ease; }
.maxik-slide-leave-active { transition: transform .38s cubic-bezier(.55,0,1,.45), opacity .3s ease; }
.maxik-slide-enter-from   { transform: translateX(170px); opacity: 0; }
.maxik-slide-leave-to     { transform: translateX(170px); opacity: 0; }

.bubble-pop-enter-active { transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease; }
.bubble-pop-leave-active { transition: transform .2s ease, opacity .2s ease; }
.bubble-pop-enter-from   { transform: scale(.85) translateY(6px); opacity: 0; }
.bubble-pop-leave-to     { transform: scale(.85) translateY(6px); opacity: 0; }
</style>
