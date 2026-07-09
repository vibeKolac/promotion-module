<!-- src/components/templates/TemplatesPresetsHub.vue -->
<template>
  <v-container fluid class="pa-3 pa-sm-6">
    <Breadcrumbs />

    <ContentHeader>
      <h1 class="text-h5 font-weight-bold">Templates &amp; Presets</h1>
      <template #right>
        <PageActionBtn v-if="activeTab === 'templates'" @click="openCreateTemplate">New template</PageActionBtn>
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageActionBtn from '../_common/PageActionBtn.vue'
import ContentHeader from '../_common/ContentHeader.vue'
import Breadcrumbs from '../_common/Breadcrumbs.vue'

const router = useRouter()
const route = useRoute()

const uxTestMode = computed(() => route.path.startsWith('/uxtest') || route.path.startsWith('/serbia'))
const basePath = computed(() => route.path.startsWith('/uxtest') ? '/uxtest' : route.path.startsWith('/serbia') ? '/serbia' : '')

const activeTab = computed(() => {
  if (route.path.endsWith('/condition-presets')) return 'condition-presets'
  return 'templates'
})

function navigate(tab) {
  router.push(`${basePath.value}/templates-presets/${tab}`)
}

function openCreatePreset() {
  router.push(`${basePath.value}/condition-presets/new`)
}

function openCreateTemplate() {
  router.push(`${basePath.value}/templates/new`)
}
</script>
