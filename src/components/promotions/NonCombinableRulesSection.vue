<!-- src/components/promotions/NonCombinableRulesSection.vue -->
<template>
  <div>
    <v-alert
      v-if="ownGroupNonCombinable"
      type="info"
      variant="tonal"
      density="compact"
      icon="mdi-information-outline"
      class="mb-3"
    >
      This rule is assigned to <strong>{{ ownGroupName }}</strong> and is set as non-combinable with that group — it will not stack with other rules in its own group.
    </v-alert>

    <!-- Existing restrictions list -->
    <div v-if="modelValue.length" class="d-flex flex-column gap-2 mb-3">
      <div
        v-for="(entry, idx) in enrichedEntries"
        :key="`${entry.type}-${entry.id}`"
        class="d-flex align-center px-3 py-2 rounded rule-entry"
      >
        <v-icon
          size="16"
          class="mr-2"
          :color="entry.type === 'all' ? 'error' : entry.type === 'group' ? entry.color : 'grey-darken-1'"
        >
          {{ entry.type === 'all' ? 'mdi-cancel' : entry.type === 'group' ? 'mdi-layers-triple' : 'mdi-tag-outline' }}
        </v-icon>
        <span class="text-body-2 flex-grow-1">
          <span class="text-medium-emphasis mr-1">{{ entry.type === 'all' ? '' : entry.type === 'group' ? 'Group:' : 'Rule:' }}</span>
          {{ entry.label }}
        </span>
        <StatusBadge v-if="entry.type === 'rule' && entry.status" :status="entry.status" class="ml-2" />
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          class="ml-1"
          @click="remove(idx)"
        />
      </div>
    </div>

    <div class="d-flex align-center restriction-actions">
      <v-btn
        prepend-icon="mdi-plus"
        variant="outlined"
        size="default"
        @click="openDialog"
      >
        Add restriction
      </v-btn>
      <v-btn
        prepend-icon="mdi-cancel"
        variant="outlined"
        size="default"
        color="grey-darken-4"
        :disabled="allNonCombinable"
        @click="makeAllNonCombinable"
      >
        Non-combinable with all
      </v-btn>
    </div>

    <!-- Add restriction dialog -->
    <DialogCard ref="dialogCard" max-width="480" @after-leave="resetDialog">
      <template #title>Add non-combinable restriction</template>

          <p class="text-caption text-medium-emphasis mb-4">
            Select a priority group or a specific rule that cannot run at the same time as this rule.
          </p>

          <v-btn-toggle
            v-model="mode"
            mandatory
            density="compact"
            variant="outlined"
            divided
            class="mb-4"
          >
            <v-btn value="group" size="small" prepend-icon="mdi-layers-triple">
              Priority group
            </v-btn>
            <v-btn value="rule" size="small" prepend-icon="mdi-tag-outline">
              Specific rule
            </v-btn>
          </v-btn-toggle>

          <!-- Group picker — dropdown -->
          <v-autocomplete
            v-if="mode === 'group'"
            v-model="selectedIds"
            :items="availableGroups"
            label="Select groups"
            variant="outlined"
            density="compact"
            item-title="title"
            item-value="value"
            multiple
            chips
            closable-chips
            chip-color="grey-darken-1"
            no-data-text="All groups already added"
            hide-details
          />

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
            chip-color="grey-darken-1"
            no-data-text="No eligible rules found"
            hide-details
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :subtitle="item.raw.coveredByGroup ? 'Already covered by group restriction' : null" :disabled="item.raw.coveredByGroup">
                <template #append>
                  <StatusBadge :status="item.raw.status" />
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
      <template #actions>
        <v-btn variant="text" @click="dialogCard.close()">Cancel</v-btn>
        <v-btn color="success" :disabled="!selectedIds.length" @click="add">
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
import StatusBadge from '../shared/StatusBadge.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  stackingGroupId: { type: String, default: null },
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

const allRules = computed(() =>
  promoStore.items.filter(p =>
    NON_ENDED_STATUSES.includes(p.status) && p.id !== currentRuleId.value
  )
)

const ownGroupNonCombinable = computed(() =>
  !!props.stackingGroupId &&
  props.modelValue.some(e => e.type === 'group' && e.id === props.stackingGroupId)
)

const ownGroupName = computed(() => {
  if (!ownGroupNonCombinable.value) return ''
  return sgStore.items.find(g => g.id === props.stackingGroupId)?.name ?? ''
})

const allNonCombinable = computed(() => {
  const hasAllRulesEntry = props.modelValue.some(e => e.type === 'all')
  if (hasAllRulesEntry) return true
  const addedRuleIds = new Set(props.modelValue.filter(e => e.type === 'rule').map(e => e.id))
  return allRules.value.length > 0 && allRules.value.every(r => addedRuleIds.has(r.id))
})

function makeAllNonCombinable() {
  emit('update:modelValue', [{ type: 'all', id: '__all__' }])
}

const availableGroups = computed(() =>
  sgStore.items
    .filter(g => !props.modelValue.some(e => e.type === 'group' && e.id === g.id))
    .map(g => ({ value: g.id, title: g.name, color: g.color }))
)

const restrictedGroupIds = computed(() =>
  new Set(props.modelValue.filter(e => e.type === 'group').map(e => e.id))
)

const availableRules = computed(() =>
  promoStore.items
    .filter(p =>
      p.id !== currentRuleId.value &&
      !props.modelValue.some(e => e.type === 'rule' && e.id === p.id)
    )
    .map(p => ({
      value: p.id,
      title: p.name,
      status: p.status,
      coveredByGroup: restrictedGroupIds.value.has(p.stackingGroupId ?? 'sg-default'),
    }))
)

const enrichedEntries = computed(() =>
  props.modelValue.map(entry => {
    if (entry.type === 'all') {
      return { ...entry, label: 'Non-combinable with all other promotion rules', color: 'error' }
    }
    if (entry.type === 'group') {
      const g = sgStore.items.find(g => g.id === entry.id)
      return { ...entry, label: g?.name ?? entry.id, color: g?.color ?? '#6B7280' }
    }
    const p = promoStore.items.find(p => p.id === entry.id)
    return { ...entry, label: p?.name ?? entry.id, status: p?.status }
  })
)


function remove(idx) {
  const updated = [...props.modelValue]
  updated.splice(idx, 1)
  emit('update:modelValue', updated)
}

function openDialog() {
  dialogCard.value.open()
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

<style scoped>
.rule-entry {
  background: rgba(0, 0, 0, 0.04);
}
.restriction-actions {
  gap: 20px;
}
</style>
