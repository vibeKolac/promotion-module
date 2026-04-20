# Design Library — Promotions Module

Reference for all UI components used in this prototype. Three tiers:

1. **Global library** — components from `drmax-eshop-admin-client/_common/components/`. Not copied into this repo; documented here as the canonical API reference.
2. **Local implementations** — components in `src/components/_common/`. Locally implemented to match the global library API without vee-validate. Use these in this prototype.
3. **Promotion-specific** — components in `src/components/promotions/`, `shared/`, `stackingGroups/`, `tags/`, `templates/`, `ai/`. No global equivalent; promotions module only.

---

## Source map

| Tier | Location | Notes |
|---|---|---|
| Global library | `drmax-eshop-admin-client/src/modules/_common/components/` | Vee-validate integrated; TypeScript; Options API |
| Local implementations | `promotions-vue/src/components/_common/` | Same API surface; no vee-validate; Composition API |
| Promotion-specific | `promotions-vue/src/components/` | Domain components; no global equivalent |

---

## Tier 1 — Global library reference

These exist in `drmax-eshop-admin-client`. Not available in this prototype directly. Documented so the local implementations (Tier 2) can be kept in sync.

### Form inputs

#### TextInput
**Source:** `form/TextInput.vue`
**Wraps:** `v-text-field`

Props: `id`, `name`, `label`, `helpText`, `dense`, `disabled`, `rules`, `type`, `appendIcon`
Exposes: `getValue()`, `setValue(v)`, `clearValue()`

---

#### NumberInput
**Source:** `form/NumberInput.vue`
**Wraps:** `v-text-field type="number"`

Returns `null` when empty (not empty string).
Props: same base as `TextInput`.

---

#### SelectInput
**Source:** `form/SelectInput.vue`
**Wraps:** `v-select`

Props: `data` (items), `itemText` (default `label`), `itemValue` (default `key`), `multiple`, `returnObject`, `compareBy`
Item shape: `{ key: string, label: string }` — note: differs from raw Vuetify `{ value, title }`.

---

#### BooleanSelect
**Source:** `form/BooleanSelect.vue`
**Wraps:** `SelectInput` with hardcoded Yes/No items.
Props: `canBeEmpty` (adds null `--` option).

---

#### DatePicker
**Source:** `form/DatePicker.vue`
**Wraps:** `v-date-input` (Vuetify Labs)

Props: `pickerOptions` — `allowedDates` receives ISO string (wrapper converts JS Date → ISO internally).

---

#### DatetimePicker
**Source:** `form/DatetimePicker.vue`
Opens `v-dialog` with `v-date-picker` + `v-time-picker`. Uses Luxon. Not used in promotions module.

---

#### TimePicker
**Source:** `form/TimePicker.vue`
Not used in promotions module.

---

#### CustomValidatorAlert
**Source:** `form/CustomValidatorAlert.vue`
Renders `v-alert type="error"` when a validator function fails. Registers with parent `FormGroup`.

---

### Dialogs

#### DialogCard
**Source:** `DialogCard.vue`
Slot-based dialog shell. Opened imperatively via `ref.open()` / `ref.close()`.
Slots: `#title`, default (body), `#actions`.

---

#### ConfirmModal
**Source:** `ConfirmModal/index.vue`
Promise-based confirm dialog. `ref.open()` returns `Promise<boolean>`.
Slots: `#header`, `#body`, `#actions`.

---

### Data table

#### Dynamic
**Source:** `DataTable/Dynamic.vue`
**Wraps:** `v-data-table` / `v-data-table-server`

Headers shape: `{ key, title, sortable?, hiddenByDefault? }`
Built-in: column picker, filter presets, export, reorderable columns.
**Deferred in prototype** — requires server pagination API.

---

### Global utilities

#### HelpTooltip
**Source:** `global/HelpTooltip.vue`
Icon + tooltip for contextual help text.

#### ValueWithDefault
**Source:** `global/ValueWithDefault.vue`
Displays value or `—` if empty.

#### ApiErrorAlert
**Source:** `global/ApiErrorAlert.vue`
Inline API error display. Replaces `v-snackbar` for save errors.
**Deferred in prototype** — swap when vee-validate is adopted.

