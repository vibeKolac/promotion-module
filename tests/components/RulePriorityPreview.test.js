import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import RulePriorityPreview from '../../src/components/promotions/RulePriorityPreview.vue'

const vuetify = createVuetify({ components, directives })
const mountComp = (rules) => mount(RulePriorityPreview, {
  props: { rules },
  global: { plugins: [vuetify] },
})

const active = (id, priority) => ({ id, name: `Rule ${id}`, status: 'active', priority, type: 'discount', conditions: [], gifts: [] })

describe('RulePriorityPreview', () => {
  it('renders nothing when no active rules', () => {
    const w = mountComp([])
    expect(w.find('.v-card').exists()).toBe(false)
  })

  it('shows applied rule count', () => {
    const w = mountComp([active('a', 1), active('b', 2)])
    expect(w.text()).toContain('2 rule')
  })

  it('shows details on expand', async () => {
    const w = mountComp([active('a', 1)])
    await w.find('button').trigger('click')
    expect(w.text()).toContain('Rule a')
  })
})
