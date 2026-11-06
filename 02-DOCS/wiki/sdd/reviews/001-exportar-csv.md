# Revisión — 001-exportar-csv (closing review)

> Rama: `feature/001-exportar-csv` · Riesgo: **tier 1** (1 revisor de contexto
> fresco, sin aprobación humana obligatoria) · Ledger:
> `.rsc/review-ledger.jsonl` (local, no commiteado)

## Ronda 1 — estado 0cd6e8f

- **Revisor:** subagente de contexto fresco (no vio la conversación de
  implementación). Inputs: contrato, spec, SHA, `npm test`.
- **Reporte:** 5 hallazgos → `review consolidate`: 5 únicos, 2 a verificación.
- **npm test en ese estado:** 16/16 verde.
- **Veredicto:** CHANGES REQUESTED.

| ID | Severidad | Dónde | Claim | Verificación | Outcome |
|---|---|---|---|---|---|
| L1 | blocker | `public/index.html` | El error de exportación nunca puede verse: `style.display=''` remueve el inline pero la clase `.error` fija `display:none` → AC5 incumplido; mismo defecto raíz en `#error` del form | **CONFIRMED** por finding-verifier con Edge headless: `display-computado=[none] offsetHeight=[0]` aunque el catch corrió | **fixed** (a3ff919) |
| L2 | should-fix | `src/csv.js` | El early return de formula injection salta el entrecomillado RFC 4180: celda `=SUM(A1), total` sale sin comillas → 6 columnas | **CONFIRMED** por finding-verifier con reproducción en Node: fila parsea a 6 campos | **fixed** (a3ff919) |
| L3 | nit | `src/csv.js` | BOM como literal U+FEFF invisible en el fuente | — (nit, aceptado) | **fixed** (`﻿` explícito) |
| L4 | nit | `src/app.js` | `catch {}` sin log server-side del error real | — (nit, aceptado) | **fixed** (`console.error`) |
| L5 | nit | doc de feature | Fila «Desarrollo» duplicada en la tabla de métricas | — (nit, aceptado) | **fixed** |

**Fixes (commit a3ff919):** (1) se quitó `display:none` de la clase `.error` y
se gobierna la visibilidad solo con el inline (`#error` ahora arranca con
`style="display:none"`); verificado en navegador real pulsando el botón con
fetch fallido: `display-computado=[block] offsetHeight=[18]` con el mensaje
visible. (2) `entrecomillar` ya no retorna temprano: aplica el prefijo `'` y
luego evalúa el entrecomillado sobre el texto prefijado; test nuevo cubre el
caso combinado afirmando 5 columnas tras parseo RFC 4180. (3–5) nits.

## Ronda 2 — divergencia 0cd6e8f..a3ff919 (solo el diff de fixes)

- **Revisor:** nuevo subagente de contexto fresco.
- **Reporte:** 1 hallazgo (nit). **npm test:** 17/17 verde.
- **Veredicto:** **APPROVE WITH NITS**.

| ID | Severidad | Dónde | Claim | Outcome |
|---|---|---|---|---|
| L6 | nit | `test/csv.test.js` | El literal BOM invisible quedó inconsistente con `src/csv.js` (ya corregido a `﻿`) | **fixed** (mismo replace por codepoint; 17/17 verde) |

## Veredicto final

**APPROVE WITH NITS** (todos los nits corregidos igualmente; 0 hallazgos
abiertos). Sin bloqueantes: la feature cumple los 5 criterios de aceptación
con evidencia. → **Ship**.

Resumen honesto del conteo: 6 reportados → 6 únicos → 2 verificados
independientemente (CONFIRMED con reproducción) → 6 fixed · 0 refutados ·
0 abiertos. Falso-positivo: 0%.
