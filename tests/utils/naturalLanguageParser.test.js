import { parseRuleFromNaturalLanguage } from '../../src/utils/naturalLanguageParser'
import { describe, it, expect } from 'vitest'

describe('parseRuleFromNaturalLanguage — type detection', () => {
  it('detects discount type from "20% off"', () => {
    const r = parseRuleFromNaturalLanguage('20% off electronics')
    expect(r.type).toBe('discount')
    expect(r.value).toBe('20')
    expect(r.valueUnit).toBe('%')
  })

  it('detects step_discount from "$10 off per $100 spent"', () => {
    const r = parseRuleFromNaturalLanguage('$10 off per $100 spent on electronics')
    expect(r.type).toBe('step_discount')
    expect(r.value).toBe('10')
    expect(r.stepValue).toBe('100')
  })

  it('detects multi_buy from "buy 2 get 1 free"', () => {
    const r = parseRuleFromNaturalLanguage('buy 2 get 1 free on Nike products')
    expect(r.type).toBe('multi_buy')
    expect(r.buyQty).toBe('2')
    expect(r.freeQty).toBe('1')
  })

  it('detects gift type from "free gift with purchase"', () => {
    const r = parseRuleFromNaturalLanguage('free gift with purchase over $100')
    expect(r.type).toBe('gift')
    expect(r.gifts).toBeDefined()
    expect(r.gifts.length).toBeGreaterThan(0)
  })
})

describe('parseRuleFromNaturalLanguage — condition extraction', () => {
  it('extracts brand condition from "20% off Nike over $100"', () => {
    const r = parseRuleFromNaturalLanguage('20% off Nike over $100')
    const brandCond = r.conditions.find(c => c.field === 'brands')
    expect(brandCond).toBeDefined()
    expect(brandCond.values).toContain('Nike')
  })

  it('extracts subtotal condition from "over $50"', () => {
    const r = parseRuleFromNaturalLanguage('20% off over $50')
    const sub = r.conditions.find(c => c.field === 'subtotal')
    expect(sub).toBeDefined()
    expect(sub.values[0]).toBe('50')
    expect(sub.operator).toBe('>=')
  })

  it('extracts category condition from "on clothing"', () => {
    const r = parseRuleFromNaturalLanguage('10% discount on clothing')
    const cat = r.conditions.find(c => c.field === 'categories')
    expect(cat).toBeDefined()
    expect(cat.values[0].toLowerCase()).toContain('clothing')
  })

  it('extracts exclude_on_sale condition', () => {
    const r = parseRuleFromNaturalLanguage('20% off excluding sale items')
    const exc = r.conditions.find(c => c.field === 'exclude_on_sale')
    expect(exc).toBeDefined()
    expect(exc.mode).toBe('exclude')
  })

  it('extracts customer_group condition', () => {
    const r = parseRuleFromNaturalLanguage('15% off for VIP customers')
    const cg = r.conditions.find(c => c.field === 'customer_group')
    expect(cg).toBeDefined()
    expect(cg.values[0]).toMatch(/VIP/i)
  })
})

describe('parseRuleFromNaturalLanguage — date extraction', () => {
  it('extracts date range from "next 7 days"', () => {
    const r = parseRuleFromNaturalLanguage('20% off for the next 7 days')
    expect(r.startDate).toBeDefined()
    expect(r.endDate).toBeDefined()
    const diff = (new Date(r.endDate) - new Date(r.startDate)) / 86400000
    expect(diff).toBeCloseTo(7, 0)
  })
})

describe('parseRuleFromNaturalLanguage — confidence and name', () => {
  it('generates a rule name', () => {
    const r = parseRuleFromNaturalLanguage('20% off Nike over $100')
    expect(typeof r.name).toBe('string')
    expect(r.name.length).toBeGreaterThan(0)
  })

  it('confidence is higher when type+value+conditions all found', () => {
    const high = parseRuleFromNaturalLanguage('20% discount on clothing for next 30 days')
    const low = parseRuleFromNaturalLanguage('something something vague')
    expect(high.confidence).toBeGreaterThan(low.confidence)
  })
})
