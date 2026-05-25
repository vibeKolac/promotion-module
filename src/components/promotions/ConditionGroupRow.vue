<!-- src/components/promotions/ConditionGroupRow.vue -->
<template>
  <div class="condition-group rounded border">
    <!-- Header -->
    <div class="group-header d-flex align-center px-3 py-2">
      <v-icon size="16" color="primary" class="mr-1">mdi-layers-outline</v-icon>
      <span class="text-caption font-weight-bold text-primary text-uppercase">Condition group</span>
      <v-spacer />
      <v-btn
        icon="mdi-delete-outline"
        size="x-small"
        variant="text"
        color="error"
        density="comfortable"
        title="Remove group"
        @click="$emit('remove')"
      />
    </div>

    <!-- Body -->
    <div class="group-body pa-3">
      <div v-if="group.conditions.length" class="inner-conditions mb-3">
        <template v-for="(cond, idx) in group.conditions" :key="cond.id">
          <!-- AND / OR toggle -->
          <div v-if="idx > 0" class="d-flex justify-center my-2">
            <v-chip
              size="default"
              variant="outlined"
              class="logic-op-chip"
              @click="toggleOp(idx)"
            >
              {{ cond.logicalOp === 'OR' ? 'OR' : 'AND' }}
            </v-chip>
          </div>

          <!-- Inline condition row -->
          <div>
            <div class="condition-cols mb-1">
              <span class="text-caption text-medium-emphasis">Condition Type</span>
              <span class="text-caption text-medium-emphasis">Operator</span>
              <span class="text-caption text-medium-emphasis">Value</span>
              <span />
            </div>
            <div class="condition-cols">
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
              <v-select
                :model-value="getUiOperator(cond)"
                :items="getOperatorItems(cond)"
                variant="outlined"
                density="compact"
                hide-details
                :disabled="!cond.field"
                @update:model-value="onOperatorChange(idx, $event)"
              />
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
              <!-- SKU: product autocomplete with paste + warnings -->
              <SkuValuePicker
                v-else-if="isSkuField(cond)"
                :model-value="cond.values ?? []"
                @update:model-value="onValueChange(idx, $event)"
              />
              <!-- List type: searchable autocomplete -->
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
              />
              <v-text-field
                v-else-if="cond.field && !isBoolean(cond)"
                :model-value="cond.values?.[0] ?? ''"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="Enter value"
                @update:model-value="onValueChange(idx, $event)"
              />
              <span v-else />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                @click="removeInner(idx)"
              />
            </div>
          </div>
        </template>
      </div>
      <div v-else class="text-caption text-medium-emphasis mb-3 pl-1">No conditions in group yet.</div>

      <v-btn
        size="default"
        prepend-icon="mdi-plus"
        variant="outlined"
        @click="addConditionInline"
      >
        Add condition
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuid } from 'uuid'
import SkuValuePicker from './SkuValuePicker.vue'

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

const CONDITION_GROUPS = [
  { label: 'Threshold',         color: 'blue',   fields: ['subtotal','quantity','weight'] },
  { label: 'Product & Catalog', color: 'green',  fields: ['categories','brands','skus','product_lines','exclude_on_sale'] },
  { label: 'Customer',          color: 'orange', fields: ['customer_group','coupon_code'] },
  { label: 'Advanced',          color: 'purple', fields: ['attribute_set','warehouse_type','seller'] },
]

const typeSelectItems = CONDITION_GROUPS.flatMap(g => [
  { type: 'subheader', title: g.label },
  ...g.fields.map(f => {
    const t = CONDITION_TYPES.find(ct => ct.value === f)
    return { title: t.title, value: t.value }
  }),
])

const props = defineProps({
  group: { type: Object, required: true },
  scope: { type: String, default: 'cart' },
})
const emit = defineEmits(['update:group', 'remove'])

function emitGroup(conditions) {
  emit('update:group', { ...props.group, conditions })
}

function getTypeDef(field) {
  return CONDITION_TYPES.find(t => t.value === field)
}

