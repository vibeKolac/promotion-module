# Promotions Vue — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the feature gap between the React prototype and the Vue 3 refactor across five areas: data model completeness, form polish, cross-rule conflict detection, full Stacking Groups CRUD, bulk operations + CSV, and a Templates library page.

**Architecture:** All new features follow the existing pattern — Pinia store owns server communication, components are presentational. New utilities live in `src/utils/`. New pages get their own route. Each task is independently testable and committable. The React source at `/Users/lukaspajma/tars/prototypes/promotions-prototype/src/app` is the reference for business logic.

**Tech Stack:** Vue 3 (Composition API), Vuetify 3, Pinia, Vue Router 4, Vite, Express mock API, Vitest + Vue Test Utils + @pinia/testing

---

## File Map

```
src/
  utils/
    ruleConflictDetector.js       ← NEW: cross-rule conflict detection
  stores/
    promotions.js                 ← MODIFY: bulk update action, CSV import action
    stackingGroups.js             ← MODIFY: create/update/delete actions
    templates.js                  ← MODIFY: richer template data with categories
  components/
    shared/
      StatusBadge.vue             ← MODIFY: add scheduled/expired/paused
      ColorPicker.vue             ← NEW: hex color input with preview swatch
    promotions/
      PromotionForm.vue           ← MODIFY: validation, exclusive toggle,
                                            processingOrder, stepType, gift step fields
      PromotionsList.vue          ← MODIFY: conflict badges, bulk checkboxes,
                                            stacking group filter, CSV export btn
      ConflictBadge.vue           ← NEW: icon chip showing conflict count for a row
      BulkEditConditionsDialog.vue ← NEW: apply/replace conditions across selection
      CsvImportDialog.vue         ← NEW: file upload + preview + import
    stackingGroups/
      StackingGroupsPage.vue      ← NEW: full CRUD page
      StackingGroupDialog.vue     ← NEW: create/edit dialog (name, color, priority, desc)
    templates/
      TemplatesPage.vue           ← NEW: library with category tabs + card grid
      TemplateCard.vue            ← NEW: card showing template name, category, examples
  router/index.js                 ← MODIFY: add /stacking-groups and /templates routes

server/
  data/seed.js                   ← MODIFY: richer stacking groups (color, priority),
                                             add scheduled/paused rules
  routes/stackingGroups.js       ← MODIFY: add POST/PUT/DELETE handlers
  routes/templates.js            ← MODIFY: return richer template objects (category, examples)

tests/
  utils/ruleConflictDetector.test.js    ← NEW
  components/PromotionForm.test.js      ← MODIFY: new fields + validation
  components/StackingGroupsPage.test.js ← NEW
  components/TemplatesPage.test.js      ← NEW
  components/BulkEditConditionsDialog.test.js ← NEW
  components/CsvImportDialog.test.js    ← NEW
```

---

## Task 1: Data Model + Seed Expansion

**Files:**
- Modify: `server/data/seed.js`
- Modify: `server/routes/stackingGroups.js`
- Modify: `src/components/shared/StatusBadge.vue`

Expand the data model so all subsequent tasks have realistic test data.

- [ ] **Step 1: Expand seed stacking groups with color and priority**

Edit `server/data/seed.js` — replace the stackingGroups array:

```js
const stackingGroups = [
  { id: 'sg-1', name: 'Flash Sales', description: 'All flash sale promotions', color: '#EF4444', priority: 10, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-2', name: 'Loyalty', description: 'Loyalty program discounts', color: '#10B981', priority: 20, isDefault: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'sg-default', name: 'Default', description: 'System default group', color: '#6B7280', priority: 999, isDefault: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]
```

Also add two more promotions to seed — one `scheduled`, one `paused`:

```js
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
```

- [ ] **Step 2: Add PUT and replace DELETE in stackingGroups route**

The file uses a factory function `module.exports = (db) => { ... }`. Add `router.put` after the existing `router.post`, and replace the existing `router.delete` with the usage-guarded version:

```js
// server/routes/stackingGroups.js — full file replacement
const express = require('express')
const { v4: uuid } = require('uuid')
const router = express.Router()

module.exports = (db) => {
  router.get('/', (req, res) => res.json(db.stackingGroups))

  router.post('/', (req, res) => {
    const item = { id: uuid(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    db.stackingGroups.push(item)
    res.status(201).json(item)
  })

  router.put('/:id', (req, res) => {
    const idx = db.stackingGroups.findIndex(g => g.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    db.stackingGroups[idx] = { ...db.stackingGroups[idx], ...req.body, updatedAt: new Date().toISOString() }
    res.json(db.stackingGroups[idx])
  })

  router.delete('/:id', (req, res) => {
    const inUse = db.promotions.filter(p => p.stackingGroupId === req.params.id)
    if (inUse.length > 0) return res.status(409).json({ error: `${inUse.length} rule(s) are using this group` })
    db.stackingGroups = db.stackingGroups.filter(g => g.id !== req.params.id)
    res.status(204).end()
  })

  return router
}
```

- [ ] **Step 3: Update StatusBadge.vue**

Add `scheduled` (blue tonal), `paused` (orange tonal), `expired` (grey outlined):

```vue
<!-- src/components/shared/StatusBadge.vue -->
<template>
  <v-chip
    :color="config.color"
    :variant="config.variant"
    size="small"
    label
  >{{ config.label }}</v-chip>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ status: { type: String, required: true } })
const config = computed(() => ({
  active:    { color: 'success',  variant: 'tonal',    label: 'Active' },
  inactive:  { color: 'default',  variant: 'outlined', label: 'Inactive' },
  scheduled: { color: 'info',     variant: 'tonal',    label: 'Scheduled' },
  paused:    { color: 'warning',  variant: 'tonal',    label: 'Paused' },
  expired:   { color: 'default',  variant: 'outlined', label: 'Expired' },
}[props.status] ?? { color: 'default', variant: 'outlined', label: props.status }))
</script>
```

- [ ] **Step 4: Verify API returns new data**

