import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PromotionForm from '../../src/components/promotions/PromotionForm.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'

const vuetify = createVuetify({ components, directives })

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/promotions/:id/edit', component: PromotionForm },
    { path: '/serbia/promotions/new', component: PromotionForm },
    { path: '/serbia/promotions/:id/edit', component: PromotionForm },
    { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
  ],
})

const mountForm = () =>
  mount(PromotionForm, {
    global: {
      plugins: [createTestingPinia(), vuetify, router],
      stubs: { RouterLink: true },
    },
  })

describe('PromotionForm', () => {
  it('renders create title when no id in route', () => {
    const w = mountForm()
    expect(w.text()).toContain('New promotion rule')
  })

  it('shows gift items section only for gift type', async () => {
    const w = mountForm()
    // Gift items section should be present but type defaults to discount
    const store = w.vm.store
    store.formDraft.type = 'gift'
    await w.vm.$nextTick()
    expect(w.text()).toContain('Gift items')
  })

  it('shows step discount editor only for step_discount type', async () => {
    const w = mountForm()
    const store = w.vm.store
    store.formDraft.type = 'step_discount'
    await w.vm.$nextTick()
    expect(w.text()).toContain('Add tier')
  })

  it('shows validation errors when saving empty form', async () => {
    const w = mountForm()
    const store = w.vm.store
    store.formDraft.name = ''
    store.formDraft.value = ''
    await w.vm.$nextTick()
    await w.find('[data-testid="save-btn"]').trigger('click')
    await w.vm.$nextTick()
    expect(w.text()).toContain('Rule name is required')
  })

  it('shows stepType field for step_discount type', async () => {
    const w = mountForm()
    w.vm.store.formDraft.type = 'step_discount'
    await w.vm.$nextTick()
    expect(w.text()).toContain('Step type')
  })

  it('shows gift step fields for gift type', async () => {
    const w = mountForm()
    w.vm.store.formDraft.type = 'gift'
    await w.vm.$nextTick()
    expect(w.text()).toContain('Trigger type')
  })

  it('shows exclusive toggle', () => {
    const w = mountForm()
    expect(w.text()).toContain('Exclusive rule')
  })

  it('requires a coupon code on a Serbia rule before it can be saved', async () => {
    await router.push('/serbia/promotions/new')
    const w = mountForm()
    const store = w.vm.store
    store.formDraft.name = 'New Serbia rule'
    store.formDraft.value = '10'
    store.formDraft.couponId = ''
    await w.vm.$nextTick()

    await w.vm.saveAsDraft()
    await w.vm.$nextTick()

    expect(w.text()).toContain('Coupon code is required')
    expect(store.create).not.toHaveBeenCalled()
  })

  it('does not block saving a duplicate coupon code as a draft', async () => {
    await router.push('/serbia/promotions/new')
    const w = mountForm()
    const store = w.vm.store
    store.items = [{ id: 'other-1', status: 'active', couponId: 'SUMMER2026' }]
    store.formDraft.name = 'New Serbia rule'
    store.formDraft.value = '10'
    store.formDraft.couponId = 'summer2026'
    await w.vm.$nextTick()

    await w.vm.saveAsDraft()
    await w.vm.$nextTick()

    expect(w.text()).not.toContain('already used by another')
    expect(store.create).toHaveBeenCalled()
  })

  it('blocks activating/scheduling a coupon code already used by another active/scheduled rule', async () => {
    await router.push('/serbia/promotions/new')
    const w = mountForm()
    const store = w.vm.store
    store.items = [{ id: 'other-1', status: 'active', couponId: 'SUMMER2026' }]
    store.formDraft.name = 'New Serbia rule'
    store.formDraft.value = '10'
    store.formDraft.couponId = 'summer2026'
    await w.vm.$nextTick()

    await w.vm.saveAndActivate()
    await w.vm.$nextTick()

    expect(w.text()).toContain('already used by another active or scheduled promotion rule')
    expect(store.create).not.toHaveBeenCalled()
  })

  it('ignores draft rules and the rule being edited when activating/scheduling', async () => {
    await router.push('/serbia/promotions/p1/edit')
    const w = mountForm()
    const store = w.vm.store
    store.items = [
      { id: 'p1', status: 'active', couponId: 'SUMMER2026' },
      { id: 'other-2', status: 'draft', couponId: 'SUMMER2026' },
    ]
    store.formDraft.name = 'Existing Serbia rule'
    store.formDraft.value = '10'
    store.formDraft.couponId = 'summer2026'
    await w.vm.$nextTick()

    await w.vm.saveAndActivate()
    await w.vm.$nextTick()

    expect(w.text()).not.toContain('already used by another')
  })

  it('validates the coupon code live once the admin leaves the field', async () => {
    await router.push('/serbia/promotions/new')
    const w = mountForm()
    const store = w.vm.store
    store.items = [{ id: 'other-1', status: 'active', couponId: 'SUMMER2026' }]
    store.formDraft.couponId = 'summer2026'

    w.vm.validateCouponLive()
    await w.vm.$nextTick()

    expect(w.text()).toContain('already used by another active or scheduled promotion rule')
  })

  it('re-fetches when route id changes without an unmount', async () => {
    await router.push('/promotions/p1/edit')
    const w = mountForm()
    const store = w.vm.store
    store.fetchOne.mockClear()

    await router.push('/promotions/p2/edit')
    await w.vm.$nextTick()

    expect(store.fetchOne).toHaveBeenCalledWith('p2')
  })
})
