<!-- src/components/promotions/SkuValuePicker.vue -->
<template>
  <div @paste.capture="handlePaste" @keydown.capture="handleKeydown">
    <v-combobox
      ref="comboRef"
      :model-value="modelValue"
      v-model:search="searchText"
      :items="drMaxProducts"
      item-value="sku"
      :item-title="p => p.name"
      variant="outlined"
      density="compact"
      hide-details
      placeholder="Search by name or SKU; use comma or space to add multiple…"
      multiple
      :custom-filter="skuFilter"
      @update:model-value="handleModelUpdate"
    >
      <template #item="{ item, props: itemProps }">
        <v-list-item
          v-bind="itemProps"
          :title="undefined"
          :disabled="item.raw?.stock === 0 || excludedSkuSet.has(item.raw?.sku)"
        >
          <template #prepend>
            <v-img :src="item.raw?.image" width="32" height="32" cover class="rounded mr-2 flex-shrink-0 sku-thumb" />
          </template>
          <v-list-item-title class="text-body-2">{{ item.raw?.name ?? item.value }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption text-medium-emphasis">{{ item.raw?.sku ?? item.value }}</v-list-item-subtitle>
          <template #append>
            <v-chip
              v-if="item.raw && excludedSkuSet.has(item.raw.sku)"
              size="x-small"
              color="error"
              variant="tonal"
              label
            >Not allowed</v-chip>
            <v-chip
              v-else-if="item.raw"
              size="x-small"
              :color="item.raw.stock === 0 ? 'error' : 'success'"
              variant="tonal"
              label
            >
              {{ item.raw.stock === 0 ? 'Out of stock' : `${item.raw.stock} in stock` }}
            </v-chip>
          </template>
        </v-list-item>
      </template>
      <template #selection="{ item }">
        <v-chip size="small" label class="mr-1">
          {{ typeof item.raw === 'object' ? item.raw.sku : item.raw }}
        </v-chip>
      </template>
    </v-combobox>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { drMaxProducts } from '../../mock/seed.js'
import { useSettingsStore } from '../../stores/settings.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const settingsStore = useSettingsStore()
const excludedSkuSet = computed(() => new Set(settingsStore.excludedSkus))

const comboRef = ref(null)
const searchText = ref('')

function skuFilter(value, query, item) {
  const q = query.toLowerCase()
  return item.raw?.name?.toLowerCase().includes(q) || item.raw?.sku?.includes(q)
}

function normalize(val) {
  if (typeof val === 'string') return val.trim()
  if (val && typeof val === 'object') return (val.sku ?? '').trim()
  return ''
}

function handleModelUpdate(val) {
  const skus = (val ?? []).flatMap(v => {
    const s = normalize(v)
    return s ? s.split(DELIMITER_RE).filter(Boolean) : []
  })
  emit('update:modelValue', [...new Set(skus)])
}

const DELIMITER_RE = /[,;\n\r\t| ]+/

function clearInput() {
  searchText.value = ''
  nextTick(() => {
    // Vuetify overwrites v-model:search after model updates, so also
    // dispatch a synthetic empty input event directly on the native element.
    const input = comboRef.value?.$el?.querySelector('input')
    if (input) {
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  })
}

function addTokens(text) {
  const parts = text.split(DELIMITER_RE).map(s => s.trim()).filter(Boolean)
  if (!parts.length) return
  const result = new Set(props.modelValue)
  for (const sku of parts) result.add(sku)
  emit('update:modelValue', [...result])
  clearInput()
}

function handleKeydown(event) {
  if (event.key !== ',' && event.key !== ' ') return
  const current = searchText.value?.trim()
  if (!current) return
  event.preventDefault()
  event.stopPropagation()
  addTokens(current)
}

function handlePaste(event) {
  const text = event.clipboardData?.getData('text/plain') ?? ''
  if (!DELIMITER_RE.test(text)) return
  event.preventDefault()
  event.stopPropagation()
  addTokens(text)
}
</script>

<style scoped>
.sku-thumb {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
