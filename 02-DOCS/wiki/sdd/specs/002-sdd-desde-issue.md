---
type: spec
title: Spec — SDD disparado por GitHub Issue
description: WHAT y WHY del disparador del flujo SDD vía issues de GitHub — vigilante local que abre una sesión de desarrollo en autopilot al crearse un issue, con hook de sesión como fallback.
tags: [sdd, spec]
timestamp: 2026-11-13T00:00:00Z
topic: sdd
slug: 002-sdd-desde-issue
branch: feature/002-sdd-desde-issue
status: approved
approved-mode: autopilot
---

# Spec — SDD disparado por GitHub Issue

> Slug: `002-sdd-desde-issue` · Status: approved · Created: 2026-11-13
> Inherits: [constitution](../constitution.md)
> **Aprobada en autopilot** (el dueño autorizó la corrida completa sin pausas
> por fase, 2026-11-13) — no aprobación ítem por ítem.
> Promocionada desde FTD (`02-DOCS/wiki/ftd/sdd-desde-issue.md`) — `rsc risk`
> tier 2 por tocar el harness; el trabajo ya hecho se conserva, no se reinicia.

## Problem & why

Hoy el flujo SDD arranca cuando el dueño tipea un prompt al abrir la sesión.
Ese prompt es efímero: la idea de una feature no tiene dónde vivir antes de
que arranque el desarrollo, y cuando se tipea ya es tarde para pensarla con
calma. El disparador debería ser un artefacto durable y visible — un issue de
GitHub — y el desarrollo debería arrancar solo a partir de él, sin que el
dueño tenga que abrir la sesión y tipear nada.

## Cost of not building it

Las ideas de features se pierden o viven en notas sueltas sin historial ni
vinculación. El disparador del flujo queda acoplado al momento del desarrollo
en vez de desacoplado del momento de la idea. Para el piloto: el punto de
entrada del flujo SDD no se ejercita como se usaría al escalar (backlog real
en GitHub que dispara desarrollo).

## The cheapest alternative

El hook de detección al abrir sesión (ya construido y probado): el dueño
crea el issue y, cuando abre una sesión, se le ofrece arrancar. No basta:
requiere el paso manual de abrir la sesión y aceptar — justo el paso que esta
spec elimina. Seguir tipeando prompts es aún más barato y aún más efímero.

## Goals

- Crear un issue en GitHub basta para que el desarrollo arranque solo: en
  pocos minutos se abre una ventana de PowerShell nueva con Claude Code
  trabajando ese issue.
- La sesión auto-abierta corre la cadena SDD en **autopilot**: spec → plan →
  tareas → código → verify → review, deteniéndose solo ante ambigüedad o
  acciones destructivas; el PR queda abierto esperando al humano.
- El issue actúa como prompt inicial del flujo y queda vinculado de punta a
  punta: la spec lo referencia, el PR lo cierra al mergearse.
- El hook de detección al abrir sesión sigue como **fallback**: si el
  vigilante no está corriendo, abrir una sesión manualmente ofrece los issues
  abiertos.

## Non-goals / out of scope

- Correr el desarrollo en la nube (GitHub Actions / runners de GitHub):
  opción considerada y descartada — el harness rsc con sus guards no está
  activo allá y el costo por token no usa la suscripción del dueño.
- Etiquetas o filtros para clasificar issues (decisión explícita: issue plano).
- Que el agente cree issues por sí solo.
- Modificar archivos gestionados por rsc (`.rsc/`, skills de rsc, bootstrap).
- Detectar issues en otros repos: solo el repo de origin de este proyecto.
- Auto-merge del PR: aunque la sesión corra en autopilot, el aterrizaje del
  tier 2 espera aprobación humana (constitución, principio 5).

## Users & context

El dueño del proyecto (usuario único), que captura ideas de features cuando
se le ocurren y quiere que el desarrollo arranque sin su intervención
manual. Contexto: proyecto personal, una sola persona, PC con Windows,
GitHub como forge del repo, `gh` autenticado.

## Qué podrá hacer el usuario

Crear issues en GitHub cuando quiera, sin condición previa. Nada más: el
vigilante local detecta el issue nuevo y abre por sí solo una ventana de
PowerShell con Claude Code trabajando ese issue en autopilot. El usuario
puede además abrir sesiones manualmente; si el vigilante no estaba corriendo,
la sesión manual ofrece los issues abiertos (fallback).

## Qué resultado obtiene

- Al crear un issue con el vigilante corriendo: en ≤ 2 minutos se abre una
  ventana de PowerShell nueva con Claude Code leyendo el issue y arrancando
  la cadena SDD en autopilot.
- Al terminar la cadena, el PR queda abierto con `Closes #N` en su cuerpo;
  GitHub cierra el issue al mergear.
- Si el vigilante no está corriendo: al abrir una sesión manual con issues
  abiertos, una oferta de una línea lista cada issue con número, título y
  enlace; aceptar es opcional.
- Ante fallo de GitHub, red caída o `gh` sin autenticar: ni el vigilante ni
  el arranque de sesión muestran errores; el vigilante reintenta en su
  siguiente ciclo y el arranque sigue como si el detector no existiera.

