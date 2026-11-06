# Cuentas personales — Piloto SDD

Sistema web para llevar las cuentas de una persona: registrar ingresos y gastos
con categoría y fecha, ver el saldo y un resumen por categoría y mes.

Es un mini-proyecto deliberadamente pequeño: sirve como piloto para montar el
harness RSC (`@ericrisco/rsc`) y correr features por el flujo SDD completo
(spec → plan → tasks → implement) midiendo tiempo, costo e intervención humana.

## Requisitos

- Node.js >= 18 (probado con Node 24 LTS)

## Uso

```bash
npm install
npm start        # http://localhost:3000
npm test         # suite de Vitest
```

## Estructura

```
src/        servidor Express y acceso a SQLite
public/     frontend estático
test/       tests de Vitest
data/       base de datos SQLite (creada al arrancar, no versionada)
specs/      specs SDD numeradas (las crea el flujo del harness)
```
