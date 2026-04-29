<!-- src/components/promotions/ConditionBuilderDialog.vue -->
<template>
  <DialogCard :model-value="modelValue" max-width="580" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>
      {{ isEditMode ? 'Edit condition' : 'Add condition' }}
      <span v-if="!isEditMode" class="text-caption text-medium-emphasis ml-2">Step {{ step }} of 2</span>
    </template>

    <!-- ── Step 1: Type multi-selector ───────────────────────────────────── -->
    <v-card-text v-if="step === 1" class="pa-5 pt-2">
      <div class="text-caption text-medium-emphasis mb-3">
        Select one or more condition types, then configure them in the next step.
      </div>
      <div v-for="cat in conditionCategories" :key="cat.key" class="mb-4">
        <div class="d-flex align-center gap-2 mb-2">
          <v-icon :icon="cat.icon" size="18" color="primary" />
          <div>
            <div class="text-body-2 font-weight-bold">{{ cat.label }}</div>
            <div class="text-caption text-medium-emphasis">{{ cat.description }}</div>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            v-for="type in cat.types"
            :key="type.value"
            variant="outlined"
            size="small"
            :color="selectedFields.includes(type.value) ? 'primary' : undefined"
            :class="selectedFields.includes(type.value) ? 'border-primary' : ''"
            @click="toggleField(type.value)"
          >
            {{ type.title }}
            <v-icon v-if="selectedFields.includes(type.value)" icon="mdi-check" size="14" class="ml-1" />
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <!-- ── Step 2: Configure ─────────────────────────────────────────────── -->
    <v-card-text v-else class="pa-5 pt-2" style="max-height: 65vh; overflow-y: auto;">

      <!-- Single condition: flat UI -->
      <template v-if="selectedFields.length === 1">
        <div class="d-flex align-center gap-2 mb-4">
          <v-chip color="primary" variant="tonal" size="small" label>
            {{ getTypeDef(selectedFields[0])?.title }}
          </v-chip>
          <v-btn v-if="!isEditMode" variant="text" size="x-small" prepend-icon="mdi-arrow-left" @click="step = 1">
            Change type
          </v-btn>
        </div>

        <!-- Scope banner -->
        <v-alert
          v-if="getTypeDef(selectedFields[0])?.quantifiable"
          :color="scope === 'item' ? 'deep-purple' : 'blue'"
          variant="tonal"
          density="compact"
          :icon="scope === 'item' ? 'mdi-package-variant' : 'mdi-cart'"
          class="mb-3 text-caption"
        >
          <strong>{{ scope === 'item' ? 'Item scope' : 'Cart scope' }}</strong>
          — {{ getScopeHint(selectedFields[0]) }}
        </v-alert>

        <!-- Mode toggle -->
        <div v-if="getTypeDef(selectedFields[0])?.supportsMode" class="mb-3">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-1">MODE</div>
          <v-btn-toggle v-model="localConditions[selectedFields[0]].mode" mandatory density="compact" variant="outlined" color="primary">
            <v-btn value="include" size="small">Include</v-btn>
            <v-btn value="exclude" size="small">Exclude</v-btn>
          </v-btn-toggle>
        </div>

        <!-- Operator -->
        <SelectInput
          v-if="getTypeDef(selectedFields[0])?.quantifiable"
          v-model="localConditions[selectedFields[0]].operator"
          :data="operatorItems"
          label="Operator"
          class="mb-3"
        />

        <!-- Boolean toggle -->
        <div v-if="getTypeDef(selectedFields[0])?.boolean" class="d-flex align-center justify-space-between mb-3 pa-3 rounded border">
          <span class="text-body-2">{{ getTypeDef(selectedFields[0])?.title }}</span>
          <v-switch
            :model-value="localConditions[selectedFields[0]].values[0] === 'true'"
            color="primary"
            hide-details
            density="compact"
            inset
            @update:model-value="v => localConditions[selectedFields[0]].values = [String(v)]"
          />
        </div>

        <!-- Values picker -->
        <ValuesPickerPanel
          v-else-if="!getTypeDef(selectedFields[0])?.quantifiable"
          v-model="localConditions[selectedFields[0]].values"
          :options="getTypeOptions(selectedFields[0])"
          :label="getTypeDef(selectedFields[0])?.title"
          class="mb-3"
        />

        <!-- Numeric input -->
        <NumberInput
          v-else
          :model-value="localConditions[selectedFields[0]].values[0] ?? ''"
          :label="getQuantifiableLabel(selectedFields[0])"
          :help-text="getQuantifiableHint(selectedFields[0])"
          class="mb-3"
          @update:model-value="v => localConditions[selectedFields[0]].values = [v]"
        />
      </template>

      <!-- Multiple conditions: expansion panels -->
      <template v-else>
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="text-body-2 text-medium-emphasis">
            Configuring {{ selectedFields.length }} conditions
          </span>
          <v-btn variant="text" size="x-small" prepend-icon="mdi-arrow-left" @click="step = 1">
            Edit selection
          </v-btn>
        </div>

        <v-expansion-panels v-model="openPanels" multiple variant="accordion">
          <v-expansion-panel
            v-for="field in selectedFields"
            :key="field"
            :value="field"
          >
            <v-expansion-panel-title density="compact">
              <div class="d-flex align-center gap-2 w-100">
                <v-chip color="primary" variant="tonal" size="x-small" label>
                  {{ getTypeDef(field)?.title }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">
                  {{ conditionSummary(localConditions[field]) }}
                </span>
                <v-icon
                  v-if="hasError(field)"
                  icon="mdi-alert-circle"
                  size="14"
                  color="error"
                  class="ml-auto mr-2"
                />
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text class="pt-3">
              <!-- Scope banner -->
              <v-alert
                v-if="getTypeDef(field)?.quantifiable"
                :color="scope === 'item' ? 'deep-purple' : 'blue'"
                variant="tonal"
                density="compact"
                :icon="scope === 'item' ? 'mdi-package-variant' : 'mdi-cart'"
                class="mb-3 text-caption"
              >
                <strong>{{ scope === 'item' ? 'Item scope' : 'Cart scope' }}</strong>
                — {{ getScopeHint(field) }}
              </v-alert>

              <!-- Mode toggle -->
              <div v-if="getTypeDef(field)?.supportsMode" class="mb-3">
                <div class="text-caption font-weight-bold text-medium-emphasis mb-1">MODE</div>
                <v-btn-toggle v-model="localConditions[field].mode" mandatory density="compact" variant="outlined" color="primary">
                  <v-btn value="include" size="small">Include</v-btn>
                  <v-btn value="exclude" size="small">Exclude</v-btn>
                </v-btn-toggle>
              </div>

              <!-- Operator -->
              <SelectInput
                v-if="getTypeDef(field)?.quantifiable"
                v-model="localConditions[field].operator"
                :data="operatorItems"
                label="Operator"
                class="mb-3"
              />

              <!-- Boolean toggle -->
              <div v-if="getTypeDef(field)?.boolean" class="d-flex align-center justify-space-between mb-3 pa-3 rounded border">
                <span class="text-body-2">{{ getTypeDef(field)?.title }}</span>
                <v-switch
                  :model-value="localConditions[field].values[0] === 'true'"
                  color="primary"
                  hide-details
                  density="compact"
                  inset
                  @update:model-value="v => localConditions[field].values = [String(v)]"
                />
              </div>

              <!-- Values picker -->
              <ValuesPickerPanel
                v-else-if="!getTypeDef(field)?.quantifiable"
                v-model="localConditions[field].values"
                :options="getTypeOptions(field)"
                :label="getTypeDef(field)?.title"
                class="mb-3"
              />

              <!-- Numeric input -->
              <NumberInput
                v-else
                :model-value="localConditions[field].values[0] ?? ''"
                :label="getQuantifiableLabel(field)"
                :help-text="getQuantifiableHint(field)"
                class="mb-3"
                @update:model-value="v => localConditions[field].values = [v]"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>

      <!-- Validation errors -->
      <v-alert v-if="showErrors && validationErrors.length" type="error" variant="tonal" density="compact" class="mt-3">
        <ul class="ma-0 pl-4">
          <li v-for="e in validationErrors" :key="e">{{ e }}</li>
        </ul>
      </v-alert>
    </v-card-text>

    <template #actions>
      <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
      <v-btn
        v-if="step === 1"
        color="primary"
        variant="flat"
        :disabled="!selectedFields.length"
        @click="step = 2"
      >
        Next
      </v-btn>
      <v-btn v-else color="primary" variant="flat" @click="handleSave">
        {{ saveLabel }}
      </v-btn>
    </template>
  </DialogCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuid } from 'uuid'
