import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TemplatesPage from '../../src/components/templates/TemplatesPage.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'

const vuetify = createVuetify({ components, directives })
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })

const mountPage = (items = []) =>
  mount(TemplatesPage, {
    global: {
      plugins: [createTestingPinia({ initialState: { templates: { items } } }), vuetify, router],
      stubs: { RouterLink: true },
    },
  })

describe('TemplatesPage', () => {
  it('renders page title', () => {
    expect(mountPage().text()).toContain('Templates')
  })

  it('renders a card per template', () => {
    const w = mountPage([{ id: 't1', label: 'Flash Sale', category: 'flash', popularity: 'high', description: 'test', ruleType: 'discount', defaultValue: '20', defaultValueUnit: '%', defaultConditions: [] }])
    expect(w.text()).toContain('Flash Sale')
  })

  it('shows empty state when no templates', () => {
    expect(mountPage().text()).toContain('No templates')
  })
})
