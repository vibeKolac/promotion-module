<!-- src/components/promotions/PromotionForm.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <!-- Breadcrumb -->
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <!-- Title + actions -->
    <div class="d-flex align-center flex-wrap mb-5 gap-3">
      <h1 class="text-h5 font-weight-bold">{{ isEdit ? 'Edit promotion rule' : 'New promotion rule' }}</h1>
      <v-spacer />
      <v-btn variant="outlined" to="/promotions" class="text-uppercase">Discard</v-btn>
      <v-btn color="primary" class="text-uppercase" :loading="saving" data-testid="save-btn" @click="save">Save rule</v-btn>
    </div>

    <!-- AI Assistant banner -->
    <v-alert
      color="primary"
      variant="tonal"
      icon="mdi-creation"
      class="mb-5"
      density="compact"
    >
      <div class="d-flex align-center">
        <div class="flex-grow-1">
          <strong>AI Assistant</strong> — type a description like "20% off Nike over $100" and I'll fill the form.
        </div>
        <v-btn variant="outlined" color="primary" size="small" class="ml-4" @click="uiStore.openAiPanel()">
          Open Chat
        </v-btn>
      </div>
    </v-alert>

    <!-- Two-column grid -->
    <v-row class="mb-4">
      <!-- Left: Basic info -->
      <v-col cols="12" md="7">
        <v-card border elevation="0" class="pa-5">
          <div class="text-body-1 font-weight-bold mb-4">Basic information</div>

          <v-text-field
            v-model="draft.name"
            label="Rule name *"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <div v-if="validationErrors.name" class="text-caption text-error mt-1 mb-2">{{ validationErrors.name }}</div>

          <v-row dense class="mb-3">
            <v-col cols="6">
              <v-select
                v-model="draft.type"
                :items="ruleTypeItems"
                label="Rule type *"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="draft.priority"
                label="Priority"
                type="number"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>

          <!-- Discount value (discount type only) -->
          <v-row v-if="draft.type === 'discount'" dense class="mb-3">
            <v-col cols="8">
              <v-text-field
                v-model="draft.value"
                label="Discount amount *"
                type="number"
                variant="outlined"
                density="compact"
              />
              <div v-if="validationErrors.value" class="text-caption text-error mt-1">{{ validationErrors.value }}</div>
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="draft.amountType"
                :items="amountTypeItems"
                label="Amount type"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="draft.startDate"
                label="Start date"
                type="date"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="draft.endDate"
                label="End date"
                type="date"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>

          <!-- Step Discount configuration (green) -->
          <template v-if="draft.type === 'step_discount'">
            <v-divider class="my-4" />
            <div class="d-flex align-center mb-3">
              <v-icon color="green-darken-2" size="18" class="mr-2">mdi-stairs</v-icon>
              <span class="text-body-2 font-weight-bold text-green-darken-2">Step Discount Configuration</span>
            </div>
            <v-row dense class="mb-3">
              <v-col cols="6">
                <v-select
                  v-model="draft.stepType"
                  :items="[{ value: 'SPENT', title: 'Amount spent (€)' }, { value: 'QTY', title: 'Quantity' }]"
                  label="Step type"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="draft.stepMaxSteps"
                  label="Max steps"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hint="0 = unlimited"
                  persistent-hint
                />
              </v-col>
            </v-row>
            <v-row dense class="mb-3">
              <v-col cols="8">
                <v-text-field
                  v-model="draft.value"
                  label="Discount amount per step *"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="draft.amountType"
                  :items="amountTypeItems"
                  label="Amount type"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">DISCOUNT TIERS</div>
            <StepDiscountEditor v-model="draft.steps" />
            <v-alert
              v-if="draft.value && draft.stepType"
              color="green-lighten-4"
              variant="flat"
              density="compact"
              icon="mdi-information-outline"
              class="mt-3 text-caption"
            >
              Example: {{ draft.stepType === 'SPENT' ? 'Spend €X' : 'Buy X items' }}, get
              {{ draft.amountType?.startsWith('PERCENT') ? draft.value + '%' : '€' + draft.value }} off
              {{ draft.amountType?.endsWith('LINE') ? 'each line' : 'cart total' }}.
              Repeats up to {{ draft.stepMaxSteps || '∞' }} time(s).
            </v-alert>
          </template>

          <!-- Multi-buy configuration (blue) -->
          <template v-if="draft.type === 'multi_buy'">
            <v-divider class="my-4" />
            <div class="d-flex align-center mb-3">
              <v-icon color="blue-darken-2" size="18" class="mr-2">mdi-cart-plus</v-icon>
              <span class="text-body-2 font-weight-bold text-blue-darken-2">Multi-buy Configuration</span>
            </div>
            <v-row dense class="mb-3">
              <v-col cols="4">
                <v-text-field
                  v-model.number="draft.multiBuyQty"
                  label="Buy quantity *"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hint="Items customer must buy"
                  persistent-hint
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="draft.multiFreeQty"
                  label="Free quantity *"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hint="Items given free"
                  persistent-hint
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="draft.multiFreePrice"
                  label="Free item price"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hint="Accounting price (€0.01)"
                  persistent-hint
                />
              </v-col>
            </v-row>
            <v-row dense class="mb-3">
              <v-col cols="6">
                <v-select
                  v-model="draft.multiSelectionMode"
                  :items="[{ value: 'CHEAPEST', title: 'Cheapest items free' }, { value: 'MOST_EXPENSIVE', title: 'Most expensive items free' }]"
                  label="Free item selection"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="draft.multiMaxSteps"
                  label="Max steps"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hint="0 = unlimited"
                  persistent-hint
                />
              </v-col>
            </v-row>
            <v-alert
              v-if="draft.multiBuyQty && draft.multiFreeQty"
              color="blue-lighten-4"
              variant="flat"
              density="compact"
              icon="mdi-information-outline"
              class="mt-2 text-caption"
            >
              Buy {{ draft.multiBuyQty }}, get {{ draft.multiFreeQty }} free
              ({{ draft.multiSelectionMode === 'CHEAPEST' ? 'cheapest' : 'most expensive' }}).
              Repeats up to {{ draft.multiMaxSteps || '∞' }} time(s).
            </v-alert>
          </template>

          <!-- Gift trigger configuration (purple) -->
          <template v-if="draft.type === 'gift'">
            <v-divider class="my-4" />
            <div class="d-flex align-center mb-3">
              <v-icon color="purple-darken-2" size="18" class="mr-2">mdi-gift</v-icon>
              <span class="text-body-2 font-weight-bold text-purple-darken-2">Gift Trigger</span>
            </div>
            <v-row dense>
              <v-col cols="5">
                <v-select
                  v-model="draft.giftStepType"
                  :items="[{ value: 'SPENT', title: 'Amount spent' }, { value: 'QTY', title: 'Quantity' }]"
                  label="Trigger type"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="draft.giftStepValue"
                  label="Threshold"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="draft.giftMaxSteps"
                  label="Max gifts"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
          </template>
        </v-card>

        <!-- Gift items (below basic info card, full width of left col) -->
        <div v-if="draft.type === 'gift'" class="mt-4">
          <GiftItemsSection v-model="draft.gifts" />
          <ConflictWarningBanner :conflicts="giftConflicts" />
        </div>
      </v-col>

      <!-- Right: Status + Stacking -->
      <v-col cols="12" md="5">
        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="text-body-1 font-weight-bold mb-4">Status</div>
          <div class="d-flex align-center justify-space-between">
            <span class="text-body-2">Rule is active</span>
            <v-switch
              v-model="isActive"
              color="primary"
              hide-details
              density="compact"
              inset
            />
          </div>
        </v-card>

        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="text-body-1 font-weight-bold mb-4">Advanced</div>
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <div class="text-body-2">Exclusive rule</div>
              <div class="text-caption text-medium-emphasis">Doesn't stack with any other rule</div>
            </div>
            <v-switch v-model="draft.exclusive" color="primary" hide-details density="compact" inset />
          </div>
          <v-text-field
            v-model.number="draft.processingOrder"
            label="Processing order"
            type="number"
            variant="outlined"
            density="compact"
            hint="Lower = evaluated first"
            persistent-hint
          />
        </v-card>

        <v-card border elevation="0" class="pa-5">
          <div class="text-body-1 font-weight-bold mb-4">Stacking group</div>
          <StackingGroupSelect v-model="draft.stackingGroupId" />
        </v-card>
      </v-col>
    </v-row>

    <!-- Conditions -->
    <v-card border elevation="0" class="pa-5 mb-4">
      <div class="d-flex align-center mb-4">
        <span class="text-body-1 font-weight-bold flex-grow-1">Targeting conditions</span>
        <v-btn
          prepend-icon="mdi-plus"
          variant="outlined"
          color="primary"
          size="small"
          class="text-uppercase"
          @click="openAddCondition"
        >
          Add condition
        </v-btn>
      </div>

      <div v-if="draft.conditions.length" class="d-flex flex-wrap gap-2 mb-4">
        <ConditionChip
          v-for="(cond, idx) in draft.conditions"
          :key="cond.id"
          :condition="cond"
          @edit="openEditCondition(idx)"
          @remove="removeCondition(idx)"
        />
      </div>

      <v-alert v-else type="info" variant="tonal" density="compact" icon="mdi-information">
        No conditions set — this rule applies to all products.
      </v-alert>

      <ReachEstimateBar :conditions="draft.conditions" class="mt-3" />

      <!-- Validation feedback -->
      <template v-if="conditionValidation.warnings.length || conditionValidation.suggestions.length">
        <v-alert
          v-if="conditionValidation.warnings.length"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          <ul class="ma-0 pl-4">
            <li v-for="w in conditionValidation.warnings" :key="w">{{ w }}</li>
          </ul>
        </v-alert>
        <v-alert
          v-if="conditionValidation.suggestions.length"
          color="purple"
          variant="tonal"
          density="compact"
          icon="mdi-lightbulb"
          class="mt-2"
        >
          <ul class="ma-0 pl-4">
            <li v-for="s in conditionValidation.suggestions" :key="s">{{ s }}</li>
          </ul>
        </v-alert>
      </template>
    </v-card>

    <!-- Condition builder dialog -->
    <ConditionBuilderDialog
      v-model="conditionDialogOpen"
      :initial-condition="editingCondition"
      @save="onConditionSave"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePromotionsStore } from '../../stores/promotions'
