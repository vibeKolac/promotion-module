# Promotions Vue — Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the AI assistant feature gap: rewrite the natural language parser to match the React prototype's full regex engine, upgrade SmartRulePreview with reach estimation and action flow, add giftMigration utility, and wire a proper "Edit & Complete" flow in the AI panel.

**Architecture:** The AI pipeline is: user text → `naturalLanguageParser.js` → `SmartRulePreview.vue` → store `applyParsedRule()` → PromotionForm. Phase 4 upgrades each step: parser gets full extraction, preview gets reach bar + two actions, a new giftMigration utility handles legacy data, and the panel navigates to the form on "Edit & Complete".

**Tech Stack:** Vue 3 (Composition API), Vuetify 3, Pinia, Vue Router 4, Vitest + Vue Test Utils + @pinia/testing

**Reference:** React prototype at `/Users/lukaspajma/tars/prototypes/promotions-prototype/src/app/components/NaturalLanguageParser.tsx` and `SmartRulePreview.tsx`

---

## File Map

```
src/
  utils/
    naturalLanguageParser.js     ← REWRITE: full regex engine (type, value, dates, conditions, name)
    giftMigration.js             ← NEW: migrateGiftData, serializeGiftData
  components/
    ai/
      SmartRulePreview.vue       ← UPGRADE: reach estimate bar, "Edit & Complete" action, field labels
      AiAssistantPanel.vue       ← MODIFY: wire @edit event → apply + navigate to form

tests/
  utils/naturalLanguageParser.test.js   ← REPLACE EXISTING FILE: 10 tests covering all extraction paths
  utils/giftMigration.test.js           ← NEW: 3 tests
  components/SmartRulePreview.test.js   ← NEW: 4 tests
```

---

## Task 1: Rewrite naturalLanguageParser.js

**Files:**
- Modify: `src/utils/naturalLanguageParser.js`
- Replace: `tests/utils/naturalLanguageParser.test.js` ← **this file already exists with 6 old tests; replace it entirely**

### Step 1: Replace existing test file

**IMPORTANT:** `tests/utils/naturalLanguageParser.test.js` already exists. The old tests use a different schema (subtotal condition uses `value` singular instead of `values[]`). Overwrite the entire file.

Replace `tests/utils/naturalLanguageParser.test.js` with:

