<!-- src/components/promotions/PromotionsList.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Promotion rules management</h1>
      <template #right>
        <div v-if="!mobile" class="bulk-csv-wrapper">
          <v-chip
            size="x-small"
            color="warning"
            variant="tonal"
            label
            prepend-icon="mdi-flask-outline"
            class="bulk-csv-badge"
          >Exploring</v-chip>
          <div class="bulk-csv-box">
            <v-icon color="warning" size="18" class="bulk-csv-icon">mdi-table-arrow-right</v-icon>
            <div class="bulk-csv-labels">
              <span class="bulk-csv-title">Bulk Data</span>
              <span class="bulk-csv-subtitle">CSV import / export</span>
            </div>
            <v-divider vertical class="bulk-csv-divider" />
            <v-btn variant="outlined" size="small" class="px-3" prepend-icon="mdi-download" @click="exportCSV">Export</v-btn>
            <v-btn variant="outlined" size="small" class="px-3" prepend-icon="mdi-upload" @click="csvImportOpen = true">Import</v-btn>
          </div>
        </div>
        <PageActionBtn to="/promotions/new">New Rule</PageActionBtn>
      </template>
    </ContentHeader>

    <!-- Search -->
    <TextInput
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search in all columns"
      hide-details
      class="mb-4"
      :class="mobile ? '' : 'search-input'"
      @update:model-value="onSearch"
    />

    <!-- Priority group filter + tabs row -->
    <div class="d-flex flex-wrap align-center gap-2 mb-4">
      <v-tabs v-model="activeTab" color="primary" density="compact">
        <v-tab value="active">Active <v-chip size="x-small" class="ml-1">{{ activeItems.length }}</v-chip></v-tab>
        <v-tab value="paused">Paused <v-chip size="x-small" class="ml-1">{{ pausedItems.length }}</v-chip></v-tab>
        <v-tab value="draft">Draft <v-chip size="x-small" class="ml-1">{{ draftItems.length }}</v-chip></v-tab>
        <v-tab value="ended">Ended <v-chip size="x-small" class="ml-1">{{ endedItems.length }}</v-chip></v-tab>
      </v-tabs>
      <v-spacer />
      <SelectInput
        v-model="stackingGroupFilter"
        :data="stackingGroupFilterItems"
        label=""
        hide-details
        class="filter-select filter-select--md"
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
        class="clickable-link"
        @click="toggleType(t)"
      >{{ typeLabel(t) }}</v-chip>

      <v-divider v-if="!mobile && tagsStore.items.length" vertical class="mx-1 filter-divider" />

      <template v-if="tagsStore.items.length">
        <span class="text-caption text-medium-emphasis mr-1">Action Labels:</span>
        <v-chip
          v-for="tag in tagsStore.items"
          :key="tag.id"
          :color="tagFilter.includes(tag.id) ? 'grey-darken-4' : undefined"
          :variant="tagFilter.includes(tag.id) ? 'flat' : 'outlined'"
          size="small"
          class="clickable-link"
          @click="toggleTag(tag.id)"
        >
          <v-icon v-if="tagFilter.includes(tag.id)" start size="12">mdi-check</v-icon>
          {{ tag.name }}
        </v-chip>
      </template>

      <v-divider v-if="!mobile && internalTagsStore.items.length" vertical class="mx-1 filter-divider" />

      <template v-if="internalTagsStore.items.length">
        <span class="text-caption text-medium-emphasis mr-1">Internal Tags:</span>
        <v-chip
          v-for="tag in internalTagsStore.items"
          :key="tag.id"
          :color="internalTagFilter.includes(tag.id) ? 'success' : 'success'"
          :variant="internalTagFilter.includes(tag.id) ? 'flat' : 'tonal'"
          size="small"
          class="clickable-link"
          @click="toggleInternalTag(tag.id)"
        >
          <v-icon v-if="internalTagFilter.includes(tag.id)" start size="12">mdi-check</v-icon>
          {{ tag.name }}
        </v-chip>
      </template>

      <v-divider v-if="!mobile" vertical class="mx-1 filter-divider" />

      <SelectInput
        v-model="createdByFilter"
        :data="createdByFilterItems"
        label="Created by"
        hide-details
        class="filter-select filter-select--sm"
      />

      <SelectInput
        v-model="dateFilter"
        :data="dateFilterItems"
        label="Date"
        hide-details
        class="filter-select filter-select--date"
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
      class="pa-3 mb-3 bulk-toolbar"
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
          <template v-if="activeTab !== 'ended'">
            <v-btn
              v-if="activeTab === 'draft' || activeTab === 'paused'"
              size="small"
              color="success"
              @click="bulkActivate"
            >
              <v-icon size="16" class="mr-1">mdi-lightning-bolt-outline</v-icon>Activate
            </v-btn>
            <v-btn
              v-if="activeTab !== 'draft'"
              size="small"
              variant="outlined"
              color="warning"
              @click="bulkPause"
            >
              <v-icon size="16" class="mr-1">mdi-pause</v-icon>Pause
            </v-btn>
          </template>
          <v-btn size="small" variant="outlined" @click="bulkDuplicate">
            <v-icon size="16" class="mr-1">mdi-content-copy</v-icon>Duplicate
          </v-btn>
          <template v-if="activeTab !== 'ended'">
            <v-btn size="small" variant="outlined" color="error" @click="openBulkDelete">
              <v-icon size="16" class="mr-1">mdi-delete</v-icon>Delete
            </v-btn>
          </template>
        </div>
      </div>
    </v-card>

    <!-- Draft tab banner -->
    <v-alert v-if="activeTab === 'draft'" type="warning" variant="tonal" density="compact" class="mb-3" icon="mdi-pencil-outline">
      Rules in draft are not applied at checkout. Activate them when ready to go live.
    </v-alert>

    <!-- Ended tab banner -->
    <v-alert v-if="activeTab === 'ended'" color="grey" variant="tonal" density="compact" class="mb-3" icon="mdi-history">
      Rules whose end date has passed. These rules are no longer applied at checkout.
    </v-alert>

    <!-- Shared table for all tabs -->
    <v-card border elevation="0">
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="tabItems"
        :loading="store.loading"
        :row-props="() => ({ style: 'cursor: pointer' })"
        item-value="id"
        show-select
        hover
        @click:row="onRowClick"
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
          <v-tooltip :text="typeLabel(item.type)" location="top">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                color="default"
                variant="tonal"
                size="small"
                label
              >
                <v-icon size="14">{{ typeIcon(item.type) }}</v-icon>
              </v-chip>
            </template>
          </v-tooltip>
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

        <template #item.tags="{ item }">
          <div class="d-flex flex-wrap gap-1 py-1">
            <template v-if="(item.tags ?? []).length">
              <v-chip
                v-for="tagId in item.tags"
                :key="tagId"
                size="x-small"
                label
                variant="outlined"
              >
                {{ tagsStore.items.find(t => t.id === tagId)?.name ?? tagId }}
              </v-chip>
            </template>
            <span v-else class="text-caption text-medium-emphasis">—</span>
          </div>
        </template>

        <template #item.internalTags="{ item }">
          <div class="d-flex flex-wrap gap-1 py-1">
            <template v-if="(item.internalTags ?? []).length">
              <v-chip
                v-for="tagId in item.internalTags"
                :key="tagId"
                color="success"
                size="x-small"
                label
                variant="tonal"
              >
                {{ internalTagsStore.items.find(t => t.id === tagId)?.name ?? tagId }}
              </v-chip>
            </template>
            <span v-else class="text-caption text-medium-emphasis">—</span>
          </div>
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
              <v-list-item v-if="item.status !== 'ended'" prepend-icon="mdi-pencil" title="Edit" :to="`/promotions/${item.id}/edit`" />
              <v-list-item prepend-icon="mdi-content-copy" title="Duplicate" @click="duplicateRule(item.id)" />
              <template v-if="item.status !== 'ended'">
                <v-list-item
                  v-if="item.status === 'active' || item.status === 'scheduled'"
                  prepend-icon="mdi-pause"
                  title="Pause"
                  @click="pauseRule(item.id)"
                />
                <v-list-item
                  v-else-if="item.status === 'paused'"
                  prepend-icon="mdi-play"
                  title="Resume"
                  @click="resumeRule(item.id)"
                />
                <v-list-item
                  v-else-if="item.status === 'draft'"
                  prepend-icon="mdi-lightning-bolt-outline"
                  title="Activate"
                  :disabled="!item.startDate || !item.endDate"
                  @click="activateRule(item.id)"
                />
                <v-divider />
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete"
                  class="text-error"
                  @click="openDelete(item)"
                />
              </template>
            </v-list>
          </v-menu>
        </template>

        <template #no-data>
          <div class="text-center pa-8 text-medium-emphasis">No promotion rules found</div>
        </template>
      </v-data-table>
    </v-card>

    <ConfirmModal ref="deleteModal" confirm-text="Delete" confirm-color="error" :loading="deleting">
      <template #header>Delete promotion rule?</template>
      <template #body>
        This action cannot be undone. The rule <strong>{{ deletingItem?.name }}</strong> will be permanently deleted.
      </template>
    </ConfirmModal>
    <ConfirmModal ref="bulkDeleteModal" confirm-text="Delete" confirm-color="error" :loading="store.loading">
      <template #header>Delete {{ selected.length }} rule{{ selected.length > 1 ? 's' : '' }}?</template>
      <template #body>
        This action cannot be undone. The selected {{ selected.length }} rule{{ selected.length > 1 ? 's' : '' }} will be permanently deleted.
      </template>
    </ConfirmModal>
    <CsvImportDialog v-model="csvImportOpen" @import="onCSVImport" />
    <v-snackbar v-model="errorSnack" color="error" timeout="4000">{{ store.error }}</v-snackbar>
    <v-snackbar v-model="duplicateSnack" color="success" timeout="3000">Rule duplicated — added to Draft tab</v-snackbar>
    <v-snackbar v-model="bulkSnack" color="success" timeout="3000">{{ bulkSnackText }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { usePromotionsStore } from '../../stores/promotions'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { useTagsStore } from '../../stores/tags'
import { useInternalTagsStore } from '../../stores/internalTags'
import StatusBadge from '../shared/StatusBadge.vue'
import PageActionBtn from '../_common/PageActionBtn.vue'
import ConfirmModal from '../_common/ConfirmModal.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import TextInput from '../_common/TextInput.vue'
import SelectInput from '../_common/SelectInput.vue'
import { useDebounceFn } from '@vueuse/core'
import { detectConflicts } from '../../utils/ruleConflictDetector'
import ConflictBadge from './ConflictBadge.vue'
import CsvImportDialog from './CsvImportDialog.vue'
import { downloadCSV, exportRulesToCSV } from '../../utils/csvRuleImportExport'
const router = useRouter()
const store = usePromotionsStore()

function onRowClick(event, { item }) {
  // Skip navigation when clicking checkbox or the actions menu
  if (event.target.closest('.v-selection-control') || event.target.closest('[data-testid="row-actions"]')) return
  router.push(`/promotions/${item.id}/edit`)
}
const sgStore = useStackingGroupsStore()
const tagsStore = useTagsStore()
const internalTagsStore = useInternalTagsStore()
const { mobile } = useDisplay()

const conflictsMap = computed(() => detectConflicts(store.items))

const search = ref('')
const activeTab = ref('active')
const stackingGroupFilter = ref('all')
const typeFilter = ref([])
const tagFilter = ref([])
const internalTagFilter = ref([])
const createdByFilter = ref('')
const dateFilter = ref('any')
const deleteModal = ref(null)
const bulkDeleteModal = ref(null)
const deletingItem = ref(null)
const deleting = ref(false)
const selected = ref([])
const csvImportOpen = ref(false)
const duplicateSnack = ref(false)
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
  applyFiltersAll(store.items.filter(r => r.status === 'paused'))
)
const draftItems = computed(() =>
  applyFiltersAll(store.items.filter(r => r.status === 'draft'))
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
  if (activeTab.value === 'draft') return draftItems.value
  if (activeTab.value === 'ended') return endedItems.value
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
const TYPE_ICONS = {
  discount:      'mdi-tag-outline',
  step_discount: 'mdi-stairs',
  multi_buy:     'mdi-package-variant',
  gift:          'mdi-gift',
}
function typeLabel(t) { return TYPE_LABELS[t] ?? t }
function typeIcon(t)  { return TYPE_ICONS[t]  ?? 'mdi-tag-outline' }

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

function toggleTag(id) {
  const idx = tagFilter.value.indexOf(id)
  if (idx === -1) tagFilter.value.push(id)
  else tagFilter.value.splice(idx, 1)
}

function toggleInternalTag(id) {
  const idx = internalTagFilter.value.indexOf(id)
  if (idx === -1) internalTagFilter.value.push(id)
  else internalTagFilter.value.splice(idx, 1)
}

const hasActiveFilters = computed(() =>
  typeFilter.value.length > 0 || tagFilter.value.length > 0 || internalTagFilter.value.length > 0 || createdByFilter.value !== '' || dateFilter.value !== 'any'
)

const activeFilterCount = computed(() => {
  let n = 0
  if (typeFilter.value.length) n++
  if (tagFilter.value.length) n++
  if (internalTagFilter.value.length) n++
  if (createdByFilter.value) n++
  if (dateFilter.value !== 'any') n++
  return n
})

function clearFilters() {
  typeFilter.value = []
  tagFilter.value = []
  internalTagFilter.value = []
  createdByFilter.value = ''
  dateFilter.value = 'any'
}

function applyFilters(rules) {
  let result = rules
  if (typeFilter.value.length) {
    result = result.filter(r => typeFilter.value.includes(r.type))
  }
  if (tagFilter.value.length) {
    result = result.filter(r => tagFilter.value.every(tid => (r.tags ?? []).includes(tid)))
  }
  if (internalTagFilter.value.length) {
    result = result.filter(r => internalTagFilter.value.every(tid => (r.internalTags ?? []).includes(tid)))
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

async function onCSVImport(rules) {
  try {
    await store.importFromCSV(rules)
  } catch {
    // store.error is set
  }
}

const errorSnack = computed({ get: () => !!store.error, set: () => {} })

const headers = computed(() => [
  { title: 'Name', key: 'name', sortable: true },
  ...(mobile.value ? [] : [
    { title: 'Type', key: 'type', width: '72px' },
    { title: 'Created by', key: 'createdBy' },
    { title: 'Action Labels', key: 'tags', sortable: false },
    { title: 'Internal Tags', key: 'internalTags', sortable: false },
    { title: 'Starts', key: 'startDate' },
    { title: 'Ends', key: 'endDate' },
  ]),
  { title: 'Status', key: 'status' },
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
  await Promise.all([store.fetchAll(), sgStore.fetchAll(), tagsStore.fetchAll(), internalTagsStore.fetchAll()])
})

async function openDelete(item) {
  deletingItem.value = item
  const confirmed = await deleteModal.value.open()
  if (!confirmed) { deletingItem.value = null; return }
  deleting.value = true
  await store.remove(item.id)
  deleting.value = false
  deletingItem.value = null
}

async function pauseRule(id) {
  await store.updateStatus(id, 'paused')
}
async function resumeRule(id) {
  await store.updateStatus(id, 'active')
}
async function activateRule(id) {
  const item = store.items.find(i => i.id === id)
  const today = new Date().toISOString().split('T')[0]
  const status = item?.startDate && item.startDate > today ? 'scheduled' : 'active'
  await store.updateStatus(id, status)
}
async function duplicateRule(id) {
  await store.duplicate(id)
  activeTab.value = 'draft'
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
  bulkSnackText.value = `${count} rule${count > 1 ? 's' : ''} duplicated — added to Draft tab`
  selected.value = []
  activeTab.value = 'draft'
  bulkSnack.value = true
}

async function openBulkDelete() {
  const confirmed = await bulkDeleteModal.value.open()
  if (!confirmed) return
  const count = selected.value.length
  await store.bulkRemove(selected.value)
  bulkSnackText.value = `${count} rule${count > 1 ? 's' : ''} deleted`
  selected.value = []
  bulkSnack.value = true
}
</script>

<style scoped>
.title-row {
  gap: 12px;
}

.bulk-csv-wrapper {
  position: relative;
  padding-top: 10px;
}

.bulk-csv-badge {
  position: absolute;
  top: 0;
  left: 12px;
  z-index: 1;
  pointer-events: none;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.bulk-csv-box {
  border: 1.5px dashed rgba(245, 158, 11, 0.55);
  border-radius: 8px;
  padding: 10px 14px;
  background: rgba(245, 158, 11, 0.04);
  display: flex;
  align-items: center;
  gap: 10px;
}

.bulk-csv-icon {
  opacity: 0.75;
}

.bulk-csv-labels {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-right: 2px;
}

.bulk-csv-title {
  font-size: 11px;
  font-weight: 700;
  color: #78350f;
  line-height: 1.3;
  white-space: nowrap;
}

.bulk-csv-subtitle {
  font-size: 10px;
  color: #92400e;
  opacity: 0.7;
  line-height: 1.3;
  white-space: nowrap;
}

.bulk-csv-divider {
  height: 28px;
  opacity: 0.25;
}

.filter-divider {
  align-self: stretch;
  opacity: 0.3;
}

.search-input {
  max-width: 480px;
}

.filter-select {
  flex-shrink: 0;
}

.filter-select--md {
  max-width: 200px;
  min-width: 140px;
}

.filter-select--sm {
  max-width: 160px;
  min-width: 130px;
}

.filter-select--date {
  max-width: 175px;
  min-width: 145px;
}

.bulk-toolbar {
  background-color: #f0fdf4;
  border-color: #86efac;
}
</style>
