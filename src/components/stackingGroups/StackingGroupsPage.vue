<!-- src/components/stackingGroups/StackingGroupsPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Priority &amp; grouping</h1>
      <template #right>
        <PageActionBtn @click="openCreate">New group</PageActionBtn>
      </template>
    </ContentHeader>

    <!-- Filter bar — sticky so it stays visible while scrolling through 20 groups -->
    <div class="filter-bar d-flex flex-wrap align-center gap-3">
      <div class="d-flex align-center gap-1 flex-wrap">
        <span class="text-caption text-medium-emphasis mr-1">Show:</span>
        <v-chip
          v-for="s in STATUS_OPTIONS"
          :key="s.value"
          :color="statusFilter.includes(s.value) ? s.color : undefined"
          :variant="statusFilter.includes(s.value) ? 'flat' : 'outlined'"
          size="small"
          label
          class="cursor-pointer"
          @click="toggleStatus(s.value)"
        >
          <v-icon v-if="statusFilter.includes(s.value)" start size="12">mdi-check</v-icon>
          {{ s.label }}
        </v-chip>
        <v-btn
          v-if="statusFilter.length !== STATUS_OPTIONS.length"
          variant="text"
          size="x-small"
          color="primary"
          class="ml-1"
          @click="statusFilter = STATUS_OPTIONS.map(s => s.value)"
        >All</v-btn>
      </div>

      <v-spacer />

      <v-text-field
        v-model="search"
        placeholder="Search rules…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="input-search"
      />

      <div class="text-caption text-medium-emphasis text-no-wrap">
        {{ totalVisible }} / {{ totalRules }} rules
      </div>
    </div>

    <Loader v-if="sgStore.loading || promoStore.loading" />

    <div v-else class="groups-grid">
      <div v-for="group in orderedGroups" :key="group.id">
        <v-card border elevation="0" :style="`border-color: ${group.color ?? '#94a3b8'}40`">

          <!-- Group header -->
          <div
            class="d-flex align-center pa-3 px-4 group-header"
            :style="`background: ${group.color ?? '#94a3b8'}14`"
            @click="toggleGroup(group.id)"
          >
            <div
              class="color-dot mr-3"
              :style="`background: ${group.color ?? '#94a3b8'}`"
            />
            <span class="font-weight-bold text-body-1">{{ group.name }}</span>

            <!-- Rule count chips -->
            <v-chip size="x-small" class="ml-2" :color="group.color ?? 'default'" variant="tonal">
              {{ visibleRules(group.id).length }}
              <template v-if="visibleRules(group.id).length !== (localRules[group.id]?.length ?? 0)">
                / {{ localRules[group.id]?.length ?? 0 }}
              </template>
            </v-chip>

            <span v-if="group.isDefault" class="text-caption text-medium-emphasis ml-3">
              — rules with no group assigned
            </span>
            <v-spacer />
            <span class="text-caption text-medium-emphasis mr-3">group priority {{ group.priority }}</span>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click.stop="openEdit(group)"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              :disabled="group.isDefault"
              @click.stop="openDelete(group)"
            />
            <v-btn
              :icon="collapsedGroups.has(group.id) ? 'mdi-chevron-down' : 'mdi-chevron-up'"
              variant="text"
              size="small"
              @click.stop="toggleGroup(group.id)"
            />
          </div>

          <!-- Draggable rules (only when expanded) -->
          <v-expand-transition>
            <div v-show="!collapsedGroups.has(group.id)">
              <draggable
                v-model="filteredLocalRules[group.id]"
                :group="{ name: 'rules' }"
                item-key="id"
                handle=".drag-handle"
                ghost-class="drag-ghost"
                @change="(evt) => onChange(evt, group)"
              >
                <template #item="{ element: rule }">
                  <div class="rule-row d-flex align-center px-4 py-2">
                    <v-icon class="drag-handle cursor-grab mr-3" size="18" color="medium-emphasis">
                      mdi-drag-vertical
                    </v-icon>
                    <span
                      class="status-dot mr-2"
                      :class="`status-dot--${rule.status}`"
                    />
                    <span class="font-weight-medium text-body-2">{{ rule.name }}</span>
                    <v-chip size="x-small" class="ml-2 text-capitalize" variant="tonal" color="default">
                      {{ rule.type.replace('_', ' ') }}
                    </v-chip>
                    <v-spacer />
                    <StatusBadge :status="rule.status" class="mr-4" />
                    <span class="text-caption text-medium-emphasis priority-label">
                      priority {{ rule.priority }}
                    </span>
                    <v-btn
                      icon="mdi-open-in-new"
                      variant="text"
                      size="small"
                      :to="`/promotions/${rule.id}/edit`"
                      class="ml-1"
                    />
                  </div>
                </template>

                <template #footer>
                  <div
                    v-if="!visibleRules(group.id).length"
                    class="pa-5 text-center text-caption text-medium-emphasis"
                  >
                    <template v-if="!localRules[group.id]?.length">
                      No rules — drag rules here or assign this group in the rule editor
                    </template>
                    <template v-else>
                      No rules match the current filter
                    </template>
                  </div>
                </template>
              </draggable>
            </div>
          </v-expand-transition>

        </v-card>
      </div>

      <v-alert v-if="!orderedGroups.length" color="grey" variant="tonal" density="compact" class="grid-full-span">
        No priority groups defined yet.
      </v-alert>
    </div>

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

    <v-snackbar v-model="savedSnack" color="success" timeout="2000">Changes saved</v-snackbar>
    <v-snackbar v-model="errorSnack" color="error" timeout="4000">{{ sgStore.error }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { usePromotionsStore } from '../../stores/promotions'
import StackingGroupDialog from './StackingGroupDialog.vue'
import StatusBadge from '../shared/StatusBadge.vue'
import PageActionBtn from '../_common/PageActionBtn.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import Loader from '../_common/Loader.vue'
import ConfirmModal from '../_common/ConfirmModal.vue'

const sgStore = useStackingGroupsStore()
const promoStore = usePromotionsStore()

// ── Status filter ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'active',    label: 'Active',    color: 'success' },
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'paused',    label: 'Paused',    color: 'warning' },
  { value: 'draft',     label: 'Draft',     color: 'grey' },
  { value: 'ended',     label: 'Ended',     color: 'error' },
]