```js
import { parseRuleFromNaturalLanguage } from '../../src/utils/naturalLanguageParser'
import { describe, it, expect } from 'vitest'

describe('parseRuleFromNaturalLanguage — type detection', () => {
  it('detects discount type from "20% off"', () => {
    const r = parseRuleFromNaturalLanguage('20% off electronics')
    expect(r.type).toBe('discount')
    expect(r.value).toBe('20')
    expect(r.valueUnit).toBe('%')
  })

  it('detects step_discount from "$10 off per $100 spent"', () => {
    const r = parseRuleFromNaturalLanguage('$10 off per $100 spent on electronics')
    expect(r.type).toBe('step_discount')
    expect(r.value).toBe('10')
    expect(r.stepValue).toBe('100')
  })

  it('detects multi_buy from "buy 2 get 1 free"', () => {
    const r = parseRuleFromNaturalLanguage('buy 2 get 1 free on Nike products')
    expect(r.type).toBe('multi_buy')
    expect(r.buyQty).toBe('2')
    expect(r.freeQty).toBe('1')
  })

  it('detects gift type from "free gift with purchase"', () => {
    const r = parseRuleFromNaturalLanguage('free gift with purchase over $100')
    expect(r.type).toBe('gift')
    expect(r.gifts).toBeDefined()
    expect(r.gifts.length).toBeGreaterThan(0)
  })
})

describe('parseRuleFromNaturalLanguage — condition extraction', () => {
  it('extracts brand condition from "20% off Nike over $100"', () => {
    const r = parseRuleFromNaturalLanguage('20% off Nike over $100')
    const brandCond = r.conditions.find(c => c.field === 'brands')
    expect(brandCond).toBeDefined()
    expect(brandCond.values).toContain('Nike')
  })

  it('extracts subtotal condition from "over $50"', () => {
    const r = parseRuleFromNaturalLanguage('20% off over $50')
    const sub = r.conditions.find(c => c.field === 'subtotal')
    expect(sub).toBeDefined()
    expect(sub.values[0]).toBe('50')
    expect(sub.operator).toBe('>=')
  })

  it('extracts category condition from "on clothing"', () => {
    const r = parseRuleFromNaturalLanguage('10% discount on clothing')
    const cat = r.conditions.find(c => c.field === 'categories')
    expect(cat).toBeDefined()
    expect(cat.values[0].toLowerCase()).toContain('clothing')
  })

  it('extracts exclude_on_sale condition', () => {
    const r = parseRuleFromNaturalLanguage('20% off excluding sale items')
    const exc = r.conditions.find(c => c.field === 'exclude_on_sale')
    expect(exc).toBeDefined()
    expect(exc.mode).toBe('exclude')
  })

  it('extracts customer_group condition', () => {
    const r = parseRuleFromNaturalLanguage('15% off for VIP customers')
    const cg = r.conditions.find(c => c.field === 'customer_group')
    expect(cg).toBeDefined()
    expect(cg.values[0]).toMatch(/VIP/i)
  })
})

describe('parseRuleFromNaturalLanguage — date extraction', () => {
  it('extracts date range from "next 7 days"', () => {
    const r = parseRuleFromNaturalLanguage('20% off for the next 7 days')
    expect(r.startDate).toBeDefined()
    expect(r.endDate).toBeDefined()
    // endDate should be ~7 days after startDate
    const diff = (new Date(r.endDate) - new Date(r.startDate)) / 86400000
    expect(diff).toBeCloseTo(7, 0)
  })
})

describe('parseRuleFromNaturalLanguage — confidence and name', () => {
  it('generates a rule name', () => {
    const r = parseRuleFromNaturalLanguage('20% off Nike over $100')
    expect(typeof r.name).toBe('string')
    expect(r.name.length).toBeGreaterThan(0)
  })

  it('confidence is higher when type+value+date all found', () => {
    const high = parseRuleFromNaturalLanguage('20% discount on clothing for next 30 days')
    const low = parseRuleFromNaturalLanguage('something something maybe discount')
    expect(high.confidence).toBeGreaterThan(low.confidence)
  })
})
```

### Step 2: Run to confirm failure

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npx vitest run tests/utils/naturalLanguageParser.test.js
```

Expected: most tests fail (step_discount, multi_buy, gift, dates, categories, exclude_on_sale not handled in current stub).

### Step 3: Rewrite naturalLanguageParser.js

Replace the entire file `src/utils/naturalLanguageParser.js`:

```js
// src/utils/naturalLanguageParser.js
// Full port of NaturalLanguageParser from the React prototype.

// ── Type detection ────────────────────────────────────────────────────────────

function extractPromotionType(input) {
  if (
    input.match(/step\s+discount|tiered|for\s+every|per\s+\$\d+|threshold/) ||
    input.match(/\$\d+\s+off\s+(per|for\s+every)\s+\$\d+/)
  ) return 'step_discount'

  if (
    input.match(/buy\s+\d+\s+get\s+\d+|multi[\s-]?buy|bogo|\d+\s+for\s+\d+/) ||
    input.match(/purchase\s+\d+.*get\s+\d+/)
  ) return 'multi_buy'

  if (
    input.match(/free\s+gift|gift\s+(with|promotion)|bonus\s+item|complimentary/) ||
    input.match(/receive.*gift|get.*free\s+\w+\s+(with|when)/)
  ) return 'gift'

  if (
    input.match(/\d+%\s+off|\d+\s+percent|discount/) ||
    input.match(/\$\d+\s+off(?!\s+(per|for\s+every))/)
  ) return 'discount'

  return null
}

// ── Value extraction ──────────────────────────────────────────────────────────

