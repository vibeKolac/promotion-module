<template>
  <v-dialog v-model="open" width="600" max-width="90%">
    <v-card>
      <v-card-title>Save filter?</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="name"
          label="Name"
          variant="outlined"
          density="compact"
          autofocus
          data-testid="saved-filter-name"
        />
        <v-select
          v-model="sharedGroups"
          :items="groups"
          label="Share to groups"
          hint="Leave empty to keep the filter private."
          persistent-hint
          variant="outlined"
          density="compact"
          multiple
          chips
          closable-chips
          data-testid="saved-filter-groups"
        />
        <v-alert v-if="filter" color="info" variant="tonal" density="compact" class="mt-4">
          Saving updates this filter with the search and filters currently applied.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="black" variant="text" @click="open = false">Cancel</v-btn>
        <v-btn
          :color="filter ? 'warning' : 'primary'"
          :disabled="!name.trim()"
          data-testid="saved-filter-submit"
          @click="submit"
        >Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  filter: { type: Object, default: null },
  groups: { type: Array, required: true },
})
const emit = defineEmits(['submit'])

const open = defineModel({ type: Boolean, default: false })
const name = ref('')
const sharedGroups = ref([])

watch(open, isOpen => {
  if (!isOpen) return
  name.value = props.filter?.name ?? ''
  sharedGroups.value = [...(props.filter?.sharedGroups ?? [])]
})

function submit() {
  emit('submit', { name: name.value.trim(), sharedGroups: sharedGroups.value })
  open.value = false
}
</script>
