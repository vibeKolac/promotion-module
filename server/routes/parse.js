const express = require('express')
const router = express.Router()

function mockParse(input) {
  const lower = input.toLowerCase()
  const result = { confidence: 0.5, missingFields: [] }

  if (lower.includes('free gift') || lower.includes('gift with')) {
    result.type = 'gift'
  } else if (lower.match(/buy\s*\d+\s*get/)) {
    result.type = 'multi_buy'
  } else if (lower.includes('step') || lower.includes('tier')) {
    result.type = 'step_discount'
  } else {
    result.type = 'discount'
  }

  const pctMatch = lower.match(/(\d+)\s*%/)
  const fixedMatch = lower.match(/\$(\d+)\s*off/)
  if (pctMatch) { result.value = pctMatch[1]; result.valueUnit = '%'; result.confidence += 0.2 }
  else if (fixedMatch) { result.value = fixedMatch[1]; result.valueUnit = 'fixed'; result.confidence += 0.2 }
  else { result.missingFields = [...(result.missingFields || []), 'value'] }

  const conditions = []
  const brandMatch = lower.match(/\b(nike|adidas|puma|samsung|apple|sony)\b/g)
  if (brandMatch) {
    conditions.push({ field: 'brands', mode: 'include', values: brandMatch.map(b => b[0].toUpperCase() + b.slice(1)) })
    result.confidence += 0.1
  }
  const subtotalMatch = lower.match(/(?:over|above|minimum|min|at least|\$)\s*\$?(\d+)/)
  if (subtotalMatch) {
    conditions.push({ field: 'subtotal', mode: 'include', values: [subtotalMatch[1]], operator: '>=' })
    result.confidence += 0.1
  }
  if (conditions.length) result.conditions = conditions

  result.confidence = Math.min(0.95, result.confidence)
  return result
}

module.exports = () => {
  router.post('/', (req, res) => {
    const { input } = req.body
    if (!input) return res.status(400).json({ error: 'input required' })
    res.json(mockParse(input))
  })
  return router
}
