<!-- src/components/promotions/RulePriorityPreview.vue -->
<template>
  <v-card v-if="result.applied.length || result.skipped.length" border elevation="0" class="pa-4 mb-4" color="success" variant="tonal">
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-arrow-right-circle" color="success" />
        <div>
          <div class="text-body-2 font-weight-bold">Priority-based application preview</div>
          <div class="text-caption text-medium-emphasis">
            {{ result.applied.length }} rule{{ result.applied.length !== 1 ? 's' : '' }} will apply
            <span v-if="result.skipped.length">, {{ result.skipped.length }} skipped</span>
          </div>
        </div>
      </div>
      <v-btn variant="text" size="small" @click="expanded = !expanded">
        {{ expanded ? 'Hide' : 'Show' }} details
        <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="expanded" class="mt-4">
        <!-- Applied -->
        <div v-if="result.applied.length" class="mb-4">
          <div class="text-caption font-weight-bold text-success mb-2">WILL APPLY (in priority order)</div>
          <div
            v-for="(rule, i) in result.applied"
            :key="rule.id"
            class="d-flex align-center gap-3 pa-3 mb-2 rounded bg-white"
            style="border:1px solid rgba(var(--v-theme-success),0.3)"
          >
            <div
              class="text-caption font-weight-bold rounded-circle d-flex align-center justify-center flex-shrink-0"
              style="width:28px;height:28px;background:rgba(var(--v-theme-success),0.15)"
            >{{ i + 1 }}</div>
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-bold">{{ rule.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ rule.type.replace('_', ' ') }} · Priority {{ rule.priority ?? 'unset' }}</div>
            </div>
            <v-chip color="success" variant="tonal" size="x-small">Applied</v-chip>
          </div>
        </div>

        <!-- Skipped -->
        <div v-if="result.skipped.length" class="mb-3">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-2">SKIPPED</div>
          <div
            v-for="{ rule, reason } in result.skipped"
            :key="rule.id"
            class="d-flex align-center gap-3 pa-3 mb-2 rounded"
            style="border:1px solid rgba(0,0,0,0.08);opacity:0.65"
          >
            <v-icon icon="mdi-close-circle-outline" size="20" color="medium-emphasis" />
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-bold">{{ rule.name }}</div>
              <div class="text-caption text-error">{{ reason }}</div>
            </div>
            <v-chip variant="outlined" size="x-small">Skipped</v-chip>
          </div>
        </div>

        <v-alert type="info" variant="tonal" density="compact" icon="mdi-information">
          Rules apply in priority order (lower number first). Gift rules can stack with discount rules.
        </v-alert>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { simulateRuleApplication } from '../../utils/ruleConflictDetector'

const props = defineProps({
  rules: { type: Array, required: true },
})

const expanded = ref(false)
const result = computed(() => simulateRuleApplication(props.rules))
</script>
