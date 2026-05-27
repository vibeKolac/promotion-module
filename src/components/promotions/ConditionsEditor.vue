<!-- src/components/promotions/ConditionsEditor.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center mb-1">
      <span class="text-body-1 font-weight-bold">{{ title }}</span>
      <HelpTooltip v-if="helpText" :text="helpText" class="ml-1" />
      <v-spacer />
      <v-btn prepend-icon="mdi-upload" variant="text" size="small" @click="csvImportOpen = true">
        Import CSV
        <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
      </v-btn>
      <v-btn v-if="showPreset" prepend-icon="mdi-filter-variant" variant="text" size="small" @click="presetPickerOpen = true">
        Preset
        <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
      </v-btn>
    </div>
    <div class="text-caption text-medium-emphasis mb-4">
      Add conditions or groups. Click the chips between rows to switch between AND and OR.
    </div>

    <!-- Conditions list -->
    <div v-if="modelValue.length" class="mb-4">
      <template v-for="(cond, idx) in modelValue" :key="cond.id">

        <!-- AND / OR toggle between rows -->
        <div v-if="idx > 0" class="d-flex justify-center my-3">
          <v-chip
            size="default"
            variant="outlined"
            class="logic-op-chip"
            @click="toggleOp(idx)"
          >
            {{ cond.logicalOp === 'OR' ? 'OR' : 'AND' }}
          </v-chip>
        </div>

        <!-- Group row (unchanged) -->
        <ConditionGroupRow
          v-if="cond.type === 'group'"
          :group="cond"
          :scope="scope"
          @update:group="onGroupUpdate(idx, $event)"
          @remove="remove(idx)"
        />

        <!-- Leaf condition: inline row -->
        <div v-else>
          <!-- Column labels -->
          <div class="condition-cols mb-1">
            <span class="text-caption text-medium-emphasis">Condition Type</span>
            <span class="text-caption text-medium-emphasis">Operator</span>
            <span class="text-caption text-medium-emphasis">Value</span>
            <span />
          </div>
          <!-- Inputs -->
          <div class="condition-cols">
            <!-- Type -->
            <v-autocomplete
              :model-value="cond.field"
              :items="typeSelectItems"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="Select type"
              auto-select-first
              @update:model-value="onFieldChange(idx, $event)"
            />
            <!-- Operator -->
            <v-select
              :model-value="getUiOperator(cond)"
              :items="getOperatorItems(cond)"
              variant="outlined"
              density="compact"
              hide-details
              :disabled="!cond.field"
              @update:model-value="onOperatorChange(idx, $event)"
            />
            <!-- Value — quantifiable: number input -->
            <v-text-field
              v-if="isQuantifiable(cond)"
              :model-value="cond.values?.[0] ?? ''"
              variant="outlined"
              density="compact"
              hide-details
              type="number"
              placeholder="Enter value"
              :suffix="getValueSuffix(cond)"
              @update:model-value="onValueChange(idx, $event)"
            />
            <!-- Value — SKU: product autocomplete with paste + warnings -->
            <SkuValuePicker
              v-else-if="isSkuField(cond)"
              :model-value="cond.values ?? []"
              @update:model-value="onValueChange(idx, $event)"
            />
            <!-- Value — list type: searchable autocomplete -->
            <v-autocomplete
              v-else-if="hasOptions(cond)"
              :model-value="cond.values ?? []"
              :items="getOptions(cond)"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="Search or select…"
              clearable
              multiple
              :disabled="!cond.field"
              @update:model-value="onValueChange(idx, $event)"
            >
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps" :disabled="item.raw.disabled">
                  <template v-if="item.raw.disabled" #append>
                    <v-chip size="x-small" color="error" variant="tonal" label>Not allowed</v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
            <!-- Value — free text -->
            <v-text-field
              v-else-if="cond.field && !isBoolean(cond)"
              :model-value="cond.values?.[0] ?? ''"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="Enter value"
              @update:model-value="onValueChange(idx, $event)"
            />
            <!-- Value — boolean: handled by operator -->
            <span v-else />
            <!-- Delete -->
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              color="error"
              size="default"
              @click="remove(idx)"
            />
          </div>
        </div>

      </template>
    </div>

    <!-- Empty state -->
    <div v-else class="d-flex align-center mb-4" style="gap: 8px">
      <v-icon size="20" color="medium-emphasis">mdi-information-outline</v-icon>
      <span class="text-body-2 text-medium-emphasis"><slot name="empty">No conditions set.</slot></span>
    </div>

    <!-- Actions -->
    <div class="condition-actions">
      <v-btn prepend-icon="mdi-plus" variant="outlined" size="default" @click="addConditionInline">
        Add condition
      </v-btn>
      <v-btn prepend-icon="mdi-table-plus" variant="outlined" size="default" @click="openAddGroup">
        Add group
      </v-btn>
    </div>

    <!-- Dialogs -->
    <ConditionCsvImportDialog v-model="csvImportOpen" @import="onCsvImport" />
    <ConditionPresetPickerDialog v-if="showPreset" v-model="presetPickerOpen" @apply="onPresetApply" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuid } from 'uuid'