```bash
curl http://localhost:3001/api/promotions | python3 -c "import json,sys; d=json.load(sys.stdin); [print(p['status']) for p in d]"
# expected: active active inactive active scheduled paused
curl http://localhost:3001/api/stacking-groups | python3 -c "import json,sys; d=json.load(sys.stdin); [print(g['name'], g['color']) for g in d]"
```

- [ ] **Step 5: Commit**

```bash
git add server/ src/components/shared/StatusBadge.vue
git commit -m "feat: expand data model — scheduled/paused statuses, stacking group CRUD routes, richer seed"
```

---

## Task 2: PromotionForm — Validation + Missing Fields

**Files:**
- Modify: `src/components/promotions/PromotionForm.vue`
- Modify: `tests/components/PromotionForm.test.js`

**New fields to add:**
- `exclusive` toggle — "This rule doesn't stack with any other rule"
- `processingOrder` number field (right column)
- `stepType` select (SPENT / QTY) — shown when `type === 'step_discount'`
- `giftStepType` select + `giftStepValue` text + `giftMaxSteps` text — shown when `type === 'gift'`
- Form validation: name required, value required (unless step_discount), show errors inline before save

- [ ] **Step 1: Expand emptyDraft in promotions store first**

New fields must exist on `formDraft` before the component renders them. In `src/stores/promotions.js`, update `emptyDraft()`:

```js
const emptyDraft = () => ({
  name: '', type: 'discount', value: '', valueUnit: '%',
  steps: [], priority: 10, status: 'active',
  startDate: null, endDate: null,
  stackingGroupId: null, conditions: [], gifts: [],
  exclusive: false,
  processingOrder: null,
  stepType: 'SPENT',
  giftStepType: 'SPENT', giftStepValue: '', giftMaxSteps: '',
})
```

- [ ] **Step 2: Write failing tests**

Add to `tests/components/PromotionForm.test.js`:

```js
it('shows validation errors when saving empty form', async () => {
  const w = mountForm()
  const store = w.vm.store
  store.formDraft.name = ''
  store.formDraft.value = ''
  await w.vm.$nextTick()
  await w.find('[data-testid="save-btn"]').trigger('click')
  await w.vm.$nextTick()
  expect(w.text()).toContain('Rule name is required')
})

it('shows stepType field for step_discount type', async () => {
  const w = mountForm()
  w.vm.store.formDraft.type = 'step_discount'
  await w.vm.$nextTick()
  expect(w.text()).toContain('Step type')
})

it('shows gift step fields for gift type', async () => {
  const w = mountForm()
  w.vm.store.formDraft.type = 'gift'
  await w.vm.$nextTick()
  expect(w.text()).toContain('Trigger type')
})

it('shows exclusive toggle', () => {
  const w = mountForm()
  expect(w.text()).toContain('Exclusive rule')
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npx vitest run tests/components/PromotionForm.test.js
# expected: 4 new tests fail
```

- [ ] **Step 4: Add validation state to PromotionForm.vue**

In `<script setup>`, add after existing refs:

```js
const validationErrors = ref({})

function validate() {
  const errors = {}
  if (!draft.name?.trim()) errors.name = 'Rule name is required'
  if (draft.type !== 'step_discount' && !draft.value) errors.value = 'Discount value is required'
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  // ... existing save logic
}
```

- [ ] **Step 5: Add `data-testid="save-btn"` and error messages to template**

On the Save button: `data-testid="save-btn"`

After the name field:
```vue
<div v-if="validationErrors.name" class="text-caption text-error mt-1">{{ validationErrors.name }}</div>
```

After the value field:
```vue
<div v-if="validationErrors.value" class="text-caption text-error mt-1">{{ validationErrors.value }}</div>
```

- [ ] **Step 6: Add new fields to PromotionForm template**

In the right column card (after the status switch card, before stacking group card), add a new card:

```vue
<v-card border elevation="0" class="pa-5 mb-4">
  <div class="text-body-1 font-weight-bold mb-4">Advanced</div>
  <div class="d-flex align-center justify-space-between mb-3">
    <div>
      <div class="text-body-2">Exclusive rule</div>
      <div class="text-caption text-medium-emphasis">Doesn't stack with any other rule</div>
    </div>
    <v-switch v-model="draft.exclusive" color="primary" hide-details density="compact" inset />
  </div>
  <v-text-field
    v-model.number="draft.processingOrder"
    label="Processing order"
    type="number"
    variant="outlined"
    density="compact"
    hint="Lower = evaluated first"
    persistent-hint
  />
</v-card>
```

In the step discount section, add stepType select before the StepDiscountEditor:

```vue
<v-select
  v-model="draft.stepType"
  :items="[{ value: 'SPENT', title: 'Amount spent (€)' }, { value: 'QTY', title: 'Quantity' }]"
  label="Step type"
  variant="outlined"
  density="compact"
  class="mb-3"
/>
```

In the gift section (inside `v-if="draft.type === 'gift'"`), add before GiftItemsSection:

```vue
<v-card border elevation="0" class="pa-4 mb-3">
  <div class="text-body-2 font-weight-bold mb-3">Gift trigger</div>
  <v-row dense>
    <v-col cols="5">
      <v-select
        v-model="draft.giftStepType"
        :items="[{ value: 'SPENT', title: 'Amount spent' }, { value: 'QTY', title: 'Quantity' }]"
        label="Trigger type"
        variant="outlined"
        density="compact"
      />
    </v-col>
    <v-col cols="4">
      <v-text-field
        v-model="draft.giftStepValue"
        label="Threshold"
        type="number"
        variant="outlined"
        density="compact"
      />
    </v-col>
    <v-col cols="3">
      <v-text-field
        v-model="draft.giftMaxSteps"
        label="Max gifts"
        type="number"
        variant="outlined"
        density="compact"
      />
    </v-col>
  </v-row>
</v-card>
```

- [ ] **Step 7: Run tests**

```bash
npx vitest run tests/components/PromotionForm.test.js
# expected: all tests pass
```

- [ ] **Step 8: Commit**

```bash
git add src/stores/promotions.js src/components/promotions/PromotionForm.vue tests/components/PromotionForm.test.js
git commit -m "feat: add form validation, exclusive toggle, processingOrder, stepType and gift step fields"
```

