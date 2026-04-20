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
            <v-col cols="12">
              <v-select
                v-model="draft.type"
                :items="ruleTypeItems"
                label="Rule type *"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>

          <!-- Rule scope -->
          <div class="mb-4">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">RULE SCOPE</div>
            <v-btn-toggle
              v-model="draft.scope"
              mandatory
              density="compact"
              variant="outlined"
              color="primary"
              class="mb-1"
            >
              <v-btn value="cart" size="small" prepend-icon="mdi-cart-outline">Cart</v-btn>
              <v-btn value="item" size="small" prepend-icon="mdi-package-variant">Item</v-btn>
            </v-btn-toggle>
            <div class="text-caption text-medium-emphasis mt-1">
              <template v-if="draft.scope === 'cart'">
                Discount and conditions apply to the whole cart.
              </template>
              <template v-else>
                Discount and conditions apply per item / line.
              </template>
            </div>
          </div>

          <v-row dense>
            <v-col cols="6">
              <v-date-input
                :model-value="draft.startDate"
                label="Start date"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar"
                prepend-icon=""
                clearable
                @update:model-value="draft.startDate = toIsoDate($event)"
              />
            </v-col>
            <v-col cols="6">
              <v-date-input
                :model-value="draft.endDate"
                label="End date"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar"
                prepend-icon=""
                clearable
                @update:model-value="draft.endDate = toIsoDate($event)"
              />
            </v-col>
          </v-row>

          <!-- Schedule pausing -->
          <div class="mt-3">
            <v-checkbox
              v-model="draft.pauseScheduled"
              label="Schedule rule pausing"
              density="compact"
              hide-details
              color="warning"
              class="mb-1"
            />
            <template v-if="draft.pauseScheduled">
              <v-alert
                v-if="pauseAdjustWarning"
                type="warning"
                variant="tonal"
                density="compact"
                icon="mdi-clock-alert-outline"
                class="mb-3 text-caption"
                closable
                @click:close="pauseAdjustWarning = false"
              >
                Rule dates have changed — please review the scheduled pause period to ensure it still falls within the active range.
              </v-alert>
              <v-row dense class="mt-2">
                <v-col cols="6">
                  <v-date-input
                    :model-value="draft.pauseStart"
                    label="Pause from *"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-calendar"
                    prepend-icon=""
                    clearable
                    :allowed-dates="pauseStartAllowedDates"
                    :error-messages="pauseErrors.pauseStart"
                    @update:model-value="draft.pauseStart = toIsoDate($event)"
                  />
                </v-col>
                <v-col cols="6">
                  <v-date-input
                    :model-value="draft.pauseEnd"
                    label="Pause until *"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-calendar"
                    prepend-icon=""
                    clearable
                    :allowed-dates="pauseEndAllowedDates"
                    :error-messages="pauseErrors.pauseEnd"
                    @update:model-value="draft.pauseEnd = toIsoDate($event)"
                  />
                </v-col>
              </v-row>
              <div class="text-caption text-medium-emphasis mt-1">
                While in Active status, the rule will be automatically paused during this period.
                Pause must fall within the rule's start and end date.
              </div>
            </template>
          </div>

          <!-- Channels -->
          <div class="mt-4">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">SALES CHANNELS</div>
            <v-btn-toggle
              :model-value="draft.channels"
              multiple
              density="compact"
              variant="outlined"
              color="primary"
              class="mb-1"
              @update:model-value="draft.channels = $event"
            >
              <v-btn
                v-for="ch in channelOptions"
                :key="ch.value"
                :value="ch.value"
                size="small"
                :prepend-icon="ch.icon"
              >{{ ch.title }}</v-btn>
            </v-btn-toggle>
            <div v-if="!draft.channels.length" class="text-caption text-error mt-1">
              At least one channel must be selected.
            </div>
          </div>

        </v-card>

        <!-- Discount configuration (orange) -->
        <v-card v-if="draft.type === 'discount'" border elevation="0" class="pa-5 mt-4">
          <div class="d-flex align-center mb-3">
            <v-icon color="orange-darken-2" size="18" class="mr-2">mdi-tag-outline</v-icon>
            <span class="text-body-1 font-weight-bold text-orange-darken-2">Discount Configuration</span>
          </div>
          <v-row dense>
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
        </v-card>

        <!-- Step Discount configuration (green) -->
        <v-card v-if="draft.type === 'step_discount'" border elevation="0" class="pa-5 mt-4">
          <div class="d-flex align-center mb-3">
            <v-icon color="green-darken-2" size="18" class="mr-2">mdi-stairs</v-icon>
            <span class="text-body-1 font-weight-bold text-green-darken-2">Step Discount Configuration</span>
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
        </v-card>

        <!-- Multi-buy configuration (blue) -->
        <v-card v-if="draft.type === 'multi_buy'" border elevation="0" class="pa-5 mt-4">
          <div class="d-flex align-center mb-3">
            <v-icon color="blue-darken-2" size="18" class="mr-2">mdi-cart-plus</v-icon>
            <span class="text-body-1 font-weight-bold text-blue-darken-2">Multi-buy Configuration</span>
          </div>
          <v-row dense class="mb-3">
            <v-col cols="6">
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
            <v-col cols="6">
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
          <div class="d-flex align-center gap-2 mt-3">
            <v-icon size="16" color="medium-emphasis">mdi-calculator</v-icon>
            <span class="text-caption text-medium-emphasis">Free item accounting price</span>
            <v-chip size="small" color="primary" variant="tonal">€{{ settingsStore.multiBuyFreePrice }}</v-chip>
            <v-btn variant="text" size="x-small" color="primary" to="/settings/accounting" class="ml-1">
              Configure
            </v-btn>
          </div>
        </v-card>

        <!-- Gift trigger configuration (purple) -->
        <v-card v-if="draft.type === 'gift'" border elevation="0" class="pa-5 mt-4">
          <div class="d-flex align-center mb-3">
            <v-icon color="purple-darken-2" size="18" class="mr-2">mdi-gift</v-icon>
            <span class="text-body-1 font-weight-bold text-purple-darken-2">Gift Trigger</span>
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
          <div class="d-flex align-center gap-2 mt-3">
            <v-icon size="16" color="medium-emphasis">mdi-calculator</v-icon>
            <span class="text-caption text-medium-emphasis">Gift item accounting price</span>
            <v-chip size="small" color="purple" variant="tonal">€{{ settingsStore.giftFreePrice }}</v-chip>
            <v-btn variant="text" size="x-small" color="primary" to="/settings/accounting" class="ml-1">
              Configure
            </v-btn>
          </div>
        </v-card>

        <!-- Gift items (below gift trigger card) -->
        <div v-if="draft.type === 'gift'" class="mt-4">
          <GiftItemsSection v-model="draft.gifts" />
          <ConflictWarningBanner :conflicts="giftConflicts" />
        </div>

        <!-- Descriptions & Legal texts -->
        <v-card border elevation="0" class="pa-5 mt-4">
          <div class="text-body-1 font-weight-bold mb-4">Descriptions & Legal</div>
          <v-textarea
            v-model="draft.description"
            label="Internal Description"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hint="What the promotion does (for internal use only)"
            persistent-hint
            class="mb-3"
          />
          <div class="text-caption font-weight-bold text-medium-emphasis mb-3">CUSTOMER-FACING DESCRIPTION</div>
          <v-text-field
            v-model="draft.promotionTitle"
            label="Promotion title"
            variant="outlined"
            density="compact"
            hint="Short headline shown to customers (e.g. '20% off Vichy')"
            persistent-hint
            class="mb-3"
          />
          <v-textarea
            v-model="draft.promotionText"
            label="Promotion text"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hint="Main description displayed on the storefront"
            persistent-hint
            class="mb-3"
          />
          <v-textarea
            v-model="draft.promotionLegal"
            label="Promotion legal"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hint="Terms and conditions, fine print"
            persistent-hint
          />
        </v-card>

        <!-- Conditions -->
        <v-card border elevation="0" class="pa-5 mt-4">
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
              :scope="draft.scope"
              @edit="openEditCondition(idx)"
              @remove="removeCondition(idx)"
            />
          </div>

          <v-alert v-else type="info" variant="tonal" density="compact" icon="mdi-information">
            No conditions set — this rule applies to all products.
          </v-alert>

          <ReachEstimateBar :conditions="draft.conditions" :scope="draft.scope" class="mt-3" />

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
      </v-col>

      <!-- Right: Status + Stacking -->
      <v-col cols="12" md="5">
        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="text-body-1 font-weight-bold mb-4">Status</div>
          <v-select
            v-model="draft.status"
            :items="statusItems"
            :disabled="draft.status === 'scheduled' || draft.status === 'ended'"
            variant="outlined"
            density="compact"
            hide-details
          />
          <div v-if="draft.status === 'scheduled'" class="text-caption text-medium-emphasis mt-2">
            Status is controlled by start date.
          </div>
          <div v-if="draft.status === 'ended'" class="text-caption text-medium-emphasis mt-2">
            Rule has ended. Clear the end date to reactivate.
          </div>
        </v-card>

        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="text-body-1 font-weight-bold mb-4">Stacking group</div>
          <StackingGroupSelect v-model="draft.stackingGroupId" />
        </v-card>

        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="text-body-1 font-weight-bold mb-4">Processing order</div>
          <ProcessingOrderSelect
            :stacking-group-id="draft.stackingGroupId"
            :priority="draft.priority"
            :current-name="draft.name"
            @update:priority="draft.priority = $event"
          />
        </v-card>

        <v-card border elevation="0" class="pa-5 mb-4">
          <div class="text-body-1 font-weight-bold mb-1">Non-combinable rules</div>
          <p class="text-caption text-medium-emphasis mb-4">
            Rules and groups listed here cannot apply together with this rule in the same cart.
          </p>
          <NonCombinableRulesSection v-model="draft.nonCombinableRules" />
        </v-card>

        <TagsSection v-model="draft.tags" />
      </v-col>
    </v-row>

    <v-snackbar :model-value="!!saveError" color="error" timeout="6000" @update:model-value="saveError = null">{{ saveError }}</v-snackbar>

    <!-- Condition builder dialog -->
    <ConditionBuilderDialog
      v-model="conditionDialogOpen"
      :initial-condition="editingCondition"
      :scope="draft.scope"
      @save="onConditionSave"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePromotionsStore } from '../../stores/promotions'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { useUiStore } from '../../stores/ui'
