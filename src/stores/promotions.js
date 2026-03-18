import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import axios from 'axios'
import { v4 as uuid } from 'uuid'

const emptyDraft = () => ({
  name: '', type: 'discount', value: '', valueUnit: '%',
  steps: [], priority: 10, status: 'active',
  startDate: null, endDate: null,
  stackingGroupId: null, conditions: [], gifts: [],
  exclusive: false,
  processingOrder: null,
  stepType: 'SPENT',
  giftStepType: 'SPENT', giftStepValue: '', giftMaxSteps: '',
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
    Object.assign(formDraft, data)
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

  return { items, loading, error, formDraft, fetchAll, fetchOne, create, update, remove, applyParsedRule, resetDraft }
})
