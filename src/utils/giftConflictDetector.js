export function detectGiftConflicts(gifts, conditions, selectionMode = 'AND') {
  const skuIncludeConditions = conditions.filter(
    c => c.field === 'skus' && c.mode === 'include'
  )
  const includedSkus = new Set(skuIncludeConditions.flatMap(c => c.values))

  const conflicts = gifts
    .filter(g => includedSkus.has(g.sku))
    .map(g => ({ sku: g.sku, message: `Gift SKU "${g.sku}" is also in an eligible SKU condition` }))

  const filled = gifts.filter(g => g.sku)
  if (selectionMode === 'OR' && filled.length === 1) {
    conflicts.push({ message: 'Customer picks one is set but only one gift item is configured, so there is nothing to choose from' })
  }

  return conflicts
}