import { useSettingsStore } from '../../stores/settings'
import { validateConditions } from '../../utils/conditionValidator'
import { detectGiftConflicts } from '../../utils/giftConflictDetector'
import ConditionChip from './ConditionChip.vue'
import ConditionBuilderDialog from './ConditionBuilderDialog.vue'
import ReachEstimateBar from './ReachEstimateBar.vue'
import StepDiscountEditor from './StepDiscountEditor.vue'
import GiftItemsSection from './GiftItemsSection.vue'
import ConflictWarningBanner from './ConflictWarningBanner.vue'
import StackingGroupSelect from './StackingGroupSelect.vue'
import ProcessingOrderSelect from './ProcessingOrderSelect.vue'
import NonCombinableRulesSection from './NonCombinableRulesSection.vue'
import TagsSection from './TagsSection.vue'

const route = useRoute()
const router = useRouter()
const store = usePromotionsStore()
const sgStore = useStackingGroupsStore()
const uiStore = useUiStore()
const settingsStore = useSettingsStore()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const saveError = ref(null)
const conditionDialogOpen = ref(false)
const validationErrors = ref({})
const editingCondition = ref(null)
const editingConditionIdx = ref(null)
const pauseAdjustWarning = ref(false)
const pauseErrors = ref({})

const draft = store.formDraft

