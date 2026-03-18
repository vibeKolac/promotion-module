<!-- src/components/promotions/PromotionsList.vue -->
<template>
  <v-container fluid class="pa-6">
    <!-- Breadcrumb -->
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <!-- Title row -->
    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Promotion rules overview</h1>
      <v-spacer />
      <v-btn
        color="primary"
        prepend-icon="mdi-robot"
        class="text-uppercase mr-3"
        variant="outlined"
        @click="uiStore.openAiPanel()"
      >
        AI Assistant
      </v-btn>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        class="text-uppercase"
        to="/promotions/new"
      >
        New Promotion Rule
      </v-btn>
    </div>

    <!-- Search -->
    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search in all columns"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-4"
      style="max-width: 480px"
      @update:model-value="onSearch"
    />

    <!-- Filter tabs -->
    <FilterTabs v-model="activeFilter" :tabs="filterTabs" class="mb-4" />

    <!-- Table -->
    <v-card border elevation="0">
      <v-data-table
        :headers="headers"
        :items="store.items"
        :loading="store.loading"
        item-value="id"
        hover
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-2">
            <span class="font-weight-medium">{{ item.name }}</span>
            <ConflictBadge
              v-if="conflictsMap.get(item.id)?.length"
              :conflicts="conflictsMap.get(item.id)"
            />
          </div>
        </template>

        <template #item.type="{ item }">
          <span class="text-medium-emphasis text-capitalize">{{ item.type.replace('_', ' ') }}</span>
        </template>

        <template #item.updatedAt="{ item }">
          <span class="text-medium-emphasis text-caption">{{ formatDate(item.updatedAt) }}</span>
        </template>

        <template #item.status="{ item }">
          <StatusBadge :status="item.status" />
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" :to="`/promotions/${item.id}/edit`" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="openDelete(item)" />
        </template>

        <template #no-data>
          <div class="text-center pa-8 text-medium-emphasis">No promotion rules found</div>
        </template>
      </v-data-table>
    </v-card>

    <ConfirmDeleteDialog
      v-model="deleteDialog"
      :item-name="deletingItem?.name"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePromotionsStore } from '../../stores/promotions'
import { useUiStore } from '../../stores/ui'
import StatusBadge from '../shared/StatusBadge.vue'
import FilterTabs from '../shared/FilterTabs.vue'
import ConfirmDeleteDialog from '../shared/ConfirmDeleteDialog.vue'
import { useDebounceFn } from '@vueuse/core'
import { detectConflicts } from '../../utils/ruleConflictDetector'
import ConflictBadge from './ConflictBadge.vue'

const store = usePromotionsStore()
const uiStore = useUiStore()

const conflictsMap = computed(() => detectConflicts(store.items))

const search = ref('')
const activeFilter = ref('')
const deleteDialog = ref(false)
const deletingItem = ref(null)
const deleting = ref(false)

const breadcrumbs = [
  { title: 'Promotions', disabled: true },
  { title: 'Promotion rules overview', disabled: true },
]

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true, width: '100px' },
  { title: 'Updated', key: 'updatedAt', sortable: true, width: '140px' },
  { title: 'Status', key: 'status', sortable: false, width: '100px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '90px', align: 'end' },
]

const filterTabs = computed(() => {
  const all = store.items
  return [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active', count: all.filter(i => i.status === 'active').length },
    { value: 'inactive', label: 'Inactive' },
    { value: 'discount', label: 'Discount' },
    { value: 'gift', label: 'Gift' },
    { value: 'multi_buy', label: 'Multi-buy' },
    { value: 'step_discount', label: 'Step discount' },
  ]
})

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB')
}

const onSearch = useDebounceFn(() => fetchData(), 300)

function fetchData() {
  const filters = {}
  if (search.value) filters.q = search.value
  if (['active', 'inactive'].includes(activeFilter.value)) filters.status = activeFilter.value
  else if (activeFilter.value) filters.type = activeFilter.value
  store.fetchAll(filters)
}

watch(activeFilter, fetchData)
onMounted(fetchData)

function openDelete(item) {
  deletingItem.value = item
  deleteDialog.value = true
}

async function confirmDelete() {
  deleting.value = true
  await store.remove(deletingItem.value.id)
  deleting.value = false
  deleteDialog.value = false
  deletingItem.value = null
}
</script>
