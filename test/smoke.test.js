import http from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'

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

describe('base del servidor', () => {
  it('responde /api/health con status ok', async () => {
    const res = await fetch(`${base}/api/health`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('responde /api/movimientos con una lista (vacía al inicio)', async () => {
    const res = await fetch(`${base}/api/movimientos`)
    expect(res.status).toBe(200)
    expect(Array.isArray(await res.json())).toBe(true)
  })
})