function extractValue(input, type) {
  const result = { value: null, valueUnit: '%' }

  if (type === 'discount') {
    const pct = input.match(/(\d+)\s*%|(\d+)\s+percent/)
    if (pct) { result.value = pct[1] || pct[2]; return result }
    const fixed = input.match(/\$(\d+)\s*(off|discount)/)
    if (fixed) { result.value = fixed[1]; result.valueUnit = 'fixed'; return result }
  }

  if (type === 'step_discount') {
    const step = input.match(/\$(\d+)\s+off\s+(for\s+every|per)\s+\$(\d+)/)
    if (step) {
      result.value = step[1]; result.stepValue = step[3]
      result.stepType = 'SPENT'; return result
    }
    const pctStep = input.match(/(\d+)%\s+off\s+(for\s+every|per)\s+\$(\d+)/)
    if (pctStep) {
      result.value = pctStep[1]; result.stepValue = pctStep[3]
      result.stepType = 'SPENT'; return result
    }
  }

  if (type === 'multi_buy') {
    // "buy 2 get 1 free" → bg[1]='2', bg[2]='1'
    // "3 for 2" → bg[3]='3' (total items), bg[4]='2' (items paid for)
    const bg = input.match(/buy\s+(\d+)\s+get\s+(\d+)|(\d+)\s+for\s+(\d+)/)
    if (bg) {
      const buyQty = bg[1] || bg[3]
      const freeQty = bg[2] || (parseInt(bg[3]) - parseInt(bg[4])).toString()
      result.buyQty = buyQty; result.freeQty = freeQty
      result.value = `${buyQty} for ${parseInt(buyQty) - parseInt(freeQty)}`
      return result
    }
  }

  if (type === 'gift') {
    result.value = 'Free Gift'
    result.gifts = [{ id: 'gift-0', sku: 'GIFT-001', quantity: '1', price: '0.01' }]
    const giftPat = /(?:gift|item)s?\s*:?\s*([A-Z0-9\-,\s]+)/i
    const gm = input.match(giftPat)
    if (gm) {
      const skus = gm[1].split(',').map(s => s.trim()).filter(s => s.length > 0)
      if (skus.length) result.gifts = skus.map((sku, i) => ({ id: `gift-${i}`, sku, quantity: '1', price: '0.01' }))
    }
    return result
  }

  return result
}

// ── Date extraction ───────────────────────────────────────────────────────────

