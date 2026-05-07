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
          primary: '#558b2f',
          'primary-darken-1': '#33691e',
          success: '#4caf50',
          error: '#e53935',
          warning: '#f57f17',
          'on-primary': '#ffffff',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: 'letter-spacing: 0.05em',
    },
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
