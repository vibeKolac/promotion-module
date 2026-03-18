const express = require('express')
const { v4: uuid } = require('uuid')
const router = express.Router()

module.exports = (db) => {
  router.get('/', (req, res) => {
    const { q, type, status } = req.query
    let items = [...db.promotions]
    if (q) items = items.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    if (type) items = items.filter(p => p.type === type)
    if (status) items = items.filter(p => p.status === status)
    res.json(items)
  })

  router.get('/:id', (req, res) => {
    const item = db.promotions.find(p => p.id === req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  })

  router.post('/', (req, res) => {
    const now = new Date().toISOString()
    const item = { ...req.body, id: uuid(), createdAt: now, updatedAt: now }
    db.promotions.push(item)
    res.status(201).json(item)
  })

  router.put('/:id', (req, res) => {
    const idx = db.promotions.findIndex(p => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    db.promotions[idx] = { ...db.promotions[idx], ...req.body, updatedAt: new Date().toISOString() }
    res.json(db.promotions[idx])
  })

  router.delete('/:id', (req, res) => {
    const idx = db.promotions.findIndex(p => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    db.promotions.splice(idx, 1)
    res.status(204).end()
  })

  return router
}