const today = new Date(new Date().toDateString())

function isFutureDate(dateStr) {
  return !!dateStr && new Date(dateStr) > today
}

function isPastDate(dateStr) {
  return !!dateStr && new Date(dateStr) < today
}

function resolveStatus(currentStatus, startDate, endDate, pauseScheduled, pauseStart, pauseEnd) {
  if (isPastDate(endDate)) return 'ended'
  if (isFutureDate(startDate)) return 'scheduled'
  if (currentStatus === 'scheduled' || currentStatus === 'ended') return 'active'
  if (pauseScheduled && pauseStart && pauseEnd) {
    const now = new Date(new Date().toDateString())
    const ps = new Date(pauseStart)
    const pe = new Date(pauseEnd)
    if (now >= ps && now <= pe && currentStatus === 'active') return 'paused'
  }
  return currentStatus
}

function validatePause() {
  const errors = {}
  if (!draft.pauseScheduled) return errors
  if (!draft.pauseStart) errors.pauseStart = 'Pause start date is required'
  if (!draft.pauseEnd) errors.pauseEnd = 'Pause end date is required'
  if (draft.pauseStart && draft.pauseEnd && draft.pauseStart >= draft.pauseEnd) {
    errors.pauseEnd = 'Pause end must be after pause start'
  }
  if (draft.pauseStart && draft.startDate && draft.pauseStart < draft.startDate) {
    errors.pauseStart = 'Pause must start on or after rule start date'
  }
  if (draft.pauseEnd && draft.endDate && draft.pauseEnd > draft.endDate) {
    errors.pauseEnd = 'Pause must end on or before rule end date'
  }
  if (draft.pauseStart && !draft.startDate) {
    errors.pauseStart = 'Rule start date must be set before scheduling a pause'
  }
  if (draft.pauseEnd && !draft.endDate) {
    errors.pauseEnd = 'Rule end date must be set before scheduling a pause'
  }
  return errors
}

