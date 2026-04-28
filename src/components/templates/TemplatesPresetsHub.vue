<!-- src/components/templates/TemplatesPresetsHub.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <v-breadcrumbs :items="[{ title: 'Templates & Presets', disabled: true }]" density="compact" class="pa-0 mb-2" />

    <h1 class="text-h5 font-weight-bold mb-4">Templates &amp; Presets</h1>

    <v-tabs :model-value="activeTab" color="primary" class="mb-5 border-b" @update:model-value="navigate">
      <v-tab value="templates" prepend-icon="mdi-file-document-outline">Templates</v-tab>
      <v-tab value="condition-presets" prepend-icon="mdi-filter-variant">
        Condition Presets
        <v-chip size="x-small" color="purple" variant="tonal" label class="ml-2">Post-MVP</v-chip>
      </v-tab>
    </v-tabs>

    <router-view />
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeTab = computed(() => {
  if (route.path.endsWith('/condition-presets')) return 'condition-presets'
  return 'templates'
})

function navigate(tab) {
  router.push(`/templates-presets/${tab}`)
}
</script>
