import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ConditionBuilderDialog from '../../src/components/promotions/ConditionBuilderDialog.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })

const mountDialog = (props = {}) =>
  mount(ConditionBuilderDialog, {
    props: { modelValue: true, ...props },
    global: { plugins: [createTestingPinia(), vuetify] },
    attachTo: document.body,
  })

describe('ConditionBuilderDialog', () => {
  it('renders in add mode by default', () => {
    const w = mountDialog()
    expect(document.body.textContent).toContain('Add condition')
    w.unmount()
  })

  it('renders in edit mode when initialCondition provided', () => {
    const w = mountDialog({
      initialCondition: { id: 'c1', field: 'categories', mode: 'include', values: ['Electronics'] }
    })
    expect(document.body.textContent).toContain('Edit condition')
    w.unmount()
  })

  it('emits save with condition data on confirm', async () => {
    const w = mountDialog()
    await w.vm.localCondition.values.push('Electronics')
    await w.vm.handleSave()
    expect(w.emitted('save')).toBeTruthy()
    w.unmount()
  })
})