## Qué debe respetar

- El vigilante no abre ventanas duplicadas: un issue ya procesado no vuelve
  a disparar una sesión (lleva registro de lo visto).
- El arranque de sesión y el vigilante nunca dependen de que GitHub esté
  disponible (fail-open silencioso ante cualquier fallo).
- Los hooks existentes del harness (rsc) siguen intactos y funcionando igual.
- `main` cerrada: cada issue se trabaja en su rama `feature/NNN-<slug>` y
  cierra con PR (constitución, principio 5).
- Autoría git humana, sin trailers de IA (principio 6).
- Ningún secreto viaja en el vigilante ni en su configuración (principio 7).
- Toda decisión significativa se registra en `decisions.md` (principio 10).

## Cómo lo demuestra

- Prueba del detector de sesión con 0 issues abiertos: salida vacía, exit 0.
- Prueba con ≥1 issue abierto: imprime el bloque de oferta con número, título
  y URL de cada issue.
- Prueba del vigilante: con el vigilante corriendo, al crear un issue de
  prueba se abre una ventana de PowerShell con Claude Code trabajando ese
  issue; no se abre una segunda ventana para el mismo issue.
- Prueba de resiliencia: con `gh` inaccesible, el vigilante sigue corriendo
  sin morir y el arranque manual es normal.
- El registro de verificación de la feature conserva las salidas observadas.

## Behaviour

- Principal: issue creado en GitHub → el vigilante lo detecta en su siguiente
  ciclo de polling (≤ 2 min) → abre una ventana de PowerShell nueva con
  Claude Code trabajando ese issue en autopilot → la cadena corre hasta
  dejar el PR abierto con `Closes #N`.
- Borde: varios issues nuevos en un mismo ciclo → una ventana por issue.
- Borde: el vigilante no está corriendo → el issue queda pendiente; al abrir
  una sesión manual, el hook lo ofrece (fallback).
- Error: GitHub inalcanzable, `gh` ausente, o respuesta no-JSON → el
  vigilante lo salta y reintenta en el siguiente ciclo; el arranque de sesión
  prosigue como si el detector no existiera.

## Acceptance criteria

- Given el vigilante corriendo, When se crea un issue nuevo, Then en ≤ 2
  minutos se abre una ventana de PowerShell con Claude Code trabajando ese
  issue en autopilot.
- Given un issue ya procesado por el vigilante, When pasa el siguiente ciclo
  de polling, Then no se abre otra ventana para él.
- Given el vigilante no está corriendo, When se abre una sesión manualmente
  con issues abiertos, Then el contexto de sesión incluye una oferta de una
  línea que lista cada issue con número, título y URL.
- Given un repo con 0 issues abiertos, When se abre una sesión, Then el
  arranque es idéntico al actual, sin oferta ni errores.
- Given `gh` inaccesible o sin red, When corre el vigilante o se abre una
  sesión, Then ninguno muestra errores ni muere por ello.
- Given la sesión auto-abierta corre la cadena en autopilot, When termina,
  Then la spec resultante registra `issue: N` y el PR final lleva
  `Closes #N` y queda abierto esperando merge humano.
- Given el PR con `Closes #N` se mergea, Then GitHub cierra el issue N
  automáticamente.

## Points to clarify

- **suposición tomada** — El vigilante se ejecuta en el PC del dueño y se
  arranca manualmente (`npm run watch:issues`) o como tarea programada al
  inicio de sesión; la tarea programada es lo recomendado. *Base:* proyecto
  personal en Windows con `gh` autenticado. *Riesgo:* si no está corriendo,
  el disparador automático no ocurre (queda el fallback manual).
- **suposición tomada** — Una ventana por issue nuevo; no se agrupan varios
  issues en una sola sesión. *Base:* cada issue es una feature con su propia
  rama; agruparlos mezclaría ciclos SDD. *Riesgo:* muchos issues creados a la
  vez abren muchas ventanas a la vez.
- **suposición tomada** — El registro de issues vistos vive local al
  proyecto, fuera del repo (no se commitea). *Base:* es estado operativo del
  dueño, no conocimiento del proyecto. *Riesgo:* si se borra, el vigilante
  re-procesaría issues viejos abiertos.
- **suposición tomada** — Un sync futuro de rsc no elimina la entrada del
  hook en `.claude/settings.json`. *Base:* las entradas son aditivas y rsc
  no reporta conflictos con entradas ajenas. *Riesgo:* si la elimina, el
  fallback deja de disparar silenciosamente; fallback documentado en el doc
  FTD (mover a `settings.local.json`).
- **decisión diferida** — Etiquetas o filtros para issues (p. ej. solo
  `sdd` dispara); fuera de este ciclo por decisión del dueño.

## Revisions

- 2026-11-13 — Revisión mayor a pedido del dueño: el disparador pasa de
  "detección al abrir sesión + oferta" a "vigilante local que abre solo una
  ventana de desarrollo en autopilot al crearse un issue". El hook de sesión
  pasa a ser fallback. Razón: el dueño quiere que crear el issue sea el único
  paso manual. La "decisión diferida — automatismo programado" se des-difiere
  y entra al alcance.
