import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '../../src/stores/ui'
import { usePromotionsStore } from '../../src/stores/promotions'
import { vi } from 'vitest'

vi.mock('../../src/utils/naturalLanguageParser', () => ({
  parseRuleFromNaturalLanguage: vi.fn(() => ({
    type: 'discount', value: '20', valueUnit: '%',
    conditions: [], confidence: 0.9, missingFields: [],
  })),
}))

beforeEach(() => setActivePinia(createPinia()))

describe('ui store', () => {
  it('openAiPanel sets aiPanelOpen to true', () => {
    const store = useUiStore()
    store.openAiPanel()
    expect(store.aiPanelOpen).toBe(true)
  })

  it('sendMessage appends user and assistant messages', async () => {
    const store = useUiStore()
    store.sendMessage('20% off Nike')
    expect(store.aiMessages[0].role).toBe('user')
    await new Promise(r => setTimeout(r, 700))
    expect(store.aiMessages[1].role).toBe('assistant')
    expect(store.pendingParsedRule).toBeTruthy()
  })

  it('selectTemplate sets pendingParsedRule from template', () => {
    const store = useUiStore()
    store.selectTemplate({
      ruleType: 'discount', defaultValue: '15', defaultValueUnit: '%',
      defaultConditions: [],
    })
    expect(store.pendingParsedRule?.type).toBe('discount')
    expect(store.pendingParsedRule?.value).toBe('15')
  })

  it('applyPendingRule calls promotions.applyParsedRule and closes panel', () => {
    const uiStore = useUiStore()
    const promoStore = usePromotionsStore()
    const spy = vi.spyOn(promoStore, 'applyParsedRule')
    uiStore.pendingParsedRule = { type: 'discount', value: '10', confidence: 0.9 }
    uiStore.aiPanelOpen = true
    uiStore.applyPendingRule()
    expect(spy).toHaveBeenCalled()
    expect(uiStore.aiPanelOpen).toBe(false)
    expect(uiStore.pendingParsedRule).toBeNull()
  })
})

describe('uiStore — wizard actions', () => {
  it('startWizard(null) sets wizardActive and step 0', () => {
    const store = useUiStore()
    store.startWizard(null)
    expect(store.wizardActive).toBe(true)
    expect(store.wizardStep).toBe(0)
    expect(store.wizardMode).toBeNull()
  })

  it('startWizard("custom") sets mode and step 1', () => {
    const store = useUiStore()
    store.startWizard('custom')
    expect(store.wizardActive).toBe(true)
    expect(store.wizardStep).toBe(1)
    expect(store.wizardMode).toBe('custom')
  })

  it('wizardNext records data and increments step', () => {
    const store = useUiStore()
    store.startWizard('custom')
    store.wizardNext('type', 'discount')
    expect(store.wizardData.type).toBe('discount')
    expect(store.wizardStep).toBe(2)
  })

  it('wizardBack decrements step and no-ops at step 1', () => {
    const store = useUiStore()
    store.startWizard('custom')
    store.wizardNext('type', 'discount')
    expect(store.wizardStep).toBe(2)
    store.wizardBack()
    expect(store.wizardStep).toBe(1)
    store.wizardBack() // no-op
    expect(store.wizardStep).toBe(1)
  })

  it('wizardGoToStep jumps back but not forward', () => {
    const store = useUiStore()
    store.startWizard('custom')
    store.wizardNext('type', 'discount')
    store.wizardNext('duration', 'week')
    store.wizardNext('target', 'all')
    expect(store.wizardStep).toBe(4)
    store.wizardGoToStep(2)
    expect(store.wizardStep).toBe(2)
    store.wizardGoToStep(4) // forward — no-op
    expect(store.wizardStep).toBe(2)
  })

  it('wizardReset clears all wizard state', () => {
    const store = useUiStore()
    store.startWizard('custom')
    store.wizardNext('type', 'discount')
    store.wizardReset()
    expect(store.wizardActive).toBe(false)
    expect(store.wizardStep).toBe(0)
    expect(store.wizardMode).toBeNull()
    expect(store.wizardData).toEqual({})
    expect(store.wizardCollapsed).toBe(false)
  })

  it('toggleWizardCollapsed flips the flag', () => {
    const store = useUiStore()
    expect(store.wizardCollapsed).toBe(false)
    store.toggleWizardCollapsed()
    expect(store.wizardCollapsed).toBe(true)
    store.toggleWizardCollapsed()
    expect(store.wizardCollapsed).toBe(false)
  })
})
