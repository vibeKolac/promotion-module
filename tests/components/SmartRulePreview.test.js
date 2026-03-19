import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import SmartRulePreview from '../../src/components/ai/SmartRulePreview.vue'

const vuetify = createVuetify({ components, directives })

const mountPreview = (parsed) =>
  mount(SmartRulePreview, {
    props: { parsed },
    global: { plugins: [vuetify] },
  })

describe('SmartRulePreview', () => {
  it('shows reach estimate bar', () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }],
      confidence: 0.9, missingFields: [],
    })
    expect(w.text()).toMatch(/reach|Reach/)
  })

  it('shows Edit & Complete button always', () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [], confidence: 0.5, missingFields: [],
    })
    expect(w.text()).toContain('Edit')
  })

  it('shows missing fields warning when present', () => {
    const w = mountPreview({
      type: 'discount', value: null, valueUnit: '%',
      conditions: [], confidence: 0.25, missingFields: ['discount value', 'validity period'],
    })
    expect(w.text()).toMatch(/Couldn't extract|missing/i)
  })

  it('emits edit when Edit & Complete clicked', async () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [], confidence: 0.9, missingFields: [],
    })
    const editBtn = w.findAll('button').find(b => b.text().includes('Edit'))
    await editBtn.trigger('click')
    expect(w.emitted('edit')).toBeTruthy()
  })
})
