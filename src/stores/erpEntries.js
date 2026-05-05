// src/stores/erpEntries.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { erpEntries as mockEntries } from '../mock/seed.js'

export const useErpEntriesStore = defineStore('erpEntries', () => {
  const items = ref([])
  const loading = ref(false)

  async function fetchAll() {
    if (items.value.length) return
    loading.value = true
    try {
      const { data } = await axios.get('/api/erp-entries')
      items.value = data
    } catch {
      items.value = mockEntries
    } finally {
      loading.value = false
    }
  }

  return { items, loading, fetchAll }
})
