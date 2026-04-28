<!-- src/components/promotions/ConditionsEditor.vue -->
<template>
  <div>
    <!-- Toolbar -->
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <span class="text-body-1 font-weight-bold flex-grow-1">{{ title }}</span>
      <v-btn prepend-icon="mdi-download-outline" variant="text" size="small" class="text-uppercase" @click="downloadConditionsTemplate()">
        Template
      </v-btn>
      <v-btn prepend-icon="mdi-upload" variant="outlined" size="small" class="text-uppercase" @click="csvImportOpen = true">
        Import CSV
      </v-btn>
      <v-btn v-if="showPreset" prepend-icon="mdi-filter-variant" variant="outlined" size="small" class="text-uppercase" @click="presetPickerOpen = true">
        Use preset
      </v-btn>
      <v-btn prepend-icon="mdi-plus" variant="outlined" color="primary" size="small" class="text-uppercase" @click="openAdd">
        Add condition
      </v-btn>
    </div>

    <!-- Conditions list with AND / OR toggles -->
    <div v-if="modelValue.length" class="d-flex flex-wrap align-center gap-2 mb-2">
      <template v-for="(cond, idx) in modelValue" :key="cond.id">
        <v-chip
          v-if="idx > 0"
          size="x-small"
          :color="cond.logicalOp === 'OR' ? 'warning' : 'primary'"
          variant="tonal"
          label
          style="cursor: pointer; min-width: 38px; justify-content: center; user-select: none"
          title="Click to toggle AND / OR"
          @click="toggleOp(idx)"
        >
          {{ cond.logicalOp === 'OR' ? 'OR' : 'AND' }}
        </v-chip>

        <ConditionChip
          :condition="cond"
          :scope="scope"
          @edit="openEdit(idx)"
          @remove="remove(idx)"
        />
      </template>
    </div>

    <v-alert v-else type="info" variant="tonal" density="compact" icon="mdi-information">
      <slot name="empty">No conditions set.</slot>
    </v-alert>

    <!-- Dialogs (owned here so both consumers get them for free) -->
    <ConditionBuilderDialog
      v-model="builderOpen"
      :initial-condition="editingCondition"
      :scope="scope"
      @save="onBuilderSave"
    />

    <ConditionCsvImportDialog
      v-model="csvImportOpen"
      @import="onCsvImport"
    />

    <ConditionPresetPickerDialog
      v-if="showPreset"
      v-model="presetPickerOpen"
      @apply="onPresetApply"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuid } from 'uuid'
import ConditionChip from './ConditionChip.vue'
import ConditionBuilderDialog from './ConditionBuilderDialog.vue'
import ConditionCsvImportDialog from './ConditionCsvImportDialog.vue'
import ConditionPresetPickerDialog from './ConditionPresetPickerDialog.vue'
import { downloadConditionsTemplate } from '../../utils/csvRuleImportExport'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  scope: { type: String, default: 'cart' },
  showPreset: { type: Boolean, default: true },
  title: { type: String, default: 'Conditions' },
})
const emit = defineEmits(['update:modelValue'])

// ── Dialog state ──────────────────────────────────────────────────────────────
const builderOpen = ref(false)
const csvImportOpen = ref(false)
const presetPickerOpen = ref(false)
const editingCondition = ref(null)
const editingIdx = ref(null)

// ── Helpers ───────────────────────────────────────────────────────────────────
function withDefaultOp(conditions, isFirst) {
  return conditions.map((c, i) => ({
    ...c,
    id: c.id ?? uuid(),
    logicalOp: (isFirst && i === 0) ? undefined : (c.logicalOp ?? 'AND'),
  }))
}

function emit_(conditions) {
  emit('update:modelValue', conditions)
}

// ── Actions ───────────────────────────────────────────────────────────────────
function openAdd() {
  editingCondition.value = null
  editingIdx.value = null
  builderOpen.value = true
}

function openEdit(idx) {
  editingCondition.value = { ...props.modelValue[idx] }
  editingIdx.value = idx
  builderOpen.value = true
}

function remove(idx) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  // If we removed the old first item, the new first item loses its logicalOp
  if (idx === 0 && next.length > 0) {
    next[0] = { ...next[0], logicalOp: undefined }
  }
  emit_(next)
}

function toggleOp(idx) {
  const next = props.modelValue.map((c, i) =>
    i === idx ? { ...c, logicalOp: c.logicalOp === 'OR' ? 'AND' : 'OR' } : c
  )
  emit_(next)
}

function onBuilderSave(conditions) {
  const isFirst = props.modelValue.length === 0
  if (editingIdx.value !== null) {
    const next = [...props.modelValue]
    next[editingIdx.value] = { ...conditions[0], logicalOp: next[editingIdx.value].logicalOp }
    emit_(next)
  } else {
    const stamped = withDefaultOp(conditions, isFirst)
    emit_([...props.modelValue, ...stamped])
  }
}

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
