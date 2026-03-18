const QUANTIFIABLE = ['subtotal', 'quantity', 'weight']

export function validateCondition(condition) {
  const errors = []
  const warnings = []
  const suggestions = []

  if (!condition.values || condition.values.length === 0) {
    errors.push('At least one value is required')
  }

  if (QUANTIFIABLE.includes(condition.field)) {
    if (!condition.operator) {
      errors.push('Operator is required for numeric conditions')
    }
    const val = parseFloat(condition.values?.[0])
    if (!isNaN(val) && val < 0) {
      errors.push('Value must be a positive number')
    }
  }

  return { isValid: errors.length === 0, errors, warnings, suggestions }
}

export function validateConditions(conditions) {
  const errors = []
  const warnings = []
  const suggestions = []

  // Check each condition individually
  for (const c of conditions) {
    const r = validateCondition(c)
    errors.push(...r.errors)
  }

  // Duplicate field types
  const fieldCounts = {}
  for (const c of conditions) {
    fieldCounts[c.field] = (fieldCounts[c.field] || 0) + 1
  }
  for (const [field, count] of Object.entries(fieldCounts)) {
    if (count > 1) {
      warnings.push(`Multiple conditions on "${field}" — consider merging them`)
    }
  }

  // Conflicting include + exclude on same field
  const includeFields = new Set(conditions.filter(c => c.mode === 'include').map(c => c.field))
  const excludeFields = new Set(conditions.filter(c => c.mode === 'exclude').map(c => c.field))
  for (const field of includeFields) {
    if (excludeFields.has(field)) {
      warnings.push(`Conflicting include and exclude on "${field}"`)
    }
  }

  // Over-restrictive suggestion
  const fields = conditions.map(c => c.field)
  if (fields.includes('brands') && fields.includes('categories') && fields.includes('skus')) {
    suggestions.push('Using brands + categories + SKUs together may be overly restrictive — consider removing one')
  }

  return { isValid: errors.length === 0, errors, warnings, suggestions }
}
