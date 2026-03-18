import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/promotions' },
  {
    path: '/promotions',
    component: () => import('../components/promotions/PromotionsList.vue'),
  },
  {
    path: '/promotions/new',
    component: () => import('../components/promotions/PromotionForm.vue'),
  },
  {
    path: '/promotions/:id/edit',
    component: () => import('../components/promotions/PromotionForm.vue'),
  },
  {
    path: '/stacking-groups',
    component: () => import('../components/stackingGroups/StackingGroupsPage.vue'),
  },
  {
    path: '/templates',
    component: { template: '<v-container><h1 class="text-h5 font-weight-bold">Templates</h1><p class="text-medium-emphasis mt-2">Coming soon.</p></v-container>' },
  },
]

export default createRouter({ history: createWebHistory(), routes })
