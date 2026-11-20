import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useColumnSelect } from '../../src/composables/useColumnSelect'

const headers = [
  { title: 'Name', key: 'name', hiddenForColumnSelect: true },
  { title: 'Type', key: 'type' },
  { title: 'Coupon code', key: 'couponId' },
  { title: '', key: 'actions', hiddenForColumnSelect: true },
]

describe('useColumnSelect', () => {
  beforeEach(() => localStorage.clear())

  it('shows every column and offers only the selectable ones by default', () => {
    const c = useColumnSelect({ storageKey: ref('k'), headers: ref(headers) })
    expect(c.visibleHeaders.value.map(h => h.key)).toEqual(['name', 'type', 'couponId', 'actions'])
    expect(c.selectableHeaders.value.map(h => h.key)).toEqual(['type', 'couponId'])
  })

  it('hides unticked columns, keeps name and actions, and persists the choice', () => {
    const c = useColumnSelect({ storageKey: ref('k'), headers: ref(headers) })
    c.applyColumns(['type'])
    expect(c.visibleHeaders.value.map(h => h.key)).toEqual(['name', 'type', 'actions'])
    expect(JSON.parse(localStorage.getItem('k'))).toEqual(['type'])
  })

  it('restores the stored choice and ignores columns that no longer exist', () => {
    localStorage.setItem('k', JSON.stringify(['couponId', 'gone']))
    const c = useColumnSelect({ storageKey: ref('k'), headers: ref(headers) })
    expect(c.visibleHeaders.value.map(h => h.key)).toEqual(['name', 'couponId', 'actions'])
  })

  it('falls back to all columns when nothing stored is valid', () => {
    localStorage.setItem('k', JSON.stringify(['gone']))
    const c = useColumnSelect({ storageKey: ref('k'), headers: ref(headers) })
    expect(c.visibleHeaders.value).toHaveLength(4)
  })
})