import HelpTooltip from '../_common/HelpTooltip.vue'
import ConditionGroupRow from './ConditionGroupRow.vue'
import ConditionCsvImportDialog from './ConditionCsvImportDialog.vue'
import ConditionPresetPickerDialog from './ConditionPresetPickerDialog.vue'
import SkuValuePicker from './SkuValuePicker.vue'
import { downloadConditionsTemplate } from '../../utils/csvRuleImportExport'
import { useSettingsStore } from '../../stores/settings'
import { getRecentConditionTypes, recordConditionTypes } from '../../utils/recentConditionTypes'

const settingsStore = useSettingsStore()
const recentTypeValues = ref(getRecentConditionTypes())

// ── Type definitions ──────────────────────────────────────────────────────────
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
  { value: 'attribute_set',   title: 'Attribute set',   supportsMode: true,  quantifiable: false },
  { value: 'warehouse_type',  title: 'Warehouse type',  supportsMode: true,  quantifiable: false },
  { value: 'seller',          title: 'Seller',          supportsMode: true,  quantifiable: false },
]

const TYPE_OPTIONS = {
  categories: ['Vitamins & Supplements','OTC Medications','Dermocosmetology','Face Care','Body Care','Hair Care','Dental Care','Baby & Child Care','Diapers & Wipes','Medical Devices','Weight Loss & Diet','Sport & Fitness','Sexual Health & Contraception','Testing & Diagnostics','Eye Care','Foot Care','Sun Protection','Wound Care','Homeopathy & Herbs','For Seniors','Allergy & Immunity','Pain Relief','Cold & Flu','Digestive Health','Sleep & Relaxation'],
  brands: ['Vichy','La Roche-Posay','Eucerin','Bioderma','Avène','Uriage','SVR','Ducray','Lierac','CeraVe','Nuxe','Caudalie','Mustela','Weleda','Nivea','Garnier',"L'Oréal Paris",'Neutrogena','Dove','Palmolive','Sensodyne','Elmex','Colgate','Parodontax','Nurofen','Panadol','Paralen','Ibalgin','Strepsils','Septolete','Imodium','Rennie','Espumisan','Centrum','Walmark','GS','Cemio','Jamieson','Pampers','Huggies','Chicco','Canpol','Omron','Microlife','Beurer','Head & Shoulders','Pantene','Syoss','Purity Vision','Aromatica','Alevia','Hofigal','Fares','Dacia Plant','Aboca','Apteo','Dr. Max'],
  product_lines: ['Dr. Max Basic','Dr. Max Premium','Dr. Max Baby','Dr. Max Dermo','Dr. Max Vitamins','Dr. Max Ortho','Vichy Liftactiv','Vichy Mineral 89','La Roche-Posay Effaclar','La Roche-Posay Toleriane','Eucerin Hyaluron-Filler','Eucerin DermoPure','Bioderma Sensibio','Bioderma Sebium','Avène Tolerance','Nuxe Huile Prodigieuse'],
  customer_group: ['Club Basic','Club Silver','Club Gold','Club Platinum','Healthcare Professional','Employee','Guest'],
  attribute_set: ['OTC Medicine','Prescription Medicine','Cosmetics','Medical Device','Supplement','Baby Product','Food Supplement','Veterinary'],
  warehouse_type: ['Central Warehouse','Pharmacy Dispatch','Dropship Supplier','Express Courier','Cold Chain'],
  seller: ['Dr. Max CZ','Dr. Max SK','Dr. Max PL','Dr. Max RO','Dr. Max IT','Third-party Seller'],
}

