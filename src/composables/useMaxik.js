import { ref } from 'vue'

const openTrigger = ref(0)
const closeTrigger = ref(0)
const isOpen = ref(false)

export function useMaxik() {
  return {
    openTrigger,
    closeTrigger,
    isOpen,
    toggle() {
      if (isOpen.value) closeTrigger.value++
      else openTrigger.value++
    },
  }
}
