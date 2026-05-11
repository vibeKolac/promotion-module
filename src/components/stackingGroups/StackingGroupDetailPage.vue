<!-- src/components/stackingGroups/StackingGroupDetailPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6 pb-16">
    <Breadcrumbs :append-breadcrumbs="breadcrumbs" />

    <ContentHeader>
      <template v-if="group">
        <span class="color-dot" :style="`background: ${group.color ?? '#94a3b8'}`" />
        <h1 class="text-h5 font-weight-bold">{{ group.name }}</h1>
        <v-chip v-if="!group.isDefault" size="small" variant="tonal" class="ml-1">
          group priority {{ group.priority }}
        </v-chip>
        <span v-if="group.isDefault" class="text-caption text-medium-emphasis ml-2">
          — rules with no group assigned
        </span>
      </template>
      <template #right>
        <v-btn variant="outlined" to="/stacking-groups">Back to groups</v-btn>
      </template>
    </ContentHeader>

    <Loader v-if="sgStore.loading || promoStore.loading" />

    <template v-else-if="group">
      <!-- Filter bar -->
      <div class="d-flex flex-wrap align-center gap-3 mb-3">
        <v-select
          v-model="statusFilter"
          :items="STATUS_OPTIONS"
          item-title="label"
          item-value="value"
          label="Status"
          variant="outlined"
          density="compact"
          hide-details
          multiple
          style="max-width: 220px"
        />

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
          {{ displayRules.length }} / {{ localRules.length }} rules
        </div>
      </div>

      <!-- Drag-disabled notice -->
      <v-alert
        v-if="isFiltered"
        type="info"
        variant="tonal"
        density="compact"
        icon="mdi-information-outline"
        class="mb-3"
      >
        Clear the filter to enable drag-and-drop reordering.
      </v-alert>

      <!-- Rules list -->
      <v-card border elevation="0">
        <draggable
          :list="displayRules"
          item-key="id"
          handle=".drag-handle"
          ghost-class="drag-ghost"
          :disabled="isFiltered"
          @change="onChange"
        >
          <template #item="{ element: rule }">
            <div class="rule-row d-flex align-center px-4 py-2">
              <v-icon
                class="drag-handle mr-3"
                :class="isFiltered ? 'text-disabled' : 'cursor-grab'"
                size="18"
                :color="isFiltered ? undefined : 'medium-emphasis'"
              >
                mdi-drag-vertical
              </v-icon>
              <span class="status-dot mr-2" :class="`status-dot--${rule.status}`" />
              <span class="font-weight-medium text-body-2">{{ rule.name }}</span>
              <v-chip size="x-small" class="ml-2 text-capitalize" variant="tonal" color="default">
                {{ rule.type.replace('_', ' ') }}
              </v-chip>
              <v-spacer />
              <StatusBadge :status="rule.status" class="mr-4" />
              <span class="text-caption text-medium-emphasis priority-label">
                priority {{ rule.priority }}
              </span>
              <v-tooltip text="Go to rule detail" location="left">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    :to="`/promotions/${rule.id}/edit`"
                    class="ml-1"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <template #footer>
            <div
              v-if="!localRules.length"
              class="pa-6 text-center text-caption text-medium-emphasis"
            >
              No rules in this group. Assign this group in the rule editor.
            </div>
            <div
              v-else-if="!displayRules.length"
              class="pa-6 text-center text-caption text-medium-emphasis"
            >
              No rules match the current filter.
            </div>
          </template>
        </draggable>
      </v-card>
    </template>

    <v-alert v-else-if="!sgStore.loading" color="error" variant="tonal" density="compact">
      Group not found.
    </v-alert>

    <!-- Sticky save bar -->
    <div v-if="isDirty" class="sticky-save-bar">
      <div class="sticky-save-bar__inner">
        <span class="text-body-2 text-medium-emphasis d-none d-sm-block">
          Rule order has been changed
        </span>
        <v-spacer />
        <v-btn variant="outlined" @click="discard">Discard</v-btn>
        <v-btn color="success" :loading="saving" @click="save">Save order</v-btn>
      </div>
    </div>

    <LeaveDialog
      v-model="leaveDialogOpen"
      :saving="saving"
      @cancel="cancelLeave"
      @leave="leaveWithoutSaving"
      @save-and-leave="saveAndLeave"
    />

    <v-snackbar v-model="savedSnack" color="success" timeout="2000">Order saved</v-snackbar>
    <v-snackbar v-model="errorSnack" color="error" timeout="4000">Failed to save order</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { usePromotionsStore } from '../../stores/promotions'
