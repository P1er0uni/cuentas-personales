# Cuentas personales — Piloto SDD

Mini-proyecto piloto para ejercitar el flujo SDD (Spec-Driven Development) con el
harness RSC (`@ericrisco/rsc`) sobre Claude Code.

## Qué es

Sistema web de cuentas personales: registro de ingresos y gastos con categoría y
fecha, consulta de saldo y resumen por categoría/mes.

## Stack

- Node.js (ESM) + Express 5
- better-sqlite3 (SQLite; la base vive en `data/`, ignorada por git)
- Vitest para tests
- Frontend estático en `public/` (sin paso de build)

## Comandos

- `npm start` — levanta el servidor en http://localhost:3000
- `npm run dev` — servidor con recarga (`node --watch`)
- `npm test` — corre la suite de Vitest
- `npm run test:watch` — Vitest en modo watch

## Convenciones

- Código en `src/`, tests en `test/` (un archivo `*.test.js` por módulo).
- La base de datos se inicializa en `src/db.js`; el esquema vive ahí.
- `src/app.js` exporta la app Express; `src/server.js` solo la levanta (para tests).
- Las features nuevas se construyen a través del flujo SDD del harness:
  spec → plan → tasks → implement, con specs numeradas en `specs/`.
