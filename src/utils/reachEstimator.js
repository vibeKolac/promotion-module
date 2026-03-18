export function estimateReach(conditions) {
  let pct = 100

  for (const c of conditions) {
    if (c.mode === 'exclude') { pct -= 5; continue }
    switch (c.field) {
      case 'categories':     pct -= 20; break
      case 'brands':         pct -= 15; break
      case 'skus':           pct -= 25; break
      case 'subtotal':       pct -= 15; break
      case 'quantity':       pct -= 10; break
      case 'customer_group': pct -= 20; break
      default:               pct -= 5
    }
  }

  pct = Math.max(5, Math.min(100, pct))

  const label = pct >= 70 ? 'Broad' : pct >= 40 ? 'Moderate' : 'Narrow'
  const color = pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'error'

  return { percentage: pct, label, color }
}
