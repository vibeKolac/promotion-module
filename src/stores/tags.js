import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useTagsStore = defineStore('tags', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get('/api/tags')
      items.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const { data } = await axios.post('/api/tags', payload)
    items.value.push(data)
    return data
  }

  async function update(id, payload) {
    const { data } = await axios.put(`/api/tags/${id}`, payload)
    const idx = items.value.findIndex(t => t.id === id)
    if (idx !== -1) items.value[idx] = data
    return data
  }

  async function remove(id) {
    await axios.delete(`/api/tags/${id}`)
    items.value = items.value.filter(t => t.id !== id)
  }

  return { items, loading, error, fetchAll, create, update, remove }
})
