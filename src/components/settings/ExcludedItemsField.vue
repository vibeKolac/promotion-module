<template>
  <div>
    <div class="d-flex align-center">
      <span class="text-body-2 font-weight-medium">{{ label }}</span>
      <v-chip
        size="x-small"
        label
        class="ml-2"
        :color="modelValue.length ? 'error' : undefined"
        :variant="modelValue.length ? 'tonal' : 'outlined'"
      >
        {{ modelValue.length }} excluded
      </v-chip>
      <v-spacer />
      <v-btn size="large" color="success" @click="openDialog">Manage</v-btn>
    </div>

    <div class="mt-2 d-flex flex-wrap ga-1">
      <span v-if="!modelValue.length" class="text-caption text-medium-emphasis">
        Nothing excluded. All {{ noun }} are eligible.
      </span>
      <template v-else>
        <v-chip v-for="row in previewRows" :key="row.value" size="small" label>{{ row.subtitle ?? row.title }}</v-chip>
        <v-chip v-if="modelValue.length > previewLimit" size="small" label variant="text" class="clickable-link" @click="openDialog">
          +{{ modelValue.length - previewLimit }} more
        </v-chip>
      </template>
    </div>

    <v-dialog v-model="dialog" max-width="900" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center pt-4">
          Manage excluded {{ noun }}
          <v-spacer />
          <v-chip size="small" label variant="tonal">
            {{ draft.size }} of {{ items.length }} excluded
          </v-chip>
        </v-card-title>

        <v-card-text class="pt-2">
          <div class="d-flex align-center ga-3 mb-4">
            <v-text-field
              v-model="search"
              :placeholder="`Search in all columns`"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
            />
            <v-btn v-if="bulk" variant="text" color="primary" prepend-icon="mdi-content-paste" class="flex-shrink-0" @click="pasteOpen = !pasteOpen">
              Paste list
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-if="bulk && pasteOpen" class="mb-3">
              <v-textarea
                v-model="pasteText"
                label="Paste SKUs, one per line or comma-separated"
                variant="outlined"
                density="compact"
                rows="4"
                auto-grow
                hide-details
              />
              <div class="d-flex align-center ga-2 mt-2">
                <v-btn size="small" color="error" variant="tonal" :disabled="!pasteText.trim()" @click="applyPaste(true)">
                  Exclude pasted
                </v-btn>
                <v-btn size="small" color="info" variant="tonal" :disabled="!pasteText.trim()" @click="applyPaste(false)">
                  Remove pasted
                </v-btn>
              </div>
              <v-alert v-if="pasteResult" density="compact" variant="tonal" :type="pasteResult.unknown.length ? 'warning' : 'success'" class="mt-2">
                {{ pasteResult.summary }}
                <div v-if="pasteResult.unknown.length" class="text-caption mt-1">
                  Not found: {{ pasteResult.unknown.join(', ') }}
                </div>
              </v-alert>
            </div>
          </v-expand-transition>

          <div v-if="selected.length" class="d-flex align-center ga-2 mb-2 pa-2 bg-grey-lighten-4 rounded">
            <span class="text-body-2">{{ selected.length }} selected</span>
            <v-spacer />
            <v-btn size="small" color="error" variant="tonal" @click="applySelected(true)">Exclude selected</v-btn>
            <v-btn size="small" color="info" variant="tonal" @click="applySelected(false)">Remove selected</v-btn>
          </div>

          <div class="border rounded pa-3">
          <v-tabs v-model="statusFilter" hide-slider density="comfortable" class="excluded-tabs mb-2">
            <v-tab v-for="t in tabs" :key="t.value" :value="t.value" :ripple="false">
              {{ t.title }}
              <span class="tab-count ml-2">{{ t.count }}</span>
            </v-tab>
          </v-tabs>

          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="tableItems"
            item-value="value"
            show-select
            density="compact"
            :search="search"
            :items-per-page="25"
            :items-per-page-options="[25, 50, 100]"
            no-data-text="No matches"
          >
            <template #[`item.status`]="{ item }">
              <v-chip v-if="item.excluded" size="small" color="grey" variant="tonal">Excluded</v-chip>
              <v-chip v-else size="small" color="success" variant="tonal">Eligible</v-chip>
            </template>
          </v-data-table>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="info" @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" prepend-icon="mdi-check" @click="apply">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  label: { type: String, required: true },
  noun: { type: String, required: true },
  bulk: { type: Boolean, default: false },
  previewLimit: { type: Number, default: 8 },
})
const emit = defineEmits(['update:modelValue'])

