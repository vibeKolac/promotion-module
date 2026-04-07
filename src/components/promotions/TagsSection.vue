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

      <!-- Tag chips -->
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

      <!-- Inline create -->
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

      <div v-else class="mt-2 pa-3 rounded border create-inline">
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
        <div class="d-flex gap-2 justify-end">
          <v-btn variant="text" size="small" @click="cancelCreate">Cancel</v-btn>
          <v-btn color="primary" variant="flat" size="small" :loading="creating" @click="submitCreate">Create</v-btn>
        </div>
        <div v-if="createError" class="text-caption text-error mt-1">{{ createError }}</div>
      </div>

      <!-- Footer hint -->
      <div v-if="modelValue.length && !creatingNew" class="text-caption text-medium-emphasis mt-2">
        {{ modelValue.length }} tag{{ modelValue.length > 1 ? 's' : '' }} applied
        — <router-link to="/tags" class="text-decoration-none text-primary">Manage tags</router-link>
      </div>
      <div v-else-if="tagsStore.items.length && !creatingNew" class="text-caption text-medium-emphasis mt-1">
        <router-link to="/tags" class="text-decoration-none text-primary">Manage tags</router-link>
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

function toggle(id) {
  const current = [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

// Inline create
const creatingNew = ref(false)
const newName = ref('')
const newColor = ref(PALETTE[0])
const creating = ref(false)
const createError = ref(null)

function openCreate() {
  newName.value = search.value
  newColor.value = PALETTE[0]
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
    const tag = await tagsStore.create({ name: newName.value.trim(), color: newColor.value, visibleOnFrontend: true })
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
