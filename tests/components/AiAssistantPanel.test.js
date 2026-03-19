import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'
import AiAssistantPanel from '../../src/components/ai/AiAssistantPanel.vue'
import { useUiStore } from '../../src/stores/ui'

const vuetify = createVuetify({ components, directives })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

const mountPanel = () =>
  mount(AiAssistantPanel, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            ui: { aiPanelOpen: true, aiMessages: [], aiTyping: false, pendingParsedRule: null, wizardActive: false, wizardStep: 0, wizardMode: null, wizardData: {}, wizardCollapsed: false },
            templates: { items: [] },
          },
        }),
        vuetify,
        router,
      ],
      stubs: {
        VNavigationDrawer: { template: '<div><slot /></div>' },
        WizardPanel: { template: '<div />' },
      },
    },
  })

describe('AiAssistantPanel', () => {
  it('renders Guide me button in header', () => {
    const w = mountPanel()
    expect(w.text()).toContain('Guide me')
  })

  it('clicking Guide me calls uiStore.startWizard(null)', async () => {
    const w = mountPanel()
    const store = useUiStore()
    const btn = w.findAll('button').find(b => b.text().includes('Guide me'))
    await btn?.trigger('click')
    expect(store.startWizard).toHaveBeenCalledWith(null)
  })
})
