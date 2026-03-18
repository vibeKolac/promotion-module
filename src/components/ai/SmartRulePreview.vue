<!-- src/components/ai/SmartRulePreview.vue -->
<template>
  <v-card border elevation="0" class="pa-4" color="primary-bg">
    <div class="d-flex align-center mb-3 gap-2">
      <span class="text-body-2 font-weight-bold">Rule extracted</span>
      <v-chip
        :color="confidenceColor"
        variant="tonal"
        size="x-small"
        label
      >
        {{ confidenceLabel }} {{ Math.round(parsed.confidence * 100) }}%
      </v-chip>
    </div>

    <div class="text-caption text-medium-emphasis mb-1">TYPE</div>
    <div class="text-body-2 mb-3 text-capitalize">{{ parsed.type?.replace('_', ' ') }}</div>

    <div v-if="parsed.value" class="text-caption text-medium-emphasis mb-1">VALUE</div>
    <div v-if="parsed.value" class="text-body-2 mb-3">
      {{ parsed.value }}{{ parsed.valueUnit === '%' ? '%' : ' (fixed)' }}
    </div>

    <div v-if="parsed.conditions?.length" class="mb-3">
      <div class="text-caption text-medium-emphasis mb-2">CONDITIONS ({{ parsed.conditions.length }})</div>
      <div class="d-flex flex-wrap gap-1">
        <v-chip
          v-for="(c, i) in parsed.conditions"
          :key="i"
          :color="c.mode === 'include' ? 'success' : 'error'"
          variant="tonal"
          size="x-small"
          label
        >
          {{ c.mode === 'include' ? '✓' : '✕' }} {{ c.field }}: {{ c.values.join(', ') }}
        </v-chip>
      </div>
    </div>

    <div v-if="parsed.missingFields?.length" class="mb-3">
      <v-alert type="warning" variant="tonal" density="compact" icon="mdi-alert">
        Couldn't extract: {{ parsed.missingFields.join(', ') }}
      </v-alert>
    </div>

    <div class="d-flex gap-2 mt-3">
      <v-btn color="primary" variant="flat" size="small" @click="$emit('apply')">Apply to form</v-btn>
      <v-btn variant="outlined" size="small" @click="$emit('dismiss')">Dismiss</v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ parsed: { type: Object, required: true } })
defineEmits(['apply', 'dismiss'])

const confidenceLabel = computed(() => {
  if (props.parsed.confidence >= 0.8) return 'High confidence'
  if (props.parsed.confidence >= 0.5) return 'Medium confidence'
  return 'Low confidence'
})

const confidenceColor = computed(() => {
  if (props.parsed.confidence >= 0.8) return 'success'
  if (props.parsed.confidence >= 0.5) return 'warning'
  return 'error'
})
</script>
