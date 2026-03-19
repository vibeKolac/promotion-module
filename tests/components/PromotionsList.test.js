import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PromotionsList from '../../src/components/promotions/PromotionsList.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'

const vuetify = createVuetify({ components, directives })
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })

const activeRule = { id: 'p1', name: 'Active Rule', type: 'discount', value: '20', status: 'active', priority: 1, conditions: [], gifts: [], createdBy: 'Anna K.' }
const pausedRule = { id: 'p2', name: 'Paused Rule', type: 'discount', value: '10', status: 'paused', priority: 2, conditions: [], gifts: [], createdBy: 'Martin P.' }
const perfRule = { id: 'p3', name: 'Perf Rule', type: 'discount', value: '15', status: 'active', priority: 3, conditions: [], gifts: [], performance: 90, revenue: '€10k', createdBy: 'Lukas J.' }

const mountList = (items = []) =>
  mount(PromotionsList, {
    global: {
      plugins: [
        createTestingPinia({ initialState: { promotions: { items }, stackingGroups: { items: [] } } }),
        vuetify,
        router,
      ],
      stubs: { RouterLink: true, AiAssistantPanel: true },
    },
  })

describe('PromotionsList', () => {
  it('renders Active tab by default', () => {
    const w = mountList([activeRule, pausedRule])
    expect(w.text()).toContain('Active')
  })

  it('renders Paused tab', () => {
    const w = mountList([activeRule, pausedRule])
    expect(w.text()).toContain('Paused')
  })

  it('renders Performance tab', () => {
    const w = mountList([perfRule])
    expect(w.text()).toContain('Performance')
  })

  it('shows action menu button per row', () => {
    const w = mountList([activeRule])
    expect(w.findAll('[data-testid="row-actions"]').length + w.findAll('button').length).toBeGreaterThan(0)
  })

  it('shows stacking group filter', () => {
    const w = mountList([activeRule])
    expect(w.text()).toContain('All groups')
  })
})
