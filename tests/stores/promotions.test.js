import { setActivePinia, createPinia } from 'pinia'
import { usePromotionsStore } from '../../src/stores/promotions'
import { vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')

beforeEach(() => setActivePinia(createPinia()))

describe('promotions store', () => {
  it('fetchAll populates items', async () => {
    const mockData = [{ id: '1', name: 'Test', type: 'discount' }]
    axios.get.mockResolvedValue({ data: mockData })
    const store = usePromotionsStore()
    await store.fetchAll({})
    expect(store.items).toEqual(mockData)
    expect(store.loading).toBe(false)
  })

  it('remove deletes item from items', async () => {
    axios.delete.mockResolvedValue({})
    const store = usePromotionsStore()
    store.items = [{ id: '1', name: 'Test' }, { id: '2', name: 'Other' }]
    await store.remove('1')
    expect(store.items.find(i => i.id === '1')).toBeUndefined()
  })

  it('applyParsedRule merges parsed data into formDraft', () => {
    const store = usePromotionsStore()
    store.applyParsedRule({
      type: 'discount',
      value: '20',
      valueUnit: '%',
      conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }],
      confidence: 0.9,
    })
    expect(store.formDraft.type).toBe('discount')
    expect(store.formDraft.value).toBe('20')
    expect(store.formDraft.conditions).toHaveLength(1)
  })
})
