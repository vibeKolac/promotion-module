<!-- src/components/ai/WizardPanel.vue -->
<template>
  <v-card border elevation="0" class="mb-3">
    <!-- Zone 1: Header (always visible) -->
    <div class="d-flex align-center px-4 py-2">
      <v-icon icon="mdi-auto-fix" size="16" class="mr-2 text-primary" />
      <span class="text-body-2 font-weight-bold flex-grow-1">
        Guided Setup
        <span v-if="uiStore.wizardStep > 0" class="text-medium-emphasis font-weight-regular ml-1">
          — Step {{ uiStore.wizardStep }} of {{ totalSteps }}: {{ currentStepLabel }}
        </span>
      </span>
      <v-btn
        :icon="uiStore.wizardCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
        size="x-small" variant="text"
        @click="uiStore.toggleWizardCollapsed()"
      />
      <v-btn icon="mdi-close" size="x-small" variant="text" @click="uiStore.wizardReset()" />
    </div>

    <v-expand-transition>
      <div v-if="!uiStore.wizardCollapsed">
        <!-- Zone 2: Progress bar (step > 0 only) -->
        <template v-if="uiStore.wizardStep > 0">
          <v-progress-linear :model-value="progress" color="primary" height="3" />
          <div class="d-flex px-4 py-2 gap-1 flex-wrap">
            <v-chip
              v-for="(s, i) in currentSteps"
              :key="s.id"
              size="x-small"
              :color="i < uiStore.wizardStep ? 'primary' : 'default'"
              :variant="i === uiStore.wizardStep - 1 ? 'flat' : 'tonal'"
              :style="i >= uiStore.wizardStep ? 'opacity: 0.4; cursor: default' : 'cursor: pointer'"
              @click="() => i < uiStore.wizardStep - 1 && uiStore.wizardGoToStep(i + 1)"
            >{{ s.label }}</v-chip>
          </div>
        </template>

        <!-- Zone 3: Step content -->
        <v-card-text class="pa-4">

          <!-- STEP 0: Mode selector -->
          <div v-if="uiStore.wizardStep === 0" class="d-flex gap-3">
            <v-card
              border hover class="flex-1 pa-4 cursor-pointer text-center"
              data-testid="mode-template"
              @click="uiStore.startWizard('template')"
            >
              <v-icon icon="mdi-view-grid-outline" size="28" color="primary" class="mb-2 d-block mx-auto" />
              <div class="text-body-2 font-weight-bold">Start from template</div>
              <div class="text-caption text-medium-emphasis mt-1">Pick a ready-made rule and customize</div>
            </v-card>
            <v-card
              border hover class="flex-1 pa-4 cursor-pointer text-center"
              data-testid="mode-custom"
              @click="uiStore.startWizard('custom')"
            >
              <v-icon icon="mdi-pencil-box-outline" size="28" color="primary" class="mb-2 d-block mx-auto" />
              <div class="text-body-2 font-weight-bold">Build from scratch</div>
              <div class="text-caption text-medium-emphasis mt-1">Step-by-step guided setup</div>
            </v-card>
          </div>

          <!-- CUSTOM FLOW -->
          <template v-if="uiStore.wizardMode === 'custom'">

            <!-- Step 1: Type -->
            <div v-if="uiStore.wizardStep === 1">
              <div class="text-body-2 font-weight-bold mb-3">What type of promotion?</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="c in TYPE_CHIPS" :key="c.value"
                  :prepend-icon="c.icon" color="primary" variant="outlined"
                  class="cursor-pointer" @click="uiStore.wizardNext('type', c.value)"
                >{{ c.label }}</v-chip>
              </div>
            </div>

            <!-- Step 2: Duration -->
            <div v-if="uiStore.wizardStep === 2">
              <div class="text-body-2 font-weight-bold mb-3">How long should it run?</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="c in DURATION_CHIPS" :key="c.value"
                  color="primary" variant="outlined"
                  class="cursor-pointer" @click="uiStore.wizardNext('duration', c.value)"
                >{{ c.label }}</v-chip>
              </div>
            </div>

            <!-- Step 3: Target -->
            <div v-if="uiStore.wizardStep === 3">
              <div class="text-body-2 font-weight-bold mb-3">Which products?</div>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <v-chip
                  v-for="c in TARGET_CHIPS" :key="c.value"
                  color="primary" variant="outlined"
                  class="cursor-pointer" @click="uiStore.wizardNext('target', c.value)"
                >{{ c.label }}</v-chip>
              </div>
              <div class="d-flex gap-2 align-center">
                <v-text-field
                  v-model="brandInput" label="Or enter brand name..."
                  variant="outlined" density="compact" hide-details class="flex-grow-1"
                />
                <v-btn
                  color="primary" variant="flat" size="small" :disabled="!brandInput.trim()"
                  @click="submitBrand"
                >Next</v-btn>
              </div>
            </div>

            <!-- Step 4: Value -->
            <div v-if="uiStore.wizardStep === 4">
              <!-- Discount -->
              <template v-if="!uiStore.wizardData.type || uiStore.wizardData.type === 'discount'">
                <div class="text-body-2 font-weight-bold mb-3">How much discount?</div>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <v-chip
                    v-for="c in DISCOUNT_CHIPS" :key="c.value"
                    color="primary" variant="outlined"
                    class="cursor-pointer" @click="uiStore.wizardNext('value', c.value)"
                  >{{ c.label }}</v-chip>
                </div>
                <div class="d-flex gap-2 align-center">
                  <v-text-field
                    v-model="customValueInput" label="Custom %" type="number"
                    variant="outlined" density="compact" hide-details style="max-width: 120px"
                  />
                  <v-btn
                    color="primary" variant="flat" size="small" :disabled="!customValueInput"
                    @click="uiStore.wizardNext('value', customValueInput); customValueInput = ''"
                  >Next</v-btn>
                </div>
              </template>

              <!-- Multi-buy -->
              <template v-if="uiStore.wizardData.type === 'multi_buy'">
                <div class="text-body-2 font-weight-bold mb-3">Buy X get Y free:</div>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <v-chip
                    v-for="c in MULTIBUY_CHIPS" :key="c.value"
                    color="primary" variant="outlined"
                    class="cursor-pointer" @click="uiStore.wizardNext('value', c.value)"
                  >{{ c.label }}</v-chip>
                </div>
                <div class="d-flex gap-2 align-center">
                  <v-text-field
                    v-model="customValueInput" label="Custom (e.g. 4+1)"
                    variant="outlined" density="compact" hide-details style="max-width: 140px"
                  />
                  <v-btn
                    color="primary" variant="flat" size="small" :disabled="!customValueInput"
                    @click="uiStore.wizardNext('value', customValueInput); customValueInput = ''"
                  >Next</v-btn>
                </div>
              </template>

              <!-- Gift -->
              <template v-if="uiStore.wizardData.type === 'gift'">
                <div class="text-body-2 font-weight-bold mb-3">Gift item SKU:</div>
                <div class="d-flex gap-2 align-center">
                  <v-text-field
                    v-model="customValueInput" label="SKU (e.g. TOTE-001)"
                    variant="outlined" density="compact" hide-details
                    class="flex-grow-1" data-testid="gift-sku-input"
                  />
                  <v-btn
                    color="primary" variant="flat" size="small" :disabled="!customValueInput"
                    @click="uiStore.wizardNext('value', customValueInput); customValueInput = ''"
                  >Next</v-btn>
                </div>
              </template>

              <!-- Step discount: two fields -->
              <template v-if="uiStore.wizardData.type === 'step_discount'">
                <div class="text-body-2 font-weight-bold mb-3">Amount off and threshold:</div>
                <div class="d-flex gap-2 align-center flex-wrap">
                  <v-text-field
                    v-model="stepValueAmount" label="Amount off (€)" type="number"
                    variant="outlined" density="compact" hide-details
                    data-testid="step-amount-input" style="max-width: 130px"
                  />
                  <span class="text-body-2 text-medium-emphasis">per</span>
                  <v-text-field
                    v-model="stepValueThreshold" label="Threshold (€)" type="number"
                    variant="outlined" density="compact" hide-details
                    data-testid="step-threshold-input" style="max-width: 130px"
                  />
                  <v-btn
                    color="primary" variant="flat" size="small"
                    :disabled="!stepValueAmount || !stepValueThreshold"
                    @click="submitStepDiscount"
                  >Next</v-btn>
                </div>
              </template>
            </div>

            <!-- Step 5: Confirm -->
            <div v-if="uiStore.wizardStep === 5" data-testid="confirm-step">
              <ConfirmView :summary="summary" :creating="creating" @create="confirmCreate" @edit="confirmEdit" @back="uiStore.wizardBack()" />
            </div>
          </template>

          <!-- TEMPLATE FLOW -->
          <template v-if="uiStore.wizardMode === 'template'">

            <!-- Step 1: Template selection -->
            <div v-if="uiStore.wizardStep === 1">
              <div class="text-body-2 font-weight-bold mb-3">Choose a template:</div>
              <div v-if="!templatesStore.items.length" class="text-caption text-medium-emphasis">
                Loading templates...
              </div>
              <div class="d-flex flex-wrap gap-2">
                <v-card
                  v-for="tpl in templatesStore.items" :key="tpl.id"
                  border hover class="pa-3 cursor-pointer" style="min-width: 180px"
                  @click="selectTemplate(tpl)"
                >
                  <div class="text-body-2 font-weight-bold">{{ tpl.label }}</div>
                  <div class="text-caption text-medium-emphasis">{{ tpl.description }}</div>
                </v-card>
              </div>
            </div>

            <!-- Step 2: Customize -->
            <div v-if="uiStore.wizardStep === 2">
              <div class="text-body-2 font-weight-bold mb-3">{{ customizePrompt }}</div>
              <div v-if="customizeField === 'value'" class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="c in customizeChips" :key="c.value"
                  color="primary" variant="outlined"
                  class="cursor-pointer" @click="uiStore.wizardNext('value', c.value)"
                >{{ c.label }}</v-chip>
              </div>
              <div v-else class="d-flex gap-2 align-center">
                <v-text-field
                  v-model="customValueInput"
                  :label="customizeField === 'brand' ? 'Brand name' : 'Minimum spend (€)'"
                  variant="outlined" density="compact" hide-details class="flex-grow-1"
                />
                <v-btn
                  color="primary" variant="flat" size="small" :disabled="!customValueInput"
                  @click="handleCustomizeTextInput"
                >Next</v-btn>
              </div>
            </div>

            <!-- Step 3: Confirm -->
            <div v-if="uiStore.wizardStep === 3" data-testid="confirm-step">
              <ConfirmView :summary="summary" :creating="creating" @create="confirmCreate" @edit="confirmEdit" @back="uiStore.wizardBack()" />
            </div>
          </template>

        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
