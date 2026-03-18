import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PromotionsList from '../../src/components/promotions/PromotionsList.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })

const mountComponent = (storeOverrides = {}) =>
  mount(PromotionsList, {
    global: {
      plugins: [createTestingPinia({ initialState: { promotions: storeOverrides } }), vuetify],
      stubs: { RouterLink: true },
    },
  })

describe('PromotionsList', () => {
  it('renders page title', () => {
    const w = mountComponent({ items: [] })
    expect(w.text()).toContain('Promotion rules overview')
  })

  it('renders rows for each promotion', () => {
    const w = mountComponent({
      items: [
        { id: '1', name: 'Test Promo', type: 'discount', priority: 5, status: 'active', updatedAt: '2026-03-18T10:00:00Z' },
      ],
    })
    expect(w.text()).toContain('Test Promo')
  })

  it('shows empty state when no items', () => {
    const w = mountComponent({ items: [] })
    expect(w.text()).toContain('No promotion rules found')
  })
})
