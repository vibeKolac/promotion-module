<!-- src/components/promotions/ReportingPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Reporting</h1>
    </div>

    <v-alert type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-chart-bar">
      Basic reporting is available here. For more detail, check the
      <a href="#" class="text-decoration-underline">Power BI report</a>.
      Revenue figures are estimates.
    </v-alert>

    <!-- Summary row -->
    <div class="d-flex flex-wrap gap-3 mb-5">
      <v-card border elevation="0" class="pa-4" style="min-width:320px; flex:3 1 320px">
        <div class="text-caption text-medium-emphasis mb-2">Distribution</div>
        <Bar :data="chartData" :options="chartOptions" style="max-height:100px" />
      </v-card>
      <v-card border elevation="0" class="pa-4 d-flex flex-column justify-center" style="min-width:180px; flex:1 1 180px">
        <div class="text-caption text-medium-emphasis mb-1">Total estimated revenue</div>
        <div class="text-h5 font-weight-bold text-success">{{ totalRevenue }}</div>
      </v-card>
    </div>

    <!-- Search -->
    <TextInput
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search by name"
      hide-details
      class="mb-4"
      :style="mobile ? '' : 'max-width: 480px'"
    />

    <!-- Filter bar -->
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <span class="text-caption text-medium-emphasis mr-1">Type:</span>
      <v-chip
        v-for="t in availableTypes"
        :key="t"
        :color="typeFilter.includes(t) ? 'primary' : undefined"
        :variant="typeFilter.includes(t) ? 'flat' : 'outlined'"
        size="small"
        style="cursor:pointer"
        @click="toggleType(t)"
      >{{ TYPE_LABELS[t] ?? t }}</v-chip>

      <v-divider v-if="!mobile" vertical class="mx-1" style="align-self:stretch; opacity:.3" />

      <span class="text-caption text-medium-emphasis mr-1">Status:</span>
      <v-chip
        v-for="s in availableStatuses"
        :key="s"
        :color="statusFilter.includes(s) ? 'primary' : undefined"
        :variant="statusFilter.includes(s) ? 'flat' : 'outlined'"
        size="small"
        style="cursor:pointer"
        @click="toggleStatus(s)"
      >{{ STATUS_LABELS[s] ?? s }}</v-chip>

      <v-divider v-if="!mobile && tagsStore.items.length" vertical class="mx-1" style="align-self:stretch; opacity:.3" />

      <template v-if="tagsStore.items.length">
        <span class="text-caption text-medium-emphasis mr-1">Tags:</span>
        <v-chip
          v-for="tag in tagsStore.items"
          :key="tag.id"
          :color="tagFilter.includes(tag.id) ? tag.color : undefined"
          :variant="tagFilter.includes(tag.id) ? 'flat' : 'outlined'"
          size="small"
          style="cursor:pointer"
          @click="toggleTag(tag.id)"
        >
          <v-icon v-if="tagFilter.includes(tag.id)" start size="12">mdi-check</v-icon>
          {{ tag.name }}
        </v-chip>
      </template>

      <v-divider v-if="!mobile" vertical class="mx-1" style="align-self:stretch; opacity:.3" />

      <SelectInput
        v-model="createdByFilter"
        :data="createdByFilterItems"
        label="Created by"
        hide-details
        style="max-width: 160px; min-width: 130px"
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
        <v-chip size="x-small" color="primary" class="ml-1">{{ activeFilterCount }}</v-chip>
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

        <template #item.performance="{ item }">
          <span v-if="item.performance !== undefined" class="font-weight-bold text-success">{{ item.performance }}%</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.revenue="{ item }">
          <span v-if="item.revenue" class="text-success">{{ item.revenue }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.usageCount="{ item }">
          <span v-if="item.usageCount !== undefined">{{ item.usageCount.toLocaleString() }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.createdBy="{ item }">
          <span class="text-caption text-medium-emphasis">{{ item.createdBy ?? '—' }}</span>
        </template>

        <template #item.tags="{ item }">
          <div class="d-flex flex-wrap gap-1 py-1">
            <template v-if="(item.tags ?? []).length">
              <v-chip
                v-for="tagId in item.tags"
                :key="tagId"
                :color="tagsStore.items.find(t => t.id === tagId)?.color"
                size="x-small"
                label
                variant="flat"
              >
                {{ tagsStore.items.find(t => t.id === tagId)?.name ?? tagId }}
              </v-chip>
            </template>
            <span v-else class="text-caption text-medium-emphasis">—</span>
          </div>
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
import { usePromotionsStore } from '../../stores/promotions'
import { useTagsStore } from '../../stores/tags'
import TextInput from '../_common/TextInput.vue'
import SelectInput from '../_common/SelectInput.vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const store = usePromotionsStore()
const tagsStore = useTagsStore()
const { mobile } = useDisplay()
const router = useRouter()

function openDetail(_, { item }) {
  router.push(`/promotions/reporting/${item.id}`)
}

// ── Filter state ──────────────────────────────────────────────────────────────
const search = ref('')
const typeFilter = ref([])
const statusFilter = ref([])
const tagFilter = ref([])
const createdByFilter = ref('')

const TYPE_LABELS = { discount: 'Discount', gift: 'Gift', multi_buy: 'Multi-buy', step_discount: 'Step discount' }
const STATUS_LABELS = { active: 'Active', scheduled: 'Scheduled', paused: 'Paused', draft: 'Draft', ended: 'Ended' }
const TYPE_ORDER = ['discount', 'step_discount', 'multi_buy', 'gift']
const STATUS_ORDER = ['active', 'scheduled', 'paused', 'draft', 'ended']
const STATUS_COLORS_CHART = { active: '#4caf50', scheduled: '#2196f3', paused: '#ff9800', draft: '#9e9e9e', ended: '#bdbdbd' }

const countByType = computed(() =>
  store.items.reduce((acc, r) => { acc[r.type] = (acc[r.type] ?? 0) + 1; return acc }, {})
)
const countByStatus = computed(() =>
  store.items.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc }, {})
)