const dialog = ref(false)
const search = ref('')
const statusFilter = ref('all')
const tabs = computed(() => [
  { value: 'eligible', title: 'Eligible', count: props.items.length - draft.value.size },
  { value: 'excluded', title: 'Excluded', count: draft.value.size },
  { value: 'all', title: 'All', count: props.items.length },
])
const selected = ref([])
const draft = ref(new Set())
const pasteOpen = ref(false)
const pasteText = ref('')
const pasteResult = ref(null)

const hasSubtitle = computed(() => props.items.some(i => i.subtitle))
const headers = computed(() => [
  { title: 'Name', key: 'title' },
  ...(hasSubtitle.value ? [{ title: 'SKU', key: 'subtitle' }] : []),
  { title: 'Status', key: 'status', sortable: false, width: 120 },
])

const previewRows = computed(() => {
  const byValue = new Map(props.items.map(i => [i.value, i]))
  return props.modelValue.slice(0, props.previewLimit).map(v => byValue.get(v) ?? { value: v, title: v })
})

const tableItems = computed(() => {
  const rows = props.items.map(i => ({ ...i, excluded: draft.value.has(i.value) }))
  if (statusFilter.value === 'excluded') return rows.filter(r => r.excluded)
  if (statusFilter.value === 'eligible') return rows.filter(r => !r.excluded)
  return rows
})

function openDialog() {
  draft.value = new Set(props.modelValue)
  selected.value = []
  search.value = ''
  statusFilter.value = 'all'
  pasteText.value = ''
  pasteResult.value = null
  dialog.value = true
}

function setExcluded(values, exclude) {
  const next = new Set(draft.value)
  values.forEach(v => (exclude ? next.add(v) : next.delete(v)))
  draft.value = next
}

function applySelected(exclude) {
  setExcluded(selected.value, exclude)
  selected.value = []
}

function applyPaste(exclude) {
  const tokens = [...new Set(pasteText.value.split(/[\s,;]+/).map(t => t.trim()).filter(Boolean))]
  const lookup = new Map()
  props.items.forEach(i => {
    lookup.set(String(i.value).toLowerCase(), i.value)
    if (i.subtitle) lookup.set(String(i.subtitle).toLowerCase(), i.value)
  })
  const found = []
  const unknown = []
  tokens.forEach(t => {
    const v = lookup.get(t.toLowerCase())
    if (v === undefined) unknown.push(t)
    else found.push(v)
  })
  const changed = found.filter(v => draft.value.has(v) !== exclude).length
  const unchanged = found.length - changed
  setExcluded(found, exclude)
  const verb = exclude ? 'excluded' : 'removed'
  pasteResult.value = {
    unknown,
    summary: `${changed} ${verb}, ${unchanged} already ${exclude ? 'excluded' : 'eligible'}, ${unknown.length} not found.`,
  }
  if (!unknown.length) pasteText.value = ''
}

function apply() {
  emit('update:modelValue', props.items.filter(i => draft.value.has(i.value)).map(i => i.value))
  dialog.value = false
}
</script>

<style scoped>
.excluded-tabs :deep(.v-tab) {
  border-radius: 2px;
  margin-right: 8px;
}
.excluded-tabs :deep(.v-tab--selected) {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}
.tab-count {
  display: inline-block;
  min-width: 22px;
  padding: 1px 7px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.75rem;
  text-align: center;
}
</style>