export default {
  components: {
    ConfirmView: {
      props: ['summary', 'creating'],
      emits: ['create', 'edit', 'back'],
      template: `
        <div>
          <div class="text-body-2 font-weight-bold mb-3">Review your promotion:</div>
          <v-list density="compact" class="mb-4 rounded border">
            <v-list-item v-for="row in summary" :key="row.label">
              <template #prepend>
                <span class="text-caption text-medium-emphasis" style="width: 80px">{{ row.label }}</span>
              </template>
              <span class="text-body-2 font-weight-medium">{{ row.value }}</span>
            </v-list-item>
          </v-list>
          <div class="d-flex gap-2">
            <v-btn color="success" variant="flat" size="small" :loading="creating" @click="$emit('create')">
              <v-icon icon="mdi-check" class="mr-1" />Create Promotion
            </v-btn>
            <v-btn color="primary" variant="outlined" size="small" @click="$emit('edit')">
              <v-icon icon="mdi-pencil" class="mr-1" />Edit Details
            </v-btn>
            <v-btn variant="text" size="small" class="ml-auto" @click="$emit('back')">Back</v-btn>
          </div>
        </div>
      `,
    },
  },
}
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../../stores/ui'
import { usePromotionsStore } from '../../stores/promotions'
import { useTemplatesStore } from '../../stores/templates'
import { calculateDatesFromDuration } from '../../utils/wizardStateManager'

