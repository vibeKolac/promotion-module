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
    component: () => import('../components/templates/TemplatesPage.vue'),
  },
  {
    path: '/tags',
    component: () => import('../components/tags/TagsPage.vue'),
  },
]

export default createRouter({ history: createWebHistory(), routes })
