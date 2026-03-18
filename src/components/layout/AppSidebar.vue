<!-- src/components/layout/AppSidebar.vue -->
<template>
  <v-navigation-drawer permanent width="220" color="white" border="r">
    <v-list density="compact" nav class="pt-2">
      <v-list-subheader class="text-uppercase text-caption font-weight-bold">
        Promotions
      </v-list-subheader>

      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="sm"
        active-color="primary"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
const navItems = [
  { to: '/promotions', icon: 'mdi-tag-multiple', title: 'Promotion Rules' },
  { to: '/stacking-groups', icon: 'mdi-layers', title: 'Stacking Groups' },
  { to: '/templates', icon: 'mdi-file-document-outline', title: 'Templates' },
]
</script>
