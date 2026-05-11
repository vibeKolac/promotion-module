import { ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

export function useNavigationGuard({ onSaveAndLeave } = {}) {
  const router = useRouter()
  const leaveDialogOpen = ref(false)
  const pendingNavTarget = ref(null)
  const bypassGuard = ref(false)

  onBeforeRouteLeave((to, _from, next) => {
    if (bypassGuard.value) {
      next()
      return
    }
    pendingNavTarget.value = to.fullPath
    leaveDialogOpen.value = true
    next(false)
  })

  function openLeaveDialog(target) {
    pendingNavTarget.value = target
    leaveDialogOpen.value = true
  }

  function cancelLeave() {
    leaveDialogOpen.value = false
    pendingNavTarget.value = null
  }

  function leaveWithoutSaving() {
    bypassGuard.value = true
    leaveDialogOpen.value = false
    router.push(pendingNavTarget.value)
  }

  async function saveAndLeave() {
    if (onSaveAndLeave) {
      const ok = await onSaveAndLeave()
      if (!ok) return
    }
    bypassGuard.value = true
    leaveDialogOpen.value = false
    router.push(pendingNavTarget.value)
  }

  return { leaveDialogOpen, pendingNavTarget, openLeaveDialog, cancelLeave, leaveWithoutSaving, saveAndLeave }
}
