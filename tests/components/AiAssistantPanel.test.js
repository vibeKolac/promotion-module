import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
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
    const btn = w.find('[data-testid="guide-me-btn"]')
    await btn.trigger('click')
    expect(store.startWizard).toHaveBeenCalledWith(null)
  })

  it('shows wizard panel when wizardActive is true', async () => {
    const w = mountPanel()
    const store = useUiStore()
    store.wizardActive = true
    await nextTick()
    expect(w.find('[data-testid="wizard-panel-wrapper"]').exists()).toBe(true)
  })
})
