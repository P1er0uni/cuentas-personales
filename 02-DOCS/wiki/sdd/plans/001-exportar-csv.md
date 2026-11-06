---
type: plan
title: Plan — Exportar movimientos a CSV
description: Plan estructural para exportar movimientos a CSV — componentes, contratos, flujo, estrategia de pruebas y riesgos.
tags: [sdd, plan]
timestamp: 2026-11-06T22:24:00Z
topic: sdd
slug: 001-exportar-csv
status: draft
---

# Plan — Exportar movimientos a CSV

> Spec: [../specs/001-exportar-csv.md](../specs/001-exportar-csv.md) · Constitution: [../constitution.md](../constitution.md) · Status: approved (autopilot)
> Last updated: 2026-11-06

## 0. Global Constraints

- **Formato del archivo:** UTF-8 **con BOM**; separador **coma**; fin de línea **CRLF** (RFC 4180).
- **Encabezado exacto (una fila):** `fecha,tipo,monto,categoria,descripcion`.
- **Orden de filas:** el de la tabla — `fecha DESC, id DESC`.
- **Sin movimientos:** el archivo trae únicamente la fila de encabezados.
- **Entrecomillado:** celda con coma, comilla doble o salto → entrecomillada; comillas internas dobladas (RFC 4180).
- **Formula injection:** celda que empieza con `=`, `+`, `-` o `@` se prefija con `'` (Excel no la ejecuta).
- **Errores de API:** JSON `{"errores": [...]}` / `{"error": "..."}`; nunca fallar en silencio.
- **Stack (constitución §1):** Node ESM, Express 5, better-sqlite3, Vitest; frontend estático sin build.
- **UI (constitución §8):** operable por teclado, modo oscuro intacto.
- **Calidad (constitución §2):** `npm test` en verde con tests nuevos de la feature.
- **Commits:** gitmoji, español, autoría humana (sin Co-Authored-By).

## 1. Context & constraints

- Criterios que moldean el diseño: spec §Acceptance #1 (encabezado+filas+orden),
  #2 (vacío), #3 (entrecomillado), #4 (UTF-8 BOM), #5 (error visible).
- Constitución en juego: §2 tests como puerta, §3 estructura y forma de errores,
  §8 UI teclado/oscuro, §7 los datos no salen del equipo (la exportación la
  genera la app local).
- Fuera de alcance (spec Non-goals): filtro por mes, XLSX/PDF, exportar
  resúmenes, selección de columnas. El diseño no añade ninguno «por si acaso».

## 2. Architecture

```text
[ Botón «Exportar CSV»  (public/index.html · INTERNAL) ]
        |  click → GET /api/movimientos/csv
        v
[ Ruta de exportación   (src/app.js · INTERNAL) ]
        |  consulta (misma query que la tabla)
        v
[ db movimientos        (better-sqlite3 · EXTERNAL) ]
        |  filas crudas
        v
[ Generador CSV         (src/csv.js · INTERNAL, puro) ]
        |  texto CSV (BOM + RFC 4180)
        v
[ Navegador: descarga del archivo (EXTERNAL) ]
```

- **Generador CSV** (internal) — única responsabilidad: convertir filas en
  texto CSV válido (BOM, CRLF, entrecomillado, anti-formula-injection). Puro:
  no toca la db ni el reloj.
- **Ruta de exportación** (internal) — única responsabilidad: pedir las filas
  en el orden de la tabla, delegar en el generador y responder `text/csv` como
  attachment.
- **Botón + descarga** (internal) — única responsabilidad: disparar la
  descarga y mostrar el error si falla.

**Decisión arquitectónica principal:** generar el CSV **en el servidor** (ruta
nueva) en vez de armarlo en el navegador a partir del listado JSON. Motivo: un
solo generador puro, testeable unitariamente y reutilizable; el contrato queda
definido en un lugar y el navegador solo descarga. Trade-off: una ruta más —
se acepta porque la testabilidad del contrato (integration test sobre HTTP)
vale más que minimizar rutas en una app de este tamaño.

