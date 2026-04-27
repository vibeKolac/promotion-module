<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="[{ title: 'Templates', disabled: true }]" density="compact" class="pa-0 mb-2" />

    <div class="d-flex flex-wrap align-center gap-2 mb-5">
      <h1 class="text-h5 font-weight-bold">Templates</h1>
      <v-spacer />
      <v-text-field
        v-model="search"
        placeholder="Search templates…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 280px"
        clearable
      />
    </div>

    <v-chip-group v-model="selectedCategory" mandatory color="primary" class="mb-5">
      <v-chip v-for="cat in categories" :key="cat.value" :value="cat.value" filter variant="outlined">
        {{ cat.label }} <span v-if="cat.count" class="ml-1 text-caption">({{ cat.count }})</span>
      </v-chip>
    </v-chip-group>

    <div v-if="filtered.length" class="d-flex flex-wrap gap-4">
      <div v-for="tpl in filtered" :key="tpl.id" :style="mobile ? 'width: 100%' : 'width: 280px'">
        <TemplateCard :template="tpl" @select="applyTemplate" @edit="openEdit" @delete="openDelete" />
      </div>
    </div>
    <v-alert v-else type="info" variant="tonal" density="compact">No templates</v-alert>

    <!-- Delete dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete template?</v-card-title>
        <v-card-text>
          This action cannot be undone. The template <strong>{{ deletingTemplate?.label }}</strong> will be permanently deleted.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '../../stores/templates'
import { usePromotionsStore } from '../../stores/promotions'
import TemplateCard from './TemplateCard.vue'

const store = useTemplatesStore()
const promoStore = usePromotionsStore()
const router = useRouter()
const { mobile } = useDisplay()
const search = ref('')
const selectedCategory = ref('all')

onMounted(() => store.fetchAll())

const categories = computed(() => {
  const cats = ['flash', 'seasonal', 'loyalty', 'bulk', 'category', 'gift']
  return [
    { value: 'all', label: 'All', count: store.items.length },
    ...cats.map(c => ({
      value: c,
      label: c.charAt(0).toUpperCase() + c.slice(1),
      count: store.items.filter(t => t.category === c).length
    })).filter(c => c.count),
  ]
})

const filtered = computed(() =>
  store.items
    .filter(t => selectedCategory.value === 'all' || t.category === selectedCategory.value)
    .filter(t => !search.value || t.label.toLowerCase().includes(search.value.toLowerCase()) || t.description?.toLowerCase().includes(search.value.toLowerCase()))
)

function applyTemplate(tpl) {
  promoStore.resetDraft()
  if (tpl.ruleSnapshot) {
    Object.assign(promoStore.formDraft, tpl.ruleSnapshot, {
      name: tpl.label,
      status: 'draft',
      startDate: null,
      endDate: null,
    })
  } else {
    Object.assign(promoStore.formDraft, {
      type: tpl.ruleType ?? 'discount',
      value: tpl.defaultValue ?? '',
      valueUnit: tpl.defaultValueUnit ?? '%',
      conditions: tpl.defaultConditions ? [...tpl.defaultConditions] : [],
      name: tpl.label,
    })
  }
  router.push({ path: '/promotions/new', query: { fromTemplate: '1' } })
}

function openEdit(tpl) {
  router.push(`/templates/${tpl.id}/edit`)
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteDialogOpen = ref(false)
const deleting = ref(false)
const deletingTemplate = ref(null)

function openDelete(tpl) {
  deletingTemplate.value = tpl
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await store.remove(deletingTemplate.value.id)
    deleteDialogOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>