---

---

## Task 3: Cross-Rule Conflict Detection

**Files:**
- Create: `src/utils/ruleConflictDetector.js`
- Create: `tests/utils/ruleConflictDetector.test.js`
- Create: `src/components/promotions/ConflictBadge.vue`
- Modify: `src/components/promotions/PromotionsList.vue`

Detects date overlap + condition overlap between pairs of active/scheduled rules. Shows a badge on each affected row.

- [ ] **Step 1: Write failing tests**

```js
// tests/utils/ruleConflictDetector.test.js
import { detectConflicts, datesOverlap, conditionsOverlap } from '../../src/utils/ruleConflictDetector'

describe('datesOverlap', () => {
  it('returns true for overlapping ranges', () => {
    expect(datesOverlap('2026-01-01', '2026-03-31', '2026-03-01', '2026-06-30')).toBe(true)
  })
  it('returns false for non-overlapping ranges', () => {
    expect(datesOverlap('2026-01-01', '2026-02-28', '2026-03-01', '2026-06-30')).toBe(false)
  })
  it('returns true when either rule has no dates (open-ended)', () => {
    expect(datesOverlap(null, null, '2026-03-01', '2026-06-30')).toBe(true)
  })
})

describe('conditionsOverlap', () => {
  it('returns true when both target the same brand', () => {
    const c1 = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const c2 = [{ field: 'brands', mode: 'include', values: ['Nike', 'Adidas'] }]
    expect(conditionsOverlap(c1, c2)).toBe(true)
  })
  it('returns true when either has no conditions (applies to all)', () => {
    expect(conditionsOverlap([], [{ field: 'brands', mode: 'include', values: ['Nike'] }])).toBe(true)
  })
  it('returns false when conditions target different fields with no overlap', () => {
    const c1 = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const c2 = [{ field: 'brands', mode: 'include', values: ['Adidas'] }]
    expect(conditionsOverlap(c1, c2)).toBe(false)
  })
})

describe('detectConflicts', () => {
  it('returns empty map for empty rules', () => {
    expect(detectConflicts([]).size).toBe(0)
  })
  it('detects condition_overlap between two active rules with matching brands and overlapping dates', () => {
    const rules = [
      { id: 'r1', status: 'active', type: 'discount', priority: 10, startDate: '2026-01-01', endDate: '2026-12-31', conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
      { id: 'r2', status: 'active', type: 'discount', priority: 5,  startDate: '2026-06-01', endDate: '2026-12-31', conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
    ]
    const map = detectConflicts(rules)
    expect(map.get('r1')?.[0].type).toBe('condition_overlap')
    expect(map.get('r2')?.[0].type).toBe('condition_overlap')
  })
  it('does not flag paused rules against active rules', () => {
    // Two rules with identical conditions — but one is paused, so no conflict
    const rules = [
      { id: 'r1', name: 'R1', status: 'active',  type: 'discount', startDate: null, endDate: null, conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
      { id: 'r2', name: 'R2', status: 'paused',  type: 'discount', startDate: null, endDate: null, conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
      { id: 'r3', name: 'R3', status: 'inactive',type: 'discount', startDate: null, endDate: null, conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }] },
    ]
    expect(detectConflicts(rules).size).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run tests/utils/ruleConflictDetector.test.js
```

- [ ] **Step 3: Implement ruleConflictDetector.js**

```js
// src/utils/ruleConflictDetector.js

export function datesOverlap(start1, end1, start2, end2) {
  if (!start1 || !end1 || !start2 || !end2) return true // open-ended = always overlaps
  return new Date(start1) <= new Date(end2) && new Date(start2) <= new Date(end1)
}

export function conditionsOverlap(c1, c2) {
  if (!c1?.length || !c2?.length) return true // no conditions = applies to everything
  for (const a of c1) {
    if (a.mode !== 'include') continue
    for (const b of c2) {
      if (b.mode !== 'include' || b.field !== a.field) continue
      if (a.values.some(v => b.values.includes(v))) return true
    }
  }
  return false
}

export function detectConflicts(rules) {
  const map = new Map()
  if (!rules?.length) return map
  const active = rules.filter(r => r.status === 'active' || r.status === 'scheduled')
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const r1 = active[i], r2 = active[j]
      if (!datesOverlap(r1.startDate, r1.endDate, r2.startDate, r2.endDate)) continue
      if (!conditionsOverlap(r1.conditions, r2.conditions)) continue
      const conflict = {
        type: 'condition_overlap',
        message: `Overlaps with "${r2.name}"`,
        details: `Both rules target similar products during overlapping periods. Priority: ${r1.priority ?? 'unset'} vs ${r2.priority ?? 'unset'}`,
      }
      const reverseConflict = { ...conflict, message: `Overlaps with "${r1.name}"` }
      map.set(r1.id, [...(map.get(r1.id) ?? []), conflict])
      map.set(r2.id, [...(map.get(r2.id) ?? []), reverseConflict])
    }
  }
  return map
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/utils/ruleConflictDetector.test.js
# expected: all tests pass
```

- [ ] **Step 5: Create ConflictBadge.vue**

```vue
<!-- src/components/promotions/ConflictBadge.vue -->
<template>
  <v-tooltip :text="tooltipText" location="top">
    <template #activator="{ props }">
      <v-chip v-bind="props" color="warning" variant="tonal" size="x-small" label prepend-icon="mdi-alert">
        {{ count }}
      </v-chip>
    </template>
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  conflicts: { type: Array, default: () => [] },
})
const count = computed(() => props.conflicts.length)
const tooltipText = computed(() =>
  props.conflicts.map(c => c.message).join(' • ')
)
</script>
```

- [ ] **Step 6: Wire conflict detection into PromotionsList.vue**

In `<script setup>`, add:

```js
import { detectConflicts } from '../../utils/ruleConflictDetector'
import ConflictBadge from './ConflictBadge.vue'
import { computed } from 'vue'

const conflictsMap = computed(() => detectConflicts(store.items))
```

In the v-data-table, add a `conflicts` column after the `name` column:

```vue
<template #item.name="{ item }">
  <div class="d-flex align-center gap-2">
    <span>{{ item.name }}</span>
    <ConflictBadge
      v-if="conflictsMap.get(item.id)?.length"
      :conflicts="conflictsMap.get(item.id)"
    />
  </div>
</template>
```

- [ ] **Step 7: Run full test suite**

```bash
npx vitest run
```

- [ ] **Step 8: Commit**

```bash
git add src/utils/ruleConflictDetector.js tests/utils/ruleConflictDetector.test.js src/components/promotions/ConflictBadge.vue src/components/promotions/PromotionsList.vue
git commit -m "feat: add cross-rule conflict detection with badges on list rows"
```

---

## Task 4: Stacking Groups Full CRUD Page

**Files:**
- Create: `src/components/stackingGroups/StackingGroupsPage.vue`
- Create: `src/components/stackingGroups/StackingGroupDialog.vue`
- Create: `src/components/shared/ColorPicker.vue`
- Modify: `src/stores/stackingGroups.js`
- Modify: `src/router/index.js`
- Create: `tests/components/StackingGroupsPage.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/components/StackingGroupsPage.test.js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import StackingGroupsPage from '../../src/components/stackingGroups/StackingGroupsPage.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })
const mountPage = (groups = []) =>
  mount(StackingGroupsPage, {
    global: {
      plugins: [createTestingPinia({ initialState: { stackingGroups: { items: groups } } }), vuetify],
      stubs: { RouterLink: true },
    },
  })

describe('StackingGroupsPage', () => {
  it('renders page title', () => {
    expect(mountPage().text()).toContain('Stacking groups')
  })

  it('renders a row per group', () => {
    const w = mountPage([{ id: 'sg-1', name: 'Flash Sales', color: '#EF4444', priority: 10, description: 'test' }])
    expect(w.text()).toContain('Flash Sales')
  })

  it('shows empty state when no groups', () => {
    expect(mountPage().text()).toContain('No stacking groups')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/components/StackingGroupsPage.test.js
```

- [ ] **Step 3: Add `update` action to stackingGroups store**

The store already has `fetchAll`, `create`, `remove`, and `error` state. Do NOT replace the file. Add only the missing `update` action and expose it in the return:

```js
// Add this function inside the defineStore setup, after the existing `create` function:
async function update(id, payload) {
  error.value = null
  try {
    const { data } = await axios.put(`/api/stacking-groups/${id}`, payload)
    const idx = items.value.findIndex(g => g.id === id)
    if (idx !== -1) items.value[idx] = data
    return data
  } catch (err) {
    error.value = err.message
    return null
  }
}

// Add `update` to the existing return statement:
return { items, loading, error, fetchAll, create, update, remove }
```

- [ ] **Step 4: Create ColorPicker.vue**

```vue
<!-- src/components/shared/ColorPicker.vue -->
<template>
  <div class="d-flex align-center gap-3">
    <div
      class="rounded"
      :style="{ width: '32px', height: '32px', background: modelValue, border: '2px solid rgba(0,0,0,0.12)', cursor: 'pointer', flexShrink: 0 }"
      @click="showInput = !showInput"
    />
    <v-text-field
      :model-value="modelValue"
      label="Color (hex)"
      variant="outlined"
      density="compact"
      hide-details
      placeholder="#10B981"
      :rules="[v => /^#[0-9A-Fa-f]{6}$/.test(v) || 'Must be valid hex (e.g. #10B981)']"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ modelValue: { type: String, default: '#10B981' } })
defineEmits(['update:modelValue'])
const showInput = ref(false)
</script>
```

- [ ] **Step 5: Create StackingGroupDialog.vue**

```vue
<!-- src/components/stackingGroups/StackingGroupDialog.vue -->
<template>
  <v-dialog v-model="open" max-width="480" persistent>
    <v-card>
      <v-card-title class="pa-5 pb-2">{{ isEdit ? 'Edit stacking group' : 'New stacking group' }}</v-card-title>
      <v-card-text class="pa-5 pt-2">
        <v-text-field v-model="form.name" label="Name *" variant="outlined" density="compact" class="mb-3"
          :error-messages="errors.name" />
        <v-textarea v-model="form.description" label="Description" variant="outlined" density="compact" rows="2" class="mb-3" />
        <v-text-field v-model.number="form.priority" label="Priority *" type="number" variant="outlined" density="compact"
          class="mb-3" hint="Lower = higher priority. Must be unique." persistent-hint :error-messages="errors.priority" />
        <div class="text-body-2 mb-2">Color</div>
        <ColorPicker v-model="form.color" />
        <div v-if="errors.color" class="text-caption text-error mt-1">{{ errors.color }}</div>
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" @click="submit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ColorPicker from '../shared/ColorPicker.vue'

const props = defineProps({
  modelValue: Boolean,
  group: { type: Object, default: null },
  existingGroups: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'save'])

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const isEdit = computed(() => !!props.group)
const saving = ref(false)
const errors = ref({})

const emptyForm = () => ({ name: '', description: '', priority: 10, color: '#10B981' })
const form = ref(emptyForm())

watch(() => props.group, g => { form.value = g ? { ...g } : emptyForm() }, { immediate: true })

function validate() {
  const e = {}
  if (!form.value.name?.trim()) e.name = 'Name is required'
  if (!form.value.priority || form.value.priority < 1) e.priority = 'Priority must be at least 1'
  const dup = props.existingGroups.find(g => g.priority === form.value.priority && g.id !== props.group?.id)
  if (dup) e.priority = `Priority ${form.value.priority} already used by "${dup.name}"`
  if (!form.value.color?.match(/^#[0-9A-Fa-f]{6}$/)) e.color = 'Must be valid hex (e.g. #10B981)'
  errors.value = e
  return !Object.keys(e).length
}

async function submit() {
  if (!validate()) return
  saving.value = true
  try { emit('save', { ...form.value }) } finally { saving.value = false }
}
</script>
```

- [ ] **Step 6: Create StackingGroupsPage.vue**

