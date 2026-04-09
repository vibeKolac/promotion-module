<!-- src/components/promotions/GiftItemsSection.vue -->
<template>
  <v-expansion-panels variant="accordion">
    <v-expansion-panel>
      <v-expansion-panel-title class="text-body-1 font-weight-bold">
        Gift items
        <span class="text-caption font-weight-regular text-medium-emphasis ml-2">(Gift type only)</span>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-for="(gift, idx) in modelValue" :key="gift.id" class="d-flex align-center gap-3 mb-2">
          <v-text-field
            :model-value="gift.sku"
            label="SKU"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="update(idx, 'sku', $event)"
          />
          <v-text-field
            :model-value="gift.quantity"
            label="Qty"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 80px"
            @update:model-value="update(idx, 'quantity', Number($event))"
          />
          <v-btn icon="mdi-delete" variant="text" color="error" size="small" @click="remove(idx)" />
        </div>
        <v-btn prepend-icon="mdi-plus" variant="text" color="primary" size="small" @click="add">
          Add gift item
        </v-btn>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { v4 as uuid } from 'uuid'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

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
