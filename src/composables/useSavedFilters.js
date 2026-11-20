import { ref, computed, watch, unref } from 'vue'

export const CURRENT_USER = { id: 'u-lukas', name: 'Lukas J.' }
export const USER_GROUPS = ['Marketing']
export const SHAREABLE_GROUPS = ['Category management', 'Ecommerce', 'Marketing']

const condition = (field, extra) => ({ field, values: [], dateMode: null, from: null, to: null, ...extra })

export const SEED_FILTERS = [
  {
    id: 'seed-anna',
    name: 'Created by Anna K.',
    user: { id: 'u-anna', name: 'Anna K.' },
    sharedGroups: ['Marketing'],
    options: { search: '', conditions: [condition('createdBy', { values: ['Anna K.'] })] },
  },
  {
    id: 'seed-martin',
    name: 'Running in the last 30 days',
    user: { id: 'u-martin', name: 'Martin P.' },
    sharedGroups: ['Marketing', 'Ecommerce'],
    options: { search: '', conditions: [condition('date', { dateMode: 'last_30' })] },
  },
  {
    id: 'seed-private',
    name: 'Not visible to this user',
    user: { id: 'u-martin', name: 'Martin P.' },
    sharedGroups: ['Ecommerce'],
    options: { search: 'test', conditions: [] },
  },
]

export function useSavedFilters({ storageKey, user = CURRENT_USER, userGroups = USER_GROUPS, seed = SEED_FILTERS }) {
  const all = ref([])

  function load() {
    try {
      const raw = localStorage.getItem(unref(storageKey))
      const stored = raw ? JSON.parse(raw) : null
      if (Array.isArray(stored)) return stored
    } catch {
      // fall through to the seed
    }
    return seed.map(f => JSON.parse(JSON.stringify(f)))
  }

  function persist() {
    try {
      localStorage.setItem(unref(storageKey), JSON.stringify(all.value))
    } catch {
      // storage unavailable: filters last for this session only
    }
  }

  watch(() => unref(storageKey), () => { all.value = load() }, { immediate: true })

  const isOwn = f => f.user.id === user.id
  const visible = computed(() => all.value.filter(f => isOwn(f) || f.sharedGroups.some(g => userGroups.includes(g))))
  const mine = computed(() => visible.value.filter(isOwn))
  const shared = computed(() => visible.value.filter(f => !isOwn(f)))

  function save({ name, sharedGroups, options }) {
    const filter = { id: `f-${Date.now()}-${all.value.length}`, name, user: { ...user }, sharedGroups, options }
    all.value = [...all.value, filter]
    persist()
    return filter
  }

  function update(id, { name, sharedGroups, options }) {
    const current = all.value.find(f => f.id === id)
    if (!current || !isOwn(current)) return null
    const next = { ...current, name, sharedGroups, options }
    all.value = all.value.map(f => (f.id === id ? next : f))
    persist()
    return next
  }

  function remove(id) {
    const current = all.value.find(f => f.id === id)
    if (!current || !isOwn(current)) return
    all.value = all.value.filter(f => f.id !== id)
    persist()
  }

  return { mine, shared, save, update, remove }
}
