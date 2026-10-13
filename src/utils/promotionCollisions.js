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

const isFilled = (value) => value !== undefined && value !== null && value !== ''

function conditionKeyOf(condition) {
  if (condition.type === 'group') {
    const parts = (condition.conditions ?? []).map(conditionKeyOf).filter(Boolean).sort()
    return parts.length ? `(${condition.logicalOp ?? 'AND'}:${parts.join('|')})` : null
  }
  const values = (condition.values ?? []).filter(isFilled).map(String).sort()
  if (!values.length) return null

  return `${condition.field}:${condition.mode}:${condition.operator ?? ''}:${values.join(',')}`
}

function conditionTextOf(condition) {
  if (condition.type === 'group') {
    const parts = (condition.conditions ?? []).map(conditionTextOf).filter(Boolean)
    return parts.length ? `(${parts.join(` ${(condition.logicalOp ?? 'AND').toLowerCase()} `)})` : null
  }
  const values = (condition.values ?? []).filter(isFilled)
  if (!values.length) return null
  if (condition.field === 'subtotal') return `subtotal ${OPERATOR_SYMBOLS[condition.operator] ?? condition.operator} ${values[0]}`

  return `${condition.field}${condition.mode === 'exclude' ? ' not' : ''}: ${values.join(', ')}`
}

export function conditionKey(conditions = []) {
  const parts = conditions.map(conditionKeyOf).filter(Boolean).sort()

  return parts.length ? parts.join('&') : null
}

export function conditionSummary(conditions = []) {
  const parts = conditions.map(conditionTextOf).filter(Boolean)

  return parts.length ? parts.join(', ') : null
}

const stepLabel = (step, amountType) => `${step.threshold} → ${step.value}${amountType === 'PERCENT' ? '%' : ''}`

export function benefitOf(rule) {
  if (rule.type === 'discount') {
    const discount = discountOf(rule)

    return discount ? { key: `discount:${discount.unit}:${discount.value}`, label: `${discountLabel(discount)} off` } : null
  }

  if (rule.type === 'step_discount') {
    const steps = (rule.steps ?? []).filter((s) => isFilled(s.threshold) && isFilled(s.value))
    if (!steps.length) return null
    const sorted = [...steps].sort((a, b) => Number(a.threshold) - Number(b.threshold))
    const key = sorted.map((s) => `${s.threshold}/${s.value}/${s.amountType ?? rule.amountType}`).join(',')

    return {
      key: `step:${rule.stepType}:${key}`,
      label: `the same discount steps (${sorted.map((s) => stepLabel(s, s.amountType ?? rule.amountType)).join(', ')})`,
    }
  }

  if (rule.type === 'multi_buy') {
    if (!rule.multiBuyQty || !rule.multiFreeQty) return null

    return {
      key: `multi_buy:${rule.multiBuyQty}:${rule.multiFreeQty}:${rule.multiSelectionMode ?? ''}`,
      label: `buy ${rule.multiBuyQty} get ${rule.multiFreeQty} free`,
    }
  }

  if (rule.type === 'gift') {
    const gifts = (rule.gifts ?? []).filter((g) => g.sku)
    if (!gifts.length) return null
    const sorted = gifts.map((g) => `${g.sku} ×${g.quantity ?? 1}`).sort()

    return { key: `gift:${sorted.join(',')}`, label: `the same gift (${sorted.join(', ')})` }
  }

  return null
}

export function findCollisions(candidate, rules, excludeId) {
  const condition = conditionKey(candidate.conditions)
  const benefit = benefitOf(candidate)

  return rules.flatMap((rule) => {
    if (rule.id === excludeId || !LIVE_STATUSES.includes(rule.status)) return []
    if (!periodsOverlap(candidate, rule)) return []

    if (!condition || condition !== conditionKey(rule.conditions)) return []

    const reasons = ['condition']
    if (benefit && benefit.key === benefitOf(rule)?.key) reasons.push('benefit')

    return [{ rule, reasons }]
  })
}

export function groupCollisions(collisions) {
  const groups = { both: [], condition: [] }

  collisions.forEach(({ rule, reasons }) => {
    const key = reasons.length === 2 ? 'both' : reasons[0]
    groups[key].push(rule)
  })

  return ['both', 'condition'].filter((key) => groups[key].length).map((key) => ({ key, rules: groups[key] }))
}

export function withConditionOverrides(rules, overrides = {}) {
  return rules.map((rule) => (overrides[rule.id] ? { ...rule, conditions: overrides[rule.id] } : rule))
}