---

## Tier 2 — Local implementations (`src/components/_common/`)

These are locally implemented to match the Tier 1 API without vee-validate. Use these throughout the prototype. When the prototype adopts vee-validate, swap these out for the real global components.

### TextInput
**File:** `src/components/_common/TextInput.vue`
**Mirrors:** Global `TextInput`

```vue
<TextInput
  v-model="draft.name"
  label="Rule name *"
  :error-messages="validationErrors.name ? [validationErrors.name] : []"
/>
```

Props: `modelValue`, `label`, `helpText`, `dense` (default `true`), `disabled`, `errorMessages`, `type`, `appendIcon`
Differences from global: no vee-validate, no `id`/`name`/`rules` — use `:error-messages` directly.

---

### NumberInput
**File:** `src/components/_common/NumberInput.vue`
**Mirrors:** Global `NumberInput`

```vue
<NumberInput v-model="draft.value" label="Discount amount *" help-text="Enter a positive number" />
```

Props: `modelValue`, `label`, `helpText`, `dense` (default `true`), `disabled`, `errorMessages`
Emits `null` on empty input (matches global behaviour).

---

### SelectInput
**File:** `src/components/_common/SelectInput.vue`
**Mirrors:** Global `SelectInput`

```vue
<SelectInput v-model="draft.type" :data="ruleTypeItems" label="Rule type *" />
```

Props: `modelValue`, `data`, `label`, `helpText`, `dense` (default `true`), `disabled`, `errorMessages`, `itemText` (default `label`), `itemValue` (default `key`), `multiple`, `returnObject`
Item shape: `{ key, label }` preferred. Also accepts `{ value, title }` — normalized internally.

---

### DialogCard
**File:** `src/components/_common/DialogCard.vue`
**Mirrors:** Global `DialogCard`

```vue
<DialogCard ref="dialog" max-width="480">
  <template #title>Edit rule</template>
  <!-- body content -->
  <template #actions>
    <v-btn variant="text" @click="dialog.close()">Cancel</v-btn>
    <v-btn color="primary" @click="save">Save</v-btn>
  </template>
</DialogCard>

<!-- Open imperatively -->
dialog.value.open()
```

Exposes: `open()`, `close()`
Extra attrs (`max-width`, `persistent`, etc.) passed through to `v-dialog`.

---

### ConfirmModal
**File:** `src/components/_common/ConfirmModal.vue`
**Mirrors:** Global `ConfirmModal`

```vue
<ConfirmModal ref="deleteModal" confirm-text="Delete" confirm-color="error" :loading="deleting">
  <template #header>Delete rule?</template>
  <template #body>
    <strong>{{ item.name }}</strong> will be permanently deleted.
  </template>
</ConfirmModal>

<!-- Open with promise pattern -->
const confirmed = await deleteModal.value.open()
if (confirmed) await store.remove(item.id)
```

Props: `confirmText` (default `"Confirm"`), `confirmColor` (default `"primary"`), `loading`
Exposes: `open()` — returns `Promise<boolean>`
Slots: `#header`, `#body`, `#actions` (override default Cancel/Confirm buttons)

---

## Tier 3 — Promotion-specific components (`src/components/`)

These have no equivalent in the global library. They are scoped to this module and should not be used outside it without first being promoted to a shared library.

### Shared primitives

| Component | File | Purpose |
|---|---|---|
| `StatusBadge` | `shared/StatusBadge.vue` | Maps rule status (`active`, `paused`, `draft`, `scheduled`, `ended`) to a colored `v-chip`. Candidate for global library. |
| `FilterTabs` | `shared/FilterTabs.vue` | Chip-based tab switcher with optional badge counts. Props: `tabs`, `modelValue`. |
| `ColorPicker` | `shared/ColorPicker.vue` | 8-swatch color picker. Props: `modelValue` (hex string). |

---

### Promotion form components

