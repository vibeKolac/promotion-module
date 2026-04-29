<!-- src/components/promotions/ValuesPickerPanel.vue -->
<template>
  <div>
    <!-- Selected values -->
    <div class="mb-2">
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-caption font-weight-bold text-medium-emphasis">SELECTED</span>
        <v-btn v-if="modelValue.length" size="x-small" variant="text" color="error" @click="emit('update:modelValue', [])">
          Clear all
        </v-btn>
      </div>
      <div v-if="modelValue.length" class="d-flex flex-wrap gap-1 pa-2 rounded border" style="min-height: 36px">
        <v-chip v-for="val in modelValue" :key="val" size="small" closable @click:close="remove(val)">
          {{ val }}
        </v-chip>
      </div>
      <div v-else class="text-caption text-medium-emphasis pa-2 rounded border">None selected</div>
    </div>

    <!-- Search / type input -->
    <v-text-field
      v-model="search"
      :placeholder="options.length ? `Search or type to add…` : `Type ${label} and press Enter…`"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      hide-details
      clearable
      @keydown.enter.prevent="addCustom"
    />

    <!-- Options list for predefined values -->
    <div v-if="options.length" class="mt-1 rounded border" style="max-height: 200px; overflow-y: auto">
      <v-list density="compact" class="pa-0">
        <!-- Add typed value (when it's not an exact existing option) -->
        <v-list-item
          v-if="trimmedSearch && !exactMatchExists"
          density="compact"
          rounded="0"
          @click="addCustom"
        >
          <template #prepend>
            <v-icon size="16" color="primary">mdi-plus-circle-outline</v-icon>
          </template>
          <v-list-item-title class="text-body-2 text-primary">Add "{{ trimmedSearch }}"</v-list-item-title>
        </v-list-item>
        <v-divider v-if="trimmedSearch && !exactMatchExists && filteredOptions.length" />

        <v-list-item
          v-for="opt in filteredOptions"
          :key="opt"
          density="compact"
          rounded="0"
          :active="modelValue.includes(opt)"
          active-color="primary"
          @click="toggle(opt)"
        >
          <template #prepend>
            <v-checkbox-btn
              :model-value="modelValue.includes(opt)"
              color="primary"
              density="compact"
              tabindex="-1"
            />
          </template>
          <v-list-item-title class="text-body-2">{{ opt }}</v-list-item-title>
        </v-list-item>

        <div
          v-if="!filteredOptions.length && !(trimmedSearch && !exactMatchExists)"
          class="text-caption text-medium-emphasis pa-3 text-center"
        >
          No options match
        </div>
      </v-list>
    </div>

    <!-- Hint for free-form fields (no predefined options) -->
    <div v-else class="mt-1 d-flex align-center gap-1">
      <span class="text-caption text-medium-emphasis">Press Enter to add each value.</span>
      <v-btn v-if="trimmedSearch" size="x-small" variant="text" color="primary" @click="addCustom">
        Add "{{ trimmedSearch }}"
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  label: { type: String, default: 'value' },
})
const emit = defineEmits(['update:modelValue'])

const search = ref('')

const trimmedSearch = computed(() => search.value?.trim() ?? '')

const filteredOptions = computed(() => {
  if (!trimmedSearch.value) return props.options
  const q = trimmedSearch.value.toLowerCase()
  return props.options.filter(o => o.toLowerCase().includes(q))
})

const exactMatchExists = computed(() =>
  props.options.some(o => o.toLowerCase() === trimmedSearch.value.toLowerCase())
)

function remove(val) {
  emit('update:modelValue', props.modelValue.filter(v => v !== val))
}

function toggle(opt) {
  if (props.modelValue.includes(opt)) {
    emit('update:modelValue', props.modelValue.filter(v => v !== opt))
  } else {
    emit('update:modelValue', [...props.modelValue, opt])
  }
}

function addCustom() {
  const val = trimmedSearch.value
  if (!val || props.modelValue.includes(val)) return
  emit('update:modelValue', [...props.modelValue, val])
  search.value = ''
}
</script>
