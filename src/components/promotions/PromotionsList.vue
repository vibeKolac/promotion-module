<!-- src/components/promotions/PromotionsList.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <!-- Breadcrumb -->
    <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mb-2" />

    <!-- Title row -->
    <div class="d-flex align-center flex-wrap gap-2 mb-5">
      <h1 class="text-h5 font-weight-bold">Promotion rules overview</h1>
      <v-spacer />
      <v-btn
        v-if="!mobile"
        color="primary"
        prepend-icon="mdi-robot"
        class="text-uppercase"
        variant="outlined"
        @click="uiStore.openAiPanel()"
      >
        AI Assistant
      </v-btn>
      <v-btn v-if="!mobile" variant="outlined" size="small" prepend-icon="mdi-download" @click="exportCSV">Export CSV</v-btn>
      <v-btn v-if="!mobile" variant="outlined" size="small" prepend-icon="mdi-upload" @click="csvImportOpen = true">Import CSV</v-btn>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        class="text-uppercase"
        to="/promotions/new"
      >
        New Rule
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
      :style="mobile ? '' : 'max-width: 480px'"
      @update:model-value="onSearch"
    />

    <AiRecommendationsPanel class="mb-4" />

    <RulePriorityPreview :rules="store.items" :groups="sgStore.items" class="mb-4" />

    <!-- Stacking group filter + tabs row -->
    <div class="d-flex flex-wrap align-center gap-2 mb-4">
      <v-tabs v-model="activeTab" color="primary" density="compact">
        <v-tab value="active">Active <v-chip size="x-small" class="ml-1">{{ activeItems.length }}</v-chip></v-tab>
        <v-tab value="paused">Paused <v-chip size="x-small" class="ml-1">{{ pausedItems.length }}</v-chip></v-tab>
        <v-tab value="ended">Ended <v-chip size="x-small" class="ml-1">{{ endedItems.length }}</v-chip></v-tab>
        <v-tab v-if="!mobile" value="performance">Performance</v-tab>
      </v-tabs>
      <v-spacer />
      <v-select
        v-model="stackingGroupFilter"
        :items="stackingGroupFilterItems"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 200px; min-width: 140px"
      />
    </div>

    <!-- Filter bar -->
    <div class="d-flex align-center flex-wrap gap-2 mb-3">
      <span class="text-caption text-medium-emphasis mr-1">Type:</span>
      <v-chip
        v-for="t in availableTypes"
        :key="t"
        :color="typeFilter.includes(t) ? 'primary' : undefined"
        :variant="typeFilter.includes(t) ? 'flat' : 'outlined'"
        size="small"
        style="cursor:pointer"
        @click="toggleType(t)"
      >{{ typeLabel(t) }}</v-chip>

      <v-divider v-if="!mobile" vertical class="mx-1" style="align-self:stretch; opacity:.3" />

      <v-select
        v-model="createdByFilter"
        :items="createdByFilterItems"
        label="Created by"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 160px; min-width: 130px"
      />

      <v-select
        v-model="dateFilter"
        :items="dateFilterItems"
        label="Date"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 175px; min-width: 145px"
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

    <!-- Bulk actions toolbar -->
    <v-card
      v-if="selected.length"
      border
      elevation="0"
      class="pa-3 mb-3"
      style="background-color: #f0fdf4; border-color: #86efac;"
    >
      <div class="d-flex align-center justify-space-between flex-wrap gap-2">
        <div class="d-flex align-center gap-2">
          <v-icon color="green-darken-2" size="20">mdi-check-circle</v-icon>
          <span class="font-weight-medium text-green-darken-2">{{ selected.length }} rule{{ selected.length > 1 ? 's' : '' }} selected</span>
          <v-btn variant="text" size="small" color="green-darken-2" @click="selected = []">
            <v-icon size="16" class="mr-1">mdi-close</v-icon>Clear
          </v-btn>
        </div>
        <div class="d-flex align-center gap-2 flex-wrap">
          <v-btn size="small" color="success" @click="bulkActivate">
            <v-icon size="16" class="mr-1">mdi-play</v-icon>Activate
          </v-btn>
          <v-btn size="small" variant="outlined" color="warning" @click="bulkPause">
            <v-icon size="16" class="mr-1">mdi-pause</v-icon>Pause
          </v-btn>
          <v-btn size="small" variant="outlined" @click="bulkDuplicate">
            <v-icon size="16" class="mr-1">mdi-content-copy</v-icon>Duplicate
          </v-btn>
          <v-btn size="small" variant="outlined" color="primary" @click="bulkDialogOpen = true">
            <v-icon size="16" class="mr-1">mdi-filter</v-icon>Edit Conditions
          </v-btn>
          <v-btn size="small" variant="outlined" color="error" @click="bulkDeleteOpen = true">
            <v-icon size="16" class="mr-1">mdi-delete</v-icon>Delete
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Ended tab banner -->
    <v-alert v-if="activeTab === 'ended'" type="info" variant="tonal" density="compact" class="mb-3" icon="mdi-history">
      Rules whose end date has passed. These rules are no longer applied at checkout.
    </v-alert>

    <!-- Performance tab banner -->
    <v-alert v-if="activeTab === 'performance'" type="info" variant="tonal" density="compact" class="mb-3" icon="mdi-chart-bar">
      Rules sorted by performance score. Revenue figures are estimates.
    </v-alert>

    <!-- Shared table for all tabs -->
    <v-card border elevation="0">
      <v-data-table
        v-model="selected"
        :headers="activeTab === 'performance' ? performanceHeaders : headers"
        :items="tabItems"
        :loading="store.loading"
        item-value="id"
        show-select
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

        <template #item.status="{ item }">
          <StatusBadge :status="item.status" />
        </template>

        <template #item.performance="{ item }">
          <span v-if="item.performance !== undefined" class="font-weight-bold text-success">{{ item.performance }}%</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.revenue="{ item }">
          <span v-if="item.revenue" class="text-success">{{ item.revenue }}</span>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.createdBy="{ item }">
          <span class="text-caption text-medium-emphasis">{{ item.createdBy ?? '—' }}</span>
        </template>

        <template #item.startDate="{ item }">
          <span class="text-caption" :class="item.startDate ? '' : 'text-medium-emphasis'">{{ item.startDate ? formatDate(item.startDate) : '—' }}</span>
        </template>

        <template #item.endDate="{ item }">
          <span class="text-caption" :class="item.endDate ? '' : 'text-medium-emphasis'">{{ item.endDate ? formatDate(item.endDate) : '—' }}</span>
        </template>

        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                data-testid="row-actions"
                v-bind="menuProps"
              />
            </template>
            <v-list density="compact" min-width="180">
              <v-list-item prepend-icon="mdi-pencil" title="Edit" :to="`/promotions/${item.id}/edit`" />
              <v-list-item prepend-icon="mdi-content-copy" title="Duplicate" @click="duplicateRule(item.id)" />
              <v-list-item
                v-if="item.status !== 'paused' && item.status !== 'draft'"
                prepend-icon="mdi-pause"
                title="Pause"
                @click="pauseRule(item.id)"
              />
              <v-list-item
                v-else
                prepend-icon="mdi-play"
                title="Resume"
                @click="resumeRule(item.id)"
              />
              <v-divider />
              <v-list-item
                prepend-icon="mdi-delete"
                title="Delete"
                class="text-error"
                @click="openDelete(item)"
              />
            </v-list>
          </v-menu>
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
    <BulkEditConditionsDialog v-model="bulkDialogOpen" :selected-count="selected.length" @apply="onBulkApply" />
    <CsvImportDialog v-model="csvImportOpen" @import="onCSVImport" />
    <ConfirmDeleteDialog
      v-model="bulkDeleteOpen"
      :item-name="`${selected.length} selected rule${selected.length > 1 ? 's' : ''}`"
      :loading="store.loading"
      @confirm="confirmBulkDelete"
    />
    <v-snackbar v-model="errorSnack" color="error" timeout="4000">{{ store.error }}</v-snackbar>
    <v-snackbar v-model="duplicateSnack" color="success" timeout="3000">Rule duplicated — added to Paused tab</v-snackbar>
    <v-snackbar v-model="bulkSnack" color="success" timeout="3000">{{ bulkSnackText }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { usePromotionsStore } from '../../stores/promotions'
import { useUiStore } from '../../stores/ui'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import StatusBadge from '../shared/StatusBadge.vue'
import ConfirmDeleteDialog from '../shared/ConfirmDeleteDialog.vue'
import { useDebounceFn } from '@vueuse/core'
import { detectConflicts } from '../../utils/ruleConflictDetector'
import ConflictBadge from './ConflictBadge.vue'
import BulkEditConditionsDialog from './BulkEditConditionsDialog.vue'
import CsvImportDialog from './CsvImportDialog.vue'
import { downloadCSV, exportRulesToCSV } from '../../utils/csvRuleImportExport'
import RulePriorityPreview from './RulePriorityPreview.vue'
import AiRecommendationsPanel from '../ai/AiRecommendationsPanel.vue'

const store = usePromotionsStore()
const uiStore = useUiStore()
const sgStore = useStackingGroupsStore()
const { mobile } = useDisplay()

const conflictsMap = computed(() => detectConflicts(store.items))

const search = ref('')
const activeTab = ref('active')
const stackingGroupFilter = ref('all')
const typeFilter = ref([])
const createdByFilter = ref('')
const dateFilter = ref('any')
const deleteDialog = ref(false)
const deletingItem = ref(null)
const deleting = ref(false)
const selected = ref([])
const bulkDialogOpen = ref(false)
const csvImportOpen = ref(false)
const duplicateSnack = ref(false)
const bulkDeleteOpen = ref(false)
const bulkSnack = ref(false)
const bulkSnackText = ref('')

// Tab computed lists
const endedItems = computed(() =>
  applyFiltersAll(store.items.filter(r => r.status === 'ended'))
)
const activeItems = computed(() =>
  applyFiltersAll(store.items.filter(r => r.status === 'active' || r.status === 'scheduled'))
)
const pausedItems = computed(() =>
  applyFiltersAll(store.items.filter(r => r.status === 'paused' || r.status === 'draft'))
)
const performanceItems = computed(() =>
  applyFilters([...store.items].filter(r => r.performance !== undefined))
    .sort((a, b) => (b.performance ?? 0) - (a.performance ?? 0))
)

function applyStackingFilter(rules) {
  if (stackingGroupFilter.value === 'all') return rules
  return rules.filter(r => r.stackingGroupId === stackingGroupFilter.value)
}

function applyFiltersAll(rules) {
  return applyFilters(applyStackingFilter(rules))
}

const tabItems = computed(() => {
  if (activeTab.value === 'paused') return pausedItems.value
  if (activeTab.value === 'ended') return endedItems.value
  if (activeTab.value === 'performance') return performanceItems.value
  return activeItems.value
})

const stackingGroupFilterItems = computed(() => [
  { value: 'all', title: 'All groups' },
  ...sgStore.items.map(g => ({ value: g.id, title: g.name })),
])

// ── Extra filters ──────────────────────────────────────────────────────────

const TYPE_LABELS = {
  discount: 'Discount',
  gift: 'Gift',
  multi_buy: 'Multi-buy',
  step_discount: 'Step discount',
}
function typeLabel(t) { return TYPE_LABELS[t] ?? t }

const availableTypes = computed(() =>
  [...new Set(store.items.map(r => r.type))].sort()
)

const createdByFilterItems = computed(() => [
  { value: '', title: 'All creators' },
  ...[...new Set(store.items.map(r => r.createdBy).filter(Boolean))].sort()
    .map(c => ({ value: c, title: c })),
])

const dateFilterItems = [
  { value: 'any', title: 'Any date' },
  { value: 'active_now', title: 'Active now' },
  { value: 'no_end_date', title: 'No end date' },
  { value: 'expiring_soon', title: 'Expiring in 7 days' },
]

function toggleType(t) {
  const idx = typeFilter.value.indexOf(t)
  if (idx === -1) typeFilter.value.push(t)
  else typeFilter.value.splice(idx, 1)
}

const hasActiveFilters = computed(() =>
  typeFilter.value.length > 0 || createdByFilter.value !== '' || dateFilter.value !== 'any'
)

const activeFilterCount = computed(() => {
  let n = 0
  if (typeFilter.value.length) n++
  if (createdByFilter.value) n++
  if (dateFilter.value !== 'any') n++
  return n
})

function clearFilters() {
  typeFilter.value = []
  createdByFilter.value = ''
  dateFilter.value = 'any'
}

function applyFilters(rules) {
  let result = rules
  if (typeFilter.value.length) {
    result = result.filter(r => typeFilter.value.includes(r.type))
  }
  if (createdByFilter.value) {
    result = result.filter(r => r.createdBy === createdByFilter.value)
  }
  if (dateFilter.value !== 'any') {
    const now = new Date()
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    if (dateFilter.value === 'active_now') {
      result = result.filter(r => {
        const start = r.startDate ? new Date(r.startDate) : null
        const end = r.endDate ? new Date(r.endDate) : null
        return (!start || start <= now) && (!end || end >= now)
      })
    } else if (dateFilter.value === 'no_end_date') {
      result = result.filter(r => !r.endDate)
    } else if (dateFilter.value === 'expiring_soon') {
      result = result.filter(r =>
        r.endDate && new Date(r.endDate) >= now && new Date(r.endDate) <= soon
      )
    }
  }
  return result
}

function exportCSV() {
  downloadCSV(exportRulesToCSV(store.items), 'promotions.csv')
}

async function onBulkApply(payload) {
  try {
    await store.bulkUpdateConditions(selected.value, payload)
    selected.value = []
  } catch {
    // store.error is set; user will see it via errorSnack
  }
}

async function onCSVImport(rules) {
  try {
    await store.importFromCSV(rules)
  } catch {
    // store.error is set
  }
}

const errorSnack = computed({ get: () => !!store.error, set: () => {} })

const breadcrumbs = [
  { title: 'Promotions', disabled: true },
  { title: 'Promotion rules overview', disabled: true },
]

const headers = computed(() => [
  { title: 'Name', key: 'name', sortable: true },
  ...(mobile.value ? [] : [
    { title: 'Type', key: 'type' },
    { title: 'Priority', key: 'priority' },
    { title: 'Created by', key: 'createdBy' },
    { title: 'Starts', key: 'startDate' },
    { title: 'Ends', key: 'endDate' },
  ]),
  { title: 'Status', key: 'status' },
  { title: '', key: 'actions', sortable: false, width: 60 },
])

const performanceHeaders = computed(() => [
  { title: 'Name', key: 'name', sortable: true },
  ...(mobile.value ? [] : [
    { title: 'Type', key: 'type' },
    { title: 'Performance', key: 'performance', sortable: true },
    { title: 'Revenue', key: 'revenue' },
    { title: 'Created by', key: 'createdBy' },
  ]),
  { title: '', key: 'actions', sortable: false, width: 60 },
])

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB')
}