function extractDateRange(input) {
  const today = new Date()
  let start = new Date(today)
  let end = new Date(today)

  // Absolute range: "2024-01-01 to 2024-01-31"
  const iso = input.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
  if (iso) return { startDate: iso[1], endDate: iso[2] }

  // Relative ranges
  const days = input.match(/(?:next|for)?\s*(\d+)\s+days?/)
  if (days) { end = new Date(today); end.setDate(end.getDate() + parseInt(days[1])) }

  const weeks = input.match(/(\d+)\s+weeks?/)
  if (weeks) { end = new Date(today); end.setDate(end.getDate() + parseInt(weeks[1]) * 7) }
  else if (input.includes('week') && !days) { end = new Date(today); end.setDate(end.getDate() + 7) }

  const months = input.match(/(\d+)\s+months?/)
  if (months) { end = new Date(today); end.setMonth(end.getMonth() + parseInt(months[1])) }
  else if (input.includes('month') && !days && !weeks) { end = new Date(today); end.setMonth(end.getMonth() + 1) }

  if (input.match(/tomorrow/)) { start = new Date(today); start.setDate(start.getDate() + 1) }

  // Default 30 days if no duration keyword found — this is intentional.
  // The parser always returns a date range (matching React prototype behaviour).
  // 'validity period' is therefore never added to missingFields; the default is a sensible starting point.
  if (end.getTime() === today.getTime()) { end = new Date(today); end.setDate(end.getDate() + 30) }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

// ── Condition extraction ──────────────────────────────────────────────────────

function extractConditions(originalInput, lowerInput) {
  const conditions = []
  const hasExclusion = !!lowerInput.match(/exclud(?:e|ing)|except|not\s+(?:on|for)|without/)

  // Categories
  const catPatterns = [
    /categor(?:y|ies):\s*([^.,;]+)/i,
    /on\s+(electronics|clothing|accessories|beauty|skincare|footwear|sports|toys|books|home|furniture|appliances)(?:\s+categor(?:y|ies))?/i,
    /for\s+(electronics|clothing|accessories|beauty|skincare|footwear|sports|toys|books|home|furniture|appliances)(?:\s+categor(?:y|ies))?/i,
    /in\s+(electronics|clothing|accessories|beauty|skincare|footwear|sports|toys|books|home|furniture|appliances)/i,
  ]
  for (const pat of catPatterns) {
    const m = originalInput.match(pat)
    if (m) {
      const cats = m[1].split(/,|\s+and\s+|\s+&\s+/)
        .map(c => c.trim())
        .filter(c => c && !/categor|section/i.test(c))
      if (cats.length) {
        conditions.push({ field: 'categories', mode: hasExclusion ? 'exclude' : 'include', values: cats })
        break
      }
    }
  }

  // Brands (capitalized words not already matched as categories)
  if (!conditions.some(c => c.field === 'categories')) {
    const brandPatterns = [
      /brands?:\s*([^.,;]+)/i,
      /on\s+([A-Z][a-zA-Z0-9]+(?:\s+and\s+[A-Z][a-zA-Z0-9]+)*)\s+(?:products?|items?)?/,
      /for\s+([A-Z][a-zA-Z0-9]+(?:\s+and\s+[A-Z][a-zA-Z0-9]+)*)\s+(?:brand|products?)?/,
    ]
    for (const pat of brandPatterns) {
      const m = originalInput.match(pat)
      if (m) {
        const brands = m[1].split(/,|\s+and\s+/)
          .map(b => b.trim())
          .filter(b => b && /^[A-Z]/.test(b) && !/brand|product|item|discount|off|free/i.test(b))
        if (brands.length) {
          conditions.push({ field: 'brands', mode: hasExclusion ? 'exclude' : 'include', values: brands })
          break
        }
      }
    }
  }

  // SKUs
  const skuM = originalInput.match(/skus?:\s*([^.,;]+)/i)
  if (skuM) {
    conditions.push({
      field: 'skus', mode: 'include',
      values: skuM[1].split(/,|\s+and\s+/).map(s => s.trim()).filter(Boolean),
    })
  }

  // Product lines
  const plM = originalInput.match(/product\s+lines?:\s*([^.,;]+)/i)
  if (plM) {
    conditions.push({
      field: 'product_lines', mode: 'include',
      values: plM[1].split(/,|\s+and\s+/).map(s => s.trim()).filter(Boolean),
    })
  }

  // Subtotal / minimum purchase
  const subtotalPatterns = [
    /minimum\s+(?:purchase|order|spend|subtotal|of|cart)?\s*(?:of)?\s*€?\$?(\d+)/i,
    /subtotal\s*>=?\s*€?\$?(\d+)/i,
    /over\s+€?\$?(\d+)/i,
    /when\s+you\s+spend\s+€?\$?(\d+)/i,
    /purchase\s+(?:over|above)\s+€?\$?(\d+)/i,
  ]
  for (const pat of subtotalPatterns) {
    const m = originalInput.match(pat)
    if (m) { conditions.push({ field: 'subtotal', mode: 'include', values: [m[1]], operator: '>=' }); break }
  }

  // Quantity
  const qtyM = originalInput.match(/(?:minimum|min|at\s+least)\s+(\d+)\s+items?|quantity\s*>=?\s*(\d+)/i)
  if (qtyM) conditions.push({ field: 'quantity', mode: 'include', values: [qtyM[1] || qtyM[2]], operator: '>=' })

  // Exclude on sale
  if (lowerInput.match(/exclud|except/) && lowerInput.match(/sale|clearance|on\s+sale/)) {
    conditions.push({ field: 'exclude_on_sale', mode: 'exclude', values: ['true'] })
  }

  // Customer group
  const cgM = originalInput.match(/for\s+(VIP|premium|new|existing|loyal|members?)\s+customers?/i)
  if (cgM) conditions.push({ field: 'customer_group', mode: 'include', values: [cgM[1]] })

  return conditions
}

// ── Name generation ───────────────────────────────────────────────────────────

function generateRuleName(parsed, originalInput) {
  const quoted = originalInput.match(/["']([^"']+)["']/)
  if (quoted) return quoted[1]

  const conditionNames = []
  if (parsed.conditions) {
    for (const c of parsed.conditions) {
      if ((c.field === 'categories' || c.field === 'brands') && c.values.length > 0) {
        conditionNames.push(c.values[0])
      }
    }
  }

  let name = ''
  const t = parsed.type
  if (t === 'discount') name = `${parsed.value || ''}% Off`
  else if (t === 'step_discount') name = `$${parsed.value} Off per $${parsed.stepValue}`
  else if (t === 'multi_buy') name = `Buy ${parsed.buyQty} Get ${parsed.freeQty} Free`
  else if (t === 'gift') name = 'Free Gift Promotion'
  else name = 'New Promotion'

  if (conditionNames.length > 0) name += ` — ${conditionNames.join(', ')}`
  return name
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Parse natural language rule descriptions into structured promotion objects.
 * @param {string} input - e.g. "20% off Nike sneakers over €100 for the next 7 days"
 * @returns {object} ParsedRuleData: { type, value, valueUnit, conditions, confidence, missingFields, name, startDate?, endDate?, stepValue?, buyQty?, freeQty?, gifts? }
 */
export function parseRuleFromNaturalLanguage(input) {
  const lowerInput = input.toLowerCase()
  const result = { confidence: 0, missingFields: [] }

  // 1. Type
  const type = extractPromotionType(lowerInput)
  if (type) { result.type = type; result.confidence += 0.25 }
  else { result.type = 'discount'; result.missingFields.push('promotion type') }

  // 2. Value — pass original input (not lowercased) so gift SKU detection preserves case
  const valueInfo = extractValue(input, result.type)
  if (valueInfo.value) { Object.assign(result, valueInfo); result.confidence += 0.25 }
  else { result.missingFields.push('discount value') }
  if (!result.valueUnit) result.valueUnit = '%'

  // 3. Dates
  const dates = extractDateRange(lowerInput)
  if (dates.startDate && dates.endDate) {
    result.startDate = dates.startDate; result.endDate = dates.endDate
    result.confidence += 0.25
  } else {
    result.missingFields.push('validity period')
  }

  // 4. Conditions
  const conditions = extractConditions(input, lowerInput)
  result.conditions = conditions
  if (conditions.length > 0) result.confidence += 0.15

  // 5. Name
  result.name = generateRuleName(result, input)

  return result
}
```

### Step 4: Run tests

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npx vitest run tests/utils/naturalLanguageParser.test.js
```

Expected: all 10 pass.

### Step 5: Run full suite

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npm test
```

Expected: all tests pass (93 + 10 = 103 total).

### Step 6: Commit

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && git add src/utils/naturalLanguageParser.js tests/utils/naturalLanguageParser.test.js && git commit -m "feat: rewrite naturalLanguageParser with full regex engine (type, value, dates, conditions, name)"
```

---

## Task 2: Upgrade SmartRulePreview.vue

**Files:**
- Modify: `src/components/ai/SmartRulePreview.vue`
- Create: `tests/components/SmartRulePreview.test.js`

The current component shows type, value, conditions chips, and two buttons. Add:
- Reach estimate bar (computed from conditions, same algorithm as React)
- Better condition labels (field name → human label)
- Missing fields alert with count
- "Create Rule" button (for high-confidence results) vs "Edit & Complete" (always shown)
- New `edit` emit so the parent can handle navigation

### Step 1: Write failing tests

Create `tests/components/SmartRulePreview.test.js`:

```js
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import SmartRulePreview from '../../src/components/ai/SmartRulePreview.vue'

const vuetify = createVuetify({ components, directives })

const mountPreview = (parsed) =>
  mount(SmartRulePreview, {
    props: { parsed },
    global: { plugins: [vuetify] },
  })

describe('SmartRulePreview', () => {
  it('shows reach estimate bar', () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }],
      confidence: 0.9, missingFields: [],
    })
    expect(w.text()).toMatch(/reach|Reach/)
  })

  it('shows Edit & Complete button always', () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [], confidence: 0.5, missingFields: [],
    })
    expect(w.text()).toContain('Edit')
  })

  it('shows missing fields warning when present', () => {
    const w = mountPreview({
      type: 'discount', value: null, valueUnit: '%',
      conditions: [], confidence: 0.25, missingFields: ['discount value', 'validity period'],
    })
    expect(w.text()).toMatch(/Couldn't extract|missing/i)
  })

  it('emits edit when Edit & Complete clicked', async () => {
    const w = mountPreview({
      type: 'discount', value: '20', valueUnit: '%',
      conditions: [], confidence: 0.9, missingFields: [],
    })
    const editBtn = w.findAll('button').find(b => b.text().includes('Edit'))
    await editBtn.trigger('click')
    expect(w.emitted('edit')).toBeTruthy()
  })
})
```

### Step 2: Run to confirm failure

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npx vitest run tests/components/SmartRulePreview.test.js
```

### Step 3: Rewrite SmartRulePreview.vue

Replace `src/components/ai/SmartRulePreview.vue`:

```vue
<!-- src/components/ai/SmartRulePreview.vue -->
<template>
  <v-card border elevation="0" class="pa-4" color="success" variant="tonal">
    <!-- Header: rule name + confidence -->
    <div class="d-flex align-center mb-3 gap-2">
      <v-icon icon="mdi-check-circle" color="success" size="18" />
      <span class="text-body-2 font-weight-bold flex-grow-1">Rule extracted from your request</span>
      <v-chip :color="confidenceColor" variant="tonal" size="x-small" label>
        {{ confidenceLabel }} ({{ Math.round(parsed.confidence * 100) }}%)
      </v-chip>
    </div>

    <!-- Rule details -->
    <div class="d-flex flex-wrap gap-4 mb-3">
      <div v-if="parsed.type">
        <div class="text-caption text-medium-emphasis">TYPE</div>
        <v-chip color="primary" variant="tonal" size="x-small" label class="mt-1">
          {{ typeLabel }}
        </v-chip>
      </div>
      <div v-if="parsed.value">
        <div class="text-caption text-medium-emphasis">VALUE</div>
        <div class="text-body-2 font-weight-medium mt-1">{{ valueDisplay }}</div>
      </div>
      <div v-if="parsed.startDate && parsed.endDate">
        <div class="text-caption text-medium-emphasis">VALID</div>
        <div class="text-body-2 mt-1">{{ parsed.startDate }} → {{ parsed.endDate }}</div>
      </div>
    </div>

    <!-- Conditions -->
    <div v-if="parsed.conditions?.length" class="mb-3 pa-3 rounded border" style="background: rgba(255,255,255,0.7)">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-caption font-weight-bold">
          TARGETING CONDITIONS ({{ parsed.conditions.length }})
        </div>
        <v-chip size="x-small" variant="outlined">AND logic</v-chip>
      </div>
      <div class="d-flex flex-wrap gap-1 mb-3">
        <v-chip
          v-for="(c, i) in parsed.conditions"
          :key="i"
          :color="c.mode === 'include' ? 'success' : 'error'"
          variant="tonal"
          size="x-small"
          label
        >
          {{ c.mode === 'include' ? '✓' : '✕' }} {{ formatConditionLabel(c) }}
        </v-chip>
      </div>

      <!-- Reach estimate -->
      <div class="text-caption text-medium-emphasis mb-1">
        Estimated reach: <strong :class="reach.color">{{ reach.label }} (~{{ reach.percentage }}%)</strong>
      </div>
      <v-progress-linear
        :model-value="reach.percentage"
        :color="reach.progressColor"
        rounded
        height="6"
        bg-color="grey-lighten-3"
      />
    </div>

    <div v-else class="mb-3 pa-3 rounded bg-blue-lighten-5 border">
      <div class="text-caption text-medium-emphasis">
        No conditions detected — this rule will apply to all products and customers.
        Use "Edit & Complete" to add targeting.
      </div>
    </div>

    <!-- Missing fields -->
    <v-alert
      v-if="parsed.missingFields?.length"
      type="warning"
      variant="tonal"
      density="compact"
      icon="mdi-alert"
      class="mb-3"
    >
      Couldn't extract: {{ parsed.missingFields.join(', ') }} — use "Edit & Complete" to fill in.
    </v-alert>

    <!-- Actions -->
    <div class="d-flex gap-2 align-center">
      <v-btn
        v-if="parsed.confidence >= 0.75 && !parsed.missingFields?.length"
        color="success"
        variant="flat"
        size="small"
        @click="$emit('apply')"
      >
        <v-icon icon="mdi-check" class="mr-1" />
        Create Rule
      </v-btn>
      <v-btn
        color="primary"
        :variant="parsed.confidence >= 0.75 && !parsed.missingFields?.length ? 'outlined' : 'flat'"
        size="small"
        @click="$emit('edit')"
      >
        <v-icon icon="mdi-pencil" class="mr-1" />
        Edit &amp; Complete
      </v-btn>
      <v-btn variant="text" size="small" class="ml-auto" @click="$emit('dismiss')">
        Dismiss
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ parsed: { type: Object, required: true } })
defineEmits(['apply', 'edit', 'dismiss'])

