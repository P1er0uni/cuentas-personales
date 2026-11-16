---
type: worklog
title: Feature 002 «SDD disparado por GitHub Issue» — vigilante local + autopilot
description: Segundo ciclo ASDD del piloto: promoción desde FTD por tier 2, revisión de requerimiento a mitad de ciclo, panel de 3 refuters, fixes verificados y ship por PR.
timestamp: 2026-11-13T23:30:00Z
topic: sdd
status: unprocessed
sources: []
---

## What we did

- Feature 002 «SDD disparado por GitHub Issue» en la rama `feature/002-sdd-desde-issue`: cambiar el disparador del flujo SDD de "prompt tipeado" a "issue de GitHub", con vigilante local que abre solo una ventana de PowerShell con Claude Code en autopilot.
- Promoción desde FTD: el hook de detección ya estaba construido cuando `rsc risk` marcó **tier 2** (toca harness) y exigió spec; el trabajo hecho se conservó como pieza de fallback.
- Revisión de requerimiento a mitad de ciclo a pedido del dueño: de "oferta al abrir sesión" a "vigilante + ventana automática". Registrado en `## Revisions` de la spec y en `decisions.md` (2 entradas).
- Piezas: `.claude/issue-watcher.mjs` (vigilante: polling 60 s, una ventana por issue, registro de vistos persistido antes de lanzar, fail-open, `--once`/`--dry-run`) y `.claude/issue-trigger.mjs` (hook SessionStart fallback, títulos saneados).
- Panel tier 2: 3 refuters (correctness, security, tests) → 5 hallazgos consolidados → 3 finding-verifiers, todos **CONFIRMED**: A inyección por título (repo público), B crash del vigilante por spawn sin listener (elevado a blocker, reproducido), C 5 mutantes sobreviven / 5 de 7 ACs sin test. Fixes aplicados en una pasada junto con 2 nits (quoting, guard de entero).
- Tests: suite del vigilante de 7 a 25 tests (integración con dependencias inyectables que pinan AC1–AC6); suite total 45/45 en verde.

## Why

- El piloto ejercita el flujo SDD antes de escalarlo; esta feature probó el camino de **promoción FTD→ASDD por tier 2** y el de **cambio de requerimiento a mitad de ciclo** (la spec se revisó en lugar de reiniciar el ciclo).
- El dueño quiere cero pasos manuales: crear un issue en GitHub es todo lo que se hace; el desarrollo arranca solo.
- Lección durable: los títulos de issues en un repo público son texto no confiable de terceros — todo lo que cruce hacia el contexto de un agente se sanitiza y se marca como dato, no instrucción.

## Files touched

- `.claude/issue-watcher.mjs` — vigilante (exporta `computeNewIssues`, `loadSeen`, `saveSeen`, `listOpenIssues(run)`, `buildPrompt(n)`, `cycle(dryRun, deps)` con dependencias inyectables)
- `.claude/issue-trigger.mjs` — hook SessionStart (exporta `safeTitle`, `buildTriggerOutput`; guard de script-directo para importar desde tests)
- `.claude/settings.json` — entrada aditiva de SessionStart (hooks de rsc intactos)
- `test/issue-watcher.test.js` — 25 tests (7 originales + 13 integración + 5 sanitización/trigger)
- `package.json` — script `watch:issues`
- `.gitignore` — registro de vistos `.claude/.issue-watcher-seen.json`
- `02-DOCS/wiki/sdd/specs/002-sdd-desde-issue.md` (con `## Revisions`), `plans/002-sdd-desde-issue.md`, `features/002-sdd-desde-issue.md`, `decisions.md`, `index.md`, `ftd/sdd-desde-issue.md`

## Outcome

- **Shipped & verified** (pendiente el merge humano del PR — tier 2 exige aprobación del dueño): `npm test` 45/45; dry-run detecta #3 sin marcar vistos; spawn de ventana verificado (pid 12928 en prueba auto-cerrada); panel con 5/5 hallazgos cerrados como fixed.
- Prueba en vivo pendiente por el dueño: `npm run watch:issues` con el issue #3 abierto → ventana automática.

## Open questions / next

- Merge del PR por el dueño (tier 2: nunca lo firma el agente).
- Prueba en vivo del vigilante con el issue #3 (queda abierto a propósito).
- Tokens/costos por paso siguen «n/d» (tabla de precios GLM pendiente, igual que en 001).
- Compile de este worklog a `wiki/` (Worklog Sweep).

## Commands

- `npm test` — 45/45 passed (5 files)
- `node .claude/issue-watcher.mjs --once --dry-run` — `DRY-RUN: abriría ventana para #3 Primera issue`
- `npx @ericrisco/rsc spec gate` — PASS (5 puntos abiertos, tipados)
- `npx @ericrisco/rsc risk` — tier 2 (toca harness): spec + panel de 3 + merge humano
- `npx @ericrisco/rsc review ledger` — round/record/outcome/panel para `002-sdd-desde-issue/implement`
