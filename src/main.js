// src/main.js
import { installMock } from './mock/index.js'
if (import.meta.env.VITE_USE_MOCK === 'true') {
  installMock()
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router/index'

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.use(router)
app.mount('#app')
