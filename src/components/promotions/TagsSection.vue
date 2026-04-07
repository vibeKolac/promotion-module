<!-- src/components/promotions/TagsSection.vue -->
<template>
  <v-card border elevation="0" class="pa-5">
    <div class="text-body-1 font-weight-bold mb-3">Tags</div>

    <div v-if="tagsStore.loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate size="24" />
    </div>

    <template v-else>
      <div v-if="tagsStore.items.length" class="d-flex flex-wrap gap-2 mb-3">
        <v-chip
          v-for="tag in tagsStore.items"
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

      <p v-else class="text-caption text-medium-emphasis mb-0">
        No tags defined yet. <router-link to="/tags" class="text-decoration-none text-primary">Manage tags</router-link>
      </p>

      <div v-if="modelValue.length && tagsStore.items.length" class="text-caption text-medium-emphasis">
        {{ modelValue.length }} tag{{ modelValue.length > 1 ? 's' : '' }} applied
        — <router-link to="/tags" class="text-decoration-none text-primary">Manage tags</router-link>
      </div>
      <div v-else-if="tagsStore.items.length" class="text-caption text-medium-emphasis">
        Click a tag to apply it — <router-link to="/tags" class="text-decoration-none text-primary">Manage tags</router-link>
      </div>
    </template>
  </v-card>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTagsStore } from '../../stores/tags'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const tagsStore = useTagsStore()

function toggle(id) {
  const current = [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx === -1) {
    current.push(id)
  } else {
    current.splice(idx, 1)
  }
  emit('update:modelValue', current)
}

onMounted(() => {
  if (!tagsStore.items.length) tagsStore.fetchAll()
})
</script>
