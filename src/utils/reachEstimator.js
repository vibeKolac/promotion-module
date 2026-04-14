export function estimateReach(conditions, scope = 'cart') {
  let pct = 100

  for (const c of conditions) {
    if (c.mode === 'exclude') { pct -= 5; continue }

    switch (c.field) {
      case 'categories':     pct -= 20; break
      case 'brands':         pct -= 15; break
      case 'skus':           pct -= 25; break
      case 'customer_group': pct -= 20; break

      // Quantifiable thresholds: item scope uses lower typical values → fewer orders qualify
      // than for cart scope where the full cart accumulates spend/quantity
      case 'subtotal': {
        const val = parseFloat(c.values?.[0])
        if (scope === 'item') {
          // Item price threshold — most items are low-value, high threshold is very restrictive
          pct -= isNaN(val) ? 20 : val > 50 ? 35 : val > 20 ? 25 : 15
        } else {
          // Cart subtotal threshold — cart accumulates across items
          pct -= isNaN(val) ? 15 : val > 200 ? 30 : val > 100 ? 20 : 10
        }
        break
      }
      case 'quantity': {
        const val = parseFloat(c.values?.[0])
        if (scope === 'item') {
          // Per-line quantity — customers rarely buy large qty of same item
          pct -= isNaN(val) ? 20 : val >= 5 ? 35 : val >= 3 ? 25 : 15
        } else {
          // Total cart quantity — cart typically has multiple lines
          pct -= isNaN(val) ? 10 : val >= 10 ? 25 : val >= 5 ? 15 : 8
        }
        break
      }
      case 'weight': {
        const val = parseFloat(c.values?.[0])
        if (scope === 'item') {
          pct -= isNaN(val) ? 10 : val > 2 ? 25 : 12
        } else {
          pct -= isNaN(val) ? 12 : val > 10 ? 28 : 15
        }
        break
      }

      default: pct -= 5
    }
  }

  pct = Math.max(5, Math.min(100, pct))

  const label = pct >= 70 ? 'Broad' : pct >= 40 ? 'Moderate' : 'Narrow'
  const color = pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'error'

  return { percentage: pct, label, color }
}
