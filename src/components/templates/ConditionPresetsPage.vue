<!-- src/components/templates/ConditionPresetsPage.vue -->
<template>
  <div>
    <v-text-field
      v-model="search"
      placeholder="Search presets…"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-4 search-input"
      clearable
    />

    <div class="d-flex align-center flex-wrap filter-row">
      <v-select
        v-model="conditionFilter"
        :items="conditionFilterItems"
        item-title="title"
        item-value="value"
        label="Condition"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        style="max-width: 240px"
      />
      <v-btn
        v-if="hasActiveFilters"
        variant="text"
        size="small"
        color="primary"
        @click="clearFilters"
      >
        <v-icon size="16" class="mr-1">mdi-close-circle</v-icon>
        Clear filters
      </v-btn>
    </div>

    <div v-if="filtered.length" class="cards-grid">
      <v-card
        v-for="preset in filtered"
        :key="preset.id"
        border
        elevation="0"
        class="pa-4 d-flex flex-column"
        :style="mobile ? 'width: 100%' : 'width: 300px'"
      >
        <div class="d-flex align-center mb-2">
          <span class="text-body-1 font-weight-bold flex-grow-1">{{ preset.name }}</span>
          <v-btn icon="mdi-pencil-outline" variant="text" size="small" density="comfortable" @click.stop="openEdit(preset)" />
          <v-btn icon="mdi-delete-outline" variant="text" size="small" density="comfortable" color="error" @click.stop="openDelete(preset)" />
        </div>
        <div class="text-body-2 text-medium-emphasis flex-grow-1">{{ preset.description }}</div>
      </v-card>
    </div>
    <v-alert v-else color="grey" variant="tonal" density="compact">No condition presets found.</v-alert>

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
import { useRouter } from 'vue-router'
import { useConditionPresetsStore } from '../../stores/conditionPresets'

const store = useConditionPresetsStore()
const { mobile } = useDisplay()
const router = useRouter()
const search = ref('')
const conditionFilter = ref([])

const conditionFilterItems = [
  { type: 'subheader', title: 'Threshold' },
  { value: 'subtotal',        title: 'Subtotal' },
  { value: 'quantity',        title: 'Quantity' },
  { value: 'weight',          title: 'Weight' },
  { type: 'subheader', title: 'Product & Catalog' },
  { value: 'categories',      title: 'Categories' },
  { value: 'brands',          title: 'Brands' },
  { value: 'skus',            title: 'SKUs' },
  { value: 'product_lines',   title: 'Product lines' },
  { value: 'exclude_on_sale', title: 'Exclude on sale' },
  { type: 'subheader', title: 'Customer' },
  { value: 'customer_group',  title: 'Customer group' },
  { value: 'coupon_code',     title: 'Coupon code' },
  { type: 'subheader', title: 'Advanced' },
  { value: 'pim_status',      title: 'PIM status' },
  { value: 'attribute_set',   title: 'Attribute set' },
  { value: 'warehouse_type',  title: 'Warehouse type' },
  { value: 'seller',          title: 'Seller' },
]

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' || conditionFilter.value.length > 0
)

function clearFilters() {
  search.value = ''
  conditionFilter.value = []
}

function presetConditionFields(preset) {
  const fields = new Set()
  function collect(conditions) {
    for (const c of conditions ?? []) {
      if (c.type === 'group') collect(c.conditions)
      else if (c.field) fields.add(c.field)
    }
  }
  collect(preset.conditions)
  return fields
}

const filtered = computed(() =>
  store.items
    .filter(p => !conditionFilter.value.length || conditionFilter.value.some(f => presetConditionFields(p).has(f)))
    .filter(p =>
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
  if (cond.type === 'group') {
    const count = cond.conditions?.length ?? 0
    return `Group (${count})`
  }
  const fieldLabel = FIELD_LABELS[cond.field] ?? cond.field
  if (cond.values?.length) {
    const preview = cond.values.slice(0, 2).join(', ')
    const more = cond.values.length > 2 ? ` +${cond.values.length - 2}` : ''
    return `${fieldLabel}: ${preview}${more}`
  }
  return fieldLabel
}

function openEdit(preset) {
  router.push(`/condition-presets/${preset.id}/edit`)
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

<style scoped>
.search-input {
  max-width: 480px;
}

.filter-row {
  gap: 16px;
  padding: 20px 0;
}

.cards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
</style>
