<!-- src/components/promotions/ConditionGroupRow.vue -->
<template>
  <div class="condition-group rounded border" style="border-color: rgba(var(--v-theme-primary), 0.3) !important; flex: 1; min-width: 0">
    <!-- Header -->
    <div
      class="group-header d-flex align-center px-3 py-2"
      style="background: rgba(var(--v-theme-primary), 0.06); border-bottom: 1px solid rgba(var(--v-theme-primary), 0.15); border-radius: 4px 4px 0 0"
    >
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
      <div v-if="group.conditions.length" class="inner-conditions mb-2">
        <div v-for="(cond, idx) in group.conditions" :key="cond.id" class="condition-row">
          <div class="condition-op">
            <v-chip
              v-if="idx > 0"
              size="x-small"
              :color="cond.logicalOp === 'OR' ? 'warning' : 'primary'"
              variant="tonal"
              label
              style="cursor: pointer; min-width: 38px; justify-content: center; user-select: none; font-weight: 600"
              title="Click to toggle AND / OR"
              @click="toggleOp(idx)"
            >
              {{ cond.logicalOp === 'OR' ? 'OR' : 'AND' }}
            </v-chip>
          </div>
          <ConditionChip
            :condition="cond"
            :scope="scope"
            @edit="openEdit(idx)"
            @remove="removeInner(idx)"
          />
        </div>
      </div>
      <div v-else class="text-caption text-medium-emphasis mb-2 pl-1">No conditions in group yet.</div>

      <v-btn
        size="x-small"
        prepend-icon="mdi-plus"
        variant="outlined"
        class="text-uppercase"
        @click="openAdd"
      >
        Add condition
      </v-btn>
    </div>

    <ConditionBuilderDialog
      v-model="builderOpen"
      :initial-condition="editingCondition"
      :scope="scope"
      @save="onBuilderSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuid } from 'uuid'
import ConditionChip from './ConditionChip.vue'
import ConditionBuilderDialog from './ConditionBuilderDialog.vue'

const props = defineProps({
  group: { type: Object, required: true },
  scope: { type: String, default: 'cart' },
})
const emit = defineEmits(['update:group', 'remove'])

const builderOpen = ref(false)
const editingCondition = ref(null)
const editingIdx = ref(null)

function emitGroup(conditions) {
  emit('update:group', { ...props.group, conditions })
}

function withDefaultOp(conditions, isFirst) {
  return conditions.map((c, i) => ({
    ...c,
    id: c.id ?? uuid(),
    logicalOp: (isFirst && i === 0) ? undefined : (c.logicalOp ?? 'AND'),
  }))
}

function openAdd() {
  editingCondition.value = null
  editingIdx.value = null
  builderOpen.value = true
}

function openEdit(idx) {
  editingCondition.value = { ...props.group.conditions[idx] }
  editingIdx.value = idx
  builderOpen.value = true
}

function removeInner(idx) {
  const next = [...props.group.conditions]
  next.splice(idx, 1)
  if (idx === 0 && next.length > 0) {
    next[0] = { ...next[0], logicalOp: undefined }
  }
  emitGroup(next)
}

function toggleOp(idx) {
  const next = props.group.conditions.map((c, i) =>
    i === idx ? { ...c, logicalOp: c.logicalOp === 'OR' ? 'AND' : 'OR' } : c
  )
  emitGroup(next)
}

function onBuilderSave(conditions) {
  const isFirst = props.group.conditions.length === 0
  if (editingIdx.value !== null) {
    const next = [...props.group.conditions]
    next[editingIdx.value] = { ...conditions[0], logicalOp: next[editingIdx.value].logicalOp }
    emitGroup(next)
  } else {
    const stamped = withDefaultOp(conditions, isFirst)
    emitGroup([...props.group.conditions, ...stamped])
  }
}
</script>

<style scoped>
.inner-conditions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.condition-op {
  width: 44px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}
</style>
