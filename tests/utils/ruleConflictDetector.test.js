import { detectConflicts, datesOverlap, conditionsOverlap } from '../../src/utils/ruleConflictDetector'

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
