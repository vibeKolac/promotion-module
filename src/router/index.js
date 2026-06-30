import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../components/layout/DefaultLayout.vue'
import ItalyLayout from '../components/layout/ItalyLayout.vue'

const promotionsCrumb = { title: 'Promotions', to: '/promotions' }
const promotionsDisabled = { title: 'Promotions', disabled: true }
const templatesCrumb = { title: 'Templates & Presets', to: '/templates-presets/templates' }
const reportingCrumb = { title: 'Reporting', to: '/promotions/reporting' }
const settingsCrumb = { title: 'Settings', disabled: true }

const coreChildren = (base = '') => [
  {
    path: 'promotions',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Promotion rules management', disabled: true }] },
    component: () => import('../components/promotions/PromotionsList.vue'),
  },
  {
    path: 'promotions/new',
    meta: { breadcrumbs: [promotionsCrumb] },
    component: () => import('../components/promotions/PromotionForm.vue'),
  },
  {
    path: 'promotions/:id/edit',
    meta: { breadcrumbs: [promotionsCrumb] },
    component: () => import('../components/promotions/PromotionForm.vue'),
  },
  {
    path: 'stacking-groups',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Priority & grouping', disabled: true }] },
    component: () => import('../components/stackingGroups/StackingGroupsPage.vue'),
  },
  {
    path: 'stacking-groups/:id',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Priority & grouping', to: `${base}/stacking-groups` }] },
    component: () => import('../components/stackingGroups/StackingGroupDetailPage.vue'),
  },
  {
    path: 'templates-presets',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Templates & Presets', disabled: true }] },
    component: () => import('../components/templates/TemplatesPresetsHub.vue'),
    redirect: `${base}/templates-presets/templates`,
    children: [
      { path: 'templates', component: () => import('../components/templates/TemplatesPage.vue') },
      { path: 'condition-presets', component: () => import('../components/templates/ConditionPresetsPage.vue') },
    ],
  },
  {
    path: 'condition-presets/new',
    meta: { breadcrumbs: [templatesCrumb] },
    component: () => import('../components/templates/ConditionPresetForm.vue'),
  },
  {
    path: 'condition-presets/:id/edit',
    meta: { breadcrumbs: [templatesCrumb] },
    component: () => import('../components/templates/ConditionPresetForm.vue'),
  },
  {
    path: 'templates/new',
    meta: { breadcrumbs: [templatesCrumb] },
    component: () => import('../components/promotions/PromotionForm.vue'),
  },
  {
    path: 'templates/:id/edit',
    meta: { breadcrumbs: [templatesCrumb] },
    component: () => import('../components/promotions/PromotionForm.vue'),
  },
  {
    path: 'settings/general',
    meta: { breadcrumbs: [settingsCrumb, { title: 'General', disabled: true }] },
    component: () => import('../components/settings/GeneralPage.vue'),
  },
  {
    path: 'settings/accounting',
    meta: { breadcrumbs: [settingsCrumb, { title: 'Accounting', disabled: true }] },
    component: () => import('../components/settings/AccountingPage.vue'),
  },
]

const exploringChildren = [
  {
    path: 'promotions/reporting',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Reporting', disabled: true }] },
    component: () => import('../components/promotions/ReportingPage.vue'),
  },
  {
    path: 'promotions/reporting/:id',
    meta: { breadcrumbs: [promotionsCrumb, reportingCrumb] },
    component: () => import('../components/promotions/ReportingDetailPage.vue'),
  },
  {
    path: 'promotion-planner',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Promotion Planner', disabled: true }] },
    component: () => import('../components/promotions/PromotionPlannerPage.vue'),
  },
  {
    path: 'free-shipping',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Free Shipping', disabled: true }] },
    component: () => import('../components/freeShipping/FreeShippingPage.vue'),
  },
  {
    path: 'bundles',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Bundles', disabled: true }] },
    component: () => import('../components/bundles/BundlesPage.vue'),
  },
  {
    path: 'coupons',
    meta: { breadcrumbs: [promotionsDisabled, { title: 'Coupons', disabled: true }] },
    component: () => import('../components/coupons/CouponsPage.vue'),
  },
]

const routes = [
  { path: '/', redirect: '/promotions' },
  { path: '/templates', redirect: '/templates-presets/templates' },
  {
    path: '/',
    component: DefaultLayout,
    children: [...coreChildren(''), ...exploringChildren],
  },
  {
    path: '/italy',
    component: ItalyLayout,
    redirect: '/italy/promotions',
    children: coreChildren('/italy'),
  },
]

export default createRouter({ history: createWebHistory(), routes })
