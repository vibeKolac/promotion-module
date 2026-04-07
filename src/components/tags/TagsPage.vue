<!-- src/components/tags/TagsPage.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="[{ title: 'Tags', disabled: true }]" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Tags</h1>
      <v-spacer />
      <v-btn variant="outlined" prepend-icon="mdi-plus" class="text-uppercase" @click="openCreate">
        New tag
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
            <template #prepend>
              <div class="tag-dot mr-3" :style="`background: ${tag.color}`" />
            </template>

            <v-list-item-title class="font-weight-medium d-flex align-center gap-2">
              {{ tag.name }}
              <v-chip
                size="x-small"
                :color="tag.visibleOnFrontend ? 'primary' : 'default'"
                :variant="tag.visibleOnFrontend ? 'tonal' : 'outlined'"
                label
              >
                <v-icon start size="11">{{ tag.visibleOnFrontend ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}</v-icon>
                {{ tag.visibleOnFrontend ? 'Visible on frontend' : 'Internal only' }}
              </v-chip>
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

      <v-alert v-else type="info" variant="tonal" density="compact" icon="mdi-tag-outline">
        No tags yet. Create your first tag to start labelling promotion rules.
      </v-alert>
    </template>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="formDialog" max-width="420" persistent>
      <v-card>
        <v-card-title class="text-h6">{{ editingTag ? 'Edit tag' : 'New tag' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Tag name *"
            variant="outlined"
            density="compact"
            autofocus
            class="mb-4"
            :error-messages="formError ? [formError] : []"
          />

          <div class="text-caption text-medium-emphasis mb-2">Color</div>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <div
              v-for="c in PALETTE"
              :key="c"
              class="color-swatch cursor-pointer"
              :style="`background: ${c}; outline: ${form.color === c ? '3px solid #1e293b' : '2px solid transparent'}; outline-offset: 2px`"
              @click="form.color = c"
            />
          </div>

          <v-divider class="mb-4" />

          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-body-2 font-weight-medium">Visible on frontend</div>
              <div class="text-caption text-medium-emphasis">
                {{ form.visibleOnFrontend ? 'Tag is shown to customers in the storefront.' : 'Internal use only — not shown to customers.' }}
              </div>
            </div>
            <v-switch
              v-model="form.visibleOnFrontend"
              color="primary"
              hide-details
              density="compact"
              inset
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeForm">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="submitForm">
            {{ editingTag ? 'Save' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete tag?</v-card-title>
        <v-card-text>
          <strong>{{ deletingTag?.name }}</strong> will be permanently deleted and removed from all rules.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="savedSnack" color="success" timeout="2000">Saved</v-snackbar>
    <v-snackbar v-model="errorSnack" color="error" timeout="5000">{{ errorMsg }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useTagsStore } from '../../stores/tags'
import { usePromotionsStore } from '../../stores/promotions'

const tagsStore = useTagsStore()
const promoStore = usePromotionsStore()

const PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#22C55E',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#6B7280', '#1E293B',
]

// Usage map: tag.id → { total, active }
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

// Form state
const formDialog = ref(false)
const editingTag = ref(null)
const saving = ref(false)
const formError = ref(null)
const form = reactive({ name: '', color: PALETTE[0], visibleOnFrontend: true })

function openCreate() {
  editingTag.value = null
  form.name = ''
  form.color = PALETTE[0]
  form.visibleOnFrontend = true
  formError.value = null
  formDialog.value = true
}

function openEdit(tag) {
  editingTag.value = tag
  form.name = tag.name
  form.color = tag.color ?? PALETTE[0]
  form.visibleOnFrontend = tag.visibleOnFrontend ?? true
  formError.value = null
  formDialog.value = true
}

function closeForm() {
  formDialog.value = false
  editingTag.value = null
}

async function submitForm() {
  if (!form.name.trim()) {
    formError.value = 'Tag name is required'
    return
  }
  formError.value = null
  saving.value = true
  try {
    const payload = { name: form.name.trim(), color: form.color, visibleOnFrontend: form.visibleOnFrontend }
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

// Delete state
const deleteDialog = ref(false)
const deletingTag = ref(null)
const deleting = ref(false)
const savedSnack = ref(false)
const errorSnack = ref(false)
const errorMsg = ref('')

function openDelete(tag) {
  deletingTag.value = tag
  deleteDialog.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await tagsStore.remove(deletingTag.value.id)
    savedSnack.value = true
    deleteDialog.value = false
    deletingTag.value = null
  } catch (e) {
    errorMsg.value = e?.response?.data?.error ?? e?.message ?? 'Failed to delete'
    errorSnack.value = true
    deleteDialog.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([tagsStore.fetchAll(), promoStore.fetchAll()])
})
</script>

<style scoped>
.tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.1s;
}

.color-swatch:hover {
  transform: scale(1.15);
}
</style>
