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

  it('does not flag gift SKU in exclude condition', () => {
    const gifts = [{ id: 'g1', sku: 'SKU-123', quantity: 1, price: 0 }]
    const conditions = [{ id: 'c1', field: 'skus', mode: 'exclude', values: ['SKU-123'] }]
    expect(detectGiftConflicts(gifts, conditions)).toHaveLength(0)
  })
})
