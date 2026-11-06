import express from 'express'
import { db } from './db.js'

export const app = express()

app.use(express.json())
app.use(express.static('public'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/movimientos', (_req, res) => {
  const rows = db.prepare('SELECT * FROM movimientos ORDER BY fecha DESC, id DESC').all()
  res.json(rows)
})
