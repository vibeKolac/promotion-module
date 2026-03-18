// server/data/seed.js
const promotions = [
  {
    id: 'promo-1',
    name: '20% off Nike over $100',
    type: 'discount',
    value: '20',
    valueUnit: '%',
    steps: [],
    priority: 10,
    status: 'active',
    startDate: null,
    endDate: null,
    stackingGroupId: null,
    conditions: [
      { id: 'c1', field: 'brands', mode: 'include', values: ['Nike'] },
      { id: 'c2', field: 'subtotal', mode: 'include', values: ['100'], operator: '>=' },
    ],
    gifts: [],
    createdAt: '2026-03-18T10:00:00Z',
    updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-2',
    name: 'Flash Sale — Electronics',
    type: 'discount',
    value: '30',
    valueUnit: '%',
    steps: [],
    priority: 5,
    status: 'active',
    startDate: '2026-03-15',
    endDate: '2026-03-20',
    stackingGroupId: 'sg-1',
    conditions: [
      { id: 'c3', field: 'categories', mode: 'include', values: ['Electronics'] },
    ],
    gifts: [],
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 'promo-3',
    name: 'Buy 3 Get 1 Free',
    type: 'multi_buy',
    value: '25',
    valueUnit: '%',
    steps: [],
    priority: 8,
    status: 'inactive',
    startDate: null,
    endDate: null,
    stackingGroupId: null,
    conditions: [
      { id: 'c4', field: 'quantity', mode: 'include', values: ['3'], operator: '>=' },
    ],
    gifts: [],
    createdAt: '2026-03-10T12:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'promo-4',
    name: 'Free gift with $200 order',
    type: 'gift',
    value: '0',
    valueUnit: '%',
    steps: [],
    priority: 3,
    status: 'active',
    startDate: null,
    endDate: null,
    stackingGroupId: null,
    conditions: [
      { id: 'c5', field: 'subtotal', mode: 'include', values: ['200'], operator: '>=' },
    ],
    gifts: [
      { id: 'g1', sku: 'GIFT-001', quantity: 1, price: 0 },
    ],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'promo-5', name: 'Summer Campaign', type: 'discount', value: '25', valueUnit: '%',
    steps: [], priority: 5, status: 'scheduled',
    startDate: '2026-06-01', endDate: '2026-08-31',
    stackingGroupId: 'sg-1', conditions: [], gifts: [],
    exclusive: false, processingOrder: 1,
    createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'promo-6', name: 'Loyalty Bonus (paused)', type: 'discount', value: '10', valueUnit: '%',
    steps: [], priority: 8, status: 'paused',
    startDate: null, endDate: null,
    stackingGroupId: 'sg-2', conditions: [], gifts: [],
    exclusive: false, processingOrder: 2,
    createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
]

const stackingGroups = [
  { id: 'sg-1', name: 'Flash Sales', description: 'All flash sale promotions', color: '#EF4444', priority: 10, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-2', name: 'Loyalty', description: 'Loyalty program discounts', color: '#10B981', priority: 20, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-default', name: 'Default', description: 'System default group', color: '#6B7280', priority: 999, isDefault: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

const templates = [
  {
    id: 'tpl-1',
    label: 'Flash Sale — Electronics',
    description: 'Time-limited discount on electronics',
    ruleType: 'discount',
    defaultValue: '30',
    defaultValueUnit: '%',
    defaultConditions: [
      { field: 'categories', mode: 'include', values: ['Electronics'] },
    ],
  },
  {
    id: 'tpl-2',
    label: 'Brand Discount',
    description: 'Percentage off a specific brand',
    ruleType: 'discount',
    defaultValue: '20',
    defaultValueUnit: '%',
    defaultConditions: [
      { field: 'brands', mode: 'include', values: ['Nike'] },
    ],
  },
  {
    id: 'tpl-3',
    label: 'Multi-buy Offer',
    description: 'Buy multiple items for a discount',
    ruleType: 'multi_buy',
    defaultValue: '10',
    defaultValueUnit: '%',
    defaultConditions: [
      { field: 'quantity', mode: 'include', values: ['3'], operator: '>=' },
    ],
  },
  {
    id: 'tpl-4',
    label: 'Free Gift',
    description: 'Gift item with minimum purchase',
    ruleType: 'gift',
    defaultValue: '0',
    defaultValueUnit: '%',
    defaultConditions: [
      { field: 'subtotal', mode: 'include', values: ['150'], operator: '>=' },
    ],
  },
]

module.exports = { promotions, stackingGroups, templates }
