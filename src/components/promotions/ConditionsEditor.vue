<!-- src/components/promotions/ConditionsEditor.vue -->
<template>
  <div>
    <!-- Header -->
    <template v-if="showHeader">
      <div class="d-flex align-center mb-1">
        <span class="text-body-1 font-weight-bold">{{ title }}</span>
        <HelpTooltip v-if="helpText" :text="helpText" class="ml-1" />
        <v-spacer />
        <v-btn v-if="!uxTestMode" prepend-icon="mdi-upload" variant="text" size="small" @click="csvImportOpen = true">
          Import CSV
          <v-chip size="x-small" color="warning" variant="tonal" label class="ml-2">Exploring</v-chip>
        </v-btn>
        <v-btn v-if="showPreset" prepend-icon="mdi-filter-variant" variant="text" size="small" @click="presetPickerOpen = true">
          Select preset
        </v-btn>
      </div>
      <div v-if="!serbiaMode" class="text-caption text-medium-emphasis mb-4">
        Add conditions or groups. Click the AND / OR chip to switch the operator for the entire group.
      </div>
    </template>

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
            <!-- Value — list type: shared picker with "Not allowed" support -->
            <ConditionValuePicker
              v-else-if="hasOptions(cond)"
              :field="cond.field"
              :model-value="cond.values ?? []"
              :disabled="!cond.field"
              @update:model-value="onValueChange(idx, $event)"
            />
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

    <!-- SKU validation warnings -->
    <v-alert
      v-if="skuConditionWarnings.notAllowed.length"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3 text-caption"
    >
      <div class="d-flex align-center justify-space-between" style="gap: 8px">
        <span>
          <strong>{{ skuConditionWarnings.notAllowed.length }} not allowed (globally excluded):</strong>
          {{ skuConditionWarnings.notAllowed.join(', ') }}
        </span>
        <v-btn size="x-small" variant="tonal" color="error" @click="removeSkusFromConditions(skuConditionWarnings.notAllowed)">Remove</v-btn>
      </div>
    </v-alert>
    <v-alert
      v-if="skuConditionWarnings.outOfStock.length"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-3 text-caption"
    >
      <div class="d-flex align-center justify-space-between" style="gap: 8px">
        <span>
          <strong>{{ skuConditionWarnings.outOfStock.length }} out of stock:</strong>
          {{ skuConditionWarnings.outOfStock.join(', ') }}
        </span>
        <v-btn size="x-small" variant="tonal" color="warning" @click="removeSkusFromConditions(skuConditionWarnings.outOfStock)">Remove</v-btn>
      </div>
    </v-alert>
    <v-alert
      v-if="skuConditionWarnings.notFound.length"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3 text-caption"
    >
      <div class="d-flex align-center justify-space-between" style="gap: 8px">
        <span>
          <strong>{{ skuConditionWarnings.notFound.length }} not found:</strong>
          {{ skuConditionWarnings.notFound.join(', ') }}
        </span>
        <v-btn size="x-small" variant="tonal" color="error" @click="removeSkusFromConditions(skuConditionWarnings.notFound)">Remove</v-btn>
      </div>
    </v-alert>

    <!-- Actions -->
    <div v-if="!serbiaMode" class="condition-actions">
      <v-btn prepend-icon="mdi-plus" variant="outlined" size="default" @click="addConditionInline">
        Add condition
      </v-btn>
      <v-btn v-if="allowGroups" prepend-icon="mdi-table-plus" variant="outlined" size="default" @click="openAddGroup">
        Add group
      </v-btn>
    </div>

    <!-- Dialogs -->
    <ConditionCsvImportDialog v-if="showHeader" v-model="csvImportOpen" @import="onCsvImport" />
    <ConditionPresetPickerDialog v-if="showPreset && showHeader" v-model="presetPickerOpen" @apply="onPresetApply" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { v4 as uuid } from 'uuid'
