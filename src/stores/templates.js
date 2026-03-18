import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useTemplatesStore = defineStore('templates', () => {
  const items = ref([])

  async function fetchAll() {
    const { data } = await axios.get('/api/templates')
    items.value = data
  }

  return { items, fetchAll }
})
