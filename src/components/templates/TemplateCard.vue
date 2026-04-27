<template>
  <v-card border elevation="0" class="pa-4 h-100 d-flex flex-column" style="cursor:pointer" @click="$emit('select', template)">
    <div class="d-flex align-start mb-3">
      <v-avatar :color="typeColor" variant="tonal" size="40">
        <v-icon :color="typeColor" size="22">{{ categoryIcon }}</v-icon>
      </v-avatar>
      <v-spacer />
      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            density="comfortable"
            @click.stop
          />
        </template>
        <v-list density="compact" min-width="160">
          <v-list-item prepend-icon="mdi-pencil-outline" title="Edit" @click.stop="$emit('edit', template)" />
          <v-list-item prepend-icon="mdi-delete-outline" title="Delete" class="text-error" @click.stop="$emit('delete', template)" />
        </v-list>
      </v-menu>
    </div>

    <div class="d-flex align-center mb-2 gap-2">
      <v-chip :color="typeColor" variant="tonal" size="x-small" label>{{ template.ruleType?.replace('_', ' ') }}</v-chip>
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
