<template>
  <v-card border elevation="0" class="pa-4 h-100 d-flex flex-column">
    <div class="d-flex align-start mb-3">
      <v-avatar :color="typeColor" variant="tonal" size="48">
        <v-icon :color="typeColor" size="28">{{ categoryIcon }}</v-icon>
      </v-avatar>
      <v-spacer />
      <v-btn icon="mdi-pencil-outline" variant="text" size="small" density="comfortable" @click.stop="$emit('edit', template)" />
      <v-btn icon="mdi-delete-outline" variant="text" size="small" density="comfortable" color="error" @click.stop="$emit('delete', template)" />
    </div>

    <div class="text-body-1 font-weight-bold mb-1">
      <span class="template-name-link" @click="$emit('select', template)">{{ template.label }}</span>
    </div>
    <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-3">{{ template.description }}</div>
    <div v-if="template.examples?.length" class="text-caption text-medium-emphasis">
      e.g. {{ template.examples[0] }}
    </div>
    <v-btn variant="outlined" size="small" class="mt-3 align-self-start text-none" @click.stop="$emit('select', template)">
      Use template
    </v-btn>
  </v-card>
</template>

<style scoped>
.template-name-link {
  cursor: pointer;
}
.template-name-link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}
</style>

<script setup>
import { computed } from 'vue'
const props = defineProps({ template: { type: Object, required: true } })
defineEmits(['select', 'edit', 'delete'])

const typeColor = computed(() => ({
  discount: 'primary',
  step_discount: 'success',
  multi_buy: 'warning',
  gift: 'purple',
}[props.template.ruleType] ?? 'default'))

const categoryIcon = computed(() => ({
  discount: 'mdi-tag-outline',
  step_discount: 'mdi-stairs',
  multi_buy: 'mdi-package-variant',
  gift: 'mdi-gift',
}[props.template.ruleType] ?? 'mdi-tag-outline'))
</script>
