<template>
  <v-alert type="warning" variant="tonal" density="compact" icon="mdi-alert" class="mt-4" data-testid="collision-alert">
    <div class="text-body-2 text-high-emphasis">
      <div class="text-subtitle-2 font-weight-bold">Conflicts with another promotion</div>
      <div v-for="group in groups" :key="group.key" class="mt-1" data-testid="collision-group">
        <p class="mb-0" data-testid="collision-reason">{{ heading(group.key) }}</p>
        <ul class="pa-0 ma-0 collision-list">
          <li v-for="rule in group.rules" :key="rule.id" data-testid="collision-rule">
            <RouterLink :to="`${basePath}/promotions/${rule.id}/edit`" target="_blank" class="text-high-emphasis">
              {{ rule.name }}
              <v-icon size="14">mdi-open-in-new</v-icon>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </v-alert>
</template>

<script setup>
const props = defineProps({
  groups: { type: Array, required: true },
  condition: { type: String, default: null },
  benefit: { type: String, default: null },
  basePath: { type: String, default: '' },
})

function heading(key) {
  if (key === 'both') return `Same period, ${props.condition} and ${props.benefit}:`
  return `Same period and ${props.condition}:`
}
</script>

<style scoped>
.collision-list {
  list-style: none;
}
</style>
