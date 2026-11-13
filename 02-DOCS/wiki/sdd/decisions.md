# Decisiones SDD — log (append-only)

Toda decisión significativa: fecha, opciones consideradas, elección y por qué.

| Fecha | Decisión | Opciones consideradas | Elección | Por qué |
|---|---|---|---|---|
| 2026-11-06 | Herramienta SDD del piloto | Spec Kit / OpenSpec / SDD Method / cc-sdd / RSC Harness | **RSC Harness** (`@ericrisco/rsc`) | Es la que ya se usó en piloto-rsc; specs numeradas spec/plan/tasks con EARS |
| 2026-11-06 | Alcance del mini-proyecto | registro+resumen / +presupuestos / +cuentas múltiples | **Registro + resumen** | Piloto pequeño pero con sustancia |
| 2026-11-06 | Interfaz y persistencia | CLI / API / Web app; JSON / SQLite / memoria | **Web app + SQLite** | Pedido del dueño; realismo sin exceso |
| 2026-11-06 | Workflow de código | main directo / ramas+PR | **Ramas + PR** | Igual que piloto-rsc; main cerrada |
| 2026-11-06 | Merge gate | siempre humano / auto-merge | **Auto-merge si verify pasa** y sin hallazgos bloqueantes | Menos fricción; verify es la puerta |
| 2026-11-06 | Barra de calidad | tests / tests+linter | **Tests Vitest en verde** | Suficiente para el piloto; linter sería enmienda |
| 2026-11-06 | Reglas de documentación | — | **Aprobadas** (`REGLAS-DOCUMENTACION.md`): un doc por feature, cierre de paso documentado y commiteado, métricas de tiempos/tokens/costo por paso (el agente los obtiene de las transcripciones) | Trazabilidad del método antes de escalar |
| 2026-11-06 | Feature 001 | presupuestos / filtro por mes / edición / exportar CSV | **Exportar a CSV** | Primer ciclo SDD corto y medible |
| 2026-11-06 | Dónde se genera el CSV (001) | en el navegador con el JSON / en el servidor con ruta nueva | **En el servidor** (`GET /api/movimientos/csv` + generador puro) | Un solo generador testeable (unit + integration); el navegador solo descarga |
| 2026-11-06 | Formula injection en CSV (001) | ignorar / sanitizar | **Sanitizar**: prefijar `'` en celdas que empiezan con `= + - @` | Práctica estándar; evita que Excel ejecute fórmulas desde datos del usuario |

## 2026-11-13 — Feature 002: el disparador del SDD pasa a ser un issue de GitHub

- **Decisión**: el flujo SDD se dispara desde issues de GitHub (issue plano, sin
  etiquetas), detectados al abrir sesión con una oferta no bloqueante de una
  línea. Sin automatismo programado (decisión del dueño). Promoción desde FTD:
  `rsc risk` tier 2 por tocar `.claude/` (harness) exige spec aprobada.
- **Opciones consideradas**: (a) prompt tipeado como hasta hoy — no deja
  artefacto durable; (b) issue con etiqueta `sdd` — filtrado innecesario para un
  repo personal; (c) polling programado — más costo en tokens y menos control
  humano, descartado por el dueño.
- **Por qué**: el issue versiona la idea, la desacopla del momento de
  desarrollo y se vincula de punta a punta (spec `issue: N`, PR `Closes #N`).
