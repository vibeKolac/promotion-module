// src/utils/naturalLanguageParser.js
// Full port of NaturalLanguageParser from the React prototype.

// ── Type detection ────────────────────────────────────────────────────────────

function extractPromotionType(input) {
  if (
    input.match(/step\s+discount|tiered|for\s+every|per\s+\$\d+|threshold/) ||
    input.match(/\$\d+\s+off\s+(per|for\s+every)\s+\$\d+/)
  ) return 'step_discount'

  if (
    input.match(/buy\s+\d+\s+get\s+\d+|multi[\s-]?buy|bogo|\d+\s+for\s+\d+/) ||
    input.match(/purchase\s+\d+.*get\s+\d+/)
  ) return 'multi_buy'

  if (
    input.match(/free\s+gift|gift\s+(with|promotion)|bonus\s+item|complimentary/) ||
    input.match(/receive.*gift|get.*free\s+\w+\s+(with|when)/)
  ) return 'gift'

  if (
    input.match(/\d+%\s+off|\d+\s+percent|discount/) ||
    input.match(/\$\d+\s+off(?!\s+(per|for\s+every))/)
  ) return 'discount'

  return null
}

// ── Value extraction ──────────────────────────────────────────────────────────
// NOTE: receives original-case input so gift SKU detection preserves casing.

function extractValue(input, type) {
  const lowerInput = input.toLowerCase()
  const result = { value: null, valueUnit: '%' }

  if (type === 'discount') {
    const pct = lowerInput.match(/(\d+)\s*%|(\d+)\s+percent/)
    if (pct) { result.value = pct[1] || pct[2]; return result }
    const fixed = lowerInput.match(/\$(\d+)\s*(off|discount)/)
    if (fixed) { result.value = fixed[1]; result.valueUnit = 'fixed'; return result }
  }

  if (type === 'step_discount') {
    const step = lowerInput.match(/\$(\d+)\s+off\s+(for\s+every|per)\s+\$(\d+)/)
    if (step) {
      result.value = step[1]; result.stepValue = step[3]
      result.stepType = 'SPENT'; return result
    }
    const pctStep = lowerInput.match(/(\d+)%\s+off\s+(for\s+every|per)\s+\$(\d+)/)
    if (pctStep) {
      result.value = pctStep[1]; result.stepValue = pctStep[3]
      result.stepType = 'SPENT'; return result
    }
  }

  if (type === 'multi_buy') {
    // "buy 2 get 1 free" → bg[1]='2', bg[2]='1'
    // "3 for 2" → bg[3]='3' (total), bg[4]='2' (paid for)
    const bg = lowerInput.match(/buy\s+(\d+)\s+get\s+(\d+)|(\d+)\s+for\s+(\d+)/)
    if (bg) {
      const buyQty = bg[1] || bg[3]
      const freeQty = bg[2] || (parseInt(bg[3]) - parseInt(bg[4])).toString()
      result.buyQty = buyQty; result.freeQty = freeQty
      result.value = `${buyQty} for ${parseInt(buyQty) - parseInt(freeQty)}`
      return result
    }
  }

  if (type === 'gift') {
    result.value = 'Free Gift'
    result.gifts = [{ id: 'gift-0', sku: 'GIFT-001', quantity: '1', price: '0.01' }]
    // Try to extract specific SKUs from original-case input
    const giftPat = /(?:gift|item)s?\s*:?\s*([A-Z0-9\-,\s]+)/i
    const gm = input.match(giftPat)
    if (gm) {
      const skus = gm[1].split(',').map(s => s.trim()).filter(s => s.length > 0)
      if (skus.length) result.gifts = skus.map((sku, i) => ({ id: `gift-${i}`, sku, quantity: '1', price: '0.01' }))
    }
    return result
  }

  return result
}

// ── Date extraction ───────────────────────────────────────────────────────────
// Always returns a date range — defaults to today + 30 days when no hint found.
// This matches the React prototype behaviour: 'validity period' is never added
// to missingFields; the default is a sensible starting point for the user.

