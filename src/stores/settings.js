import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'promotions_settings'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadFromStorage()

  const multiBuyFreePrice = ref(saved.multiBuyFreePrice ?? 0.01)
  const giftFreePrice = ref(saved.giftFreePrice ?? 0.01)

  watch(multiBuyFreePrice, (val) => {
    const current = loadFromStorage()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, multiBuyFreePrice: val }))
  })

  watch(giftFreePrice, (val) => {
    const current = loadFromStorage()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, giftFreePrice: val }))
  })

  function save(values) {
    if (values.multiBuyFreePrice !== undefined) multiBuyFreePrice.value = values.multiBuyFreePrice
    if (values.giftFreePrice !== undefined) giftFreePrice.value = values.giftFreePrice
  }

  return { multiBuyFreePrice, giftFreePrice, save }
})