const uiStore = useUiStore()
const promotionsStore = usePromotionsStore()
const templatesStore = useTemplatesStore()
const router = useRouter()

const brandInput = ref('')
const customValueInput = ref('')
const stepValueAmount = ref('')
const stepValueThreshold = ref('')
const creating = ref(false)

const TYPE_CHIPS = [
  { label: 'Discount', value: 'discount', icon: 'mdi-percent' },
  { label: 'Step Discount', value: 'step_discount', icon: 'mdi-stairs' },
  { label: 'Multi-buy', value: 'multi_buy', icon: 'mdi-cart-plus' },
  { label: 'Gift', value: 'gift', icon: 'mdi-gift' },
]

const DURATION_CHIPS = [
  { label: 'Today', value: 'day' },
  { label: 'Weekend', value: 'weekend' },
  { label: '1 week', value: 'week' },
  { label: '2 weeks', value: 'two-weeks' },
  { label: '1 month', value: 'month' },
  { label: '3 months', value: 'season' },
]

const TARGET_CHIPS = [
  { label: 'All Products', value: 'all' },
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Health & Drugs', value: 'Health & Drugs' },
  { label: 'Skincare', value: 'Skincare' },
  { label: 'Footwear', value: 'Footwear' },
]

const DISCOUNT_CHIPS = [
  { label: '10%', value: '10' },
  { label: '15%', value: '15' },
  { label: '20%', value: '20' },
  { label: '25%', value: '25' },
  { label: '30%', value: '30' },
]

