<!-- src/components/stackingGroups/StackingGroupsPage.vue -->
<template>
  <v-container fluid class="pa-6">
    <!-- Title row -->
    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Stacking groups</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" class="text-uppercase" @click="openCreate">
        New group
      </v-btn>
    </div>

    <!-- Table -->
    <v-card border elevation="0">
      <v-data-table
        :headers="headers"
        :items="store.items"
        :loading="store.loading"
        item-value="id"
        hover
      >
        <template #item.color="{ item }">
          <div
            class="color-dot"
            :style="{ backgroundColor: item.color || '#3B82F6' }"
          />
        </template>

        <template #item.isDefault="{ item }">
          <v-icon v-if="item.isDefault" color="success" size="18">mdi-check-circle</v-icon>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            :disabled="item.isDefault"
            @click="openDelete(item)"
          />
        </template>

        <template #no-data>
          <div class="text-center pa-8 text-medium-emphasis">No stacking groups found</div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit dialog -->
    <StackingGroupDialog
      v-model="dialogOpen"
      :group="editingGroup"
      @saved="onSaved"
    />

    <!-- Delete confirmation snackbar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete group?</v-card-title>
        <v-card-text>
          This action cannot be undone. The group <strong>{{ deletingGroup?.name }}</strong> will be permanently deleted.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import StackingGroupDialog from './StackingGroupDialog.vue'

const store = useStackingGroupsStore()

const dialogOpen = ref(false)
const editingGroup = ref(null)
const deleteDialog = ref(false)
const deletingGroup = ref(null)
const deleting = ref(false)

const headers = [
  { title: 'Color', key: 'color', sortable: false, width: '60px' },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true, width: '110px' },
  { title: 'Default', key: 'isDefault', sortable: false, width: '90px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '90px', align: 'end' },
]

onMounted(() => store.fetchAll())

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
  await store.remove(deletingGroup.value.id)
  deleting.value = false
  deleteDialog.value = false
  deletingGroup.value = null
}

function onSaved() {
  // store already updated by dialog; nothing extra needed
}
</script>

<style scoped>
.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
}
</style>
