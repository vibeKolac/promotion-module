import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import AiRecommendationsPanel from '../../src/components/ai/AiRecommendationsPanel.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })
const mountPanel = () =>
  mount(AiRecommendationsPanel, {
    global: { plugins: [createTestingPinia(), vuetify] },
  })

describe('AiRecommendationsPanel', () => {
  it('renders recommendation cards', () => {
    const w = mountPanel()
    expect(w.text()).toContain('AI Recommendations')
  })

  it('shows at least one recommendation', () => {
    const w = mountPanel()
    expect(w.text()).toMatch(/Step Discount|Multi Buy|Gift Promotion|VIP/)
  })

  it('shows potential revenue for each recommendation', () => {
    const w = mountPanel()
    expect(w.text()).toMatch(/€\d/)
  })

  it('shows confidence score', () => {
    const w = mountPanel()
    expect(w.text()).toMatch(/\d+%/)
  })
})
