# Feature 001 — Exportar movimientos a CSV

> Documento único de la feature (Reglas 1–7 de `../REGLAS-DOCUMENTACION.md`).
> Cada sección se llena al finalizar el paso correspondiente del workflow.

## Registro de ingreso

- **Fecha/hora de entrada:** 2026-11-06 21:56 (hora local del equipo)
- **Pedido por:** Piero (dueño del piloto)
- **Descripción:** Poder descargar los movimientos registrados como un archivo
  CSV para abrirlo en Excel. Desde la página, un botón «Exportar CSV» genera y
  descarga el archivo con todos los movimientos (columnas: fecha, tipo, monto,
  categoría, descripción). Alcance inicial: todos los movimientos; el filtrado
  por mes queda fuera de esta feature.
- **Contexto relevante:** primera feature del piloto. Corre por el flujo SDD
  completo del harness RSC (spec → plan → tasks → implement → revisión de
  agentes → verify → ship) para medir tiempos, tokens e intervenciones humanas
  de cada paso. Workflow: ramas + PR (main cerrada). Nada de código sin
  documentar: este documento se abre ANTES de desarrollar.

## Spec

- Resumen de lo especificado: botón «Exportar CSV» junto a los movimientos que
  descarga un `.csv` (UTF-8 con BOM, separador coma) con encabezado
  `fecha,tipo,monto,categoria,descripcion` y una fila por movimiento en el
  orden de la tabla. Sin movimientos → solo encabezados. Descripciones con
  comas/comillas → celda entrecomillada. Error visible, nunca descarga
  silenciosa. Fuera de alcance: filtro por mes, XLSX/PDF, exportar resúmenes.
- Artefactos: `02-DOCS/wiki/sdd/specs/001-exportar-csv.md` — `rsc spec gate`:
  **PASS** (4 puntos abiertos, 4 tipados)
- Desviaciones / decisiones: spec aprobada **en autopilot** (autorización
  expresa del dueño para toda la corrida). Suposiciones tomadas: UTF-8 con BOM
  + coma; orden igual que la tabla. Diferido: exportación por mes.

**Métricas del paso**
- Inicio: 2026-11-06 22:18:39 UTC · Fin: 2026-11-06 22:20:26 UTC · Duración: ~2 min
- Tokens: input 28,413 · caché leída 1,452,480 · output 8,939 · Costo: n/d (tabla de precios GLM pendiente)
- Intervenciones humanas: 0 (autopilot)

## Plan

- Resumen del enfoque técnico:
- Artefactos: `specs/001-exportar-csv/plan.md`
- Desviaciones / decisiones:

**Métricas del paso**
- Inicio: · Fin: · Duración:
- Tokens: · Costo estimado: · Intervenciones humanas:

## Tasks

- Resumen del desglose:
- Artefactos: `specs/001-exportar-csv/tasks.md`
- Desviaciones / decisiones:

**Métricas del paso**
- Inicio: · Fin: · Duración:
- Tokens: · Costo estimado: · Intervenciones humanas:

## Desarrollo

- Rama: · Commits:
- Decisiones de implementación:

**Métricas del paso**
- Inicio: · Fin: · Duración:
- Tokens: · Costo estimado: · Intervenciones humanas:

## Revisión de agentes

- Hallazgos (por agente: refuter-correctness / refuter-security / refuter-tests / finding-verifier):
- Resolución de cada hallazgo:

**Métricas del paso**
- Inicio: · Fin: · Duración:
- Tokens: · Costo estimado: · Intervenciones humanas:

## Verificación

- Tests / evidencia:
- Resultado:

**Métricas del paso**
- Inicio: · Fin: · Duración:
- Tokens: · Costo estimado: · Intervenciones humanas:

## Ship

- PR: · Merge: · Cierre:

**Métricas del paso**
- Inicio: · Fin: · Duración:
- Tokens: · Costo estimado: · Intervenciones humanas:

## Métricas

| Paso | Duración | Tokens | Interv. humanas | Notas |
|---|---|---|---|---|
| Registro | ~2 min | — | 1 (elección de la feature) | Elegida entre 4 opciones |
| Spec | | | | |
| Plan | | | | |
| Tasks | | | | |
| Desarrollo | | | | |
| Revisión | | | | |
| Verificación | | | | |
| Ship | | | | |
| **Total** | | | | |
