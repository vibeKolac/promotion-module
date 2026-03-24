// src/utils/ruleConflictDetector.js

export function datesOverlap(start1, end1, start2, end2) {
  if (!start1 || !end1 || !start2 || !end2) return true // open-ended = always overlaps
  return new Date(start1) <= new Date(end2) && new Date(start2) <= new Date(end1)
}

export function conditionsOverlap(c1, c2) {
  if (!c1?.length || !c2?.length) return true // no conditions = applies to everything
  for (const a of c1) {
    if (a.mode !== 'include') continue
    for (const b of c2) {
      if (b.mode !== 'include' || b.field !== a.field) continue
      if (a.values.some(v => b.values.includes(v))) return true
    }
  }
  return false
}

export function detectConflicts(rules) {
  const map = new Map()
  if (!rules?.length) return map
  const active = rules.filter(r => r.status === 'active' || r.status === 'scheduled')
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const r1 = active[i], r2 = active[j]
      if (!datesOverlap(r1.startDate, r1.endDate, r2.startDate, r2.endDate)) continue
      if (!conditionsOverlap(r1.conditions, r2.conditions)) continue
      const conflict = {
        type: 'condition_overlap',
        message: `Overlaps with "${r2.name}"`,
        details: `Both rules target similar products during overlapping periods. Priority: ${r1.priority ?? 'unset'} vs ${r2.priority ?? 'unset'}`,
      }
      const reverseConflict = { ...conflict, message: `Overlaps with "${r1.name}"`, details: `Both rules target similar products during overlapping periods. Priority: ${r2.priority ?? 'unset'} vs ${r1.priority ?? 'unset'}` }
      map.set(r1.id, [...(map.get(r1.id) ?? []), conflict])
      map.set(r2.id, [...(map.get(r2.id) ?? []), reverseConflict])
    }
  }
  return map
}

function generateConditionSignature(rule) {
  if (!rule.conditions?.length) return null // no conditions = no deduplication
  const sig = rule.conditions
    .filter(c => c.mode === 'include')
    .map(c => `${c.field}:${[...c.values].sort().join(',')}`)
    .sort()
    .join('|')
  return sig || null // empty after filter = no deduplicate
}

export function simulateRuleApplication(rules, groups = []) {
  if (!rules?.length) return { applied: [], skipped: [], inactive: [] }

  // Build group priority lookup (lower = higher priority)
  const groupPriority = new Map(groups.map(g => [g.id, g.priority ?? 999]))

  // Separate out rules that won't run due to status
  const inactive = []
  const candidates = []
  for (const rule of rules) {
    if (rule.status === 'paused') {
      inactive.push({ rule, reason: 'Paused' })
    } else if (rule.status === 'draft') {
      inactive.push({ rule, reason: 'Draft' })
    } else if (rule.status === 'active' || rule.status === 'scheduled') {
      candidates.push(rule)
    }
  }

  const active = candidates.sort((a, b) => {
    const gpa = groupPriority.get(a.stackingGroupId) ?? 999
    const gpb = groupPriority.get(b.stackingGroupId) ?? 999
    if (gpa !== gpb) return gpa - gpb
    return (a.priority ?? 999) - (b.priority ?? 999)
  })

  const applied = []
  const skipped = []
  const usedSignatures = new Set()

  for (const rule of active) {
    const sig = generateConditionSignature(rule)
    const isGift = rule.type === 'gift'

    // Exclusive rule already applied → skip everything after
    if (!rule.exclusive && applied.some(r => r.exclusive)) {
      skipped.push({ rule, reason: 'Blocked by an exclusive rule with higher priority' })
      continue
    }

    if (!isGift && sig !== null && usedSignatures.has(sig)) {
      skipped.push({ rule, reason: 'Higher priority rule already applies to these conditions' })
    } else {
      applied.push(rule)
      if (sig !== null) usedSignatures.add(sig)
    }
  }

  return { applied, skipped, inactive }
}
