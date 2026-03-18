export function detectGiftConflicts(gifts, conditions) {
  const skuIncludeConditions = conditions.filter(
    c => c.field === 'skus' && c.mode === 'include'
  )
  const includedSkus = new Set(skuIncludeConditions.flatMap(c => c.values))

  return gifts
    .filter(g => includedSkus.has(g.sku))
    .map(g => ({ sku: g.sku, message: `Gift SKU "${g.sku}" is also in an eligible SKU condition` }))
}
