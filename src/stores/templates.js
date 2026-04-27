import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useTemplatesStore = defineStore('templates', () => {
  const items = ref([])

  async function fetchAll() {
    const { data } = await axios.get('/api/templates')
    items.value = data
  }

  async function create(payload) {
    const { data } = await axios.post('/api/templates', payload)
    items.value.push(data)
    return data
  }

  async function update(id, payload) {
    const { data } = await axios.put(`/api/templates/${id}`, payload)
    const idx = items.value.findIndex(t => t.id === id)
    if (idx !== -1) items.value[idx] = data
    return data
  }

  async function remove(id) {
    await axios.delete(`/api/templates/${id}`)
    items.value = items.value.filter(t => t.id !== id)
  }

  return { items, fetchAll, create, update, remove }
})