## 3. Interfaces & contracts

```text
csv.generarCsv(movimientos: Movimiento[]) -> string
  - devuelve BOM + encabezado + una línea CRLF por movimiento
  - puro: misma entrada → misma salida; sin db, sin fechas del sistema
  - postcondición: salida parseable como CSV RFC 4180 de 5 columnas

GET /api/movimientos/csv -> 200 text/csv
  - header: Content-Disposition: attachment; filename="movimientos-<YYYYMMDD>.csv"
  - 200 aunque no haya movimientos (solo encabezado)
  - fallo del servidor: 500 con {"errores": ["..."]} (forma del proyecto)

descargarCsv() (navegador, sin args)
  - fetch → blob → descarga vía <a download>
  - en fallo: mensaje de error visible en la página; no descarga nada
```

## 4. Data model & flow

**Entidades** — sin cambios: `movimiento` (id, tipo, monto, categoria, fecha,
descripcion) ya existe. Sin migraciones, sin backfill, sin columnas nuevas.

**Flujo primario** (exportar con datos):

1. El usuario pulsa «Exportar CSV» →
2. la página pide `GET /api/movimientos/csv` →
3. la ruta consulta movimientos `ORDER BY fecha DESC, id DESC` (idéntica a la
   tabla) →
4. `csv.generarCsv` produce el texto (BOM + encabezado + filas) →
5. la ruta responde `text/csv` attachment →
6. el navegador descarga el archivo.

- Frontera de consistencia: lectura única, sin transacción.
- Impacto en migraciones: ninguno.

## 5. Testing strategy

| Criterio (spec §Acceptance) | Nivel | Qué afirma | Qué finge |
|---|---|---|---|
| #1 encabezado + filas + orden | integration (HTTP contra la app) | contenido exacto del body con datos sembrados | nada (db temporal ya existente) |
| #2 vacío → solo encabezado | integration | body = BOM + encabezado + CRLF final | nada |
| #3 entrecomillado RFC 4180 | unit (`csv.generarCsv`) | comas/comillas/saltos entrecomillados y escapados | nada (entrada literal) |
| #4 UTF-8 con BOM + acentos | unit + integration | bytes inician con BOM; «Alimentación» íntegra | nada |
| #5 error visible, sin descarga | verificación manual registrada + manejo de error en la página | el mensaje aparece y no hay descarga | — |

Anti-formula-injection: unit — celdas que empiezan con `=`, `+`, `-`, `@`
quedan prefijadas con `'`.

## 6. Sequencing & dependencies

1. `src/csv.js` + tests unit (puro, sin ruta) — verificable solo.
2. Ruta `GET /api/movimientos/csv` + tests integration — depende de 1.
3. Botón en la UI + manejo de error — depende de 2.
4. Verificación manual en navegador (descarga + Excel) y cierre documental —
   depende de 3.

## 7. Risks & open decisions

1. **Excel con configuración regional que espera «;»** — todo en una columna.
   Trigger: equipo con lista regional distinta. Impacto: reordenar a mano.
   Mitigación: BOM + coma estándar (lo abre la mayoría); si aparece, cambiar
   el separador es un cambio de una línea (registrado en la spec).
2. **Montos decimales con punto** (`75.5`): Excel es-PE podría leerlos como
   texto si espera coma decimal. Mitigación: mantener punto (estándar CSV);
   se verifica en la prueba manual y se anota el resultado.
3. **Formula injection** (`=cmd...` en descripción): mitigado en el generador
   (prefijo `'`); test unit lo cubre.
4. **Nombre de archivo con fecha**: se toma del servidor; si el reloj del
   equipo difiere, el nombre refleja la fecha del servidor (local, mismo
   equipo). Riesgo menor, aceptado.

Decisiones añadidas a `decisions.md`: CSV generado en servidor; mitigación de
formula injection incluida desde el plan.