const TYPE_LABELS = {
  discount: 'Discount', step_discount: 'Step Discount',
  multi_buy: 'Multi-Buy', gift: 'Gift Promotion',
}

const FIELD_LABELS = {
  categories: 'Categories', skus: 'SKUs', brands: 'Brands',
  product_lines: 'Product lines', coupon_code: 'Coupon code',
  customer_group: 'Customer group', pim_status: 'PIM status',
  attribute_set: 'Attribute set', source: 'Source',
  warehouse_type: 'Warehouse type', seller: 'Seller',
  exclude_on_sale: 'Excl. on sale', quantity: 'Quantity',
  subtotal: 'Subtotal', weight: 'Weight',
}

const OP_LABELS = { '>=': '≥', '>': '>', '<=': '≤', '<': '<' }

const typeLabel = computed(() => TYPE_LABELS[props.parsed.type] ?? props.parsed.type)

const valueDisplay = computed(() => {
  const p = props.parsed
  if (p.type === 'step_discount') return `€${p.value} off per €${p.stepValue}`
  if (p.type === 'multi_buy') return `Buy ${p.buyQty} Get ${p.freeQty} Free`
  if (p.type === 'gift') return p.value
  return `${p.value}${p.valueUnit === '%' ? '%' : ' (fixed)'}`
})

