<!-- src/components/ai/SmartRulePreview.vue -->
<template>
  <v-card border elevation="0" class="pa-4" color="success" variant="tonal">
    <!-- Header: rule name + confidence -->
    <div class="d-flex align-center mb-3 gap-2">
      <v-icon icon="mdi-check-circle" color="success" size="18" />
      <span class="text-body-2 font-weight-bold flex-grow-1">Rule extracted from your request</span>
      <v-chip :color="confidenceColor" variant="tonal" size="x-small" label>
        {{ confidenceLabel }} ({{ Math.round(parsed.confidence * 100) }}%)
      </v-chip>
    </div>

    <!-- Rule details -->
    <div class="d-flex flex-wrap gap-4 mb-3">
      <div v-if="parsed.type">
        <div class="text-caption text-medium-emphasis">TYPE</div>
        <v-chip color="primary" variant="tonal" size="x-small" label class="mt-1">
          {{ typeLabel }}
        </v-chip>
      </div>
      <div v-if="parsed.value">
        <div class="text-caption text-medium-emphasis">VALUE</div>
        <div class="text-body-2 font-weight-medium mt-1">{{ valueDisplay }}</div>
      </div>
      <div v-if="parsed.startDate && parsed.endDate">
        <div class="text-caption text-medium-emphasis">VALID</div>
        <div class="text-body-2 mt-1">{{ parsed.startDate }} → {{ parsed.endDate }}</div>
      </div>
    </div>

    <!-- Conditions -->
    <div v-if="parsed.conditions?.length" class="mb-3 pa-3 rounded border" style="background: rgba(255,255,255,0.7)">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-caption font-weight-bold">
          TARGETING CONDITIONS ({{ parsed.conditions.length }})
        </div>
        <v-chip size="x-small" variant="outlined">AND logic</v-chip>
      </div>
      <div class="d-flex flex-wrap gap-1 mb-3">
        <v-chip
          v-for="(c, i) in parsed.conditions"
          :key="i"
          :color="c.mode === 'include' ? 'success' : 'error'"
          variant="tonal"
          size="x-small"
          label
        >
          {{ c.mode === 'include' ? '✓' : '✕' }} {{ formatConditionLabel(c) }}
        </v-chip>
      </div>

      <!-- Reach estimate -->
      <div class="text-caption text-medium-emphasis mb-1">
        Estimated reach: <strong :class="reach.color">{{ reach.label }} (~{{ reach.percentage }}%)</strong>
      </div>
      <v-progress-linear
        :model-value="reach.percentage"
        :color="reach.progressColor"
        rounded
        height="6"
        bg-color="grey-lighten-3"
      />
    </div>

    <div v-else class="mb-3 pa-3 rounded bg-blue-lighten-5 border">
      <div class="text-caption text-medium-emphasis">
        No conditions detected — this rule will apply to all products and customers.
        Use "Edit &amp; Complete" to add targeting.
      </div>
    </div>

    <!-- Missing fields -->
    <v-alert
      v-if="parsed.missingFields?.length"
      type="warning"
      variant="tonal"
      density="compact"
      icon="mdi-alert"
      class="mb-3"
    >
      Couldn't extract: {{ parsed.missingFields.join(', ') }} — use "Edit &amp; Complete" to fill in.
    </v-alert>

    <!-- Actions -->
    <div class="d-flex gap-2 align-center">
      <v-btn
        v-if="parsed.confidence >= 0.75 && !parsed.missingFields?.length"
        color="success"
        variant="flat"
        size="small"
        @click="$emit('apply')"
      >
        <v-icon icon="mdi-check" class="mr-1" />
        Create Rule
      </v-btn>
      <v-btn
        color="primary"
        :variant="parsed.confidence >= 0.75 && !parsed.missingFields?.length ? 'outlined' : 'flat'"
        size="small"
        data-testid="edit-btn"
        @click="$emit('edit')"
      >
        <v-icon icon="mdi-pencil" class="mr-1" />
        Edit &amp; Complete
      </v-btn>
      <v-btn variant="text" size="small" class="ml-auto" @click="$emit('dismiss')">
        Dismiss
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ parsed: { type: Object, required: true } })
defineEmits(['apply', 'edit', 'dismiss'])