```vue
<!-- src/components/stackingGroups/StackingGroupsPage.vue -->
<template>
  <v-container fluid class="pa-6">
    <v-breadcrumbs :items="[{ title: 'Stacking groups', disabled: true }]" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Stacking groups</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" class="text-uppercase" @click="openCreate">New group</v-btn>
    </div>

    <v-card border elevation="0">
      <v-data-table
        :headers="headers"
        :items="store.items"
        :loading="store.loading"
        no-data-text="No stacking groups"
        item-value="id"
      >
        <template #item.color="{ item }">
          <div class="d-flex align-center gap-2">
            <div class="rounded" :style="{ width: '16px', height: '16px', background: item.color }" />
            <span class="text-caption text-mono">{{ item.color }}</span>
          </div>
        </template>
        <template #item.isDefault="{ item }">
          <v-chip v-if="item.isDefault" size="x-small" color="info" variant="tonal">System</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            :disabled="item.isDefault"
            @click="confirmDelete(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <StackingGroupDialog
      v-model="dialogOpen"
      :group="editingGroup"
      :existing-groups="store.items"
      @save="onSave"
    />

    <ConfirmDeleteDialog
      v-model="deleteDialogOpen"
      :item-name="deletingGroup?.name"
      @confirm="onDelete"
    />

    <v-snackbar v-model="errorSnack" color="error" timeout="4000">{{ errorMsg }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import StackingGroupDialog from './StackingGroupDialog.vue'
import ConfirmDeleteDialog from '../shared/ConfirmDeleteDialog.vue'

const store = useStackingGroupsStore()
const dialogOpen = ref(false)
const editingGroup = ref(null)
const deleteDialogOpen = ref(false)
const deletingGroup = ref(null)
const errorSnack = ref(false)
const errorMsg = ref('')

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Priority', key: 'priority', width: 100 },
  { title: 'Color', key: 'color', width: 140 },
  { title: 'Description', key: 'description' },
  { title: '', key: 'isDefault', width: 80 },
  { title: '', key: 'actions', sortable: false, width: 100 },
]

onMounted(() => store.fetchAll())

function openCreate() { editingGroup.value = null; dialogOpen.value = true }
function openEdit(g) { editingGroup.value = g; dialogOpen.value = true }
function confirmDelete(g) { deletingGroup.value = g; deleteDialogOpen.value = true }

async function onSave(payload) {
  if (editingGroup.value) {
    await store.update(editingGroup.value.id, payload)
  } else {
    await store.create(payload)
  }
  dialogOpen.value = false
}

async function onDelete() {
  try {
    await store.remove(deletingGroup.value.id)
  } catch (e) {
    errorMsg.value = e.response?.data?.error ?? 'Cannot delete group'
    errorSnack.value = true
  }
  deleteDialogOpen.value = false
}
</script>
```

- [ ] **Step 7: Add route**

In `src/router/index.js`, add:

```js
{ path: '/stacking-groups', component: () => import('../components/stackingGroups/StackingGroupsPage.vue') },
```

Update AppSidebar nav item for Stacking Groups to use `to="/stacking-groups"`.

- [ ] **Step 8: Run tests**

```bash
npx vitest run tests/components/StackingGroupsPage.test.js
```

- [ ] **Step 9: Commit**

```bash
git add src/components/stackingGroups/ src/components/shared/ColorPicker.vue src/stores/stackingGroups.js src/router/index.js tests/components/StackingGroupsPage.test.js
git commit -m "feat: add Stacking Groups full CRUD page with color picker, priority validation, and delete guard"
```

---

## Task 5: Bulk Operations + CSV Export/Import

**Files:**
- Create: `src/components/promotions/BulkEditConditionsDialog.vue`
- Create: `src/components/promotions/CsvImportDialog.vue`
- Create: `src/utils/csvRuleImportExport.js`
- Modify: `src/components/promotions/PromotionsList.vue`
- Modify: `src/stores/promotions.js`
- Create: `tests/components/BulkEditConditionsDialog.test.js`
- Create: `tests/utils/csvRuleImportExport.test.js`

- [ ] **Step 1: Write failing tests for CSV utility**

```js
// tests/utils/csvRuleImportExport.test.js
import { exportRulesToCSV, parseCSVToRules } from '../../src/utils/csvRuleImportExport'

const sampleRules = [
  { id: 'r1', name: 'Test Rule', type: 'discount', value: '20', valueUnit: '%',
    status: 'active', priority: 10, startDate: '2026-01-01', endDate: '2026-12-31',
    conditions: [{ field: 'brands', mode: 'include', values: ['Nike'] }], gifts: [] },
]

describe('exportRulesToCSV', () => {
  it('returns empty string for empty array', () => {
    expect(exportRulesToCSV([])).toBe('')
  })
  it('includes header row and data row', () => {
    const csv = exportRulesToCSV(sampleRules)
    expect(csv).toContain('name')
    expect(csv).toContain('Test Rule')
  })
  it('serializes conditions as JSON string', () => {
    const csv = exportRulesToCSV(sampleRules)
    expect(csv).toContain('brands')
  })
})

describe('parseCSVToRules', () => {
  it('parses CSV back to rule objects including conditions', () => {
    const csv = exportRulesToCSV(sampleRules)
    const parsed = parseCSVToRules(csv)
    expect(parsed[0].name).toBe('Test Rule')
    expect(parsed[0].type).toBe('discount')
    // conditions must survive the roundtrip — this is the regression check
    expect(Array.isArray(parsed[0].conditions)).toBe(true)
    expect(parsed[0].conditions[0].field).toBe('brands')
    expect(parsed[0].conditions[0].values).toEqual(['Nike'])
  })
  it('returns empty array for empty input', () => {
    expect(parseCSVToRules('')).toEqual([])
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/utils/csvRuleImportExport.test.js
```

- [ ] **Step 3: Implement csvRuleImportExport.js**