const totalRevenue = computed(() => {
  const sum = store.items.reduce((acc, r) => {
    if (!r.revenue) return acc
    const n = parseFloat(r.revenue.replace(/[^0-9.]/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)
  return sum ? `€${sum.toLocaleString()}` : '—'
})

const chartData = computed(() => ({
  labels: [
    ...TYPE_ORDER.map(t => TYPE_LABELS[t]),
    ...STATUS_ORDER.map(s => STATUS_LABELS[s]),
  ],
  datasets: [
    {
      label: 'By type',
      data: [...TYPE_ORDER.map(t => countByType.value[t] ?? 0), ...STATUS_ORDER.map(() => null)],
      backgroundColor: '#1976d2',
      borderRadius: 3,
    },
    {
      label: 'By status',
      data: [...TYPE_ORDER.map(() => null), ...STATUS_ORDER.map(s => countByStatus.value[s] ?? 0)],
      backgroundColor: STATUS_ORDER.map(s => STATUS_COLORS_CHART[s]),
      borderRadius: 3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.06)' } },
  },
}

const availableTypes = computed(() => [...new Set(store.items.map(r => r.type))].sort())
const availableStatuses = computed(() => [...new Set(store.items.map(r => r.status))].sort())

const createdByFilterItems = computed(() => [
  { value: '', title: 'All creators' },
  ...[...new Set(store.items.map(r => r.createdBy).filter(Boolean))].sort()
    .map(c => ({ value: c, title: c })),
])

function toggleType(t) {
  const idx = typeFilter.value.indexOf(t)
  if (idx === -1) typeFilter.value.push(t)
  else typeFilter.value.splice(idx, 1)
}

function toggleStatus(s) {
  const idx = statusFilter.value.indexOf(s)
  if (idx === -1) statusFilter.value.push(s)
  else statusFilter.value.splice(idx, 1)
}

function toggleTag(id) {
  const idx = tagFilter.value.indexOf(id)
  if (idx === -1) tagFilter.value.push(id)
  else tagFilter.value.splice(idx, 1)
}

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' ||
  typeFilter.value.length > 0 ||
  statusFilter.value.length > 0 ||
  tagFilter.value.length > 0 ||
  createdByFilter.value !== ''
)

const activeFilterCount = computed(() => {
  let n = 0
  if (search.value.trim()) n++
  if (typeFilter.value.length) n++
  if (statusFilter.value.length) n++
  if (tagFilter.value.length) n++
  if (createdByFilter.value) n++
  return n
})

function clearFilters() {
  search.value = ''
  typeFilter.value = []
  statusFilter.value = []
  tagFilter.value = []
  createdByFilter.value = ''
}

// ── Filtered + sorted items ───────────────────────────────────────────────────
const filteredItems = computed(() => {
  let result = [...store.items]
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(r => r.name.toLowerCase().includes(q))
  }
  if (typeFilter.value.length) {
    result = result.filter(r => typeFilter.value.includes(r.type))
  }
  if (statusFilter.value.length) {
    result = result.filter(r => statusFilter.value.includes(r.status))
  }
  if (tagFilter.value.length) {
    result = result.filter(r => tagFilter.value.every(tid => (r.tags ?? []).includes(tid)))
  }
  if (createdByFilter.value) {
    result = result.filter(r => r.createdBy === createdByFilter.value)
  }
  return result.sort((a, b) => (b.performance ?? 0) - (a.performance ?? 0))
})

const headers = computed(() => [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Performance', key: 'performance', sortable: true },
  { title: 'Usages', key: 'usageCount', sortable: true },
  ...(mobile.value ? [] : [
    { title: 'Type', key: 'type' },
    { title: 'Estimated Revenue', key: 'revenue' },
    { title: 'Created by', key: 'createdBy' },
    { title: 'Tags', key: 'tags', sortable: false },
  ]),
])

const breadcrumbs = [
  { title: 'Promotions', disabled: true },
  { title: 'Reporting', disabled: true },
]

onMounted(async () => {
  await Promise.all([store.fetchAll(), tagsStore.fetchAll()])
})
</script>
