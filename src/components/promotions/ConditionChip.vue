<!-- src/components/promotions/ConditionChip.vue -->
<template>
  <v-chip
    :color="condition.mode === 'include' ? 'success' : 'error'"
    variant="tonal"
    size="small"
    label
    closable
    @click:close="$emit('remove')"
  >
    <v-icon start size="14">
      {{ condition.mode === 'include' ? 'mdi-check' : 'mdi-close' }}
    </v-icon>
    <span class="font-weight-bold text-uppercase mr-1">{{ condition.mode }}</span>
    {{ label }}
    <v-btn icon="mdi-pencil" variant="text" size="x-small" class="ml-1" @click.stop="$emit('edit')" />
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  condition: { type: Object, required: true },
  scope: { type: String, default: 'cart' },
})
defineEmits(['edit', 'remove'])

const LABELS = {
  categories: 'Categories', brands: 'Brands', skus: 'SKUs',
  product_lines: 'Product lines', customer_group: 'Customer group',
  coupon_code: 'Coupon code', exclude_on_sale: 'Exclude on sale',
  pim_status: 'PIM status', attribute_set: 'Attribute set',
  source: 'Source', warehouse_type: 'Warehouse type', seller: 'Seller',
}

const SCOPE_LABELS = {
  cart: { subtotal: 'Cart subtotal (ex. VAT)', quantity: 'Cart qty', weight: 'Cart weight' },
  item: { subtotal: 'Item price (incl. VAT)', quantity: 'Line qty', weight: 'Item weight' },
}

const OPERATORS = { '>=': 'at least', '>': 'more than', '<=': 'at most', '<': 'less than' }

const label = computed(() => {
  const fieldLabel = SCOPE_LABELS[props.scope]?.[props.condition.field]
    ?? LABELS[props.condition.field]
    ?? props.condition.field
  const vals = props.condition.values.join(', ')
  if (props.condition.operator) {
    return `${fieldLabel} ${OPERATORS[props.condition.operator] || props.condition.operator} ${vals}`
  }
  return `${fieldLabel}: ${vals}`
})
</script>
