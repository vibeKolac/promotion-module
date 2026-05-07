<!-- src/components/tags/TagsPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="[{ title: 'Action Labels', disabled: true }]" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Action Labels</h1>
      <v-spacer />
      <v-btn variant="outlined" prepend-icon="mdi-plus" class="text-uppercase" @click="openCreate">
        New label
      </v-btn>
    </div>

    <div v-if="tagsStore.loading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate />
    </div>

    <template v-else>
      <v-card v-if="tagsStore.items.length" border elevation="0">
        <v-list>
          <v-list-item
            v-for="tag in tagsStore.items"
            :key="tag.id"
            :ripple="false"
          >
            <v-list-item-title class="font-weight-medium">
              {{ tag.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <span v-if="usageMap[tag.id]?.total">
                {{ usageMap[tag.id].total }} rule{{ usageMap[tag.id].total > 1 ? 's' : '' }}
                <template v-if="usageMap[tag.id].active">
                  — <span class="text-error font-weight-medium">{{ usageMap[tag.id].active }} active</span>
                </template>
              </span>
              <span v-else class="text-medium-emphasis">not in use</span>
            </v-list-item-subtitle>

            <template #append>
              <v-tooltip v-if="usageMap[tag.id]?.active" location="left">
                <template #activator="{ props: tp }">
                  <v-icon v-bind="tp" color="warning" size="18" class="mr-2">mdi-shield-lock-outline</v-icon>
                </template>
                Applied on {{ usageMap[tag.id].active }} active rule(s) — edit and delete are locked
              </v-tooltip>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                :disabled="!!usageMap[tag.id]?.active"
                @click="openEdit(tag)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                :disabled="!!usageMap[tag.id]?.active"
                @click="openDelete(tag)"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-alert v-else color="grey" variant="tonal" density="compact" icon="mdi-label-outline">
        No action labels yet. Create your first label to start organising promotion rules.
      </v-alert>
    </template>

    <!-- Create / Edit dialog -->
    <DialogCard ref="formDialogCard" max-width="420" persistent>
      <template #title>{{ editingTag ? 'Edit label' : 'New label' }}</template>

          <TextInput
            v-model="form.name"
            label="Label name *"
            autofocus
            class="mb-4"
            :error-messages="formError ? [formError] : []"
          />

      <template #actions>
        <v-btn variant="text" @click="closeForm">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" @click="submitForm">
          {{ editingTag ? 'Save' : 'Create' }}
        </v-btn>
      </template>
    </DialogCard>

    <!-- Delete confirmation -->
    <ConfirmModal ref="deleteConfirmModal" confirm-text="Delete" confirm-color="error" :loading="deleting">
      <template #header>Delete label?</template>
      <template #body>
        <strong>{{ deletingTag?.name }}</strong> will be permanently deleted and removed from all rules.
      </template>
    </ConfirmModal>

    <v-snackbar v-model="savedSnack" color="success" timeout="2000">Saved</v-snackbar>
    <v-snackbar v-model="errorSnack" color="error" timeout="5000">{{ errorMsg }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useTagsStore } from '../../stores/tags'
import { usePromotionsStore } from '../../stores/promotions'
import DialogCard from '../_common/DialogCard.vue'
import ConfirmModal from '../_common/ConfirmModal.vue'
import TextInput from '../_common/TextInput.vue'

const tagsStore = useTagsStore()
const promoStore = usePromotionsStore()

const usageMap = computed(() => {
  const map = {}
  for (const tag of tagsStore.items) {
    const rules = promoStore.items.filter(p => (p.tags ?? []).includes(tag.id))
    map[tag.id] = {
      total: rules.length,
      active: rules.filter(r => r.status === 'active').length,
    }
  }
  return map
})

const formDialogCard = ref(null)
const editingTag = ref(null)
const saving = ref(false)
const formError = ref(null)
const form = reactive({ name: '' })

function openCreate() {
  editingTag.value = null
  form.name = ''
  formError.value = null
  formDialogCard.value.open()
}

function openEdit(tag) {
  editingTag.value = tag
  form.name = tag.name
  formError.value = null
  formDialogCard.value.open()
}

function closeForm() {
  formDialogCard.value.close()
  editingTag.value = null
}

async function submitForm() {
  if (!form.name.trim()) {
    formError.value = 'Label name is required'
    return
  }
  formError.value = null
  saving.value = true
  try {
    const payload = { name: form.name.trim() }
    if (editingTag.value) {
      await tagsStore.update(editingTag.value.id, payload)
    } else {
      await tagsStore.create(payload)
    }
    savedSnack.value = true
    closeForm()
  } catch (e) {
    formError.value = e?.response?.data?.error ?? e?.message ?? 'Failed to save'
  } finally {
    saving.value = false
  }
}

const deleteConfirmModal = ref(null)
const deletingTag = ref(null)
const deleting = ref(false)
const savedSnack = ref(false)
const errorSnack = ref(false)
const errorMsg = ref('')

async function openDelete(tag) {
  deletingTag.value = tag
  const confirmed = await deleteConfirmModal.value.open()
  if (!confirmed) { deletingTag.value = null; return }
  deleting.value = true
  try {
    await tagsStore.remove(tag.id)
    savedSnack.value = true
    deletingTag.value = null
  } catch (e) {
    errorMsg.value = e?.response?.data?.error ?? e?.message ?? 'Failed to delete'
    errorSnack.value = true
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([tagsStore.fetchAll(), promoStore.fetchAll()])
})
</script>
