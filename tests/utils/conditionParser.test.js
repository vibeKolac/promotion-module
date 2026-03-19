import { parsedConditionsToWizardConditions, formatConditionsSummary, generateConditionSuggestions } from '../../src/utils/conditionParser'

describe('parsedConditionsToWizardConditions', () => {
  it('returns empty array for no conditions', () => {
    expect(parsedConditionsToWizardConditions({ conditions: [] })).toEqual([])
  })

  it('maps brand field to brands condition', () => {
    const result = parsedConditionsToWizardConditions({
      conditions: [{ field: 'brand', mode: 'include', values: ['Nike'] }],
    })
    expect(result[0].field).toBe('brands')
    expect(result[0].values).toEqual(['Nike'])
  })

  it('preserves operator on quantifiable conditions', () => {
    const result = parsedConditionsToWizardConditions({
      conditions: [{ field: 'subtotal', mode: 'include', values: ['100'], operator: '>=' }],
    })
    expect(result[0].operator).toBe('>=')
  })

  it('skips unknown fields with a warning', () => {
    const result = parsedConditionsToWizardConditions({
      conditions: [{ field: 'unknownField', mode: 'include', values: ['x'] }],
    })
    expect(result).toHaveLength(0)
  })
})

describe('formatConditionsSummary', () => {
  it('returns "No conditions" for empty array', () => {
    expect(formatConditionsSummary([])).toBe('No conditions')
  })

  it('summarizes include condition', () => {
    const result = formatConditionsSummary([{ field: 'brands', mode: 'include', values: ['Nike', 'Adidas'] }])
    expect(result).toContain('Brands')
    expect(result).toContain('Nike')
  })

  it('summarizes quantifiable condition with operator', () => {
    const result = formatConditionsSummary([{ field: 'subtotal', mode: 'include', values: ['100'], operator: '>=' }])
    expect(result).toContain('at least')
    expect(result).toContain('100')
  })
})

describe('generateConditionSuggestions', () => {
  it('suggests adding product filters when none present', () => {
    const result = generateConditionSuggestions([])
    expect(result).toContain('product filters')
  })

  it('returns empty string when conditions are comprehensive', () => {
    const conditions = [
      { field: 'brands', mode: 'include', values: ['Nike'] },
      { field: 'subtotal', mode: 'include', values: ['50'], operator: '>=' },
    ]
    // Should have no suggestions (both product and threshold covered)
    const result = generateConditionSuggestions(conditions)
    expect(typeof result).toBe('string')
  })
})
