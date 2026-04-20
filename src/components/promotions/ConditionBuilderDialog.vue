<!-- src/components/promotions/ConditionBuilderDialog.vue -->
<template>
  <DialogCard :model-value="modelValue" max-width="560" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>
      {{ isEditMode ? 'Edit condition' : 'Add condition' }}
      <span v-if="!isEditMode" class="text-caption text-medium-emphasis ml-2">Step {{ step }} of 2</span>
    </template>

      <!-- Step 1: Type selector -->
      <v-card-text v-if="step === 1" class="pa-5 pt-2">
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
              :color="selectedField === type.value ? 'primary' : undefined"
              :class="selectedField === type.value ? 'border-primary' : ''"
              @click="selectType(type.value)"
            >
              {{ type.title }}
              <v-icon v-if="selectedField === type.value" icon="mdi-check" size="14" class="ml-1" />
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <!-- Step 2: Value configuration -->
      <v-card-text v-else class="pa-5 pt-2">
        <div class="d-flex align-center gap-2 mb-4">
          <v-chip color="primary" variant="tonal" size="small" label>
            {{ currentTypeDef?.title }}
          </v-chip>
          <v-btn
            v-if="!isEditMode"
            variant="text"
            size="x-small"
            prepend-icon="mdi-arrow-left"
            @click="step = 1"
          >Change type</v-btn>
        </div>

        <!-- Mode toggle -->
        <div v-if="currentTypeDef?.supportsMode" class="mb-4">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-1">MODE</div>
          <v-btn-toggle v-model="localCondition.mode" mandatory density="compact" variant="outlined" color="primary">
            <v-btn value="include" size="small">Include</v-btn>
            <v-btn value="exclude" size="small">Exclude</v-btn>
          </v-btn-toggle>
        </div>

        <!-- Scope context banner for quantifiable fields -->
        <v-alert
          v-if="currentTypeDef?.quantifiable"
          :color="props.scope === 'item' ? 'deep-purple' : 'blue'"
          variant="tonal"
          density="compact"
          :icon="props.scope === 'item' ? 'mdi-package-variant' : 'mdi-cart'"
          class="mb-3 text-caption"
        >
          <strong>{{ props.scope === 'item' ? 'Item scope' : 'Cart scope' }}</strong>
          — {{ scopeHint }}
        </v-alert>

        <!-- Operator for quantifiable types -->
        <SelectInput
          v-if="currentTypeDef?.quantifiable"
          v-model="localCondition.operator"
          :data="operatorItems"
          label="Operator"
          class="mb-3"
        />

        <!-- Boolean toggle (excludeOnSale) -->
        <div v-if="currentTypeDef?.boolean" class="d-flex align-center justify-space-between mb-3 pa-3 rounded border">
          <span class="text-body-2">{{ currentTypeDef.title }}</span>
          <v-switch
            :model-value="localCondition.values[0] === 'true'"
            color="primary"
            hide-details
            density="compact"
            inset
            @update:model-value="v => localCondition.values = [String(v)]"
          />
        </div>

        <!-- Multi-select combobox for list types -->
        <v-combobox
          v-else-if="!currentTypeDef?.quantifiable"
          v-model="localCondition.values"
          :label="currentTypeDef?.title + ' values'"
          :items="currentTypeOptions"
          variant="outlined"
          density="compact"
          multiple
          chips
          closable-chips
          hint="Select from the list or type to add custom values"
          persistent-hint
          class="mb-3"
        />

        <!-- Numeric input for quantifiable types -->
        <NumberInput
          v-else
          :model-value="localCondition.values[0] ?? ''"
          :label="quantifiableLabel"
          :help-text="quantifiableHint"
          class="mb-3"
          @update:model-value="v => localCondition.values = [v]"
        />

        <!-- Validation errors -->
        <v-alert
          v-if="validationErrors.length"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
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
        :disabled="!selectedField"
        @click="step = 2"
      >Next</v-btn>
      <v-btn
        v-else
        color="primary"
        variant="flat"
        @click="handleSave"
      >{{ isEditMode ? 'Update' : 'Add condition' }}</v-btn>
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

