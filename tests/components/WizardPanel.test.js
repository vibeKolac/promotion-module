import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'
import WizardPanel from '../../src/components/ai/WizardPanel.vue'
import { useUiStore } from '../../src/stores/ui'

const vuetify = createVuetify({ components, directives })
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

const mountPanel = (uiOverrides = {}) =>
  mount(WizardPanel, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            ui: {
              wizardActive: true,
              wizardCollapsed: false,
              wizardMode: null,
              wizardStep: 0,
              wizardData: {},
              aiPanelOpen: false,
              aiMessages: [],
              aiTyping: false,
              pendingParsedRule: null,
              ...uiOverrides,
            },
            templates: { items: [] },
          },
        }),
        vuetify,
        router,
      ],
    },
  })

describe('WizardPanel', () => {
  it('renders mode selector when wizardStep is 0', () => {
    const w = mountPanel()
    expect(w.text()).toContain('Start from template')
    expect(w.text()).toContain('Build from scratch')
  })

  it('renders chip grid for Type step (custom flow, step 1)', () => {
    const w = mountPanel({ wizardMode: 'custom', wizardStep: 1 })
    expect(w.text()).toContain('Discount')
    expect(w.text()).toContain('Gift')
  })

  it('renders chip grid for Duration step (step 2)', () => {
    const w = mountPanel({ wizardMode: 'custom', wizardStep: 2, wizardData: { type: 'discount' } })
    expect(w.text()).toContain('1 week')
    expect(w.text()).toContain('Weekend')
  })

  it('renders two text inputs for step_discount value step', () => {
    const w = mountPanel({ wizardMode: 'custom', wizardStep: 4, wizardData: { type: 'step_discount' } })
    expect(w.find('[data-testid="step-amount-input"]').exists()).toBe(true)
    expect(w.find('[data-testid="step-threshold-input"]').exists()).toBe(true)
  })

  it('renders confirm card at custom step 5', () => {
    const w = mountPanel({
      wizardMode: 'custom', wizardStep: 5,
      wizardData: { type: 'discount', value: '20', duration: 'week', target: 'all' },
    })
    expect(w.find('[data-testid="confirm-step"]').exists()).toBe(true)
    expect(w.text()).toContain('Create Promotion')
  })

  it('clicking Type chip calls wizardNext with correct args', async () => {
    const w = mountPanel({ wizardMode: 'custom', wizardStep: 1 })
    const store = useUiStore()
    const chip = w.findAll('.v-chip').find(c => c.text().trim() === 'Discount')
    await chip?.trigger('click')
    expect(store.wizardNext).toHaveBeenCalledWith('type', 'discount')
  })
})