import { validateCondition } from '../../utils/conditionValidator'
import DialogCard from '../_common/DialogCard.vue'
import SelectInput from '../_common/SelectInput.vue'
import NumberInput from '../_common/NumberInput.vue'
import ValuesPickerPanel from './ValuesPickerPanel.vue'

// ─── Type definitions ──────────────────────────────────────────────────────

const CONDITION_TYPES = [
  { value: 'categories',      title: 'Categories',      supportsMode: true,  quantifiable: false },
  { value: 'brands',          title: 'Brands',          supportsMode: true,  quantifiable: false },
  { value: 'skus',            title: 'SKUs',            supportsMode: true,  quantifiable: false },
  { value: 'product_lines',   title: 'Product lines',   supportsMode: true,  quantifiable: false },
  { value: 'subtotal',        title: 'Subtotal',        supportsMode: false, quantifiable: true  },
  { value: 'quantity',        title: 'Quantity',        supportsMode: false, quantifiable: true  },
  { value: 'weight',          title: 'Weight',          supportsMode: false, quantifiable: true  },
  { value: 'customer_group',  title: 'Customer group',  supportsMode: true,  quantifiable: false },
  { value: 'coupon_code',     title: 'Coupon code',     supportsMode: false, quantifiable: false },
  { value: 'exclude_on_sale', title: 'Exclude on sale', supportsMode: false, quantifiable: false, boolean: true },
  { value: 'pim_status',      title: 'PIM status',      supportsMode: true,  quantifiable: false },
  { value: 'attribute_set',   title: 'Attribute set',   supportsMode: true,  quantifiable: false },
  { value: 'source',          title: 'Source',          supportsMode: true,  quantifiable: false },
  { value: 'warehouse_type',  title: 'Warehouse type',  supportsMode: true,  quantifiable: false },
  { value: 'seller',          title: 'Seller',          supportsMode: true,  quantifiable: false },
]