const confidenceLabel = computed(() => {
  const c = props.parsed.confidence
  if (c >= 0.8) return 'High confidence'
  if (c >= 0.5) return 'Medium confidence'
  return 'Low confidence'
})

const confidenceColor = computed(() => {
  const c = props.parsed.confidence
  return c >= 0.8 ? 'success' : c >= 0.5 ? 'warning' : 'error'
})

function formatConditionLabel(c) {
  const label = FIELD_LABELS[c.field] ?? c.field
  if (c.field === 'exclude_on_sale') return 'Exclude on sale'
  if (c.operator) return `${label} ${OP_LABELS[c.operator] ?? c.operator} ${c.values[0]}`
  const vals = c.values.length <= 2 ? c.values.join(', ') : `${c.values[0]} +${c.values.length - 1}`
  return `${label}: ${vals}`
}

// Reach estimate — mirrors React's SmartRulePreview logic
const reach = computed(() => {
  let score = 100
  const conds = props.parsed.conditions ?? []
  for (const c of conds) {
    if (c.field === 'categories') score -= 40
    else if (c.field === 'brands') score -= 30
    else if (c.field === 'skus') score -= 50
    else if (c.field === 'subtotal') {
      const v = parseFloat(c.values[0])
      score -= v > 1000 ? 40 : v > 500 ? 25 : 15
    } else if (c.field === 'quantity') {
      const v = parseFloat(c.values[0])
      score -= v > 10 ? 35 : v > 5 ? 20 : 10
    } else if (c.field === 'customer_group') score -= 30
    else if (c.field === 'exclude_on_sale' || c.mode === 'exclude') score -= 15
  }
  score = Math.max(5, Math.min(100, score))

  if (score < 30) return { percentage: score, label: 'Narrow', color: 'text-error', progressColor: 'error' }
  if (score < 60) return { percentage: score, label: 'Moderate', color: 'text-warning', progressColor: 'warning' }
  return { percentage: score, label: 'Broad', color: 'text-success', progressColor: 'success' }
})
</script>
```

### Step 4: Wire the new `edit` emit in AiAssistantPanel.vue

Read `src/components/ai/AiAssistantPanel.vue` first. Find the `SmartRulePreview` usage (line ~52) and add the `@edit` handler. Also add `useRouter` import.

**Add to `<script setup>`:**
```js
import { useRouter } from 'vue-router'
const router = useRouter()

