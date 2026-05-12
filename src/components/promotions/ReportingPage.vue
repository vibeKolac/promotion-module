<!-- src/components/promotions/ReportingPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Reporting</h1>
    </ContentHeader>

    <v-alert color="grey" variant="tonal" density="compact" class="mb-4" icon="mdi-chart-bar">
      Basic reporting is available here. For more detail, check the
      <a href="#" class="text-decoration-underline">Power BI report</a>.
    </v-alert>

    <!-- Search -->
    <TextInput
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search by name"
      hide-details
      class="mb-4"
      :class="mobile ? '' : 'search-input'"
    />

    <!-- Filter row -->
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
        style="max-width: 200px"
      />
      <v-select
        v-model="statusFilter"
        :items="statusFilterItems"
        item-title="label"
        item-value="value"
        label="Status"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        style="max-width: 200px"
      />
      <v-select
        v-model="createdByFilter"
        :items="createdByFilterItems"
        item-title="title"
        item-value="value"
        label="Created by"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 180px"
      />
      <v-select
        v-model="dateFilter"
        :items="dateFilterItems"
        item-title="title"
        item-value="value"
        label="Date"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 175px"
      />
      <template v-if="dateFilter === 'custom'">
        <DatePicker v-model="customDateFrom" label="From" style="max-width: 175px" />
        <DatePicker v-model="customDateTo" label="To" style="max-width: 175px" />
      </template>
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

    <v-card border elevation="0">
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="store.loading"
        :row-props="() => ({ style: 'cursor: pointer' })"
        item-value="id"
        hover
        @click:row="openDetail"
      >
        <template #item.type="{ item }">
          <span class="text-medium-emphasis text-capitalize">{{ item.type.replace('_', ' ') }}</span>
        </template>

        <template #item.usageCount="{ item }">
          <span v-if="item.usageCount !== undefined">{{ item.usageCount.toLocaleString() }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.completedOrders="{ item }">
          <span v-if="item.completedOrders !== undefined">{{ item.completedOrders.toLocaleString() }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.createdBy="{ item }">
          <span class="text-caption text-medium-emphasis">{{ item.createdBy ?? '—' }}</span>
        </template>

        <template #no-data>
          <div class="text-center pa-8 text-medium-emphasis">No promotion rules match the current filters</div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import { usePromotionsStore } from '../../stores/promotions'
import TextInput from '../_common/TextInput.vue'
import DatePicker from '../_common/DatePicker.vue'

const store = usePromotionsStore()
const { mobile } = useDisplay()
const router = useRouter()

function openDetail(_, { item }) {
  router.push(`/promotions/reporting/${item.id}`)
}

// ── Filter state ──────────────────────────────────────────────────────────────
const search = ref('')
const typeFilter = ref([])
const statusFilter = ref([])
const createdByFilter = ref('')
const dateFilter = ref('any')
const customDateFrom = ref(null)
const customDateTo = ref(null)

const TYPE_LABELS = { discount: 'Discount', gift: 'Gift', multi_buy: 'Multi-buy', step_discount: 'Step discount' }
const STATUS_LABELS = { active: 'Active', scheduled: 'Scheduled', paused: 'Paused', draft: 'Draft', ended: 'Ended' }

const typeFilterItems = computed(() =>
  [...new Set(store.items.map(r => r.type))].sort().map(t => ({ label: TYPE_LABELS[t] ?? t, value: t }))
)
const statusFilterItems = computed(() =>
  [...new Set(store.items.map(r => r.status))].sort().map(s => ({ label: STATUS_LABELS[s] ?? s, value: s }))
)
const dateFilterItems = [
  { value: 'any',     title: 'Any date' },
  { value: 'last_7',  title: 'Last 7 days' },
  { value: 'last_14', title: 'Last 14 days' },
  { value: 'last_30', title: 'Last 30 days' },
  { value: 'custom',  title: 'Custom period' },
]

const createdByFilterItems = computed(() => [
  { value: '', title: 'All creators' },
  ...[...new Set(store.items.map(r => r.createdBy).filter(Boolean))].sort()
    .map(c => ({ value: c, title: c })),
])

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' ||
  typeFilter.value.length > 0 ||
  statusFilter.value.length > 0 ||
  createdByFilter.value !== '' ||
  dateFilter.value !== 'any' ||
  !!customDateFrom.value || !!customDateTo.value
)

function clearFilters() {
  search.value = ''
  typeFilter.value = []
  statusFilter.value = []
  createdByFilter.value = ''
  dateFilter.value = 'any'
  customDateFrom.value = null
  customDateTo.value = null
}

// ── Filtered items ────────────────────────────────────────────────────────────
const filteredItems = computed(() => {
  let result = [...store.items]
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(q))
  }
  if (typeFilter.value.length) result = result.filter(r => typeFilter.value.includes(r.type))
  if (statusFilter.value.length) result = result.filter(r => statusFilter.value.includes(r.status))
  if (createdByFilter.value) result = result.filter(r => r.createdBy === createdByFilter.value)
  if (dateFilter.value !== 'any') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dateFilter.value === 'last_7' || dateFilter.value === 'last_14' || dateFilter.value === 'last_30') {
      const days = dateFilter.value === 'last_7' ? 7 : dateFilter.value === 'last_14' ? 14 : 30
      const from = new Date(today)
      from.setDate(from.getDate() - days)
      const fromIso = from.toISOString().split('T')[0]
      const todayIso = today.toISOString().split('T')[0]
      result = result.filter(r =>
        (!r.startDate || r.startDate <= todayIso) && (!r.endDate || r.endDate >= fromIso)
      )
    } else if (dateFilter.value === 'custom') {
      if (customDateFrom.value) result = result.filter(r => !r.endDate || r.endDate >= customDateFrom.value)
      if (customDateTo.value) result = result.filter(r => !r.startDate || r.startDate <= customDateTo.value)
    }
  }
  return result
})

const headers = computed(() => [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Type', key: 'type' },
  { title: 'Usages', key: 'usageCount', sortable: true },
  { title: 'Completed Orders', key: 'completedOrders', sortable: true },
  ...(mobile.value ? [] : [
    { title: 'Created by', key: 'createdBy' },
  ]),
])

onMounted(async () => {
  await store.fetchAll()
})
</script>

<style scoped>
.search-input {
  max-width: 480px;
}

.filter-row {
  gap: 16px;
  padding: 20px 0;
}
</style>
