// src/mock/seed.js — ES module mirror of server/data/seed.js
// Kept in sync manually. Switch VITE_USE_MOCK to toggle between this and the real API.

export const drMaxProducts = [
  { sku: '100200301', name: 'Dr.Max Vitamin C High Effect 1000mg 30 tablets',  stock: 100, image: 'https://www.drmax.cz/_i/473799544.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Ff%2Faf583d8b9ebe5_1216_vitamin_c_high_effect_30tbl_box_55x90x55_sk_3d_r_06.jpg&fit=contain&w=350&h=350&format=webp' },
  { sku: '100200302', name: 'Dr.Max Vitamin D3 2000 I.U. 60 capsules',         stock: 45,  image: 'https://www.drmax.cz/_i/345605783.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2F8%2F5%2F8595566426521_t911.jpg&fit=contain&w=350&h=350&format=webp' },
  { sku: '100200303', name: 'Dr.Max Magnesium Complex Active 60 tablets',       stock: 0,   image: 'https://www.drmax.cz/_i/-1371638637.webp?m2=%2Fmedia%2Fcatalog%2Fproduct%2F7%2F6%2F768e169158326_1711_magnesium_complex_active_60tbl_box_129x83x46_cz-sk-pl_2-09_3d_r.jpg&fit=contain&w=350&h=350&format=webp' },
  { sku: '100200304', name: 'Dr.Max Omega-3 Classic 90 capsules',               stock: 78,  image: 'https://www.drmax.cz/_i/1790327503.webp?w=200&h=200&m2=%2Fmedia%2Fcatalog%2Fproduct%2Fm%2Fe%2Fmedium-dr.max_omega_3_classic_90tbl_box_cz-sk_l_3d.jpg&fit=contain&format=webp' },
  { sku: '100200305', name: 'Dr.Max Selenium Zinc Forte 60 tablets',            stock: 12,  image: 'https://www.drmax.cz/_i/-723099225.webp?w=200&h=200&m2=%2Fmedia%2Fcatalog%2Fproduct%2F8%2F5%2F8595566425760_t911.jpg&fit=contain&format=webp' },
  { sku: '100200306', name: 'Dr.Max Lactobacilli 10 Premium 40 capsules',       stock: 0,   image: 'https://www.drmax.cz/_i/-1488747103.webp?w=130&h=130&m2=%2Fmedia%2Fcatalog%2Fproduct%2Fd%2F3%2Fd30917378d706_1539_laktobacily_10_premium_40_cps_box_104x70x43_cz-sk_1-10_3d_r.jpg&fit=contain&format=webp' },
  { sku: '100200307', name: 'Dr.Max Multivitamin Energy 100 tablets',           stock: 200, image: 'https://www.drmax.cz/_i/-950495896.webp?w=130&h=130&m2=%2Fmedia%2Fcatalog%2Fproduct%2Fd%2F7%2Fd730e2eeb5706_1446_multivitamin_energy_100tbl_129x83x46_cz-sk_2-05_3d_r.jpg&fit=contain&format=webp' },
  { sku: '100200308', name: 'Dr.Max B-Complex Forte 100 tablets',               stock: 100, image: 'https://www.drmax.cz/_i/1421512122.webp?w=130&h=130&m2=%2Fmedia%2Fcatalog%2Fproduct%2F0%2Fc%2F0c47822d98406_1472_vitamin_b_complex_forte_100tbl_box_90x55x55_cz_1-07_3d_r.jpg&fit=contain&format=webp' },
  { sku: '100200309', name: 'Dr.Max Happy Sleep',                               stock: 0,   image: 'https://www.drmax.cz/_i/488956206.webp?w=130&h=130&m2=%2Fmedia%2Fcatalog%2Fproduct%2Fc%2Fa%2Fcaef604e5cc06_thumbnail_happy_sleep_box_cz-ro_3d_prava.jpg&fit=contain&format=webp' },
  { sku: '100200310', name: 'Dr.Max Collagen Drink 30 sachets',                 stock: 33,  image: 'https://www.drmax.cz/_i/-1666376868.webp?w=130&h=130&m2=%2Fmedia%2Fcatalog%2Fproduct%2Fd%2Fr%2Fdr._max_collagen_drink_box_cz-sk-it-pl-ro-rs_3d.jpg&fit=contain&format=webp' },
]

export const tags = [
  { id: 'tag-1', name: '3+1' },
  { id: 'tag-2', name: '10% discount' },
  { id: 'tag-3', name: '1+1' },
  { id: 'tag-4', name: 'Black Friday' },
]

export const internalTags = [
  { id: 'itag-1', name: 'internal' },
  { id: 'itag-2', name: 'Q2-2026' },
  { id: 'itag-3', name: 'analyse' },
  { id: 'itag-4', name: 'external' },
]

