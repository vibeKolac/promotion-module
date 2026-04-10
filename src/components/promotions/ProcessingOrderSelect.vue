<!-- src/components/promotions/ProcessingOrderSelect.vue -->
<template>
  <div>
    <div v-if="promotionsStore.loading || sgStore.loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate size="24" />
    </div>

    <template v-else>
      <div class="rule-list">
        <div
          v-for="(item, idx) in flatList"
          :key="item.id"
          class="rule-row d-flex align-center gap-2 pa-2 rounded mb-1"
          :class="item.isCurrent ? 'rule-row--current' : 'rule-row--other'"
        >
          <div class="position-badge text-caption font-weight-bold flex-shrink-0">
            {{ idx + 1 }}
          </div>

          <div class="flex-grow-1 min-width-0">
            <div class="text-body-2 font-weight-medium text-truncate">
              {{ item.name || '(unnamed)' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.type?.replace(/_/g, ' ') ?? 'new rule' }}
              <span v-if="item.isCurrent" class="text-primary"> · this rule</span>
            </div>
          </div>

          <div v-if="item.isCurrent" class="d-flex gap-1 flex-shrink-0">
            <v-btn
              icon="mdi-chevron-up"
              size="x-small"
              variant="tonal"
              :disabled="idx === 0"
              @click="move(-1)"
            />
            <v-btn
              icon="mdi-chevron-down"
              size="x-small"
              variant="tonal"
              :disabled="idx === flatList.length - 1"
              @click="move(1)"
            />
          </div>
        </div>

        <div v-if="flatList.length === 1" class="text-caption text-medium-emphasis pa-2">
          No other rules in this group yet.
        </div>
      </div>

      <div class="d-flex align-center flex-wrap gap-2 mt-2">
        <v-icon size="14" color="medium-emphasis">mdi-layers</v-icon>
        <span class="text-caption text-medium-emphasis"><strong>{{ currentGroupName }}</strong></span>
        <v-chip size="x-small" variant="tonal" color="primary">
          group priority {{ currentGroup?.priority ?? '—' }}
        </v-chip>
        <v-chip size="x-small" variant="tonal" color="secondary">
          rule priority {{ props.priority ?? '—' }}
        </v-chip>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePromotionsStore } from '../../stores/promotions'
import { useStackingGroupsStore } from '../../stores/stackingGroups'

const props = defineProps({
  stackingGroupId: { type: String, default: null },
  priority: { type: Number, default: 10 },
  currentName: { type: String, default: '' },
})
const emit = defineEmits(['update:priority'])

const promotionsStore = usePromotionsStore()
const sgStore = useStackingGroupsStore()
const route = useRoute()
const currentId = computed(() => route.params.id ?? null)

const currentGroup = computed(() =>
  sgStore.items.find(g => g.id === props.stackingGroupId)
)
const currentGroupName = computed(() => currentGroup.value?.name ?? 'Unassigned')

// Other rules in the same stacking group, sorted by priority
const groupRules = computed(() =>
  [...promotionsStore.items]
    .filter(r => r.id !== currentId.value && (r.stackingGroupId ?? 'sg-default') === (props.stackingGroupId ?? 'sg-default'))
    .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
)

// Local ordered array — drives display and moves.
// Reset whenever the stacking group changes; priority changes from arrows do NOT reset it.
const localOrder = ref(null)

function buildLocalOrder() {
  const others = [...groupRules.value]
  const cur = { id: '__current__', isCurrent: true, name: props.currentName || 'This rule', type: null }
  const insertIdx = others.findIndex(r => (r.priority ?? 999) > (props.priority ?? 999))
  if (insertIdx === -1) others.push(cur)
  else others.splice(insertIdx, 0, cur)
  localOrder.value = others
}

watch(() => props.stackingGroupId, () => { localOrder.value = null }, { immediate: false })
watch(() => props.currentName, (name) => {
  if (!localOrder.value) return
  const entry = localOrder.value.find(r => r.isCurrent)
  if (entry) entry.name = name || 'This rule'
})

// Expose flat list — build on first access or after group reset
const flatList = computed(() => {
  if (!localOrder.value) buildLocalOrder()
  return localOrder.value ?? []
})

const currentIdx = computed(() => flatList.value.findIndex(r => r.isCurrent))

function move(dir) {
  const list = [...flatList.value]
  const idx = currentIdx.value
  const newIdx = idx + dir
  if (newIdx < 0 || newIdx >= list.length) return

  // Swap current rule with neighbour
  ;[list[idx], list[newIdx]] = [list[newIdx], list[idx]]
  localOrder.value = list

  // Emit whole-number priority: position × 10, always an integer with gaps
  emit('update:priority', (newIdx + 1) * 10)
}

onMounted(async () => {
  await Promise.all([
    promotionsStore.items.length ? null : promotionsStore.fetchAll(),
    sgStore.items.length <= 1 ? sgStore.fetchAll() : null,
  ])
})
</script>

<style scoped>
.rule-list {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.rule-row {
  transition: background 0.15s;
}

.rule-row--current {
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
}

.rule-row--other {
  background: transparent;
}

.rule-row--other:hover {
  background: rgba(0, 0, 0, 0.03);
}

.position-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(var(--v-border-color), 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
}

.rule-row--current .position-badge {
  background: rgba(var(--v-theme-primary), 0.2);
  color: rgb(var(--v-theme-primary));
}

.min-width-0 {
  min-width: 0;
}
</style>
