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

- Resumen del enfoque técnico: generador CSV **puro** (`src/csv.js`: BOM, CRLF,
  RFC 4180, anti-formula-injection) + ruta `GET /api/movimientos/csv` que usa
  la misma query que la tabla + botón en la UI que descarga vía blob y muestra
  errores. Sin cambios de esquema. Estrategia de pruebas: unit para el
  generador, integration para la ruta, manual registrada para Excel.
- Artefactos: `02-DOCS/wiki/sdd/plans/001-exportar-csv.md`
- Desviaciones / decisiones: CSV **en el servidor** (no en el navegador) por
  testabilidad; sanitización de formula injection desde el plan. Ambas en
  `decisions.md`.

**Métricas del paso**
- Inicio: 2026-11-06 22:20:27 UTC · Fin: 2026-11-06 22:25:12 UTC · Duración: ~5 min
- Tokens: input 25,813 · caché leída 3,564,480 · output 17,174 · Costo: n/d (tabla de precios GLM pendiente)
- Intervenciones humanas: 0 (autopilot)

## Tasks

- Resumen del desglose: 6 tareas (T001–T006) en cadena TDD: tests unit del
  generador → implementación `src/csv.js` → tests integration de la ruta →
  implementación `GET /api/movimientos/csv` → botón en la UI → verificación
  manual en navegador+Excel. Cada tarea con done-check literal, dependencias y
  traza a los 5 criterios de aceptación de la spec. Cobertura completa: AC1–AC5.
- Artefactos: tabla anexa al plan (`02-DOCS/wiki/sdd/plans/001-exportar-csv.md` §8)
- Desviaciones / decisiones: riesgo del conjunto evaluado con `rsc risk` sobre
  las 5 rutas esperadas → **tier 1** (1 revisor, sin aprobación humana
  obligatoria). Las tareas viven en el plan (no en un archivo aparte), como
  manda el skill `tasks` del harness: este paso no produce código.

**Métricas del paso**
- Inicio: 2026-11-06 22:26:48 UTC · Fin: 2026-11-06 22:30:17 UTC · Duración: ~3.5 min
- Tokens: input 92,792 · caché leída 1,398,784 · output 6,122 · Costo: n/d (tabla de precios GLM pendiente)
- Intervenciones humanas: 0 (autopilot)

## Desarrollo

- Rama: `feature/001-exportar-csv` · Commits: 7868fe2 (✨ código + tests)
- Tareas ejecutadas (TDD, rojo→verde en cada par):
  - T001+T002: `test/csv.test.js` (6 tests: BOM, CRLF, encabezado exacto,
    RFC 4180, formula injection, vacío, acentos) → `src/csv.js`
    (`generarCsv` puro). Rojo → verde.
  - T003+T004: `test/csv-api.test.js` (3 tests: vacío→solo encabezado, body
    exacto orden fecha DESC/id DESC, bytes EF BB BF) → ruta
    `GET /api/movimientos/csv` en `src/app.js` (attachment
    `movimientos-<YYYYMMDD>.csv`, 500 con `{"errores":[...]}` si falla).
    Rojo → verde.
  - T005: botón «Exportar CSV» en la sección Movimientos
    (`public/index.html`): fetch→blob→`<a download>`, error visible
    (`#error-exportar`) si falla; `<button type="button">` (operable por
    teclado), estilos con variables CSS (modo oscuro intacto).
- Verificado contra la app real (servidor levantado en localhost:3000):
  `curl` confirma el botón en el HTML y la ruta responde 200 con BOM,
  `text/csv; charset=utf-8` y `Content-Disposition` con la fecha del día.
- Suite completa: **16/16 en verde** (`npm test`).
- Decisiones de implementación: (1) `res.text()` de fetch descarta el BOM al
  decodificar (TextDecoder por defecto) — los tests decodifican con
  `ignoreBOM: true` para afirmar el contenido exacto; el BOM sí viaja en los
  bytes (verificado con `arrayBuffer`). (2) El nombre del archivo se toma del
  `Content-Disposition` que envía el servidor, con fallback
  `movimientos.csv`. (3) La sanitización anti-formula-injection vive solo en
  el generador (un lugar, testeable).

