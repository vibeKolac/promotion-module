# AI Wizard Mode — Design Spec

**Date:** 2026-03-19
**Phase:** 5
**Status:** Approved

---

## Goal

Add a guided "Wizard" mode to `AiAssistantPanel.vue` that walks users through promotion rule creation step-by-step using quick-action chips, as an alternative to free-text natural language input.

---

## Architecture

### New file
- `src/components/ai/WizardPanel.vue` — self-contained wizard UI (progress bar, step content, confirmation card)

### Modified files
- `src/stores/ui.js` — add wizard state fields + 7 actions (including `applyWizardDraft`)
- `src/components/ai/AiAssistantPanel.vue` — "Guide me" button in header; renders `<WizardPanel>` in a `v-expand-transition` above the chat input

### New test files
- `tests/components/WizardPanel.test.js` — 6 tests
- Extend `tests/stores/ui.test.js` — 7 new wizard action tests
- Extend `tests/components/AiAssistantPanel.test.js` — 2 new tests

---

## State (uiStore additions)

```js
// State fields
wizardActive: false,
wizardCollapsed: false,
wizardMode: null,      // 'template' | 'custom'
wizardStep: 0,         // 0 = mode selector, 1–N = active steps
wizardData: {},        // accumulated: { type, duration, target, value, stepValue, name, startDate, endDate }

// Actions
startWizard(mode)
  // If mode is null: wizardActive=true, step=0 (show mode selector), wizardMode=null
  // If mode is 'custom': wizardActive=true, step=1, wizardMode='custom', wizardData={}
  // If mode is 'template': wizardActive=true, step=1, wizardMode='template', wizardData={}
  // Mode selector cards call startWizard('custom') or startWizard('template')

wizardNext(stepId, value)
  // wizardData[stepId] = value; wizardStep++

wizardBack()
  // wizardStep > 1 → wizardStep--; wizardStep === 1 → no-op

wizardGoToStep(n)
  // n < wizardStep → wizardStep = n; n >= wizardStep → no-op (no forward jumps)

wizardReset()
  // wizardActive=false, wizardMode=null, wizardStep=0, wizardData={}, wizardCollapsed=false

toggleWizardCollapsed()
  // wizardCollapsed = !wizardCollapsed

applyWizardDraft()
  // Maps wizardData → shape consumed by promotionsStore.applyParsedRule(), then calls it.
  // See "wizardData field mapping" section below.
  // Does NOT call wizardReset() — caller is responsible.
```

---

## wizardData Field Mapping

`applyWizardDraft()` in uiStore converts `wizardData` to the `parsed` shape consumed by `promotionsStore.applyParsedRule(parsed)`:

```js
function applyWizardDraft() {
  const d = wizardData.value
  const parsed = {}

  // type
  parsed.type = d.type ?? 'discount'

  // value + valueUnit
  if (d.type === 'multi_buy') {
    const [buyQty, freeQty] = (d.value ?? '2+1').split('+')
    parsed.buyQty = buyQty; parsed.freeQty = freeQty
    parsed.value = d.value
    parsed.valueUnit = '%'
  } else if (d.type === 'gift') {
    parsed.value = 'Free Gift'
    parsed.gifts = [{ id: 'gift-0', sku: d.value || 'GIFT-001', quantity: 1, price: 0.01 }]
  } else if (d.type === 'step_discount') {
    parsed.value = d.value
    parsed.stepValue = d.stepValue
    parsed.stepType = 'SPENT'
    parsed.valueUnit = 'fixed'
  } else {
    // discount
    const pct = String(d.value ?? '').replace('%', '')
    parsed.value = pct
    parsed.valueUnit = '%'
  }

  // dates — compute from duration string using calculateDatesFromDuration
  if (d.startDate && d.endDate) {
    parsed.startDate = d.startDate
    parsed.endDate = d.endDate
  } else if (d.duration) {
    const dates = calculateDatesFromDuration(d.duration)
    parsed.startDate = dates.startDate
    parsed.endDate = dates.endDate
  }

  // target → conditions[]
  if (!d.target || d.target === 'all') {
    parsed.conditions = []
  } else if (d.target.startsWith('brand:')) {
    const brandName = d.target.slice(6).trim()
    parsed.conditions = [{ field: 'brands', mode: 'include', values: [brandName] }]
  } else if (d.target.startsWith('subtotal:')) {
    const amount = d.target.slice(9).trim()
    parsed.conditions = [{ field: 'subtotal', mode: 'include', values: [amount], operator: '>=' }]
  } else {
    parsed.conditions = [{ field: 'categories', mode: 'include', values: [d.target] }]
  }

  // name
  parsed.name = d.name || null
  parsed.confidence = 1.0
  parsed.missingFields = []

  usePromotionsStore().applyParsedRule(parsed)
}
```

