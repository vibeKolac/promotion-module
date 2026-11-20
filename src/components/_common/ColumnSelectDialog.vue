<template>
  <v-dialog v-model="open" width="600" max-width="90%">
    <v-card>
      <v-card-title>Choose columns</v-card-title>

      <v-card-text>
        <v-data-table
          v-model="draft"
          :headers="[{ title: 'Column', key: 'title', sortable: false }]"
          :items="columns"
          item-value="key"
          show-select
          hide-default-footer
          items-per-page="-1"
          density="compact"
          data-testid="column-select-table"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="black" variant="text" @click="open = false">Cancel</v-btn>
        <v-btn color="primary" :disabled="!draft.length" @click="submit">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  selected: { type: Array, required: true },
})
const emit = defineEmits(['submit'])

const open = defineModel({ type: Boolean, default: false })
const draft = ref([...props.selected])

watch(open, (isOpen) => {
  if (isOpen) draft.value = [...props.selected]
})

function submit() {
  const order = props.columns.map(c => c.key)
  emit('submit', order.filter(key => draft.value.includes(key)))
  open.value = false
}
</script>