const MULTIBUY_CHIPS = [
  { label: '2+1', value: '2+1' },
  { label: '3+1', value: '3+1' },
  { label: '3+2', value: '3+2' },
]

const TEMPLATE_CUSTOMIZE = {
  'tpl-flash-1':    { field: 'value',    chips: DISCOUNT_CHIPS, prompt: 'How much discount?' },
  'tpl-seasonal-1': { field: 'value',    chips: [{ label: '10%', value: '10' }, { label: '15%', value: '15' }, { label: '20%', value: '20' }, { label: '30%', value: '30' }, { label: '50%', value: '50' }], prompt: 'How much discount?' },
  'tpl-loyalty-1':  { field: 'value',    chips: [{ label: '10%', value: '10' }, { label: '15%', value: '15' }, { label: '20%', value: '20' }, { label: '25%', value: '25' }], prompt: 'How much discount?' },
  'tpl-bulk-1':     { field: 'value',    chips: [{ label: '5%', value: '5' }, { label: '10%', value: '10' }, { label: '15%', value: '15' }, { label: '20%', value: '20' }], prompt: 'How much discount per step?' },
  'tpl-gift-1':     { field: 'subtotal', chips: [], prompt: 'Minimum spend to trigger the gift (€)?' },
  'tpl-brand-1':    { field: 'brand',    chips: [], prompt: 'Which brand gets the discount?' },
}

const CUSTOM_STEPS = [
  { id: 'type', label: 'Type' },
  { id: 'duration', label: 'Duration' },
  { id: 'target', label: 'Target' },
  { id: 'value', label: 'Value' },
  { id: 'confirm', label: 'Confirm' },
]

const TEMPLATE_STEPS = [
  { id: 'template', label: 'Select' },
  { id: 'customize', label: 'Customize' },
  { id: 'confirm', label: 'Confirm' },
]

const currentSteps = computed(() =>
  uiStore.wizardMode === 'template' ? TEMPLATE_STEPS : CUSTOM_STEPS
)

const totalSteps = computed(() => currentSteps.value.length)
const progress = computed(() => (uiStore.wizardStep / totalSteps.value) * 100)
const currentStepLabel = computed(() => currentSteps.value[uiStore.wizardStep - 1]?.label ?? '')

const templateConfig = computed(() => TEMPLATE_CUSTOMIZE[uiStore.wizardData._templateId] ?? null)
const customizeField = computed(() => templateConfig.value?.field ?? 'value')
const customizeChips = computed(() => templateConfig.value?.chips ?? DISCOUNT_CHIPS)
const customizePrompt = computed(() => templateConfig.value?.prompt ?? 'Customize:')