export const erpEntries = [
  { id: '7631', name: 'Skincare Summer Promo 2025' },
  { id: '7632', name: 'Flash Sale Q4 2025' },
  { id: '7633', name: 'Vichy Brand Discount' },
  { id: '7634', name: 'Loyalty Club Reward 2026' },
  { id: '7635', name: "Valentine's Special Offer" },
  { id: '7636', name: 'Sun Care Summer 2026' },
  { id: '7637', name: 'Bebelo Multi-buy Deal' },
  { id: '7638', name: 'La Roche-Posay Event' },
  { id: '7640', name: 'Travel Kit Free Gift' },
  { id: '7650', name: 'New Customer Welcome' },
  { id: '7651', name: 'Brand Week — Eucerin' },
  { id: '7652', name: 'Back to School Sale' },
  { id: '7700', name: 'DrMax Birthday Campaign' },
  { id: '7701', name: 'Easter Special Discount' },
  { id: '7702', name: 'Autumn Health Week' },
]

export const promotions = [
  {
    id: 'promo-1', name: '20% off Vichy over €50', type: 'discount',
    value: '20', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 4, status: 'active',
    scope: 'cart',
    startDate: '2026-04-01', endDate: '2026-06-30', stackingGroupId: 'sg-default',
    conditions: [
      { id: 'c1', field: 'brands', mode: 'include', values: ['Vichy'] },
      { id: 'c2', field: 'subtotal', mode: 'include', values: ['50'], operator: '>=' },
    ],
    gifts: [], nonCombinableRules: [], tags: ['tag-4'], internalTags: ['itag-2', 'itag-4'],
    erpId: '7631',
    performance: 87, revenue: '€24,500', usageCount: 1842, completedOrders: 7,
    createdBy: 'Anna K.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-2', name: 'Flash Sale — Skincare', type: 'discount',
    value: '30', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 1, status: 'active',
    scope: 'item',
    startDate: '2026-04-20', endDate: '2026-05-20', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c3', field: 'categories', mode: 'include', values: ['Dermocosmetology'] }],
    gifts: [], nonCombinableRules: [{ type: 'group', id: 'sg-2' }], tags: ['tag-1'], internalTags: ['itag-1'],
    erpId: '7632',
    performance: 62, revenue: '€12,300', usageCount: 934, completedOrders: 5,
    createdBy: 'Martin P.', createdAt: '2026-03-15T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 'promo-3', name: 'Buy 3 Get 1 Free — Bebelo', type: 'multi_buy',
    value: '25', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 2, status: 'draft',
    scope: 'item',
    startDate: '2026-05-15', endDate: '2026-07-31', stackingGroupId: 'sg-default',
    conditions: [
      { id: 'c4', field: 'brands', mode: 'include', values: ['Mustela'] },
    ],
    gifts: [], nonCombinableRules: [], tags: [], internalTags: ['itag-3'],
    createdBy: 'Anna K.', createdAt: '2026-03-10T12:00:00Z', updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'promo-4', name: 'Free DrMax travel kit over €150', type: 'gift',
    value: '0', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 1, status: 'active',
    scope: 'cart',
    startDate: '2026-03-01', endDate: '2026-07-31', stackingGroupId: 'sg-default',
    conditions: [{ id: 'c5', field: 'subtotal', mode: 'include', values: ['150'], operator: '>=' }],
    gifts: [{ id: 'g1', sku: '100200399', quantity: 1, price: 0 }],
    nonCombinableRules: [{ type: 'rule', id: 'promo-2' }], tags: ['tag-2'], internalTags: [],
    erpId: '7640',
    performance: 78, revenue: '€18,900', usageCount: 1203, completedOrders: 3,
    createdBy: 'Lukas J.', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'promo-5', name: 'Summer Sun Protection Campaign', type: 'discount',
    value: '25', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 3, status: 'scheduled',
    scope: 'cart',
    startDate: '2026-06-01', endDate: '2026-08-31', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c6', field: 'categories', mode: 'include', values: ['Sun Protection'] }],
    gifts: [], nonCombinableRules: [], processingOrder: 1, tags: ['tag-3'], internalTags: ['itag-2'],
    createdBy: 'Lukas J.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-6', name: 'DrMax Loyalty Club — 10% off', type: 'discount',
    value: '10', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 2, status: 'paused',
    scope: 'cart',
    startDate: '2026-04-01', endDate: '2026-07-31', stackingGroupId: 'sg-2',
    conditions: [{ id: 'c8', field: 'customer_group', mode: 'include', values: ['Club Silver'] }],
    gifts: [], nonCombinableRules: [], processingOrder: 2, tags: ['tag-2'], internalTags: ['itag-3', 'itag-4'],
    performance: 35, revenue: '€4,200', usageCount: 287,
    createdBy: 'Martin P.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-7', name: 'Valentine\'s Day — La Roche-Posay', type: 'discount',
    value: '15', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 4, status: 'ended',
    scope: 'item',
    startDate: '2026-02-10', endDate: '2026-02-16', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c7', field: 'brands', mode: 'include', values: ['La Roche-Posay'] }],
    gifts: [], nonCombinableRules: [], tags: ['tag-1', 'tag-3'], internalTags: [],
    performance: 91, revenue: '€31,700', usageCount: 2561, completedOrders: 4,
    createdBy: 'Anna K.', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-16T23:59:00Z',
  },
  {
    id: 'promo-8', name: 'Easter Wellness Deals', type: 'step_discount',
    value: '5', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 3, status: 'ended',
    scope: 'cart',
    startDate: '2026-04-01', endDate: '2026-04-21', stackingGroupId: 'sg-default',
    conditions: [{ id: 'c9', field: 'categories', mode: 'include', values: ['Vitamins & Supplements'] }],
    gifts: [], nonCombinableRules: [], tags: ['tag-3'], internalTags: ['itag-1'],
    performance: 55, revenue: '€8,100', usageCount: 610,
    createdBy: 'Anna K.', createdAt: '2026-03-25T08:00:00Z', updatedAt: '2026-04-21T23:59:00Z',
  },
  {
    id: 'promo-9', name: 'New Customer Welcome — 15% off', type: 'discount',
    value: '15', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 1, status: 'draft',
    scope: 'cart',
    startDate: null, endDate: null, stackingGroupId: 'sg-2',
    conditions: [{ id: 'c10', field: 'customer_group', mode: 'include', values: ['Guest'] }],
    gifts: [], nonCombinableRules: [], tags: [], internalTags: ['itag-3'],
    erpId: '7650',
    createdBy: 'Lukas J.', createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'promo-10', name: 'Eucerin Brand Week', type: 'discount',
    value: '20', valueUnit: '%', amountType: 'PERCENT', steps: [], priority: 2, status: 'scheduled',
    scope: 'item',
    startDate: '2026-05-19', endDate: '2026-05-25', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c11', field: 'brands', mode: 'include', values: ['Eucerin'] }],
    gifts: [], nonCombinableRules: [], tags: ['tag-2'], internalTags: ['itag-2', 'itag-1'],
    erpId: '7651',
    createdBy: 'Martin P.', createdAt: '2026-04-28T09:00:00Z', updatedAt: '2026-04-28T09:00:00Z',
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
    id: 'tpl-flash-1', label: 'Weekend Flash Sale', category: 'flash', popularity: 'high',
    description: 'Time-limited weekend discount', examples: ['20% off everything Sat–Sun'],
    ruleType: 'discount', defaultValue: '20', defaultValueUnit: '%',
    defaultConditions: [],
  },
  {
    id: 'tpl-seasonal-1', label: 'Seasonal Sale', category: 'seasonal', popularity: 'high',
    description: 'Holiday or seasonal discount', examples: ['Christmas 30% off', 'Summer Sale'],
    ruleType: 'discount', defaultValue: '30', defaultValueUnit: '%',
    defaultConditions: [],
  },
  {
    id: 'tpl-loyalty-1', label: 'VIP Exclusive', category: 'loyalty', popularity: 'high',
    description: 'Exclusive discount for loyalty customers', examples: ['VIP 15% off all brands'],
    ruleType: 'discount', defaultValue: '15', defaultValueUnit: '%',
    defaultConditions: [{ field: 'customerGroup', mode: 'include', values: ['VIP'] }],
  },
  {
    id: 'tpl-bulk-1', label: 'Spend More, Save More', category: 'bulk', popularity: 'high',
    description: 'Tiered spend discount — customers unlock bigger savings with each €50 spent',
    examples: ['Spend €50 → 5% off', 'Spend €100 → 10% off', 'Spend €150 → 15% off'],
    ruleType: 'step_discount',
    ruleSnapshot: {
      type: 'step_discount',
      scope: 'cart',
      stepType: 'SPENT',
      stepValue: 50,
      stepMaxSteps: 3,
      stepApplyTo: 'cheapest',
      amountType: 'PERCENT',
      steps: [
        { id: 'tpl-step-t1', threshold: 50, value: '5', amountType: 'PERCENT' },
        { id: 'tpl-step-t2', threshold: 100, value: '10', amountType: 'PERCENT' },
        { id: 'tpl-step-t3', threshold: 150, value: '15', amountType: 'PERCENT' },
      ],
      conditions: [
        {
          id: 'tpl-step-g1',
          type: 'group',
          conditions: [
            { id: 'tpl-step-g1-c1', field: 'categories', mode: 'include', values: ['Skincare'] },
            { id: 'tpl-step-g1-c2', field: 'categories', mode: 'include', values: ['Health Care'], logicalOp: 'OR' },
          ],
        },
      ],
    },
  },
  {
    id: 'tpl-gift-1', label: 'Free Gift With Purchase', category: 'gift', popularity: 'medium',
    description: 'Gift item with minimum spend', examples: ['Free travel kit over €150'],
    ruleType: 'gift', defaultValue: '0', defaultValueUnit: '%',
    defaultConditions: [{ field: 'subtotal', mode: 'include', values: ['150'], operator: '>=' }],
  },
  {
    id: 'tpl-brand-1', label: 'Brand Discount', category: 'category', popularity: 'high',
    description: 'Percentage off a specific brand', examples: ['20% off Vichy', '15% off La Roche-Posay'],
    ruleType: 'discount', defaultValue: '20', defaultValueUnit: '%',
    defaultConditions: [{ field: 'brands', mode: 'include', values: [] }],
  },
]
