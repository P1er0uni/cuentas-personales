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

## T002 — ronda 2 (fixes) — 2026-11-17
- Fix integrado: **6136262** — normalización de email (trim+lowercase) en las
  tres funciones; `registrarFallo` no-op durante bloqueo activo;
  `decidirBloqueo` elimina entry al expirar (ciclo fresco de 5); cota
  `MAX_REGISTRO = 1000` con barrido de expiradas + evicción de la más
  antigua. 7 tests nuevos (4 de comportamiento en RED primero; 3 guard
  tests anti-mutante). Auth 13/13.
- Nota: el developer registró también la decisión en decisions.md desde su
  worktree; se descartó ese commit (28a39f6) porque la entrada ya existía en
  el árbol principal — sin duplicar el log.

## T003 — ronda 2 (fixes) — 2026-11-17
- Fix integrado: **3a708aa** — pins anti-mutante (50 ids únicos con formato
  UUID v4; destruir multi-sesión con B sobreviviendo; Path=/ asentado;
  contador de siguiente = 1) y parseo de cookie tolerante a espacios (RED →
  fix → GREEN). Session 12/12.

## Estado de suite tras ronda 2 — 2026-11-17
- `npm test`: **76/76 verde, 8 archivos** (51 base + 13 auth + 12 session).
- Ronda 2 de revisión abierta para T002 y T003 (solo diff nuevo).

## T003 — cierre ronda 2 — 2026-11-17
- status: **complete**
- Panel de ronda 2 (solo diff nuevo 3a708aa): security **PASS** (7 vectores)
  · correctness **PASS** (8 ataques) · tests **PASS** (5 mutantes de ronda 1
  muertos + mutantes nuevos del fix muertos). Cero hallazgos en los tres
  lentes. Panel registrado en 65b048b.
- Controls: tests ✅ 12/12 session, suite 76/76 · build ✅ · security ✅
  (lente del panel) · traceability ✅ (AC6/AC9: store probado; endpoints en
  T004/T005).

## T002 — ronda 2 de revisión (parcial) — 2026-11-17
- correctness y security convergen en **1 should-fix**: `mantenerCota`
  evicta la entry más antigua sin verificar bloqueo activo — un atacante
  bloqueado puede des-bloquearse llenando el Map con ~1000 emails
  desechables (bypass introducido por el propio fix de la cota). Pendiente:
  lente tests de ronda 2; luego consolidate + verify + fix en ronda 3.

## T002 — cierre ronda 2 — 2026-11-17
- Panel completo: security 1 should-fix · correctness 1 should-fix (mismo
  defecto, convergido) · tests 2 should-fix (pins faltantes).
- Consolidate: 3 únicos (L16–L18; L17 marcado repeat de L10 por el ledger).
  Verificación adversarial: **3 CONFIRMED** — y F3 (evicción) **escalado a
  blocker**: el verificador reprodujo el ataque paso a paso y el test F3
  del fix anterior asertaba el comportamiento buggy en vez de capturarlo.
  Violación directa de AC10.
- Aviso del ledger: posible gap de evidencia en AC10 (objeciones distintas
  del lente tests en rondas 1 y 2). No se debilita el criterio; la prueba
  conductual del bloqueo vive en T011 (en vivo). Anotado.
- Fix de ronda 3 (ÚLTIMA del presupuesto) despachado: guard de evicción
  (víctima = más antigua NO bloqueada; si todas bloqueadas, el Map crece),
  test F3 corregido (base SIGUE bloqueada tras llenar el Map), pin del guard
  de registrarFallo con entry expirada presente, pin del barrido con
  expirada reclamada antes que una viva.

## T002 — ronda 3 (fix del BLOCKER) — 2026-11-17
- Fix integrado: **3ae68df** — evicción respeta bloqueo activo (víctima =
  más antigua NO bloqueada; todas bloqueadas → el Map crece, nunca se
  des-bloquea a un atacante); test F3 corregido (asienta que base SIGUE
  bloqueada — antes asertaba el bug); pins F1 (guard con entry expirada
  presente) y F2 (barrido con DOS expiradas para observabilidad). El
  implementador verificó los mutantes ejecutándolos y revirtiéndolos.
- RED honesto: test F3 corregido falló contra el código buggy
  (`expected null not to be null`). Auth 15/15; suite completa **78/78**.
- Decisión registrada por el implementador en decisions.md («Evicción
  respeta el bloqueo activo»), integrada con el cherry-pick.
- Panel de ronda 3 (final) despachado sobre el diff nuevo. Si no converge:
  T002 se aparca en la cola de decisiones (regla del presupuesto de 3).

## T002 — cierre ronda 3 — 2026-11-17
- Panel: security PASS + 1 question (saturación) · correctness **1 BLOCKER**
  (mismo escenario, trazado línea a línea) · tests PASS + 2 nits + 2
  questions (límites exactos y orden sin pin — repetidos o menores).
- Consolidate: 4 únicos; el BLOCKER verificado → **CONFIRMED con
  reproducción** (script externo: con 999 señuelos bloqueados, 10 fallos
  sobre un email nuevo no bloquean; baseline en Map vacío: 5 fallos
  bloquean). El trade-off documentado en decisions.md era inalcanzable
  (falso). Registrado como L19.

## Decision queue — 003-login-usuarios

### D1 — T002 ronda 4 (blocker de saturación) — CERRADA por el dueño
- **Kind**: blocking · **Task**: T002 · **Tier**: 2.
- **Pregunta**: el fix de ronda 3 cerró el bypass de des-bloqueo pero abrió
  el inverso (fallos de emails nuevos se pierden bajo saturación; AC10
  desactivada para ellos). Presupuesto de 3 rondas agotado. ¿Fix extra,
  aparcar, o aceptar residual?
- **Opciones**: fix ahora (una línea: la evicción salta la clave recién
  insertada) / aparcar T002 y seguir con T04 / aceptar como riesgo residual
  (question según el lente security: setup ~5000 peticiones, ventana 15 min).
- **Recomendación**: fix ahora.
- **Decisión del dueño (2026-11-17)**: **«arréglalo, manteniendo los
  estándares de desarrollo que estábamos usando»** — ronda 4 autorizada
  con TDD completo y revisión. Entrada cerrada por el humano.
- **Evidencia**: reproducción del verificador (transcripción de la sesión);
  hallazgo L19 en el ledger de revisión.
