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

    <Loader v-if="sgStore.loading || promoStore.loading" />

    <v-card v-else border elevation="0">
      <v-data-table
        :headers="headers"
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
            <v-chip
              size="x-small"
              :color="item.color ?? 'default'"
              variant="tonal"
            >
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
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="openEdit(item)"
            />
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
import PageActionBtn from '../_common/PageActionBtn.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'
import Loader from '../_common/Loader.vue'
import ConfirmModal from '../_common/ConfirmModal.vue'

const router = useRouter()
const sgStore = useStackingGroupsStore()
const promoStore = usePromotionsStore()

const headers = [
  { title: 'Group',    key: 'name',     sortable: false },
  { title: 'Priority', key: 'priority', width: '110px' },
  { title: 'Rules',    key: 'rules',    sortable: false, width: '190px' },
  { title: '',         key: 'actions',  sortable: false, width: '96px', align: 'end' },
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

.groups-table :deep(tr) {
  cursor: pointer;
}
</style>
