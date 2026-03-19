// src/utils/giftMigration.js
// Migrates legacy single-gift promotion format to multi-gift format.
// The legacy format used giftSku/giftQty/giftPrice fields directly on the rule.
// The current format uses a gifts[] array (as in GiftItemsSection.vue).

/**
 * Migrate a rule from legacy single-gift format to gifts[] array.
 * Safe to call on any rule — no-ops on non-gift rules and already-migrated rules.
 * @param {object} rule
 * @returns {object}
 */
export function migrateGiftData(rule) {
  if (rule.type !== 'gift') return rule
  if (rule.gifts && rule.gifts.length > 0) return rule // already migrated
  if (!rule.giftSku) return rule // nothing to migrate

  return {
    ...rule,
    gifts: [{
      id: 'gift-0',
      sku: rule.giftSku,
      quantity: Number(rule.giftQty ?? 1),
      price: Number(rule.giftPrice ?? 0.01),
    }],
  }
}

/**
 * Serialize form data to include both new gifts[] format and legacy fields
 * for backward compatibility with older API consumers.
 * @param {object} formData - Object with gifts[]
 * @returns {object} Merged object with both formats
 */
export function serializeGiftData(formData) {
  if (!formData.gifts?.length) return formData
  const first = formData.gifts[0]
  return {
    ...formData,
    giftSku: first.sku,
    giftQty: String(first.quantity),
    giftPrice: String(first.price),
  }
}
