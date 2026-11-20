<template>
  <v-card border elevation="0" class="filter-builder pa-4" data-testid="filter-builder">
    <div class="d-flex align-center mb-3">
      <span class="text-subtitle-2 font-weight-bold">Filters</span>
      <v-spacer />
      <v-btn v-if="completeCount" variant="text" color="black" size="small" data-testid="clear-filters" @click="clearAll">
        Clear all
      </v-btn>
    </div>

    <div v-for="row in model" :key="row.id" class="filter-builder__row" data-testid="filter-row">
      <v-select
        :model-value="row.field"
        :items="fieldOptions(row)"
        label="Filter by"
        variant="outlined"
        density="compact"
        hide-details
        class="filter-builder__field"
        @update:model-value="setField(row, $event)"
      />

      <template v-if="row.field">
        <span class="filter-builder__operator text-body-2 text-medium-emphasis">{{ fieldDef(row.field).operator }}</span>

        <template v-if="fieldDef(row.field).type === 'date'">
          <v-select
            :model-value="row.dateMode"
            :items="DATE_MODES"
            label="Period"
            variant="outlined"
            density="compact"
            hide-details
            class="filter-builder__value"
            @update:model-value="patch(row, { dateMode: $event })"
          />
          <template v-if="row.dateMode === 'custom'">
            <DatePicker
              :model-value="row.from"
              label="From"
              hide-details
              class="filter-builder__date"
              @update:model-value="patch(row, { from: $event })"
            />
            <DatePicker
              :model-value="row.to"
              label="To"
              hide-details
              class="filter-builder__date"
              @update:model-value="patch(row, { to: $event })"
            />
          </template>
        </template>

        <v-select
          v-else
          :model-value="row.values"
          :items="fieldDef(row.field).items"
          :label="fieldDef(row.field).label"
          variant="outlined"
          density="compact"
          hide-details
          multiple
          chips
          closable-chips
          class="filter-builder__value"
          @update:model-value="patch(row, { values: $event })"
        />

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          aria-label="Remove filter"
          data-testid="remove-filter"
          @click="remove(row)"
        />
      </template>
    </div>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import DatePicker from '../_common/DatePicker.vue'
import { DATE_MODES, groupFieldOptions, isConditionComplete, pushRecent } from '../../utils/promotionFilters'

const props = defineProps({
  fields: { type: Array, required: true },
  recentKey: { type: String, default: null },
})
const model = defineModel({ type: Array, default: () => [] })

let seq = 0
const newRow = () => ({ id: ++seq, field: null, values: [], dateMode: null, from: null, to: null })

const completeCount = computed(() => model.value.filter(isConditionComplete).length)

function fieldDef(key) {
  return props.fields.find(f => f.key === key)
}

const recent = ref(loadRecent())

function loadRecent() {
  try {
    const keys = props.recentKey ? JSON.parse(localStorage.getItem(props.recentKey)) : null
    return Array.isArray(keys) ? keys : []
  } catch {
    return []
  }
}

function fieldOptions(row) {
  const usedElsewhere = model.value.filter(r => r !== row).map(r => r.field)
  return groupFieldOptions(props.fields.filter(f => !usedElsewhere.includes(f.key)), recent.value)
}

function patch(row, changes) {
  model.value = model.value.map(r => (r === row ? { ...r, ...changes } : r))
}

function setField(row, field) {
  if (field) {
    recent.value = pushRecent(recent.value, field)
    try {
      if (props.recentKey) localStorage.setItem(props.recentKey, JSON.stringify(recent.value))
    } catch {
      // recently used lasts for this session only
    }
  }
  patch(row, { field, values: [], dateMode: null, from: null, to: null })
}

function remove(row) {
  model.value = model.value.filter(r => r !== row)
}

function clearAll() {
  model.value = []
}

watch(
  model,
  rows => {
    const last = rows.at(-1)
    const used = rows.filter(r => r.field).length
    if (!last || (isConditionComplete(last) && used < props.fields.length)) {
      model.value = [...rows, newRow()]
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.filter-builder {
  border-radius: 8px;
}

.filter-builder__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.filter-builder__row:last-child {
  margin-bottom: 0;
}

.filter-builder__field {
  flex: 0 0 200px;
}

.filter-builder__operator {
  min-width: 56px;
}

.filter-builder__value {
  flex: 1 1 260px;
  min-width: 220px;
  max-width: 480px;
}

.filter-builder__date {
  flex: 0 0 180px;
}
</style>
