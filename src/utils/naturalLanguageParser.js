/**
 * Parse natural language rule strings into structured promotion objects
 * @param {string} input - Natural language description (e.g., "20% off Nike over $100")
 * @returns {object} Parsed rule object with type, value, valueUnit, conditions, confidence, missingFields, name
 */

const KNOWN_BRANDS = ['Nike', 'Adidas', 'Puma', 'Samsung', 'Apple', 'Sony', 'LG', 'Philips']

export function parseRuleFromNaturalLanguage(input) {
  let confidence = 0.4
  const missingFields = []
  const conditions = []

  // Type detection
  let type = 'discount'
  const isGiftType = /\b(gift|present|free.*with)\b/i.test(input)
  const isMultiBuy = /buy\s+(\d+)\s*(?:get|and)/i.test(input)
  const isStepDiscount = /tiered|step|bracket/i.test(input)

  if (isGiftType) {
    type = 'gift'
  } else if (isMultiBuy) {
    type = 'multi_buy'
  } else if (isStepDiscount) {
    type = 'step_discount'
  }

  // Value extraction
  let value = null
  let valueUnit = null

  // Try percentage first
  const percentMatch = input.match(/(\d+(?:\.\d+)?)\s*%/)
  if (percentMatch) {
    value = percentMatch[1]
    valueUnit = '%'
    confidence += 0.2
  }

  // Try dollar amount if no percentage
  if (!value) {
    const dollarMatch = input.match(/\$\s*(\d+(?:\.\d+)?)/)
    if (dollarMatch) {
      value = dollarMatch[1]
      valueUnit = '$'
      confidence += 0.2
    }
  }

  // Try generic number with unit
  if (!value) {
    const genericMatch = input.match(/(\d+(?:\.\d+)?)\s*(units?|items?|pieces?)/)
    if (genericMatch) {
      value = genericMatch[1]
      valueUnit = genericMatch[2]
      confidence += 0.2
    }
  }

  if (!value) {
    missingFields.push('value')
  }

  // Brand condition detection
  const detectedBrands = []
  for (const brand of KNOWN_BRANDS) {
    if (new RegExp(`\\b${brand}\\b`, 'i').test(input)) {
      detectedBrands.push(brand)
    }
  }

  if (detectedBrands.length > 0) {
    conditions.push({
      field: 'brands',
      values: detectedBrands
    })
    confidence += 0.1
  }

  // Subtotal condition detection
  const subtotalMatch = input.match(/(?:over|above|more than|minimum|at least|exceeds?)\s*\$?\s*(\d+(?:\.\d+)?)/)
  if (subtotalMatch) {
    conditions.push({
      field: 'subtotal',
      operator: '>=',
      value: subtotalMatch[1]
    })
    confidence += 0.1
  }

  // Cap confidence at 0.95
  confidence = Math.min(confidence, 0.95)

  // Name field - use input string truncated to 60 chars with ellipsis
  const name = input.length > 60 ? input.substring(0, 60) + '...' : input

  return {
    type,
    value,
    valueUnit,
    conditions,
    confidence: parseFloat(confidence.toFixed(2)),
    missingFields,
    name
  }
}
