import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useSavedFilters } from '../../src/composables/useSavedFilters'

const me = { id: 'me', name: 'Me' }
const other = { id: 'other', name: 'Other' }
const seed = [
  { id: 's1', name: 'Shared to my group', user: other, sharedGroups: ['A'], options: { search: '', conditions: [] } },
  { id: 's2', name: 'Shared elsewhere', user: other, sharedGroups: ['B'], options: { search: '', conditions: [] } },
  { id: 's3', name: 'Private of other', user: other, sharedGroups: [], options: { search: '', conditions: [] } },
]
const make = () => useSavedFilters({ storageKey: ref('k'), user: me, userGroups: ['A'], seed })

describe('useSavedFilters', () => {
  beforeEach(() => localStorage.clear())

  it('shows shared filters only when one of my groups is in the share list', () => {
    const f = make()
    expect(f.shared.value.map(x => x.id)).toEqual(['s1'])
    expect(f.mine.value).toEqual([])
  })

  it('saves a private filter as mine and persists it', () => {
    const f = make()
    const saved = f.save({ name: 'Mine', sharedGroups: [], options: { search: 'x', conditions: [] } })
    expect(f.mine.value.map(x => x.id)).toEqual([saved.id])
    expect(JSON.parse(localStorage.getItem('k')).some(x => x.id === saved.id)).toBe(true)
    expect(make().mine.value).toHaveLength(1)
  })

  it('updates and removes own filters only', () => {
    const f = make()
    const saved = f.save({ name: 'Mine', sharedGroups: [], options: { search: '', conditions: [] } })
    f.update(saved.id, { name: 'Renamed', sharedGroups: ['A'], options: { search: 'y', conditions: [] } })
    expect(f.mine.value[0]).toMatchObject({ name: 'Renamed', sharedGroups: ['A'] })
    expect(f.update('s1', { name: 'Hijack', sharedGroups: [], options: {} })).toBeNull()
    f.remove('s1')
    expect(f.shared.value.map(x => x.id)).toEqual(['s1'])
    f.remove(saved.id)
    expect(f.mine.value).toEqual([])
  })
})
