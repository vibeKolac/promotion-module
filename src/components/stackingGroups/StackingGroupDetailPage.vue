<!-- src/components/stackingGroups/StackingGroupDetailPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
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
          {{ visibleCount }} / {{ localRules.length }} rules
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
          :list="localRules"
          item-key="id"
          handle=".drag-handle"
          ghost-class="drag-ghost"
          :disabled="isFiltered"
          @change="onChange"
        >
          <template #item="{ element: rule }">
            <div
              v-show="isVisible(rule)"
              class="rule-row d-flex align-center px-4 py-2"
            >
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
              v-if="!localRules.length"
              class="pa-6 text-center text-caption text-medium-emphasis"
            >
              No rules in this group. Assign this group in the rule editor.
            </div>
            <div
              v-else-if="visibleCount === 0"
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

    <v-snackbar v-model="savedSnack" color="success" timeout="2000">Order saved</v-snackbar>
    <v-snackbar v-model="errorSnack" color="error" timeout="4000">Failed to save order</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { usePromotionsStore } from '../../stores/promotions'
import StatusBadge from '../shared/StatusBadge.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import Loader from '../_common/Loader.vue'

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
  { value: 'active',    label: 'Active',    color: 'success' },
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'paused',    label: 'Paused',    color: 'warning' },
  { value: 'draft',     label: 'Draft',     color: 'grey' },
  { value: 'ended',     label: 'Ended',     color: 'error' },
]

const statusFilter = ref(STATUS_OPTIONS.map(s => s.value))
const search = ref('')

function toggleStatus(value) {
  const idx = statusFilter.value.indexOf(value)
  if (idx === -1) statusFilter.value.push(value)
  else if (statusFilter.value.length > 1) statusFilter.value.splice(idx, 1)
}

const isFiltered = computed(() =>
  statusFilter.value.length !== STATUS_OPTIONS.length || !!search.value
)

function isVisible(rule) {
  return (
    statusFilter.value.includes(rule.status) &&
    (!search.value || rule.name.toLowerCase().includes(search.value.toLowerCase()))
  )
}

const visibleCount = computed(() => localRules.value.filter(isVisible).length)

// ── Local rules ───────────────────────────────────────────────────────────────
const localRules = ref([])

function buildLocalRules() {
  if (!group.value) return []
  return promoStore.items
    .filter(r =>
      group.value.isDefault
        ? r.stackingGroupId === group.value.id || r.stackingGroupId == null
        : r.stackingGroupId === group.value.id
    )
    .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
}

watch([group, () => promoStore.items], () => {
  localRules.value = buildLocalRules()
}, { deep: true })

onMounted(async () => {
  await Promise.all([sgStore.fetchAll(), promoStore.fetchAll()])
  localRules.value = buildLocalRules()
})

// ── Drag ──────────────────────────────────────────────────────────────────────
const savedSnack = ref(false)
const errorSnack = ref(false)

async function onChange() {
  const updates = localRules.value.map((r, i) => ({ id: r.id, priority: i + 1 }))
  try {
    await promoStore.updateMany(updates)
    localRules.value = localRules.value.map((r, i) => ({ ...r, priority: i + 1 }))
    savedSnack.value = true
  } catch {
    errorSnack.value = true
  }
}
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
.status-dot--ended     { background: #ef4444; }

.priority-label {
  min-width: 72px;
  text-align: right;
}
</style>
