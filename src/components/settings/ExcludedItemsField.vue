<template>
  <div class="excluded-field">
    <div class="d-flex align-center mb-2">
      <span class="text-body-2 font-weight-medium">{{ label }}</span>
      <v-chip
        size="x-small"
        label
        class="ml-2"
        :color="modelValue.length ? 'error' : undefined"
        :variant="modelValue.length ? 'tonal' : 'outlined'"
      >
        {{ modelValue.length }} excluded
      </v-chip>
      <v-spacer />
      <v-btn
        v-if="modelValue.length"
        size="small"
        variant="text"
        color="info"
        @click="$emit('update:modelValue', [])"
      >
        Clear all
      </v-btn>
    </div>

    <v-autocomplete
      :model-value="modelValue"
      :items="options"
      :label="`Search ${noun} to exclude`"
      :placeholder="placeholder"
      variant="outlined"
      density="compact"
      multiple
      hide-details
      hide-selected
      :menu-props="{ maxHeight: 320 }"
      prepend-inner-icon="mdi-magnify"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #selection />
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps" :title="item.raw.title" :subtitle="item.raw.subtitle">
          <template #prepend>
            <v-icon
              :icon="isExcluded(item.raw.value) ? 'mdi-cancel' : 'mdi-plus-circle-outline'"
              :color="isExcluded(item.raw.value) ? 'error' : undefined"
              size="small"
              class="mr-3"
            />
          </template>
          <template v-if="isExcluded(item.raw.value)" #append>
            <v-chip size="x-small" color="error" variant="tonal" label>Excluded · click to remove</v-chip>
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>

    <div class="excluded-list mt-2">
      <v-text-field
        v-if="modelValue.length > filterThreshold"
        v-model="filter"
        :placeholder="`Filter excluded ${noun}`"
        prepend-inner-icon="mdi-filter-variant"
        variant="plain"
        density="compact"
        hide-details
        clearable
        class="excluded-list__filter px-3"
      />
      <div v-if="!modelValue.length" class="text-caption text-medium-emphasis pa-3">
        No {{ noun }} excluded. Everything is eligible.
      </div>
      <div v-else class="excluded-list__rows">
        <div
          v-for="row in visibleRows"
          :key="row.value"
          class="excluded-row d-flex align-center px-3"
        >
          <span class="text-body-2 text-truncate">{{ row.title }}</span>
          <span v-if="row.subtitle" class="text-caption text-medium-emphasis ml-2">{{ row.subtitle }}</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            :aria-label="`Remove ${row.title}`"
            @click="remove(row.value)"
          />
        </div>
        <div v-if="!visibleRows.length" class="text-caption text-medium-emphasis pa-3">
          No excluded {{ noun }} match "{{ filter }}".
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  label: { type: String, required: true },
  noun: { type: String, required: true },
  placeholder: { type: String, default: 'Type to search…' },
  filterThreshold: { type: Number, default: 6 },
})
const emit = defineEmits(['update:modelValue'])

const filter = ref('')

const excludedSet = computed(() => new Set(props.modelValue))
const isExcluded = value => excludedSet.value.has(value)

const options = computed(() => props.items)

const rows = computed(() => {
  const byValue = new Map(props.items.map(i => [i.value, i]))
  return props.modelValue.map(v => byValue.get(v) ?? { value: v, title: v })
})

const visibleRows = computed(() => {
  const q = (filter.value ?? '').trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(r => `${r.title} ${r.subtitle ?? ''}`.toLowerCase().includes(q))
})

function remove(value) {
  emit('update:modelValue', props.modelValue.filter(v => v !== value))
}
</script>

<style scoped>
.excluded-list {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}
.excluded-list__filter {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.excluded-list__rows {
  max-height: 200px;
  overflow-y: auto;
}
.excluded-row {
  min-height: 36px;
}
.excluded-row + .excluded-row {
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
}
</style>
