import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Base de datos temporal para no tocar la de desarrollo.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cuentas-test-'))

const { app } = await import('../src/app.js')

let server
let base

beforeAll(async () => {
  server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

const json = (method, url, body) =>
  fetch(`${base}${url}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

describe('movimientos', () => {
  it('registra un ingreso válido y lo devuelve', async () => {
    const res = await json('POST', '/api/movimientos', {
      tipo: 'ingreso',
      monto: 1500,
      categoria: 'Sueldo',
      fecha: '2026-11-01',
      descripcion: 'Quincena',
    })
    expect(res.status).toBe(201)
    const row = await res.json()
    expect(row).toMatchObject({ tipo: 'ingreso', monto: 1500, categoria: 'Sueldo', fecha: '2026-11-01' })
    expect(row.id).toBeGreaterThan(0)
  })

  it('rechaza un movimiento inválido con 400 y lista de errores', async () => {
    const res = await json('POST', '/api/movimientos', {
      tipo: 'otra cosa',
      monto: -5,
      categoria: '',
      fecha: 'ayer',
    })
    expect(res.status).toBe(400)
    const cuerpo = await res.json()
    expect(Array.isArray(cuerpo.errores)).toBe(true)
    expect(cuerpo.errores.length).toBeGreaterThan(0)
  })

  it('calcula saldo con ingresos y gastos', async () => {
    await json('POST', '/api/movimientos', {
      tipo: 'gasto',
      monto: 49.9,
      categoria: 'Alimentación',
      fecha: '2026-11-02',
    })
    const res = await json('GET', '/api/saldo')
    expect(await res.json()).toEqual({ ingresos: 1500, gastos: 49.9, saldo: 1450.1 })
  })

  it('resume por categoría y por mes', async () => {
    const res = await json('GET', '/api/resumen')
    const datos = await res.json()
    expect(datos.porCategoria.some((r) => r.categoria === 'Sueldo' && r.tipo === 'ingreso')).toBe(true)
    expect(datos.porCategoria.some((r) => r.categoria === 'Alimentación' && r.tipo === 'gasto')).toBe(true)
    expect(datos.porMes.some((r) => r.mes === '2026-11')).toBe(true)
  })

  it('elimina un movimiento existente y devuelve 404 si no existe', async () => {
    const creado = await (await json('POST', '/api/movimientos', {
      tipo: 'gasto',
      monto: 10,
      categoria: 'Otros',
      fecha: '2026-11-03',
    })).json()

    const del = await json('DELETE', `/api/movimientos/${creado.id}`)
    expect(del.status).toBe(204)

    const repetido = await json('DELETE', `/api/movimientos/${creado.id}`)
    expect(repetido.status).toBe(404)
  })
})