function editParsedRule() {
  uiStore.applyPendingRule()          // fills formDraft
  router.push('/promotions/new')       // opens the form
}
```

**Update the SmartRulePreview in template** to add `@edit`:
```vue
<SmartRulePreview
  v-if="msg.parsedRule && uiStore.pendingParsedRule === msg.parsedRule"
  :parsed="msg.parsedRule"
  class="mt-2 mr-8"
  @apply="uiStore.applyPendingRule()"
  @edit="editParsedRule()"
  @dismiss="uiStore.clearPendingRule()"
/>
```

**Note:** `applyPendingRule()` currently calls `closeAiPanel()` at the end. The `edit` flow also needs to close the panel. Read the ui store's `applyPendingRule` — it already calls `closeAiPanel()`. So `editParsedRule()` calling `uiStore.applyPendingRule()` will fill the draft AND close the panel, then `router.push` navigates. This is correct.

### Step 5: Run tests

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npm test
```

Expected: all tests pass including the 4 new SmartRulePreview tests.

### Step 6: Commit

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && git add src/components/ai/SmartRulePreview.vue src/components/ai/AiAssistantPanel.vue tests/components/SmartRulePreview.test.js && git commit -m "feat: upgrade SmartRulePreview with reach estimate, Edit & Complete action, field labels"
```

---

## Task 3: giftMigration Utility

**Files:**
- Create: `src/utils/giftMigration.js`
- Create: `tests/utils/giftMigration.test.js`

Migrates legacy single-gift format (`giftSku`, `giftQty`, `giftPrice`) to the new `gifts[]` array format used by `GiftItemsSection.vue`. Needed when loading old rules from the API that predate the multi-gift model.

### Step 1: Write failing tests

Create `tests/utils/giftMigration.test.js`:

```js
import { migrateGiftData, serializeGiftData } from '../../src/utils/giftMigration'
import { describe, it, expect } from 'vitest'

