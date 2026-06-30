<!-- src/components/templates/TemplatesPage.vue -->
<template>
  <div>
    <v-text-field
      v-model="search"
      placeholder="Search templates…"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-4 search-input"
      clearable
    />

    <div class="d-flex align-center flex-wrap filter-row">
      <v-select
        v-model="typeFilter"
        :items="typeFilterItems"
        item-title="label"
        item-value="value"
        label="Type"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        style="max-width: 220px"
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
      <div v-for="tpl in filtered" :key="tpl.id" :style="mobile ? 'width: 100%' : 'width: 280px'">
        <TemplateCard :template="tpl" @select="applyTemplate" @edit="openEdit" @delete="openDelete" />
      </div>
    </div>
    <v-alert v-else color="grey" variant="tonal" density="compact">No templates match the current filter.</v-alert>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter, useRoute } from 'vue-router'
import { useTemplatesStore } from '../../stores/templates'
import { usePromotionsStore } from '../../stores/promotions'
import TemplateCard from './TemplateCard.vue'

const store = useTemplatesStore()
const promoStore = usePromotionsStore()
const router = useRouter()
const route = useRoute()
const italyMode = computed(() => route.path.startsWith('/italy'))
const { mobile } = useDisplay()

const search = ref('')
const typeFilter = ref([])

const typeFilterItems = [
  { value: 'discount',      label: 'Discount' },
  { value: 'step_discount', label: 'Step discount' },
  { value: 'multi_buy',     label: 'Multi-buy' },
  { value: 'gift',          label: 'Gift' },
]

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' || typeFilter.value.length > 0
)

function clearFilters() {
  search.value = ''
  typeFilter.value = []
}

onMounted(() => store.fetchAll())

const filtered = computed(() => {
  if (italyMode.value) return []
  return store.items
    .filter(t => !typeFilter.value.length || typeFilter.value.includes(t.ruleType))
    .filter(t => !search.value || t.label.toLowerCase().includes(search.value.toLowerCase()) || t.description?.toLowerCase().includes(search.value.toLowerCase()))
})

function applyTemplate(tpl) {
  promoStore.resetDraft()
  if (tpl.ruleSnapshot) {
    Object.assign(promoStore.formDraft, tpl.ruleSnapshot, { name: tpl.label, status: 'draft', startDate: null, endDate: null })
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
