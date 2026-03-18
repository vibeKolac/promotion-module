// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/promotions' },
  { path: '/promotions', component: { template: '<div>Promotions list placeholder</div>' } },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
