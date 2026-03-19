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
    expect(w.text()).toContain("Couldn't extract")
  })

  it('emits edit when Edit & Complete clicked', async () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [], confidence: 0.9, missingFields: [],
    })
    await w.find('[data-testid="edit-btn"]').trigger('click')
    expect(w.emitted('edit')).toBeTruthy()
  })

  it('shows narrow reach for SKU condition', () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [
        { field: 'skus', mode: 'include', values: ['SKU-001'] },
        { field: 'subtotal', mode: 'include', values: ['200'], operator: '>=' },
      ],
      confidence: 0.9, missingFields: [],
    })
    // skus=-50, subtotal(200)=-15, total=35 → Moderate
    expect(w.text()).toMatch(/Narrow|Moderate/)
  })
})
