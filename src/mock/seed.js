// src/mock/seed.js — ES module mirror of server/data/seed.js
// Kept in sync manually. Switch VITE_USE_MOCK to toggle between this and the real API.

export const tags = [
  { id: 'tag-1', name: 'Flash Sale', color: '#EF4444', visibleOnFrontend: true },
  { id: 'tag-2', name: 'Loyalty', color: '#10B981', visibleOnFrontend: true },
  { id: 'tag-3', name: 'Seasonal', color: '#F59E0B', visibleOnFrontend: true },
  { id: 'tag-4', name: 'Brand Deal', color: '#6366F1', visibleOnFrontend: false },
]

export const promotions = [
  {
    id: 'promo-1', name: '20% off Vichy over €50', type: 'discount',
    value: '20', valueUnit: '%', steps: [], priority: 10, status: 'active',
    scope: 'cart',
    startDate: null, endDate: null, stackingGroupId: 'sg-default',
    conditions: [
      { id: 'c1', field: 'brands', mode: 'include', values: ['Vichy'] },
      { id: 'c2', field: 'subtotal', mode: 'include', values: ['50'], operator: '>=' },
    ],
    gifts: [], nonCombinableRules: [], tags: ['tag-4'],
    performance: 87, revenue: '€24,500', usageCount: 1842, completedOrders: 7,
    createdBy: 'Anna K.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-2', name: 'Flash Sale — Skincare', type: 'discount',
    value: '30', valueUnit: '%', steps: [], priority: 5, status: 'active',
    scope: 'item',
    startDate: '2026-03-20', endDate: '2026-04-30', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c3', field: 'categories', mode: 'include', values: ['Skincare'] }],
    gifts: [], nonCombinableRules: [{ type: 'group', id: 'sg-2' }], tags: ['tag-1'],
    performance: 62, revenue: '€12,300', usageCount: 934, completedOrders: 5,
    createdBy: 'Martin P.', createdAt: '2026-03-15T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 'promo-3', name: 'Buy 3 Get 1 Free — Bebelo', type: 'multi_buy',
    value: '25', valueUnit: '%', steps: [], priority: 8, status: 'draft',
    scope: 'item',
    startDate: null, endDate: null, stackingGroupId: 'sg-default',
    conditions: [
      { id: 'c4', field: 'brands', mode: 'include', values: ['Bebelo'] },
    ],
    gifts: [], nonCombinableRules: [], tags: [],
    createdBy: 'Anna K.', createdAt: '2026-03-10T12:00:00Z', updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'promo-4', name: 'Free DrMax travel kit over €150', type: 'gift',
    value: '0', valueUnit: '%', steps: [], priority: 3, status: 'active',
    scope: 'cart',
    startDate: null, endDate: null, stackingGroupId: 'sg-default',
    conditions: [{ id: 'c5', field: 'subtotal', mode: 'include', values: ['150'], operator: '>=' }],
    gifts: [{ id: 'g1', sku: 'DM-TRAVEL-KIT', quantity: 1, price: 0 }],
    nonCombinableRules: [{ type: 'rule', id: 'promo-2' }], tags: ['tag-2'],
    performance: 78, revenue: '€18,900', usageCount: 1203, completedOrders: 3,
    createdBy: 'Lukas J.', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'promo-5', name: 'Summer Sun Protection Campaign', type: 'discount',
    value: '25', valueUnit: '%', steps: [], priority: 5, status: 'scheduled',
    scope: 'cart',
    startDate: '2026-06-01', endDate: '2026-08-31', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c6', field: 'categories', mode: 'include', values: ['Sun Care'] }],
    gifts: [], nonCombinableRules: [], processingOrder: 1, tags: ['tag-3'],
    createdBy: 'Lukas J.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-6', name: 'DrMax Loyalty Club — 10% off', type: 'discount',
    value: '10', valueUnit: '%', steps: [], priority: 8, status: 'paused',
    scope: 'cart',
    startDate: null, endDate: null, stackingGroupId: 'sg-2',
    conditions: [], gifts: [], nonCombinableRules: [], processingOrder: 2, tags: ['tag-2'],
    performance: 35, revenue: '€4,200', usageCount: 287,
    createdBy: 'Martin P.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-7', name: 'Valentine\'s Day — La Roche-Posay', type: 'discount',
    value: '15', valueUnit: '%', steps: [], priority: 6, status: 'ended',
    scope: 'item',
    startDate: '2026-02-10', endDate: '2026-02-16', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c7', field: 'brands', mode: 'include', values: ['La Roche-Posay'] }],
    gifts: [], nonCombinableRules: [], tags: ['tag-1', 'tag-3'],
    performance: 91, revenue: '€31,700', usageCount: 2561, completedOrders: 4,
    createdBy: 'Anna K.', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-16T23:59:00Z',
  },
]

