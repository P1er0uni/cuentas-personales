import { describe, expect, it } from 'vitest'
import { generarCsv } from '../src/csv.js'

const BOM = '﻿'
const CRLF = '\r\n'

const mov = (campos) => ({
  id: 1,
  tipo: 'ingreso',
  monto: 100,
  categoria: 'Sueldo',
  fecha: '2026-11-01',
  descripcion: null,
  ...campos,
})

describe('generarCsv', () => {
  it('empieza con BOM y encabezado exacto de 5 columnas', () => {
    const csv = generarCsv([])
    expect(csv.startsWith(BOM)).toBe(true)
    expect(csv).toBe(`${BOM}fecha,tipo,monto,categoria,descripcion${CRLF}`)
  })

  it('con movimientos: una línea CRLF por movimiento, columnas en orden', () => {
    const csv = generarCsv([
      mov({ fecha: '2026-11-02', tipo: 'gasto', monto: 49.9, categoria: 'Alimentación', descripcion: 'Mercado' }),
    ])
    expect(csv).toBe(
      `${BOM}fecha,tipo,monto,categoria,descripcion${CRLF}2026-11-02,gasto,49.9,Alimentación,Mercado${CRLF}`
    )
  })

  it('descripción nula o vacía → celda vacía', () => {
    const csv = generarCsv([mov({ descripcion: null })])
    expect(csv.endsWith(`2026-11-01,ingreso,100,Sueldo,${CRLF}`)).toBe(true)
  })

  it('entrecomillado RFC 4180: coma, comilla doble y salto de línea', () => {
    const csv = generarCsv([
      mov({ descripcion: 'Cena con amigos, y "postre"' }),
      mov({ descripcion: 'Línea 1\nLínea 2' }),
    ])
    const lineas = csv.slice(BOM.length).split(CRLF)
    expect(lineas[1]).toBe('2026-11-01,ingreso,100,Sueldo,"Cena con amigos, y ""postre"""')
    expect(lineas[2]).toBe('2026-11-01,ingreso,100,Sueldo,"Línea 1\nLínea 2"')
  })

  it('formula injection: celda que empieza con = + - @ se prefija con apostrofe', () => {
    const csv = generarCsv([
      mov({ descripcion: '=cmd' }),
      mov({ descripcion: '+suma' }),
      mov({ descripcion: '-resta' }),
      mov({ descripcion: '@ref' }),
    ])
    const lineas = csv.slice(BOM.length).split(CRLF)
    expect(lineas[1].endsWith(",'=cmd")).toBe(true)
    expect(lineas[2].endsWith(",'+suma")).toBe(true)
    expect(lineas[3].endsWith(",'-resta")).toBe(true)
    expect(lineas[4].endsWith(",'@ref")).toBe(true)
  })

  it('acentos y ñ intactos (UTF-8 con BOM)', () => {
    const csv = generarCsv([mov({ categoria: 'Alimentación', descripcion: 'Año nuevo, ñoño' })])
    expect(csv.includes('Alimentación')).toBe(true)
    expect(csv.includes('Año')).toBe(true)
  })
})