const statusFilter = ref(['active', 'scheduled'])
const search = ref('')

function toggleStatus(value) {
  const idx = statusFilter.value.indexOf(value)
  if (idx === -1) statusFilter.value.push(value)
  else if (statusFilter.value.length > 1) statusFilter.value.splice(idx, 1)
}

// ── Collapse state ────────────────────────────────────────────────────────────
const collapsedGroups = reactive(new Set())

function toggleGroup(id) {
  if (collapsedGroups.has(id)) collapsedGroups.delete(id)
  else collapsedGroups.add(id)
}

// ── Groups order ──────────────────────────────────────────────────────────────
const orderedGroups = computed(() =>
  [...sgStore.items].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return 1
    if (!a.isDefault && b.isDefault) return -1
    return (a.priority ?? 999) - (b.priority ?? 999)
  })
)

// ── Local rule state (full list, used by drag) ────────────────────────────────
const localRules = ref({})

function buildLocalRules() {
  const map = {}
  for (const group of sgStore.items) {
    map[group.id] = promoStore.items
      .filter(r => {
        if (group.isDefault) return r.stackingGroupId === group.id || r.stackingGroupId == null
        return r.stackingGroupId === group.id
      })
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
  }
  return map
}

watch(
  [() => sgStore.items, () => promoStore.items],
  () => { localRules.value = buildLocalRules() },
  { deep: true }
)

onMounted(async () => {
  await Promise.all([sgStore.fetchAll(), promoStore.fetchAll()])
  localRules.value = buildLocalRules()
})

// ── Filtered view (what draggable actually binds to) ──────────────────────────
const filteredLocalRules = computed({
  get() {
    const out = {}
    for (const [groupId, rules] of Object.entries(localRules.value)) {
      out[groupId] = rules.filter(r =>
        statusFilter.value.includes(r.status) &&
        (!search.value || r.name.toLowerCase().includes(search.value.toLowerCase()))
      )
    }
    return out
  },
  set(val) {
    // When draggable mutates the array, sync back to localRules
    for (const [groupId, rules] of Object.entries(val)) {
      localRules.value[groupId] = rules
    }
  },
})

function visibleRules(groupId) {
  return filteredLocalRules.value[groupId] ?? []
}

const totalRules = computed(() =>
  Object.values(localRules.value).reduce((sum, arr) => sum + arr.length, 0)
)

const totalVisible = computed(() =>
  Object.values(filteredLocalRules.value).reduce((sum, arr) => sum + arr.length, 0)
)

// ── Drag handlers ─────────────────────────────────────────────────────────────
async function onChange(evt, group) {
  const updates = []

  if (evt.moved) {
    filteredLocalRules.value[group.id].forEach((r, i) => {
      updates.push({ id: r.id, priority: i + 1 })
    })
  }

  if (evt.added) {
    const movedId = evt.added.element.id
    filteredLocalRules.value[group.id].forEach((r, i) => {
      const update = { id: r.id, priority: i + 1 }
      if (r.id === movedId) update.stackingGroupId = group.id
      updates.push(update)
    })
  }

  if (evt.removed) {
    filteredLocalRules.value[group.id].forEach((r, i) => {
      updates.push({ id: r.id, priority: i + 1 })
    })
  }

  if (!updates.length) return

  try {
    await promoStore.updateMany(updates)
    savedSnack.value = true
  } catch {
    errorSnack.value = true
  }
}

// ── Group CRUD ────────────────────────────────────────────────────────────────
const dialogOpen = ref(false)
const editingGroup = ref(null)
const deleteConfirm = ref(null)
const deletingGroup = ref(null)
const deleting = ref(false)
const savedSnack = ref(false)
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
  deletingGroup.value = group
  const confirmed = await deleteConfirm.value.open(group)
  if (!confirmed) { deletingGroup.value = null; return }
  deleting.value = true
  await sgStore.remove(group.id)
  deleting.value = false
  deletingGroup.value = null
}

function onSaved() {}
</script>

<style scoped>
/* Sticky filter bar — stays visible while scrolling through groups */
.filter-bar {
  position: sticky;
  top: 52px; /* AppTopBar height */
  z-index: 4;
  background: rgb(var(--v-theme-background));
  padding: 8px 0 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Two-column grid so 20 groups fit without excessive vertical scrolling */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  align-items: start; /* columns grow independently — no height matching */
  padding-top: 12px;
}

@media (max-width: 1023px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }
}

.grid-full-span {
  grid-column: 1 / -1;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.group-header {
  cursor: pointer;
  user-select: none;
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

.priority-label {
  min-width: 72px;
  text-align: right;
}
</style>