| Component | File | Purpose |
|---|---|---|
| `ConditionChip` | `promotions/ConditionChip.vue` | Displays one targeting condition with edit/remove actions. Props: `condition`, `scope`. |
| `ConditionBuilderDialog` | `promotions/ConditionBuilderDialog.vue` | 2-step dialog for building/editing targeting conditions. Uses `DialogCard` + `SelectInput` + `NumberInput`. Props: `modelValue`, `initialCondition`, `scope`. Emits `save`. |
| `StepDiscountEditor` | `promotions/StepDiscountEditor.vue` | Repeating row editor for step discount tiers. Props: `modelValue` (array of tiers). |
| `GiftItemsSection` | `promotions/GiftItemsSection.vue` | Accordion list for gift SKU/quantity rows. Props: `modelValue` (array). |
| `ConflictBadge` | `promotions/ConflictBadge.vue` | Small warning chip shown on list rows when gift conflicts are detected. Props: `conflicts`. |
| `ConflictWarningBanner` | `promotions/ConflictWarningBanner.vue` | Inline `v-alert` banner for gift item conflicts. Props: `conflicts`. |
| `ReachEstimateBar` | `promotions/ReachEstimateBar.vue` | Thin `v-progress-linear` estimating rule reach from conditions. Props: `conditions`, `scope`. |
| `StackingGroupSelect` | `promotions/StackingGroupSelect.vue` | Single `v-select` pre-loaded with stacking groups from store. Props: `modelValue`. |
| `ProcessingOrderSelect` | `promotions/ProcessingOrderSelect.vue` | Priority-order widget with up/down arrow controls within a stacking group. Props: `stackingGroupId`, `priority`, `currentName`. |
| `NonCombinableRulesSection` | `promotions/NonCombinableRulesSection.vue` | List of non-combinable rule/group restrictions with inline add dialog. Uses `DialogCard`. Props: `modelValue`. |
| `TagsSection` | `promotions/TagsSection.vue` | Tag chip picker with inline create and visibility toggle. Props: `modelValue`. |
| `RulePriorityPreview` | `promotions/RulePriorityPreview.vue` | Collapsible card showing rule application order across stacking groups. Props: `rules`, `groups`. |

---

### Stacking groups

| Component | File | Purpose |
|---|---|---|
| `StackingGroupDialog` | `stackingGroups/StackingGroupDialog.vue` | Create/edit dialog for a stacking group. Uses `DialogCard` + `TextInput` + `NumberInput` + `ColorPicker`. |

---

### AI components

| Component | File | Purpose |
|---|---|---|
| `AiAssistantPanel` | `ai/AiAssistantPanel.vue` | Right-side drawer chat panel. Sends natural language input, applies parsed rule to form draft. |
| `AiRecommendationsPanel` | `ai/AiRecommendationsPanel.vue` | Recommendations strip shown on the list page. |
| `SmartRulePreview` | `ai/SmartRulePreview.vue` | Preview card for an AI-parsed rule with apply/edit/dismiss actions. |
| `WizardPanel` | `ai/WizardPanel.vue` | Step-by-step AI wizard inside the assistant panel. |

---

## Raw Vuetify — approved patterns

No wrapper exists (global or local) for these. Use raw Vuetify directly.

| Component | Used for |
|---|---|
| `v-alert` | Inline warnings, info banners, validation summaries |
| `v-snackbar` | Save success/error toasts |
| `v-textarea` | Multi-line text inputs (descriptions, legal text) |
| `v-btn-toggle` | Scope selector (cart/item), channel selector |
| `v-tabs` / `v-tab` | Status tabs on the list page |
| `v-chip` / `v-chip-group` | Filter chips, tag chips, status display |
| `v-expansion-panels` | Gift items accordion |
| `v-autocomplete` | Non-combinable rule search |
| `v-combobox` | Multi-value freeform inputs in condition builder |
| `v-switch` | Boolean toggles (pause scheduling, tag visibility) |
| `v-checkbox` | Single boolean checkboxes |
| `v-breadcrumbs` | Page navigation trail |
| `v-navigation-drawer` | App sidebar, AI assistant panel |
| `v-app-bar` | App top bar |
| `v-progress-circular` | Loading spinners |
| `v-progress-linear` | Reach estimate bar |
| `v-file-input` | CSV import |
| `v-tooltip` | Help text on hover |
| `draggable` (vuedraggable) | Drag-reorder in stacking groups |
