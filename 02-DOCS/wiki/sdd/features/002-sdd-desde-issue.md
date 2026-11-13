# Feature 002 — SDD disparado por GitHub Issue

> Spec: [`../specs/002-sdd-desde-issue.md`](../specs/002-sdd-desde-issue.md) ·
> Rama: `feature/002-sdd-desde-issue` · Modo: **autopilot** (aprobación global
> del dueño, 2026-11-13)

## Registro de ingreso

- **Fecha/hora de entrada**: 2026-11-13 (tarde). La feature ingresa al flujo
  como promoción desde FTD: el trabajo del hook de detección ya estaba hecho
  cuando `rsc risk` marcó tier 2 (toca harness) y exigió spec.
- **Lo pedido**: cambiar el disparador del flujo SDD de "prompt tipeado" a
  "issue de GitHub". Evolución a mitad de ciclo a pedido del dueño: un
  vigilante local detecta issues nuevos y abre solo una ventana de PowerShell
  con Claude Code desarrollándolos en autopilot. El hook de sesión queda como
  fallback.
- **Quién lo pide**: el dueño del proyecto (P1er0uni).
- **Contexto relevante**: piloto para ejercitar el flujo SDD antes de
  escalarlo; esta feature es de **capa proceso** (no toca el producto de
  cuentas personales); `gh` autenticado; issues de prueba #2 (trigger) y #3
  (Primera issue) abiertos al momento del ingreso.

## Spec (`specify`)

- Promoción desde FTD: el doc FTD (`../../ftd/sdd-desde-issue.md`) se convirtió
  en input de la spec; el trabajo hecho (script detector + hook SessionStart,
  probados con 0 y 1 issues) se conservó.
- Revisión mayor a pedido del dueño antes de aprobar: el disparador pasa de
  "oferta al abrir sesión" a "vigilante local + ventana en autopilot". El hook
  pasa a fallback. Registrado en `## Revisions` de la spec y en
  `decisions.md`.
- Opciones descartadas: GitHub Actions en la nube (harness rsc no corre allá,
  costo por token); comando semi-manual (el dueño quiere cero pasos manuales).
- Gate: `rsc spec gate` → **PASS** (5 puntos abiertos, todos tipados).
- **Aprobación**: en autopilot — «implementa la spec 2, no me pida
  autorizaciones» (2026-11-13). No es aprobación ítem por ítem; queda
  registrado así en la spec.

**Métricas del paso** — Inicio ~16:00 / fin ~19:30 (aprox., reconstruido) ·
duración repartida en diálogo con el dueño · tokens: n/d · intervenciones
humanas: ~8 (dos rondas AskUserQuestion, aprobación, revisión de
requerimiento) · artefactos: `specs/002-sdd-desde-issue.md`, `decisions.md`
(2 entradas), `index.md`.

## Plan (`plan`)

- Dos piezas + una convención: **vigilante** (`.claude/issue-watcher.mjs`,
  disparador principal: polling cada 60 s, una ventana por issue, registro de
  vistos persistido antes de lanzar, fail-open) y **hook de sesión**
  (`.claude/issue-trigger.mjs`, fallback ya construido). Convención de
  vinculación: `issue: N` en frontmatter de spec, `Closes #N` en el PR.
- Decisiones técnicas: Node ESM en `.claude/` (código de proceso, no de
  producto); registro de vistos gitignored (estado operativo local);
  `spawn` detached de PowerShell con `-NoExit`; modos `--once` y `--dry-run`
  para verificación; lógica pura separada para testear sin red.
- Riesgos identificados: quoting del prompt en PowerShell (mantener sin
  comillas internas), posible colisión de `rsc sync` con settings.json,
  sesión auto-abierta en worktree (deseado).
- Artefacto: `plans/002-sdd-desde-issue.md` · commit 4cb6d36.

**Métricas del paso** — Inicio ~19:30 / fin ~20:00 (aprox.) · tokens: n/d ·
intervenciones humanas: 0 (autopilot) · artefactos: plan con 7 tasks.

## Tasks (`tasks`)

1. ✅ Tests primero (TDD rojo): `test/issue-watcher.test.js` — funciones puras
   (`computeNewIssues`, `loadSeen`/`saveSeen`), falla sin módulo.
2. ✅ Vigilante (TDD verde): `.claude/issue-watcher.mjs` — polling,
   lanzamiento de ventanas, `--once`/`--dry-run`. `npm test` verde.
3. ✅ Cableado: `npm run watch:issues` en `package.json`; registro de vistos
   en `.gitignore` (commit 3b0d243).
4. ✅ Verificación del disparador: `--once --dry-run` detecta #3 sin abrir
   nada; spawn verificado con ventana de prueba auto-cerrada (pid 12928).
5. ✅ Cierre del issue #2 (prueba del trigger) con comentario; #3 queda
   abierto como candidato de la prueba en vivo.
6. ✅ Panel de revisión tier 2 (ver sección Revisión).
7. ✅ Ship: commits por paso, push, PR con cuerpo spec-linked (ver Ship).

## Desarrollo (`implement`)

- TDD rojo→verde: primero los tests de las funciones puras, luego el módulo.
- El vigilante se construyó con las funciones puras exportadas y el loop
  protegido por guard de script-directo (importar desde tests no dispara el
  polling).
