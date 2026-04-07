<!-- src/components/promotions/TagsSection.vue -->
<template>
  <v-card border elevation="0" class="pa-5">
    <div class="text-body-1 font-weight-bold mb-3">Tags</div>

    <div v-if="tagsStore.loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate size="24" />
    </div>

    <template v-else>
      <!-- Search -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search tags…"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="mb-3"
      />

      <!-- Tag chips — click to apply / remove -->
      <div v-if="filteredTags.length" class="d-flex flex-wrap gap-2 mb-3">
        <v-chip
          v-for="tag in filteredTags"
          :key="tag.id"
          :color="tag.color"
          :variant="modelValue.includes(tag.id) ? 'flat' : 'outlined'"
          size="small"
          label
          class="cursor-pointer"
          @click="toggle(tag.id)"
        >
          <v-icon v-if="modelValue.includes(tag.id)" start size="14">mdi-check</v-icon>
          {{ tag.name }}
        </v-chip>
      </div>

      <p v-else-if="!search && !tagsStore.items.length" class="text-caption text-medium-emphasis mb-2">
        No tags defined yet.
      </p>
      <p v-else-if="search && !filteredTags.length" class="text-caption text-medium-emphasis mb-2">
        No tags match "{{ search }}".
      </p>

      <!-- Applied tags — visibility control -->
      <template v-if="appliedTags.length">
        <v-divider class="my-3" />
        <div class="text-caption font-weight-medium text-medium-emphasis mb-2 text-uppercase">Applied tags</div>
        <div class="d-flex flex-column gap-1">
          <div
            v-for="tag in appliedTags"
            :key="tag.id"
            class="d-flex align-center gap-2"
          >
            <div class="tag-dot flex-shrink-0" :style="`background: ${tag.color}`" />
            <span class="text-body-2 flex-grow-1">{{ tag.name }}</span>
            <v-tooltip location="left">
              <template #activator="{ props: tp }">
                <v-btn
                  v-bind="tp"
                  :icon="tag.visibleOnFrontend ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  :color="tag.visibleOnFrontend ? 'primary' : 'default'"
                  variant="text"
                  size="x-small"
                  :loading="togglingId === tag.id"
                  @click="toggleVisibility(tag)"
                />
              </template>
              {{ tag.visibleOnFrontend ? 'Visible on frontend — click to make internal only' : 'Internal only — click to make visible on frontend' }}
            </v-tooltip>
          </div>
        </div>
      </template>

      <!-- Inline create -->
      <v-divider class="my-3" />
      <template v-if="!creatingNew">
        <v-btn
          variant="text"
          size="small"
          color="primary"
          prepend-icon="mdi-plus"
          class="px-0 text-none"
          @click="openCreate"
        >
          {{ search && !exactMatch ? `Create "${search}"` : 'New tag' }}
        </v-btn>
      </template>

      <div v-else class="pa-3 rounded border create-inline">
        <div class="text-caption font-weight-medium mb-2">New tag</div>
        <v-text-field
          v-model="newName"
          label="Tag name *"
          variant="outlined"
          density="compact"
          hide-details
          autofocus
          class="mb-3"
        />
        <div class="text-caption text-medium-emphasis mb-2">Color</div>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <div
            v-for="c in PALETTE"
            :key="c"
            class="color-swatch cursor-pointer"
            :style="`background: ${c}; outline: ${newColor === c ? '3px solid #1e293b' : '2px solid transparent'}; outline-offset: 2px`"
            @click="newColor = c"
          />
        </div>
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <div class="text-caption font-weight-medium">Visible on frontend</div>
            <div class="text-caption text-medium-emphasis">
              {{ newVisibleOnFrontend ? 'Shown to customers in the storefront' : 'Internal use only' }}
            </div>
          </div>
          <v-switch
            v-model="newVisibleOnFrontend"
            color="primary"
            hide-details
            density="compact"
            inset
          />
        </div>
        <div class="d-flex gap-2 justify-end">
          <v-btn variant="text" size="small" @click="cancelCreate">Cancel</v-btn>
          <v-btn color="primary" variant="flat" size="small" :loading="creating" @click="submitCreate">Create</v-btn>
        </div>
        <div v-if="createError" class="text-caption text-error mt-1">{{ createError }}</div>
      </div>

      <!-- Footer -->
      <div v-if="!creatingNew" class="text-caption text-medium-emphasis mt-2">
        <router-link to="/tags" class="text-decoration-none text-primary">Manage all tags</router-link>
      </div>
    </template>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTagsStore } from '../../stores/tags'

const PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#22C55E',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#6B7280', '#1E293B',
]

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const tagsStore = useTagsStore()
const search = ref('')

const filteredTags = computed(() => {
  if (!search.value) return tagsStore.items
  const q = search.value.toLowerCase()
  return tagsStore.items.filter(t => t.name.toLowerCase().includes(q))
})

const exactMatch = computed(() =>
  tagsStore.items.some(t => t.name.toLowerCase() === search.value.toLowerCase())
)

const appliedTags = computed(() =>
  tagsStore.items.filter(t => props.modelValue.includes(t.id))
)

function toggle(id) {
  const current = [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

const togglingId = ref(null)

async function toggleVisibility(tag) {
  togglingId.value = tag.id
  try {
    await tagsStore.update(tag.id, { ...tag, visibleOnFrontend: !tag.visibleOnFrontend })
  } finally {
    togglingId.value = null
  }
}

// Inline create
const creatingNew = ref(false)
const newName = ref('')
const newColor = ref(PALETTE[0])
const newVisibleOnFrontend = ref(true)
const creating = ref(false)
const createError = ref(null)

function openCreate() {
  newName.value = search.value
  newColor.value = PALETTE[0]
  newVisibleOnFrontend.value = true
  createError.value = null
  creatingNew.value = true
}

function cancelCreate() {
  creatingNew.value = false
  newName.value = ''
  createError.value = null
}

async function submitCreate() {
  if (!newName.value.trim()) {
    createError.value = 'Tag name is required'
    return
  }
  createError.value = null
  creating.value = true
  try {
    const tag = await tagsStore.create({ name: newName.value.trim(), color: newColor.value, visibleOnFrontend: newVisibleOnFrontend.value })
    emit('update:modelValue', [...props.modelValue, tag.id])
    search.value = ''
    cancelCreate()
  } catch (e) {
    createError.value = e?.response?.data?.error ?? e?.message ?? 'Failed to create'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  if (!tagsStore.items.length) tagsStore.fetchAll()
})
</script>

<style scoped>
.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.1s;
}
.color-swatch:hover {
  transform: scale(1.15);
}
.create-inline {
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
