import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'
import RuleLivePreview from '../../src/components/promotions/RuleLivePreview.vue'

const vuetify = createVuetify({ components, directives })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

const subtotal = (operator, value) => [{ field: 'subtotal', mode: 'include', operator, values: [String(value)] }]

const draft = (overrides = {}) => ({
  name: 'Test',
  type: 'discount',
  value: '20',
  valueUnit: '%',
  startDate: '2026-10-09',
  endDate: '2026-10-17',
  couponId: '',
  conditions: subtotal('=', 200),
  ...overrides,
})

const existing = (id, overrides = {}) => ({
  id,
  name: `Rule ${id}`,
  type: 'discount',
  value: '8',
  valueUnit: '%',
  status: 'active',
  startDate: '2026-10-01',
  endDate: '2026-12-31',
  conditions: subtotal('=', 200),
  ...overrides,
})

const mountPreview = (props) => mount(RuleLivePreview, { props, global: { plugins: [vuetify, router] } })

describe('RuleLivePreview', () => {
  it('shows a placeholder for an empty rule', () => {
    const wrapper = mountPreview({ draft: { conditions: [] }, rules: [] })

    expect(wrapper.find('[data-testid="preview-placeholder"]').exists()).toBe(true)
  })

  it('writes the rule as a sentence with the values in bold', () => {
    const wrapper = mountPreview({ draft: draft({ couponId: 'SPRING' }), rules: [] })

    const bold = wrapper.findAll('[data-testid="preview-description"] strong').map((el) => el.text())
    expect(bold).toEqual(expect.arrayContaining(['Test', '20%', '= 200', 'SPRING']))
    expect(wrapper.find('[data-testid="collision-alert"]').exists()).toBe(false)
  })

  it('shows the conflict alert with the condition stated once above the rule names', () => {
    const wrapper = mountPreview({ draft: draft(), rules: [existing('a'), existing('b')] })

    expect(wrapper.findAll('[data-testid="collision-reason"]')).toHaveLength(1)
    expect(wrapper.find('[data-testid="collision-reason"]').text()).toContain('= 200')
    expect(wrapper.findAll('[data-testid="collision-rule"]').map((el) => el.text())).toEqual(['Rule a', 'Rule b'])
  })

  it('shows no alert when the periods do not overlap', () => {
    const wrapper = mountPreview({
      draft: draft(),
      rules: [existing('a', { startDate: '2027-01-01', endDate: '2027-03-31' })],
    })

    expect(wrapper.find('[data-testid="collision-alert"]').exists()).toBe(false)
  })

  it('shows no alert for the rule being edited', () => {
    const wrapper = mountPreview({ draft: draft(), rules: [existing('self')], excludeId: 'self' })

    expect(wrapper.find('[data-testid="collision-alert"]').exists()).toBe(false)
  })
})
