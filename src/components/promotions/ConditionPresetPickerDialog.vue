<!-- src/components/promotions/ConditionPresetPickerDialog.vue -->
<template>
  <v-dialog :model-value="modelValue" max-width="560" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-h6 pa-5 pb-3">Apply condition preset</v-card-title>

      <v-card-text class="pa-5 pt-0 dialog-scroll">
        <p class="text-caption text-medium-emphasis mb-4">
          Select a preset to load its conditions into the rule.
        </p>

        <div class="text-body-2 font-weight-bold mb-3">How to apply</div>
        <div class="d-flex flex-column mb-4" style="gap: 12px">
          <v-radio-group v-model="applyMode" density="compact" hide-details>
            <v-radio value="replace">
              <template #label>
                <div style="margin-left: 8px">
                  <div class="text-body-2">Replace existing conditions</div>
                  <div class="text-caption text-medium-emphasis">Current conditions will be cleared first.</div>
                </div>
              </template>
            </v-radio>
            <div style="height: 8px" />
            <v-radio value="append">
              <template #label>
                <div style="margin-left: 8px">
                  <div class="text-body-2">Add to existing conditions</div>
                  <div class="text-caption text-medium-emphasis">Preset conditions are appended to the current list.</div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </div>

        <v-divider class="mb-4" />

        <v-text-field
          v-model="search"
          placeholder="Search presets…"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="mb-4"
        />

        <v-alert v-if="!filtered.length" color="grey" variant="tonal" density="compact">
          No presets found.
          <router-link to="/templates-presets/condition-presets" class="ml-1">Manage presets</router-link>
        </v-alert>

        <div class="d-flex flex-column" style="gap: 12px">
          <v-card
            v-for="preset in filtered"
            :key="preset.id"
            border
            elevation="0"
            class="pa-3 clickable-link"
            :class="{ 'border-primary': selected === preset.id }"
            @click="selected = preset.id"
          >
            <div class="d-flex align-center mb-1" style="gap: 8px">
              <v-icon
                :icon="selected === preset.id ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
                :color="selected === preset.id ? 'primary' : undefined"
                size="18"
              />
              <span class="text-body-2 font-weight-bold">{{ preset.name }}</span>
            </div>
            <div v-if="preset.description" class="text-caption text-medium-emphasis mb-2 ml-7">{{ preset.description }}</div>
            <div class="ml-7 d-flex flex-column" style="gap: 6px">
              <div v-for="cond in preset.conditions" :key="cond.id" class="d-flex align-start" style="gap: 6px">
                <v-chip size="x-small" :color="cond.mode === 'exclude' ? 'error' : 'success'" variant="tonal" label class="flex-shrink-0">
                  {{ cond.mode === 'exclude' ? 'excl.' : 'incl.' }}
                </v-chip>
                <span class="text-caption">
                  <span class="font-weight-medium">{{ FIELD_LABELS[cond.field] ?? cond.field }}</span>
                  <template v-if="cond.values?.length">
                    : {{ cond.values.slice(0, 3).join(', ') }}<span v-if="cond.values.length > 3" class="text-medium-emphasis"> +{{ cond.values.length - 3 }} more</span>
                  </template>
                </span>
              </div>
            </div>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="success" :disabled="!selected" @click="apply">Apply preset</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuid } from 'uuid'
import { useConditionPresetsStore } from '../../stores/conditionPresets'
import { FIELD_LABELS } from '../../utils/conditionTypes'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'apply'])

const store = useConditionPresetsStore()
const search = ref('')
const selected = ref(null)
const applyMode = ref('replace')

const filtered = computed(() =>
  store.items.filter(p =>
    !search.value ||
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.value.toLowerCase())
  )
)


function conditionLabel(cond) {
  const fieldLabel = FIELD_LABELS[cond.field] ?? cond.field
  if (cond.values?.length) {
    const preview = cond.values.slice(0, 2).join(', ')
    const more = cond.values.length > 2 ? ` +${cond.values.length - 2}` : ''
    return `${fieldLabel}: ${preview}${more}`
  }
  return fieldLabel
}

function apply() {
  const preset = store.items.find(p => p.id === selected.value)
  if (!preset) return
  const conditions = preset.conditions.map(c => ({ ...c, id: uuid() }))
  emit('apply', { conditions, mode: applyMode.value })
  emit('update:modelValue', false)
  selected.value = null
}
</script>

<style scoped>
.dialog-scroll {
  max-height: 60vh;
}
</style>
