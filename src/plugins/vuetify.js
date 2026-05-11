// src/plugins/vuetify.js
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components: { ...components, ...labsComponents },
  directives,
  date: {
    formats: {
      keyboardDate: (date) => {
        const d = new Date(date)
        const day   = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year  = d.getFullYear()
        return `${day}/${month}/${year}`
      },
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#49a927',
          secondary: '#455a64',
          success: '#49a927',
          error: '#ff5252',
          info: '#2196f3',
          warning: '#fb8c00',
          'on-primary': '#ffffff',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      class: 'text-uppercase',
    },
    VCardActions: {
      VBtn: {
        variant: 'elevated',
      },
    },
    VAutocomplete: { color: 'primary' },
    VSelect: { color: 'primary' },
    VSwitch: { color: 'primary' },
    VTextField: { color: 'primary' },
    VTabs: { color: 'primary' },
    VRadioGroup: { color: 'primary' },
    VTextarea: { color: 'primary' },
    VCheckbox: { color: 'primary' },
    VFileInput: { color: 'primary' },
    VDateInput: {
      placeholder: 'dd/mm/yyyy',
      displayFormat: (date) => {
        const d = new Date(date)
        const day   = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year  = d.getFullYear()
        return `${day}/${month}/${year}`
      },
    },
  },
})