const conditionCategories = [
  {
    key: 'product', label: 'Product', icon: 'mdi-package-variant',
    description: 'Target by product attributes',
    types: CONDITION_TYPES.filter(t => ['categories', 'brands', 'skus', 'product_lines'].includes(t.value)),
  },
  {
    key: 'customer', label: 'Customer', icon: 'mdi-account-group',
    description: 'Target by customer attributes',
    types: CONDITION_TYPES.filter(t => ['customer_group', 'coupon_code'].includes(t.value)),
  },
  {
    key: 'threshold', label: 'Threshold', icon: 'mdi-trending-up',
    description: 'Minimum purchase requirements',
    types: CONDITION_TYPES.filter(t => ['subtotal', 'quantity', 'weight'].includes(t.value)),
  },
  {
    key: 'advanced', label: 'Advanced', icon: 'mdi-tune',
    description: 'PIM, warehouse, and catalog filters',
    types: CONDITION_TYPES.filter(t => ['pim_status', 'attribute_set', 'source', 'warehouse_type', 'seller', 'exclude_on_sale'].includes(t.value)),
  },
]

const TYPE_OPTIONS = {
  // Dr. Max product taxonomy (shared across CZ / SK / PL / RO / IT markets)
  categories: [
    'Vitamins & Supplements',
    'OTC Medications',
    'Dermocosmetology',
    'Face Care',
    'Body Care',
    'Hair Care',
    'Dental Care',
    'Baby & Child Care',
    'Diapers & Wipes',
    'Medical Devices',
    'Weight Loss & Diet',
    'Sport & Fitness',
    'Sexual Health & Contraception',
    'Testing & Diagnostics',
    'Eye Care',
    'Foot Care',
    'Sun Protection',
    'Wound Care',
    'Homeopathy & Herbs',
    'For Seniors',
    'Allergy & Immunity',
    'Pain Relief',
    'Cold & Flu',
    'Digestive Health',
    'Sleep & Relaxation',
  ],

  // Brands actually sold across Dr. Max markets
  brands: [
    // Dermo / skincare — present in all markets
    'Vichy',
    'La Roche-Posay',
    'Eucerin',
    'Bioderma',
    'Avène',
    'Uriage',
    'SVR',
    'Ducray',
    'Lierac',
    'CeraVe',
    'Nuxe',
    'Caudalie',
    'Mustela',
    'Weleda',
    // Mass cosmetics
    'Nivea',
    'Garnier',
    "L'Oréal Paris",
    'Neutrogena',
    'Dove',
    'Palmolive',
    // Dental
    'Sensodyne',
    'Elmex',
    'Colgate',
    'Parodontax',
    // OTC pharma
    'Nurofen',
    'Panadol',
    'Paralen',
    'Ibalgin',
    'Strepsils',
    'Septolete',
    'Imodium',
    'Rennie',
    'Espumisan',
    // Vitamins / supplements
    'Centrum',
    'Walmark',
    'GS',
    'Cemio',
    'Jamieson',
    // Baby
    'Pampers',
    'Huggies',
    'Chicco',
    'Canpol',
    // Medical devices
    'Omron',
    'Microlife',
    'Beurer',
    // Hair
    'Head & Shoulders',
    'Pantene',
    'Syoss',
    // Regional — CZ/SK
    'Purity Vision',
    'Aromatica',
    // Regional — RO
    'Alevia',
    'Hofigal',
    'Fares',
    'Dacia Plant',
    // Regional — IT
    'Aboca',
    // Regional — PL
    'Apteo',
    // Own brand
    'Dr. Max',
  ],

  // Product lines / series (own-brand or major series)
  product_lines: [
    'Dr. Max Basic',
    'Dr. Max Premium',
    'Dr. Max Baby',
    'Dr. Max Dermo',
    'Dr. Max Vitamins',
    'Dr. Max Ortho',
    'Vichy Liftactiv',
    'Vichy Mineral 89',
    'La Roche-Posay Effaclar',
    'La Roche-Posay Toleriane',
    'Eucerin Hyaluron-Filler',
    'Eucerin DermoPure',
    'Bioderma Sensibio',
    'Bioderma Sebium',
    'Avène Tolerance',
    'Nuxe Huile Prodigieuse',
  ],

  // Dr. Max Club loyalty tiers + professional segments
  customer_group: [
    'Club Basic',
    'Club Silver',
    'Club Gold',
    'Club Platinum',
    'Healthcare Professional',
    'Employee',
    'Guest',
  ],

  // PIM publication states
  pim_status: [
    'Active',
    'Draft',
    'Archived',
    'Pending Approval',
    'Blocked',
  ],

  // Attribute sets matching Dr. Max catalog structure
  attribute_set: [
    'OTC Medicine',
    'Prescription Medicine',
    'Cosmetics',
    'Medical Device',
    'Supplement',
    'Baby Product',
    'Food Supplement',
    'Veterinary',
  ],

  // Warehouse / fulfillment types
  warehouse_type: [
    'Central Warehouse',
    'Pharmacy Dispatch',
    'Dropship Supplier',
    'Express Courier',
    'Cold Chain',
  ],

  // Traffic / acquisition sources
  source: [
    'Web',
    'Mobile App',
    'iOS App',
    'Android App',
    'Heureka',
    'Google Shopping',
    'Email Campaign',
    'Leaflet',
    'In-store Kiosk',
  ],

  // Marketplace / seller identifiers
  seller: [
    'Dr. Max CZ',
    'Dr. Max SK',
    'Dr. Max PL',
    'Dr. Max RO',
    'Dr. Max IT',
    'Third-party Seller',
  ],
}

