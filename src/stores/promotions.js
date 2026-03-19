import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import axios from 'axios'
import { v4 as uuid } from 'uuid'

const emptyDraft = () => ({
  name: '', type: 'discount', value: '', valueUnit: '%',
  amountType: 'PERCENT_CART',
  steps: [], priority: 10, status: 'active',
  startDate: null, endDate: null,
  stackingGroupId: null, conditions: [], gifts: [],
  exclusive: false,
  processingOrder: null,
  stepType: 'SPENT',
  stepMaxSteps: '',
  giftStepType: 'SPENT', giftStepValue: '', giftMaxSteps: '',
  multiBuyQty: '', multiFreeQty: '', multiFreePrice: 0.01,
  multiSelectionMode: 'CHEAPEST', multiMaxSteps: '',
})

export const usePromotionsStore = defineStore('promotions', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const formDraft = reactive(emptyDraft())

  async function fetchAll(filters = {}) {
    loading.value = true
    try {
      const { data } = await axios.get('/api/promotions', { params: filters })
      items.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    const { data } = await axios.get(`/api/promotions/${id}`)
    Object.assign(formDraft, emptyDraft(), data)
  }

  async function create(payload) {
    const { data } = await axios.post('/api/promotions', payload)
    items.value.push(data)
    return data
  }

  async function update(id, payload) {
    const { data } = await axios.put(`/api/promotions/${id}`, payload)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = data
    return data
  }

  async function remove(id) {
    await axios.delete(`/api/promotions/${id}`)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function updateStatus(id, status) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.put(`/api/promotions/${id}`, { ...item, status })
      Object.assign(item, data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function duplicate(id) {
    const source = items.value.find(i => i.id === id)
    if (!source) return
    loading.value = true
    error.value = null
    try {
      const { id: _id, ...payload } = source
      const { data } = await axios.post('/api/promotions', {
        ...payload,
        name: `${source.name} (copy)`,
        status: 'inactive',
      })
      items.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function applyParsedRule(parsed) {
    if (parsed.type) formDraft.type = parsed.type
    if (parsed.value) formDraft.value = parsed.value
    if (parsed.valueUnit) formDraft.valueUnit = parsed.valueUnit
    if (parsed.name) formDraft.name = parsed.name
    if (parsed.startDate !== undefined) formDraft.startDate = parsed.startDate
    if (parsed.endDate !== undefined) formDraft.endDate = parsed.endDate
    if (parsed.priority) formDraft.priority = parsed.priority
    if (parsed.conditions?.length) {
      formDraft.conditions = parsed.conditions.map(c => ({ ...c, id: uuid() }))
    }
    if (parsed.gifts?.length) {
      formDraft.gifts = parsed.gifts.map(g => ({ ...g, id: uuid() }))
    }
  }

  function resetDraft() {
    Object.assign(formDraft, emptyDraft())
  }

  async function bulkUpdateConditions(ids, { mode, conditions }) {
    loading.value = true
    error.value = null
    try {
      for (const id of ids) {
        const item = items.value.find(i => i.id === id)
        if (!item) continue
        const updated = {
          ...item,
          conditions: mode === 'replace' ? conditions : [...item.conditions, ...conditions],
        }
        await axios.put(`/api/promotions/${id}`, updated)
        Object.assign(item, updated)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function importFromCSV(rules) {
    loading.value = true
    error.value = null
    try {
      for (const rule of rules) {
        const { id, ...payload } = rule
        const { data } = await axios.post('/api/promotions', payload)
        items.value.push(data)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, formDraft, fetchAll, fetchOne, create, update, remove, updateStatus, duplicate, applyParsedRule, resetDraft, bulkUpdateConditions, importFromCSV }
})
