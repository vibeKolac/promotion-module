import { validateCondition, validateConditions } from '../../src/utils/conditionValidator'

describe('validateCondition', () => {
  it('returns invalid when values is empty', () => {
    const r = validateCondition({ id: 'c1', field: 'brands', mode: 'include', values: [] })
    expect(r.isValid).toBe(false)
    expect(r.errors.length).toBeGreaterThan(0)
  })

  it('returns valid for a correct condition', () => {
    const r = validateCondition({ id: 'c1', field: 'brands', mode: 'include', values: ['Nike'] })
    expect(r.isValid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('returns invalid for quantifiable type with no operator', () => {
    const r = validateCondition({ id: 'c1', field: 'subtotal', mode: 'include', values: ['100'] })
    expect(r.isValid).toBe(false)
  })

  it('returns invalid for negative numeric value', () => {
    const r = validateCondition({ id: 'c1', field: 'subtotal', mode: 'include', values: ['-5'], operator: '>=' })
    expect(r.isValid).toBe(false)
  })
})

describe('validateConditions', () => {
  it('warns on duplicate condition types', () => {
    const r = validateConditions([
      { id: 'c1', field: 'brands', mode: 'include', values: ['Nike'] },
      { id: 'c2', field: 'brands', mode: 'include', values: ['Adidas'] },
    ])
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('warns on conflicting include+exclude for same field', () => {
    const r = validateConditions([
      { id: 'c1', field: 'categories', mode: 'include', values: ['Electronics'] },
      { id: 'c2', field: 'categories', mode: 'exclude', values: ['Electronics'] },
    ])
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('suggests adding subtotal when brands+categories+skus all present', () => {
    const r = validateConditions([
      { id: 'c1', field: 'brands', mode: 'include', values: ['Nike'] },
      { id: 'c2', field: 'categories', mode: 'include', values: ['Shoes'] },
      { id: 'c3', field: 'skus', mode: 'include', values: ['SKU-1'] },
    ])
    expect(r.suggestions.length).toBeGreaterThan(0)
  })

  it('returns isValid false when any condition has errors', () => {
    const r = validateConditions([
      { id: 'c1', field: 'brands', mode: 'include', values: [] },
    ])
    expect(r.isValid).toBe(false)
  })
})
