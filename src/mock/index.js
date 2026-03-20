// src/mock/index.js
// Intercepts all /api/* axios calls with in-memory data.
// The real server (server/) and all store axios calls are untouched.
// Toggle via VITE_USE_MOCK env var.

import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { promotions as seedPromotions, stackingGroups as seedGroups, templates as seedTemplates } from './seed.js'

// Mutable in-memory copies — survive the session, reset on hard reload
const db = {
  promotions: structuredClone(seedPromotions),
  stackingGroups: structuredClone(seedGroups),
  templates: structuredClone(seedTemplates),
}

function now() { return new Date().toISOString() }

export function installMock() {
  const mock = new MockAdapter(axios, { delayResponse: 80 })

  // ── Promotions ─────────────────────────────────────────────────────────────

  mock.onGet('/api/promotions').reply(config => {
    const q = config.params?.q?.toLowerCase()
    const items = q
      ? db.promotions.filter(p => p.name.toLowerCase().includes(q))
      : db.promotions
    return [200, items]
  })

  mock.onGet(/\/api\/promotions\/(.+)/).reply(config => {
    const id = config.url.split('/').pop()
    const item = db.promotions.find(p => p.id === id)
    return item ? [200, item] : [404, { error: 'Not found' }]
  })

  mock.onPost('/api/promotions').reply(config => {
    const body = JSON.parse(config.data)
    const item = { id: uuid(), ...body, createdAt: now(), updatedAt: now() }
    db.promotions.push(item)
    return [201, item]
  })

  mock.onPut(/\/api\/promotions\/(.+)/).reply(config => {
    const id = config.url.split('/').pop()
    const idx = db.promotions.findIndex(p => p.id === id)
    if (idx === -1) return [404, { error: 'Not found' }]
    db.promotions[idx] = { ...db.promotions[idx], ...JSON.parse(config.data), updatedAt: now() }
    return [200, db.promotions[idx]]
  })

  mock.onDelete(/\/api\/promotions\/(.+)/).reply(config => {
    const id = config.url.split('/').pop()
    db.promotions = db.promotions.filter(p => p.id !== id)
    return [204]
  })

  // ── Stacking Groups ─────────────────────────────────────────────────────────

  mock.onGet('/api/stacking-groups').reply(() => [200, db.stackingGroups])

  mock.onPost('/api/stacking-groups').reply(config => {
    const body = JSON.parse(config.data)
    const item = { id: uuid(), ...body, createdAt: now(), updatedAt: now() }
    db.stackingGroups.push(item)
    return [201, item]
  })

  mock.onPut(/\/api\/stacking-groups\/(.+)/).reply(config => {
    const id = config.url.split('/').pop()
    const idx = db.stackingGroups.findIndex(g => g.id === id)
    if (idx === -1) return [404, { error: 'Not found' }]
    db.stackingGroups[idx] = { ...db.stackingGroups[idx], ...JSON.parse(config.data), updatedAt: now() }
    return [200, db.stackingGroups[idx]]
  })

  mock.onDelete(/\/api\/stacking-groups\/(.+)/).reply(config => {
    const id = config.url.split('/').pop()
    const inUse = db.promotions.filter(p => p.stackingGroupId === id)
    if (inUse.length) return [409, { error: `${inUse.length} rule(s) are using this group` }]
    db.stackingGroups = db.stackingGroups.filter(g => g.id !== id)
    return [204]
  })

  // ── Templates ───────────────────────────────────────────────────────────────

  mock.onGet('/api/templates').reply(() => [200, db.templates])

  // ── Passthrough anything else ───────────────────────────────────────────────
  mock.onAny().passThrough()
}
