<!-- src/components/stackingGroups/StackingGroupDialog.vue -->
<template>
  <v-dialog :model-value="modelValue" max-width="460" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6 pa-5 pb-2">
        {{ isEditMode ? 'Edit group' : 'New group' }}
      </v-card-title>

      <v-card-text class="pa-5 pt-2">
        <v-text-field
          v-model="form.name"
          label="Name"
          variant="outlined"
          density="compact"
          class="mb-3"
          :error-messages="nameError"
        />

        <v-text-field
          v-model.number="form.priority"
          label="Priority"
          type="number"
          variant="outlined"
          density="compact"
          class="mb-3"
        />

        <div class="mb-3">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-2">COLOR</div>
          <ColorPicker v-model="form.color" />
        </div>

        <v-switch
          v-model="form.isDefault"
          label="Default group"
          density="compact"
          color="primary"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" @click="handleSave">
          {{ isEditMode ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import ColorPicker from '../shared/ColorPicker.vue'

const props = defineProps({
  modelValue: Boolean,
  group: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const store = useStackingGroupsStore()

const isEditMode = computed(() => !!props.group)

const emptyForm = () => ({
  name: '',
  priority: 10,
  color: '#3B82F6',
  isDefault: false,
})

const form = ref(emptyForm())
const saving = ref(false)
const nameError = ref('')

watch(
  () => props.group,
  (val) => {
    if (val) {
      form.value = { name: val.name, priority: val.priority, color: val.color || '#3B82F6', isDefault: val.isDefault || false }
    } else {
      form.value = emptyForm()
    }
    nameError.value = ''
  },
  { immediate: true }
)

async function handleSave() {
  nameError.value = ''
  if (!form.value.name.trim()) {
    nameError.value = 'Name is required'
    return
  }

  saving.value = true
  try {
    if (isEditMode.value) {
      await store.update(props.group.id, { ...form.value })
    } else {
      await store.create({ ...form.value })
    }
    emit('saved')
    emit('update:modelValue', false)
  } finally {
    saving.value = false
  }
}
</script>
