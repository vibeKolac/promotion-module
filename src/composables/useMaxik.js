import { ref } from 'vue'

const openTrigger = ref(0)
const closeTrigger = ref(0)
const isOpen = ref(false)
const stickyBarActive = ref(false)

export function useMaxik() {
  return {
    openTrigger,
    closeTrigger,
    isOpen,
    stickyBarActive,
    toggle() {
      if (isOpen.value) closeTrigger.value++
      else openTrigger.value++
    },
  }
}
