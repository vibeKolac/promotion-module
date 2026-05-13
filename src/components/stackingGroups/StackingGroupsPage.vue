<!-- src/components/stackingGroups/StackingGroupsPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Priority &amp; grouping</h1>
      <template #right>
        <PageActionBtn v-if="view === 'groups'" @click="openCreate">New group</PageActionBtn>
      </template>
    </ContentHeader>

    <div class="d-flex justify-end mb-2">
      <v-btn-toggle
        v-model="view"
        mandatory
        density="compact"
        variant="outlined"
        divided
      >
        <v-btn value="groups" size="small">
          <v-icon size="18" class="mr-1">mdi-layers</v-icon>
          Groups
        </v-btn>
        <v-btn value="order" size="small">
          <v-icon size="18" class="mr-1">mdi-format-list-numbered</v-icon>
          Processing order
        </v-btn>
      </v-btn-toggle>
    </div>

    <p v-if="view === 'groups'" class="text-body-2 text-medium-emphasis mb-4">Drag a row to change its priority, then save.</p>

    <Loader v-if="sgStore.loading || promoStore.loading" />

    <template v-else>
      <!-- ── Groups accordion ── -->
      <template v-if="view === 'groups'">
        <v-card border elevation="0" class="groups-accordion-card">
          <!-- Table-like header -->
          <div class="group-table-header d-flex align-center px-4">
            <span class="col-chevron" />
            <span class="col-priority text-caption font-weight-bold text-medium-emphasis text-uppercase">Priority</span>
            <span class="col-name text-caption font-weight-bold text-medium-emphasis text-uppercase">Group</span>
            <span class="col-rules text-caption font-weight-bold text-medium-emphasis text-uppercase">Rules</span>
            <span class="col-actions" />
          </div>
          <v-divider />

          <v-expansion-panels
            v-model="openPanels"
            multiple
            variant="accordion"
            class="groups-accordion"
          >
            <v-expansion-panel
              v-for="group in orderedGroups"
              :key="group.id"
              :value="group.id"
              elevation="0"
            >
              <v-expansion-panel-title hide-actions class="px-4 group-panel-title">
                <v-icon size="18" class="col-chevron text-medium-emphasis">
                  {{ openPanels.includes(group.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
                <div class="col-priority">
                  <span v-if="group.isDefault" class="text-medium-emphasis">—</span>
                  <span v-else>{{ group.priority }}</span>
                </div>
                <div class="col-name d-flex align-center gap-2">
                  <span class="color-dot mr-2" :style="`background: ${group.color ?? '#94a3b8'}`" />
                  <span class="font-weight-medium">{{ group.name }}</span>
                  <span v-if="group.isDefault" class="text-caption text-medium-emphasis">
                    — rules with no group assigned
                  </span>
                </div>
                <div class="col-rules">
                  <v-chip size="x-small" label variant="outlined">
                    {{ ruleCounts[group.id]?.active ?? 0 }} active out of {{ ruleCounts[group.id]?.total ?? 0 }}
                  </v-chip>
                </div>
                <div class="col-actions d-flex gap-1 justify-end" @click.stop>
                  <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(group)" />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    :disabled="group.isDefault"
                    @click="openDelete(group)"
                  />
                </div>
              </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="rule-table-header d-flex align-center px-4">
                <span class="rule-col-drag" />
                <span class="rule-col-priority text-caption font-weight-bold text-medium-emphasis text-uppercase">Priority</span>
                <span class="flex-grow-1 text-caption font-weight-bold text-medium-emphasis text-uppercase">Rule</span>
                <span class="rule-type-col text-caption font-weight-bold text-medium-emphasis text-uppercase">Type</span>
                <span class="rule-col-status text-caption font-weight-bold text-medium-emphasis text-uppercase">Status</span>
                <span class="rule-col-action" />
              </div>
              <v-divider />

              <draggable
                :list="localRulesMap[group.id] ?? []"
                item-key="id"
                handle=".drag-handle"
                ghost-class="drag-ghost"
                @change="markDirty(group.id)"
              >
                <template #item="{ element: rule }">
                  <div class="rule-row d-flex align-center px-4 py-2">
                    <v-icon
                      class="drag-handle cursor-grab rule-col-drag"
                      size="18"
                      color="medium-emphasis"
                    >mdi-drag-vertical</v-icon>
                    <span class="text-caption text-medium-emphasis rule-col-priority">
                      {{ rule.priority }}
                    </span>
                    <RouterLink :to="`/promotions/${rule.id}/edit`" class="rule-name-link font-weight-medium text-body-2 flex-grow-1">{{ rule.name }}</RouterLink>
                    <div class="rule-type-col">
                      <v-tooltip :text="ruleTypeLabel(rule.type)" location="top">
                        <template #activator="{ props }">
                          <v-chip
                            v-bind="props"
                            :color="ruleTypeColor(rule.type)"
                            variant="tonal"
                            size="small"
                            label
                          >
                            <v-icon size="14">{{ ruleTypeIcon(rule.type) }}</v-icon>
                          </v-chip>
                        </template>
                      </v-tooltip>
                    </div>
                    <div class="rule-col-status">
                      <StatusBadge :status="rule.status" />
                    </div>
                    <div class="rule-col-action d-flex justify-end">
                      <v-tooltip text="Go to rule detail" location="left">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-open-in-new"
                            variant="text"
                            size="small"
                            :to="`/promotions/${rule.id}/edit`"
                          />
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                </template>

                <template #footer>
                  <div
                    v-if="!(localRulesMap[group.id] ?? []).length"
                    class="pa-6 text-center text-caption text-medium-emphasis"
                  >
                    No rules in this group. Assign this group in the rule editor.
                  </div>
                </template>
              </draggable>

              <div v-if="isDirtyMap[group.id]" class="d-flex align-center gap-4 pa-4 save-bar">
                <span class="text-body-2 text-medium-emphasis">Rule order has been changed</span>
                <v-spacer />
                <div style="display: flex; gap: 12px;">
                  <v-btn variant="outlined" @click="discardGroup(group.id)">Discard</v-btn>
                  <v-btn color="success" :loading="savingMap[group.id]" @click="saveGroup(group.id)">
                    Save order
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <div v-if="!orderedGroups.length" class="pa-6 text-center text-medium-emphasis text-caption">
            No priority groups defined yet.
          </div>
        </v-card>
      </template>

      <!-- ── Processing order table ── -->
      <template v-else>
        <p class="text-caption text-medium-emphasis mb-3">
          Rules are processed top to bottom. Group priority determines the block order;
          rule priority determines the order within each block.
        </p>

        <div class="d-flex align-center gap-3 mb-3">
          <v-select
            v-model="orderStatusFilter"
            :items="orderStatusOptions"
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            style="max-width: 220px"
          />
          <v-select
            v-model="orderGroupFilter"
            :items="orderGroupOptions"
            item-title="label"
            item-value="value"
            label="Group"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            style="max-width: 240px"
            class="ml-3"
          />
          <v-select
            v-model="orderTypeFilter"
            :items="orderTypeOptions"
            item-title="label"
            item-value="value"
            label="Type"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            style="max-width: 200px"
            class="ml-3"
          />
          <v-btn
            v-if="orderStatusFilter.length || orderGroupFilter.length || orderTypeFilter.length"
            variant="text"
            size="small"
            color="primary"
            class="ml-3"
            @click="orderStatusFilter = []; orderGroupFilter = []; orderTypeFilter = []"
          >
            <v-icon size="16" class="mr-1">mdi-close-circle</v-icon>
            Clear filters
          </v-btn>
          <span class="text-caption text-medium-emphasis ml-3">
            {{ filteredProcessingOrder.length }} rules
          </span>
        </div>

        <v-card border elevation="0">
          <v-data-table
            :headers="orderHeaders"
            :items="filteredProcessingOrder"
            item-value="id"
            hide-default-footer
            :items-per-page="-1"
            class="order-table"
          >
            <template #item._seq="{ item }">
              <span class="text-caption font-weight-bold text-medium-emphasis order-num">
                #{{ item._seq }}
              </span>
            </template>

            <template #item.name="{ item }">
              <RouterLink :to="`/promotions/${item.id}/edit`" class="rule-name-link font-weight-medium">{{ item.name }}</RouterLink>
            </template>

            <template #item.type="{ item }">
              <v-tooltip :text="ruleTypeLabel(item.type)" location="top">
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    :color="ruleTypeColor(item.type)"
                    variant="tonal"
                    size="small"
                    label
                  >
                    <v-icon size="14">{{ ruleTypeIcon(item.type) }}</v-icon>
                  </v-chip>
                </template>
              </v-tooltip>
            </template>

            <template #item.status="{ item }">
              <StatusBadge :status="item.status" />
            </template>

            <template #item._group="{ item }">
              <span class="text-body-2">{{ item._group?.name ?? 'Unassigned' }}</span>
            </template>

            <template #item.actions="{ item }">
              <v-tooltip text="Go to rule detail" location="left">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    :to="`/promotions/${item.id}/edit`"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </template>
    </template>

    <StackingGroupDialog
      v-model="dialogOpen"
      :group="editingGroup"
      @saved="onSaved"
    />

    <ConfirmModal ref="deleteConfirm" confirm-text="Delete" confirm-color="error" :loading="deleting">
      <template #header>Delete group?</template>
      <template #body="{ item }">
        <strong>{{ item?.name }}</strong> will be permanently deleted. This action cannot be undone.
      </template>
    </ConfirmModal>

    <v-snackbar v-model="savedSnack" color="success" timeout="2000">Order saved</v-snackbar>
    <v-snackbar v-model="errorSnack" color="error" timeout="4000">{{ sgStore.error ?? 'Failed to save order' }}</v-snackbar>

    <LeaveDialog
      v-model="leaveDialogOpen"
      :show-save="false"
      @cancel="cancelLeave"
      @leave="leaveWithoutSaving"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { usePromotionsStore } from '../../stores/promotions'
import { useNavigationGuard } from '../../composables/useNavigationGuard'
import StackingGroupDialog from './StackingGroupDialog.vue'
import StatusBadge from '../shared/StatusBadge.vue'
import PageActionBtn from '../_common/PageActionBtn.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import Loader from '../_common/Loader.vue'
import ConfirmModal from '../_common/ConfirmModal.vue'
import LeaveDialog from '../_common/LeaveDialog.vue'

const sgStore = useStackingGroupsStore()
const promoStore = usePromotionsStore()

// ── View toggle ───────────────────────────────────────────────────────────────
const view = ref('groups')

// ── Groups accordion ──────────────────────────────────────────────────────────
const openPanels = ref([])

const orderedGroups = computed(() =>
  [...sgStore.items].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return 1
    if (!a.isDefault && b.isDefault) return -1
    return (a.priority ?? 999) - (b.priority ?? 999)
  })
)

const ruleCounts = computed(() => {
  const map = {}
  for (const group of sgStore.items) {
    const rules = promoStore.items.filter(r =>
      r.status !== 'ended' && (
        group.isDefault
          ? r.stackingGroupId === group.id || r.stackingGroupId == null
          : r.stackingGroupId === group.id
      )
    )
    map[group.id] = {
      total: rules.length,
      active: rules.filter(r => r.status === 'active').length,
    }
  }
  return map
})

// ── Per-group drag-and-drop state ─────────────────────────────────────────────
const localRulesMap = ref({})
const isDirtyMap = ref({})
const savingMap = ref({})
const savedSnack = ref(false)

function buildRulesForGroup(group) {
  return promoStore.items
    .filter(r => {
      const inGroup = group.isDefault
        ? r.stackingGroupId === group.id || r.stackingGroupId == null
        : r.stackingGroupId === group.id
      return inGroup && r.status !== 'ended'
    })
    .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
}

function initLocalRules() {
  const map = {}
  for (const group of sgStore.items) {
    map[group.id] = isDirtyMap.value[group.id]
      ? (localRulesMap.value[group.id] ?? buildRulesForGroup(group))
      : buildRulesForGroup(group)
  }
  localRulesMap.value = map
}

watch([() => sgStore.items, () => promoStore.items], initLocalRules, { deep: true })

function markDirty(groupId) {
  isDirtyMap.value = { ...isDirtyMap.value, [groupId]: true }
}

function discardGroup(groupId) {
  const group = sgStore.items.find(g => g.id === groupId)
  if (!group) return
  localRulesMap.value = { ...localRulesMap.value, [groupId]: buildRulesForGroup(group) }
  isDirtyMap.value = { ...isDirtyMap.value, [groupId]: false }
}

async function saveGroup(groupId) {
  savingMap.value = { ...savingMap.value, [groupId]: true }
  const rules = localRulesMap.value[groupId] ?? []
  const updates = rules.map((r, i) => ({ id: r.id, priority: i + 1 }))
  try {
    await promoStore.updateMany(updates)
    localRulesMap.value = {
      ...localRulesMap.value,
      [groupId]: rules.map((r, i) => ({ ...r, priority: i + 1 })),
    }
    isDirtyMap.value = { ...isDirtyMap.value, [groupId]: false }
    savedSnack.value = true
  } catch {
    errorSnack.value = true
  } finally {
    savingMap.value = { ...savingMap.value, [groupId]: false }
  }
}

const anyDirty = computed(() => Object.values(isDirtyMap.value).some(Boolean))

// ── Processing order filters ──────────────────────────────────────────────────
const orderStatusFilter = ref([])
const orderGroupFilter = ref([])
const orderTypeFilter = ref([])

const orderStatusOptions = [
  { label: 'Active',    value: 'active' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Paused',    value: 'paused' },
  { label: 'Draft',     value: 'draft' },
]

const orderTypeOptions = [
  { label: 'Discount',      value: 'discount' },
  { label: 'Step discount', value: 'step_discount' },
  { label: 'Multi-buy',     value: 'multi_buy' },
  { label: 'Gift',          value: 'gift' },
]

const orderGroupOptions = computed(() =>
  orderedGroups.value.map(g => ({ label: g.name, value: g.id }))
)

// ── Processing order table ────────────────────────────────────────────────────
const orderHeaders = [
  { title: '#',      key: '_seq',    sortable: false, width: '72px', align: 'center' },
  { title: 'Rule',   key: 'name',    sortable: false, width: '280px', cellProps: { class: 'pl-6' }, headerProps: { class: 'pl-6' } },
  { title: 'Type',   key: 'type',    sortable: false, width: '72px' },
  { title: 'Status', key: 'status',  sortable: false, width: '130px' },
  { title: 'Group',  key: '_group',  sortable: false, width: '220px' },
  { title: '',       key: 'actions', sortable: false, width: '48px', align: 'end' },
]

const RULE_TYPE_LABELS = {
  discount:      'Discount',
  step_discount: 'Step discount',
  multi_buy:     'Multi-buy',
  gift:          'Gift',
}
const RULE_TYPE_ICONS = {
  discount:      'mdi-tag-outline',
  step_discount: 'mdi-stairs',
  multi_buy:     'mdi-package-variant',
  gift:          'mdi-gift',
}
function ruleTypeLabel(t) { return RULE_TYPE_LABELS[t] ?? t }
function ruleTypeIcon(t)  { return RULE_TYPE_ICONS[t]  ?? 'mdi-tag-outline' }
function ruleTypeColor()  { return 'default' }

function getRuleGroup(rule) {
  if (rule.stackingGroupId == null) return sgStore.items.find(g => g.isDefault) ?? null
  return sgStore.items.find(g => g.id === rule.stackingGroupId) ?? null
}

const processingOrder = computed(() =>
  [...promoStore.items]
    .filter(r => r.status !== 'ended')
    .sort((a, b) => {
      const ga = getRuleGroup(a)
      const gb = getRuleGroup(b)
      if (ga?.isDefault && !gb?.isDefault) return 1
      if (!ga?.isDefault && gb?.isDefault) return -1
      const gpa = ga?.priority ?? 998
      const gpb = gb?.priority ?? 998
      if (gpa !== gpb) return gpa - gpb
      return (a.priority ?? 999) - (b.priority ?? 999)
    })
    .map((rule, i) => ({ ...rule, _seq: i + 1, _group: getRuleGroup(rule) }))
)

const filteredProcessingOrder = computed(() =>
  processingOrder.value.filter(rule => {
    if (orderStatusFilter.value.length && !orderStatusFilter.value.includes(rule.status)) return false
    if (orderGroupFilter.value.length && !orderGroupFilter.value.includes(rule._group?.id)) return false
    if (orderTypeFilter.value.length && !orderTypeFilter.value.includes(rule.type)) return false
    return true
  })
)

onMounted(async () => {
  await Promise.all([sgStore.fetchAll(), promoStore.fetchAll()])
  initLocalRules()
})

// ── CRUD ──────────────────────────────────────────────────────────────────────
const dialogOpen = ref(false)
const editingGroup = ref(null)
const deleteConfirm = ref(null)
const deleting = ref(false)
const errorSnack = ref(false)

function openCreate() {
  editingGroup.value = null
  dialogOpen.value = true
}

function openEdit(group) {
  editingGroup.value = group
  dialogOpen.value = true
}

async function openDelete(group) {
  const confirmed = await deleteConfirm.value.open(group)
  if (!confirmed) return
  deleting.value = true
  await sgStore.remove(group.id)
  deleting.value = false
}

function onSaved() {}

// ── Navigation guard ──────────────────────────────────────────────────────────
const { leaveDialogOpen, cancelLeave, leaveWithoutSaving } = useNavigationGuard({
  dirty: computed(() => dialogOpen.value || anyDirty.value),
})
</script>

<style scoped>
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.group-table-header {
  height: 48px;
  background: white;
}

.col-chevron  { width: 32px; flex-shrink: 0; }
.col-name     { flex: 1 1 0; min-width: 0; }
.col-priority { width: 110px; flex-shrink: 0; text-align: center; }
.col-rules    { width: 190px; flex-shrink: 0; }
.col-actions  { width: 100px; flex-shrink: 0; }

.group-panel-title {
  min-height: 48px !important;
}

.groups-accordion :deep(.v-expansion-panel-text__wrapper) {
  padding: 0;
}

.groups-accordion :deep(.v-expansion-panel--active + .v-expansion-panel),
.groups-accordion :deep(.v-expansion-panel + .v-expansion-panel) {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.rule-row {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.rule-row:last-child {
  border-bottom: none;
}

.drag-ghost {
  opacity: 0.4;
  background: rgb(var(--v-theme-primary), 0.08);
}

.save-bar {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
.status-dot--active    { background: #22c55e; }
.status-dot--paused    { background: #f59e0b; }
.status-dot--draft     { background: #94a3b8; }
.status-dot--scheduled { background: #3b82f6; }
.status-dot--ended     { background: #ef4444; }

.rule-table-header {
  height: 40px;
  background: rgba(var(--v-theme-surface-variant), 0.04);
}

.rule-col-drag     { width: 32px; flex-shrink: 0; }
.rule-col-priority { width: 110px; flex-shrink: 0; text-align: center; }
.rule-type-col     { width: 72px; flex-shrink: 0; }
.rule-col-status   { width: 118px; flex-shrink: 0; }
.rule-col-action   { width: 100px; flex-shrink: 0; }


.order-table :deep(table) {
  table-layout: fixed;
}

.order-table :deep(td.v-data-table__td:nth-child(2)),
.order-table :deep(th.v-data-table__th:nth-child(2)) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-name-link {
  color: inherit;
  text-decoration: none;
}
.rule-name-link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.order-num {
  min-width: 32px;
  display: inline-block;
  text-align: right;
}
</style>