function extractDateRange(input) {
  const today = new Date()
  let start = new Date(today)
  let end = new Date(today)

  // Absolute range: "2024-01-01 to 2024-01-31"
  const iso = input.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
  if (iso) return { startDate: iso[1], endDate: iso[2] }

  // Relative durations — check days first so "7 days" beats "week"
  const days = input.match(/(?:next|for)?\s*(\d+)\s+days?/)
  if (days) {
    end = new Date(today)
    end.setDate(end.getDate() + parseInt(days[1]))
  } else {
    const weeks = input.match(/(\d+)\s+weeks?/)
    if (weeks) {
      end = new Date(today); end.setDate(end.getDate() + parseInt(weeks[1]) * 7)
    } else if (input.includes('week')) {
      end = new Date(today); end.setDate(end.getDate() + 7)
    }

    const months = input.match(/(\d+)\s+months?/)
    if (months) {
      end = new Date(today); end.setMonth(end.getMonth() + parseInt(months[1]))
    } else if (input.includes('month')) {
      end = new Date(today); end.setMonth(end.getMonth() + 1)
    }
  }

  if (input.match(/tomorrow/)) {
    start = new Date(today); start.setDate(start.getDate() + 1)
  }

  // Default 30 days if no duration keyword found
  if (end.getTime() === today.getTime()) {
    end = new Date(today); end.setDate(end.getDate() + 30)
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

// ── Condition extraction ──────────────────────────────────────────────────────

function extractConditions(originalInput, lowerInput) {
  const conditions = []
  const hasExclusion = !!lowerInput.match(/exclud(?:e|ing)|except|not\s+(?:on|for)|without/)

  // Categories
  const catPatterns = [
    /categor(?:y|ies):\s*([^.,;]+)/i,
    /on\s+(electronics|clothing|accessories|beauty|skincare|footwear|sports|toys|books|home|furniture|appliances)(?:\s+categor(?:y|ies))?/i,
    /for\s+(electronics|clothing|accessories|beauty|skincare|footwear|sports|toys|books|home|furniture|appliances)(?:\s+categor(?:y|ies))?/i,
    /in\s+(electronics|clothing|accessories|beauty|skincare|footwear|sports|toys|books|home|furniture|appliances)/i,
  ]
  for (const pat of catPatterns) {
    const m = originalInput.match(pat)
    if (m) {
      const cats = m[1].split(/,|\s+and\s+|\s+&\s+/)
        .map(c => c.trim())
        .filter(c => c && !/categor|section/i.test(c))
      if (cats.length) {
        conditions.push({ field: 'categories', mode: hasExclusion ? 'exclude' : 'include', values: cats })
        break
      }
    }
  }

  // Brands — only if no category was already matched (avoid double-matching "on clothing")
  if (!conditions.some(c => c.field === 'categories')) {
    const brandPatterns = [
      /brands?:\s*([^.,;]+)/i,
      /(?:off|on)\s+([A-Z][a-zA-Z0-9]+(?:\s+and\s+[A-Z][a-zA-Z0-9]+)*)\s+(?:products?|items?|brand)?/,
      /for\s+([A-Z][a-zA-Z0-9]+(?:\s+and\s+[A-Z][a-zA-Z0-9]+)*)\s+(?:brand|products?)?/,
    ]
    for (const pat of brandPatterns) {
      const m = originalInput.match(pat)
      if (m) {
        const brands = m[1].split(/,|\s+and\s+/)
          .map(b => b.trim())
          .filter(b => b && /^[A-Z]/.test(b) && !/brand|product|item|discount|off|free/i.test(b))
        if (brands.length) {
          conditions.push({ field: 'brands', mode: hasExclusion ? 'exclude' : 'include', values: brands })
          break
        }
      }
    }
  }

  // SKUs
  const skuM = originalInput.match(/skus?:\s*([^.,;]+)/i)
  if (skuM) {
    conditions.push({
      field: 'skus', mode: 'include',
      values: skuM[1].split(/,|\s+and\s+/).map(s => s.trim()).filter(Boolean),
    })
  }

  // Product lines
  const plM = originalInput.match(/product\s+lines?:\s*([^.,;]+)/i)
  if (plM) {
    conditions.push({
      field: 'product_lines', mode: 'include',
      values: plM[1].split(/,|\s+and\s+/).map(s => s.trim()).filter(Boolean),
    })
  }

  // Subtotal / minimum purchase
  const subtotalPatterns = [
    /minimum\s+(?:purchase|order|spend|subtotal|of|cart)?\s*(?:of)?\s*[€$]?(\d+)/i,
    /subtotal\s*>=?\s*[€$]?(\d+)/i,
    /over\s+[€$]?(\d+)/i,
    /when\s+you\s+spend\s+[€$]?(\d+)/i,
    /purchase\s+(?:over|above)\s+[€$]?(\d+)/i,
  ]
  for (const pat of subtotalPatterns) {
    const m = originalInput.match(pat)
    if (m) { conditions.push({ field: 'subtotal', mode: 'include', values: [m[1]], operator: '>=' }); break }
  }

  // Quantity
  const qtyM = originalInput.match(/(?:minimum|min|at\s+least)\s+(\d+)\s+items?|quantity\s*>=?\s*(\d+)/i)
  if (qtyM) {
    conditions.push({ field: 'quantity', mode: 'include', values: [qtyM[1] || qtyM[2]], operator: '>=' })
  }

  // Exclude on sale
  if (lowerInput.match(/exclud|except/) && lowerInput.match(/sale|clearance|on\s+sale/)) {
    conditions.push({ field: 'exclude_on_sale', mode: 'exclude', values: ['true'] })
  }

  // Customer group
  const cgM = originalInput.match(/for\s+(VIP|premium|new|existing|loyal|members?)\s+customers?/i)
  if (cgM) {
    conditions.push({ field: 'customer_group', mode: 'include', values: [cgM[1]] })
  }

  return conditions
}

// ── Name generation ───────────────────────────────────────────────────────────

function generateRuleName(parsed, originalInput) {
  const quoted = originalInput.match(/["']([^"']+)["']/)
  if (quoted) return quoted[1]

  const conditionNames = []
  if (parsed.conditions) {
    for (const c of parsed.conditions) {
      if ((c.field === 'categories' || c.field === 'brands') && c.values.length > 0) {
        conditionNames.push(c.values[0])
      }
    }
  }

  let name = ''
  const t = parsed.type
  if (t === 'discount') name = `${parsed.value || ''}% Off`
  else if (t === 'step_discount') name = `$${parsed.value} Off per $${parsed.stepValue}`
  else if (t === 'multi_buy') name = `Buy ${parsed.buyQty} Get ${parsed.freeQty} Free`
  else if (t === 'gift') name = 'Free Gift Promotion'
  else name = 'New Promotion'

  if (conditionNames.length > 0) name += ` — ${conditionNames.join(', ')}`
  return name
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Parse natural language rule descriptions into structured promotion objects.
 * @param {string} input - e.g. "20% off Nike sneakers over €100 for the next 7 days"
 * @returns {object} { type, value, valueUnit, conditions, confidence, missingFields, name,
 *                     startDate, endDate, stepValue?, stepType?, buyQty?, freeQty?, gifts? }
 */
export function parseRuleFromNaturalLanguage(input) {
  const lowerInput = input.toLowerCase()
  const result = { confidence: 0, missingFields: [] }

  // 1. Type
  const type = extractPromotionType(lowerInput)
  if (type) { result.type = type; result.confidence += 0.25 }
  else { result.type = 'discount'; result.missingFields.push('promotion type') }

  // 2. Value — pass original input (not lowercased) so gift SKU detection preserves case
  const valueInfo = extractValue(input, result.type)
  if (valueInfo.value) { Object.assign(result, valueInfo); result.confidence += 0.25 }
  else { result.missingFields.push('discount value') }
  if (!result.valueUnit) result.valueUnit = '%'

  // 3. Dates — always returns a range (defaults to today + 30 days)
  const dates = extractDateRange(lowerInput)
  result.startDate = dates.startDate
  result.endDate = dates.endDate
  result.confidence += 0.25

  // 4. Conditions
  const conditions = extractConditions(input, lowerInput)
  result.conditions = conditions
  if (conditions.length > 0) result.confidence += 0.15

  // 5. Name
  result.name = generateRuleName(result, input)

  return result
}
