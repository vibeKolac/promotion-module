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
        <PageActionBtn @click="newRuleDialogOpen = true">New Rule</PageActionBtn>
      </template>
    </ContentHeader>

    <!-- Search + status tabs (search aligns to tabs width) -->
    <div :class="mobile ? '' : 'd-inline-flex flex-column'" class="mb-2">
      <TextInput
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search in all columns"
        hide-details
        class="mb-4"
      />
      <v-tabs v-model="activeTab" color="primary" density="compact">
        <v-tab value="active">Active <v-chip size="x-small" class="ml-1">{{ activeItems.length }}</v-chip></v-tab>
        <v-tab value="paused">Paused <v-chip size="x-small" class="ml-1">{{ pausedItems.length }}</v-chip></v-tab>
        <v-tab value="draft">Draft <v-chip size="x-small" class="ml-1">{{ draftItems.length }}</v-chip></v-tab>
        <v-tab value="ended">Ended <v-chip size="x-small" class="ml-1">{{ endedItems.length }}</v-chip></v-tab>
      </v-tabs>
    </div>

    <!-- Filter row -->
    <div class="d-flex align-center flex-wrap filter-row">
      <v-select
        v-model="stackingGroupFilter"
        :items="stackingGroupFilterItems"
        item-title="title"
        item-value="value"
        label="Group"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 220px"
      />
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
        v-model="tagFilter"
        :items="tagFilterItems"
        item-title="label"
        item-value="value"
        label="Action Labels"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        style="max-width: 220px"
      />
      <v-select
        v-model="internalTagFilter"
        :items="internalTagFilterItems"
        item-title="label"
        item-value="value"
        label="Internal Tags"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        style="max-width: 200px"
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
        item-value="id"
        show-select
        hover
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-2">
            <RouterLink :to="`/promotions/${item.id}/edit`" class="rule-name-link font-weight-medium">{{ item.name }}</RouterLink>
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
          <div class="d-flex flex-wrap py-1" style="gap: 6px">
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
          <div class="d-flex flex-wrap py-1" style="gap: 6px">
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

    <!-- New rule dialog -->
    <v-dialog v-model="newRuleDialogOpen" max-width="560" scrollable>
      <v-card>
        <v-card-title class="text-h6 pa-5 pb-3 d-flex align-center">
          <span>{{ newRuleStep === 'choose' ? 'New promotion rule' : 'Choose a template' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" size="x-small" variant="text" @click="closeNewRuleDialog" />
        </v-card-title>
        <v-divider />

        <!-- Step 1: choose mode -->
        <v-card-text v-if="newRuleStep === 'choose'" class="pa-5">
          <div class="new-rule-choices">
            <v-card border elevation="0" class="pa-4 new-rule-option" @click="router.push('/promotions/new'); newRuleDialogOpen = false">
              <div class="new-rule-option-inner">
                <v-avatar color="primary" variant="tonal" size="44">
                  <v-icon color="primary" size="24">mdi-plus</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-1 font-weight-bold">Start from scratch</div>
                  <div class="text-body-2 text-medium-emphasis">Build a new rule with a blank form</div>
                </div>
              </div>
            </v-card>
            <v-card border elevation="0" class="pa-4 new-rule-option" @click="newRuleStep = 'template'">
              <div class="new-rule-option-inner">
                <v-avatar color="success" variant="tonal" size="44">
                  <v-icon color="success" size="24">mdi-file-document-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-1 font-weight-bold">Start from template</div>
                  <div class="text-body-2 text-medium-emphasis">Pre-fill the form using a saved template</div>
                </div>
              </div>
            </v-card>
          </div>
        </v-card-text>

        <!-- Step 2: template picker -->
        <v-card-text v-else class="pa-4">
          <div class="tpl-filter-row mb-4">
            <v-text-field
              v-model="tplPickerSearch"
              placeholder="Search templates…"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="tpl-search-field"
            />
            <v-select
              v-model="tplPickerType"
              :items="tplPickerTypeItems"
              item-title="label"
              item-value="value"
              label="Type"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              class="tpl-type-filter"
            />
          </div>
          <div v-if="filteredPickerTemplates.length" class="tpl-list">
            <v-card
              v-for="tpl in filteredPickerTemplates"
              :key="tpl.id"
              border
              elevation="0"
              class="pa-4 new-rule-option"
              @click="applyTemplate(tpl)"
            >
              <div class="new-rule-option-inner">
                <v-avatar variant="tonal" size="36" :class="`text-${tplTypeColor(tpl.ruleType)}`">
                  <v-icon size="20" :class="`text-${tplTypeColor(tpl.ruleType)}`">{{ tplTypeIcon(tpl.ruleType) }}</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-bold">{{ tpl.label }}</div>
                  <div class="text-caption text-medium-emphasis">{{ tpl.description }}</div>
                </div>
                <v-icon color="primary" size="20">mdi-arrow-right</v-icon>
              </div>
            </v-card>
          </div>
          <v-alert v-else color="grey" variant="tonal" density="compact">No templates match.</v-alert>
        </v-card-text>

        <v-card-actions v-if="newRuleStep === 'template'" class="pa-4 pt-0">
          <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="newRuleStep = 'choose'">Back</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import { useTemplatesStore } from '../../stores/templates'
import StatusBadge from '../shared/StatusBadge.vue'
import PageActionBtn from '../_common/PageActionBtn.vue'
import ConfirmModal from '../_common/ConfirmModal.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import TextInput from '../_common/TextInput.vue'
import DatePicker from '../_common/DatePicker.vue'
import { detectConflicts } from '../../utils/ruleConflictDetector'
import ConflictBadge from './ConflictBadge.vue'
import CsvImportDialog from './CsvImportDialog.vue'
import { downloadCSV, exportRulesToCSV } from '../../utils/csvRuleImportExport'
const router = useRouter()
const store = usePromotionsStore()
const templatesStore = useTemplatesStore()

// ── New rule dialog ───────────────────────────────────────────────────────────
const newRuleDialogOpen = ref(false)
const newRuleStep = ref('choose')
const tplPickerSearch = ref('')
const tplPickerType = ref([])

const tplPickerTypeItems = [
  { value: 'discount',      label: 'Standard discount' },
  { value: 'step_discount', label: 'Step discount' },
  { value: 'multi_buy',     label: 'Multi-buy' },
  { value: 'gift',          label: 'Free gift' },
]

watch(newRuleDialogOpen, v => {
  if (v) {
    newRuleStep.value = 'choose'
    tplPickerSearch.value = ''
    tplPickerType.value = []
    if (!templatesStore.items.length) templatesStore.fetchAll()
  }
})

function closeNewRuleDialog() {
  newRuleDialogOpen.value = false
}

const filteredPickerTemplates = computed(() => {
  const q = tplPickerSearch.value.toLowerCase()
  return templatesStore.items
    .filter(t => !tplPickerType.value.length || tplPickerType.value.includes(t.ruleType))
    .filter(t => !q || t.label.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
})

function tplTypeColor(type) {
  return { discount: 'orange-darken-2', step_discount: 'green-darken-2', multi_buy: 'blue-darken-2', gift: 'purple-darken-2' }[type] ?? 'grey-darken-1'
}

function tplTypeIcon(type) {
  return { discount: 'mdi-tag-outline', step_discount: 'mdi-stairs', multi_buy: 'mdi-package-variant', gift: 'mdi-gift' }[type] ?? 'mdi-tag-outline'
}

function applyTemplate(tpl) {
  store.resetDraft()
  if (tpl.ruleSnapshot) {
    Object.assign(store.formDraft, tpl.ruleSnapshot, { name: tpl.label, status: 'draft', startDate: null, endDate: null })
  } else {
    Object.assign(store.formDraft, {
      type: tpl.ruleType ?? 'discount',
      value: tpl.defaultValue ?? '',
      valueUnit: tpl.defaultValueUnit ?? '%',
      conditions: tpl.defaultConditions ? [...tpl.defaultConditions] : [],
      name: tpl.label,
    })
  }
  newRuleDialogOpen.value = false
  router.push({ path: '/promotions/new', query: { fromTemplate: '1' } })
}

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
const customDateFrom = ref(null)
const customDateTo = ref(null)
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

const typeFilterItems = computed(() =>
  availableTypes.value.map(t => ({ label: typeLabel(t), value: t }))
)
const tagFilterItems = computed(() =>
  tagsStore.items.map(t => ({ label: t.name, value: t.id }))
)
const internalTagFilterItems = computed(() =>
  internalTagsStore.items.map(t => ({ label: t.name, value: t.id }))
)

const createdByFilterItems = computed(() => [
  { value: '', title: 'All creators' },
  ...[...new Set(store.items.map(r => r.createdBy).filter(Boolean))].sort()
    .map(c => ({ value: c, title: c })),
])

const dateFilterItems = [
  { value: 'any',    title: 'Any date' },
  { value: 'last_7', title: 'Last 7 days' },
  { value: 'last_14', title: 'Last 14 days' },
  { value: 'last_30', title: 'Last 30 days' },
  { value: 'custom', title: 'Custom period' },
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
  typeFilter.value.length > 0 || tagFilter.value.length > 0 || internalTagFilter.value.length > 0 || createdByFilter.value !== '' || dateFilter.value !== 'any' || !!customDateFrom.value || !!customDateTo.value
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
  customDateFrom.value = null
  customDateTo.value = null
}

function applyFilters(rules) {
  let result = rules
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(r => {
      const tagNames = (r.tags ?? []).map(id => tagsStore.items.find(t => t.id === id)?.name ?? '').join(' ')
      const internalTagNames = (r.internalTags ?? []).map(id => internalTagsStore.items.find(t => t.id === id)?.name ?? '').join(' ')
      const groupName = sgStore.items.find(g => g.id === r.stackingGroupId)?.name ?? ''
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        (TYPE_LABELS[r.type] ?? r.type).toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        (r.createdBy ?? '').toLowerCase().includes(q) ||
        (r.startDate ?? '').includes(q) ||
        (r.endDate ?? '').includes(q) ||
        tagNames.toLowerCase().includes(q) ||
        internalTagNames.toLowerCase().includes(q) ||
        groupName.toLowerCase().includes(q)
      )
    })
  }
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
    { title: 'Status', key: 'status' },
    { title: 'Created by', key: 'createdBy' },
    { title: 'Action Labels', key: 'tags', sortable: false },
    { title: 'Internal Tags', key: 'internalTags', sortable: false },
    { title: 'Starts', key: 'startDate' },
    { title: 'Ends', key: 'endDate' },
  ]),
  { title: '', key: 'actions', sortable: false, width: 60 },
])


function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB')
}

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


.filter-row {
  gap: 16px;
  padding: 20px 0;
}

.bulk-toolbar {
  background-color: #f0fdf4;
  border-color: #86efac;
}

.rule-name-link {
  color: inherit;
  text-decoration: none;
}
.rule-name-link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.new-rule-option {
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.new-rule-option:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.04);
}

.new-rule-choices {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.new-rule-option-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tpl-filter-row {
  display: flex;
  gap: 16px;
}

.tpl-search-field {
  flex: 1;
}

.tpl-type-filter {
  max-width: 180px;
}

.tpl-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
