<!-- src/components/templates/ConditionPresetForm.vue -->
<template>
  <v-container fluid class="pa-4 pa-sm-8">
    <Breadcrumbs :append-breadcrumbs="breadcrumbs" />

    <div class="d-flex flex-column flex-sm-row align-start align-sm-center mb-6 gap-3">
      <h1 class="text-h5 font-weight-bold">{{ isEdit ? 'Edit condition preset' : 'New condition preset' }}</h1>
      <v-spacer class="d-none d-sm-flex" />
      <div class="action-btn-row">
        <v-btn variant="outlined" @click="discard">Discard</v-btn>
        <v-btn color="success" :loading="saving" @click="save">{{ isEdit ? 'Save' : 'Create' }}</v-btn>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card border elevation="0" class="pa-5 mb-5">
          <div class="text-body-1 font-weight-bold mb-4">Preset details</div>
          <v-text-field
            v-model="form.name"
            label="Preset name *"
            variant="outlined"
            density="compact"
            class="mb-3"
            :error-messages="nameError ? [nameError] : []"
          />
          <v-text-field
            v-model="form.description"
            label="Description"
            variant="outlined"
            density="compact"
          />
        </v-card>

        <ConditionsEditor v-model="form.conditions" :show-preset="false" title="Conditions" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConditionPresetsStore } from '../../stores/conditionPresets'
import ConditionsEditor from '../promotions/ConditionsEditor.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const store = useConditionPresetsStore()

const isEdit = computed(() => !!route.params.id)
const breadcrumbs = computed(() => [
  { title: isEdit.value ? 'Edit preset' : 'New preset', disabled: true },
])

const form = ref({ name: '', description: '', conditions: [] })
const nameError = ref('')
const saving = ref(false)

onMounted(async () => {
  if (isEdit.value) {
    if (!store.items.length) await store.fetchAll()
    const preset = store.items.find(p => p.id === route.params.id)
    if (preset) {
      form.value = {
        name: preset.name ?? '',
        description: preset.description ?? '',
        conditions: preset.conditions.map(c => ({ ...c })),
      }
    }
  }
})

async function save() {
  nameError.value = ''
  if (!form.value.name.trim()) {
    nameError.value = 'Name is required'
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await store.update(route.params.id, { ...form.value })
    } else {
      await store.create({ ...form.value })
    }
    router.push('/templates-presets/condition-presets')
  } finally {
    saving.value = false
  }
}

function discard() {
  router.push('/templates-presets/condition-presets')
}
</script>

<style scoped>
.action-btn-row {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
</style>
