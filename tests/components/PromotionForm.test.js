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
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
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
})
