<!-- src/components/templates/ConditionPresetsPage.vue -->
<template>
  <div>
    <div class="d-flex flex-wrap align-center gap-2 mb-5">
      <div class="text-body-1 text-medium-emphasis flex-grow-1">
        Saved condition sets you can apply to any promotion rule with one click.
      </div>
      <v-text-field
        v-model="search"
        placeholder="Search presets…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 280px"
        clearable
      />
      <v-btn color="primary" prepend-icon="mdi-plus" variant="flat" size="small" class="text-uppercase" @click="openCreate">
        New preset
      </v-btn>
    </div>

    <div v-if="filtered.length" class="d-flex flex-wrap gap-4">
      <v-card
        v-for="preset in filtered"
        :key="preset.id"
        border
        elevation="0"
        class="pa-4 d-flex flex-column"
        :style="mobile ? 'width: 100%' : 'width: 300px'"
      >
        <div class="d-flex align-start mb-2">
          <v-avatar color="primary" variant="tonal" size="36">
            <v-icon color="primary" size="20">mdi-filter-variant</v-icon>
          </v-avatar>
          <v-spacer />
          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" icon="mdi-dots-vertical" variant="text" size="small" density="comfortable" @click.stop />
            </template>
            <v-list density="compact" min-width="160">
              <v-list-item prepend-icon="mdi-pencil-outline" title="Edit" @click="openEdit(preset)" />
              <v-list-item prepend-icon="mdi-delete-outline" title="Delete" class="text-error" @click="openDelete(preset)" />
            </v-list>
          </v-menu>
        </div>

        <div class="text-body-1 font-weight-bold mb-1">{{ preset.name }}</div>
        <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-3">{{ preset.description }}</div>

        <div class="d-flex flex-wrap gap-1 mb-3">
          <v-chip
            v-for="cond in preset.conditions"
            :key="cond.id"
            size="x-small"
            color="primary"
            variant="tonal"
            label
          >
            {{ conditionLabel(cond) }}
          </v-chip>
          <span v-if="!preset.conditions.length" class="text-caption text-medium-emphasis">No conditions</span>
        </div>

        <div class="text-caption text-medium-emphasis">
          {{ preset.conditions.length }} condition{{ preset.conditions.length !== 1 ? 's' : '' }}
        </div>
      </v-card>
    </div>
    <v-alert v-else type="info" variant="tonal" density="compact">No condition presets found.</v-alert>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="formDialogOpen" max-width="560" scrollable>
      <v-card>
        <v-card-title class="text-h6 pa-5 pb-3">{{ editing ? 'Edit preset' : 'New condition preset' }}</v-card-title>
        <v-card-text class="pa-5 pt-0">
          <v-text-field
            v-model="form.name"
            label="Preset name *"
            variant="outlined"
            density="compact"
            class="mb-3"
            :error-messages="formErrors.name"
          />
          <v-text-field
            v-model="form.description"
            label="Description"
            variant="outlined"
            density="compact"
            class="mb-4"
          />

          <ConditionsEditor v-model="form.conditions" :show-preset="false" title="Conditions" />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="formDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="savePreset">{{ editing ? 'Save' : 'Create' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Delete confirm -->
    <v-dialog v-model="deleteDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete preset?</v-card-title>
        <v-card-text>
          <strong>{{ deletingPreset?.name }}</strong> will be permanently deleted.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useConditionPresetsStore } from '../../stores/conditionPresets'
import ConditionsEditor from '../promotions/ConditionsEditor.vue'

const store = useConditionPresetsStore()
const { mobile } = useDisplay()
const search = ref('')

const filtered = computed(() =>
  store.items.filter(p =>
    !search.value ||
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.value.toLowerCase())
  )
)

// ── Labels ────────────────────────────────────────────────────────────────────
const FIELD_LABELS = {
  categories: 'Category', brands: 'Brand', skus: 'SKU', product_lines: 'Product line',
  subtotal: 'Subtotal', quantity: 'Quantity', weight: 'Weight',
  customer_group: 'Customer group', coupon_code: 'Coupon', exclude_on_sale: 'Exclude on sale',
  pim_status: 'PIM status', attribute_set: 'Attribute set', source: 'Source',
  warehouse_type: 'Warehouse', seller: 'Seller',
}

function conditionLabel(cond) {
  const fieldLabel = FIELD_LABELS[cond.field] ?? cond.field
  if (cond.values?.length) {
    const preview = cond.values.slice(0, 2).join(', ')
    const more = cond.values.length > 2 ? ` +${cond.values.length - 2}` : ''
    return `${fieldLabel}: ${preview}${more}`
  }
  return fieldLabel
}

// ── Create / Edit ─────────────────────────────────────────────────────────────
const formDialogOpen = ref(false)
const editing = ref(null)
const form = ref({ name: '', description: '', conditions: [] })
const formErrors = ref({})
function openCreate() {
  editing.value = null
  form.value = { name: '', description: '', conditions: [] }
  formErrors.value = {}
  formDialogOpen.value = true
}

function openEdit(preset) {
  editing.value = preset
  form.value = { name: preset.name, description: preset.description ?? '', conditions: preset.conditions.map(c => ({ ...c })) }
  formErrors.value = {}
  formDialogOpen.value = true
}

function savePreset() {
  formErrors.value = {}
  if (!form.value.name.trim()) {
    formErrors.value.name = 'Name is required'
    return
  }
  if (editing.value) {
    store.update(editing.value.id, { ...form.value })
  } else {
    store.create({ ...form.value })
  }
  formDialogOpen.value = false
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteDialogOpen = ref(false)
const deletingPreset = ref(null)

function openDelete(preset) {
  deletingPreset.value = preset
  deleteDialogOpen.value = true
}

function confirmDelete() {
  store.remove(deletingPreset.value.id)
  deleteDialogOpen.value = false
}
</script>
