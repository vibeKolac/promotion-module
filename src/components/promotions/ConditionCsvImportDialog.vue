<!-- src/components/promotions/ConditionCsvImportDialog.vue -->
<template>
  <v-dialog v-model="open" max-width="600" persistent>
    <v-card>
      <v-card-title class="pa-5 pb-2">Import conditions from CSV</v-card-title>
      <v-card-text class="pa-5 pt-2">

        <v-alert variant="tonal" color="info" density="compact" icon="mdi-information-outline" class="mb-4 text-caption">
          CSV must have columns: <strong>field, mode, values, operator</strong>.
          Separate multiple values with a pipe <code>|</code> (e.g. <code>Nike|Adidas</code>).
          Use operator only for quantifiable fields (subtotal, quantity, weight).
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
            Preview — {{ preview.length }} condition{{ preview.length !== 1 ? 's' : '' }}
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
              <tr v-for="(c, i) in preview.slice(0, 8)" :key="i">
                <td><v-chip size="x-small" label>{{ c.field }}</v-chip></td>
                <td>
                  <v-chip size="x-small" :color="c.mode === 'exclude' ? 'error' : 'success'" variant="tonal">
                    {{ c.mode }}
                  </v-chip>
                </td>
                <td class="text-caption">{{ Array.isArray(c.values) ? c.values.join(', ') : c.values }}</td>
                <td class="text-caption">{{ c.operator ?? '—' }}</td>
              </tr>
            </tbody>
          </v-table>
          <div v-if="preview.length > 8" class="text-caption text-medium-emphasis mb-2">
            …and {{ preview.length - 8 }} more
          </div>
        </template>

        <v-alert v-if="parseError" type="error" variant="tonal" density="compact">{{ parseError }}</v-alert>
      </v-card-text>

      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!preview.length" @click="doImport">
          Add {{ preview.length }} condition{{ preview.length !== 1 ? 's' : '' }}
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
