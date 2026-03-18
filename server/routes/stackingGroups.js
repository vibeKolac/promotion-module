const express = require('express')
const { v4: uuid } = require('uuid')
const router = express.Router()

module.exports = (db) => {
  router.get('/', (req, res) => res.json(db.stackingGroups))

  router.post('/', (req, res) => {
    const item = { ...req.body, id: uuid() }
    db.stackingGroups.push(item)
    res.status(201).json(item)
  })

  router.delete('/:id', (req, res) => {
    const idx = db.stackingGroups.findIndex(g => g.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    db.stackingGroups.splice(idx, 1)
    res.status(204).end()
  })

  return router
}
