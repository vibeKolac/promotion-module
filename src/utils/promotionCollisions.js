const LIVE_STATUSES = ['active', 'scheduled']

const OPERATOR_SYMBOLS = { '>=': '≥', '>': '>', '=': '=', '==': '=', '<=': '≤', '<': '<' }

const toDay = (value) => (value ? String(value).slice(0, 10) : null)

export function subtotalCondition(conditions = []) {
  const condition = conditions.find(
    (c) => c.field === 'subtotal' && c.mode === 'include' && c.values?.[0] !== undefined && c.values[0] !== '',
  )
  if (!condition) return null

  return { operator: condition.operator, value: Number(condition.values[0]) }
}

export function discountOf(rule) {
  if (rule.type !== 'discount' || !rule.value || Number(rule.value) === 0) return null

  return { unit: rule.valueUnit === '%' ? 'percent' : 'fixed', value: Number(rule.value) }
}

export function conditionLabel(condition) {
  return condition ? `${OPERATOR_SYMBOLS[condition.operator] ?? condition.operator} ${condition.value}` : null
}

export function discountLabel(discount) {
  return discount ? `${discount.value}${discount.unit === 'percent' ? '%' : ''}` : null
}

function periodsOverlap(a, b) {
  const [aStart, aEnd, bStart, bEnd] = [toDay(a.startDate), toDay(a.endDate), toDay(b.startDate), toDay(b.endDate)]
  if (!aStart || !aEnd || !bStart || !bEnd) return false

  return aStart <= bEnd && bStart <= aEnd
}

export function findCollisions(candidate, rules, excludeId) {
  const condition = subtotalCondition(candidate.conditions)
  const discount = discountOf(candidate)

  return rules.flatMap((rule) => {
    if (rule.id === excludeId || !LIVE_STATUSES.includes(rule.status)) return []
    if (!periodsOverlap(candidate, rule)) return []

    const other = subtotalCondition(rule.conditions)
    const otherDiscount = discountOf(rule)
    const reasons = []

    if (condition && other && condition.operator === other.operator && condition.value === other.value) {
      reasons.push('condition')
    }
    if (discount && otherDiscount && discount.unit === otherDiscount.unit && discount.value === otherDiscount.value) {
      reasons.push('discount')
    }

    return reasons.length ? [{ rule, reasons }] : []
  })
}

export function groupCollisions(collisions) {
  const groups = { both: [], condition: [], discount: [] }

  collisions.forEach(({ rule, reasons }) => {
    const key = reasons.length === 2 ? 'both' : reasons[0]
    groups[key].push(rule)
  })

  return ['both', 'condition', 'discount'].filter((key) => groups[key].length).map((key) => ({ key, rules: groups[key] }))
}

export function withConditionOverrides(rules, overrides = {}) {
  return rules.map((rule) => (overrides[rule.id] ? { ...rule, conditions: overrides[rule.id] } : rule))
}
