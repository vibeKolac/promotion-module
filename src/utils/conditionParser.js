// src/utils/conditionParser.js
// Maps NLP-parsed field names to Vue condition type values (matching ConditionBuilderDialog CONDITION_TYPES)
const fieldToConditionType = {
  category:      'categories',
  categories:    'categories',
  sku:           'skus',
  skus:          'skus',
  brand:         'brands',
  brands:        'brands',
  productLine:   'product_lines',
  productLines:  'product_lines',
  couponCode:    'coupon_code',
  customerGroup: 'customer_group',
  pimStatus:     'pim_status',
  attributeSet:  'attribute_set',
  source:        'source',
  warehouseType: 'warehouse_type',
  seller:        'seller',
  excludeOnSale: 'exclude_on_sale',
  quantity:      'quantity',
  subtotal:      'subtotal',
  weight:        'weight',
}

const fieldLabels = {
  categories: 'Categories', skus: 'SKUs', brands: 'Brands',
  product_lines: 'Product lines', coupon_code: 'Coupon code',
  customer_group: 'Customer group', pim_status: 'PIM status',
  attribute_set: 'Attribute set', source: 'Source',
  warehouse_type: 'Warehouse type', seller: 'Seller',
  exclude_on_sale: 'Exclude on sale', quantity: 'Quantity',
  subtotal: 'Subtotal', weight: 'Weight',
}

// Scope-aware labels for quantifiable fields
const scopeLabels = {
  cart: {
    subtotal: 'Cart subtotal (ex. VAT)',
    quantity: 'Total cart quantity',
    weight: 'Total cart weight',
  },
  item: {
    subtotal: 'Item price (incl. VAT)',
    quantity: 'Item line quantity',
    weight: 'Item weight',
  },
}

let _idCounter = 0
function genId() {
  return `cond_${Date.now()}_${++_idCounter}`
}

/**
 * Convert parsed NLP conditions to wizard-compatible condition objects.
 * @param {Object} parsedData - Object with a `conditions` array from naturalLanguageParser
 * @returns {Array} Condition objects compatible with ConditionBuilderDialog
 */
export function parsedConditionsToWizardConditions(parsedData) {
  if (!parsedData?.conditions?.length) return []
  const result = []
  for (const c of parsedData.conditions) {
    const mapped = fieldToConditionType[c.field]
    if (!mapped) {
      console.warn(`[conditionParser] Unknown field: ${c.field}`)
      continue
    }
    result.push({
      id: c.id ?? genId(),
      field: mapped,
      mode: c.mode ?? 'include',
      values: c.values ?? [],
      operator: c.operator,
    })
  }
  return result
}

/**
 * Format conditions as a human-readable summary string.
 * @param {Array} conditions
 * @param {'cart'|'item'} scope
 * @returns {string}
 */
export function formatConditionsSummary(conditions, scope = 'cart') {
  if (!conditions?.length) return 'No conditions'
  const opLabels = { '>=': 'at least', '>': 'greater than', '<=': 'at most', '<': 'less than' }
  return conditions.map(c => {
    const scopedLabel = scopeLabels[scope]?.[c.field]
    const label = scopedLabel ?? fieldLabels[c.field] ?? c.field
    const modeIcon = c.mode === 'include' ? '✅' : '❌'
    if (c.field === 'exclude_on_sale') return `${modeIcon} Exclude items on sale`
    if (c.operator) {
      const opLabel = opLabels[c.operator] ?? c.operator
      return `${modeIcon} ${label}: ${opLabel} ${c.values[0]}`
    }
    const vals = c.values.length <= 2 ? c.values.join(', ') : `${c.values[0]} +${c.values.length - 1} more`
    return `${modeIcon} ${label}: ${vals}`
  }).join('\n')
}

/**
 * Suggest missing conditions based on what's already configured.
 * @param {Array} conditions
 * @returns {string} Suggestion message or empty string
 */
export function generateConditionSuggestions(conditions) {
  if (!conditions?.length) {
    return 'I didn\'t detect any conditions. Consider adding product filters (categories/brands) to target specific items.'
  }
  const suggestions = []
  const hasProduct = conditions.some(c => ['categories', 'brands', 'skus', 'product_lines'].includes(c.field))
  const hasThreshold = conditions.some(c => ['subtotal', 'quantity', 'weight'].includes(c.field))
  if (!hasProduct) suggestions.push('Add product filters (categories/brands) to target specific items')
  if (!hasThreshold) suggestions.push('Consider adding a minimum purchase requirement')
  if (conditions.length === 1) suggestions.push('All conditions use AND logic — add more for precise targeting')
  return suggestions.length ? `💡 Suggestions:\n• ${suggestions.join('\n• ')}` : ''
}

/**
 * Check if parsed data has sufficient confidence for smart rule creation.
 * @param {Object} parsedData
 * @returns {boolean}
 */
export function hasGoodConditionConfidence(parsedData) {
  const hasConditions = parsedData?.conditions?.length > 0
  const hasGoodConfidence = (parsedData?.confidence ?? 0) >= 0.6
  return hasConditions || hasGoodConfidence
}
