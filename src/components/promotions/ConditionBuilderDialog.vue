<!-- src/components/promotions/ConditionBuilderDialog.vue -->
<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6 pa-5 pb-2">
        {{ isEditMode ? 'Edit condition' : 'Add condition' }}
      </v-card-title>

      <v-card-text class="pa-5 pt-2">
        <!-- Condition type -->
        <v-select
          v-model="localCondition.field"
          :items="conditionTypeItems"
          label="Condition type"
          variant="outlined"
          density="compact"
          class="mb-3"
        />

        <!-- Mode toggle (only for types that support it) -->
        <div v-if="supportsMode" class="mb-3">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-1">MODE</div>
          <v-btn-toggle v-model="localCondition.mode" mandatory density="compact" variant="outlined" color="primary">
            <v-btn value="include" size="small">Include</v-btn>
            <v-btn value="exclude" size="small">Exclude</v-btn>
          </v-btn-toggle>
        </div>

        <!-- Operator (quantifiable types only) -->
        <v-select
          v-if="isQuantifiable"
          v-model="localCondition.operator"
          :items="operatorItems"
          label="Operator"
          variant="outlined"
          density="compact"
          class="mb-3"
        />

        <!-- Values -->
        <v-combobox
          v-model="localCondition.values"
          label="Values"
          variant="outlined"
          density="compact"
          multiple
          chips
          closable-chips
          :hint="isQuantifiable ? 'Enter a numeric value' : 'Press Enter to add each value'"
          persistent-hint
        />

        <!-- Validation errors -->
        <v-alert
          v-if="validationErrors.length"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          <ul class="ma-0 pl-4">
            <li v-for="e in validationErrors" :key="e">{{ e }}</li>
          </ul>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="handleSave">
          {{ isEditMode ? 'Update condition' : 'Add condition' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuid } from 'uuid'
import { validateCondition } from '../../utils/conditionValidator'

const CONDITION_TYPES = [
  { value: 'categories', title: 'Categories', supportsMode: true, quantifiable: false },
  { value: 'brands', title: 'Brands', supportsMode: true, quantifiable: false },
  { value: 'skus', title: 'SKUs', supportsMode: true, quantifiable: false },
  { value: 'product_lines', title: 'Product lines', supportsMode: true, quantifiable: false },
  { value: 'subtotal', title: 'Subtotal', supportsMode: false, quantifiable: true },
  { value: 'quantity', title: 'Quantity', supportsMode: false, quantifiable: true },
  { value: 'weight', title: 'Weight', supportsMode: false, quantifiable: true },
  { value: 'customer_group', title: 'Customer group', supportsMode: true, quantifiable: false },
  { value: 'coupon_code', title: 'Coupon code', supportsMode: false, quantifiable: false },
  { value: 'exclude_on_sale', title: 'Exclude on sale', supportsMode: false, quantifiable: false },
  { value: 'pim_status', title: 'PIM status', supportsMode: true, quantifiable: false },
  { value: 'attribute_set', title: 'Attribute set', supportsMode: true, quantifiable: false },
  { value: 'source', title: 'Source', supportsMode: true, quantifiable: false },
  { value: 'warehouse_type', title: 'Warehouse type', supportsMode: true, quantifiable: false },
  { value: 'seller', title: 'Seller', supportsMode: true, quantifiable: false },
]

const operatorItems = [
  { value: '>=', title: 'At least (≥)' },
  { value: '>', title: 'More than (>)' },
  { value: '<=', title: 'At most (≤)' },
  { value: '<', title: 'Less than (<)' },
]

const props = defineProps({
  modelValue: Boolean,
  initialCondition: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'save'])

const isEditMode = computed(() => !!props.initialCondition)
const conditionTypeItems = CONDITION_TYPES.map(c => ({ value: c.value, title: c.title }))

const localCondition = ref({ field: 'categories', mode: 'include', values: [], operator: undefined })

const currentTypeDef = computed(() => CONDITION_TYPES.find(t => t.value === localCondition.value.field))
const supportsMode = computed(() => currentTypeDef.value?.supportsMode ?? true)
const isQuantifiable = computed(() => currentTypeDef.value?.quantifiable ?? false)

watch(() => props.initialCondition, (val) => {
  if (val) localCondition.value = { ...val }
  else localCondition.value = { field: 'categories', mode: 'include', values: [], operator: undefined }
}, { immediate: true })

watch(() => localCondition.value.field, () => {
  localCondition.value.values = []
  localCondition.value.operator = undefined
  if (!supportsMode.value) localCondition.value.mode = 'include'
})

const validationErrors = computed(() => validateCondition(localCondition.value).errors)

function handleSave() {
  if (validationErrors.value.length) return
  emit('save', { ...localCondition.value, id: props.initialCondition?.id || uuid() })
  emit('update:modelValue', false)
}
</script>
