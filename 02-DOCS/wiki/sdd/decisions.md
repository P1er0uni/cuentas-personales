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

## 2026-11-13 — Feature 002 (revisión): vigilante local + autopilot

- **Decisión**: el disparador evoluciona a pedido del dueño — un vigilante
  local detecta issues nuevos (polling ≤ 2 min) y abre solo una ventana de
  PowerShell con Claude Code corriendo la cadena SDD en autopilot. El hook de
  detección al abrir sesión pasa a ser fallback. El auto-merge queda fuera:
  el PR espera al humano (tier 2).
- **Opciones consideradas**: (a) GitHub Actions en la nube — descartado: el
  harness rsc no corre allá y el costo por token no usa la suscripción;
  (b) comando semi-manual — descartado: el dueño quiere cero pasos manuales
  tras crear el issue.
- **Por qué**: crear el issue debe ser el único paso manual del dueño.

## 2026-11-16 — CLAUDE.md: métricas por paso y trazabilidad prompt → spec → plan

- **Decisión**: la sección «Convenciones» de CLAUDE.md (lo que el agente carga
  en cada sesión) pasa a exigir lo que REGLAS-DOCUMENTACION.md ya mandataba:
  bloque de métricas por paso (inicio/fin, duración, tokens, intervenciones)
  y registro del prompt inicial con la spec y el plan que produjo. Se corrige
  de paso la ruta de las specs (`specs/` → `02-DOCS/wiki/sdd/specs/`; la
  carpeta raíz nunca existió en este repo).
- **Excepción al gate, autorizada por el dueño**: `rsc risk` marcó tier 2
  (CLAUDE.md = capa harness), lo que exige rama + spec gate + panel de 3.
  El dueño eligió desbloquear main (`rsc main unlock`) y hacer el cambio
  directo, sin PR ni panel. Queda registrado aquí como decisión consciente,
  no como omisión.
- **Opciones consideradas**: (a) rama feature/003 + spec + gate + panel —
  ceremonia completa para una edición de documentación; (b) desbloquear main
  y editar directo — elegida por el dueño.
- **Por qué**: cambio de solo documentación, revisable a ojo en el diff;
  la fricción del tier 2 no compra protección adicional aquí (P7).

## 2026-11-17 — Enmienda v1.1.0 de la constitución: alineación tras la migración a Supabase

- **Decisión**: el dueño revisa la constitución y la enmienda (v1.0.0 →
  v1.1.0): P1 stack swap better-sqlite3 → Supabase (PostgreSQL); P7
  privacidad reescrita — los datos viven en la nube de Supabase con RLS
  activado y la service key solo en el servidor; P9 y DoD sin referencias a
  SQLite/`data/`. P5 ratificada sin cambios: **main se re-cierra** — el unlock
  del 2026-11-16 queda como excepción registrada, no como estado permanente.
  Auth pasa a camino always-human en REVIEW.md, con `src/db.js` elevado en
  `.rsc/sello-config.json` → `risk.raise` (los archivos `auth|login|session`
  ya eran tier 2 en la tabla por defecto de `rsc risk`).
- **Opciones consideradas**: P5 — re-cerrar (elegida) vs enmendar a abierta;
  P7 — aceptar nube con RLS (elegida) vs exigir datos solo locales (implicaba
  revertir la migración); always-human auth — agregar ya antes del login
  (elegida) vs esperar a que aterrice la feature.
- **Por qué**: la constitución citaba un stack que ya no existe y una postura
  de privacidad que la migración misma había violado; un documento de
  non-negotiables que miente no protege nada. El re-cierre de main restaura el
  flujo branch→PR→ship que el piloto debe medir.