import { useUiStore } from '../../stores/ui'
import { validateConditions } from '../../utils/conditionValidator'
import { detectGiftConflicts } from '../../utils/giftConflictDetector'
import ConditionChip from './ConditionChip.vue'
import ConditionBuilderDialog from './ConditionBuilderDialog.vue'
import ReachEstimateBar from './ReachEstimateBar.vue'
import StepDiscountEditor from './StepDiscountEditor.vue'
import GiftItemsSection from './GiftItemsSection.vue'
import ConflictWarningBanner from './ConflictWarningBanner.vue'
import StackingGroupSelect from './StackingGroupSelect.vue'

const route = useRoute()
const router = useRouter()
const store = usePromotionsStore()
const uiStore = useUiStore()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const conditionDialogOpen = ref(false)
const validationErrors = ref({})
const editingCondition = ref(null)
const editingConditionIdx = ref(null)

const draft = store.formDraft

const isActive = computed({
  get: () => draft.status === 'active',
  set: (v) => { draft.status = v ? 'active' : 'inactive' },
})

const ruleTypeItems = [
  { value: 'discount', title: 'Discount' },
  { value: 'step_discount', title: 'Step Discount' },
  { value: 'multi_buy', title: 'Multi-buy' },
  { value: 'gift', title: 'Gift' },
]

