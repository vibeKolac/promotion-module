import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuid } from 'uuid'

const STORAGE_KEY = 'condition_presets'

const DEFAULTS = [
  {
    id: 'cp-1',
    name: 'VIP Customers',
    description: 'Club Gold, Platinum and Healthcare Professionals',
    conditions: [
      { id: 'cpd-1', field: 'customer_group', mode: 'include', values: ['Club Gold', 'Club Platinum', 'Healthcare Professional'] },
    ],
  },
  {
    id: 'cp-2',
    name: 'Skincare Categories',
    description: 'Dermocosmetology, Face Care, Body Care',
    conditions: [
      { id: 'cpd-2', field: 'categories', mode: 'include', values: ['Dermocosmetology', 'Face Care', 'Body Care'] },
    ],
  },
  {
    id: 'cp-3',
    name: 'Min. Spend €50',
    description: 'Cart subtotal at least €50',
    conditions: [
      { id: 'cpd-3', field: 'subtotal', mode: 'include', values: ['50'], operator: '>=' },
    ],
  },
  {
    id: 'cp-4',
    name: 'Dr. Max Own Brand',
    description: 'Any Dr. Max own-brand product',
    conditions: [
      { id: 'cpd-4', field: 'brands', mode: 'include', values: ['Dr. Max'] },
    ],
  },
  {
    id: 'cp-5',
    name: 'Web & App Only',
    description: 'Limit to web and mobile app traffic sources',
    conditions: [
      { id: 'cpd-5', field: 'source', mode: 'include', values: ['Web', 'Mobile App', 'iOS App', 'Android App'] },
    ],
  },
]

export const useConditionPresetsStore = defineStore('conditionPresets', () => {
  const saved = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  const items = ref(saved ?? DEFAULTS.map(d => ({ ...d })))

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  }

  function create(payload) {
    const item = { ...payload, id: uuid(), conditions: payload.conditions.map(c => ({ ...c, id: uuid() })) }
    items.value.push(item)
    persist()
    return item
  }

  function update(id, payload) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload }
      persist()
    }
  }

  function remove(id) {
    items.value = items.value.filter(i => i.id !== id)
    persist()
  }

  return { items, create, update, remove }
})
