<template>
  <v-card border elevation="0" class="pa-4">
    <div class="d-flex align-center mb-3">
      <v-icon color="primary" size="18">mdi-eye-outline</v-icon>
      <span class="text-body-2 font-weight-bold ml-2">Live preview</span>
    </div>

    <p v-if="!sentences.length" class="text-body-2 text-medium-emphasis mb-0" data-testid="preview-placeholder">
      Start filling in the rule - a preview will appear here as you configure it.
    </p>
    <p v-else class="text-body-2 mb-0" data-testid="preview-description">
      <template v-for="sentence in sentences" :key="sentence.key">
        <span :data-testid="`preview-${sentence.key}`">
          <template v-for="(part, i) in sentence.parts" :key="i">
            <strong v-if="part.bold">{{ part.text }}</strong>
            <template v-else>{{ part.text }}</template>
          </template>
        </span>{{ ' ' }}
      </template>
    </p>

    <RuleCollisionAlert :draft="draft" :rules="rules" :exclude-id="excludeId" :base-path="basePath" />
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import {
  conditionLabel,
  discountLabel,
  discountOf,
  subtotalCondition,
} from '../../utils/promotionCollisions'
import RuleCollisionAlert from './RuleCollisionAlert.vue'

const props = defineProps({
  draft: { type: Object, required: true },
  rules: { type: Array, default: () => [] },
  excludeId: { type: String, default: undefined },
  basePath: { type: String, default: '' },
})

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : ''

const name = computed(() => props.draft.name?.trim() || null)
const discountText = computed(() => discountLabel(discountOf(props.draft)))
const conditionText = computed(() => conditionLabel(subtotalCondition(props.draft.conditions)))
const couponText = computed(() => props.draft.couponId?.trim() || null)

const sentences = computed(() => {
  const list = []
  const from = formatDate(props.draft.startDate)
  const to = formatDate(props.draft.endDate)

  if (name.value && discountText.value) {
    list.push({
      key: 'rule',
      parts: [
        { text: 'Rule ' },
        { text: name.value, bold: true },
        { text: ' gives ' },
        { text: discountText.value, bold: true },
        { text: ' off the cart total.' },
      ],
    })
  } else if (name.value) {
    list.push({ key: 'rule', parts: [{ text: 'Rule ' }, { text: name.value, bold: true }, { text: '.' }] })
  } else if (discountText.value) {
    list.push({
      key: 'rule',
      parts: [{ text: 'Gives ' }, { text: discountText.value, bold: true }, { text: ' off the cart total.' }],
    })
  }

  if (conditionText.value) {
    list.push({
      key: 'condition',
      parts: [
        { text: 'Applies to carts with a subtotal ' },
        { text: conditionText.value, bold: true },
        { text: '.' },
      ],
    })
  }

  if (from && to) {
    list.push({
      key: 'period',
      parts: [{ text: 'Valid ' }, { text: from, bold: true }, { text: ' – ' }, { text: to, bold: true }, { text: '.' }],
    })
  } else if (from) {
    list.push({ key: 'period', parts: [{ text: 'Valid from ' }, { text: from, bold: true }, { text: '.' }] })
  } else if (to) {
    list.push({ key: 'period', parts: [{ text: 'Valid until ' }, { text: to, bold: true }, { text: '.' }] })
  }

  if (couponText.value) {
    list.push({
      key: 'coupon',
      parts: [{ text: 'Coupon code: ' }, { text: couponText.value, bold: true }, { text: '.' }],
    })
  }

  return list
})
</script>
