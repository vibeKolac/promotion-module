<!-- src/components/stackingGroups/StackingGroupDialog.vue -->
<template>
  <DialogCard :model-value="modelValue" max-width="460" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>{{ isEditMode ? 'Edit group' : 'New group' }}</template>

    <TextInput v-model="form.name" label="Name" :error-messages="nameError" class="mb-3" />
    <NumberInput v-model.number="form.priority" label="Priority" class="mb-3" />

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

    <template #actions>
      <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
      <v-btn color="primary" variant="flat" :loading="saving" @click="handleSave">
        {{ isEditMode ? 'Update' : 'Create' }}
      </v-btn>
    </template>
  </DialogCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import ColorPicker from '../shared/ColorPicker.vue'
import DialogCard from '../_common/DialogCard.vue'
import TextInput from '../_common/TextInput.vue'
import NumberInput from '../_common/NumberInput.vue'

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

function seedForm(val) {
  if (val) {
    form.value = { name: val.name, priority: val.priority, color: val.color || '#3B82F6', isDefault: val.isDefault || false }
  } else {
    form.value = emptyForm()
  }
  nameError.value = ''
}

watch(() => props.group, (val) => seedForm(val), { immediate: true })

watch(() => props.modelValue, (open) => {
  if (open) seedForm(props.group)
})

async function handleSave() {
  if (!form.value.name.trim()) {
    nameError.value = 'Name is required'
    return
  }
  saving.value = true
  try {
    const payload = { ...form.value }
    if (isEditMode.value) {
      await store.update(props.group.id, payload)
    } else {
      await store.create(payload)
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch {
    // store already set error.value; dialog stays open
  } finally {
    saving.value = false
  }
}
</script>
