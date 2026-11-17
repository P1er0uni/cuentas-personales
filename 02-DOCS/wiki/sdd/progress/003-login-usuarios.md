# Progress — 003-login-usuarios

> Ledger append-only del ciclo `implement`. Fuente de verdad para reanudar:
> una tarea con `status: complete` aquí está HECHA — nunca re-despachar.

## Pre-ciclo — 2026-11-17

- sdd-init ejecutado dentro del gate de `implement` (config.yaml faltante):
  `02-DOCS/wiki/sdd/config.yaml` escrito (stack node/express/supabase, npm,
  Vitest, strict_tdd: true, interactive) y registro refrescado (273 skills).
- Decisión de git (dueño): el trabajo pendiente de main viaja como **commit
  separado rotulado** en `feature/003-login-usuarios`; sin unlock.
- Pendiente de ejecutar cuando el clasificador de permisos responda:
  `git switch -c feature/003-login-usuarios` + 3 commits (trabajo previo de
  main / gobernanza v1.1.0 / artefactos de la feature).

## T001 — 2026-11-17
- status: in_progress
- tarea: migración MCP — `movimientos.user_id` (uuid, nullable, FK
  `auth.users`, ON DELETE CASCADE) + 4 políticas RLS (`auth.uid() = user_id`)
  + índice `movimientos_user_id_idx`.
- bloqueo transitorio: clasificador de permisos caído; la llamada
  `apply_migration` está lista para reintentar.

## T001 — cierre ronda 1 — 2026-11-17
- status: complete
- done: migración aplicada; `pg_policies` verificó las 4 políticas con
  predicados EXACTOS `(auth.uid() = user_id)`; anónimo ve 0 filas (smoke de
  RLS); columna + FK visibles en `list_tables`.
- risk: tier 2 (migración/RLS de datos personales) — panel de 3.
- review ronda 1/3: correctness **PASS** (13 ataques a ciegas) · security
  **PASS** (16 vectores) · tests **3 hallazgos** (1 should-fix + 2
  questions, todos contra el texto del done-check). Consolidate: 3 únicos;
  F1 verificado por finding-verifier → **CONFIRMED**. Fix de clase: done-check
  de T001 enmendado en el plan (pg_policies con predicado exacto + «anónimo
  ve 0» marcado como smoke + nota de traza contribuye/prueba). L1/L2/L3
  `fixed` en ledger; panel registrado en bc9df73.
- controls: tests ✅ 66/66 (tras integrar T002/T003) · build ✅ (sin paso de
  build; la suite carga todos los módulos) · security ✅ (lente security del
  panel; `.env` verificado gitignored y jamás commiteado) · traceability ✅
  (AC2/AC4/AC5, con nota contribuye/prueba).

## T002 — 2026-11-17
- status: built (review pendiente)
- red: `test/auth.test.js` 2 failed | 4 passed (stub primero; fallo en
  aserción, no en import).
- green: 6/6 (5 fallos → 15 min; ventana a 1 min → minutosRestantes 1;
  reiniciar a cero; expirada → null; antes de 5 → null; por email aislado).
- files: `src/auth.js`, `test/auth.test.js` · commit 0d2b57d (worktree) →
  cherry-pick **bc9df73** en feature/003-login-usuarios.
- risk: tier 2 (clase auth) — panel pendiente.

## T003 — 2026-11-17
- status: built (review pendiente)
- red: `test/session.test.js` 6 failed | 3 passed (stub) → green 9/9.
- files: `src/session.js`, `test/session.test.js` · commit d4db94a
  (worktree) → cherry-pick **12ad95a**.
- contrato: crear/leer/destruir/destruirTodasDe/requireSesion/
  cookieDeRespuesta; cookie `sid` HttpOnly SameSite=Lax; sin dependencias
  nuevas (randomUUID + parseo manual de Cookie).
- risk: tier 2 (clase session) — panel pendiente.

## Infra del ciclo — 2026-11-17
- `vitest.config.js` nuevo: excluye `.claude/worktrees/**` del
  descubrimiento de tests (los worktrees de agentes paralelos no tienen
  `.env` y contaminaban la barra P2). Suite combinada tras integrar
  T002+T003: **66/66 verde, 8 archivos**.

## T002 — ronda 1 de revisión — 2026-11-17
- Panel de 3: correctness PASS + 1 question · security 3 hallazgos (2
  should-fix + 1 question) · tests 3 hallazgos (2 should-fix + 1 nit).
- Consolidate: 6 únicos; los 4 should-fix verificados por finding-verifier →
  **4 CONFIRMED** (normalización de email, mutante ceil/round, Map sin cota,
  mutante delete/clear). Registrados en ledger como L4–L10.
- Fix de ronda 2 despachado (worktree): normalizar key, cota con barrido de
  expiradas + evicción de la más antigua, semántica de ciclo de vida
  (fallo en bloqueo activo no extiende; expirada la ventana, ciclo fresco de
  5), y 6+ tests nuevos que matan los mutantes.

## T003 — ronda 1 de revisión — 2026-11-17
- Panel de 3: security PASS (14 vectores) · tests 4 hallazgos (2 should-fix
  + 2 nits) · correctness PASS + 1 nit.
- Consolidate: 5 únicos; los 2 should-fix verificados → **2 CONFIRMED**
  (id no adivinable sin falsificar; destruir sin multi-sesión). Producción
  correcta en ambos — son gaps de tests. Registrados como L11–L15.
- Fix de ronda 2 despachado (worktree): pins anti-mutante (UUID v4 regex +
  unicidad, destruir multi-sesión, Path=/, contador de siguiente) y trim
  individual de clave/valor en parsearCookie (único cambio de producción).
