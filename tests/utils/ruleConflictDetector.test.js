import { detectConflicts, datesOverlap, conditionsOverlap, simulateRuleApplication } from '../../src/utils/ruleConflictDetector'

describe('datesOverlap', () => {
  it('returns true for overlapping ranges', () => {
    expect(datesOverlap('2026-01-01', '2026-03-31', '2026-03-01', '2026-06-30')).toBe(true)
  })
  it('returns false for non-overlapping ranges', () => {
    expect(datesOverlap('2026-01-01', '2026-02-28', '2026-03-01', '2026-06-30')).toBe(false)
  })
  it('returns true when either rule has no dates (open-ended)', () => {
    expect(datesOverlap(null, null, '2026-03-01', '2026-06-30')).toBe(true)
  })
})

describe('conditionsOverlap', () => {
  it('returns true when both target the same brand', () => {
    const c1 = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const c2 = [{ field: 'brands', mode: 'include', values: ['Nike', 'Adidas'] }]
    expect(conditionsOverlap(c1, c2)).toBe(true)
  })
  it('returns true when either has no conditions (applies to all)', () => {
    expect(conditionsOverlap([], [{ field: 'brands', mode: 'include', values: ['Nike'] }])).toBe(true)
  })
  it('returns false when conditions target different values with no overlap', () => {
    const c1 = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const c2 = [{ field: 'brands', mode: 'include', values: ['Adidas'] }]
    expect(conditionsOverlap(c1, c2)).toBe(false)
  })
})

describe('detectConflicts', () => {
  it('returns empty map for empty rules', () => {
    expect(detectConflicts([]).size).toBe(0)
  })
  it('detects condition_overlap between two active rules with matching brands and overlapping dates', () => {
    const rules = [
      { id: 'r1', name: 'R1', status: 'active', type: 'discount', priority: 10, startDate: '2026-01-01', endDate: '2026-12-31', conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
      { id: 'r2', name: 'R2', status: 'active', type: 'discount', priority: 5,  startDate: '2026-06-01', endDate: '2026-12-31', conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
    ]
    const map = detectConflicts(rules)
    expect(map.get('r1')?.[0].type).toBe('condition_overlap')
    expect(map.get('r2')?.[0].type).toBe('condition_overlap')
  })
  it('does not flag paused rules against active rules', () => {
    const rules = [
      { id: 'r1', name: 'R1', status: 'active',   type: 'discount', startDate: null, endDate: null, conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
      { id: 'r2', name: 'R2', status: 'paused',   type: 'discount', startDate: null, endDate: null, conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
      { id: 'r3', name: 'R3', status: 'inactive', type: 'discount', startDate: null, endDate: null, conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
    ]
    expect(detectConflicts(rules).size).toBe(0)
  })
})

describe('simulateRuleApplication', () => {
  const r = (id, priority, status = 'active', exclusive = false, conditions = []) =>
    ({ id, name: `Rule ${id}`, status, priority, exclusive, conditions, type: 'discount' })

  it('returns empty applied/skipped for empty input', () => {
    const result = simulateRuleApplication([])
    expect(result.applied).toEqual([])
    expect(result.skipped).toEqual([])
  })

  it('applies rules sorted by priority (lower first)', () => {
    const rules = [r('b', 5), r('a', 1), r('c', 10)]
    const { applied } = simulateRuleApplication(rules)
    expect(applied.map(r => r.id)).toEqual(['a', 'b', 'c'])
  })

  it('skips paused and inactive rules', () => {
    const rules = [r('active', 1, 'active'), r('paused', 2, 'paused'), r('inactive', 3, 'inactive')]
    const { applied, skipped } = simulateRuleApplication(rules)
    expect(applied.map(r => r.id)).toEqual(['active'])
    expect(skipped).toHaveLength(0) // paused/inactive not in output at all
  })

  it('skips second rule with same condition signature', () => {
    const cond = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const rules = [r('hi', 1, 'active', false, cond), r('lo', 5, 'active', false, cond)]
    const { applied, skipped } = simulateRuleApplication(rules)
    expect(applied.map(r => r.id)).toEqual(['hi'])
    expect(skipped[0].rule.id).toBe('lo')
    expect(skipped[0].reason).toMatch(/priority/i)
  })

  it('does not skip gift rules even with same conditions', () => {
    const cond = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const discount = { ...r('d', 1, 'active', false, cond), type: 'discount' }
    const gift = { ...r('g', 2, 'active', false, cond), type: 'gift' }
    const { applied } = simulateRuleApplication([discount, gift])
    expect(applied.map(r => r.id)).toContain('g')
  })
})