```js
// src/utils/csvRuleImportExport.js
const HEADERS = ['id', 'name', 'type', 'value', 'valueUnit', 'status', 'priority', 'startDate', 'endDate', 'stackingGroupId', 'exclusive', 'processingOrder', 'conditions', 'gifts']

function escapeCell(v) {
  const s = v == null ? '' : String(v)
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportRulesToCSV(rules) {
  if (!rules.length) return ''
  const rows = [HEADERS.join(',')]
  for (const r of rules) {
    rows.push(HEADERS.map(h => {
      if (h === 'conditions' || h === 'gifts') return escapeCell(JSON.stringify(r[h] ?? []))
      return escapeCell(r[h])
    }).join(','))
  }
  return rows.join('\n')
}

// Split a single CSV line respecting quoted fields (handles commas and escaped quotes inside JSON)
function splitCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ } // escaped quote
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function parseCSVToRules(csv) {
  if (!csv?.trim()) return []
  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = splitCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => {
      let v = values[i] ?? ''
      if (h === 'conditions' || h === 'gifts') { try { v = JSON.parse(v) } catch { v = [] } }
      else if (h === 'priority' || h === 'processingOrder') v = v ? Number(v) : null
      else if (h === 'exclusive') v = v === 'true'
      obj[h] = v
    })
    return obj
  })
}

export function downloadCSV(csv, filename = 'promotions.csv') {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 4: Run CSV tests**

```bash
npx vitest run tests/utils/csvRuleImportExport.test.js
```

- [ ] **Step 5: Write failing BulkEditConditionsDialog test**

```js
// tests/components/BulkEditConditionsDialog.test.js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import BulkEditConditionsDialog from '../../src/components/promotions/BulkEditConditionsDialog.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })
const mountDialog = () =>
  mount(BulkEditConditionsDialog, {
    attachTo: document.body,
    props: { modelValue: true, selectedCount: 3 },
    global: { plugins: [createTestingPinia(), vuetify] },
  })

describe('BulkEditConditionsDialog', () => {
  it('shows selected count in title', () => {
    mountDialog()
    expect(document.body.textContent).toContain('3 rules')
  })
  it('shows mode toggle (add / replace)', () => {
    mountDialog()
    expect(document.body.textContent).toMatch(/Add conditions|Replace conditions/)
  })
})
```

- [ ] **Step 6: Implement BulkEditConditionsDialog.vue**

```vue
<!-- src/components/promotions/BulkEditConditionsDialog.vue -->
<template>
  <v-dialog v-model="open" max-width="560" persistent>
    <v-card>
      <v-card-title class="pa-5 pb-2">Edit conditions — {{ selectedCount }} rules</v-card-title>
      <v-card-text class="pa-5 pt-2">
        <v-btn-toggle v-model="mode" mandatory divided variant="outlined" color="primary" class="mb-4 w-100">
          <v-btn value="add" class="flex-grow-1">Add conditions</v-btn>
          <v-btn value="replace" class="flex-grow-1">Replace conditions</v-btn>
        </v-btn-toggle>
        <v-alert v-if="mode === 'replace'" type="warning" variant="tonal" density="compact" class="mb-4">
          This will replace ALL existing conditions on the selected rules.
        </v-alert>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <ConditionChip
            v-for="(cond, idx) in conditions"
            :key="cond.id"
            :condition="cond"
            @remove="conditions.splice(idx, 1)"
            @edit="openEdit(idx)"
          />
        </div>
        <v-btn variant="outlined" color="primary" size="small" prepend-icon="mdi-plus" @click="openAdd">
          Add condition
        </v-btn>
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="apply">Apply to {{ selectedCount }} rules</v-btn>
      </v-card-actions>
    </v-card>

    <ConditionBuilderDialog
      v-model="condDialogOpen"
      :initial-condition="editingCondition"
      @save="onCondSave"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuid } from 'uuid'
import ConditionChip from '../promotions/ConditionChip.vue'
import ConditionBuilderDialog from '../promotions/ConditionBuilderDialog.vue'

const props = defineProps({ modelValue: Boolean, selectedCount: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue', 'apply'])

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const mode = ref('add')
const conditions = ref([])
const condDialogOpen = ref(false)
const editingCondition = ref(null)
const editingIdx = ref(null)

function openAdd() { editingCondition.value = null; editingIdx.value = null; condDialogOpen.value = true }
function openEdit(idx) { editingCondition.value = { ...conditions.value[idx] }; editingIdx.value = idx; condDialogOpen.value = true }
function onCondSave(c) {
  if (editingIdx.value !== null) conditions.value[editingIdx.value] = c
  else conditions.value.push({ ...c, id: uuid() })
}
function apply() {
  emit('apply', { mode: mode.value, conditions: conditions.value })
  emit('update:modelValue', false)
}
</script>
```

- [ ] **Step 7: Create CsvImportDialog.vue**

```vue
<!-- src/components/promotions/CsvImportDialog.vue -->
<template>
  <v-dialog v-model="open" max-width="560" persistent>
    <v-card>
      <v-card-title class="pa-5 pb-2">Import rules from CSV</v-card-title>
      <v-card-text class="pa-5 pt-2">
        <v-file-input
          v-model="file"
          label="Select CSV file"
          accept=".csv"
          variant="outlined"
          density="compact"
          prepend-icon=""
          prepend-inner-icon="mdi-file-delimited"
          class="mb-3"
          @update:model-value="onFileSelected"
        />
        <div v-if="preview.length" class="mb-3">
          <div class="text-body-2 font-weight-bold mb-2">Preview ({{ preview.length }} rules)</div>
          <v-table density="compact">
            <thead><tr><th>Name</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="r in preview.slice(0, 5)" :key="r.id ?? r.name">
                <td>{{ r.name }}</td><td>{{ r.type }}</td><td>{{ r.status }}</td>
              </tr>
            </tbody>
          </v-table>
          <div v-if="preview.length > 5" class="text-caption text-medium-emphasis mt-1">
            …and {{ preview.length - 5 }} more
          </div>
        </div>
        <v-alert v-if="parseError" type="error" variant="tonal" density="compact">{{ parseError }}</v-alert>
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!preview.length" @click="doImport">
          Import {{ preview.length }} rules
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseCSVToRules } from '../../utils/csvRuleImportExport'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'import'])

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const file = ref(null)
const preview = ref([])
const parseError = ref('')

function onFileSelected(files) {
  parseError.value = ''
  preview.value = []
  const f = Array.isArray(files) ? files[0] : files
  if (!f) return
  const reader = new FileReader()
  reader.onload = e => {
    try { preview.value = parseCSVToRules(e.target.result) }
    catch { parseError.value = 'Could not parse CSV file.' }
  }
  reader.readAsText(f)
}