describe('migrateGiftData', () => {
  it('leaves non-gift rules unchanged', () => {
    const rule = { id: 'r1', type: 'discount', value: '20' }
    expect(migrateGiftData(rule)).toEqual(rule)
  })

  it('migrates legacy single-gift fields to gifts array', () => {
    const rule = { id: 'r1', type: 'gift', giftSku: 'SKU-001', giftQty: '2', giftPrice: '0.01', gifts: [] }
    const migrated = migrateGiftData(rule)
    expect(migrated.gifts).toHaveLength(1)
    expect(migrated.gifts[0].sku).toBe('SKU-001')
    expect(migrated.gifts[0].quantity).toBe(2)
  })

  it('leaves rules with existing gifts array untouched', () => {
    const rule = {
      id: 'r1', type: 'gift', giftSku: 'SKU-001',
      gifts: [{ id: 'g1', sku: 'SKU-002', quantity: 1, price: 0.01 }],
    }
    const migrated = migrateGiftData(rule)
    expect(migrated.gifts[0].sku).toBe('SKU-002') // not overwritten
  })
})

describe('serializeGiftData', () => {
  it('copies first gift to legacy fields for API backward compatibility', () => {
    const formData = { type: 'gift', gifts: [{ id: 'g1', sku: 'TOTE-001', quantity: 2, price: 0.01 }] }
    const serialized = serializeGiftData(formData)
    expect(serialized.giftSku).toBe('TOTE-001')
    expect(serialized.giftQty).toBe('2')
    expect(serialized.gifts).toHaveLength(1) // original array preserved
  })
})
```

### Step 2: Run to confirm failure

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npx vitest run tests/utils/giftMigration.test.js
```

### Step 3: Create giftMigration.js

Create `src/utils/giftMigration.js`:

```js
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
```

### Step 4: Run tests

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npx vitest run tests/utils/giftMigration.test.js
```

Expected: 3 pass.

### Step 5: Run full suite

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npm test
```

Expected: all tests pass.

### Step 6: Commit

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && git add src/utils/giftMigration.js tests/utils/giftMigration.test.js && git commit -m "feat: add giftMigration utility for legacy single-gift → gifts[] migration"
```

---

## Task 4: Final Smoke Test + Push

**Files:** None new.

### Step 1: Run full test suite

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npm test
```

Expected: all tests pass (93 baseline + 10 + 4 + 3 = ~110 total).

### Step 2: Verify AI assistant end-to-end manually

Start the dev server (`npm run dev` in one terminal, `node server/index.js` in another) and test:
1. Open AI Assistant panel from PromotionForm banner
2. Type: `20% off Nike sneakers over €100 for the next 7 days`
3. SmartRulePreview should show: type=Discount, value=20%, brands=[Nike], subtotal≥100, date range, reach bar
4. Click "Edit & Complete" → should navigate to /promotions/new with form pre-filled
5. Click "Create Rule" → should create the rule and navigate to list

### Step 3: Push to remote

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && git push origin main
```

### Step 4: Done

Phase 4 complete. The AI assistant now parses natural language with the same fidelity as the React prototype.
