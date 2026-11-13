---
type: spec
title: Spec — SDD disparado por GitHub Issue
description: WHAT y WHY del disparador del flujo SDD vía issues de GitHub — detección al abrir sesión, issue como prompt inicial, vinculación con spec y PR.
tags: [sdd, spec]
timestamp: 2026-11-13T00:00:00Z
topic: sdd
slug: 002-sdd-desde-issue
branch: feature/002-sdd-desde-issue
status: draft
---

# Spec — SDD disparado por GitHub Issue

> Slug: `002-sdd-desde-issue` · Status: draft · Created: 2026-11-13
> Inherits: [constitution](../constitution.md)
> Promocionada desde FTD (`02-DOCS/wiki/ftd/sdd-desde-issue.md`) — `rsc risk`
> tier 2 por tocar el harness; el trabajo ya hecho se conserva, no se reinicia.

## Problem & why

Hoy el flujo SDD arranca cuando el dueño tipea un prompt al abrir la sesión.
Ese prompt es efímero: la idea de una feature no tiene dónde vivir antes de
que arranque el desarrollo, y cuando se tipea ya es tarde para pensarla con
calma. El disparador debería ser un artefacto durable y visible: un issue de
GitHub, creado cuando se ocurre la idea, procesado cuando se decide.

## Cost of not building it

Las ideas de features se pierden o viven en notas sueltas sin historial ni
vinculación. El disparador del flujo queda acoplado al momento del desarrollo
en vez de desacoplado del momento de la idea. Para el piloto: el punto de
entrada del flujo SDD no se ejercita como se usaría al escalar (backlog real
en GitHub).

## The cheapest alternative

Seguir tipeando prompts al abrir sesión, o anotar ideas en un archivo local.
No basta: no son visibles desde GitHub, no tienen historial ni comentarios,
no se vinculan a la spec ni al PR, y no cierran solos cuando la feature aterriza.

## Goals

- Crear un issue en GitHub basta para que el harness lo note al abrir la
  siguiente sesión.
- El issue actúa como prompt inicial del flujo SDD: al aceptar la oferta, la
  cadena arranca con el issue como petición.
- El rastro queda completo: la spec referencia el issue, el PR lo cierra al
  mergearse.

## Non-goals / out of scope

- Automatismo programado: nada vigila GitHub ni lanza sesiones sin el dueño
  (decisión explícita del diseño).
- Etiquetas o filtros para clasificar issues (decisión explícita: issue plano).
- Que el agente cree issues por sí solo.
- Modificar archivos gestionados por rsc (`.rsc/`, skills de rsc, bootstrap).
- Detectar issues en otros repos: solo el repo de origin de este proyecto.

## Users & context

El dueño del proyecto (usuario único), que captura ideas de features cuando
se le ocurren y decide cuándo desarrollarlas. Contexto: proyecto personal,
una sola persona, GitHub como forge del repo.

## Qué podrá hacer el usuario

Crear issues en GitHub cuando quiera, sin condición previa. Al abrir una
sesión en el proyecto, si hay issues abiertos, se le ofrece en una línea
arrancar el flujo SDD con uno de ellos. Aceptar es opcional: la oferta es
una línea no bloqueante y el usuario puede ignorarla y pedir otra cosa.

## Qué resultado obtiene

- Al abrir sesión con issues abiertos: una oferta de una línea que lista cada
  issue con número, título y enlace.
- Al abrir sesión sin issues abiertos: nada — el arranque es idéntico al de
  hoy.
- Al aceptar la oferta por el issue N: la cadena SDD corre con el issue como
  petición; la spec queda marcada con `issue: N`; el PR final lleva
  `Closes #N` y GitHub cierra el issue al mergear.
- Ante fallo de GitHub, red caída o `gh` sin autenticar: el arranque de sesión
  no se rompe ni muestra errores; simplemente no hay oferta.

## Qué debe respetar

- El arranque de sesión nunca depende de que GitHub esté disponible
  (fail-open silencioso ante cualquier fallo del detector).
- Los hooks existentes del harness (rsc) siguen intactos y funcionando igual.
- `main` cerrada: la feature nace en `feature/002-sdd-desde-issue` y cierra
  con PR (constitución, principio 5).
- Autoría git humana, sin trailers de IA (principio 6).
- Ningún secreto viaja en el detector ni en su configuración (principio 7).
- Toda decisión significativa se registra en `decisions.md` (principio 10).

## Cómo lo demuestra

- Prueba del detector con 0 issues abiertos: salida vacía, código de salida 0.
- Prueba con ≥1 issue abierto: imprime el bloque de oferta con número, título
  y URL de cada issue.
- Prueba de resiliencia: con `gh` inaccesible, salida vacía y arranque normal.
- Prueba end-to-end: issue de prueba creado en GitHub, detectado por el
  detector, y cerrado al finalizar la validación.
- El registro de verificación de la feature conserva las salidas observadas.

## Behaviour

- Principal: sesión abre → issues abiertos existen → el contexto de sesión
  incluye la oferta con la lista de issues → el usuario acepta → la cadena
  SDD arranca leyendo el issue completo.
- Borde: hay issues abiertos pero el usuario pide otra cosa → la oferta se
  ignora sin fricción; el issue queda para una sesión futura.
- Error: GitHub inalcanzable, `gh` ausente, o respuesta no-JSON → silencio
  total; el arranque de sesión prosigue como si el detector no existiera.

## Acceptance criteria

- Given un repo con 0 issues abiertos, When se abre una sesión, Then el
  arranque es idéntico al actual, sin oferta ni errores.
- Given un repo con ≥1 issue abierto, When se abre una sesión, Then el
  contexto de sesión incluye una oferta de una línea que lista cada issue con
  número, título y URL.
- Given `gh` inaccesible o sin red, When se abre una sesión, Then el arranque
  no muestra errores ni se demora perceptiblemente por el detector.
- Given el usuario acepta la oferta por el issue N, When corre la cadena SDD,
  Then la spec resultante registra `issue: N` y el PR final lleva
  `Closes #N`.
- Given el PR con `Closes #N` se mergea, Then GitHub cierra el issue N
  automáticamente.

## Points to clarify

- **suposición tomada** — La oferta aparece en cada sesión mientras haya
  issues abiertos (una línea, no bloqueante), no una sola vez por issue.
  *Base:* el costo de ignorar una línea es cero y el issue abierto significa
  trabajo pendiente. *Riesgo:* si resulta molesto, se necesita memoria de
  "ya ofrecido" que hoy no existe.
- **suposición tomada** — Un sync futuro de rsc no elimina la entrada del
  hook en `.claude/settings.json`. *Base:* las entradas son aditivas y rsc
  no reporta conflictos con entradas ajenas. *Riesgo:* si la elimina, el
  trigger deja de disparar silenciosamente; fallback documentado en el doc
  FTD (mover a `settings.local.json`).
- **decisión diferida** — Etiquetas o filtros para issues (p. ej. solo
  `sdd` dispara); fuera de este ciclo por decisión del dueño.
- **decisión diferida** — Automatismo programado (polling / sesiones sin el
  dueño); fuera de este ciclo por decisión del dueño.
