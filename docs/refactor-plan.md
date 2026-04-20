# Refactor Plan — Align prototype to global component library

Goal: Replace prototype's raw Vuetify patterns with global components from `drmax-eshop-admin-client/_common/components` wherever a match exists. No logic changes. Visual appearance stays materially the same.

See `docs/design-library.md` for component reference.

---

## Scope

- Replace matched components one file at a time
- Keep all business logic, computed values, watchers, store interactions untouched
- Do not introduce vee-validate or `FormGroup` — the prototype uses manual `ref`-based validation and that stays
- Item shape for `SelectInput` uses `{ key, label }` — needs mapping from prototype's `{ value, title }` when swapping
- Do not port `Dynamic.vue` (DataTable wrapper) until the prototype has real server pagination; the wrapper's `serverItemsLength` and `update:options` events require a connected backend

---

## Changes by file

### 1. `PromotionForm.vue`

Priority: **High** — largest file, most form inputs.

| Current | Replace with | Notes |
|---|---|---|
| `v-text-field` (rule name) | `TextInput` | Add `id`, `name`; remove manual `v-if` error div — `TextInput` renders errors via vee-validate. Keep manual validation for now; use `TextInput` for visual consistency only, pass `:error-messages` via prop |
| `v-select` (rule type, amount type, step type, selection mode) | `SelectInput` | Remap items from `{ value, title }` → `{ key, label }`, or pass `item-value="value" item-text="title"` via attrs if SelectInput supports passthrough |
| `v-text-field type="number"` (discount amount, quantities, thresholds, max steps) | `NumberInput` | Same as TextInput — use for visual consistency |
| `v-textarea` (internal description, promo text, promo legal) | Raw `v-textarea` — keep | No global wrapper found |
| `v-date-input` (start date, end date, pause from, pause until) | `DatePicker` | Already matching the pattern; swap to the wrapper when vee-validate is adopted. For now, keep `v-date-input` direct |
| `v-snackbar` (save error) | `ApiErrorAlert` | Place below the save button area; removes the snackbar in favour of an inline alert |
| `ConfirmDeleteDialog` (none in this file) | — | N/A |

**Skip for now:** `v-btn`, `v-btn-toggle`, `v-checkbox`, `v-switch`, `v-alert`, `v-breadcrumbs`, `v-textarea` — no global wrappers, raw Vuetify stays.

---

### 2. `PromotionsList.vue`

Priority: **Medium** — table and filter area are the main candidates.

| Current | Replace with | Notes |
|---|---|---|
| `v-text-field` (search) | `TextInput` | Visual consistency |
| `v-select` (type filter, status filter) | `SelectInput` | Remap item shape |
| `v-data-table` with headers + row templates | `Dynamic` | **Defer until server pagination is wired.** When ready: move headers to the `Header[]` shape, pass `server-items-length`, emit `update:options` for sort/page. Built-in column picker and export would replace the current toolbar actions |
| `ConfirmDeleteDialog` | `ConfirmModal` | Swap `v-model` + `@confirm` / `@cancel` emit pattern for `ref.open(item)` promise pattern. Update the delete handler to `await confirmModal.open(item)` |
| Row action `v-menu` + `v-list` | Keep as-is | ADO's `ui/menu/MenuItem` wrapper exists but adds no value here |

---

### 3. `ConditionBuilderDialog.vue`

Priority: **Low** — complex domain-specific UI, no strong global match.

| Current | Replace with | Notes |
|---|---|---|
| `v-select` (condition type, operator) | `SelectInput` | Visual consistency; remap item shape |
| `v-text-field` (condition value inputs) | `TextInput` | Visual consistency |
| `v-dialog` + `v-card` shell | `DialogCard` | Swap outer shell; move title to `#title` slot, actions to `#actions` slot. Reduces boilerplate |

---

### 4. `NonCombinableRulesSection.vue`

Priority: **Low**

| Current | Replace with | Notes |
|---|---|---|
| Inner `v-dialog` + `v-card` | `DialogCard` | Same as above |
| `v-autocomplete` (rule search) | Raw — keep | No global wrapper |

---

### 5. `StackingGroupDialog.vue`

Priority: **Low**

| Current | Replace with | Notes |
|---|---|---|
| `v-dialog` + `v-card` | `DialogCard` | Reduces boilerplate |
| `v-text-field` (name, description) | `TextInput` | Visual consistency |
| `v-switch` | Raw — keep | No global wrapper |

---

### 6. `TagsPage.vue`

Priority: **Low**

| Current | Replace with | Notes |
|---|---|---|
| `v-text-field` (tag name input) | `TextInput` | Visual consistency |
| `v-dialog` + `v-card` (delete confirm, edit) | `DialogCard` / `ConfirmModal` | `ConfirmModal` for deletes; `DialogCard` for edits |
| `v-list` + `v-list-item` | Raw — keep | No global wrapper |

---

## What does NOT change

These components are prototype-specific and have no global equivalent. They stay as-is:

- All promotions-specific components: `StatusBadge`, `ConditionChip`, `StepDiscountEditor`, `GiftItemsSection`, `ConflictBadge`, `ConflictWarningBanner`, `ReachEstimateBar`, `StackingGroupSelect`, `ProcessingOrderSelect`, `NonCombinableRulesSection`, `TagsSection`, `RulePriorityPreview`, `FilterTabs`, `ColorPicker`
- AI components: `AiAssistantPanel`, `AiRecommendationsPanel`, `SmartRulePreview`, `WizardPanel`
- Layout: `AppTopBar`, `AppSidebar`
- All `v-btn-toggle`, `v-chip`, `v-chip-group`, `v-expansion-panels`, `v-tabs`, `v-switch`, `v-checkbox`, `v-alert`, `v-snackbar` usages where no wrapper exists

---

## Deferred

| Item | Reason |
|---|---|
| Full vee-validate integration | Requires `FormGroup` + `useFormInput` composable adoption across all forms — larger architectural change |
| `Dynamic` data table | Requires real server pagination API; defer until backend is connected |
| `DatePicker` wrapper swap | Currently `v-date-input` direct usage matches the wrapper's output; swap when vee-validate is adopted |
| `ApiErrorAlert` swap | Minor; can be done at any time alongside TextInput swap |

---

## Recommended order

1. `ConfirmDeleteDialog` → `ConfirmModal` in `PromotionsList` — isolated, high-value, no dependencies
2. Dialog shells (`v-dialog + v-card`) → `DialogCard` in `ConditionBuilderDialog`, `NonCombinableRulesSection`, `StackingGroupDialog`, `TagsPage` — mechanical swap, low risk
3. `v-select` → `SelectInput` in `PromotionForm` and `PromotionsList` — needs item shape mapping, do together
4. `v-text-field` / `v-text-field type=number` → `TextInput` / `NumberInput` in `PromotionForm` — most inputs, do last