function isQuantifiable(cond) { return !!getTypeDef(cond.field)?.quantifiable }
function isBoolean(cond)      { return !!getTypeDef(cond.field)?.boolean }
function isSkuField(cond)     { return cond.field === 'skus' }
function getValueSuffix(cond) { return cond.field === 'weight' ? 'g' : undefined }
function hasOptions(cond)     { return !!(cond.field && TYPE_OPTIONS[cond.field]) }
function getOptions(cond)     { return (TYPE_OPTIONS[cond.field] ?? []).map(v => ({ title: v, value: v })) }

function getUiOperator(cond) {
  const def = cond.field ? getTypeDef(cond.field) : null
  if (!def) return null
  if (def.boolean) return cond.values?.[0] === 'true' ? 'is_true' : 'is_false'
  if (def.quantifiable) return cond.operator ?? '>='
  return cond.mode === 'exclude' ? 'is_not' : 'is'
}

function getOperatorItems(cond) {
  const def = cond.field ? getTypeDef(cond.field) : null
  if (!def) return []
  if (def.boolean) return [{ title: 'is true', value: 'is_true' }, { title: 'is false', value: 'is_false' }]
  if (def.quantifiable) return [{ title: 'bigger than or equal', value: '>=' }, { title: 'bigger than', value: '>' }, { title: 'lower than or equal', value: '<=' }, { title: 'lower than', value: '<' }, { title: 'equal', value: '=' }]
  return [{ title: 'include', value: 'is' }, { title: 'exclude', value: 'is_not' }]
}

function addConditionInline() {
  const isFirst = props.group.conditions.length === 0
  emitGroup([...props.group.conditions, {
    id: uuid(),
    field: null,
    mode: 'include',
    values: [],
    operator: undefined,
    logicalOp: isFirst ? undefined : 'AND',
  }])
}

function removeInner(idx) {
  const next = [...props.group.conditions]
  next.splice(idx, 1)
  if (idx === 0 && next.length > 0) next[0] = { ...next[0], logicalOp: undefined }
  emitGroup(next)
}

function toggleOp(idx) {
  emitGroup(props.group.conditions.map((c, i) =>
    i === idx ? { ...c, logicalOp: c.logicalOp === 'OR' ? 'AND' : 'OR' } : c
  ))
}

function onFieldChange(idx, newField) {
  const def = getTypeDef(newField)
  const next = [...props.group.conditions]
  next[idx] = { ...next[idx], field: newField, mode: 'include', values: [], operator: def?.quantifiable ? '>=' : undefined }
  emitGroup(next)
}

function onOperatorChange(idx, uiOp) {
  const next = [...props.group.conditions]
  const cond = { ...next[idx] }
  if (uiOp === 'is')         { cond.mode = 'include'; delete cond.operator }
  else if (uiOp === 'is_not'){ cond.mode = 'exclude'; delete cond.operator }
  else if (uiOp === 'is_true')  { cond.values = ['true'] }
  else if (uiOp === 'is_false') { cond.values = ['false'] }
  else { cond.operator = uiOp }
  next[idx] = cond
  emitGroup(next)
}

function onValueChange(idx, val) {
  const next = [...props.group.conditions]
  if (Array.isArray(val)) {
    next[idx] = { ...next[idx], values: val }
  } else {
    next[idx] = { ...next[idx], values: val !== null && val !== undefined && val !== '' ? [String(val)] : [] }
  }
  emitGroup(next)
}
</script>

<style scoped>
.condition-group {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  flex: 1;
  min-width: 0;
}

.group-header {
  background: rgba(var(--v-theme-primary), 0.06);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.15);
  border-radius: 4px 4px 0 0;
}

.inner-conditions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.condition-cols {
  display: grid;
  grid-template-columns: minmax(130px, 1.2fr) minmax(100px, 0.8fr) minmax(160px, 2fr) 36px;
  gap: 8px;
  align-items: center;
}

</style>
