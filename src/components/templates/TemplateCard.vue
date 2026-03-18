<template>
  <v-card border elevation="0" class="pa-4 h-100 d-flex flex-column" style="cursor:pointer" @click="$emit('select', template)">
    <div class="d-flex align-center mb-2 gap-2">
      <v-chip :color="categoryColor" variant="tonal" size="x-small" label>{{ template.category }}</v-chip>
      <v-chip v-if="template.popularity === 'high'" color="primary" variant="tonal" size="x-small" label>Popular</v-chip>
    </div>
    <div class="text-body-1 font-weight-bold mb-1">{{ template.label }}</div>
    <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-3">{{ template.description }}</div>
    <div v-if="template.examples?.length" class="text-caption text-medium-emphasis">
      e.g. {{ template.examples[0] }}
    </div>
    <v-btn color="primary" variant="tonal" size="small" class="mt-3 align-self-start text-uppercase" @click.stop="$emit('select', template)">
      Use template
    </v-btn>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ template: { type: Object, required: true } })
defineEmits(['select'])
const categoryColor = computed(() => ({
  flash: 'error', seasonal: 'info', loyalty: 'success',
  bulk: 'warning', category: 'purple', gift: 'teal',
}[props.template.category] ?? 'default'))
</script>
