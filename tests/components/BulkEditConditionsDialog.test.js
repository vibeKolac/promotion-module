import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import BulkEditConditionsDialog from '../../src/components/promotions/BulkEditConditionsDialog.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })
const mountDialog = () =>
  mount(BulkEditConditionsDialog, {
    attachTo: document.body,
    props: { modelValue: true, selectedCount: 3 },
    global: { plugins: [createTestingPinia(), vuetify] },
  })

describe('BulkEditConditionsDialog', () => {
  it('shows selected count in title', () => {
    mountDialog()
    expect(document.body.textContent).toContain('3 rules')
  })
  it('shows mode toggle (add / replace)', () => {
    mountDialog()
    expect(document.body.textContent).toMatch(/Add conditions|Replace conditions/)
  })
})