const onSearch = useDebounceFn(() => fetchData(), 300)

function fetchData() {
  const filters = {}
  if (search.value) filters.q = search.value
  store.fetchAll(filters)
}

watch(search, onSearch)
onMounted(async () => {
  await store.fetchAll()
  await sgStore.fetchAll()
})

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

async function pauseRule(id) {
  await store.updateStatus(id, 'paused')
}
async function resumeRule(id) {
  await store.updateStatus(id, 'active')
}
async function duplicateRule(id) {
  await store.duplicate(id)
  activeTab.value = 'paused'
  duplicateSnack.value = true
}

async function bulkActivate() {
  await store.bulkUpdateStatus(selected.value, 'active')
  bulkSnackText.value = `${selected.value.length} rule${selected.value.length > 1 ? 's' : ''} activated`
  selected.value = []
  activeTab.value = 'active'
  bulkSnack.value = true
}

async function bulkPause() {
  await store.bulkUpdateStatus(selected.value, 'paused')
  bulkSnackText.value = `${selected.value.length} rule${selected.value.length > 1 ? 's' : ''} paused`
  selected.value = []
  activeTab.value = 'paused'
  bulkSnack.value = true
}

async function bulkDuplicate() {
  const count = selected.value.length
  await store.bulkDuplicate(selected.value)
  bulkSnackText.value = `${count} rule${count > 1 ? 's' : ''} duplicated — added to Paused tab`
  selected.value = []
  activeTab.value = 'paused'
  bulkSnack.value = true
}

async function confirmBulkDelete() {
  const count = selected.value.length
  await store.bulkRemove(selected.value)
  bulkSnackText.value = `${count} rule${count > 1 ? 's' : ''} deleted`
  selected.value = []
  bulkDeleteOpen.value = false
  bulkSnack.value = true
}
</script>