export const promotionOrders = {
  'promo-1': [
    { orderType: 'order', orderIncrementId: 386239482, customerName: 'Munteanu Georgiana', orderCreatedDate: '2025-12-15 09:24:42', orderShipmentDate: '2026-04-02 06:30:47', orderCloseDate: '2026-04-03 13:22:17', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 1.50, rowTotalInclTaxAfterDiscount: 28.48, orderGrandTotal: 388.74, voucherId: 7631, ruleUsage: 1, ruleDiscount: 1.5, ruleBaseDiscount: 1.5, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386249212, customerName: 'Vatamanu Marinela', orderCreatedDate: '2025-12-15 09:24:42', orderShipmentDate: '2026-04-02 05:35:39', orderCloseDate: '2026-04-03 11:07:11', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 1.50, rowTotalInclTaxAfterDiscount: 28.48, orderGrandTotal: 199.95, voucherId: 7631, ruleUsage: 1, ruleDiscount: 1.5, ruleBaseDiscount: 1.5, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386268025, customerName: 'Ohaci Elena', orderCreatedDate: '2025-12-15 10:13:41', orderShipmentDate: '2026-04-04 05:43:55', orderCloseDate: '2026-04-06 14:10:20', rowTotalInclTax: 32.98, quantity: 1, discountAmount: 1.65, rowTotalInclTaxAfterDiscount: 31.33, orderGrandTotal: 202.95, voucherId: 7631, ruleUsage: 1, ruleDiscount: 1.65, ruleBaseDiscount: 1.65, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386283904, customerName: 'Stefan Elena', orderCreatedDate: '2025-12-15 10:15:03', orderShipmentDate: '2026-04-05 07:26:32', orderCloseDate: '2026-04-07 13:55:12', rowTotalInclTax: 28.99, quantity: 1, discountAmount: 1.45, rowTotalInclTaxAfterDiscount: 27.54, orderGrandTotal: 158.01, voucherId: 7631, ruleUsage: 1, ruleDiscount: 1.45, ruleBaseDiscount: 1.45, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386287523, customerName: 'Popescu Adriana', orderCreatedDate: '2025-12-15 10:15:03', orderShipmentDate: '2026-04-05 05:11:56', orderCloseDate: '2026-04-06 13:36:02', rowTotalInclTax: 28.99, quantity: 1, discountAmount: 1.45, rowTotalInclTaxAfterDiscount: 27.54, orderGrandTotal: 304.99, voucherId: 7631, ruleUsage: 1, ruleDiscount: 1.45, ruleBaseDiscount: 1.45, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386310409, customerName: 'Postudor Andreea', orderCreatedDate: '2025-12-15 09:12:49', orderShipmentDate: '2026-04-08 04:40:56', orderCloseDate: '2026-04-09 18:15:59', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 1.50, rowTotalInclTaxAfterDiscount: 28.48, orderGrandTotal: 320.92, voucherId: 7631, ruleUsage: 1, ruleDiscount: 1.5, ruleBaseDiscount: 1.5, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386489782, customerName: 'Stratan Geanina', orderCreatedDate: '2025-12-15 09:12:49', orderShipmentDate: '2026-04-20 11:36:28', orderCloseDate: '2026-04-22 14:10:58', rowTotalInclTax: 59.96, quantity: 2, discountAmount: 3.00, rowTotalInclTaxAfterDiscount: 56.96, orderGrandTotal: 510.22, voucherId: 7631, ruleUsage: 2, ruleDiscount: 3, ruleBaseDiscount: 3, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
  ],
  'promo-2': [
    { orderType: 'order', orderIncrementId: 386351523, customerName: 'Lupascu Anca', orderCreatedDate: '2025-12-15 09:28:37', orderShipmentDate: '2026-04-09 10:02:19', orderCloseDate: '2026-04-15 13:55:23', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 8.99, rowTotalInclTaxAfterDiscount: 20.99, orderGrandTotal: 156.55, voucherId: null, ruleUsage: 1, ruleDiscount: 8.99, ruleBaseDiscount: 8.99, ruleCouponCode: 'SKIN30', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386381590, customerName: 'Radulescu Luminita', orderCreatedDate: '2025-12-15 10:15:03', orderShipmentDate: '2026-04-14 05:43:21', orderCloseDate: '2026-04-15 14:10:31', rowTotalInclTax: 28.99, quantity: 1, discountAmount: 8.70, rowTotalInclTaxAfterDiscount: 20.29, orderGrandTotal: 311.32, voucherId: null, ruleUsage: 1, ruleDiscount: 8.70, ruleBaseDiscount: 8.70, ruleCouponCode: 'SKIN30', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386384225, customerName: 'Monica Benga', orderCreatedDate: '2025-12-15 09:12:49', orderShipmentDate: '2026-04-14 10:37:10', orderCloseDate: '2026-04-15 15:16:09', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 8.99, rowTotalInclTaxAfterDiscount: 20.99, orderGrandTotal: 359.05, voucherId: null, ruleUsage: 1, ruleDiscount: 8.99, ruleBaseDiscount: 8.99, ruleCouponCode: 'SKIN30', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386420434, customerName: 'Todireanu Carolina', orderCreatedDate: '2025-12-15 09:28:37', orderShipmentDate: '2026-04-15 18:36:17', orderCloseDate: '2026-04-17 16:16:04', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 8.99, rowTotalInclTaxAfterDiscount: 20.99, orderGrandTotal: 220.32, voucherId: null, ruleUsage: 1, ruleDiscount: 8.99, ruleBaseDiscount: 8.99, ruleCouponCode: 'SKIN30', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 386422381, customerName: 'Andrei Razvan', orderCreatedDate: '2025-12-10 15:00:07', orderShipmentDate: '2026-04-15 11:30:28', orderCloseDate: '2026-04-16 13:02:03', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 8.99, rowTotalInclTaxAfterDiscount: 20.99, orderGrandTotal: 328.73, voucherId: null, ruleUsage: 1, ruleDiscount: 8.99, ruleBaseDiscount: 8.99, ruleCouponCode: 'SKIN30', giftPdk: '', giftName: '', giftPrice: '' },
  ],
  'promo-4': [
    { orderType: 'order', orderIncrementId: 386450489, customerName: 'Nadoleanu Stela', orderCreatedDate: '2025-12-15 10:15:03', orderShipmentDate: '2026-04-18 04:17:47', orderCloseDate: '2026-04-20 11:02:59', rowTotalInclTax: 28.99, quantity: 1, discountAmount: 0, rowTotalInclTaxAfterDiscount: 28.99, orderGrandTotal: 333.20, voucherId: null, ruleUsage: 1, ruleDiscount: 0, ruleBaseDiscount: 0, ruleCouponCode: '', giftPdk: 'DM-TRAVEL-KIT', giftName: 'DrMax Travel Kit', giftPrice: 0 },
    { orderType: 'order', orderIncrementId: 386498371, customerName: 'Bumbar Dorina', orderCreatedDate: '2025-12-10 15:00:07', orderShipmentDate: '2026-04-21 10:45:44', orderCloseDate: '2026-04-22 15:25:18', rowTotalInclTax: 29.98, quantity: 1, discountAmount: 0, rowTotalInclTaxAfterDiscount: 29.98, orderGrandTotal: 87.70, voucherId: null, ruleUsage: 1, ruleDiscount: 0, ruleBaseDiscount: 0, ruleCouponCode: '', giftPdk: 'DM-TRAVEL-KIT', giftName: 'DrMax Travel Kit', giftPrice: 0 },
    { orderType: 'order', orderIncrementId: 386512044, customerName: 'Ionescu Maria', orderCreatedDate: '2026-01-05 11:20:00', orderShipmentDate: '2026-04-22 07:10:00', orderCloseDate: '2026-04-23 09:30:00', rowTotalInclTax: 45.00, quantity: 2, discountAmount: 0, rowTotalInclTaxAfterDiscount: 45.00, orderGrandTotal: 210.50, voucherId: null, ruleUsage: 1, ruleDiscount: 0, ruleBaseDiscount: 0, ruleCouponCode: '', giftPdk: 'DM-TRAVEL-KIT', giftName: 'DrMax Travel Kit', giftPrice: 0 },
  ],
  'promo-7': [
    { orderType: 'order', orderIncrementId: 385001122, customerName: 'Georgescu Ana', orderCreatedDate: '2026-02-11 08:00:00', orderShipmentDate: '2026-02-13 10:00:00', orderCloseDate: '2026-02-14 12:00:00', rowTotalInclTax: 89.90, quantity: 2, discountAmount: 13.49, rowTotalInclTaxAfterDiscount: 76.41, orderGrandTotal: 245.00, voucherId: null, ruleUsage: 2, ruleDiscount: 13.49, ruleBaseDiscount: 13.49, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 385002344, customerName: 'Constantin Mirela', orderCreatedDate: '2026-02-12 09:30:00', orderShipmentDate: '2026-02-13 14:00:00', orderCloseDate: '2026-02-15 11:00:00', rowTotalInclTax: 59.95, quantity: 1, discountAmount: 8.99, rowTotalInclTaxAfterDiscount: 50.96, orderGrandTotal: 178.20, voucherId: null, ruleUsage: 1, ruleDiscount: 8.99, ruleBaseDiscount: 8.99, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 385003567, customerName: 'Popa Daniela', orderCreatedDate: '2026-02-13 11:15:00', orderShipmentDate: '2026-02-14 09:00:00', orderCloseDate: '2026-02-15 14:30:00', rowTotalInclTax: 44.95, quantity: 1, discountAmount: 6.74, rowTotalInclTaxAfterDiscount: 38.21, orderGrandTotal: 112.60, voucherId: null, ruleUsage: 1, ruleDiscount: 6.74, ruleBaseDiscount: 6.74, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
    { orderType: 'order', orderIncrementId: 385004789, customerName: 'Dumitrescu Ioana', orderCreatedDate: '2026-02-14 07:45:00', orderShipmentDate: '2026-02-15 08:30:00', orderCloseDate: '2026-02-16 10:00:00', rowTotalInclTax: 119.80, quantity: 4, discountAmount: 17.97, rowTotalInclTaxAfterDiscount: 101.83, orderGrandTotal: 389.90, voucherId: null, ruleUsage: 4, ruleDiscount: 17.97, ruleBaseDiscount: 17.97, ruleCouponCode: '', giftPdk: '', giftName: '', giftPrice: '' },
  ],
}

export const stackingGroups = [
  { id: 'sg-1', name: 'Flash Sales', description: 'All flash sale promotions', color: '#EF4444', priority: 10, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-2', name: 'Loyalty', description: 'Loyalty program discounts', color: '#10B981', priority: 20, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-default', name: 'Unassigned', description: 'Rules with no priority group', color: '#6B7280', priority: 999, isDefault: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

export const templates = [
  {
    id: 'tpl-1', label: 'Flash Sale — Skincare', description: 'Time-limited discount on skincare products',
    ruleType: 'discount', defaultValue: '30', defaultValueUnit: '%',
    defaultConditions: [{ field: 'categories', mode: 'include', values: ['Skincare'] }],
  },
  {
    id: 'tpl-2', label: 'Brand Discount', description: 'Percentage off a specific brand',
    ruleType: 'discount', defaultValue: '20', defaultValueUnit: '%',
    defaultConditions: [{ field: 'brands', mode: 'include', values: ['Vichy'] }],
  },
  {
    id: 'tpl-3', label: 'Multi-buy Offer', description: 'Buy multiple items for a discount',
    ruleType: 'multi_buy', defaultValue: '10', defaultValueUnit: '%',
    defaultConditions: [{ field: 'quantity', mode: 'include', values: ['3'], operator: '>=' }],
  },
  {
    id: 'tpl-4', label: 'Free Gift With Purchase', description: 'Gift item with minimum spend',
    ruleType: 'gift', defaultValue: '0', defaultValueUnit: '%',
    defaultConditions: [{ field: 'subtotal', mode: 'include', values: ['150'], operator: '>=' }],
  },
]
