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
