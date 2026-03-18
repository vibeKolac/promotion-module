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