// ── Props / emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  scope:      { type: String, default: 'cart' },
  showPreset: { type: Boolean, default: true },
  title:      { type: String, default: 'Condition Builder' },
  helpText:   { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])

// ── Dialog state ──────────────────────────────────────────────────────────────
const csvImportOpen = ref(false)
const presetPickerOpen = ref(false)

// ── Type helpers ──────────────────────────────────────────────────────────────
const CONDITION_GROUPS = [
  { label: 'Threshold',         color: 'blue',   fields: ['subtotal','quantity','weight'] },
  { label: 'Product & Catalog', color: 'green',  fields: ['categories','brands','skus','product_lines','exclude_on_sale'] },
  { label: 'Customer',          color: 'orange', fields: ['customer_group','coupon_code'] },
  { label: 'Advanced',          color: 'purple', fields: ['attribute_set','warehouse_type','seller'] },
]

const typeSelectItems = computed(() => {
  const recent = recentTypeValues.value
    .map(v => CONDITION_TYPES.find(t => t.value === v))
    .filter(Boolean)
  const recentSet = new Set(recent.map(t => t.value))
  const grouped = CONDITION_GROUPS.flatMap(g => [
    { type: 'subheader', title: g.label },
    ...g.fields
      .filter(f => !recentSet.has(f))
      .map(f => {
        const t = CONDITION_TYPES.find(ct => ct.value === f)
        return { title: t.title, value: t.value }
      }),
  ])
  if (!recent.length) return grouped
  return [
    { type: 'subheader', title: 'Recently used' },
    ...recent.map(t => ({ title: t.title, value: t.value })),
    ...grouped,
  ]
})

function getTypeDef(field) {
  return CONDITION_TYPES.find(t => t.value === field)
}

function isQuantifiable(cond) {
  return !!getTypeDef(cond.field)?.quantifiable
}

function isBoolean(cond) {
  return !!getTypeDef(cond.field)?.boolean
}

function isSkuField(cond) {
  return cond.field === 'skus'
}

function getValueSuffix(cond) {
  if (cond.field === 'weight') return 'g'
  return undefined
}

function hasOptions(cond) {
  return !!(cond.field && TYPE_OPTIONS[cond.field])
}

function getExcludedForField(field) {
  if (field === 'categories') return settingsStore.excludedCategories
  if (field === 'brands') return settingsStore.excludedBrands
  if (field === 'product_lines') return settingsStore.excludedProductLines
  return []
}

function getOptions(cond) {
  const excluded = getExcludedForField(cond.field)
  return (TYPE_OPTIONS[cond.field] ?? []).map(v => ({
    title: v,
    value: v,
    disabled: excluded.includes(v),
  }))
}

function getUiOperator(cond) {
  const typeDef = cond.field ? getTypeDef(cond.field) : null
  if (!typeDef) return null
  if (typeDef.boolean) return cond.values?.[0] === 'true' ? 'is_true' : 'is_false'
  if (typeDef.quantifiable) return cond.operator ?? '>='
  return cond.mode === 'exclude' ? 'is_not' : 'is'
}

function getOperatorItems(cond) {
  const typeDef = cond.field ? getTypeDef(cond.field) : null
  if (!typeDef) return []
  if (typeDef.boolean) return [
    { title: 'is true',  value: 'is_true'  },
    { title: 'is false', value: 'is_false' },
  ]
  if (typeDef.quantifiable) return [
    { title: 'bigger than or equal', value: '>=' },
    { title: 'bigger than',          value: '>'  },
    { title: 'lower than or equal',  value: '<=' },
    { title: 'lower than',           value: '<'  },
    { title: 'equal',                value: '='  },
  ]
  return [
    { title: 'include', value: 'is'     },
    { title: 'exclude', value: 'is_not' },
  ]
}