function doImport() {
  emit('import', preview.value)
  emit('update:modelValue', false)
}
</script>
```

- [ ] **Step 8: Add importFromCSV action to promotions store**

In `src/stores/promotions.js`, add after `bulkUpdateConditions`:

```js
async function importFromCSV(rules) {
  for (const rule of rules) {
    const { id, ...payload } = rule
    const { data } = await axios.post('/api/promotions', payload)
    items.value.push(data)
  }
}
```

Add `importFromCSV` to the return statement.

- [ ] **Step 9: Wire CsvImportDialog into PromotionsList.vue**

Add to script setup:
```js
import CsvImportDialog from './CsvImportDialog.vue'
const csvImportOpen = ref(false)
async function onCSVImport(rules) { await store.importFromCSV(rules) }
```

Add an "Import CSV" button next to "Export CSV":
```vue
<v-btn variant="outlined" size="small" prepend-icon="mdi-upload" @click="csvImportOpen = true">Import CSV</v-btn>
<CsvImportDialog v-model="csvImportOpen" @import="onCSVImport" />
```

- [ ] **Step 11: Add bulkUpdateConditions action to promotions store**

In `src/stores/promotions.js`, add alongside the other actions:

```js
async function bulkUpdateConditions(ids, { mode, conditions }) {
  for (const id of ids) {
    const item = items.value.find(i => i.id === id)
    if (!item) continue
    const updated = {
      ...item,
      conditions: mode === 'replace' ? conditions : [...item.conditions, ...conditions],
    }
    await axios.put(`/api/promotions/${id}`, updated)
    Object.assign(item, updated)
  }
}
```

Add `bulkUpdateConditions` to the return statement.

- [ ] **Step 12: Wire bulk UI into PromotionsList.vue**

Add to `<script setup>`:
```js
import BulkEditConditionsDialog from './BulkEditConditionsDialog.vue'
import { downloadCSV, exportRulesToCSV } from '../../utils/csvRuleImportExport'
import { ref } from 'vue'

const selected = ref([])
const bulkDialogOpen = ref(false)

function exportCSV() {
  downloadCSV(exportRulesToCSV(store.items), 'promotions.csv')
}

async function onBulkApply(payload) {
  await store.bulkUpdateConditions(selected.value, payload)
  selected.value = []
}
```

Add to the title row:
```vue
<template v-if="selected.length">
  <v-btn variant="outlined" size="small" @click="bulkDialogOpen = true">
    Edit conditions ({{ selected.length }})
  </v-btn>
</template>
<v-btn variant="outlined" size="small" prepend-icon="mdi-download" @click="exportCSV">Export CSV</v-btn>
```

Add `v-model:selected="selected"` and `show-select` to the v-data-table.

Add `<BulkEditConditionsDialog v-model="bulkDialogOpen" :selected-count="selected.length" @apply="onBulkApply" />`.

- [ ] **Step 13: Run tests**

```bash
npx vitest run tests/utils/csvRuleImportExport.test.js tests/components/BulkEditConditionsDialog.test.js
```

- [ ] **Step 14: Commit**

```bash
git add src/utils/csvRuleImportExport.js src/components/promotions/BulkEditConditionsDialog.vue src/components/promotions/CsvImportDialog.vue src/components/promotions/PromotionsList.vue src/stores/promotions.js tests/
git commit -m "feat: add bulk edit conditions, CSV import/export, and row selection to PromotionsList"
```

---

## Task 6: Templates Library Page

**Files:**
- Create: `src/components/templates/TemplatesPage.vue`
- Create: `src/components/templates/TemplateCard.vue`
- Modify: `src/stores/templates.js`
- Modify: `server/data/seed.js` (richer template objects)
- Modify: `src/router/index.js`
- Create: `tests/components/TemplatesPage.test.js`

- [ ] **Step 1: Enrich template seed data**

In `server/data/seed.js`, replace templates array with richer objects:

```js
const templates = [
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
    id: 'tpl-bulk-1', label: 'Buy More Save More', category: 'bulk', popularity: 'high',
    description: 'Tiered discount based on quantity', examples: ['Buy 3+ save 10%'],
    ruleType: 'step_discount', defaultValue: '10', defaultValueUnit: '%',
    defaultConditions: [],
  },
  {
    id: 'tpl-gift-1', label: 'Free Gift With Purchase', category: 'gift', popularity: 'medium',
    description: 'Gift item with minimum spend', examples: ['Free tote bag over €150'],
    ruleType: 'gift', defaultValue: '0', defaultValueUnit: '%',
    defaultConditions: [{ field: 'subtotal', mode: 'include', values: ['150'], operator: '>=' }],
  },
  {
    id: 'tpl-brand-1', label: 'Brand Discount', category: 'category', popularity: 'high',
    description: 'Percentage off a specific brand', examples: ['20% off Nike', '15% off Adidas'],
    ruleType: 'discount', defaultValue: '20', defaultValueUnit: '%',
    defaultConditions: [{ field: 'brands', mode: 'include', values: [] }],
  },
]
```

- [ ] **Step 2: Write failing tests**

```js
// tests/components/TemplatesPage.test.js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TemplatesPage from '../../src/components/templates/TemplatesPage.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'

const vuetify = createVuetify({ components, directives })
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })

const mountPage = (items = []) =>
  mount(TemplatesPage, {
    global: {
      plugins: [createTestingPinia({ initialState: { templates: { items } } }), vuetify, router],
      stubs: { RouterLink: true },
    },
  })

