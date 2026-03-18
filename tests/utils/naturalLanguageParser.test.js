import { parseRuleFromNaturalLanguage } from '../../src/utils/naturalLanguageParser'

describe('parseRuleFromNaturalLanguage', () => {
  it('extracts discount type and value', () => {
    const r = parseRuleFromNaturalLanguage('20% off Nike over $100')
    expect(r.type).toBe('discount')
    expect(r.value).toBe('20')
    expect(r.valueUnit).toBe('%')
  })

  it('extracts brand condition', () => {
    const r = parseRuleFromNaturalLanguage('20% off Nike over $100')
    expect(r.conditions).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'brands', values: expect.arrayContaining(['Nike']) })
    ]))
  })

  it('extracts subtotal condition', () => {
    const r = parseRuleFromNaturalLanguage('20% off Nike over $100')
    expect(r.conditions).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'subtotal', operator: '>=' })
    ]))
  })

  it('detects gift type', () => {
    const r = parseRuleFromNaturalLanguage('free gift with $200 order')
    expect(r.type).toBe('gift')
  })

  it('returns confidence between 0 and 1', () => {
    const r = parseRuleFromNaturalLanguage('discount')
    expect(r.confidence).toBeGreaterThanOrEqual(0)
    expect(r.confidence).toBeLessThanOrEqual(1)
  })

  it('populates missingFields when value not found', () => {
    const r = parseRuleFromNaturalLanguage('discount on Nike')
    expect(r.missingFields).toContain('value')
  })
})
