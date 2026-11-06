import express from 'express'
import { db } from './db.js'
import { generarCsv } from './csv.js'

export const app = express()

app.use(express.json())
app.use(express.static('public'))

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/movimientos', (_req, res) => {
  const rows = db.prepare('SELECT * FROM movimientos ORDER BY fecha DESC, id DESC').all()
  res.json(rows)
})

app.get('/api/movimientos/csv', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM movimientos ORDER BY fecha DESC, id DESC').all()
    const hoy = new Date().toISOString().slice(0, 10).replaceAll('-', '')
    res.setHeader('Content-Disposition', `attachment; filename="movimientos-${hoy}.csv"`)
    res.type('text/csv').send(generarCsv(rows))
  } catch (err) {
    console.error('Error generando CSV:', err)
    res.status(500).json({ errores: ['No se pudo generar el archivo CSV'] })
  }
})

app.post('/api/movimientos', (req, res) => {
  const { tipo, monto, categoria, fecha, descripcion } = req.body ?? {}
  const errores = []

  if (tipo !== 'ingreso' && tipo !== 'gasto') {
    errores.push('tipo debe ser "ingreso" o "gasto"')
  }
  const montoNum = Number(monto)
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    errores.push('monto debe ser un número mayor que 0')
  }
  if (typeof categoria !== 'string' || categoria.trim() === '') {
    errores.push('categoria es obligatoria')
  }
  if (typeof fecha !== 'string' || !FECHA_RE.test(fecha) || Number.isNaN(Date.parse(fecha))) {
    errores.push('fecha debe tener formato YYYY-MM-DD')
  }

  if (errores.length > 0) {
    return res.status(400).json({ errores })
  }

  const info = db
    .prepare(
      'INSERT INTO movimientos (tipo, monto, categoria, fecha, descripcion) VALUES (?, ?, ?, ?, ?)'
    )
    .run(tipo, montoNum, categoria.trim(), fecha, typeof descripcion === 'string' && descripcion.trim() !== '' ? descripcion.trim() : null)

  const row = db.prepare('SELECT * FROM movimientos WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(row)
})

app.delete('/api/movimientos/:id', (req, res) => {
  const info = db.prepare('DELETE FROM movimientos WHERE id = ?').run(Number(req.params.id))
  if (info.changes === 0) {
    return res.status(404).json({ error: 'El movimiento no existe' })
  }
  res.status(204).end()
})

app.get('/api/saldo', (_req, res) => {
  const r = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto END), 0) AS ingresos,
        COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto END), 0) AS gastos
      FROM movimientos`
    )
    .get()
  res.json({ ingresos: r.ingresos, gastos: r.gastos, saldo: r.ingresos - r.gastos })
})

app.get('/api/resumen', (_req, res) => {
  const porCategoria = db
    .prepare(
      `SELECT categoria, tipo, SUM(monto) AS total, COUNT(*) AS cantidad
       FROM movimientos
       GROUP BY categoria, tipo
       ORDER BY total DESC`
    )
    .all()
  const porMes = db
    .prepare(
      `SELECT substr(fecha, 1, 7) AS mes, tipo, SUM(monto) AS total
       FROM movimientos
       GROUP BY mes, tipo
       ORDER BY mes DESC`
    )
    .all()
  res.json({ porCategoria, porMes })
})
