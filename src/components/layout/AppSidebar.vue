<!-- src/components/layout/AppSidebar.vue -->
<template>
  <v-navigation-drawer
    :model-value="modelValue"
    :permanent="!mobile"
    :temporary="mobile"
    width="220"
    color="white"
    border="r"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-list density="compact" nav class="pt-2">
      <v-list-subheader class="text-uppercase text-caption font-weight-bold">
        Promotions
      </v-list-subheader>

      <template v-for="item in coreNavItems" :key="item.to ?? item.title">
        <v-list-item
          v-if="!item.autoDisabled"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="sm"
          active-color="primary"
          @click="mobile && $emit('update:modelValue', false)"
        />
        <v-list-item
          v-else
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="sm"
          disabled
        >
          <template #append>
            <v-chip size="x-small" color="default" variant="tonal" label>Auto</v-chip>
          </template>
        </v-list-item>
      </template>

      <v-divider class="my-2" />
      <v-list-subheader class="text-uppercase text-caption font-weight-bold text-warning">
        Exploring
      </v-list-subheader>

      <v-list-item
        v-for="item in exploringNavItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="sm"
        active-color="primary"
        @click="mobile && $emit('update:modelValue', false)"
      />

      <v-divider class="my-2" />
      <v-list-subheader class="text-uppercase text-caption font-weight-bold">
        Settings
      </v-list-subheader>

      <v-list-item
        v-for="item in settingsItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="sm"
        active-color="primary"
        @click="mobile && $emit('update:modelValue', false)"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useSettingsStore } from '../../stores/settings'

defineProps({ modelValue: { type: Boolean, default: true } })
defineEmits(['update:modelValue'])

const { mobile } = useDisplay()
const settings = useSettingsStore()

const coreNavItems = computed(() => [
  { to: '/promotions', icon: 'mdi-tag-multiple', title: 'Promotion Rules' },
  { to: '/stacking-groups', icon: 'mdi-layers', title: 'Priority & grouping', autoDisabled: settings.prioritizationMode === 'automatic' },
  { to: '/templates-presets', icon: 'mdi-file-document-outline', title: 'Templates & Presets' },
])

const exploringNavItems = [
  { to: '/promotions/reporting', icon: 'mdi-chart-bar', title: 'Reporting' },
  { to: '/free-shipping', icon: 'mdi-truck-fast-outline', title: 'Free Shipping' },
  { to: '/bundles', icon: 'mdi-package-variant-closed', title: 'Bundles' },
  { to: '/coupons', icon: 'mdi-ticket-percent-outline', title: 'Coupons' },
  { to: '/promotion-planner', icon: 'mdi-creation', title: 'Promotion Planner' },
]

const settingsItems = [
  { to: '/settings/general', icon: 'mdi-cog-outline', title: 'General' },
]
</script>
