# Promotions Vue — Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining feature gap between the React prototype and the Vue 3 refactor: list tabs + quick actions, rule priority simulator, condition builder wizard upgrade, AI recommendations panel, and conditionParser utility.

**Architecture:** All tasks follow the established pattern — Pinia store owns server communication, components are presentational, utilities in `src/utils/`. Tasks 1–3 extend existing components; Tasks 4–6 build new components. Each task is independently testable and committable.

**Tech Stack:** Vue 3 (Composition API), Vuetify 3, Pinia, Vue Router 4, Vite, Express mock API, Vitest + Vue Test Utils + @pinia/testing

**Reference:** React prototype at `/Users/lukaspajma/tars/prototypes/promotions-prototype/src/app`

---

## File Map

```
server/
  data/seed.js                         ← MODIFY: add performance, revenue, createdBy to promos

src/
  stores/
    promotions.js                      ← MODIFY: add updateStatus, duplicate actions
  utils/
    ruleConflictDetector.js            ← MODIFY: add simulateRuleApplication
    conditionParser.js                 ← NEW: parsedConditionsToWizardConditions, formatConditionsSummary
  components/
    promotions/
      PromotionsList.vue               ← MODIFY: tabs, per-row menu, stacking group filter, performance tab
      ConditionBuilderDialog.vue       ← MODIFY: 2-step wizard (type selector → value input)
      RulePriorityPreview.vue          ← NEW: expandable preview of applied/skipped rules
    ai/
      AiRecommendationsPanel.vue       ← NEW: static recommendations with one-click apply

tests/
  stores/promotions.test.js            ← NEW: updateStatus and duplicate actions
  utils/ruleConflictDetector.test.js   ← MODIFY: add simulateRuleApplication tests
  utils/conditionParser.test.js        ← NEW: parsedConditionsToWizardConditions tests
  components/PromotionsList.test.js    ← NEW: tabs and action menu tests
  components/RulePriorityPreview.test.js ← NEW
  components/ConditionBuilderDialog.test.js ← NEW: wizard step tests
  components/AiRecommendationsPanel.test.js ← NEW
```

---

## Task 1: Performance Metrics + Quick Actions in Store and Seed

**Files:**
- Modify: `server/data/seed.js`
- Modify: `src/stores/promotions.js`
- Create: `tests/stores/promotions.test.js`

- [ ] **Step 1: Add performance, revenue, createdBy to seed**

In `server/data/seed.js`, add these fields to each promo object:

```js
// promo-1:
performance: 87, revenue: '€24,500', createdBy: 'Anna K.',

// promo-2:
performance: 62, revenue: '€12,300', createdBy: 'Martin P.',

// promo-3:
performance: 45, revenue: '€8,100', createdBy: 'Anna K.',

// promo-4 (gift promo):
performance: 78, revenue: '€18,900', createdBy: 'Lukas J.',

// promo-5 (scheduled — no performance yet):
createdBy: 'Lukas J.',

// promo-6 (paused):
performance: 35, revenue: '€4,200', createdBy: 'Martin P.',
```

- [ ] **Step 2: Write failing store tests**

Create `tests/stores/promotions.test.js`:

```js
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { usePromotionsStore } from '../../src/stores/promotions'
import { beforeEach, describe, it, expect, vi } from 'vitest'

describe('promotions store — updateStatus', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('updateStatus changes item status in-place', async () => {
    const pinia = createTestingPinia({ stubActions: false })
    const store = usePromotionsStore(pinia)
    store.items = [{ id: 'p1', name: 'Test', status: 'active', conditions: [], gifts: [] }]
    // stub axios put
    vi.spyOn(store, 'updateStatus').mockImplementation(async (id, status) => {
      const item = store.items.find(i => i.id === id)
      if (item) item.status = status
    })
    await store.updateStatus('p1', 'paused')
    expect(store.items[0].status).toBe('paused')
  })
})

describe('promotions store — duplicate', () => {
  it('duplicate adds a copy with (copy) suffix and inactive status', async () => {
    const pinia = createTestingPinia({ stubActions: false })
    const store = usePromotionsStore(pinia)
    store.items = [{ id: 'p1', name: 'Flash Sale', status: 'active', type: 'discount', value: '20', conditions: [], gifts: [] }]
    vi.spyOn(store, 'duplicate').mockImplementation(async (id) => {
      const src = store.items.find(i => i.id === id)
      const copy = { ...src, id: 'p1-copy', name: `${src.name} (copy)`, status: 'inactive' }
      store.items.push(copy)
      return copy
    })
    await store.duplicate('p1')
    expect(store.items).toHaveLength(2)
    expect(store.items[1].name).toBe('Flash Sale (copy)')
    expect(store.items[1].status).toBe('inactive')
  })
})
```

