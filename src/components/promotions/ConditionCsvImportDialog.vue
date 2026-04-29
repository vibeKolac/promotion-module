<!-- src/components/promotions/ConditionCsvImportDialog.vue -->
<template>
  <v-dialog v-model="open" max-width="600" persistent>
    <v-card>
      <v-card-title class="pa-5 pb-2">Import conditions from CSV</v-card-title>
      <v-card-text class="pa-5 pt-2">

        <v-alert variant="tonal" color="info" density="compact" icon="mdi-information-outline" class="mb-4 text-caption">
          Columns: <strong>type, field, mode, values, operator</strong>.
          Leave <em>type</em> empty for a plain condition; use <code>group_start</code> / <code>group_end</code> rows to wrap conditions in a group.
          Separate multiple values with <code>|</code>.
          <v-btn
            variant="text"
            size="x-small"
            color="primary"
            prepend-icon="mdi-download"
            class="ml-1"
            @click="downloadConditionsTemplate()"
          >Download template</v-btn>
        </v-alert>

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

        <template v-if="preview.length">
          <div class="text-body-2 font-weight-bold mb-2">
            Preview — {{ previewSummary }}
          </div>
          <v-table density="compact" class="mb-2">
            <thead>
              <tr>
                <th>Field</th>
                <th>Mode</th>
                <th>Values</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(row, i) in flatPreview.slice(0, 12)" :key="i">
                <tr v-if="row.isGroup">
                  <td colspan="4" class="py-1">
                    <v-chip size="x-small" color="primary" variant="tonal" label prepend-icon="mdi-layers-outline">
                      Group — {{ row.innerCount }} condition{{ row.innerCount !== 1 ? 's' : '' }}
                    </v-chip>
                  </td>
                </tr>
                <tr v-else :style="row.indented ? 'background: rgba(var(--v-theme-primary), 0.04)' : ''">
                  <td :class="row.indented ? 'pl-7' : ''">
                    <v-chip size="x-small" label>{{ row.c.field }}</v-chip>
                  </td>
                  <td>
                    <v-chip size="x-small" :color="row.c.mode === 'exclude' ? 'error' : 'success'" variant="tonal">
                      {{ row.c.mode }}
                    </v-chip>
                  </td>
                  <td class="text-caption">{{ Array.isArray(row.c.values) ? row.c.values.join(', ') : row.c.values }}</td>
                  <td class="text-caption">{{ row.c.operator || '—' }}</td>
                </tr>
              </template>
            </tbody>
          </v-table>
          <div v-if="flatPreview.length > 12" class="text-caption text-medium-emphasis mb-2">
            …and {{ flatPreview.length - 12 }} more rows
          </div>
        </template>

        <v-alert v-if="parseError" type="error" variant="tonal" density="compact">{{ parseError }}</v-alert>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!preview.length" @click="doImport">
          Add {{ previewSummary }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseCSVToConditions, downloadConditionsTemplate } from '../../utils/csvRuleImportExport'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'import'])

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const file = ref(null)
const preview = ref([])
const parseError = ref('')

const flatPreview = computed(() => {
  const rows = []
  for (const item of preview.value) {
    if (item.type === 'group') {
      rows.push({ isGroup: true, innerCount: item.conditions.length })
      for (const inner of item.conditions) rows.push({ isGroup: false, indented: true, c: inner })
    } else {
      rows.push({ isGroup: false, indented: false, c: item })
    }
  }
  return rows
})

const previewSummary = computed(() => {
  const groups = preview.value.filter(c => c.type === 'group').length
  const leaves = preview.value.filter(c => c.type !== 'group').length
  const parts = []
  if (leaves) parts.push(`${leaves} condition${leaves !== 1 ? 's' : ''}`)
  if (groups) parts.push(`${groups} group${groups !== 1 ? 's' : ''}`)
  return parts.join(', ')
})

function onFileSelected(files) {
  parseError.value = ''
  preview.value = []
  const f = Array.isArray(files) ? files[0] : files
  if (!f) return
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const parsed = parseCSVToConditions(e.target.result)
      if (!parsed.length) { parseError.value = 'No valid conditions found in file.'; return }
      preview.value = parsed
    } catch {
      parseError.value = 'Could not parse CSV file.'
    }
  }
  reader.readAsText(f)
}

function doImport() {
  emit('import', preview.value)
  emit('update:modelValue', false)
  file.value = null
  preview.value = []
}
</script>
