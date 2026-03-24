import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const UNASSIGNED = { id: 'sg-default', name: 'Unassigned', color: '#6B7280', priority: 999, isDefault: true }

export const useStackingGroupsStore = defineStore('stackingGroups', () => {
  const items = ref([UNASSIGNED])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/stacking-groups')
      items.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function create(groupData) {
    loading.value = true
    error.value = null
    try {
      const payload = {
        id: uuidv4(),
        ...groupData,
        createdAt: new Date().toISOString()
      }
      const response = await axios.post('/api/stacking-groups', payload)
      items.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put(`/api/stacking-groups/${id}`, payload)
      const idx = items.value.findIndex(item => item.id === id)
      if (idx !== -1) items.value.splice(idx, 1, response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/stacking-groups/${id}`)
      items.value = items.value.filter(item => item.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  }
})