// --- Type definitions ---
const CONDITION_TYPES = [
  { value: 'categories',     title: 'Categories',     supportsMode: true,  quantifiable: false },
  { value: 'brands',         title: 'Brands',         supportsMode: true,  quantifiable: false },
  { value: 'skus',           title: 'SKUs',           supportsMode: true,  quantifiable: false },
  { value: 'product_lines',  title: 'Product lines',  supportsMode: true,  quantifiable: false },
  { value: 'subtotal',       title: 'Subtotal',       supportsMode: false, quantifiable: true  },
  { value: 'quantity',       title: 'Quantity',       supportsMode: false, quantifiable: true  },
  { value: 'weight',         title: 'Weight',         supportsMode: false, quantifiable: true  },
  { value: 'customer_group', title: 'Customer group', supportsMode: true,  quantifiable: false },
  { value: 'coupon_code',    title: 'Coupon code',    supportsMode: false, quantifiable: false },
  { value: 'exclude_on_sale',title: 'Exclude on sale',supportsMode: false, quantifiable: false, boolean: true },
  { value: 'pim_status',     title: 'PIM status',     supportsMode: true,  quantifiable: false },
  { value: 'attribute_set',  title: 'Attribute set',  supportsMode: true,  quantifiable: false },
  { value: 'source',         title: 'Source',         supportsMode: true,  quantifiable: false },
  { value: 'warehouse_type', title: 'Warehouse type', supportsMode: true,  quantifiable: false },
  { value: 'seller',         title: 'Seller',         supportsMode: true,  quantifiable: false },
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

// Preset options per type
const TYPE_OPTIONS = {
  categories:     ['Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 'Beauty & Health', 'Books', 'Toys & Games'],
  brands:         ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'Puma', 'Under Armour'],
  customer_group: ['VIP', 'Premium', 'New', 'Loyal'],
  pim_status:     ['Active', 'Draft', 'Archived'],
  warehouse_type: ['Standard', 'Dropship', 'Express'],
  source:         ['Web', 'Mobile', 'App'],
}

const operatorItems = [
  { value: '>=', title: 'At least (≥)' },
  { value: '>',  title: 'More than (>)'  },
  { value: '<=', title: 'At most (≤)'   },
  { value: '<',  title: 'Less than (<)'  },
]

// Scope-aware labels and hints for quantifiable fields
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

// --- Props / emits ---
const props = defineProps({
  modelValue: Boolean,
  initialCondition: { type: Object, default: null },
  scope: { type: String, default: 'cart' },
})
const emit = defineEmits(['update:modelValue', 'save'])

// --- State ---
const step = ref(props.initialCondition ? 2 : 1)
const selectedField = ref(props.initialCondition?.field ?? null)
const localCondition = ref({ field: 'categories', mode: 'include', values: [], operator: '>=' })

const isEditMode = computed(() => !!props.initialCondition)
const currentTypeDef = computed(() => CONDITION_TYPES.find(t => t.value === localCondition.value.field))
const currentTypeOptions = computed(() => TYPE_OPTIONS[localCondition.value.field] ?? [])
const validationErrors = computed(() => validateCondition(localCondition.value).errors)

const quantifiableLabel = computed(() => {
  const field = localCondition.value.field
  return SCOPE_FIELD_LABELS[props.scope]?.[field] ?? currentTypeDef.value?.title ?? field
})

const quantifiableHint = computed(() => {
  const field = localCondition.value.field
  return SCOPE_FIELD_HINTS[props.scope]?.[field] ?? 'Enter a numeric threshold'
})

const scopeHint = computed(() => {
  const field = localCondition.value.field
  return SCOPE_HINTS[props.scope]?.[field] ?? (props.scope === 'item' ? 'Evaluated per item/line' : 'Evaluated against the whole cart')
})

// --- Watchers ---
watch(() => props.initialCondition, (val) => {
  if (val) {
    localCondition.value = { ...val }
    selectedField.value = val.field
    step.value = 2
  } else {
    localCondition.value = { field: 'categories', mode: 'include', values: [], operator: '>=' }
    selectedField.value = null
    step.value = 1
  }
}, { immediate: true })

watch(() => props.modelValue, (open) => {
  if (open && !props.initialCondition) {
    step.value = 1
    selectedField.value = null
    localCondition.value = { field: 'categories', mode: 'include', values: [], operator: '>=' }
  }
})

// --- Methods ---
function selectType(field) {
  selectedField.value = field
  localCondition.value.field = field
  localCondition.value.values = []
  localCondition.value.operator = currentTypeDef.value?.quantifiable ? '>=' : undefined
  if (!currentTypeDef.value?.supportsMode) localCondition.value.mode = 'include'
}

function handleSave() {
  if (validationErrors.value.length) return
  emit('save', { ...localCondition.value, id: props.initialCondition?.id || uuid() })
  emit('update:modelValue', false)
}
</script>
