import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ConditionBuilderDialog from '../../src/components/promotions/ConditionBuilderDialog.vue'

const vuetify = createVuetify({ components, directives })
const mountDialog = (props = {}) =>
  mount(ConditionBuilderDialog, {
    attachTo: document.body,
    props: { modelValue: true, ...props },
    global: { plugins: [vuetify] },
  })

describe('ConditionBuilderDialog', () => {
  it('shows type selector in step 1 with category groups', () => {
    mountDialog()
    expect(document.body.textContent).toMatch(/Product|Customer|Threshold/)
  })

  it('shows condition type options', () => {
    mountDialog()
    expect(document.body.textContent).toMatch(/Brands|Categories|Subtotal/)
  })

  it('in edit mode starts on step 2 (value config)', () => {
    mountDialog({ initialCondition: { id: 'c1', field: 'brands', mode: 'include', values: ['Nike'] } })
    expect(document.body.textContent).toContain('Brands')
  })
})