watch(() => draft.startDate, () => {
  draft.status = resolveStatus(draft.status, draft.startDate, draft.endDate, draft.pauseScheduled, draft.pauseStart, draft.pauseEnd)
  if (draft.pauseScheduled && (draft.pauseStart || draft.pauseEnd)) {
    pauseAdjustWarning.value = true
  }
})

watch(() => draft.endDate, () => {
  draft.status = resolveStatus(draft.status, draft.startDate, draft.endDate, draft.pauseScheduled, draft.pauseStart, draft.pauseEnd)
  if (draft.pauseScheduled && (draft.pauseStart || draft.pauseEnd)) {
    pauseAdjustWarning.value = true
  }
})

watch(() => draft.pauseScheduled, (val) => {
  if (!val) {
    draft.pauseStart = null
    draft.pauseEnd = null
    pauseErrors.value = {}
    pauseAdjustWarning.value = false
  }
})

function toIsoDate(val) {
  if (!val) return null
  if (typeof val === 'string') return val.split('T')[0]
  const d = new Date(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function pauseStartAllowedDates(d) {
  const iso = toIsoDate(d)
  if (!iso) return false
  if (draft.startDate && iso < draft.startDate) return false
  if (draft.endDate && iso > draft.endDate) return false
  if (draft.pauseEnd && iso > draft.pauseEnd) return false
  return true
}

function pauseEndAllowedDates(d) {
  const iso = toIsoDate(d)
  if (!iso) return false
  if (draft.startDate && iso < draft.startDate) return false
  if (draft.endDate && iso > draft.endDate) return false
  if (draft.pauseStart && iso < draft.pauseStart) return false
  return true
}

const statusItems = [
  { value: 'active', title: 'Active' },
  { value: 'draft',  title: 'Draft' },
  { value: 'paused', title: 'Paused' },
]

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

const channelOptions = [
  { value: 'web', title: 'Web', icon: 'mdi-web' },
  { value: 'mobile_app', title: 'Mobile App', icon: 'mdi-cellphone' },
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
  const pErrors = validatePause()
  pauseErrors.value = pErrors
  return Object.keys(errors).length === 0 && Object.keys(pErrors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  saveError.value = null
  try {
    const payload = JSON.parse(JSON.stringify(toRaw(draft)))
    payload.status = resolveStatus(payload.status, payload.startDate, payload.endDate, payload.pauseScheduled, payload.pauseStart, payload.pauseEnd)
    if (isEdit.value) {
      await store.update(route.params.id, payload)
    } else {
      await store.create(payload)
    }
    router.push('/promotions')
  } catch (e) {
    saveError.value = e?.response?.data?.error ?? e?.message ?? 'Failed to save rule'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    sgStore.fetchAll(),
    store.fetchAll(),
  ])
  if (isEdit.value) {
    await store.fetchOne(route.params.id)
  } else if (!route.query.fromTemplate) {
    store.resetDraft()
  }
})

defineExpose({ store })
</script>