`calculateDatesFromDuration` is already implemented in `src/utils/wizardStateManager.js` (ported from React in Phase 5 — see Task 1 below).

**Limitation — `step_discount` and `multi_buy` via "Edit Details":** `formDraft` has no `stepValue` or `buyQty`/`freeQty` fields — it uses `steps[]` (tier array) for step_discount and `value` string for multi_buy. `applyParsedRule` does not populate these. For these two types, the "Edit Details" flow pre-fills `type`, `name`, `startDate`, `endDate`, and `conditions` correctly, but the value/tier fields require manual completion in PromotionForm. This is acceptable for a prototype — the form is pre-opened with the right type and targeting context.

Duration string values match the chip labels: `'day'`, `'weekend'`, `'week'`, `'two-weeks'`, `'month'`, `'season'`.

---

## Wizard Flows

### Entry point
A "Guide me" `v-btn` (outlined, small) in the `AiAssistantPanel` header. Clicking it calls `uiStore.startWizard(null)` → shows mode selector (step 0).

### Mode selector (step 0)
Two `v-card` side-by-side inside WizardPanel:
- **Start from template** → calls `startWizard('template')`
- **Build from scratch** → calls `startWizard('custom')`

---

### Custom flow — 5 steps

| Step | stepId | Label | UI | Options / Notes |
|---|---|---|---|---|
| 1 | `type` | Type | Chip grid | Discount, Step Discount, Multi-buy, Gift |
| 2 | `duration` | Duration | Chip grid | Today (`day`), Weekend (`weekend`), 1 week (`week`), 2 weeks (`two-weeks`), 1 month (`month`), 3 months (`season`) |
| 3 | `target` | Target | Chip grid + text | All Products (`all`), Electronics, Clothing, Health & Drugs, Skincare, Footwear; free-text input stores value as `brand:<text>` |
| 4 | `value` | Value | Chips **or** two text inputs | Discount: chips 10%/15%/20%/25%/30%/custom; Multi-buy: chips 2+1/3+1/3+2/custom; Gift: one text field (SKU); Step discount: two text fields — Amount off (`value`) + Threshold (`stepValue`) + Next button |
| 5 | — | Confirm | Summary card | "Create Promotion" + "Edit Details" |

Chip selection auto-advances. Free-text steps show an explicit "Next" button.

---

### Template flow — 3 steps

| Step | Label | UI |
|---|---|---|
| 1 | Select | Grid of 6 template cards sourced from `templatesStore.items` (fetched from `/api/templates`) |
| 2 | Customize | 1–2 quick-action chip sets for the template's customizable fields (table below) |
| 3 | Confirm | Same summary card as custom flow |

**Template customizable fields:**

| Template | Customizable fields | Step 2 chips |
|---|---|---|
| Weekend Flash Sale | `value` | 10% / 15% / 20% / 25% / 30% |
| Seasonal Sale | `value` | 10% / 15% / 20% / 30% / 50% |
| VIP Exclusive | `value` | 10% / 15% / 20% / 25% |
| Buy More Save More | `value` (discount per step) | 5% / 10% / 15% / 20% |
| Free Gift With Purchase | `target` (spend threshold) | free text input → stored as `brand:<text>` for threshold; actually stored as subtotal condition |
| Brand Discount | `target` (brand name) | free text input → stored as `brand:<text>` |

For template flow, selecting a template also pre-populates `wizardData` from the template's `defaultValue`, `defaultValueUnit`, `defaultConditions`, and `ruleType`. Step 2 overwrites only the customizable field(s). Step 3 shows the same confirm card.

