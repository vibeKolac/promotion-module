import { drMaxProducts } from '../mock/seed.js'

const CATALOG = new Map(drMaxProducts.map(p => [p.sku, p]))

/**
 * @param {string[]} skus
 * @returns {{ notFound: string[], outOfStock: string[] }}
 */
export function validateSkus(skus) {
  const notFound = []
  const outOfStock = []

  for (const sku of skus) {
    const entry = CATALOG.get(sku)
    if (!entry) {
      notFound.push(sku)
    } else if (entry.stock === 0) {
      outOfStock.push(sku)
    }
  }

  return { notFound, outOfStock }
}
