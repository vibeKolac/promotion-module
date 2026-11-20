import { ref, computed, watch, unref } from 'vue'

export function useColumnSelect({ storageKey, headers }) {
  const selectedKeys = ref(null)

  function load() {
    try {
      const raw = localStorage.getItem(unref(storageKey))
      const keys = raw ? JSON.parse(raw) : null
      return Array.isArray(keys) ? keys : null
    } catch {
      return null
    }
  }

  watch(() => unref(storageKey), () => { selectedKeys.value = load() }, { immediate: true })

  const selectableHeaders = computed(() => unref(headers).filter(h => !h.hiddenForColumnSelect))

  const visibleHeaders = computed(() => {
    const all = unref(headers)
    if (!selectedKeys.value) return all
    const chosen = selectedKeys.value.filter(key => selectableHeaders.value.some(h => h.key === key))
    if (!chosen.length) return all
    return all.filter(h => h.hiddenForColumnSelect || chosen.includes(h.key))
  })

  const selectedSelectableKeys = computed(() =>
    visibleHeaders.value.filter(h => !h.hiddenForColumnSelect).map(h => h.key),
  )

  function applyColumns(keys) {
    selectedKeys.value = keys
    try {
      localStorage.setItem(unref(storageKey), JSON.stringify(keys))
    } catch {
      // storage unavailable: the choice applies for this session only
    }
  }

  return { selectableHeaders, visibleHeaders, selectedSelectableKeys, applyColumns }
}