- [ ] **Step 3: Run to confirm failure**

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npx vitest run tests/stores/promotions.test.js
```

Expected: 2 tests fail.

- [ ] **Step 4: Add updateStatus and duplicate actions to promotions store**

In `src/stores/promotions.js`, add after the `remove` function:

```js
async function updateStatus(id, status) {
  const item = items.value.find(i => i.id === id)
  if (!item) return
  loading.value = true
  error.value = null
  try {
    const { data } = await axios.put(`/api/promotions/${id}`, { ...item, status })
    Object.assign(item, data)
    return data
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

async function duplicate(id) {
  const source = items.value.find(i => i.id === id)
  if (!source) return
  loading.value = true
  error.value = null
  try {
    const { id: _id, ...payload } = source
    const { data } = await axios.post('/api/promotions', {
      ...payload,
      name: `${source.name} (copy)`,
      status: 'inactive',
    })
    items.value.push(data)
    return data
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}
```

Add `updateStatus` and `duplicate` to the return statement.

- [ ] **Step 5: Run tests**

```bash
npx vitest run tests/stores/promotions.test.js
```

Expected: 2 pass.

- [ ] **Step 6: Run full suite**

```bash
npm test
```

Expected: all 68 + 2 new = 70 pass.

- [ ] **Step 7: Commit**

```bash
git add server/data/seed.js src/stores/promotions.js tests/stores/promotions.test.js
git commit -m "feat: add performance metrics to seed, updateStatus and duplicate actions to store"
```

---

## Task 2: PromotionsList — Tabs, Per-Row Menu, Stacking Group Filter, Performance Tab

**Files:**
- Modify: `src/components/promotions/PromotionsList.vue`
- Create: `tests/components/PromotionsList.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/components/PromotionsList.test.js`:

```js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PromotionsList from '../../src/components/promotions/PromotionsList.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'

const vuetify = createVuetify({ components, directives })
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)', component: { template: '<div />' } }] })

const activeRule = { id: 'p1', name: 'Active Rule', type: 'discount', value: '20', status: 'active', priority: 1, conditions: [], gifts: [], createdBy: 'Anna K.' }
const pausedRule = { id: 'p2', name: 'Paused Rule', type: 'discount', value: '10', status: 'paused', priority: 2, conditions: [], gifts: [], createdBy: 'Martin P.' }
const perfRule = { id: 'p3', name: 'Perf Rule', type: 'discount', value: '15', status: 'active', priority: 3, conditions: [], gifts: [], performance: 90, revenue: '€10k', createdBy: 'Lukas J.' }

const mountList = (items = []) =>
  mount(PromotionsList, {
    global: {
      plugins: [
        createTestingPinia({ initialState: { promotions: { items }, stackingGroups: { items: [] } } }),
        vuetify,
        router,
      ],
      stubs: { RouterLink: true, AiAssistantPanel: true },
    },
  })

describe('PromotionsList', () => {
  it('renders Active tab by default', () => {
    const w = mountList([activeRule, pausedRule])
    expect(w.text()).toContain('Active')
  })

  it('renders Paused tab', () => {
    const w = mountList([activeRule, pausedRule])
    expect(w.text()).toContain('Paused')
  })

  it('renders Performance tab', () => {
    const w = mountList([perfRule])
    expect(w.text()).toContain('Performance')
  })

  it('shows action menu button per row', () => {
    const w = mountList([activeRule])
    // At least one ⋮ action button should be in the table
    expect(w.findAll('[data-testid="row-actions"]').length + w.findAll('button').length).toBeGreaterThan(0)
  })

  it('shows stacking group filter', () => {
    const w = mountList([activeRule])
    expect(w.text()).toContain('All groups')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/components/PromotionsList.test.js
```

- [ ] **Step 3: Rewrite PromotionsList.vue with tabs**

Read the current file first: `src/components/promotions/PromotionsList.vue`

Replace the `FilterTabs` section and table with a tabbed layout. The key changes:

**Add to `<script setup>` imports:**
```js
import { useStackingGroupsStore } from '../../stores/stackingGroups'
```

**Add to `<script setup>` state (after existing refs):**
```js
const sgStore = useStackingGroupsStore()
const activeTab = ref('active')
const stackingGroupFilter = ref('all')
const deleteDialogOpen = ref(false)
const deletingItem = ref(null)

// Tab computed lists
const activeItems = computed(() =>
  applyStackingFilter(store.items.filter(r => r.status === 'active' || r.status === 'scheduled'))
)
const pausedItems = computed(() =>
  applyStackingFilter(store.items.filter(r => r.status === 'paused' || r.status === 'inactive'))
)
const performanceItems = computed(() =>
  [...store.items]
    .filter(r => r.performance !== undefined)
    .sort((a, b) => (b.performance ?? 0) - (a.performance ?? 0))
)

function applyStackingFilter(rules) {
  if (stackingGroupFilter.value === 'all') return rules
  if (stackingGroupFilter.value === 'exclusive') return rules.filter(r => r.exclusive)
  if (stackingGroupFilter.value === 'unassigned') return rules.filter(r => !r.exclusive && !r.stackingGroupId)
  return rules.filter(r => r.stackingGroupId === stackingGroupFilter.value)
}

const tabItems = computed(() => {
  if (activeTab.value === 'paused') return pausedItems.value
  if (activeTab.value === 'performance') return performanceItems.value
  return activeItems.value
})

const stackingGroupFilterItems = computed(() => [
  { value: 'all', title: 'All groups' },
  { value: 'exclusive', title: 'Exclusive rules' },
  { value: 'unassigned', title: 'Unassigned' },
  ...sgStore.items.map(g => ({ value: g.id, title: g.name })),
])

async function pauseRule(id) {
  await store.updateStatus(id, 'paused')
}
async function resumeRule(id) {
  await store.updateStatus(id, 'active')
}
async function duplicateRule(id) {
  await store.duplicate(id)
}
function openDelete(item) {
  deletingItem.value = item
  deleteDialogOpen.value = true
}
async function confirmDeleteItem() {
  if (deletingItem.value) await store.remove(deletingItem.value.id)
  deleteDialogOpen.value = false
  deletingItem.value = null
}
```

**Also add** `onMounted` call for stacking groups:
```js
onMounted(async () => {
  await store.fetchAll()
  await sgStore.fetchAll()
})
```

**Replace the template section** (keep the header, breadcrumb, search, bulk/CSV buttons — replace FilterTabs + v-data-table with this):

```vue
<!-- Stacking group filter + tabs row -->
<div class="d-flex align-center gap-4 mb-4">
  <v-tabs v-model="activeTab" color="primary" density="compact">
    <v-tab value="active">Active <v-chip size="x-small" class="ml-1">{{ activeItems.length }}</v-chip></v-tab>
    <v-tab value="paused">Paused <v-chip size="x-small" class="ml-1">{{ pausedItems.length }}</v-chip></v-tab>
    <v-tab value="performance">Performance</v-tab>
  </v-tabs>
  <v-spacer />
  <v-select
    v-model="stackingGroupFilter"
    :items="stackingGroupFilterItems"
    variant="outlined"
    density="compact"
    hide-details
    style="max-width: 200px"
  />
</div>

<!-- Performance tab banner -->
<v-alert v-if="activeTab === 'performance'" type="info" variant="tonal" density="compact" class="mb-3" icon="mdi-chart-bar">
  Rules sorted by performance score. Revenue figures are estimates.
</v-alert>

<!-- Shared table for all tabs -->
<v-card border elevation="0">
  <v-data-table
    v-model:selected="selected"
    :headers="activeTab === 'performance' ? performanceHeaders : headers"
    :items="tabItems"
    :loading="store.loading"
    item-value="id"
    show-select
    hover
  >
    <template #item.name="{ item }">
      <div class="d-flex align-center gap-2">
        <span class="font-weight-medium">{{ item.name }}</span>
        <ConflictBadge
          v-if="conflictsMap.get(item.id)?.length"
          :conflicts="conflictsMap.get(item.id)"
        />
      </div>
    </template>

    <template #item.type="{ item }">
      <span class="text-medium-emphasis text-capitalize">{{ item.type.replace('_', ' ') }}</span>
    </template>

    <template #item.status="{ item }">
      <StatusBadge :status="item.status" />
    </template>

    <template #item.performance="{ item }">
      <span v-if="item.performance !== undefined" class="font-weight-bold text-success">{{ item.performance }}%</span>
      <span v-else class="text-medium-emphasis">—</span>
    </template>

    <template #item.revenue="{ item }">
      <span v-if="item.revenue" class="text-success">{{ item.revenue }}</span>
      <span v-else class="text-medium-emphasis">—</span>
    </template>

    <template #item.createdBy="{ item }">
      <span class="text-caption text-medium-emphasis">{{ item.createdBy ?? '—' }}</span>
    </template>

    <template #item.updatedAt="{ item }">
      <span class="text-medium-emphasis text-caption">{{ formatDate(item.updatedAt) }}</span>
    </template>

    <template #item.actions="{ item }">
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            data-testid="row-actions"
            v-bind="menuProps"
          />
        </template>
        <v-list density="compact" min-width="180">
          <v-list-item prepend-icon="mdi-pencil" title="Edit" :to="`/promotions/${item.id}/edit`" />
          <v-list-item prepend-icon="mdi-content-copy" title="Duplicate" @click="duplicateRule(item.id)" />
          <v-list-item
            v-if="item.status !== 'paused' && item.status !== 'inactive'"
            prepend-icon="mdi-pause"
            title="Pause"
            @click="pauseRule(item.id)"
          />
          <v-list-item
            v-else
            prepend-icon="mdi-play"
            title="Resume"
            @click="resumeRule(item.id)"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-delete"
            title="Delete"
            class="text-error"
            @click="openDelete(item)"
          />
        </v-list>
      </v-menu>
    </template>
  </v-data-table>
</v-card>

<!-- Delete confirmation -->
<ConfirmDeleteDialog
  v-model="deleteDialogOpen"
  :item-name="deletingItem?.name"
  @confirm="confirmDeleteItem"
/>
```

**Add headers const** in script (alongside existing `headers`):
```js
const performanceHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Type', key: 'type' },
  { title: 'Performance', key: 'performance', sortable: true },
  { title: 'Revenue', key: 'revenue' },
  { title: 'Created by', key: 'createdBy' },
  { title: '', key: 'actions', sortable: false, width: 60 },
]
```

**Update existing `headers`** to include `status`, `createdBy`, and `actions`:
```js
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Type', key: 'type' },
  { title: 'Status', key: 'status' },
  { title: 'Priority', key: 'priority' },
  { title: 'Created by', key: 'createdBy' },
  { title: 'Updated', key: 'updatedAt' },
  { title: '', key: 'actions', sortable: false, width: 60 },
]
```

Add `ConfirmDeleteDialog` import to script:
```js
import ConfirmDeleteDialog from '../shared/ConfirmDeleteDialog.vue'
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/components/PromotionsList.test.js
```

Expected: 5 pass.

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/promotions/PromotionsList.vue tests/components/PromotionsList.test.js
git commit -m "feat: add Active/Paused/Performance tabs, per-row action menu, stacking group filter to PromotionsList"
```

---

## Task 3: Rule Priority Simulator

**Files:**
- Modify: `src/utils/ruleConflictDetector.js` (add `simulateRuleApplication`)
- Create: `src/components/promotions/RulePriorityPreview.vue`
- Modify: `tests/utils/ruleConflictDetector.test.js` (add simulator tests)
- Create: `tests/components/RulePriorityPreview.test.js`
- Modify: `src/components/promotions/PromotionsList.vue` (add RulePriorityPreview above table)

- [ ] **Step 1: Write failing simulator tests**

Add to `tests/utils/ruleConflictDetector.test.js`:

```js
import { simulateRuleApplication } from '../../src/utils/ruleConflictDetector'

describe('simulateRuleApplication', () => {
  const r = (id, priority, status = 'active', exclusive = false, conditions = []) =>
    ({ id, name: `Rule ${id}`, status, priority, exclusive, conditions, type: 'discount' })

  it('returns empty applied/skipped for empty input', () => {
    const result = simulateRuleApplication([])
    expect(result.applied).toEqual([])
    expect(result.skipped).toEqual([])
  })

  it('applies rules sorted by priority (lower first)', () => {
    const rules = [r('b', 5), r('a', 1), r('c', 10)]
    const { applied } = simulateRuleApplication(rules)
    expect(applied.map(r => r.id)).toEqual(['a', 'b', 'c'])
  })

  it('skips paused and inactive rules', () => {
    const rules = [r('active', 1, 'active'), r('paused', 2, 'paused'), r('inactive', 3, 'inactive')]
    const { applied, skipped } = simulateRuleApplication(rules)
    expect(applied.map(r => r.id)).toEqual(['active'])
    expect(skipped).toHaveLength(0) // paused/inactive not in output at all
  })

  it('skips second rule with same condition signature', () => {
    const cond = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const rules = [r('hi', 1, 'active', false, cond), r('lo', 5, 'active', false, cond)]
    const { applied, skipped } = simulateRuleApplication(rules)
    expect(applied.map(r => r.id)).toEqual(['hi'])
    expect(skipped[0].rule.id).toBe('lo')
    expect(skipped[0].reason).toMatch(/priority/i)
  })

  it('does not skip gift rules even with same conditions', () => {
    const cond = [{ field: 'brands', mode: 'include', values: ['Nike'] }]
    const discount = { ...r('d', 1, 'active', false, cond), type: 'discount' }
    const gift = { ...r('g', 2, 'active', false, cond), type: 'gift' }
    const { applied } = simulateRuleApplication([discount, gift])
    expect(applied.map(r => r.id)).toContain('g')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/utils/ruleConflictDetector.test.js
```

- [ ] **Step 3: Add simulateRuleApplication to ruleConflictDetector.js**

Read `src/utils/ruleConflictDetector.js` first, then append:

```js
function generateConditionSignature(rule) {
  if (!rule.conditions?.length) return 'global'
  return rule.conditions
    .filter(c => c.mode === 'include')
    .map(c => `${c.field}:${[...c.values].sort().join(',')}`)
    .sort()
    .join('|')
}

export function simulateRuleApplication(rules) {
  if (!rules?.length) return { applied: [], skipped: [] }

  const active = rules
    .filter(r => r.status === 'active' || r.status === 'scheduled')
    .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))

  const applied = []
  const skipped = []
  const usedSignatures = new Set()

  for (const rule of active) {
    const sig = generateConditionSignature(rule)
    const isGift = rule.type === 'gift'

    // Exclusive rule already applied → skip everything after
    if (!rule.exclusive && applied.some(r => r.exclusive)) {
      skipped.push({ rule, reason: 'Blocked by an exclusive rule with higher priority' })
      continue
    }

    if (!isGift && usedSignatures.has(sig)) {
      skipped.push({ rule, reason: `Higher priority rule already applies to these conditions` })
    } else {
      applied.push(rule)
      usedSignatures.add(sig)
    }
  }

  return { applied, skipped }
}
```

- [ ] **Step 4: Run simulator tests**

```bash
npx vitest run tests/utils/ruleConflictDetector.test.js
```

Expected: all pass.

- [ ] **Step 5: Write failing RulePriorityPreview tests**

Create `tests/components/RulePriorityPreview.test.js`:

```js
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import RulePriorityPreview from '../../src/components/promotions/RulePriorityPreview.vue'

const vuetify = createVuetify({ components, directives })
const mountComp = (rules) => mount(RulePriorityPreview, {
  props: { rules },
  global: { plugins: [vuetify] },
})

const active = (id, priority) => ({ id, name: `Rule ${id}`, status: 'active', priority, type: 'discount', conditions: [], gifts: [] })

describe('RulePriorityPreview', () => {
  it('renders nothing when no active rules', () => {
    const w = mountComp([])
    expect(w.find('.v-card').exists()).toBe(false)
  })

  it('shows applied rule count', () => {
    const w = mountComp([active('a', 1), active('b', 2)])
    expect(w.text()).toContain('2 rule')
  })

  it('shows details on expand', async () => {
    const w = mountComp([active('a', 1)])
    await w.find('button').trigger('click')
    expect(w.text()).toContain('Rule a')
  })
})
```

- [ ] **Step 6: Create RulePriorityPreview.vue**

Create `src/components/promotions/RulePriorityPreview.vue`:

```vue
<!-- src/components/promotions/RulePriorityPreview.vue -->
<template>
  <v-card v-if="result.applied.length || result.skipped.length" border elevation="0" class="pa-4 mb-4" color="success" variant="tonal">
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-arrow-right-circle" color="success" />
        <div>
          <div class="text-body-2 font-weight-bold">Priority-based application preview</div>
          <div class="text-caption text-medium-emphasis">
            {{ result.applied.length }} rule{{ result.applied.length !== 1 ? 's' : '' }} will apply
            <span v-if="result.skipped.length">, {{ result.skipped.length }} skipped</span>
          </div>
        </div>
      </div>
      <v-btn variant="text" size="small" @click="expanded = !expanded">
        {{ expanded ? 'Hide' : 'Show' }} details
        <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="expanded" class="mt-4">
        <!-- Applied -->
        <div v-if="result.applied.length" class="mb-4">
          <div class="text-caption font-weight-bold text-success mb-2">WILL APPLY (in priority order)</div>
          <div
            v-for="(rule, i) in result.applied"
            :key="rule.id"
            class="d-flex align-center gap-3 pa-3 mb-2 rounded bg-white"
            style="border:1px solid rgba(var(--v-theme-success),0.3)"
          >
            <div
              class="text-caption font-weight-bold rounded-circle d-flex align-center justify-center flex-shrink-0"
              style="width:28px;height:28px;background:rgba(var(--v-theme-success),0.15)"
            >{{ i + 1 }}</div>
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-bold">{{ rule.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ rule.type.replace('_', ' ') }} · Priority {{ rule.priority ?? 'unset' }}</div>
            </div>
            <v-chip color="success" variant="tonal" size="x-small">Applied</v-chip>
          </div>
        </div>

        <!-- Skipped -->
        <div v-if="result.skipped.length" class="mb-3">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-2">SKIPPED</div>
          <div
            v-for="{ rule, reason } in result.skipped"
            :key="rule.id"
            class="d-flex align-center gap-3 pa-3 mb-2 rounded"
            style="border:1px solid rgba(0,0,0,0.08);opacity:0.65"
          >
            <v-icon icon="mdi-close-circle-outline" size="20" color="medium-emphasis" />
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-bold">{{ rule.name }}</div>
              <div class="text-caption text-error">{{ reason }}</div>
            </div>
            <v-chip variant="outlined" size="x-small">Skipped</v-chip>
          </div>
        </div>

        <v-alert type="info" variant="tonal" density="compact" icon="mdi-information">
          Rules apply in priority order (lower number first). Gift rules can stack with discount rules.
        </v-alert>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { simulateRuleApplication } from '../../utils/ruleConflictDetector'

const props = defineProps({
  rules: { type: Array, required: true },
})

const expanded = ref(false)
const result = computed(() => simulateRuleApplication(props.rules))
</script>
```

- [ ] **Step 7: Add RulePriorityPreview to PromotionsList**

In `src/components/promotions/PromotionsList.vue`, add import:
```js
import RulePriorityPreview from './RulePriorityPreview.vue'
```

Add the component in the template, above the tabs row (after search field):
```vue
<RulePriorityPreview :rules="store.items" class="mb-4" />
```

- [ ] **Step 8: Run tests**

```bash
npm test
```

Expected: all pass including new tests.

- [ ] **Step 9: Commit**

```bash
git add src/utils/ruleConflictDetector.js src/components/promotions/RulePriorityPreview.vue src/components/promotions/PromotionsList.vue tests/utils/ruleConflictDetector.test.js tests/components/RulePriorityPreview.test.js
git commit -m "feat: add rule priority simulator with RulePriorityPreview component"
```

---

## Task 4: ConditionBuilder Step-Wizard Upgrade

**Files:**
- Modify: `src/components/promotions/ConditionBuilderDialog.vue` (rewrite as 2-step wizard)
- Create: `tests/components/ConditionBuilderDialog.test.js`

The current dialog is a flat form with a single v-select for type. Replace it with a 2-step approach:
- **Step 1:** Choose condition type from a categorized grid (Product / Customer / Threshold / Advanced)
- **Step 2:** Configure value (proper inputs per type: combobox, multi-select chips, numeric+operator, boolean toggle)

The external interface stays the same: props `modelValue`, `initialCondition`; emits `update:modelValue`, `save`.

- [ ] **Step 1: Write failing tests**

Create `tests/components/ConditionBuilderDialog.test.js`:

```js
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ConditionBuilderDialog from '../../src/components/promotions/ConditionBuilderDialog.vue'

const vuetify = createVuetify({ components, directives })
const mountDialog = (props = {}) =>
  mount(ConditionBuilderDialog, {
    attachTo: document.body,
    props: { modelValue: true, ...props },
    global: { plugins: [vuetify] },
  })

describe('ConditionBuilderDialog', () => {
  it('shows type selector in step 1 with category groups', () => {
    mountDialog()
    expect(document.body.textContent).toMatch(/Product|Customer|Threshold/)
  })

  it('shows condition type options', () => {
    mountDialog()
    expect(document.body.textContent).toMatch(/Brands|Categories|Subtotal/)
  })

  it('in edit mode starts on step 2 (value config)', () => {
    mountDialog({ initialCondition: { id: 'c1', field: 'brands', mode: 'include', values: ['Nike'] } })
    expect(document.body.textContent).toContain('Brands')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/components/ConditionBuilderDialog.test.js
```

- [ ] **Step 3: Rewrite ConditionBuilderDialog.vue**

Replace the entire file `src/components/promotions/ConditionBuilderDialog.vue` with:

```vue
<!-- src/components/promotions/ConditionBuilderDialog.vue -->
<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="pa-5 pb-2">
        {{ isEditMode ? 'Edit condition' : 'Add condition' }}
        <span v-if="!isEditMode" class="text-caption text-medium-emphasis ml-2">Step {{ step }} of 2</span>
      </v-card-title>

      <!-- Step 1: Type selector -->
      <v-card-text v-if="step === 1" class="pa-5 pt-2">
        <div v-for="cat in conditionCategories" :key="cat.key" class="mb-4">
          <div class="d-flex align-center gap-2 mb-2">
            <v-icon :icon="cat.icon" size="18" color="primary" />
            <div>
              <div class="text-body-2 font-weight-bold">{{ cat.label }}</div>
              <div class="text-caption text-medium-emphasis">{{ cat.description }}</div>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              v-for="type in cat.types"
              :key="type.value"
              variant="outlined"
              size="small"
              :color="selectedField === type.value ? 'primary' : undefined"
              :class="selectedField === type.value ? 'border-primary' : ''"
              @click="selectType(type.value)"
            >
              {{ type.title }}
              <v-icon v-if="selectedField === type.value" icon="mdi-check" size="14" class="ml-1" />
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <!-- Step 2: Value configuration -->
      <v-card-text v-else class="pa-5 pt-2">
        <div class="d-flex align-center gap-2 mb-4">
          <v-chip color="primary" variant="tonal" size="small" label>
            {{ currentTypeDef?.title }}
          </v-chip>
          <v-btn
            v-if="!isEditMode"
            variant="text"
            size="x-small"
            prepend-icon="mdi-arrow-left"
            @click="step = 1"
          >Change type</v-btn>
        </div>

        <!-- Mode toggle -->
        <div v-if="currentTypeDef?.supportsMode" class="mb-4">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-1">MODE</div>
          <v-btn-toggle v-model="localCondition.mode" mandatory density="compact" variant="outlined" color="primary">
            <v-btn value="include" size="small">Include</v-btn>
            <v-btn value="exclude" size="small">Exclude</v-btn>
          </v-btn-toggle>
        </div>

        <!-- Operator for quantifiable types -->
        <v-select
          v-if="currentTypeDef?.quantifiable"
          v-model="localCondition.operator"
          :items="operatorItems"
          label="Operator"
          variant="outlined"
          density="compact"
          class="mb-3"
        />

        <!-- Boolean toggle (excludeOnSale) -->
        <div v-if="currentTypeDef?.boolean" class="d-flex align-center justify-space-between mb-3 pa-3 rounded border">
          <span class="text-body-2">{{ currentTypeDef.title }}</span>
          <v-switch
            :model-value="localCondition.values[0] === 'true'"
            color="primary"
            hide-details
            density="compact"
            inset
            @update:model-value="v => localCondition.values = [String(v)]"
          />
        </div>

        <!-- Multi-select combobox for list types -->
        <v-combobox
          v-else-if="!currentTypeDef?.quantifiable"
          v-model="localCondition.values"
          :label="currentTypeDef?.title + ' values'"
          :items="currentTypeOptions"
          variant="outlined"
          density="compact"
          multiple
          chips
          closable-chips
          hint="Select from the list or type to add custom values"
          persistent-hint
          class="mb-3"
        />

        <!-- Numeric input for quantifiable types -->
        <v-text-field
          v-else
          :model-value="localCondition.values[0] ?? ''"
          :label="currentTypeDef?.title + ' value'"
          type="number"
          variant="outlined"
          density="compact"
          hint="Enter a numeric threshold"
          persistent-hint
          class="mb-3"
          @update:model-value="v => localCondition.values = [v]"
        />

        <!-- Validation errors -->
        <v-alert
          v-if="validationErrors.length"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          <ul class="ma-0 pl-4">
            <li v-for="e in validationErrors" :key="e">{{ e }}</li>
          </ul>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn
          v-if="step === 1"
          color="primary"
          variant="flat"
          :disabled="!selectedField"
          @click="step = 2"
        >Next</v-btn>
        <v-btn
          v-else
          color="primary"
          variant="flat"
          @click="handleSave"
        >{{ isEditMode ? 'Update' : 'Add condition' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuid } from 'uuid'
import { validateCondition } from '../../utils/conditionValidator'

// --- Type definitions ---
const CONDITION_TYPES = [
  { value: 'categories',     title: 'Categories',     supportsMode: true,  quantifiable: false },
  { value: 'brands',         title: 'Brands',         supportsMode: true,  quantifiable: false },
  { value: 'skus',           title: 'SKUs',           supportsMode: true,  quantifiable: false },
  { value: 'product_lines',  title: 'Product lines',  supportsMode: true,  quantifiable: false },
  { value: 'subtotal',       title: 'Subtotal',       supportsMode: false, quantifiable: true  },
  { value: 'quantity',       title: 'Quantity',       supportsMode: false, quantifiable: true  },
  { value: 'weight',         title: 'Weight',         supportsMode: false, quantifiable: true  },
  { value: 'customer_group', title: 'Customer group', supportsMode: true,  quantifiable: false },
  { value: 'coupon_code',    title: 'Coupon code',    supportsMode: false, quantifiable: false },
  { value: 'exclude_on_sale',title: 'Exclude on sale',supportsMode: false, quantifiable: false, boolean: true },
  { value: 'pim_status',     title: 'PIM status',     supportsMode: true,  quantifiable: false },
  { value: 'attribute_set',  title: 'Attribute set',  supportsMode: true,  quantifiable: false },
  { value: 'source',         title: 'Source',         supportsMode: true,  quantifiable: false },
  { value: 'warehouse_type', title: 'Warehouse type', supportsMode: true,  quantifiable: false },
  { value: 'seller',         title: 'Seller',         supportsMode: true,  quantifiable: false },
]

const conditionCategories = [
  {
    key: 'product', label: 'Product', icon: 'mdi-package-variant',
    description: 'Target by product attributes',
    types: CONDITION_TYPES.filter(t => ['categories', 'brands', 'skus', 'product_lines'].includes(t.value)),
  },
  {
    key: 'customer', label: 'Customer', icon: 'mdi-account-group',
    description: 'Target by customer attributes',
    types: CONDITION_TYPES.filter(t => ['customer_group', 'coupon_code'].includes(t.value)),
  },
  {
    key: 'threshold', label: 'Threshold', icon: 'mdi-trending-up',
    description: 'Minimum purchase requirements',
    types: CONDITION_TYPES.filter(t => ['subtotal', 'quantity', 'weight'].includes(t.value)),
  },
  {
    key: 'advanced', label: 'Advanced', icon: 'mdi-tune',
    description: 'PIM, warehouse, and catalog filters',
    types: CONDITION_TYPES.filter(t => ['pim_status', 'attribute_set', 'source', 'warehouse_type', 'seller', 'exclude_on_sale'].includes(t.value)),
  },
]

// Preset options per type
const TYPE_OPTIONS = {
  categories:     ['Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 'Beauty & Health', 'Books', 'Toys & Games'],
  brands:         ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'Puma', 'Under Armour'],
  customer_group: ['VIP', 'Premium', 'New', 'Loyal'],
  pim_status:     ['Active', 'Draft', 'Archived'],
  warehouse_type: ['Standard', 'Dropship', 'Express'],
  source:         ['Web', 'Mobile', 'App'],
}

const operatorItems = [
  { value: '>=', title: 'At least (≥)' },
  { value: '>',  title: 'More than (>)'  },
  { value: '<=', title: 'At most (≤)'   },
  { value: '<',  title: 'Less than (<)'  },
]

// --- Props / emits ---
const props = defineProps({
  modelValue: Boolean,
  initialCondition: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'save'])

// --- State ---
const step = ref(props.initialCondition ? 2 : 1)
const selectedField = ref(props.initialCondition?.field ?? null)
const localCondition = ref({ field: 'categories', mode: 'include', values: [], operator: '>=' })

const isEditMode = computed(() => !!props.initialCondition)
const currentTypeDef = computed(() => CONDITION_TYPES.find(t => t.value === localCondition.value.field))
const currentTypeOptions = computed(() => TYPE_OPTIONS[localCondition.value.field] ?? [])
const validationErrors = computed(() => validateCondition(localCondition.value).errors)

// --- Watchers ---
watch(() => props.initialCondition, (val) => {
  if (val) {
    localCondition.value = { ...val }
    selectedField.value = val.field
    step.value = 2
  } else {
    localCondition.value = { field: 'categories', mode: 'include', values: [], operator: '>=' }
    selectedField.value = null
    step.value = 1
  }
}, { immediate: true })

watch(() => props.modelValue, (open) => {
  if (open && !props.initialCondition) {
    step.value = 1
    selectedField.value = null
    localCondition.value = { field: 'categories', mode: 'include', values: [], operator: '>=' }
  }
})

// --- Methods ---
function selectType(field) {
  selectedField.value = field
  localCondition.value.field = field
  localCondition.value.values = []
  localCondition.value.operator = currentTypeDef.value?.quantifiable ? '>=' : undefined
  if (!currentTypeDef.value?.supportsMode) localCondition.value.mode = 'include'
}

function handleSave() {
  if (validationErrors.value.length) return
  emit('save', { ...localCondition.value, id: props.initialCondition?.id || uuid() })
  emit('update:modelValue', false)
}
</script>
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/components/ConditionBuilderDialog.test.js
```

Expected: 3 pass.

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/promotions/ConditionBuilderDialog.vue tests/components/ConditionBuilderDialog.test.js
git commit -m "feat: upgrade ConditionBuilderDialog to 2-step wizard with categorized type selector"
```

---

## Task 5: AI Recommendations Panel

**Files:**
- Create: `src/components/ai/AiRecommendationsPanel.vue`
- Modify: `src/components/promotions/PromotionsList.vue` (add panel above table)
- Create: `tests/components/AiRecommendationsPanel.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/components/AiRecommendationsPanel.test.js`:

```js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import AiRecommendationsPanel from '../../src/components/ai/AiRecommendationsPanel.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })
const mountPanel = () =>
  mount(AiRecommendationsPanel, {
    global: { plugins: [createTestingPinia(), vuetify] },
  })

describe('AiRecommendationsPanel', () => {
  it('renders recommendation cards', () => {
    const w = mountPanel()
    expect(w.text()).toContain('AI Recommendations')
  })

  it('shows at least one recommendation', () => {
    const w = mountPanel()
    expect(w.text()).toMatch(/Step Discount|Multi Buy|Gift Promotion|VIP/)
  })

  it('shows potential revenue for each recommendation', () => {
    const w = mountPanel()
    expect(w.text()).toMatch(/€\d/)
  })

  it('shows confidence score', () => {
    const w = mountPanel()
    expect(w.text()).toMatch(/\d+%/)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/components/AiRecommendationsPanel.test.js
```

- [ ] **Step 3: Create AiRecommendationsPanel.vue**

Create `src/components/ai/AiRecommendationsPanel.vue`:

```vue
<!-- src/components/ai/AiRecommendationsPanel.vue -->
<template>
  <v-card border elevation="0" class="pa-4 mb-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-creation" color="primary" />
        <div>
          <div class="text-body-2 font-weight-bold">AI Recommendations</div>
          <div class="text-caption text-medium-emphasis">Based on your catalog and current promotions</div>
        </div>
      </div>
      <v-btn variant="text" size="small" @click="expanded = !expanded">
        {{ expanded ? 'Hide' : 'Show' }}
        <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="expanded">
        <div class="d-flex flex-wrap gap-3">
          <v-card
            v-for="rec in recommendations"
            :key="rec.id"
            border
            elevation="0"
            class="pa-3 flex-grow-1"
            style="min-width:240px;max-width:320px"
          >
            <div class="d-flex align-center gap-2 mb-2">
              <v-chip
                :color="impactColor(rec.impact)"
                variant="tonal"
                size="x-small"
                label
              >{{ rec.impact }} impact</v-chip>
              <v-chip
                v-if="appliedIds.includes(rec.id)"
                color="success"
                variant="tonal"
                size="x-small"
                label
              >Applied</v-chip>
            </div>
            <div class="text-body-2 font-weight-bold mb-1">{{ rec.title }}</div>
            <div class="text-caption text-medium-emphasis mb-2">{{ rec.description }}</div>
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-caption text-medium-emphasis">Potential revenue</div>
                <div class="text-body-2 font-weight-bold text-success">{{ rec.potentialRevenue }}</div>
              </div>
              <div class="text-right">
                <div class="text-caption text-medium-emphasis">Confidence</div>
                <div class="text-body-2 font-weight-bold">{{ rec.confidence }}%</div>
              </div>
            </div>
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              :disabled="appliedIds.includes(rec.id)"
              :loading="applyingId === rec.id"
              class="text-uppercase w-100"
              @click="applyRecommendation(rec)"
            >
              <v-icon icon="mdi-check" class="mr-1" />
              Apply rule
            </v-btn>
          </v-card>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { usePromotionsStore } from '../../stores/promotions'

const store = usePromotionsStore()
const expanded = ref(true)
const appliedIds = ref([])
const applyingId = ref(null)

const recommendations = [
  {
    id: 'rec-1',
    title: 'Step Discount — High Spenders',
    description: '€20 off for every €200 spent. Encourages larger basket sizes.',
    impact: 'High',
    potentialRevenue: '€45,000',
    confidence: 92,
    ruleData: { name: 'Step Discount — High Spenders', type: 'step_discount', value: '20', valueUnit: '%', status: 'active', conditions: [], gifts: [], steps: [], priority: 10 },
  },
  {
    id: 'rec-2',
    title: 'Multi Buy Deal',
    description: 'Buy 2 Get 1 Free. Increases average order value.',
    impact: 'Medium',
    potentialRevenue: '€32,000',
    confidence: 85,
    ruleData: { name: 'Multi Buy — Buy 2 Get 1 Free', type: 'multi_buy', value: '0', valueUnit: '%', status: 'active', conditions: [], gifts: [], steps: [], priority: 20 },
  },
  {
    id: 'rec-3',
    title: 'Gift Promotion',
    description: 'Free gift with purchase over €100. Retention focused.',
    impact: 'Medium',
    potentialRevenue: '€28,000',
    confidence: 78,
    ruleData: { name: 'Gift Promotion — Free Gift', type: 'gift', value: '0', valueUnit: '%', status: 'active', conditions: [{ id: 'g1', field: 'subtotal', mode: 'include', values: ['100'], operator: '>=' }], gifts: [], steps: [], priority: 30 },
  },
  {
    id: 'rec-4',
    title: 'VIP Loyalty Discount',
    description: '15% off all purchases for VIP customers.',
    impact: 'High',
    potentialRevenue: '€38,000',
    confidence: 90,
    ruleData: { name: 'VIP Loyalty Discount', type: 'discount', value: '15', valueUnit: '%', status: 'active', conditions: [{ id: 'v1', field: 'customer_group', mode: 'include', values: ['VIP'] }], gifts: [], steps: [], priority: 5 },
  },
]

function impactColor(impact) {
  return { High: 'success', Medium: 'warning', Low: 'default' }[impact] ?? 'default'
}

async function applyRecommendation(rec) {
  applyingId.value = rec.id
  try {
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    await store.create({ ...rec.ruleData, startDate: today, endDate, createdBy: 'AI Recommendation' })
    appliedIds.value.push(rec.id)
  } catch {
    // store.error already set
  } finally {
    applyingId.value = null
  }
}
</script>
```

- [ ] **Step 4: Add AiRecommendationsPanel to PromotionsList**

In `src/components/promotions/PromotionsList.vue`:

Add import:
```js
import AiRecommendationsPanel from '../ai/AiRecommendationsPanel.vue'
```

Add in template, between the search field and RulePriorityPreview:
```vue
<AiRecommendationsPanel class="mb-4" />
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ai/AiRecommendationsPanel.vue src/components/promotions/PromotionsList.vue tests/components/AiRecommendationsPanel.test.js
git commit -m "feat: add AI Recommendations panel with one-click rule creation"
```

---

## Task 6: conditionParser Utility

**Files:**
- Create: `src/utils/conditionParser.js`
- Create: `tests/utils/conditionParser.test.js`

This utility is used by the AI assistant and smart preview to convert parsed rule data into condition objects compatible with the form.

- [ ] **Step 1: Write failing tests**

Create `tests/utils/conditionParser.test.js`:

```js
import { parsedConditionsToWizardConditions, formatConditionsSummary, generateConditionSuggestions } from '../../src/utils/conditionParser'

describe('parsedConditionsToWizardConditions', () => {
  it('returns empty array for no conditions', () => {
    expect(parsedConditionsToWizardConditions({ conditions: [] })).toEqual([])
  })

  it('maps brand field to brands condition', () => {
    const result = parsedConditionsToWizardConditions({
      conditions: [{ field: 'brand', mode: 'include', values: ['Nike'] }],
    })
    expect(result[0].field).toBe('brands')
    expect(result[0].values).toEqual(['Nike'])
  })

  it('preserves operator on quantifiable conditions', () => {
    const result = parsedConditionsToWizardConditions({
      conditions: [{ field: 'subtotal', mode: 'include', values: ['100'], operator: '>=' }],
    })
    expect(result[0].operator).toBe('>=')
  })

  it('skips unknown fields with a warning', () => {
    const result = parsedConditionsToWizardConditions({
      conditions: [{ field: 'unknownField', mode: 'include', values: ['x'] }],
    })
    expect(result).toHaveLength(0)
  })
})

describe('formatConditionsSummary', () => {
  it('returns "No conditions" for empty array', () => {
    expect(formatConditionsSummary([])).toBe('No conditions')
  })

  it('summarizes include condition', () => {
    const result = formatConditionsSummary([{ field: 'brands', mode: 'include', values: ['Nike', 'Adidas'] }])
    expect(result).toContain('Brands')
    expect(result).toContain('Nike')
  })

  it('summarizes quantifiable condition with operator', () => {
    const result = formatConditionsSummary([{ field: 'subtotal', mode: 'include', values: ['100'], operator: '>=' }])
    expect(result).toContain('at least')
    expect(result).toContain('100')
  })
})

describe('generateConditionSuggestions', () => {
  it('suggests adding product filters when none present', () => {
    const result = generateConditionSuggestions([])
    expect(result).toContain('product filters')
  })

  it('returns empty string when conditions are comprehensive', () => {
    const conditions = [
      { field: 'brands', mode: 'include', values: ['Nike'] },
      { field: 'subtotal', mode: 'include', values: ['50'], operator: '>=' },
    ]
    // Should have no suggestions (both product and threshold covered)
    const result = generateConditionSuggestions(conditions)
    expect(typeof result).toBe('string')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/utils/conditionParser.test.js
```

- [ ] **Step 3: Create conditionParser.js**

Create `src/utils/conditionParser.js`:

```js
// src/utils/conditionParser.js
// Maps NLP-parsed field names to Vue condition type values (matching ConditionBuilderDialog CONDITION_TYPES)
const fieldToConditionType = {
  category:      'categories',
  categories:    'categories',
  sku:           'skus',
  skus:          'skus',
  brand:         'brands',
  brands:        'brands',
  productLine:   'product_lines',
  productLines:  'product_lines',
  couponCode:    'coupon_code',
  customerGroup: 'customer_group',
  pimStatus:     'pim_status',
  attributeSet:  'attribute_set',
  source:        'source',
  warehouseType: 'warehouse_type',
  seller:        'seller',
  excludeOnSale: 'exclude_on_sale',
  quantity:      'quantity',
  subtotal:      'subtotal',
  weight:        'weight',
}

const fieldLabels = {
  categories: 'Categories', skus: 'SKUs', brands: 'Brands',
  product_lines: 'Product lines', coupon_code: 'Coupon code',
  customer_group: 'Customer group', pim_status: 'PIM status',
  attribute_set: 'Attribute set', source: 'Source',
  warehouse_type: 'Warehouse type', seller: 'Seller',
  exclude_on_sale: 'Exclude on sale', quantity: 'Quantity',
  subtotal: 'Subtotal', weight: 'Weight',
}

let _idCounter = 0
function genId() {
  return `cond_${Date.now()}_${++_idCounter}`
}

/**
 * Convert parsed NLP conditions to wizard-compatible condition objects.
 * @param {Object} parsedData - Object with a `conditions` array from naturalLanguageParser
 * @returns {Array} Condition objects compatible with ConditionBuilderDialog
 */
export function parsedConditionsToWizardConditions(parsedData) {
  if (!parsedData?.conditions?.length) return []
  const result = []
  for (const c of parsedData.conditions) {
    const mapped = fieldToConditionType[c.field]
    if (!mapped) {
      console.warn(`[conditionParser] Unknown field: ${c.field}`)
      continue
    }
    result.push({
      id: c.id ?? genId(),
      field: mapped,
      mode: c.mode ?? 'include',
      values: c.values ?? [],
      operator: c.operator,
    })
  }
  return result
}

/**
 * Format conditions as a human-readable summary string.
 * @param {Array} conditions
 * @returns {string}
 */
export function formatConditionsSummary(conditions) {
  if (!conditions?.length) return 'No conditions'
  const opLabels = { '>=': 'at least', '>': 'greater than', '<=': 'at most', '<': 'less than' }
  return conditions.map(c => {
    const label = fieldLabels[c.field] ?? c.field
    const modeIcon = c.mode === 'include' ? '✅' : '❌'
    if (c.field === 'exclude_on_sale') return `${modeIcon} Exclude items on sale`
    if (c.operator) {
      const opLabel = opLabels[c.operator] ?? c.operator
      return `${modeIcon} ${label}: ${opLabel} ${c.values[0]}`
    }
    const vals = c.values.length <= 2 ? c.values.join(', ') : `${c.values[0]} +${c.values.length - 1} more`
    return `${modeIcon} ${label}: ${vals}`
  }).join('\n')
}

/**
 * Suggest missing conditions based on what's already configured.
 * @param {Array} conditions
 * @returns {string} Suggestion message or empty string
 */
export function generateConditionSuggestions(conditions) {
  if (!conditions?.length) {
    return 'I didn\'t detect any conditions. Consider adding product filters (categories/brands) to target specific items.'
  }
  const suggestions = []
  const hasProduct = conditions.some(c => ['categories', 'brands', 'skus', 'product_lines'].includes(c.field))
  const hasThreshold = conditions.some(c => ['subtotal', 'quantity', 'weight'].includes(c.field))
  if (!hasProduct) suggestions.push('Add product filters (categories/brands) to target specific items')
  if (!hasThreshold) suggestions.push('Consider adding a minimum purchase requirement')
  if (conditions.length === 1) suggestions.push('All conditions use AND logic — add more for precise targeting')
  return suggestions.length ? `💡 Suggestions:\n• ${suggestions.join('\n• ')}` : ''
}

/**
 * Check if parsed data has sufficient confidence for smart rule creation.
 * @param {Object} parsedData
 * @returns {boolean}
 */
export function hasGoodConditionConfidence(parsedData) {
  const hasConditions = parsedData?.conditions?.length > 0
  const hasGoodConfidence = (parsedData?.confidence ?? 0) >= 0.6
  return hasConditions || hasGoodConfidence
}
```

- [ ] **Step 4: Run conditionParser tests**

```bash
npx vitest run tests/utils/conditionParser.test.js
```

Expected: all pass.

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/utils/conditionParser.js tests/utils/conditionParser.test.js
git commit -m "feat: add conditionParser utility for NLP → wizard condition mapping"
```

---

## Task 7: Final Smoke Test + Push

**Files:** None new.

- [ ] **Step 1: Run full test suite**

```bash
cd /Users/lukaspajma/tars/prototypes/promotions-vue && npm test
```

Expected: all tests pass (68 baseline + ~20 new ≈ 88 total).

- [ ] **Step 2: Push to remote**

```bash
git push origin main
```

- [ ] **Step 3: Done**

Phase 3 complete. All React prototype features are now implemented in the Vue refactor.
