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
  const giftOosMulti = ref(saved.giftOosMulti ?? 'remove')
  const prioritizationMode = ref(saved.prioritizationMode ?? 'manual')
  const excludedCategories = ref(saved.excludedCategories ?? [])
  const excludedSkus = ref(saved.excludedSkus ?? [])
  const excludedProductTypes = ref(saved.excludedProductTypes ?? [])

  watch(
    [multiBuyFreePrice, giftFreePrice, giftOosMulti, prioritizationMode, excludedCategories, excludedSkus, excludedProductTypes],
    () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        multiBuyFreePrice: multiBuyFreePrice.value,
        giftFreePrice: giftFreePrice.value,
        giftOosMulti: giftOosMulti.value,
        prioritizationMode: prioritizationMode.value,
        excludedCategories: excludedCategories.value,
        excludedSkus: excludedSkus.value,
        excludedProductTypes: excludedProductTypes.value,
      }))
    },
    { deep: true },
  )

  function save(values) {
    if (values.multiBuyFreePrice !== undefined) multiBuyFreePrice.value = values.multiBuyFreePrice
    if (values.giftFreePrice !== undefined) giftFreePrice.value = values.giftFreePrice
    if (values.giftOosMulti !== undefined) giftOosMulti.value = values.giftOosMulti
    if (values.prioritizationMode !== undefined) prioritizationMode.value = values.prioritizationMode
    if (values.excludedCategories !== undefined) excludedCategories.value = values.excludedCategories
    if (values.excludedSkus !== undefined) excludedSkus.value = values.excludedSkus
    if (values.excludedProductTypes !== undefined) excludedProductTypes.value = values.excludedProductTypes
  }

  return { multiBuyFreePrice, giftFreePrice, giftOosMulti, prioritizationMode, excludedCategories, excludedSkus, excludedProductTypes, save }
})
