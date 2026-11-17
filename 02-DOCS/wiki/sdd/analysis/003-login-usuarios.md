---
type: analysis
title: Análisis de consistencia — Login de usuarios (003)
description: Cruce constitución v1.1.0 ↔ spec 003 ↔ plan 003 (con tasks) antes de implement; hallazgos clasificados y ruteo.
tags: [sdd, analysis]
timestamp: 2026-11-17T16:05:00Z
topic: sdd
slug: 003-login-usuarios
---

# Análisis de consistencia — Login de usuarios (003)

> Artefactos cruzados: [constitución v1.1.0](../constitution.md) ·
> [spec](../specs/003-login-usuarios.md) · [plan con tasks](../plans/003-login-usuarios.md)
> Corrida: 2026-11-17 · Modo: paso a paso

## Veredicto

**GATE: PASS** — 0 CRITICAL, 0 HIGH, 5 MEDIUM, 3 LOW.
La cadena es implementable tal como está; los MEDIUM son huecos de done-check
y una limitación no registrada en la spec — se resuelven en una pasada de
`tasks`/`clarify` o se aceptan a conciencia.

## Mapa de cobertura

| REQ | Requisito (spec) | Plan | Task(s) | Estado |
| --- | --- | --- | --- | --- |
| AC1 | Registro → sesión iniciada | §3 auth.registrar | T004, T009 | covered |
| AC2 | Primera cuenta hereda fila huérfana | §4 claim | T001, T008 | covered |
| AC3 | Movimiento asociado a la cuenta | §3 db scoped | T005 | covered |
| AC4 | Aislamiento entre dos usuarios | §2 RLS + §5 | T001, T005, T011 | covered |
| AC5 | Saldo/resumen/CSV solo suyos | §3 db | T005 | covered |
| AC6 | 401 sin sesión | §3 requireSesion | T003, T005, T010 | covered |
| AC7 | Credenciales incorrectas genéricas | §3 auth.login | T004 | covered |
| AC8 | Email duplicado → error claro | §3 auth.registrar | T004 | covered |
| AC9 | Logout cierra sesión | §3 auth.logout | T003, T004, T010 | covered |
| AC10 | Bloqueo tras 5 fallos → 15 min | §3 bloqueo | T002, T006, T011 | covered |
| AC11 | Recuperación completa | §3 recuperación | T007, T010, T011 | covered |
| AC12 | Recuperación no revela existencia | §3 auth.pedirRecuperacion | T007 | covered |
| R13 | Contraseña ≥ 8 y email con forma válida | §0 §3 precondiciones | T004 | AMBIGUOUS (sin done-check explícito) |
| R14 | Autenticado en pantalla de acceso → llevado a la app | §Behaviour edge | — | GAP (ningún done-check) |
| R15 | «Nadie puede *tocar* datos ajenos» (delete cruzado) | §What user can do | T001 (RLS DELETE) | AMBIGUOUS (sin check en T005/T011) |
| R16 | Código de recuperación expirado → error | §3 EnlaceInvalidoOExpirado | T007 | AMBIGUOUS (sin done-check) |
| R17 | Sesión «hasta cerrar sesión» | §Points suposición validada | §7 riesgos (memoria) | CONTRADICCIÓN menor documentada en plan, no en spec |

## Hallazgos

| # | Severidad | Tipo | A (loc) | B (loc) | Conflicto | Resolver en |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | MEDIUM | Contradicción | spec §Points (sesión «hasta cerrar sesión») | plan §7 (store en memoria: reinicio cierra todas) | La spec promete persistencia hasta logout; el plan la limita a la vida del proceso y solo lo documenta como riesgo propio | clarify/spec (registrar la limitación como aceptada) o aceptar a conciencia |
| 2 | MEDIUM | GAP | spec §Behaviour (autenticado → llevado a la app) | tasks T009 | El edge spec'd no tiene done-check: no se prueba y puede no enviarse | tasks (añadir al done-check de T009) |
| 3 | MEDIUM | AMBIGUOUS | spec §0/§3 (contraseña ≥ 8, email válido) | tasks T004 | La validación es precondición del contrato pero ningún done-check la ejercita | tasks (añadir: password de 7 → 400; email malformado → 400) |
| 4 | MEDIUM | AMBIGUOUS | spec §3 (EnlaceInvalidoOExpirado) | tasks T007 | El caso «código expirado/inválido → error» no tiene done-check | tasks (añadir a T007) |
| 5 | MEDIUM | AMBIGUOUS | spec §What user can do («nadie puede tocar») | tasks T005/T011 | El delete cruzado (A borra fila de B → no afectado) no se prueba ni con fakes ni en vivo | tasks (añadir a T005 y T011) |
| 6 | LOW | Nota | tasks T001 | — | «anónimo ve 0 filas» pasa igual antes y después de las políticas (RLS sin políticas ya niega todo); la prueba fuerte del RLS queda en T011 en vivo | nota; opcional reforzar T001 |
| 7 | LOW | Nota | plan T006 (429) | spec §Behaviour (sin códigos) | El 429 para bloqueo no está en la spec (que no nombra códigos); la forma `{"error": "..."}` es consistente con P3 | nota |
| 8 | LOW | Nota | plan T004 (`GET /api/sesion`) | spec (implícito) | El endpoint no aparece literal en la spec; es infraestructura necesaria para el gating spec'd | nota |

**Portadores para implementadores aislados**: §0 Global Constraints presente
con valores exactos ✓; bloques Interfaces con firmas exactas en T004–T010 ✓;
T001/T002/T012 autocontenidos o con contrato citado por el consumidor ✓.

## Ruteo recomendado

- **tasks** (una pasada, hallazgos 2–5): añadir cuatro líneas de done-check
  (T009 redirect, T004 validaciones, T007 expirado, T005/T011 delete cruzado).
- **clarify/spec** (hallazgo 1): registrar en la spec la limitación
  «reiniciar el servidor cierra sesiones» como aceptada, o mover el session
  store a persistente (cambio de plan, más costo).
- Hallazgos 6–8: notas; aceptar y seguir.

No se resolvió nada aquí: el gate reporta, el dueño decide.