import HelpTooltip from '../_common/HelpTooltip.vue'
import ConditionGroupRow from './ConditionGroupRow.vue'
import ConditionCsvImportDialog from './ConditionCsvImportDialog.vue'
import ConditionPresetPickerDialog from './ConditionPresetPickerDialog.vue'
import SkuValuePicker from './SkuValuePicker.vue'
import ConditionValuePicker from './ConditionValuePicker.vue'
import { downloadConditionsTemplate } from '../../utils/csvRuleImportExport'
import { validateSkus } from '../../utils/skuValidation'
import { useSettingsStore } from '../../stores/settings'
import { getRecentConditionTypes, recordConditionTypes } from '../../utils/recentConditionTypes'
import { CONDITION_TYPES, CONDITION_GROUPS, TYPE_OPTIONS, getConditionTypeDef } from '../../utils/conditionTypes'

const route = useRoute()
const uxTestMode = computed(() => route.path.startsWith('/uxtest') || route.path.startsWith('/serbia'))
const serbiaMode = computed(() => route.path.startsWith('/serbia'))
const settingsStore = useSettingsStore()
const recentTypeValues = ref(getRecentConditionTypes())

// ── Props / emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue:  { type: Array,   default: () => [] },
  scope:       { type: String,  default: 'cart' },
  showPreset:  { type: Boolean, default: true },
  showHeader:  { type: Boolean, default: true },
  allowGroups: { type: Boolean, default: true },
  title:       { type: String,  default: 'Condition Builder' },
  helpText:    { type: String,  default: null },
})
const emit = defineEmits(['update:modelValue'])

// ── Dialog state ──────────────────────────────────────────────────────────────
const csvImportOpen = ref(false)
const presetPickerOpen = ref(false)

// Serbia has no add/remove UI — keep exactly one condition row present at all times
watch(() => props.modelValue.length, (len) => {
  if (serbiaMode.value && len === 0) addConditionInline()
}, { immediate: true })

// ── Type helpers ──────────────────────────────────────────────────────────────
const typeSelectItems = computed(() => {
  if (serbiaMode.value) {
    const thresholdGroup = CONDITION_GROUPS.find(g => g.label === 'Threshold')
    return [
      { type: 'subheader', title: thresholdGroup.label },
      { title: 'Subtotal', value: 'subtotal' },
    ]
  }
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

function getTypeDef(field) { return getConditionTypeDef(field) }
function isQuantifiable(cond) { return !!getTypeDef(cond.field)?.quantifiable }
function isBoolean(cond)      { return !!getTypeDef(cond.field)?.boolean }
function isSkuField(cond)     { return cond.field === 'skus' }
function getValueSuffix(cond) { return cond.field === 'weight' ? 'g' : undefined }
function hasOptions(cond)     { return !!(cond.field && TYPE_OPTIONS[cond.field]) }

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

// ── SKU validation ────────────────────────────────────────────────────────────
const skuConditionWarnings = computed(() => {
  const skus = props.modelValue
    .filter(c => c.field === 'skus')
    .flatMap(c => c.values ?? [])
  if (!skus.length) return { outOfStock: [], notFound: [], notAllowed: [] }
  const { outOfStock, notFound } = validateSkus(skus)
  const excludedSet = new Set(settingsStore.excludedSkus)
  const notAllowed = skus.filter(s => excludedSet.has(s))
  return { outOfStock, notFound, notAllowed }
})

function removeSkusFromConditions(skusToRemove) {
  const toRemove = new Set(skusToRemove)
  emit_(props.modelValue.map(c =>
    c.field === 'skus' && c.values
      ? { ...c, values: c.values.filter(s => !toRemove.has(s)) }
      : c
  ))
}

function currentGroupOp() {
  return props.modelValue.find(c => c.logicalOp)?.logicalOp ?? 'AND'
}

function withDefaultOp(conditions, isFirst) {
  const groupOp = isFirst ? 'AND' : currentGroupOp()
  return conditions.map((c, i) => ({
    ...c,
    id: c.id ?? uuid(),
    logicalOp: (isFirst && i === 0) ? undefined : groupOp,
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
    logicalOp: isFirst ? undefined : currentGroupOp(),
  }])
}

function openAddGroup() {
  const isFirst = props.modelValue.length === 0
  emit_([...props.modelValue, {
    id: uuid(),
    type: 'group',
    conditions: [],
    logicalOp: isFirst ? undefined : currentGroupOp(),
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
  const nextOp = (props.modelValue[idx]?.logicalOp ?? 'AND') === 'OR' ? 'AND' : 'OR'
  emit_(props.modelValue.map((c, i) =>
    i === 0 ? c : { ...c, logicalOp: nextOp }
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
