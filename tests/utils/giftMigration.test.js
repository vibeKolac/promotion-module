import { migrateGiftData, serializeGiftData } from '../../src/utils/giftMigration'
import { describe, it, expect } from 'vitest'

describe('migrateGiftData', () => {
  it('leaves non-gift rules unchanged', () => {
    const rule = { id: 'r1', type: 'discount', value: '20' }
    expect(migrateGiftData(rule)).toEqual(rule)
  })

  it('migrates legacy single-gift fields to gifts array', () => {
    const rule = { id: 'r1', type: 'gift', giftSku: 'SKU-001', giftQty: '2', giftPrice: '0.01', gifts: [] }
    const migrated = migrateGiftData(rule)
    expect(migrated.gifts).toHaveLength(1)
    expect(migrated.gifts[0].sku).toBe('SKU-001')
    expect(migrated.gifts[0].quantity).toBe(2)
  })

  it('leaves rules with existing gifts array untouched', () => {
    const rule = {
      id: 'r1', type: 'gift', giftSku: 'SKU-001',
      gifts: [{ id: 'g1', sku: 'SKU-002', quantity: 1, price: 0.01 }],
    }
    const migrated = migrateGiftData(rule)
    expect(migrated.gifts[0].sku).toBe('SKU-002') // not overwritten
  })
})

describe('serializeGiftData', () => {
  it('copies first gift to legacy fields for API backward compatibility', () => {
    const formData = { type: 'gift', gifts: [{ id: 'g1', sku: 'TOTE-001', quantity: 2, price: 0.01 }] }
    const serialized = serializeGiftData(formData)
    expect(serialized.giftSku).toBe('TOTE-001')
    expect(serialized.giftQty).toBe('2')
    expect(serialized.gifts).toHaveLength(1) // original array preserved
  })
})
