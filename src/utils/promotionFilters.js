export const DATE_MODES = [
  { value: 'last_7', title: 'Last 7 days', days: 7 },
  { value: 'last_14', title: 'Last 14 days', days: 14 },
  { value: 'last_30', title: 'Last 30 days', days: 30 },
  { value: 'custom', title: 'Custom period' },
]

const SINGLE_VALUE_FIELDS = { group: 'stackingGroupId', type: 'type', createdBy: 'createdBy', status: 'status' }
const DATE_FIELDS = ['validIn', 'createdAt']
const LIST_FIELDS = { tags: 'tags', internalTags: 'internalTags' }

export function isConditionComplete(c) {
  if (!c.field) return false
  if (DATE_FIELDS.includes(c.field)) return c.dateMode === 'custom' ? !!(c.from || c.to) : !!c.dateMode
  return c.values.length > 0
}

function isoDate(d) {
  return d.toISOString().split('T')[0]
}

function matchesCreated(rule, c, now) {
  const created = (rule.createdAt ?? '').slice(0, 10)
  if (!created) return false
  if (c.dateMode === 'custom') return (!c.from || created >= c.from) && (!c.to || created <= c.to)
  const days = DATE_MODES.find(m => m.value === c.dateMode)?.days
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const from = new Date(today)
  from.setDate(from.getDate() - days)
  return created >= isoDate(from) && created <= isoDate(today)
}

function matchesDate(rule, c, now) {
  if (c.dateMode === 'custom') {
    if (c.from && rule.endDate && rule.endDate < c.from) return false
    if (c.to && rule.startDate && rule.startDate > c.to) return false
    return true
  }
  const days = DATE_MODES.find(m => m.value === c.dateMode)?.days
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const from = new Date(today)
  from.setDate(from.getDate() - days)
  return (!rule.startDate || rule.startDate <= isoDate(today)) && (!rule.endDate || rule.endDate >= isoDate(from))
}

export function matchesConditions(rule, conditions, now = new Date()) {
  return conditions.filter(isConditionComplete).every(c => {
    if (c.field === 'validIn') return matchesDate(rule, c, now)
    if (c.field === 'createdAt') return matchesCreated(rule, c, now)
    if (SINGLE_VALUE_FIELDS[c.field]) return c.values.includes(rule[SINGLE_VALUE_FIELDS[c.field]])
    if (LIST_FIELDS[c.field]) return c.values.every(v => (rule[LIST_FIELDS[c.field]] ?? []).includes(v))
    return true
  })
}

export const RECENT_LIMIT = 3

export function groupFieldOptions(fields, recentKeys) {
  const items = fields.map(f => ({ title: f.label, value: f.key }))
  const recent = recentKeys.map(k => items.find(i => i.value === k)).filter(Boolean)
  if (!recent.length) return items
  return [
    { type: 'subheader', title: 'Recently used' },
    ...recent,
    { type: 'divider' },
    { type: 'subheader', title: 'All filters' },
    ...items.filter(i => !recent.includes(i)),
  ]
}

export function pushRecent(recentKeys, key) {
  return [key, ...recentKeys.filter(k => k !== key)].slice(0, RECENT_LIMIT)
}
