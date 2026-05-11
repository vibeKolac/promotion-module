<!-- src/components/templates/TemplatesPresetsHub.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Templates &amp; Presets</h1>
      <v-chip size="x-small" color="warning" variant="tonal" label>Exploring</v-chip>
      <template #right>
        <PageActionBtn v-if="activeTab === 'condition-presets'" @click="openCreatePreset">New preset</PageActionBtn>
      </template>
    </ContentHeader>

    <v-tabs :model-value="activeTab" color="primary" class="mb-5 border-b" @update:model-value="navigate">
      <v-tab value="templates" prepend-icon="mdi-file-document-outline">Templates</v-tab>
      <v-tab value="condition-presets" prepend-icon="mdi-filter-variant">
        Condition Presets
      </v-tab>
    </v-tabs>

    <router-view />
  </v-container>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageActionBtn from '../_common/PageActionBtn.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'

const router = useRouter()
const route = useRoute()

const activeTab = computed(() => {
  if (route.path.endsWith('/condition-presets')) return 'condition-presets'
  return 'templates'
})

function navigate(tab) {
  router.push(`/templates-presets/${tab}`)
}

const triggerCreatePreset = ref(0)
provide('triggerCreatePreset', triggerCreatePreset)

function openCreatePreset() {
  triggerCreatePreset.value++
}
</script>
