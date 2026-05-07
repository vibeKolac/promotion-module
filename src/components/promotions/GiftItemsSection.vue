<!-- src/components/promotions/GiftItemsSection.vue -->
<template>
  <div class="text-caption font-weight-bold text-medium-emphasis mb-3">GIFT ITEMS</div>
  <div v-for="(gift, idx) in modelValue" :key="gift.id" class="d-flex align-center gap-3 mb-2">
    <v-autocomplete
      :model-value="gift.sku"
      :items="drMaxProducts"
      item-value="sku"
      :item-title="p => p.name"
      label="Product"
      variant="outlined"
      density="compact"
      hide-details
      clearable
      no-data-text="No matching products"
      placeholder="Search by name or SKU…"
      :custom-filter="productFilter"
      @update:model-value="update(idx, 'sku', $event)"
    >
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps" :title="undefined" :disabled="item.raw.stock === 0 || settingsStore.excludedSkus.includes(item.raw.sku)">
          <template #prepend>
            <v-img
              :src="item.raw.image"
              width="40"
              height="40"
              cover
              class="product-img rounded mr-3 flex-shrink-0"
            />
          </template>
          <v-list-item-title class="text-body-2">{{ item.raw.name }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption text-medium-emphasis">{{ item.raw.sku }}</v-list-item-subtitle>
          <template #append>
            <v-chip v-if="settingsStore.excludedSkus.includes(item.raw.sku)" size="x-small" color="error" variant="tonal" label>Not allowed</v-chip>
            <v-chip v-else size="x-small" :color="item.raw.stock === 0 ? 'error' : 'success'" variant="tonal" label>
              {{ item.raw.stock === 0 ? 'Out of stock' : `${item.raw.stock} in stock` }}
            </v-chip>
          </template>
        </v-list-item>
      </template>
      <template #selection="{ item }">
        <v-img
          :src="item.raw.image"
          width="24"
          height="24"
          cover
          class="rounded mr-2 flex-shrink-0"
        />
        <span class="text-body-2 text-truncate">{{ item.raw.name }}</span>
      </template>
    </v-autocomplete>
    <v-text-field
      :model-value="gift.quantity"
      label="Qty"
      type="number"
      variant="outlined"
      density="compact"
      hide-details
      class="qty-field"
      @update:model-value="update(idx, 'quantity', Number($event))"
    />
    <v-btn icon="mdi-delete" variant="text" color="error" size="small" @click="remove(idx)" />
  </div>
  <v-btn prepend-icon="mdi-plus" variant="text" color="primary" size="small" @click="add">
    Add gift item
  </v-btn>
</template>

<script setup>
import { v4 as uuid } from 'uuid'
import { drMaxProducts } from '../../mock/seed.js'
import { useSettingsStore } from '../../stores/settings'

const settingsStore = useSettingsStore()

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

function productFilter(value, query, item) {
  const q = query.toLowerCase()
  return item.raw.name.toLowerCase().includes(q) || item.raw.sku.toLowerCase().includes(q)
}

function update(idx, key, val) {
  const items = [...props.modelValue]
  items[idx] = { ...items[idx], [key]: val }
  emit('update:modelValue', items)
}

function remove(idx) {
  const items = [...props.modelValue]
  items.splice(idx, 1)
  emit('update:modelValue', items)
}

function add() {
  emit('update:modelValue', [...props.modelValue, { id: uuid(), sku: '', quantity: 1 }])
}
</script>

<style scoped>
.product-img {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.qty-field {
  max-width: 80px;
}
</style>
