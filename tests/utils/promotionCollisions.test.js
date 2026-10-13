import {
  benefitOf,
  conditionKey,
  conditionLabel,
  conditionSummary,
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

    expect(result[0].reasons).toEqual(['benefit'])
  })

  it('lists both reasons when condition and discount are equal', () => {
    expect(findCollisions(candidate(), [rule('a')])[0].reasons).toEqual(['condition', 'benefit'])
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

describe('findCollisions for other conditions and types', () => {
  const brand = (...values) => [{ field: 'brands', mode: 'include', values }]
  const steps = (...pairs) => pairs.map(([threshold, value]) => ({ threshold, value, amountType: 'PERCENT' }))

  it('flags identical non-subtotal conditions regardless of value order', () => {
    const a = rule('a', { conditions: brand('Vichy', 'Eucerin'), value: '5' })

    expect(findCollisions(candidate({ conditions: brand('Eucerin', 'Vichy') }), [a])[0].reasons).toEqual(['condition'])
    expect(findCollisions(candidate({ conditions: brand('Vichy') }), [a])).toEqual([])
  })

  it('compares every condition and nested groups', () => {
    const group = (...values) => [{ type: 'group', logicalOp: 'OR', conditions: brand(...values) }]
    const both = [...subtotal('>=', 500), ...brand('Vichy')]

    expect(findCollisions(candidate({ conditions: both, value: '1' }), [rule('a', { conditions: brand('Vichy'), value: '2' })])).toEqual([])
    expect(findCollisions(candidate({ conditions: group('A'), value: '1' }), [rule('b', { conditions: group('A'), value: '2' })])).toHaveLength(1)
  })

  it('ignores conditions with no values filled in', () => {
    expect(findCollisions(candidate({ conditions: brand(), value: '1' }), [rule('a', { conditions: brand(), value: '2' })])).toEqual([])
  })

  it('flags step discounts with identical steps only', () => {
    const base = { type: 'step_discount', stepType: 'SPENT', amountType: 'PERCENT', conditions: [] }
    const a = rule('a', { ...base, steps: steps([50, '5'], [100, '10']) })

    expect(findCollisions(candidate({ ...base, steps: steps([100, '10'], [50, '5']) }), [a])[0].reasons).toEqual(['benefit'])
    expect(findCollisions(candidate({ ...base, steps: steps([50, '5'], [100, '15']) }), [a])).toEqual([])
  })

  it('flags multi-buy rules with the same buy and free quantities', () => {
    const multi = (buy, free) => ({ type: 'multi_buy', multiBuyQty: buy, multiFreeQty: free, conditions: [] })

    expect(findCollisions(candidate(multi(3, 1)), [rule('a', multi(3, 1))])[0].reasons).toEqual(['benefit'])
    expect(findCollisions(candidate(multi(3, 1)), [rule('b', multi(2, 1))])).toEqual([])
  })

  it('flags gift rules offering the same gifts', () => {
    const gift = (sku) => ({ type: 'gift', gifts: [{ sku, quantity: 1 }], conditions: [] })

    expect(findCollisions(candidate(gift('X')), [rule('a', gift('X'))])[0].reasons).toEqual(['benefit'])
    expect(findCollisions(candidate(gift('X')), [rule('b', gift('Y'))])).toEqual([])
  })

  it('never matches benefits of different types', () => {
    const multi = rule('a', { type: 'multi_buy', multiBuyQty: 1, multiFreeQty: 1, conditions: [] })

    expect(findCollisions(candidate({ conditions: [] }), [multi])).toEqual([])
  })
})

describe('benefit and condition labels', () => {
  it('describes each rule type', () => {
    expect(benefitOf(rule('a')).label).toBe('10% off')
    expect(benefitOf({ type: 'multi_buy', multiBuyQty: 3, multiFreeQty: 1 }).label).toBe('buy 3 get 1 free')
    expect(benefitOf({ type: 'gift', gifts: [{ sku: 'X', quantity: 2 }] }).label).toContain('X ×2')
    expect(benefitOf({ type: 'gift', gifts: [] })).toBeNull()
  })

  it('summarises conditions and has none when empty', () => {
    expect(conditionSummary([...subtotal('>=', 50), { field: 'brands', mode: 'include', values: ['Vichy'] }])).toBe('subtotal ≥ 50, brands: Vichy')
    expect(conditionKey([])).toBeNull()
    expect(conditionSummary([])).toBeNull()
  })
})

describe('groupCollisions', () => {
  it('groups rules by what they share, both first', () => {
    const groups = groupCollisions([
      { rule: rule('a'), reasons: ['condition'] },
      { rule: rule('b'), reasons: ['benefit'] },
      { rule: rule('c'), reasons: ['condition', 'benefit'] },
    ])

    expect(groups.map((g) => g.key)).toEqual(['both', 'condition', 'benefit'])
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
