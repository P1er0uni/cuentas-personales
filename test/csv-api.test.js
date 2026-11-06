import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Base de datos temporal para no tocar la de desarrollo.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cuentas-csv-test-'))

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

const post = (body) =>
  fetch(`${base}/api/movimientos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const BOM = '﻿'
const CRLF = '\r\n'

// res.text() de fetch descarta el BOM al decodificar (TextDecoder por defecto);
// lo decodificamos conservándolo para afirmar el contenido exacto.
const textoConBom = async (res) =>
  new TextDecoder('utf-8', { ignoreBOM: true }).decode(await res.arrayBuffer())

describe('GET /api/movimientos/csv', () => {
  it('sin movimientos: 200, solo encabezado, con BOM', async () => {
    const res = await fetch(`${base}/api/movimientos/csv`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/csv')
    const disp = res.headers.get('content-disposition') ?? ''
    expect(disp).toContain('attachment')
    expect(disp).toMatch(/movimientos-\d{8}\.csv/)
    const texto = await textoConBom(res)
    expect(texto).toBe(`${BOM}fecha,tipo,monto,categoria,descripcion${CRLF}`)
  })

  it('con movimientos: body exacto en orden fecha DESC, id DESC', async () => {
    await post({ tipo: 'ingreso', monto: 1500, categoria: 'Sueldo', fecha: '2026-11-01', descripcion: 'Quincena' })
    await post({ tipo: 'gasto', monto: 49.9, categoria: 'Alimentación', fecha: '2026-11-02', descripcion: 'Mercado, semanal' })
    await post({ tipo: 'gasto', monto: 12.5, categoria: 'Transporte', fecha: '2026-11-02', descripcion: 'Taxi' })

    const res = await fetch(`${base}/api/movimientos/csv`)
    expect(res.status).toBe(200)
    const texto = await textoConBom(res)
    expect(texto.startsWith(BOM)).toBe(true)
    const lineas = texto.slice(BOM.length).split(CRLF)
    expect(lineas[0]).toBe('fecha,tipo,monto,categoria,descripcion')
    // Misma fecha → id DESC: Taxi (insertado después) va primero
    expect(lineas[1]).toBe('2026-11-02,gasto,12.5,Transporte,Taxi')
    expect(lineas[2]).toBe('2026-11-02,gasto,49.9,Alimentación,"Mercado, semanal"')
    expect(lineas[3]).toBe('2026-11-01,ingreso,1500,Sueldo,Quincena')
    expect(lineas[4]).toBe('') // CRLF final
  })

  it('los bytes descargados inician con el BOM UTF-8 (EF BB BF)', async () => {
    const res = await fetch(`${base}/api/movimientos/csv`)
    const bytes = new Uint8Array(await res.arrayBuffer())
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
  })
})