const summary = computed(() => {
  const d = uiStore.wizardData
  const rows = []
  if (d.type) rows.push({ label: 'Type', value: TYPE_CHIPS.find(c => c.value === d.type)?.label ?? d.type })
  if (d.value) {
    if (d.type === 'step_discount') rows.push({ label: 'Value', value: `€${d.value} off per €${d.stepValue}` })
    else if (d.type === 'multi_buy') {
      const [buy, free] = (d.value).split('+')
      rows.push({ label: 'Value', value: `Buy ${buy} Get ${free} Free` })
    } else {
      rows.push({ label: 'Value', value: `${d.value}%` })
    }
  }
  if (d.duration) rows.push({ label: 'Duration', value: DURATION_CHIPS.find(c => c.value === d.duration)?.label ?? d.duration })
  if (d.target) {
    const display = d.target === 'all' ? 'All products'
      : d.target.startsWith('brand:') ? `Brand: ${d.target.slice(6)}`
      : d.target.startsWith('subtotal:') ? `Min spend: €${d.target.slice(9)}`
      : d.target
    rows.push({ label: 'Target', value: display })
  }
  return rows
})

function submitBrand() {
  uiStore.wizardNext('target', 'brand:' + brandInput.value.trim())
  brandInput.value = ''
}

function submitStepDiscount() {
  uiStore.wizardSetData({ stepValue: stepValueThreshold.value })
  uiStore.wizardNext('value', stepValueAmount.value)
  stepValueAmount.value = ''
  stepValueThreshold.value = ''
}

function selectTemplate(tpl) {
  uiStore.wizardSetData({
    _templateId: tpl.id,
    type: tpl.ruleType,
    value: tpl.defaultValue,
    valueUnit: tpl.defaultValueUnit,
  })
  uiStore.wizardNext('_template', tpl.id)
}

function handleCustomizeTextInput() {
  const field = customizeField.value
  if (field === 'brand') {
    uiStore.wizardNext('target', 'brand:' + customValueInput.value.trim())
  } else if (field === 'subtotal') {
    uiStore.wizardNext('target', 'subtotal:' + customValueInput.value.trim())
  }
  customValueInput.value = ''
}

function buildPayload() {
  const d = uiStore.wizardData
  const payload = {
    type: d.type ?? 'discount',
    name: d.name || autoName(d),
    status: 'active',
    conditions: [],
    gifts: [],
    steps: [],
    priority: 10,
    exclusive: false,
    processingOrder: null,
    stepType: 'SPENT',
    valueUnit: '%',
  }

  if (d.type === 'multi_buy') {
    const [buy, free] = (d.value ?? '2+1').split('+')
    payload.buyQty = Number(buy); payload.freeQty = Number(free)
    payload.value = d.value
  } else if (d.type === 'gift') {
    payload.value = 'Free Gift'
    payload.gifts = [{ sku: d.value || 'GIFT-001', quantity: 1, price: 0.01 }]
  } else if (d.type === 'step_discount') {
    payload.value = d.value; payload.stepValue = d.stepValue
    payload.valueUnit = 'fixed'
  } else {
    payload.value = String(d.value ?? '').replace('%', '')
  }

  if (d.duration) {
    const dates = calculateDatesFromDuration(d.duration)
    payload.startDate = dates.startDate; payload.endDate = dates.endDate
  }

  if (!d.target || d.target === 'all') {
    payload.conditions = []
  } else if (d.target.startsWith('brand:')) {
    payload.conditions = [{ field: 'brands', mode: 'include', values: [d.target.slice(6).trim()] }]
  } else if (d.target.startsWith('subtotal:')) {
    const amount = d.target.slice(9).trim()
    payload.conditions = [{ field: 'subtotal', mode: 'include', values: [amount], operator: '>=' }]
  } else {
    payload.conditions = [{ field: 'categories', mode: 'include', values: [d.target] }]
  }

  return payload
}

function autoName(d) {
  const typeLabel = TYPE_CHIPS.find(c => c.value === d.type)?.label ?? 'Promotion'
  const val = d.value ? ` ${d.value}%` : ''
  return `${typeLabel}${val}`
}

async function confirmCreate() {
  creating.value = true
  try {
    const payload = buildPayload()
    await promotionsStore.create(payload)
    promotionsStore.resetDraft()
    uiStore.wizardReset()
    router.push('/promotions')
  } finally {
    creating.value = false
  }
}

function confirmEdit() {
  uiStore.applyWizardDraft()
  uiStore.wizardReset()
  router.push('/promotions/new')
}

onMounted(() => {
  if (!templatesStore.items.length) templatesStore.fetchAll()
})
</script>
