<!-- src/components/promotions/NonCombinableRulesSection.vue -->
<template>
  <div>
    <!-- Existing restrictions list -->
    <div v-if="modelValue.length" class="d-flex flex-column gap-2 mb-3">
      <div
        v-for="(entry, idx) in enrichedEntries"
        :key="`${entry.type}-${entry.id}`"
        class="d-flex align-center px-3 py-2 rounded"
        style="background: rgba(0,0,0,0.04)"
      >
        <v-icon
          size="16"
          class="mr-2"
          :color="entry.type === 'group' ? entry.color : 'grey-darken-1'"
        >
          {{ entry.type === 'group' ? 'mdi-layers-triple' : 'mdi-tag-outline' }}
        </v-icon>
        <span class="text-body-2 flex-grow-1">
          <span class="text-medium-emphasis mr-1">{{ entry.type === 'group' ? 'Group:' : 'Rule:' }}</span>
          {{ entry.label }}
        </span>
        <v-chip
          v-if="entry.type === 'rule' && entry.status"
          size="x-small"
          :color="statusColor(entry.status)"
          variant="flat"
          class="ml-2 text-capitalize"
        >
          {{ entry.status }}
        </v-chip>
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          class="ml-1"
          @click="remove(idx)"
        />
      </div>
    </div>

    <v-alert
      v-else
      type="info"
      variant="tonal"
      density="compact"
      icon="mdi-check-circle-outline"
      class="mb-3 text-caption"
    >
      No restrictions — this rule can combine with any other rule.
    </v-alert>

    <v-btn
      prepend-icon="mdi-plus"
      variant="outlined"
      size="small"
      class="text-uppercase"
      @click="openDialog"
    >
      Add restriction
    </v-btn>

    <!-- Add restriction dialog -->
    <DialogCard ref="dialogCard" max-width="480" @after-leave="resetDialog">
      <template #title>Add non-combinable restriction</template>

          <p class="text-caption text-medium-emphasis mb-4">
            Select a stacking group or a specific rule that cannot run at the same time as this rule.
          </p>

          <v-btn-toggle
            v-model="mode"
            mandatory
            density="compact"
            color="primary"
            class="mb-4"
            rounded="lg"
          >
            <v-btn value="group" size="small" prepend-icon="mdi-layers-triple">
              Stacking group
            </v-btn>
            <v-btn value="rule" size="small" prepend-icon="mdi-tag-outline">
              Specific rule
            </v-btn>
          </v-btn-toggle>

          <!-- Group picker — chip toggles -->
          <template v-if="mode === 'group'">
            <div v-if="availableGroups.length" class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="g in availableGroups"
                :key="g.value"
                :color="selectedIds.includes(g.value) ? 'primary' : undefined"
                :variant="selectedIds.includes(g.value) ? 'flat' : 'outlined'"
                size="small"
                label
                class="cursor-pointer"
                @click="toggleSelection(g.value)"
              >
                <v-icon start size="14" :color="selectedIds.includes(g.value) ? undefined : g.color">
                  mdi-layers-triple
                </v-icon>
                <v-icon v-if="selectedIds.includes(g.value)" start size="14">mdi-check</v-icon>
                {{ g.title }}
              </v-chip>
            </div>
            <p v-else class="text-caption text-medium-emphasis">All groups already added.</p>
          </template>

          <!-- Rule picker — multiple autocomplete -->
          <v-autocomplete
            v-else
            v-model="selectedIds"
            :items="availableRules"
            label="Select rules"
            variant="outlined"
            density="compact"
            item-title="title"
            item-value="value"
            multiple
            chips
            closable-chips
            no-data-text="No eligible rules found"
            hide-details
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :subtitle="null">
                <template #append>
                  <v-chip
                    size="x-small"
                    :color="statusColor(item.raw.status)"
                    variant="flat"
                    class="text-capitalize"
                  >
                    {{ item.raw.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
      <template #actions>
        <v-btn variant="text" @click="dialogCard.close()">Cancel</v-btn>
        <v-btn color="primary" :disabled="!selectedIds.length" @click="add">
          Add{{ selectedIds.length > 1 ? ` (${selectedIds.length})` : '' }}
        </v-btn>
      </template>
    </DialogCard>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStackingGroupsStore } from '../../stores/stackingGroups'
import { usePromotionsStore } from '../../stores/promotions'
import DialogCard from '../_common/DialogCard.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const route = useRoute()
const sgStore = useStackingGroupsStore()
const promoStore = usePromotionsStore()

const dialogCard = ref(null)
const mode = ref('group')
const selectedIds = ref([])

watch(mode, () => { selectedIds.value = [] })

const currentRuleId = computed(() => route.params.id ?? null)

const NON_ENDED_STATUSES = ['active', 'scheduled', 'paused', 'draft']

const availableGroups = computed(() =>
  sgStore.items
    .filter(g => !props.modelValue.some(e => e.type === 'group' && e.id === g.id))
    .map(g => ({ value: g.id, title: g.name, color: g.color }))
)

const availableRules = computed(() =>
  promoStore.items
    .filter(p =>
      NON_ENDED_STATUSES.includes(p.status) &&
      p.id !== currentRuleId.value &&
      !props.modelValue.some(e => e.type === 'rule' && e.id === p.id)
    )
    .map(p => ({ value: p.id, title: p.name, status: p.status }))
)

const enrichedEntries = computed(() =>
  props.modelValue.map(entry => {
    if (entry.type === 'group') {
      const g = sgStore.items.find(g => g.id === entry.id)
      return { ...entry, label: g?.name ?? entry.id, color: g?.color ?? '#6B7280' }
    }
    const p = promoStore.items.find(p => p.id === entry.id)
    return { ...entry, label: p?.name ?? entry.id, status: p?.status }
  })
)

const STATUS_COLORS = {
  active: 'success',
  scheduled: 'info',
  paused: 'warning',
  draft: 'grey',
  ended: 'error',
}

function statusColor(status) {
  return STATUS_COLORS[status] ?? 'grey'
}

function remove(idx) {
  const updated = [...props.modelValue]
  updated.splice(idx, 1)
  emit('update:modelValue', updated)
}

function openDialog() {
  dialogCard.value.open()
}

function toggleSelection(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

function resetDialog() {
  mode.value = 'group'
  selectedIds.value = []
}

function add() {
  if (!selectedIds.value.length) return
  const newEntries = selectedIds.value.map(id => ({ type: mode.value, id }))
  emit('update:modelValue', [...props.modelValue, ...newEntries])
  dialogCard.value.close()
}
</script>