const operatorItems = [
  { value: '>=', title: 'At least (≥)' },
  { value: '>',  title: 'More than (>)' },
  { value: '<=', title: 'At most (≤)' },
  { value: '<',  title: 'Less than (<)' },
]

const SCOPE_FIELD_LABELS = {
  cart: { subtotal: 'Cart subtotal (ex. VAT)', quantity: 'Total cart quantity', weight: 'Total cart weight' },
  item: { subtotal: 'Item price (incl. VAT)', quantity: 'Item line quantity', weight: 'Item weight' },
}

const SCOPE_FIELD_HINTS = {
  cart: {
    subtotal: 'Cart total before VAT — e.g. ≥ 100 means cart net value must reach €100',
    quantity: 'Total number of items across all lines in the cart',
    weight: 'Sum of all item weights in the cart (kg)',
  },
  item: {
    subtotal: 'Individual item price including VAT — e.g. ≥ 20 means item must cost at least €20',
    quantity: 'Quantity of this specific item/SKU on the line',
    weight: 'Weight of a single item unit (kg)',
  },
}

const SCOPE_HINTS = {
  cart: { subtotal: 'Threshold on whole-cart subtotal, VAT excluded', quantity: 'Threshold on total cart item count', weight: 'Threshold on total cart weight' },
  item: { subtotal: 'Threshold on per-item price, VAT included', quantity: 'Threshold on per-line item quantity', weight: 'Threshold on single item weight' },
}

