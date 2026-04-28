<!-- src/components/ai/AiRecommendationsPanel.vue -->
<template>
  <v-card border elevation="0" class="pa-4 mb-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-creation" color="primary" />
        <div>
          <div class="d-flex align-center gap-2">
            <span class="text-body-2 font-weight-bold">AI Recommendations</span>
            <v-chip size="x-small" color="purple" variant="tonal" label>Post-MVP</v-chip>
          </div>
          <div class="text-caption text-medium-emphasis">Based on your catalog and current promotions</div>
        </div>
      </div>
      <v-btn variant="text" size="small" @click="expanded = !expanded">
        {{ expanded ? 'Hide' : 'Show' }}
        <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="expanded">
        <div class="rec-grid">
          <v-card
            v-for="rec in recommendations"
            :key="rec.id"
            border
            elevation="0"
            class="pa-4 d-flex flex-column"
          >
            <div class="d-flex align-center gap-2 mb-2">
              <v-chip
                :color="impactColor(rec.impact)"
                variant="tonal"
                size="x-small"
                label
              >{{ rec.impact }} impact</v-chip>
              <v-chip
                v-if="appliedIds.includes(rec.id)"
                color="success"
                variant="tonal"
                size="x-small"
                label
              >Applied</v-chip>
            </div>
            <div class="text-body-2 font-weight-bold mb-1">{{ rec.title }}</div>
            <div class="text-caption text-medium-emphasis mb-2">{{ rec.description }}</div>
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-caption text-medium-emphasis">Potential revenue</div>
                <div class="text-body-2 font-weight-bold text-success">{{ rec.potentialRevenue }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-medium-emphasis">Confidence</div>
                <div class="text-body-2 font-weight-bold">{{ rec.confidence }}%</div>
              </div>
            </div>
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              :disabled="appliedIds.includes(rec.id)"
              :loading="applyingId === rec.id"
              class="text-uppercase w-100 mt-auto"
              @click="applyRecommendation(rec)"
            >
              <v-icon icon="mdi-check" class="mr-1" />
              Apply rule
            </v-btn>
          </v-card>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { usePromotionsStore } from '../../stores/promotions'

const store = usePromotionsStore()
const expanded = ref(true)
const appliedIds = ref([])
const applyingId = ref(null)

const recommendations = [
  {
    id: 'rec-1',
    title: 'Step Discount — High Spenders',
    description: '€20 off for every €200 spent. Encourages larger basket sizes.',
    impact: 'High',
    potentialRevenue: '€45,000',
    confidence: 92,
    ruleData: { name: 'Step Discount — High Spenders', type: 'step_discount', value: '20', valueUnit: '%', status: 'active', conditions: [], gifts: [], steps: [], priority: 10 },
  },
  {
    id: 'rec-2',
    title: 'Multi Buy Deal',
    description: 'Buy 2 Get 1 Free. Increases average order value.',
    impact: 'Medium',
    potentialRevenue: '€32,000',
    confidence: 85,
    ruleData: { name: 'Multi Buy — Buy 2 Get 1 Free', type: 'multi_buy', value: '0', valueUnit: '%', status: 'active', conditions: [], gifts: [], steps: [], priority: 20 },
  },
  {
    id: 'rec-3',
    title: 'Gift Promotion',
    description: 'Free gift with purchase over €100. Retention focused.',
    impact: 'Medium',
    potentialRevenue: '€28,000',
    confidence: 78,
    ruleData: { name: 'Gift Promotion — Free Gift', type: 'gift', value: '0', valueUnit: '%', status: 'active', conditions: [{ id: 'g1', field: 'subtotal', mode: 'include', values: ['100'], operator: '>=' }], gifts: [], steps: [], priority: 30 },
  },
  {
    id: 'rec-4',
    title: 'VIP Loyalty Discount',
    description: '15% off all purchases for VIP customers.',
    impact: 'High',
    potentialRevenue: '€38,000',
    confidence: 90,
    ruleData: { name: 'VIP Loyalty Discount', type: 'discount', value: '15', valueUnit: '%', status: 'active', conditions: [{ id: 'v1', field: 'customer_group', mode: 'include', values: ['VIP'] }], gifts: [], steps: [], priority: 5 },
  },
]

function impactColor(impact) {
  return { High: 'success', Medium: 'warning', Low: 'default' }[impact] ?? 'default'
}

async function applyRecommendation(rec) {
  applyingId.value = rec.id
  try {
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    await store.create({ ...rec.ruleData, startDate: today, endDate, createdBy: 'AI Recommendation' })
    appliedIds.value.push(rec.id)
  } catch {
    // store.error already set
  } finally {
    applyingId.value = null
  }
}
</script>

<style scoped>
.rec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
</style>
