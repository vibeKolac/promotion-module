# Design Library — Promotions Module

Reference for all UI components used in this prototype, mapped to the global component library from `drmax-eshop-admin-client`.

---

## Source repositories

| Source | Path | Usage |
|---|---|---|
| Global library | `drmax-eshop-admin-client/src/modules/_common/components/` | Shared wrappers around Vuetify; vee-validate integrated |
| Prototype | `promotions-vue/src/components/` | Module-specific components; raw Vuetify with manual validation |

---

## Form inputs

### TextInput
**Source:** `_common/components/form/TextInput.vue`
**Wraps:** `v-text-field`
**Use for:** All single-line text inputs, including password fields (toggle handled internally).

```vue
<TextInput id="name" name="name" label="Rule name" :rules="{ required: true }" dense />
```

Props: `id`, `name`, `label`, `helpText`, `dense`, `disabled`, `rules`, `type`, `appendIcon`
Exposes: `getValue()`, `setValue(v)`, `clearValue()`

---

### NumberInput
**Source:** `_common/components/form/NumberInput.vue`
**Wraps:** `v-text-field type="number"`
**Use for:** All numeric inputs (discount amount, quantities, thresholds, max steps).

```vue
<NumberInput id="discount-value" name="value" label="Discount amount" :rules="{ required: true, min_value: 0 }" dense />
```

Returns `null` when empty (not empty string).

---

### SelectInput
**Source:** `_common/components/form/SelectInput.vue`
**Wraps:** `v-select`
**Use for:** All dropdown selects (rule type, amount type, step type, free item selection).

```vue
<SelectInput id="rule-type" name="type" label="Rule type" :data="ruleTypeItems" dense />
```

Props: `data` (items array), `itemText` (default `label`), `itemValue` (default `key`), `multiple`, `returnObject`, `compareBy`
Item shape expected: `{ key: string, label: string }` — different from raw Vuetify default (`value`/`title`).

---

### BooleanSelect
**Source:** `_common/components/form/BooleanSelect.vue`
**Wraps:** `SelectInput` with hardcoded Yes/No items
**Use for:** Boolean fields that need a select UX (e.g. exclusive rule flag).

```vue
<BooleanSelect id="exclusive" name="exclusive" label="Exclusive" :canBeEmpty="true" dense />
```

Note: For toggle UX (on/off switches), use raw `v-switch` — `BooleanSelect` renders as a dropdown.

---

### DatePicker
**Source:** `_common/components/form/DatePicker.vue`
**Wraps:** `v-date-input` (Vuetify Labs)
**Use for:** All date-only inputs (start date, end date, pause from, pause until).

```vue
<DatePicker
  id="start-date"
  name="startDate"
  label="Start date"
  :pickerOptions="{ allowedDates: (val) => val >= today }"
  dense
/>
```

Props: `pickerOptions` — passed directly to `v-date-input`; `allowedDates` receives ISO string (wrapper converts from JS Date).
The prototype currently uses `v-date-input` directly with the same `allowedDates` pattern.

---

### DatetimePicker
**Source:** `_common/components/form/DatetimePicker.vue`
**Use for:** Date + time combined inputs (not currently used in promotions module).
Opens a dialog with `v-date-picker` + `v-time-picker`. Uses Luxon.

---

### TimePicker
**Source:** `_common/components/form/TimePicker.vue`
**Use for:** Time-only inputs (not currently used in promotions module).

---

### CustomValidatorAlert
**Source:** `_common/components/form/CustomValidatorAlert.vue`
**Use for:** Cross-field validation errors displayed as a `v-alert type="error"`.

```vue
<CustomValidatorAlert
  :value="someValue"
  :validator="(v) => v > otherValue || 'Must be after start date'"
  message="Invalid range"
/>
```

Registers with parent `FormGroup` context automatically.

---

## Dialogs

### DialogCard
**Source:** `_common/components/DialogCard.vue`
**Use for:** General-purpose dialog shells. Opened imperatively via `ref.open()`.

