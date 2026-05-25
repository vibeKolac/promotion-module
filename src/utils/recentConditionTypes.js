const KEY = 'recent_condition_types'
const MAX = 3

export function getRecentConditionTypes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function recordConditionTypes(types) {
  const current = getRecentConditionTypes()
  const merged = [...types, ...current.filter(t => !types.includes(t))]
  localStorage.setItem(KEY, JSON.stringify(merged.slice(0, MAX)))
}