// ── Emit helper ───────────────────────────────────────────────────────────────
function emit_(conditions) {
  emit('update:modelValue', conditions)
}

function withDefaultOp(conditions, isFirst) {
  return conditions.map((c, i) => ({
    ...c,
    id: c.id ?? uuid(),
    logicalOp: (isFirst && i === 0) ? undefined : (c.logicalOp ?? 'AND'),
  }))
}

// ── Add / remove ──────────────────────────────────────────────────────────────
function addConditionInline() {
  const isFirst = props.modelValue.length === 0
  emit_([...props.modelValue, {
    id: uuid(),
    field: null,
    mode: 'include',
    values: [],
    operator: undefined,
    logicalOp: isFirst ? undefined : 'AND',
  }])
}

function openAddGroup() {
  const isFirst = props.modelValue.length === 0
  emit_([...props.modelValue, {
    id: uuid(),
    type: 'group',
    conditions: [],
    logicalOp: isFirst ? undefined : 'AND',
  }])
}

function remove(idx) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  if (idx === 0 && next.length > 0) {
    next[0] = { ...next[0], logicalOp: undefined }
  }
  emit_(next)
}

function toggleOp(idx) {
  emit_(props.modelValue.map((c, i) =>
    i === idx ? { ...c, logicalOp: c.logicalOp === 'OR' ? 'AND' : 'OR' } : c
  ))
}

function onGroupUpdate(idx, updatedGroup) {
  const next = [...props.modelValue]
  next[idx] = updatedGroup
  emit_(next)
}

// ── Inline field updates ──────────────────────────────────────────────────────
function onFieldChange(idx, newField) {
  if (!newField) return
  const typeDef = getTypeDef(newField)
  const next = [...props.modelValue]
  next[idx] = {
    ...next[idx],
    field: newField,
    mode: 'include',
    values: [],
    operator: typeDef?.quantifiable ? '>=' : undefined,
  }
  emit_(next)
  recordConditionTypes([newField])
  recentTypeValues.value = getRecentConditionTypes()
}

function onOperatorChange(idx, uiOp) {
  const next = [...props.modelValue]
  const cond = { ...next[idx] }
  if (uiOp === 'is')       { cond.mode = 'include'; delete cond.operator }
  else if (uiOp === 'is_not')  { cond.mode = 'exclude'; delete cond.operator }
  else if (uiOp === 'is_true')  { cond.values = ['true'] }
  else if (uiOp === 'is_false') { cond.values = ['false'] }
  else { cond.operator = uiOp }
  next[idx] = cond
  emit_(next)
}

function onValueChange(idx, val) {
  const next = [...props.modelValue]
  if (Array.isArray(val)) {
    next[idx] = { ...next[idx], values: val }
  } else {
    next[idx] = { ...next[idx], values: val !== null && val !== undefined && val !== '' ? [String(val)] : [] }
  }
  emit_(next)
}

// ── CSV / preset ──────────────────────────────────────────────────────────────
function onCsvImport(conditions) {
  const isFirst = props.modelValue.length === 0
  const stamped = withDefaultOp(conditions.map(c => ({ ...c, id: uuid() })), isFirst)
  emit_([...props.modelValue, ...stamped])
}

function onPresetApply({ conditions, mode }) {
  const stamped = withDefaultOp(conditions, mode === 'replace')
  if (mode === 'replace') {
    emit_(stamped)
  } else {
    const isFirst = props.modelValue.length === 0
    emit_([...props.modelValue, ...withDefaultOp(conditions, isFirst)])
  }
}
</script>

<style scoped>
.condition-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.condition-cols {
  display: grid;
  grid-template-columns: minmax(130px, 1.2fr) minmax(100px, 0.8fr) minmax(160px, 2fr) 36px;
  gap: 8px;
  align-items: center;
}

</style>
