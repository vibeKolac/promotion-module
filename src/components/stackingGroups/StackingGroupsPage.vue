<!-- src/components/stackingGroups/StackingGroupsPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Priority &amp; grouping</h1>
      <template #right>
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
        <PageActionBtn v-if="view === 'groups'" @click="openCreate">New group</PageActionBtn>
      </template>
    </ContentHeader>

    <Loader v-if="sgStore.loading || promoStore.loading" />

    <template v-else>
      <!-- ── Groups table ── -->
      <v-card v-if="view === 'groups'" border elevation="0">
        <v-data-table
          :headers="groupHeaders"
          :items="orderedGroups"
          item-value="id"
          hover
          hide-default-footer
          :items-per-page="-1"
          class="groups-table"
          @click:row="(_, { item }) => router.push(`/stacking-groups/${item.id}`)"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center gap-2 py-1">
              <span class="color-dot" :style="`background: ${item.color ?? '#94a3b8'}`" />
              <span class="font-weight-medium">{{ item.name }}</span>
              <span v-if="item.isDefault" class="text-caption text-medium-emphasis ml-1">
                — rules with no group assigned
              </span>
            </div>
          </template>

          <template #item.priority="{ item }">
            <span v-if="item.isDefault" class="text-medium-emphasis">—</span>
            <span v-else>{{ item.priority }}</span>
          </template>

          <template #item.rules="{ item }">
            <div class="d-flex align-center gap-2">
              <v-chip size="x-small" :color="item.color ?? 'default'" variant="tonal">
                {{ ruleCounts[item.id]?.active ?? 0 }} active
              </v-chip>
              <span class="text-caption text-medium-emphasis">
                / {{ ruleCounts[item.id]?.total ?? 0 }} total
              </span>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end" @click.stop>
              <v-btn
                icon="mdi-eye"
                variant="text"
                size="small"
                @click="router.push(`/stacking-groups/${item.id}`)"
              />
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                :disabled="item.isDefault"
                @click="openDelete(item)"
              />
            </div>
          </template>

          <template #no-data>
            <div class="pa-6 text-center text-medium-emphasis text-caption">
              No priority groups defined yet.
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- ── Processing order table ── -->
      <template v-else>
        <p class="text-caption text-medium-emphasis mb-3">
          Rules are processed top to bottom. Group priority determines the block order;
          rule priority determines the order within each block.
        </p>

        <v-card border elevation="0">
          <v-data-table
            :headers="orderHeaders"
            :items="processingOrder"
            item-value="id"
            hide-default-footer
            :items-per-page="-1"
          >
            <template #item._seq="{ item }">
              <span class="text-caption font-weight-bold text-medium-emphasis order-num">
                #{{ item._seq }}
              </span>
            </template>

            <template #item.name="{ item }">
              <div class="d-flex align-center gap-2 py-1">
                <span class="status-dot" :class="`status-dot--${item.status}`" />
                <span class="font-weight-medium">{{ item.name }}</span>
                <v-chip size="x-small" class="text-capitalize" variant="tonal" color="default">
                  {{ item.type.replace('_', ' ') }}
                </v-chip>
              </div>
            </template>

            <template #item.status="{ item }">
              <StatusBadge :status="item.status" />
            </template>

            <template #item._group="{ item }">
              <div class="d-flex align-center gap-2">
                <span
                  class="color-dot"
                  :style="`background: ${item._group?.color ?? '#94a3b8'}`"
                />
                <span class="text-body-2">{{ item._group?.name ?? 'Unassigned' }}</span>
                <span v-if="!item._group?.isDefault" class="text-caption text-medium-emphasis">
                  · priority {{ item._group?.priority }}
                </span>
              </div>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-open-in-new"
                variant="text"
                size="small"
                :to="`/promotions/${item.id}/edit`"
              />
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

    <v-snackbar v-model="errorSnack" color="error" timeout="4000">{{ sgStore.error }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { usePromotionsStore } from '../../stores/promotions'
import StackingGroupDialog from './StackingGroupDialog.vue'
import StatusBadge from '../shared/StatusBadge.vue'
import PageActionBtn from '../_common/PageActionBtn.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import Loader from '../_common/Loader.vue'
import ConfirmModal from '../_common/ConfirmModal.vue'

const router = useRouter()
const sgStore = useStackingGroupsStore()
const promoStore = usePromotionsStore()

// ── View toggle ───────────────────────────────────────────────────────────────
const view = ref('groups')

// ── Groups table ──────────────────────────────────────────────────────────────
const groupHeaders = [
  { title: 'Group',    key: 'name',     sortable: false },
  { title: 'Priority', key: 'priority', width: '110px' },
  { title: 'Rules',    key: 'rules',    sortable: false, width: '190px' },
  { title: '',         key: 'actions',  sortable: false, width: '132px', align: 'end' },
]

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
      group.isDefault
        ? r.stackingGroupId === group.id || r.stackingGroupId == null
        : r.stackingGroupId === group.id
    )
    map[group.id] = {
      total: rules.length,
      active: rules.filter(r => r.status === 'active').length,
    }
  }
  return map
})

// ── Processing order table ────────────────────────────────────────────────────
const orderHeaders = [
  { title: '#',      key: '_seq',    sortable: false, width: '56px' },
  { title: 'Rule',   key: 'name',    sortable: false },
  { title: 'Status', key: 'status',  sortable: false, width: '130px' },
  { title: 'Group',  key: '_group',  sortable: false, width: '220px' },
  { title: '',       key: 'actions', sortable: false, width: '48px', align: 'end' },
]

function getRuleGroup(rule) {
  if (rule.stackingGroupId == null) return sgStore.items.find(g => g.isDefault) ?? null
  return sgStore.items.find(g => g.id === rule.stackingGroupId) ?? null
}

const processingOrder = computed(() =>
  [...promoStore.items]
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

onMounted(() => Promise.all([sgStore.fetchAll(), promoStore.fetchAll()]))

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
</script>

<style scoped>
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
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

.groups-table :deep(tr) {
  cursor: pointer;
}

.order-num {
  min-width: 32px;
  display: inline-block;
  text-align: right;
}
</style>
