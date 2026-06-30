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
  const excludedBrands = ref(saved.excludedBrands ?? [])
  const excludedSkus = ref(saved.excludedSkus ?? ['100200309'])
  const excludedProductLines = ref(saved.excludedProductLines ?? [])
  const cartDiscountCalculation = ref(saved.cartDiscountCalculation ?? 'per_item')

  watch(
    [multiBuyFreePrice, giftFreePrice, giftOosMulti, prioritizationMode, excludedCategories, excludedBrands, excludedSkus, excludedProductLines, cartDiscountCalculation],
    () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        multiBuyFreePrice: multiBuyFreePrice.value,
        giftFreePrice: giftFreePrice.value,
        giftOosMulti: giftOosMulti.value,
        prioritizationMode: prioritizationMode.value,
        excludedCategories: excludedCategories.value,
        excludedBrands: excludedBrands.value,
        excludedSkus: excludedSkus.value,
        excludedProductLines: excludedProductLines.value,
        cartDiscountCalculation: cartDiscountCalculation.value,
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
    if (values.excludedBrands !== undefined) excludedBrands.value = values.excludedBrands
    if (values.excludedSkus !== undefined) excludedSkus.value = values.excludedSkus
    if (values.excludedProductLines !== undefined) excludedProductLines.value = values.excludedProductLines
    if (values.cartDiscountCalculation !== undefined) cartDiscountCalculation.value = values.cartDiscountCalculation
  }

  return { multiBuyFreePrice, giftFreePrice, giftOosMulti, prioritizationMode, excludedCategories, excludedBrands, excludedSkus, excludedProductLines, cartDiscountCalculation, save }
})
