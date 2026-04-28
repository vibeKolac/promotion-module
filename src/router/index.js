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
    path: '/promotions/reporting',
    component: () => import('../components/promotions/ReportingPage.vue'),
  },
  {
    path: '/promotions/reporting/:id',
    component: () => import('../components/promotions/ReportingDetailPage.vue'),
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
    path: '/templates-presets',
    component: () => import('../components/templates/TemplatesPresetsHub.vue'),
    redirect: '/templates-presets/templates',
    children: [
      {
        path: 'templates',
        component: () => import('../components/templates/TemplatesPage.vue'),
      },
      {
        path: 'condition-presets',
        component: () => import('../components/templates/ConditionPresetsPage.vue'),
      },
    ],
  },
  { path: '/templates', redirect: '/templates-presets/templates' },
  {
    path: '/templates/:id/edit',
    component: () => import('../components/promotions/PromotionForm.vue'),
  },
  {
    path: '/tags',
    component: () => import('../components/tags/TagsPage.vue'),
  },
  {
    path: '/settings/general',
    component: () => import('../components/settings/GeneralPage.vue'),
  },
]

export default createRouter({ history: createWebHistory(), routes })
