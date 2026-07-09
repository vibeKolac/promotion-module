<!-- src/components/templates/ConditionPresetForm.vue -->
<template>
  <v-container fluid class="pa-4 pa-sm-8">
    <Breadcrumbs :append-breadcrumbs="breadcrumbs" />

    <div class="d-flex flex-column flex-sm-row align-start align-sm-center mb-6 gap-3">
      <h1 class="text-h5 font-weight-bold">{{ isEdit ? 'Edit condition preset' : 'New condition preset' }}</h1>
      <v-spacer class="d-none d-sm-flex" />
      <div class="action-btn-row">
        <v-btn variant="outlined" style="height: 48px" @click="discard">Discard</v-btn>
        <v-btn color="success" style="height: 48px" :loading="saving" @click="save">{{ isEdit ? 'Save' : 'Create' }}</v-btn>
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

        <v-card border elevation="0" class="pa-6 mt-5">
          <ConditionsEditor v-model="form.conditions" :show-preset="false" title="Conditions" />
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="d-none d-md-block">
        <div class="preview-sticky">
          <v-card border elevation="0" class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" size="18">mdi-eye-outline</v-icon>
              <span class="text-body-2 font-weight-bold ml-2">Live Preview</span>
            </div>

            <div v-if="!form.conditions.length" class="d-flex align-center" style="gap: 8px">
              <v-icon size="20" color="medium-emphasis">mdi-information-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">No conditions set.</span>
            </div>

            <v-alert v-else border="start" color="grey" variant="tonal" density="compact" icon="mdi-text-box-check-outline" class="text-caption">
              <span v-if="conditionsPreviewText">{{ conditionsPreviewText }}</span>
              <span v-else class="text-medium-emphasis">Add values to conditions to see a description.</span>
            </v-alert>
          </v-card>
        </div>
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

function _opLabel(op) {
  return { '>=': '≥', '>': '>', '<=': '≤', '<': '<', '=': '=' }[op] ?? op
}

function _fmtList(vals) {
  if (!vals?.length) return '—'
  if (vals.length === 1) return `"${vals[0]}"`
  if (vals.length === 2) return `"${vals[0]}" or "${vals[1]}"`
  return `"${vals[0]}", "${vals[1]}" +${vals.length - 2} more`
}

function _describeLeaf(c) {
  const vals = c.values ?? []
  if (!vals.length || (vals.length === 1 && vals[0] === '')) return null
  const inc = c.mode !== 'exclude'
  switch (c.field) {
    case 'categories': return inc ? `in ${vals.length > 1 ? 'categories' : 'category'} ${_fmtList(vals)}` : `NOT in ${vals.length > 1 ? 'categories' : 'category'} ${_fmtList(vals)}`
    case 'brands': return inc ? `brand is ${_fmtList(vals)}` : `brand is NOT ${_fmtList(vals)}`
    case 'skus': return inc ? `SKU is ${_fmtList(vals)}` : `SKU is NOT ${_fmtList(vals)}`
    case 'product_lines': return inc ? `product line is ${_fmtList(vals)}` : `product line is NOT ${_fmtList(vals)}`
    case 'subtotal': return vals[0] ? `subtotal ${_opLabel(c.operator)} €${vals[0]}` : null
    case 'quantity': return vals[0] ? `quantity ${_opLabel(c.operator)} ${vals[0]}` : null
    case 'weight': return vals[0] ? `weight ${_opLabel(c.operator)} ${vals[0]} g` : null
    case 'customer_group': return inc ? `customer in group ${_fmtList(vals)}` : `customer NOT in group ${_fmtList(vals)}`
    case 'coupon_code': return vals[0] ? `coupon is ${_fmtList(vals)}` : null
    case 'exclude_on_sale': return vals[0] === 'true' ? 'on-sale products excluded' : null
    case 'attribute_set': return inc ? `attribute set is ${_fmtList(vals)}` : `attribute set is NOT ${_fmtList(vals)}`
    case 'seller': return inc ? `seller is ${_fmtList(vals)}` : `seller is NOT ${_fmtList(vals)}`
    case 'warehouse_type': return inc ? `warehouse type is ${_fmtList(vals)}` : `warehouse type is NOT ${_fmtList(vals)}`
    default: return null
  }
}

const route = useRoute()
const router = useRouter()
const basePath = computed(() => route.path.startsWith('/uxtest') ? '/uxtest' : route.path.startsWith('/serbia') ? '/serbia' : '')
const store = useConditionPresetsStore()

const isEdit = computed(() => !!route.params.id)
const breadcrumbs = computed(() => [
  { title: isEdit.value ? 'Edit preset' : 'New preset', disabled: true },
])

const form = ref({ name: '', description: '', conditions: [] })
const nameError = ref('')
const saving = ref(false)

const conditionsPreviewText = computed(() => {
  const allConds = form.value.conditions ?? []
  if (!allConds.length) return null
  const topParts = []
  for (let i = 0; i < allConds.length; i++) {
    const c = allConds[i]
    const sep = i > 0 ? (c.logicalOp === 'OR' ? ' OR ' : ' AND ') : ''
    if (c.type === 'group') {
      const innerParts = []
      for (let j = 0; j < (c.conditions ?? []).length; j++) {
        const inner = c.conditions[j]
        const innerSep = j > 0 ? (inner.logicalOp === 'OR' ? ' OR ' : ' AND ') : ''
        const desc = _describeLeaf(inner)
        if (desc) innerParts.push(innerSep + desc)
      }
      if (innerParts.length) topParts.push(sep + `(${innerParts.join('')})`)
    } else {
      const desc = _describeLeaf(c)
      if (desc) topParts.push(sep + desc)
    }
  }
  return topParts.length ? `Applies where ${topParts.join('')}.` : null
})

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
    router.push(`${basePath.value}/templates-presets/condition-presets`)
  } finally {
    saving.value = false
  }
}

function discard() {
  router.push(`${basePath.value}/templates-presets/condition-presets`)
}
</script>

<style scoped>
.action-btn-row {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.preview-sticky {
  position: sticky;
  top: 68px;
}

</style>