**Métricas del paso**
- Inicio: 2026-11-06 22:32:11 UTC · Fin: 2026-11-06 22:39:32 UTC · Duración: ~7 min
- Tokens: input 124,072 · caché leída 3,209,472 · output 19,747 · Costo: n/d (tabla de precios GLM pendiente)
- Intervenciones humanas: 0 (autopilot)

## Revisión de agentes

- Configuración: riesgo **tier 1** → 1 revisor de contexto fresco por ronda
  (subagente sin acceso a la conversación de implementación). Verificación
  independiente de cada blocker/should-fix con el agente finding-verifier
  (parte de «esto es falso»). Consolidación y ledger con
  `rsc review consolidate` / `rsc review ledger`.
- Ronda 1 (estado 0cd6e8f): **CHANGES REQUESTED** — 5 hallazgos (1 blocker,
  1 should-fix, 3 nits).
  - **[blocker, CONFIRMED]** el error de exportación nunca podía verse: la
    clase CSS `.error` fijaba `display:none` y `style.display=''` del catch
    no la vencía → AC5 incumplido (mismo defecto raíz en el `#error` del
    formulario). El finding-verifier lo reprodujo en Edge headless:
    `display-computado=[none] offsetHeight=[0]`. **Fix:** quitar
    `display:none` de la clase y gobernar visibilidad solo con inline.
  - **[should-fix, CONFIRMED]** el guard de formula injection retornaba
    antes del entrecomillado: `=SUM(A1), total` salía sin comillas (6
    columnas). Reproducido en Node: fila parsea a 6 campos. **Fix:** aplicar
    prefijo y luego entrecomillar; test nuevo afirma 5 columnas tras parseo
    RFC 4180.
  - 3 nits (BOM invisible en el fuente, `catch` sin log, fila duplicada en
    este doc): corregidos.
  - Fix del blocker verificado en navegador real pulsando el botón con fetch
    fallido: `display-computado=[block] offsetHeight=[18]`, mensaje visible.
- Ronda 2 (solo la divergencia, estado a3ff919): **APPROVE WITH NITS** —
  1 nit (literal BOM inconsistente en el test), corregido. 0 regresiones
  (el revisor comparó salidas vieja/nueva caso por caso).
- Veredicto final: **APPROVE WITH NITS**, 6/6 hallazgos fixed, 0 abiertos,
  0 refutados. Registro completo: `02-DOCS/wiki/sdd/reviews/001-exportar-csv.md`.
- Lección registrada: la verificación con `curl` no puede evidenciar render
  del navegador — el blocker de UI solo era detectable con un navegador real
  (Edge headless lo reprodujo en minutos). Para la próxima feature con UI:
  verificar el camino de error con navegador headless, no solo con curl.

**Métricas del paso**
- Inicio: 2026-11-06 22:40:53 UTC · Fin: 2026-11-06 23:06:41 UTC · Duración: ~26 min
- Tokens sesión principal: input 126,511 · caché leída 9,393,408 · output 56,007
- Tokens subagentes (4 agentes: revisor r1, 2 finding-verifiers, revisor r2): 134,940
- Costo: n/d (tabla de precios GLM pendiente) · Intervenciones humanas: 0 (autopilot)

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
| Spec | ~2 min | in 28,413 · caché 1,452,480 · out 8,939 | 0 | Gate PASS; 4 puntos tipados |
| Plan | ~5 min | in 25,813 · caché 3,564,480 · out 17,174 | 0 | CSV en servidor; sanitización formula injection |
| Tasks | ~3.5 min | in 92,792 · caché 1,398,784 · out 6,122 | 0 | 6 tareas; riesgo tier 1 (1 revisor) |
| Desarrollo | ~7 min | in 124,072 · caché 3,209,472 · out 19,747 | 0 | TDD rojo→verde; 16/16 verde; verificado en app real |
| Revisión | ~26 min | in 126,511 · caché 9,393,408 · out 56,007 · subagentes 134,940 | 0 | 2 rondas; 6 hallazgos, 6 fixed; APPROVE WITH NITS |
| Verificación | | | | |
| Ship | | | | |
| **Total** | | | | |
