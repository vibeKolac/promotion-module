<template>
  <v-dialog v-model="open" max-width="560" persistent>
    <v-card>
      <v-card-title class="pa-5 pb-2">Edit conditions — {{ selectedCount }} rules</v-card-title>
      <v-card-text class="pa-5 pt-2">
        <v-btn-toggle v-model="mode" mandatory divided variant="outlined" color="primary" class="mb-4 w-100">
          <v-btn value="add" class="flex-grow-1">Add conditions</v-btn>
          <v-btn value="replace" class="flex-grow-1">Replace conditions</v-btn>
        </v-btn-toggle>
        <v-alert v-if="mode === 'replace'" type="warning" variant="tonal" density="compact" class="mb-4">
          This will replace ALL existing conditions on the selected rules.
        </v-alert>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <ConditionChip
            v-for="(cond, idx) in conditions"
            :key="cond.id"
            :condition="cond"
            @remove="conditions.splice(idx, 1)"
            @edit="openEdit(idx)"
          />
        </div>
        <v-btn variant="outlined" color="primary" size="small" prepend-icon="mdi-plus" @click="openAdd">
          Add condition
        </v-btn>
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="mode === 'replace' && conditions.length === 0"
          @click="apply"
        >Apply to {{ selectedCount }} rules</v-btn>
      </v-card-actions>
    </v-card>

    <ConditionBuilderDialog
      v-model="condDialogOpen"
      :initial-condition="editingCondition"
      @save="onCondSave"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuid } from 'uuid'
import ConditionChip from '../promotions/ConditionChip.vue'
import ConditionBuilderDialog from '../promotions/ConditionBuilderDialog.vue'

const props = defineProps({ modelValue: Boolean, selectedCount: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue', 'apply'])

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const mode = ref('add')
const conditions = ref([])
const condDialogOpen = ref(false)
const editingCondition = ref(null)
const editingIdx = ref(null)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    mode.value = 'add'
    conditions.value = []
    editingCondition.value = null
    editingIdx.value = null
  }
})

function openAdd() { editingCondition.value = null; editingIdx.value = null; condDialogOpen.value = true }
function openEdit(idx) { editingCondition.value = { ...conditions.value[idx] }; editingIdx.value = idx; condDialogOpen.value = true }
function onCondSave(c) {
  if (editingIdx.value !== null) conditions.value[editingIdx.value] = c
  else conditions.value.push({ ...c, id: uuid() })
}
function apply() {
  if (mode.value === 'replace' && conditions.value.length === 0) {
    return
  }
  emit('apply', { mode: mode.value, conditions: conditions.value })
  emit('update:modelValue', false)
}
</script>
