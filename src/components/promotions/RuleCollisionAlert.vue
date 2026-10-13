<template>
  <CollisionAlert
    v-if="groups.length"
    :groups="groups"
    :condition="conditionText"
    :benefit="benefitText"
    :base-path="basePath"
  />
</template>

<script setup>
import { computed } from 'vue'
import { benefitOf, conditionSummary, findCollisions, groupCollisions } from '../../utils/promotionCollisions'
import CollisionAlert from './CollisionAlert.vue'

const props = defineProps({
  draft: { type: Object, required: true },
  rules: { type: Array, default: () => [] },
  excludeId: { type: String, default: undefined },
  basePath: { type: String, default: '' },
})

const benefitText = computed(() => benefitOf(props.draft)?.label ?? null)
const conditionText = computed(() => conditionSummary(props.draft.conditions))
const groups = computed(() => groupCollisions(findCollisions(props.draft, props.rules, props.excludeId)))
</script>