// ─── Props / emits ────────────────────────────────────────────────────────

const props = defineProps({
  modelValue:       Boolean,
  initialCondition: { type: Object, default: null },
  scope:            { type: String, default: 'cart' },
})
const emit = defineEmits(['update:modelValue', 'save'])

// ─── State ────────────────────────────────────────────────────────────────

const step = ref(1)
const selectedFields = ref([])
const localConditions = ref({})
const openPanels = ref([])
const showErrors = ref(false)

// ─── Helpers ──────────────────────────────────────────────────────────────

const isEditMode = computed(() => !!props.initialCondition)

const saveLabel = computed(() => {
  if (isEditMode.value) return 'Update'
  return selectedFields.value.length > 1
    ? `Add ${selectedFields.value.length} conditions`
    : 'Add condition'
})

function getTypeDef(field) {
  return CONDITION_TYPES.find(t => t.value === field)
}

function getTypeOptions(field) {
  return TYPE_OPTIONS[field] ?? []
}

function getScopeHint(field) {
  return SCOPE_HINTS[props.scope]?.[field] ?? (props.scope === 'item' ? 'Evaluated per item/line' : 'Evaluated against the whole cart')
}

function getQuantifiableLabel(field) {
  return SCOPE_FIELD_LABELS[props.scope]?.[field] ?? getTypeDef(field)?.title ?? field
}

function getQuantifiableHint(field) {
  return SCOPE_FIELD_HINTS[props.scope]?.[field] ?? 'Enter a numeric threshold'
}

function initCondition(field) {
  const typeDef = getTypeDef(field)
  return { field, mode: 'include', values: [], operator: typeDef?.quantifiable ? '>=' : undefined }
}

function toggleField(field) {
  const idx = selectedFields.value.indexOf(field)
  if (idx >= 0) {
    selectedFields.value.splice(idx, 1)
    const next = { ...localConditions.value }
    delete next[field]
    localConditions.value = next
  } else {
    selectedFields.value.push(field)
    localConditions.value = { ...localConditions.value, [field]: initCondition(field) }
  }
}

function conditionSummary(cond) {
  if (!cond) return ''
  const typeDef = getTypeDef(cond.field)
  if (typeDef?.quantifiable) return cond.values?.[0] ? `${cond.operator ?? ''} ${cond.values[0]}` : 'not configured'
  if (typeDef?.boolean) return cond.values?.[0] === 'true' ? 'enabled' : 'disabled'
  if (!cond.values?.length) return 'not configured'
  const preview = cond.values.slice(0, 2).join(', ')
  const more = cond.values.length > 2 ? ` +${cond.values.length - 2}` : ''
  return `${cond.mode}: ${preview}${more}`
}

// ─── Validation ───────────────────────────────────────────────────────────

const validationErrors = computed(() => {
  const errors = []
  for (const field of selectedFields.value) {
    const cond = localConditions.value[field]
    if (!cond) continue
    validateCondition(cond).errors.forEach(e => errors.push(`${getTypeDef(field)?.title}: ${e}`))
  }
  return errors
})

function hasError(field) {
  const cond = localConditions.value[field]
  return cond ? validateCondition(cond).errors.length > 0 : false
}

// ─── Watchers ─────────────────────────────────────────────────────────────

watch(() => props.initialCondition, (val) => {
  if (val) {
    selectedFields.value = [val.field]
    localConditions.value = { [val.field]: { ...val } }
    step.value = 2
  } else {
    selectedFields.value = []
    localConditions.value = {}
    step.value = 1
  }
}, { immediate: true })

watch(() => props.modelValue, (open) => {
  if (open && !props.initialCondition) {
    step.value = 1
    selectedFields.value = []
    localConditions.value = {}
    showErrors.value = false
  }
})

watch(step, (s) => {
  if (s === 2) {
    openPanels.value = [...selectedFields.value]
    showErrors.value = false
  }
})

// ─── Save ─────────────────────────────────────────────────────────────────

function handleSave() {
  showErrors.value = true
  if (validationErrors.value.length) return
  const conditions = selectedFields.value.map(field => ({
    ...localConditions.value[field],
    id: props.initialCondition?.id ?? uuid(),
  }))
  emit('save', conditions)
  emit('update:modelValue', false)
}
</script>
