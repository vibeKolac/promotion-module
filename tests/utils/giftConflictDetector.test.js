import { detectGiftConflicts } from '../../src/utils/giftConflictDetector'

describe('detectGiftConflicts', () => {
  it('returns empty array when no conflicts', () => {
    const gifts = [{ id: 'g1', sku: 'GIFT-001', quantity: 1, price: 0 }]
    const conditions = [{ id: 'c1', field: 'brands', mode: 'include', values: ['Nike'] }]
    expect(detectGiftConflicts(gifts, conditions)).toHaveLength(0)
  })

  it('detects conflict when gift SKU appears in include SKU condition', () => {
    const gifts = [{ id: 'g1', sku: 'SKU-123', quantity: 1, price: 0 }]
    const conditions = [{ id: 'c1', field: 'skus', mode: 'include', values: ['SKU-123'] }]
    const conflicts = detectGiftConflicts(gifts, conditions)
    expect(conflicts.length).toBeGreaterThan(0)
    expect(conflicts[0].sku).toBe('SKU-123')
  })

  it('warns when OR selection has only one gift item', () => {
    const gifts = [{ id: 'g1', sku: 'GIFT-001', quantity: 1, price: 0 }]
    const conflicts = detectGiftConflicts(gifts, [], 'OR')
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].sku).toBeUndefined()
  })

  it('does not warn for OR selection with several gift items or for AND with one', () => {
    const two = [{ id: 'g1', sku: 'A', quantity: 1 }, { id: 'g2', sku: 'B', quantity: 1 }]
    expect(detectGiftConflicts(two, [], 'OR')).toHaveLength(0)
    expect(detectGiftConflicts([two[0]], [], 'AND')).toHaveLength(0)
  })

  it('does not flag gift SKU in exclude condition', () => {
    const gifts = [{ id: 'g1', sku: 'SKU-123', quantity: 1, price: 0 }]
    const conditions = [{ id: 'c1', field: 'skus', mode: 'exclude', values: ['SKU-123'] }]
    expect(detectGiftConflicts(gifts, conditions)).toHaveLength(0)
  })
})
