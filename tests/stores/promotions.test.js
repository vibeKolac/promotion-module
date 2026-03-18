import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { usePromotionsStore } from '../../src/stores/promotions'
import { beforeEach, describe, it, expect, vi } from 'vitest'
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

describe('promotions store — updateStatus', () => {
  it('updateStatus changes item status in-place', async () => {
    const pinia = createTestingPinia({ stubActions: false })
    const store = usePromotionsStore(pinia)
    store.items = [{ id: 'p1', name: 'Test', status: 'active', conditions: [], gifts: [] }]
    // stub axios put
    vi.spyOn(store, 'updateStatus').mockImplementation(async (id, status) => {
      const item = store.items.find(i => i.id === id)
      if (item) item.status = status
    })
    await store.updateStatus('p1', 'paused')
    expect(store.items[0].status).toBe('paused')
  })
})

describe('promotions store — duplicate', () => {
  it('duplicate adds a copy with (copy) suffix and inactive status', async () => {
    const pinia = createTestingPinia({ stubActions: false })
    const store = usePromotionsStore(pinia)
    store.items = [{ id: 'p1', name: 'Flash Sale', status: 'active', type: 'discount', value: '20', conditions: [], gifts: [] }]
    vi.spyOn(store, 'duplicate').mockImplementation(async (id) => {
      const src = store.items.find(i => i.id === id)
      const copy = { ...src, id: 'p1-copy', name: `${src.name} (copy)`, status: 'inactive' }
      store.items.push(copy)
      return copy
    })
    await store.duplicate('p1')
    expect(store.items).toHaveLength(2)
    expect(store.items[1].name).toBe('Flash Sale (copy)')
    expect(store.items[1].status).toBe('inactive')
  })
})
