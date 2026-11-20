import { describe, it, expect } from 'vitest'
import { groupFieldOptions, isConditionComplete, matchesConditions, pushRecent } from '../../src/utils/promotionFilters'

const rule = {
  type: 'discount',
  createdBy: 'anna',
  stackingGroupId: 'g1',
  tags: ['t1', 't2'],
  internalTags: [],
  startDate: '2026-11-01',
  endDate: '2026-12-01',
}
const row = (field, extra = {}) => ({ id: 1, field, values: [], dateMode: null, from: null, to: null, ...extra })
const now = new Date('2026-11-20T10:00:00')

describe('isConditionComplete', () => {
  it('needs a field and at least one value', () => {
    expect(isConditionComplete(row(null))).toBe(false)
    expect(isConditionComplete(row('type'))).toBe(false)
    expect(isConditionComplete(row('type', { values: ['discount'] }))).toBe(true)
  })

  it('needs a period for date, and a bound when custom', () => {
    expect(isConditionComplete(row('date'))).toBe(false)
    expect(isConditionComplete(row('date', { dateMode: 'last_7' }))).toBe(true)
    expect(isConditionComplete(row('date', { dateMode: 'custom' }))).toBe(false)
    expect(isConditionComplete(row('date', { dateMode: 'custom', from: '2026-11-01' }))).toBe(true)
  })
})

describe('matchesConditions', () => {
  it('matches any of the chosen values for single-value fields', () => {
    expect(matchesConditions(rule, [row('type', { values: ['gift', 'discount'] })], now)).toBe(true)
    expect(matchesConditions(rule, [row('type', { values: ['gift'] })], now)).toBe(false)
    expect(matchesConditions(rule, [row('group', { values: ['g1'] })], now)).toBe(true)
  })

  it('requires all chosen labels for list fields', () => {
    expect(matchesConditions(rule, [row('tags', { values: ['t1', 't2'] })], now)).toBe(true)
    expect(matchesConditions(rule, [row('tags', { values: ['t1', 't3'] })], now)).toBe(false)
  })

  it('combines conditions with AND and ignores incomplete ones', () => {
    const conditions = [row('type', { values: ['discount'] }), row('createdBy', { values: ['bob'] }), row(null)]
    expect(matchesConditions(rule, conditions, now)).toBe(false)
    expect(matchesConditions(rule, [conditions[0], row(null)], now)).toBe(true)
  })

  it('filters by status', () => {
    expect(matchesConditions(rule, [row('status', { values: ['active'] })], now)).toBe(false)
    expect(matchesConditions({ ...rule, status: 'active' }, [row('status', { values: ['active', 'paused'] })], now)).toBe(true)
  })

  it('filters by date period and custom range', () => {
    expect(matchesConditions(rule, [row('date', { dateMode: 'last_7' })], now)).toBe(true)
    expect(matchesConditions({ ...rule, endDate: '2026-10-01' }, [row('date', { dateMode: 'last_7' })], now)).toBe(false)
    expect(matchesConditions(rule, [row('date', { dateMode: 'custom', from: '2027-01-01' })], now)).toBe(false)
    expect(matchesConditions(rule, [row('date', { dateMode: 'custom', to: '2026-11-15' })], now)).toBe(true)
  })
})

describe('recently used fields', () => {
  const fields = [{ key: 'date', label: 'Date' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' }]

  it('lists recent fields first without repeating them', () => {
    const out = groupFieldOptions(fields, ['status', 'gone', 'date'])
    expect(out.map(i => i.value ?? i.type)).toEqual(['subheader', 'status', 'date', 'divider', 'subheader', 'type'])
  })

  it('shows a plain list when nothing was used yet', () => {
    expect(groupFieldOptions(fields, [])).toEqual([
      { title: 'Date', value: 'date' }, { title: 'Type', value: 'type' }, { title: 'Status', value: 'status' },
    ])
  })

  it('keeps the latest three, most recent first', () => {
    expect(pushRecent(['a', 'b', 'c'], 'd')).toEqual(['d', 'a', 'b'])
    expect(pushRecent(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c'])
  })
})
