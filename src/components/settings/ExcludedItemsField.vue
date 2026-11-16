<template>
  <div>
    <div class="field-row d-flex align-center ga-3 pa-4">
      <div>
        <div class="text-body-1 font-weight-medium">{{ label }}</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ modelValue.length ? `${modelValue.length} excluded` : 'None excluded' }}
        </div>
      </div>
      <v-spacer />
      <v-btn variant="outlined" color="success" prepend-icon="mdi-tune-variant" class="flex-shrink-0" @click="openDialog">
        Configure
      </v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="900" scrollable :fullscreen="mobile">
      <v-card>
        <v-card-title class="d-flex align-center pt-4">
          Configure excluded {{ noun }}
        </v-card-title>

        <v-card-text class="pt-2">
          <div class="d-flex flex-wrap align-center ga-3 mb-4">
            <v-text-field
              v-model="search"
              :placeholder="`Search in all columns`"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="search-field"
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
              <template v-if="pasteCheck.total">
                <v-alert
                  v-for="g in pasteGroups"
                  :key="g.key"
                  :type="g.type"
                  variant="tonal"
                  density="compact"
                  class="mt-2 text-caption"
                >
                  <div class="d-flex align-center">
                    <strong>{{ g.values.length }} {{ g.title }}</strong>
                    <v-spacer />
                    <v-btn size="x-small" variant="text" color="black" @click="dropFromPaste(g.values)">
                      Remove from list
                    </v-btn>
                  </div>
                  <div class="d-flex flex-wrap ga-1 mt-1 paste-chips">
                    <v-chip
                      v-for="v in g.values"
                      :key="v"
                      size="x-small"
                      closable
                      @click:close="dropFromPaste([v])"
                    >
                      {{ v }}
                    </v-chip>
                  </div>
                </v-alert>
                <div class="text-caption text-medium-emphasis mt-2">
                  {{ pasteCheck.fresh.length }} new SKU{{ pasteCheck.fresh.length === 1 ? '' : 's' }} ready to exclude
                </div>
              </template>
              <div class="d-flex flex-wrap align-center ga-2 mt-2">
                <v-btn size="large" color="success" :block="mobile" :disabled="!pasteCheck.fresh.length" @click="applyPaste(true)">
                  Exclude pasted
                </v-btn>
                <v-btn size="large" color="black" variant="text" :block="mobile" :disabled="!pasteCheck.alreadyExcluded.length" @click="applyPaste(false)">
                  Remove pasted
                </v-btn>
              </div>
              <v-alert v-if="pasteResult && !pasteText" density="compact" variant="tonal" type="success" class="mt-2">
                {{ pasteResult }}
              </v-alert>
            </div>
          </v-expand-transition>

          <div v-if="selected.length" class="d-flex flex-wrap align-center ga-2 mb-2 pa-2 bg-grey-lighten-4 rounded">
            <v-btn size="large" color="success" :block="mobile" @click="applySelected(true)">Exclude selected</v-btn>
            <v-btn size="large" color="black" variant="text" :block="mobile" @click="applySelected(false)">Remove selected</v-btn>
            <span class="text-body-2" :class="mobile ? 'mx-auto' : 'ml-2'">{{ selected.length }} selected</span>
          </div>

          <div class="border rounded" :class="mobile ? 'pa-1' : 'pa-3'">
          <v-tabs v-model="statusFilter" hide-slider show-arrows :grow="mobile" density="comfortable" class="excluded-tabs mb-2">
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
          <v-btn variant="text" color="black" @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" prepend-icon="mdi-check" @click="apply">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  label: { type: String, required: true },
  noun: { type: String, required: true },
  bulk: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const { mobile } = useDisplay()
const dialog = ref(false)
const search = ref('')
const statusFilter = ref('all')
const tabs = computed(() => [
  { value: 'all', title: 'All', count: props.items.length },
  { value: 'eligible', title: 'Eligible', count: props.items.length - draft.value.size },
  { value: 'excluded', title: 'Excluded', count: draft.value.size },
])
const selected = ref([])
const draft = ref(new Set())
const pasteOpen = ref(false)
const pasteText = ref('')
const pasteResult = ref('')

const hasSubtitle = computed(() => props.items.some(i => i.subtitle))
const headers = computed(() => [
  { title: 'Name', key: 'title' },
  ...(hasSubtitle.value ? [{ title: 'SKU', key: 'subtitle' }] : []),
  ...(statusFilter.value === 'all' ? [{ title: 'Status', key: 'status', sortable: false, width: 120 }] : []),
])

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
  pasteResult.value = ''
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

const itemLookup = computed(() => {
  const lookup = new Map()
  props.items.forEach(i => {
    lookup.set(String(i.value).toLowerCase(), i.value)
    if (i.subtitle) lookup.set(String(i.subtitle).toLowerCase(), i.value)
  })
  return lookup
})

const pasteTokens = computed(() => pasteText.value.split(/[\s,;|]+/).map(t => t.trim()).filter(Boolean))

const pasteCheck = computed(() => {
  const seen = new Set()
  const repeated = []
  const notFound = []
  const alreadyExcluded = []
  const fresh = []
  pasteTokens.value.forEach(t => {
    const key = t.toLowerCase()
    if (seen.has(key)) {
      if (!repeated.includes(t)) repeated.push(t)
      return
    }
    seen.add(key)
    const v = itemLookup.value.get(key)
    if (v === undefined) notFound.push(t)
    else if (draft.value.has(v)) alreadyExcluded.push(t)
    else fresh.push(v)
  })
  return { total: pasteTokens.value.length, repeated, notFound, alreadyExcluded, fresh }
})

const pasteGroups = computed(() => [
  { key: 'notFound', type: 'error', title: `SKU${pasteCheck.value.notFound.length === 1 ? '' : 's'} not found`, values: pasteCheck.value.notFound },
  { key: 'alreadyExcluded', type: 'warning', title: `already excluded`, values: pasteCheck.value.alreadyExcluded },
  { key: 'repeated', type: 'warning', title: `repeated in the list`, values: pasteCheck.value.repeated },
].filter(g => g.values.length))

function dropFromPaste(values) {
  const drop = new Set(values.map(v => v.toLowerCase()))
  const keep = []
  const seen = new Set()
  const isRepeatedGroup = values === pasteCheck.value.repeated
  pasteTokens.value.forEach(t => {
    const key = t.toLowerCase()
    if (isRepeatedGroup) {
      if (seen.has(key)) return
      seen.add(key)
      keep.push(t)
    } else if (!drop.has(key)) {
      keep.push(t)
    }
  })
  pasteText.value = keep.join('\n')
}

function applyPaste(exclude) {
  const { fresh, alreadyExcluded } = pasteCheck.value
  const values = exclude ? fresh : alreadyExcluded.map(t => itemLookup.value.get(t.toLowerCase()))
  setExcluded(values, exclude)
  pasteResult.value = `${values.length} SKU${values.length === 1 ? '' : 's'} ${exclude ? 'excluded' : 'removed from the exclusion list'}.`
  pasteText.value = ''
}

function apply() {
  emit('update:modelValue', props.items.filter(i => draft.value.has(i.value)).map(i => i.value))
  dialog.value = false
}
</script>

<style scoped>
.field-row {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}
.excluded-tabs :deep(.v-tab) {
  border-radius: 2px;
  margin-right: 8px;
}
.excluded-tabs :deep(.v-tab--selected) {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}
.search-field {
  flex: 1 1 220px;
  min-width: 0;
}
.paste-chips {
  max-height: 96px;
  overflow-y: auto;
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
