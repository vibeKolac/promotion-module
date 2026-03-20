<!-- src/components/stackingGroups/StackingGroupsPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="[{ title: 'Stacking groups', disabled: true }]" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Stacking groups</h1>
      <v-spacer />
      <v-btn variant="outlined" prepend-icon="mdi-plus" class="text-uppercase" @click="openCreate">
        New group
      </v-btn>
    </div>

    <RulePriorityPreview :rules="promoStore.items" :groups="sgStore.items" class="mb-4" />

    <div v-if="sgStore.loading || promoStore.loading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate />
    </div>

    <div v-else class="d-flex flex-column gap-4">
      <div v-for="group in orderedGroups" :key="group.id">
        <v-card border elevation="0" :style="`border-color: ${group.color ?? '#94a3b8'}40`">

          <!-- Group header -->
          <div
            class="d-flex align-center pa-3 px-4"
            :style="`background: ${group.color ?? '#94a3b8'}14`"
          >
            <div
              class="color-dot mr-3"
              :style="`background: ${group.color ?? '#94a3b8'}`"
            />
            <span class="font-weight-bold text-body-1">{{ group.name }}</span>
            <v-chip
              size="x-small"
              class="ml-2"
              :color="group.color ?? 'default'"
              variant="tonal"
            >
              {{ localRules[group.id]?.length ?? 0 }}
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
              @click="openEdit(group)"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              :disabled="group.isDefault"
              @click="openDelete(group)"
            />
          </div>

          <!-- Draggable rules -->
          <draggable
            v-model="localRules[group.id]"
            :group="{ name: 'rules' }"
            item-key="id"
            handle=".drag-handle"
            ghost-class="drag-ghost"
            @change="(evt) => onChange(evt, group)"
          >
            <template #item="{ element: rule }">
              <div class="rule-row d-flex align-center px-4 py-2">
                <v-icon class="drag-handle mr-3" size="18" color="medium-emphasis" style="cursor:grab">
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
                <span class="text-caption text-medium-emphasis" style="min-width:72px; text-align:right">
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
                v-if="!localRules[group.id]?.length"
                class="pa-5 text-center text-caption text-medium-emphasis"
              >
                No rules — drag rules here or assign this group in the rule editor
              </div>
            </template>
          </draggable>

        </v-card>
      </div>
    </div>

    <StackingGroupDialog
      v-model="dialogOpen"
      :group="editingGroup"
      @saved="onSaved"
    />

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete group?</v-card-title>
        <v-card-text>
          <strong>{{ deletingGroup?.name }}</strong> will be permanently deleted. This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="savedSnack" color="success" timeout="2000">Changes saved</v-snackbar>
    <v-snackbar v-model="errorSnack" color="error" timeout="4000">{{ sgStore.error }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { usePromotionsStore } from '../../stores/promotions'
import StackingGroupDialog from './StackingGroupDialog.vue'
import StatusBadge from '../shared/StatusBadge.vue'
import RulePriorityPreview from '../promotions/RulePriorityPreview.vue'

const sgStore = useStackingGroupsStore()
const promoStore = usePromotionsStore()

const dialogOpen = ref(false)
const editingGroup = ref(null)
const deleteDialog = ref(false)
const deletingGroup = ref(null)
const deleting = ref(false)
const savedSnack = ref(false)
const errorSnack = ref(false)

const VISIBLE_STATUSES = ['active', 'paused', 'inactive']

// Groups sorted by priority; default group always last
const orderedGroups = computed(() =>
  [...sgStore.items].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return 1
    if (!a.isDefault && b.isDefault) return -1
    return (a.priority ?? 999) - (b.priority ?? 999)
  })
)

const defaultGroup = computed(() =>
  sgStore.items.find(g => g.isDefault) ?? null
)

// Local mutable rule lists per group — required by vuedraggable v-model
const localRules = ref({})

function buildLocalRules() {
  const map = {}
  for (const group of sgStore.items) {
    map[group.id] = promoStore.items
      .filter(r => {
        if (!VISIBLE_STATUSES.includes(r.status)) return false
        if (group.isDefault) {
          return r.stackingGroupId === group.id || r.stackingGroupId == null
        }
        return r.stackingGroupId === group.id
      })
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
  }
  return map
}

// Rebuild local state when store changes (after API saves)
watch(
  [() => sgStore.items, () => promoStore.items],
  () => { localRules.value = buildLocalRules() },
  { deep: true }
)

onMounted(async () => {
  await Promise.all([sgStore.fetchAll(), promoStore.fetchAll()])
  localRules.value = buildLocalRules()
})

async function onChange(evt, group) {
  const updates = []

  if (evt.moved) {
    // Reordered within the same group — renumber priorities
    localRules.value[group.id].forEach((r, i) => {
      updates.push({ id: r.id, priority: i + 1 })
    })
  }

  if (evt.added) {
    // Rule dragged into this group — assign new stackingGroupId + renumber
    const movedId = evt.added.element.id
    localRules.value[group.id].forEach((r, i) => {
      const update = { id: r.id, priority: i + 1 }
      if (r.id === movedId) update.stackingGroupId = group.id
      updates.push(update)
    })
  }

  if (evt.removed) {
    // Rule dragged out — renumber remaining rules in this group
    localRules.value[group.id].forEach((r, i) => {
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

function openCreate() {
  editingGroup.value = null
  dialogOpen.value = true
}

function openEdit(group) {
  editingGroup.value = group
  dialogOpen.value = true
}

function openDelete(group) {
  deletingGroup.value = group
  deleteDialog.value = true
}

async function confirmDelete() {
  deleting.value = true
  await sgStore.remove(deletingGroup.value.id)
  deleting.value = false
  deleteDialog.value = false
  deletingGroup.value = null
}

function onSaved() {}
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
.status-dot--active   { background: #22c55e; }
.status-dot--paused   { background: #f59e0b; }
.status-dot--inactive { background: #94a3b8; }
.status-dot--scheduled { background: #3b82f6; }
</style>
