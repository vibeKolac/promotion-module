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
    startDate: null, endDate: null, stackingGroupId: 'sg-default',
    conditions: [
      { id: 'c1', field: 'brands', mode: 'include', values: ['Vichy'] },
      { id: 'c2', field: 'subtotal', mode: 'include', values: ['50'], operator: '>=' },
    ],
    gifts: [], nonCombinableRules: [], tags: ['tag-4'],
    performance: 87, revenue: '€24,500',
    createdBy: 'Anna K.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-2', name: 'Flash Sale — Skincare', type: 'discount',
    value: '30', valueUnit: '%', steps: [], priority: 5, status: 'active',
    startDate: '2026-03-20', endDate: '2026-04-30', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c3', field: 'categories', mode: 'include', values: ['Skincare'] }],
    gifts: [], nonCombinableRules: [{ type: 'group', id: 'sg-2' }], tags: ['tag-1'],
    performance: 62, revenue: '€12,300',
    createdBy: 'Martin P.', createdAt: '2026-03-15T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 'promo-3', name: 'Buy 3 Get 1 Free — Bebelo', type: 'multi_buy',
    value: '25', valueUnit: '%', steps: [], priority: 8, status: 'draft',
    startDate: null, endDate: null, stackingGroupId: 'sg-default',
    conditions: [
      { id: 'c4', field: 'brands', mode: 'include', values: ['Bebelo'] },
    ],
    gifts: [], nonCombinableRules: [], tags: [],
    performance: 45, revenue: '€8,100',
    createdBy: 'Anna K.', createdAt: '2026-03-10T12:00:00Z', updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'promo-4', name: 'Free DrMax travel kit over €150', type: 'gift',
    value: '0', valueUnit: '%', steps: [], priority: 3, status: 'active',
    startDate: null, endDate: null, stackingGroupId: 'sg-default',
    conditions: [{ id: 'c5', field: 'subtotal', mode: 'include', values: ['150'], operator: '>=' }],
    gifts: [{ id: 'g1', sku: 'DM-TRAVEL-KIT', quantity: 1, price: 0 }],
    nonCombinableRules: [{ type: 'rule', id: 'promo-2' }], tags: ['tag-2'],
    performance: 78, revenue: '€18,900',
    createdBy: 'Lukas J.', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'promo-5', name: 'Summer Sun Protection Campaign', type: 'discount',
    value: '25', valueUnit: '%', steps: [], priority: 5, status: 'scheduled',
    startDate: '2026-06-01', endDate: '2026-08-31', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c6', field: 'categories', mode: 'include', values: ['Sun Care'] }],
    gifts: [], nonCombinableRules: [], processingOrder: 1, tags: ['tag-3'],
    createdBy: 'Lukas J.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-6', name: 'DrMax Loyalty Club — 10% off', type: 'discount',
    value: '10', valueUnit: '%', steps: [], priority: 8, status: 'paused',
    startDate: null, endDate: null, stackingGroupId: 'sg-2',
    conditions: [], gifts: [], nonCombinableRules: [], processingOrder: 2, tags: ['tag-2'],
    performance: 35, revenue: '€4,200',
    createdBy: 'Martin P.', createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-7', name: 'Valentine\'s Day — La Roche-Posay', type: 'discount',
    value: '15', valueUnit: '%', steps: [], priority: 6, status: 'ended',
    startDate: '2026-02-10', endDate: '2026-02-16', stackingGroupId: 'sg-1',
    conditions: [{ id: 'c7', field: 'brands', mode: 'include', values: ['La Roche-Posay'] }],
    gifts: [], nonCombinableRules: [], tags: ['tag-1', 'tag-3'],
    performance: 91, revenue: '€31,700',
    createdBy: 'Anna K.', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-16T23:59:00Z',
  },
]

export const stackingGroups = [
  { id: 'sg-1', name: 'Flash Sales', description: 'All flash sale promotions', color: '#EF4444', priority: 10, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-2', name: 'Loyalty', description: 'Loyalty program discounts', color: '#10B981', priority: 20, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-default', name: 'Unassigned', description: 'Rules with no stacking group', color: '#6B7280', priority: 999, isDefault: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
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
