<!-- src/components/promotions/StackingGroupSelect.vue -->
<template>
  <div>
    <div class="d-flex align-center" style="gap: 8px">
      <v-select
        :model-value="modelValue"
        :items="groupItems"
        :loading="store.loading"
        label="Assign to priority group"
        variant="outlined"
        density="compact"
        hint="Rules in the same priority group stack together."
        persistent-hint
        style="flex: 1"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <v-btn
        icon="mdi-plus"
        variant="outlined"
        size="small"
        density="compact"
        title="Create new group"
        style="margin-bottom: 22px"
        @click="dialogOpen = true"
      />
    </div>

    <v-dialog v-model="dialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-body-1 font-weight-bold pa-5 pb-3">New priority group</v-card-title>
        <v-card-text class="pa-5 pt-0 d-flex flex-column" style="gap: 16px">
          <v-text-field
            v-model="form.name"
            label="Group name"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :error-messages="nameError"
            autofocus
            @keydown.enter="submit"
          />
          <div>
            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">COLOUR</div>
            <div class="d-flex flex-wrap" style="gap: 8px">
              <div
                v-for="c in COLOR_OPTIONS"
                :key="c"
                class="color-swatch"
                :style="{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }"
                @click="form.color = c"
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="store.loading" @click="submit">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStackingGroupsStore } from '../../stores/stackingGroups'

const props = defineProps({ modelValue: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])

const store = useStackingGroupsStore()
onMounted(() => store.fetchAll())

const groupItems = computed(() =>
  store.items.map(g => ({ value: g.id, title: g.name }))
)

const COLOR_OPTIONS = ['#6B7280','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6']

const dialogOpen = ref(false)
const nameError = ref('')
const form = reactive({ name: '', color: COLOR_OPTIONS[1] })

function closeDialog() {
  dialogOpen.value = false
  form.name = ''
  form.color = COLOR_OPTIONS[1]
  nameError.value = ''
}

async function submit() {
  nameError.value = ''
  if (!form.name.trim()) {
    nameError.value = 'Group name is required'
    return
  }
  const created = await store.create({
    name: form.name.trim(),
    color: form.color,
    priority: store.items.length + 1,
  })
  emit('update:modelValue', created.id)
  closeDialog()
}
</script>

<style scoped>
.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}
.color-swatch:hover {
  transform: scale(1.15);
}
</style>
