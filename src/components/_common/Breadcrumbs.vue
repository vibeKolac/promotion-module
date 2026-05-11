<template>
  <v-breadcrumbs v-if="normalised.length" :items="normalised" density="compact" class="pa-0 mb-2" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  appendBreadcrumbs: { type: Array, default: () => [] },
})

const route = useRoute()

const normalised = computed(() => {
  const metaCrumbs = route.meta?.breadcrumbs ?? []
  return [...metaCrumbs, ...props.appendBreadcrumbs].map(b => ({
    title: b.title ?? b.label,
    to: b.to,
    disabled: b.disabled ?? !b.to,
  }))
})
</script>