const TYPE_LABELS = {
  discount: 'Discount', step_discount: 'Step Discount',
  multi_buy: 'Multi-Buy', gift: 'Gift Promotion',
}

const FIELD_LABELS = {
  categories: 'Categories', skus: 'SKUs', brands: 'Brands',
  product_lines: 'Product lines', coupon_code: 'Coupon code',
  customer_group: 'Customer group', pim_status: 'PIM status',
  attribute_set: 'Attribute set', source: 'Source',
  warehouse_type: 'Warehouse type', seller: 'Seller',
  exclude_on_sale: 'Excl. on sale', quantity: 'Quantity',
  subtotal: 'Subtotal', weight: 'Weight',
}

const OP_LABELS = { '>=': '≥', '>': '>', '<=': '≤', '<': '<' }

const typeLabel = computed(() => TYPE_LABELS[props.parsed.type] ?? props.parsed.type)

const valueDisplay = computed(() => {
  const p = props.parsed
  if (p.type === 'step_discount') return `€${p.value} off per €${p.stepValue}`
  if (p.type === 'multi_buy') return `Buy ${p.buyQty} Get ${p.freeQty} Free`
  if (p.type === 'gift') return p.value ?? 'Free Gift'
  return `${p.value}${p.valueUnit === '%' ? '%' : ' (fixed)'}`
})

const confidenceLabel = computed(() => {
  const c = props.parsed.confidence
  if (c >= 0.8) return 'High confidence'
  if (c >= 0.5) return 'Medium confidence'
  return 'Low confidence'
})

const confidenceColor = computed(() => {
  const c = props.parsed.confidence
  return c >= 0.8 ? 'success' : c >= 0.5 ? 'warning' : 'error'
})

function formatConditionLabel(c) {
  const label = FIELD_LABELS[c.field] ?? c.field
  if (c.field === 'exclude_on_sale') return 'Exclude on sale'
  const vals = c.values ?? []
  if (c.operator) return `${label} ${OP_LABELS[c.operator] ?? c.operator} ${vals[0] ?? ''}`
  const display = vals.length <= 2 ? vals.join(', ') : `${vals[0]} +${vals.length - 1}`
  return `${label}: ${display}`
}

// Reach estimate — mirrors React's SmartRulePreview logic
const reach = computed(() => {
  let score = 100
  const conds = props.parsed.conditions ?? []
  for (const c of conds) {
    if (c.field === 'categories') score -= 40
    else if (c.field === 'brands') score -= 30
    else if (c.field === 'skus') score -= 50
    else if (c.field === 'subtotal') {
      const v = parseFloat(c.values?.[0])
      score -= v > 1000 ? 40 : v > 500 ? 25 : 15
    } else if (c.field === 'quantity') {
      const v = parseFloat(c.values?.[0])
      score -= v > 10 ? 35 : v > 5 ? 20 : 10
    } else if (c.field === 'customer_group') score -= 30
    else if (c.field === 'exclude_on_sale') score -= 15
    // exclude mode on any field adds a small additional reduction
    if (c.mode === 'exclude' && c.field !== 'exclude_on_sale') score -= 5
  }
  score = Math.max(5, Math.min(100, score))

  if (score < 30) return { percentage: score, label: 'Narrow', color: 'text-error', progressColor: 'error' }
  if (score < 60) return { percentage: score, label: 'Moderate', color: 'text-warning', progressColor: 'warning' }
  return { percentage: score, label: 'Broad', color: 'text-success', progressColor: 'success' }
})
</script>
