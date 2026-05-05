// server/routes/erpEntries.js
const { erpEntries } = require('../data/seed')

module.exports = function () {
  const router = require('express').Router()
  router.get('/', (_req, res) => res.json(erpEntries))
  return router
}