```vue
<DialogCard ref="dialog">
  <template #title>Edit rule</template>
  <!-- body content -->
  <template #actions>
    <v-btn @click="dialog.close()">Cancel</v-btn>
    <v-btn color="primary" @click="save">Save</v-btn>
  </template>
</DialogCard>
```

---

### ConfirmModal
**Source:** `_common/components/ConfirmModal/index.vue`
**Use for:** Confirmation dialogs (delete, discard, overwrite). Promise-based API.

```vue
<ConfirmModal ref="confirmModal">
  <template #body>Are you sure you want to delete "{{ item.name }}"?</template>
</ConfirmModal>

<!-- Usage -->
const confirmed = await confirmModal.value.open(item)
if (confirmed) await store.remove(item.id)
```

Replaces prototype's `ConfirmDeleteDialog` — same pattern, more generic.

---

## Data table

### Dynamic
**Source:** `_common/components/DataTable/Dynamic.vue`
**Wraps:** `v-data-table` / `v-data-table-server`
**Use for:** All list/table views (PromotionsList, StackingGroupsPage, TagsPage).

```vue
<Dynamic
  :headers="headers"
  :items="items"
  :server-items-length="total"
  storage-key="promotions-list"
  :options="tableOptions"
  @update:options="tableOptions = $event"
  @export-all="handleExport"
/>
```

Headers shape: `{ key: string, title: string, sortable?: boolean, hiddenByDefault?: boolean }`
Built-in: column picker, filter presets, export (all / by filter), reorderable columns (optional).

---

## Global utilities

### HelpTooltip
**Source:** `_common/components/global/HelpTooltip.vue`
**Use for:** Contextual help icons next to labels (e.g. "Processing order", "Non-combinable rules").

```vue
<HelpTooltip text="Rules and groups that cannot apply together with this rule." />
```

---

### ValueWithDefault
**Source:** `_common/components/global/ValueWithDefault.vue`
**Use for:** Displaying a value with an em-dash fallback when empty.

```vue
<ValueWithDefault :value="rule.endDate" />
```

---

### ApiErrorAlert
**Source:** `_common/components/global/ApiErrorAlert.vue`
**Use for:** Displaying API error responses. Replaces raw `v-snackbar` for save errors.

---

## Prototype-only components (no global equivalent)

These components are specific to the promotions module and should remain as-is.

| Component | Purpose |
|---|---|
| `StatusBadge` | Maps rule status string to a colored `v-chip`. Candidate for global library addition. |
| `FilterTabs` | Chip-based tab switcher with optional counts. |
| `ColorPicker` | 8-color swatch picker for stacking groups. |
| `ConditionChip` | Displays one targeting condition with edit/remove. |
| `ConditionBuilderDialog` | 2-step dialog for building targeting conditions. |
| `StepDiscountEditor` | Repeating tier editor for step discount rules. |
| `GiftItemsSection` | Accordion for gift SKU/quantity rows. |
| `ConflictBadge` | Inline conflict warning chip on list rows. |
| `ConflictWarningBanner` | Alert banner for gift item conflicts. |
| `ReachEstimateBar` | Thin progress bar estimating rule reach from conditions. |
| `StackingGroupSelect` | Single select for assigning a stacking group. |
| `ProcessingOrderSelect` | Priority-order widget with arrow controls. |
| `NonCombinableRulesSection` | List of non-combinable rule restrictions with inline add. |
| `TagsSection` | Tag chip picker with inline create. |
| `RulePriorityPreview` | Collapsible preview card showing rule application order. |

---

## Raw Vuetify — approved patterns (no wrapper needed)

These Vuetify components have no global wrapper and are used directly in both the global library and this prototype.

| Component | Used for |
|---|---|
| `v-alert` | Inline warnings, info banners, validation summaries |
| `v-snackbar` | Save success/error toasts |
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
