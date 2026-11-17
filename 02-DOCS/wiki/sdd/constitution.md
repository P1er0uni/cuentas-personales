---
type: constitution
title: Piloto SDD — Constitution
description: Non-negotiables ratified by the project owner; every SDD phase obeys them.
tags: [sdd, constitution]
timestamp: 2026-11-06T22:00:50Z
topic: sdd
status: ratified
version: v1.1.0
ratified: 2026-11-06
amended: 2026-11-17
---

# Piloto SDD — Constitution

> Ratificada por el dueño del proyecto el 2026-11-06 (v1.0.0); enmendada el
> 2026-11-17 (v1.1.0). Toda fase SDD
> (specify, plan, tasks, implement, review, verify, ship) la obedece; `verify`
> corre contra el Definition of Done de abajo.

## Known facts (from onboarding)

- Goal: Segundo piloto: web app de cuentas personales para correr features reales por el flujo SDD completo del harness RSC y afinar las reglas de documentacion del proceso antes de escalarlo
- Project kind: software · software scope: small
- How code changes land: branches closed with a pull request; the default branch is closed to direct work (`--workflow branches`).
- Stack evidence: node (package.json), Express 5 + better-sqlite3 + Vitest.
  > Corrección (2026-11-17, v1.1.0): el stack migró a Supabase (PostgreSQL) el
  > 2026-11-16; el stack vigente es el del principio 1.

## 1. Stack canon

1. ~~**El stack es fijo**: Node.js ESM (≥ 18), Express 5, better-sqlite3 (SQLite
   en `data/`, gitignored), Vitest, frontend estático en `public/` sin paso de
   build, npm como gestor.~~ Superado en v1.1.0 (migración a Supabase,
   2026-11-16).
   **El stack es fijo**: Node.js ESM (≥ 18), Express 5, Supabase (PostgreSQL)
   vía `@supabase/supabase-js` — esquema en el proyecto Supabase
   `getjrfqsirqflixdkdvl`, migraciones vía MCP —, Vitest, frontend estático en
   `public/` sin paso de build, npm como gestor. El servidor es el único
   cliente de la base. Cambiar algo de esta lista es una enmienda a esta
   sección, no un commit cualquiera.

## 2. Quality bar

2. **`npm test` en verde es la puerta de merge.** Toda feature agrega tests
   Vitest para lo que introduce; un cambio sin tests nuevos no mergea. No hay
   linter en el piloto (decisión 2026-11-06); añadirlo sería una enmienda.

## 3. Conventions

3. **Estructura**: código en `src/`, tests en `test/` (un `*.test.js` por
   módulo). `src/app.js` exporta la app Express; `src/server.js` solo la
   levanta. Los errores de API son JSON con forma `{"errores": [...]}` (o
   `{"error": "..."}` para 404).
4. **Commits con gitmoji** (guard del harness armado), mensajes en español.

## 4. Branching & shipping

5. **`main` está cerrada.** Toda feature nace en `feature/NNN-<slug>` y se
   cierra con PR. **Auto-merge permitido** solo si `verify` pasa en verde y la
   revisión de agentes no tiene hallazgos bloqueantes (decisión del dueño,
   2026-11-06).
6. **La autoría git es humana.** Commits y PRs los firma el git user
   configurado; sin `Co-Authored-By` de IA ni pies «generated with».

## 5. Security & privacy floor

7. ~~**Ningún secreto se commitea** (`.env` está gitignored; credenciales jamás
   en código). **Los datos personales no salen del equipo**: la base SQLite
   (`data/`) nunca se commitea ni se sube.~~ Superado en v1.1.0 (los datos
   viven en la nube desde la migración).
   **Ningún secreto se commitea** (`.env` está gitignored; la service role key
   vive solo en el servidor, nunca en el navegador ni en el repo). **Los datos
   viven en Supabase (nube)**: toda tabla con datos personales lleva RLS
   activado y el acceso a la base pasa únicamente por el servidor. Nada de
   datos personales en el repo.

## 6. UX / accessibility floor

8. **La UI es operable por teclado** (formularios nativos con labels
   visibles), soporta modo oscuro y no introduce dependencias de build.

## 7. Performance budgets

9. ~~**Sin N+1 ni trabajo bloqueante en endpoints**: las consultas SQLite van
   por PK/índice y preparadas.~~ Wording corregido en v1.1.0 (sin SQLite desde
   la migración).
   **Sin N+1 ni trabajo bloqueante en endpoints**: las consultas a la base van
   por PK/índice. No hay presupuesto numérico en el piloto; añadir uno es una
   enmienda.

## 8. Knowledge & decisions

10. **Toda decisión significativa se registra** en `02-DOCS/wiki/sdd/decisions.md`
    con fecha, opciones consideradas y por qué.
11. **El proceso se documenta según `02-DOCS/wiki/sdd/REGLAS-DOCUMENTACION.md`**:
    un documento por feature; cada paso del workflow se documenta y commitea
    antes de avanzar al siguiente; tiempos, tokens y costo por paso.

## Definition of Done (the merge bar `verify` runs against)

- [ ] `npm test` en verde, con tests nuevos de la feature
- [ ] Documento de la feature actualizado: paso cerrado + métricas, y commiteado
- [ ] Revisión de agentes sin hallazgos bloqueantes (o resueltos)
- [ ] PR desde `feature/NNN-<slug>` (main cerrada)
- [ ] El diff no contiene secretos ni claves
- [ ] Decisiones significativas registradas en `decisions.md`

## Amendment log (append-only)

| Date | Version | Change | Why |
|------|---------|--------|-----|
| 2026-11-06 | draft | Draft generated by `rsc onboard`. | The SDD floor needs a constitution; ratification is the `constitution` phase's. |
| 2026-11-06 | draft | Secciones completadas con la entrevista (auto-merge, tests como barra). | Fase `constitution` del piloto. |
| 2026-11-06 | v1.0.0 | Ratificada por el dueño del proyecto: 11 principios + DoD. | Aprobación explícita tras mostrar el borrador completo. |
| 2026-11-17 | v1.1.0 | P1: stack swap better-sqlite3 → Supabase (PostgreSQL) tras la migración del 2026-11-16. P7: privacidad reescrita — datos en la nube de Supabase con RLS, service key solo en el servidor. P9 + DoD: referencias a SQLite/`data/` retiradas. P5 ratificada sin cambios: main se re-cierra; el unlock del 2026-11-16 queda como excepción registrada. | Alineación con la realidad del repo tras la migración; divergencia P5 resuelta por el dueño (re-cerrar); postura de privacidad decidida por el dueño (aceptar nube con RLS). |