import { useNavigationGuard } from '../../composables/useNavigationGuard'
import StatusBadge from '../shared/StatusBadge.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import Loader from '../_common/Loader.vue'
import LeaveDialog from '../_common/LeaveDialog.vue'

const route = useRoute()
const sgStore = useStackingGroupsStore()
const promoStore = usePromotionsStore()

// ── Group ─────────────────────────────────────────────────────────────────────
const group = computed(() => sgStore.items.find(g => g.id === route.params.id))

const breadcrumbs = computed(() => [
  { title: group.value?.name ?? 'Group', disabled: true },
])

// ── Status filter ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'active',    label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused',    label: 'Paused' },
  { value: 'draft',     label: 'Draft' },
]

const statusFilter = ref([])
const search = ref('')

const isFiltered = computed(() => statusFilter.value.length > 0 || !!search.value)

// ── Local rules (excludes ended — they cannot be reordered) ───────────────────
const localRules = ref([])

function buildLocalRules() {
  if (!group.value) return []
  return promoStore.items
    .filter(r => {
      const inGroup = group.value.isDefault
        ? r.stackingGroupId === group.value.id || r.stackingGroupId == null
        : r.stackingGroupId === group.value.id
      return inGroup && r.status !== 'ended'
    })
    .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
}

watch([group, () => promoStore.items], () => {
  if (!isDirty.value) localRules.value = buildLocalRules()
}, { deep: true })

onMounted(async () => {
  await Promise.all([sgStore.fetchAll(), promoStore.fetchAll()])
  localRules.value = buildLocalRules()
})

// ── Display rules — what the draggable actually renders ───────────────────────
// When no filter: same reference as localRules (so Sortable.js mutations flow through)
// When filtered: a separate filtered array (drag disabled in that state)
const displayRules = ref([])

watchEffect(() => {
  if (!isFiltered.value) {
    displayRules.value = localRules.value
    return
  }
  displayRules.value = localRules.value.filter(r => {
    const statusMatch = !statusFilter.value.length || statusFilter.value.includes(r.status)
    const searchMatch = !search.value || r.name.toLowerCase().includes(search.value.toLowerCase())
    return statusMatch && searchMatch
  })
})

// ── Drag & save ───────────────────────────────────────────────────────────────
const isDirty = ref(false)
const saving = ref(false)
const savedSnack = ref(false)
const errorSnack = ref(false)

function onChange() {
  isDirty.value = true
}

function discard() {
  localRules.value = buildLocalRules()
  isDirty.value = false
}

async function save() {
  saving.value = true
  const updates = localRules.value.map((r, i) => ({ id: r.id, priority: i + 1 }))
  try {
    await promoStore.updateMany(updates)
    localRules.value = localRules.value.map((r, i) => ({ ...r, priority: i + 1 }))
    isDirty.value = false
    savedSnack.value = true
    return true
  } catch {
    errorSnack.value = true
    return false
  } finally {
    saving.value = false
  }
}

// ── Navigation guard ──────────────────────────────────────────────────────────
const { leaveDialogOpen, cancelLeave, leaveWithoutSaving, saveAndLeave } = useNavigationGuard({
  dirty: isDirty,
  onSaveAndLeave: save,
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

.priority-label {
  min-width: 72px;
  text-align: right;
}
</style>