**Note on Free Gift template:** The threshold is a subtotal condition. Store it as `wizardData.target = 'subtotal:' + amount`. In `applyWizardDraft`, handle `target.startsWith('subtotal:')` → `conditions = [{ field: 'subtotal', mode: 'include', values: [amount], operator: '>=' }]`.

---

## WizardPanel.vue Component Design

**No props** — reads all state from `uiStore` directly. Calls store actions internally. Emits nothing.

### Three visual zones

**Zone 1 — Header bar**
- "Guided Setup" title
- Current step label (e.g. "Step 2 of 5: Duration") — hidden at step 0
- Collapse toggle (`mdi-chevron-up/down`) → `uiStore.toggleWizardCollapsed()`
- Close button (`mdi-close`) → `uiStore.wizardReset()`

**Zone 2 — Progress bar** (hidden when collapsed or step === 0)
- `v-progress-linear` at `(wizardStep / totalSteps) * 100`
- Clickable step labels: completed steps call `uiStore.wizardGoToStep(n)`, future steps greyed/non-clickable

**Zone 3 — Step content** (hidden when collapsed, switches on `wizardStep` + `wizardMode`)
- **Step 0**: two `v-card` mode options
- **Chip steps**: `v-chip-group` with chip options; chip click calls `uiStore.wizardNext(stepId, value)` (auto-advance)
- **Text input steps**: `v-text-field` + "Next" `v-btn`
- **Confirm step**: `v-list` summary + two action buttons

### Confirm action handlers

```js
// "Create Promotion"
async function confirmCreate() {
  const payload = buildPayload()          // map wizardData to rule shape
  await promotionsStore.create(payload)
  promotionsStore.resetDraft()            // clear any stale formDraft
  uiStore.wizardReset()
  router.push('/promotions')
}

// "Edit Details"
function confirmEdit() {
  uiStore.applyWizardDraft()              // fills formDraft via applyParsedRule
  uiStore.wizardReset()
  router.push('/promotions/new')
}
```

`buildPayload()` uses the same mapping logic as `applyWizardDraft` but returns an object instead of applying it to the store.

---

## AiAssistantPanel.vue Changes

- Add "Guide me" `v-btn` in the panel header
- Render `<WizardPanel>` in `v-expand-transition` above the chat message list:
  ```vue
  <v-expand-transition>
    <WizardPanel v-if="uiStore.wizardActive" />
  </v-expand-transition>
  ```

---

## Testing

**`tests/stores/ui.test.js`** — 7 new wizard action tests:
1. `startWizard(null)` sets wizardActive=true, wizardStep=0, wizardMode=null
2. `startWizard('custom')` sets wizardActive=true, step=1, mode='custom'
3. `wizardNext('type', 'discount')` records data and increments step
4. `wizardBack()` decrements step; no-ops at step 1
5. `wizardGoToStep(2)` when current is step 4 → jumps to 2; ignores forward jump (step 5 → no-op)
6. `wizardReset()` clears all wizard state fields to defaults
7. `toggleWizardCollapsed()` flips false → true → false

**`tests/components/WizardPanel.test.js`** — 6 tests:
1. Renders mode selector (two cards) when wizardStep=0
2. Renders chip grid for Type step (custom flow, step=1)
3. Renders chip grid for Duration step (step=2)
4. Renders two text inputs for step_discount value step (type='step_discount', step=4)
5. Renders confirm card at final step (step=5 custom / step=3 template)
6. Clicking a chip calls `uiStore.wizardNext` with correct stepId and value

**`tests/components/AiAssistantPanel.test.js`** — 2 new tests:
1. "Guide me" button exists in panel header
2. Clicking "Guide me" calls `uiStore.startWizard(null)`

**Target:** 127 tests total (112 existing + 15 new)

---

## Explicitly Out of Scope

- No `WizardStateManager` class — Pinia handles all state (but `calculateDatesFromDuration` is ported as a standalone util)
- No `WizardStepContainer`, `WizardMessage`, `QuickActionButtons` as separate components — all inline in `WizardPanel.vue`
- No undo/history tracking beyond back navigation
- No floating/inline chat variants
- No server-side template fetching changes — templates come from existing `/api/templates` endpoint