- Verificación del mecanismo de ventana: spawn detached de PowerShell probado
  con una ventana de prueba que se auto-cerró (pid 12928); dry-run corrido
  dos veces contra los issues reales (#2, #3) sin marcar vistos.
- Prueba de resiliencia: `gh` caído simulado en tests (runner inyectable
  devuelve null) — el ciclo anota y reintenta sin morir.

**Métricas del paso** — Inicio ~20:00 / fin ~23:00 (aprox., con cortes del
clasificador que bloquearon Write/Bash repetidamente) · tokens: n/d ·
intervenciones humanas: 0 (autopilot; el dueño ya había dado la autorización
global) · artefactos: `.claude/issue-watcher.mjs`, `test/issue-watcher.test.js`,
`package.json` (script `watch:issues`).

## Revisión de agentes (`review`)

Panel tier 2 (3 refuters con mandatos disjuntos, contexto fresco, ciegos
primero): refuter-correctness, refuter-security, refuter-tests →
consolidación → finding-verifier adversarial por hallazgo.

| # | Hallazgo | Severidad | Veredicto del verificador |
|---|----------|-----------|---------------------------|
| A | Título de issue llega verbatim al contexto del agente (repo público → prompt injection) | should-fix | **CONFIRMED** |
| B | `spawn` sin listener de `error`: un fallo de lanzamiento mata el vigilante | blocker (elevado por el verificador; reproducido) | **CONFIRMED** |
| C | Suite cubre solo funciones puras: 5 mutantes sobreviven, 5/7 ACs sin test | should-fix | **CONFIRMED** |
| D | `PROJ_DIR` sin escapar comillas simples en el comando PowerShell | nit | (aplicado de paso) |
| E | `n` sin validar como entero en `launchWindow` | nit | (aplicado de paso) |

**Fixes aplicados en una pasada**: sanitización del título (`safeTitle` +
aviso anti-inyección en el bloque del hook), `child.on("error")` en
`launchWindow`, refactor de exportación (`cycle`/`listOpenIssues`/`buildPrompt`
con dependencias inyectables; `buildTriggerOutput`/`safeTitle` en el trigger) +
13 tests nuevos que pinan los invariantes (AC1–AC6), escape de comillas y
guard de entero. `npm test`: **45/45 en verde**. Dry-run re-verificado tras el
refactor: detecta #3, no marca vistos.

**Métricas del paso** — 3 refuters + 3 finding-verifiers · tokens: n/d ·
hallazgos consolidados: 5 (1 blocker, 2 should-fix, 2 nit) · todos los
veredictos: CONFIRMED · fixes: 5/5 aplicados.

## Verificación (`verify`)

- `npm test`: 45/45 pasando (5 archivos: suite del vigilante extendida de 7 a
  25 tests + suites del producto intactas).
- Dry-run del vigilante tras los fixes: `[...] DRY-RUN: abriría ventana para
  #3 Primera issue — https://github.com/P1er0uni/cuentas-personales/issues/3`
  — sin marcar vistos, sin abrir ventanas.
- Cobertura de ACs por test: AC1 (una ventana por issue) y AC2 (no
  duplicados) por `cycle` con dependencias inyectables; AC3 (oferta del hook)
  por `buildTriggerOutput`; AC4 (0 issues = arranque idéntico) por silencio
  (`null`); AC5 (fail-open) por `listOpenIssues` con runner caído + ciclo con
  `null`; AC6 (vinculación) por `buildPrompt` (`issue: N`, `Closes #N`).
  AC7 (GitHub cierra el issue al mergear el PR) es comportamiento de la
  plataforma: se observa en la prueba en vivo.
- Prueba en vivo pendiente: la hace el dueño con `npm run watch:issues` y el
  issue #3 ya abierto (ver Ship).

## Ship (`ship`)

- Commits por paso en `feature/002-sdd-desde-issue`: e73e7b1 (registro +
  spec), 4cb6d36 (plan), 3b0d243 (chore rsc 4.1.5), ef3104a (implementación
  + fixes del panel), 5ba0753 (docs del ciclo).
- Ledger del panel registrado: round 1, 5 hallazgos (L7–L11), 5 outcomes
  `fixed`, panel de 3 (correctness, security, tests) sobre 5ba0753.
- Push y PR: **https://github.com/P1er0uni/cuentas-personales/pull/4**
  (cuerpo con Qué/Por qué/Cómo se probó/Riesgo/Cómo revertir, `Closes #3`).
- **Merge humano pendiente** — tier 2: el agente nunca lo firma. Al mergear,
  GitHub cierra el issue #3 automáticamente (AC7).

**Métricas del paso** — tokens: n/d · intervenciones humanas: 0 (autopilot;
el merge es la única intervención, y es del dueño por regla) · artefactos:
PR #4, ledger local con panel registrado.

## Métricas

- **Totales del ciclo** (inicio ~16:00, cierre ~23:30, con cortes largos del
  clasificador del harness de permisos que bloquearon Write/Bash de forma
  intermitente): tokens n/d en todos los pasos (tabla de precios GLM
  pendiente, igual que en 001) · intervenciones humanas: ~8, todas en la
  primera mitad (rondas de clarify, cambio de requerimiento, aprobación
  autopilot); 0 desde la aprobación hasta el PR.
- Revisión: 3 refuters + 3 finding-verifiers · 5 hallazgos, 5 CONFIRMED,
  5 fixed · 0 falsos positivos.
- Tests: 25 del vigilante (7 puras + 13 integración + 5 sanitización) ·
  suite total 45/45.
- Prueba en vivo pendiente (la hace el dueño): `npm run watch:issues` con el
  issue #3 abierto → ventana automática con Claude Code en autopilot.
