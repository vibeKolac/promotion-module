<template>
  <v-dialog v-model="open" max-width="560" persistent>
    <v-card>
      <v-card-title class="pa-5 pb-2">Import rules from CSV</v-card-title>
      <v-card-text class="pa-5 pt-2">
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
        <div v-if="preview.length" class="mb-3">
          <div class="text-body-2 font-weight-bold mb-2">Preview ({{ preview.length }} rules)</div>
          <v-table density="compact">
            <thead><tr><th>Name</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="r in preview.slice(0, 5)" :key="r.id ?? r.name">
                <td>{{ r.name }}</td><td>{{ r.type }}</td><td>{{ r.status }}</td>
              </tr>
            </tbody>
          </v-table>
          <div v-if="preview.length > 5" class="text-caption text-medium-emphasis mt-1">
            …and {{ preview.length - 5 }} more
          </div>
        </div>
        <v-alert v-if="parseError" type="error" variant="tonal" density="compact">{{ parseError }}</v-alert>
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!preview.length" @click="doImport">
          Import {{ preview.length }} rules
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseCSVToRules } from '../../utils/csvRuleImportExport'

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
    try { preview.value = parseCSVToRules(e.target.result) }
    catch { parseError.value = 'Could not parse CSV file.' }
  }
  reader.readAsText(f)
}

function doImport() {
  emit('import', preview.value)
  emit('update:modelValue', false)
}
</script>
