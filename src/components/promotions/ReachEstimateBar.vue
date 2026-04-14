<!-- src/components/promotions/ReachEstimateBar.vue -->
<template>
  <div class="d-flex align-center gap-3 pa-3 bg-grey-lighten-4 rounded">
    <span class="text-caption font-weight-bold text-medium-emphasis">ESTIMATED REACH</span>
    <v-progress-linear
      :model-value="reach.percentage"
      :color="reach.color"
      rounded
      height="6"
      style="flex: 1"
    />
    <span class="text-body-2 font-weight-bold" :class="`text-${reach.color}`">
      {{ reach.label }} ~{{ reach.percentage }}%
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { estimateReach } from '../../utils/reachEstimator'

const props = defineProps({
  conditions: { type: Array, default: () => [] },
  scope: { type: String, default: 'cart' },
})

const reach = computed(() => estimateReach(props.conditions, props.scope))
</script>
