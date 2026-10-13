import {
  conditionLabel,
  discountLabel,
  discountOf,
  findCollisions,
  groupCollisions,
  subtotalCondition,
  withConditionOverrides,
} from '../../src/utils/promotionCollisions'

const subtotal = (operator, value) => [{ field: 'subtotal', mode: 'include', operator, values: [String(value)] }]

const rule = (id, overrides = {}) => ({
  id,
  name: `Rule ${id}`,
  type: 'discount',
  value: '10',
  valueUnit: '%',
  status: 'active',
  startDate: '2026-06-01',
  endDate: '2026-12-31',
  conditions: subtotal('>=', 500),
  ...overrides,
})

const candidate = (overrides = {}) => rule('new', overrides)

describe('findCollisions', () => {
  it('flags an active rule with the same condition and an overlapping period', () => {
    const result = findCollisions(candidate({ value: '5' }), [rule('a')])

    expect(result).toHaveLength(1)
    expect(result[0].reasons).toEqual(['condition'])
  })

  it('flags a rule that only shares the discount', () => {
    const result = findCollisions(candidate({ conditions: subtotal('<', 100) }), [rule('a')])

    expect(result[0].reasons).toEqual(['discount'])
  })

  it('lists both reasons when condition and discount are equal', () => {
    expect(findCollisions(candidate(), [rule('a')])[0].reasons).toEqual(['condition', 'discount'])
  })

  it('ignores draft, paused and ended rules', () => {
    const rules = ['draft', 'paused', 'ended'].map((status) => rule(status, { status }))

    expect(findCollisions(candidate(), rules)).toEqual([])
  })

  it('requires the periods to overlap and counts a shared boundary day', () => {
    const apart = rule('apart', { startDate: '2027-01-01', endDate: '2027-02-01' })
    const touching = rule('touching', { startDate: '2026-12-31', endDate: '2027-02-01' })

    expect(findCollisions(candidate(), [apart])).toEqual([])
    expect(findCollisions(candidate(), [touching])).toHaveLength(1)
  })

  it('reports nothing while the candidate has no dates', () => {
    expect(findCollisions(candidate({ startDate: null, endDate: null }), [rule('a')])).toEqual([])
  })

  it('does not match a different operator, subtotal, discount type or value', () => {
    const other = rule('a', { conditions: subtotal('>', 500), value: '15' })
    const fixed = rule('b', { conditions: subtotal('>', 700), valueUnit: '€' })

    expect(findCollisions(candidate(), [other, fixed])).toEqual([])
  })

  it('skips the rule being edited', () => {
    expect(findCollisions(candidate(), [rule('self')], 'self')).toEqual([])
  })
})

describe('groupCollisions', () => {
  it('groups rules by what they share, both first', () => {
    const groups = groupCollisions([
      { rule: rule('a'), reasons: ['condition'] },
      { rule: rule('b'), reasons: ['discount'] },
      { rule: rule('c'), reasons: ['condition', 'discount'] },
    ])

    expect(groups.map((g) => g.key)).toEqual(['both', 'condition', 'discount'])
    expect(groups[0].rules.map((r) => r.id)).toEqual(['c'])
  })
})

describe('labels and helpers', () => {
  it('formats the condition and discount', () => {
    expect(conditionLabel(subtotalCondition(subtotal('>=', 200)))).toBe('≥ 200')
    expect(conditionLabel(subtotalCondition(subtotal('=', 200)))).toBe('= 200')
    expect(discountLabel(discountOf(rule('a')))).toBe('10%')
    expect(discountLabel(discountOf(rule('a', { valueUnit: '€' })))).toBe('10')
  })

  it('has no condition or discount when they are empty', () => {
    expect(subtotalCondition([])).toBeNull()
    expect(discountOf(rule('a', { value: '0' }))).toBeNull()
    expect(discountOf(rule('a', { type: 'multi_buy' }))).toBeNull()
  })

  it('swaps in the override conditions by rule id', () => {
    const [swapped, untouched] = withConditionOverrides([rule('a'), rule('b')], { a: subtotal('>=', 1) })

    expect(swapped.conditions).toEqual(subtotal('>=', 1))
    expect(untouched.conditions).toEqual(subtotal('>=', 500))
  })
})
