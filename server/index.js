// server/index.js
const express = require('express')
const cors = require('cors')
const seed = require('./data/seed')

const db = {
  promotions: JSON.parse(JSON.stringify(seed.promotions)),
  stackingGroups: JSON.parse(JSON.stringify(seed.stackingGroups)),
  templates: JSON.parse(JSON.stringify(seed.templates)),
}

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/promotions', require('./routes/promotions')(db))
app.use('/api/stacking-groups', require('./routes/stackingGroups')(db))
app.use('/api/templates', require('./routes/templates')(db))
app.use('/api/parse', require('./routes/parse')())

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}`))
