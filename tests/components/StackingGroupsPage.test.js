import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import StackingGroupsPage from '../../src/components/stackingGroups/StackingGroupsPage.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })

const sampleGroups = [
  { id: 'g1', name: 'VIP Group', priority: 1, color: '#EF4444', isDefault: false },
  { id: 'g2', name: 'Default Group', priority: 10, color: '#3B82F6', isDefault: true },
]

const mountPage = (groups = []) =>
  mount(StackingGroupsPage, {
    global: {
      plugins: [
        createTestingPinia({ initialState: { stackingGroups: { items: groups, loading: false } } }),
        vuetify,
      ],
      stubs: { StackingGroupDialog: true },
    },
    attachTo: document.body,
  })

describe('StackingGroupsPage', () => {
  afterEach(() => {
    document.body.textContent = ''
  })

  it('renders page title "Stacking groups"', () => {
    const w = mountPage()
    expect(w.text()).toContain('Stacking groups')
    w.unmount()
  })

  it('shows "New group" button', () => {
    const w = mountPage()
    const btn = w.findAll('button').find(b => b.text().includes('New group'))
    expect(btn).toBeTruthy()
    w.unmount()
  })

  it('renders group names from store', () => {
    const w = mountPage(sampleGroups)
    const text = w.text()
    expect(text).toContain('VIP Group')
    expect(text).toContain('Default Group')
    w.unmount()
  })

  it('delete button is disabled for the default group', () => {
    const w = mountPage(sampleGroups)
    // Delete buttons have text-error class; the disabled one also has v-btn--disabled
    const deleteBtns = w.findAll('button.text-error')
    const disabledDeleteBtn = deleteBtns.find(b => b.attributes('disabled') !== undefined)
    expect(disabledDeleteBtn).toBeTruthy()
    w.unmount()
  })

  it('clicking "New group" opens dialog', async () => {
    const w = mountPage()
    const btn = w.findAll('button').find(b => b.text().includes('New group'))
    await btn.trigger('click')
    expect(w.vm.dialogOpen).toBe(true)
    w.unmount()
  })

  it('clicking edit button sets editingGroup to the correct group', async () => {
    const w = mountPage(sampleGroups)
    // Edit buttons: icon buttons without text-error, in the table rows
    // Row action buttons are in the table; first row's edit is the first non-delete icon btn in tbody
    // Use the component's openEdit by finding all icon-only buttons without text-error
    const iconBtns = w.findAll('button.v-btn--icon:not(.text-error)')
    expect(iconBtns.length).toBeGreaterThan(0)
    await iconBtns[0].trigger('click')
    expect(w.vm.editingGroup).toEqual(sampleGroups[0])
    expect(w.vm.dialogOpen).toBe(true)
    w.unmount()
  })
})