const amountTypeItems = [
  { value: 'PERCENT_CART', title: '% off cart' },
  { value: 'FIXED_CART', title: '€ off cart' },
  { value: 'PERCENT_LINE', title: '% off line' },
  { value: 'FIXED_LINE', title: '€ off line' },
]

const breadcrumbs = computed(() => [
  { title: 'Promotions', to: '/promotions' },
  { title: isEdit.value ? 'Edit rule' : 'New promotion rule', disabled: true },
])

const conditionValidation = computed(() => validateConditions(draft.conditions))
const giftConflicts = computed(() => detectGiftConflicts(draft.gifts, draft.conditions))

function openAddCondition() {
  editingCondition.value = null
  editingConditionIdx.value = null
  conditionDialogOpen.value = true
}

function openEditCondition(idx) {
  editingCondition.value = { ...draft.conditions[idx] }
  editingConditionIdx.value = idx
  conditionDialogOpen.value = true
}

function removeCondition(idx) {
  draft.conditions.splice(idx, 1)
}

function onConditionSave(condition) {
  if (editingConditionIdx.value !== null) {
    draft.conditions[editingConditionIdx.value] = condition
  } else {
    draft.conditions.push(condition)
  }
}

function validate() {
  const errors = {}
  if (!draft.name?.trim()) errors.name = 'Rule name is required'
  if (draft.type === 'discount' && !draft.value) errors.value = 'Discount value is required'
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = { ...draft }
    if (isEdit.value) {
      await store.update(route.params.id, payload)
    } else {
      await store.create(payload)
    }
    router.push('/promotions')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    await store.fetchOne(route.params.id)
  } else {
    store.resetDraft()
  }
})

defineExpose({ store })
</script>
