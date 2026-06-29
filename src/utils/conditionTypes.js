// Shared condition type definitions and option lists — single source of truth
// used by ConditionsEditor, ConditionChip, ConditionPresetPickerDialog, and any
// other component that renders or describes conditions.

export const CONDITION_TYPES = [
  { value: 'categories',      title: 'Categories',      supportsMode: true,  quantifiable: false },
  { value: 'brands',          title: 'Brands',          supportsMode: true,  quantifiable: false },
  { value: 'skus',            title: 'SKUs',            supportsMode: true,  quantifiable: false },
  { value: 'product_lines',   title: 'Product lines',   supportsMode: true,  quantifiable: false },
  { value: 'subtotal',        title: 'Subtotal',        supportsMode: false, quantifiable: true  },
  { value: 'quantity',        title: 'Quantity',        supportsMode: false, quantifiable: true  },
  { value: 'weight',          title: 'Weight',          supportsMode: false, quantifiable: true  },
  { value: 'customer_group',  title: 'Customer group',  supportsMode: true,  quantifiable: false },
  { value: 'coupon_code',     title: 'Coupon code',     supportsMode: false, quantifiable: false },
  { value: 'exclude_on_sale', title: 'Exclude on sale', supportsMode: false, quantifiable: false, boolean: true },
  { value: 'attribute_set',   title: 'Attribute set',   supportsMode: true,  quantifiable: false },
  { value: 'warehouse_type',  title: 'Warehouse type',  supportsMode: true,  quantifiable: false },
  { value: 'seller',          title: 'Seller',          supportsMode: true,  quantifiable: false },
]

export const CONDITION_GROUPS = [
  { label: 'Threshold',         fields: ['subtotal', 'quantity', 'weight'] },
  { label: 'Product & Catalog', fields: ['categories', 'brands', 'skus', 'product_lines', 'exclude_on_sale'] },
  { label: 'Customer',          fields: ['customer_group', 'coupon_code'] },
  { label: 'Advanced',          fields: ['attribute_set', 'warehouse_type', 'seller'] },
]

export const TYPE_OPTIONS = {
  categories: [
    'Vitamins & Supplements', 'OTC Medications', 'Dermocosmetology', 'Face Care', 'Body Care',
    'Hair Care', 'Dental Care', 'Baby & Child Care', 'Diapers & Wipes', 'Medical Devices',
    'Weight Loss & Diet', 'Sport & Fitness', 'Sexual Health & Contraception',
    'Testing & Diagnostics', 'Eye Care', 'Foot Care', 'Sun Protection', 'Wound Care',
    'Homeopathy & Herbs', 'For Seniors', 'Allergy & Immunity', 'Pain Relief', 'Cold & Flu',
    'Digestive Health', 'Sleep & Relaxation',
  ],
  brands: [
    'Vichy', 'La Roche-Posay', 'Eucerin', 'Bioderma', 'Avène', 'Uriage', 'SVR', 'Ducray',
    'Lierac', 'CeraVe', 'Nuxe', 'Caudalie', 'Mustela', 'Weleda', 'Nivea', 'Garnier',
    "L'Oréal Paris", 'Neutrogena', 'Dove', 'Palmolive', 'Sensodyne', 'Elmex', 'Colgate',
    'Parodontax', 'Nurofen', 'Panadol', 'Paralen', 'Ibalgin', 'Strepsils', 'Septolete',
    'Imodium', 'Rennie', 'Espumisan', 'Centrum', 'Walmark', 'GS', 'Cemio', 'Jamieson',
    'Pampers', 'Huggies', 'Chicco', 'Canpol', 'Omron', 'Microlife', 'Beurer',
    'Head & Shoulders', 'Pantene', 'Syoss', 'Purity Vision', 'Aromatica', 'Alevia',
    'Hofigal', 'Fares', 'Dacia Plant', 'Aboca', 'Apteo', 'Dr. Max',
  ],
  product_lines: [
    'Dr. Max Basic', 'Dr. Max Premium', 'Dr. Max Baby', 'Dr. Max Dermo', 'Dr. Max Vitamins',
    'Dr. Max Ortho', 'Vichy Liftactiv', 'Vichy Mineral 89', 'La Roche-Posay Effaclar',
    'La Roche-Posay Toleriane', 'Eucerin Hyaluron-Filler', 'Eucerin DermoPure',
    'Bioderma Sensibio', 'Bioderma Sebium', 'Avène Tolerance', 'Nuxe Huile Prodigieuse',
  ],
  customer_group: ['Club Basic', 'Club Silver', 'Club Gold', 'Club Platinum', 'Healthcare Professional', 'Employee', 'Guest'],
  attribute_set: ['OTC Medicine', 'Prescription Medicine', 'Cosmetics', 'Medical Device', 'Supplement', 'Baby Product', 'Food Supplement', 'Veterinary'],
  warehouse_type: ['Central Warehouse', 'Pharmacy Dispatch', 'Dropship Supplier', 'Express Courier', 'Cold Chain'],
  seller: ['Dr. Max CZ', 'Dr. Max SK', 'Dr. Max PL', 'Dr. Max RO', 'Dr. Max IT', 'Third-party Seller'],
}

/** Lookup a type definition by field value. */
export function getConditionTypeDef(field) {
  return CONDITION_TYPES.find(t => t.value === field) ?? null
}

/** Map of field value → display label, for quick lookups without the full type object. */
export const FIELD_LABELS = Object.fromEntries(CONDITION_TYPES.map(t => [t.value, t.title]))
