const express = require('express')
const { v4: uuid } = require('uuid')
const router = express.Router()

module.exports = (db) => {
  router.get('/', (req, res) => res.json(db.stackingGroups))

  router.post('/', (req, res) => {
    const item = { id: uuid(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    db.stackingGroups.push(item)
    res.status(201).json(item)
  })

  router.put('/:id', (req, res) => {
    const idx = db.stackingGroups.findIndex(g => g.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    db.stackingGroups[idx] = { ...db.stackingGroups[idx], ...req.body, updatedAt: new Date().toISOString() }
    res.json(db.stackingGroups[idx])
  })

  router.delete('/:id', (req, res) => {
    const inUse = db.promotions.filter(p => p.stackingGroupId === req.params.id)
    if (inUse.length > 0) return res.status(409).json({ error: `${inUse.length} rule(s) are using this group` })
    db.stackingGroups = db.stackingGroups.filter(g => g.id !== req.params.id)
    res.status(204).end()
  })

  return router
}
