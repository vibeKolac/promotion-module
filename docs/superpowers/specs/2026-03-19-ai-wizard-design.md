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
- `src/stores/ui.js` — add wizard state fields + 6 actions
- `src/components/ai/AiAssistantPanel.vue` — "Guide me" button in header; renders `<WizardPanel>` in a `v-expand-transition` above the chat input

### New test files
- `tests/components/WizardPanel.test.js` — 6 tests
- `tests/stores/ui.test.js` — extend existing file with 5 wizard action tests
- `tests/components/AiAssistantPanel.test.js` — extend existing file with 2 tests

---

## State (uiStore additions)

```js
// State fields
wizardActive: false,
wizardCollapsed: false,
wizardMode: null,      // 'template' | 'custom'
wizardStep: 0,         // 0 = mode selector, 1–N = active steps
wizardData: {},        // accumulated: { type, duration, target, value, name, startDate, endDate }

// Actions
startWizard(mode)            // set wizardActive=true, mode, step=1; step=0 if mode is null (show selector)
wizardNext(stepId, value)    // record wizardData[stepId]=value, increment wizardStep
wizardBack()                 // decrement wizardStep, no-op at step 1
wizardGoToStep(n)            // jump to step n only if n < current step (back navigation only)
wizardReset()                // clear wizardActive, mode, step, data, collapsed
toggleWizardCollapsed()      // toggle wizardCollapsed
```

---

## Wizard Flows

### Entry point
A "Guide me" button in the `AiAssistantPanel` header. Clicking it calls `uiStore.startWizard(null)` which shows the mode selector (step 0).

### Mode selector (step 0)
Two `v-card` options side by side:
- **Start from template** — launches template flow, sets `wizardMode='template'`, `wizardStep=1`
- **Build from scratch** — launches custom flow, sets `wizardMode='custom'`, `wizardStep=1`

---

### Custom flow — 5 steps

| Step | stepId | Label | UI | Options |
|---|---|---|---|---|
| 1 | `type` | Type | Chip grid | Discount, Step Discount, Multi-buy, Gift |
| 2 | `duration` | Duration | Chip grid | Today, Weekend, 1 week, 2 weeks, 1 month, 3 months |
| 3 | `target` | Target | Chip grid + text input | All products, Electronics, Clothing, Health & Drugs, Skincare, Footwear; free-text "Brand..." |
| 4 | `value` | Value | Chips or text input | Discount: 10/15/20/25/30%/custom; Multi-buy: 2+1/3+1/3+2/custom; Gift/Step discount: free text input + Next button |
| 5 | — | Confirm | Summary card | "Create Promotion" + "Edit Details" |

Chip selection auto-advances to the next step. Steps with free-text input show an explicit Next button.

---

### Template flow — 3 steps

| Step | Label | UI |
|---|---|---|
| 1 | Select | Grid of template cards (6 templates from existing template data); clicking a template populates wizardData and advances |
| 2 | Customize | 1–2 quick-action chip sets for the template's customizable fields (value and/or target) |
| 3 | Confirm | Same summary card as custom flow |

---

## WizardPanel.vue Component Design

**No props** — reads all state from `uiStore` directly. Calls store actions internally. Emits nothing.

### Three visual zones

**Zone 1 — Header bar**
- "Guided Setup" title
- Current step label (e.g. "Step 2 of 5: Duration")
- Collapse toggle button (`mdi-chevron-up/down`) → `toggleWizardCollapsed()`
- Close button (`mdi-close`) → `wizardReset()`

**Zone 2 — Progress bar** (hidden when collapsed)
- `v-progress-linear` at `(wizardStep / totalSteps) * 100`
- Clickable step labels below: completed steps are active (call `wizardGoToStep(n)`), future steps are greyed/disabled

**Zone 3 — Step content** (hidden when collapsed, switches on `wizardStep` + `wizardMode`)
- **Step 0**: two `v-card` mode selector options
- **Chip steps**: `v-chip-group` with chip options; selecting a chip calls `wizardNext(stepId, value)` and auto-advances
- **Text input steps** (gift/step_discount value): `v-text-field` + explicit "Next" `v-btn`
- **Confirm step**: `v-list` summary of all collected data + two action buttons

### Confirmation actions
- **Create Promotion** → builds rule payload from `wizardData`, calls `store.create(payload)`, calls `wizardReset()`, navigates to `/promotions`
- **Edit Details** → calls `store.applyWizardDraft(wizardData)` (new store action that fills `formDraft`), calls `wizardReset()`, navigates to `/promotions/new`

---

## AiAssistantPanel.vue Changes

- Add "Guide me" `v-btn` (outlined, small) in the panel header next to the title
- Wrap `<WizardPanel>` in `v-expand-transition` above the chat message list:
  ```vue
  <v-expand-transition>
    <WizardPanel v-if="uiStore.wizardActive" />
  </v-expand-transition>
  ```
- No other changes — wizard is fully self-contained

---

## Testing

**`tests/stores/ui.test.js`** — 5 new tests:
1. `startWizard('custom')` sets wizardActive=true, mode='custom', step=1
2. `wizardNext('type', 'discount')` records data and increments step
3. `wizardBack()` decrements step; no-ops at step 1
4. `wizardGoToStep(2)` when current is step 4 → jumps to step 2; ignores forward jumps
5. `wizardReset()` clears all wizard state fields

**`tests/components/WizardPanel.test.js`** — 6 tests:
1. Renders mode selector when wizardStep=0
2. Renders chip grid for Type step (custom flow, step=1)
3. Renders chip grid for Duration step (step=2)
4. Renders text input for Gift value step (type='gift', step=4)
5. Renders confirm card at final step
6. Clicking a chip calls `wizardNext` with correct stepId and value

**`tests/components/AiAssistantPanel.test.js`** — 2 new tests:
1. "Guide me" button exists in panel header
2. Clicking "Guide me" calls `uiStore.startWizard`

**Target:** ~121 tests total (112 existing + 13 new)

---

## Explicitly Out of Scope

- No `WizardStateManager` class — Pinia handles all state
- No `WizardStepContainer`, `WizardMessage`, `QuickActionButtons` as separate components — all inline in `WizardPanel.vue`
- No undo/history tracking beyond back navigation
- No floating/inline chat variants
- No server-side template fetching — templates hardcoded (matching existing `TemplatesPage.vue` data)
