<!-- src/components/promotions/TagsSection.vue -->
<template>
  <v-card border elevation="0" class="pa-5 mb-4 mt-6">
    <div class="text-body-1 font-weight-bold mb-3">Action Labels</div>

    <v-autocomplete
      :model-value="modelValue"
      :items="tagsStore.items"
      :loading="tagsStore.loading || creating"
      item-title="name"
      item-value="id"
      multiple
      chips
      closable-chips
      variant="outlined"
      density="compact"
      placeholder="Select labels…"
      hide-details
      no-data-text="Type a name to create a new label"
      v-model:search="newTagName"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #prepend-item>
        <v-list-item
          v-if="newTagName.trim() && !tagExists"
          prepend-icon="mdi-plus-circle-outline"
          :title="`Create '${newTagName.trim()}'`"
          color="primary"
          @click="createTag"
        />
      </template>
    </v-autocomplete>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTagsStore } from '../../stores/tags'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const tagsStore = useTagsStore()
const newTagName = ref('')
const creating = ref(false)

const tagExists = computed(() =>
  tagsStore.items.some(t => t.name.toLowerCase() === newTagName.value.trim().toLowerCase())
)

async function createTag() {
  const name = newTagName.value.trim()
  if (!name || tagExists.value) return
  creating.value = true
  try {
    const tag = await tagsStore.create({ name })
    emit('update:modelValue', [...props.modelValue, tag.id])
    newTagName.value = ''
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  if (!tagsStore.items.length) tagsStore.fetchAll()
})
</script>