describe('TemplatesPage', () => {
  it('renders page title', () => {
    expect(mountPage().text()).toContain('Templates')
  })

  it('renders a card per template', () => {
    const w = mountPage([{ id: 't1', label: 'Flash Sale', category: 'flash', popularity: 'high', description: 'test', ruleType: 'discount', defaultValue: '20', defaultValueUnit: '%', defaultConditions: [] }])
    expect(w.text()).toContain('Flash Sale')
  })

  it('shows empty state when no templates', () => {
    expect(mountPage().text()).toContain('No templates')
  })
})
```

- [ ] **Step 3: Run to confirm failure**

```bash
npx vitest run tests/components/TemplatesPage.test.js
```

- [ ] **Step 4: Create TemplateCard.vue**

```vue
<!-- src/components/templates/TemplateCard.vue -->
<template>
  <v-card border elevation="0" class="pa-4 h-100 d-flex flex-column" style="cursor:pointer" @click="$emit('select', template)">
    <div class="d-flex align-center mb-2 gap-2">
      <v-chip :color="categoryColor" variant="tonal" size="x-small" label>{{ template.category }}</v-chip>
      <v-chip v-if="template.popularity === 'high'" color="primary" variant="tonal" size="x-small" label>Popular</v-chip>
    </div>
    <div class="text-body-1 font-weight-bold mb-1">{{ template.label }}</div>
    <div class="text-body-2 text-medium-emphasis flex-grow-1 mb-3">{{ template.description }}</div>
    <div v-if="template.examples?.length" class="text-caption text-medium-emphasis">
      e.g. {{ template.examples[0] }}
    </div>
    <v-btn color="primary" variant="tonal" size="small" class="mt-3 align-self-start text-uppercase" @click.stop="$emit('select', template)">
      Use template
    </v-btn>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ template: { type: Object, required: true } })
defineEmits(['select'])
const categoryColor = computed(() => ({
  flash: 'error', seasonal: 'info', loyalty: 'success',
  bulk: 'warning', category: 'purple', gift: 'teal',
}[props.template.category] ?? 'default'))
</script>
```

- [ ] **Step 5: Create TemplatesPage.vue**

```vue
<!-- src/components/templates/TemplatesPage.vue -->
<template>
  <v-container fluid class="pa-6">
    <v-breadcrumbs :items="[{ title: 'Templates', disabled: true }]" density="compact" class="pa-0 mb-2" />

    <div class="d-flex align-center mb-5">
      <h1 class="text-h5 font-weight-bold">Templates</h1>
      <v-spacer />
      <v-text-field
        v-model="search"
        placeholder="Search templates…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 280px"
        clearable
      />
    </div>

    <!-- Category tabs -->
    <v-chip-group v-model="selectedCategory" mandatory color="primary" class="mb-5">
      <v-chip v-for="cat in categories" :key="cat.value" :value="cat.value" filter variant="outlined">
        {{ cat.label }} <span v-if="cat.count" class="ml-1 text-caption">({{ cat.count }})</span>
      </v-chip>
    </v-chip-group>

    <div v-if="filtered.length" class="d-flex flex-wrap gap-4">
      <div v-for="tpl in filtered" :key="tpl.id" style="width: 280px">
        <TemplateCard :template="tpl" @select="applyTemplate" />
      </div>
    </div>
    <v-alert v-else type="info" variant="tonal" density="compact">No templates</v-alert>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '../../stores/templates'
import { usePromotionsStore } from '../../stores/promotions'
import { useUiStore } from '../../stores/ui'
import TemplateCard from './TemplateCard.vue'

const store = useTemplatesStore()
const promoStore = usePromotionsStore()
const uiStore = useUiStore()
const router = useRouter()
const search = ref('')
const selectedCategory = ref('all')

onMounted(() => store.fetchAll())

const categories = computed(() => {
  const cats = ['flash', 'seasonal', 'loyalty', 'bulk', 'category', 'gift']
  return [
    { value: 'all', label: 'All', count: store.items.length },
    ...cats.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1), count: store.items.filter(t => t.category === c).length })).filter(c => c.count),
  ]
})

const filtered = computed(() =>
  store.items
    .filter(t => selectedCategory.value === 'all' || t.category === selectedCategory.value)
    .filter(t => !search.value || t.label.toLowerCase().includes(search.value.toLowerCase()) || t.description?.toLowerCase().includes(search.value.toLowerCase()))
)

function applyTemplate(tpl) {
  uiStore.selectTemplate(tpl)
  uiStore.applyPendingRule()
  router.push('/promotions/new')
}
</script>
```

- [ ] **Step 6: Add route and update sidebar**

In `src/router/index.js`:
```js
{ path: '/templates', component: () => import('../components/templates/TemplatesPage.vue') },
```

In `src/stores/templates.js`, update `fetchAll` — add `category`, `popularity`, `examples` to what the store exposes (no change needed, it just stores whatever the API returns).

- [ ] **Step 7: Run tests**

```bash
npx vitest run tests/components/TemplatesPage.test.js
```

- [ ] **Step 8: Commit**

```bash
git add src/components/templates/ src/router/index.js server/data/seed.js tests/components/TemplatesPage.test.js
git commit -m "feat: add Templates library page with category tabs, search, and use-template flow"
```

---

## Task 7: Final Integration + Smoke Test

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
# expected: all tests pass
```

- [ ] **Step 2: Manual smoke test checklist**

With `node server/index.js` and `npx vite` running:

**List page (`/promotions`):**
- [ ] 6 seed rules visible (4 original + scheduled + paused)
- [ ] `scheduled` and `paused` status badges render with correct colors
- [ ] Conflict badge appears on rules with overlapping conditions
- [ ] Row checkboxes selectable; "Edit conditions (N)" button appears
- [ ] Export CSV downloads a file

**Create form (`/promotions/new`):**
- [ ] Save with empty name shows validation error
- [ ] `step_discount` type reveals Step type select
- [ ] `gift` type reveals Trigger type / Threshold / Max gifts
- [ ] Exclusive toggle and Processing order visible in Advanced card

**Stacking Groups (`/stacking-groups`):**
- [ ] 3 seed groups with color swatches
- [ ] Create → dialog with color picker and priority validation
- [ ] Delete system group → button disabled
- [ ] Delete group in use → error snackbar

**Templates (`/templates`):**
- [ ] 6 template cards rendered
- [ ] Category chip filters work
- [ ] Search filters by label
- [ ] "Use template" → navigates to `/promotions/new` with form pre-filled

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 2 — conflict detection, full CRUD stacking groups, bulk ops, CSV, templates library"
git push origin main
```
