# Feature 003 — Login de usuarios

> Spec: [`../specs/003-login-usuarios.md`](../specs/003-login-usuarios.md) ·
> Rama: `feature/003-login-usuarios` · Modo: **paso a paso** (aprobación del
> dueño en cada fase, 2026-11-17)

## Registro de ingreso

- **Fecha/hora de entrada**: 2026-11-17 ~09:20 (UTC-5).
- **Pedido por**: el dueño del proyecto (P1er0uni).
- **Descripción** (prompt inicial, literal): «Quiero implementar el sistema
  de login para el proyecto de cuentas personales , primero genera una spec
  en un spec.md».
- **Contexto relevante**: primera feature de producto tras la migración a
  Supabase; primera que ejercita la constitución **v1.1.0** (enmendada el
  mismo día a pedido del dueño, antes de escribir la spec: stack Supabase,
  privacidad en nube con RLS, main re-cerrada, auth como camino
  always-human). Riesgo registrado: `02-DOCS/wiki/sdd/config.yaml` no existe
  (sdd-init pendiente de ofrecerse); el usuario pidió continuar y queda
  anotado aquí como riesgo del ciclo.

## Spec (`specify`)

- Resumen: login multi-usuario con registro abierto, aislamiento real de
  datos por cuenta (RLS, no solo filtro del servidor), logout, y el
  movimiento preexistente heredado por la primera cuenta. Sin sesión, la
  app no expone nada (401 en los endpoints de datos).
- Decisiones de la ronda de frontera (dueño, 2026-11-17): multi-usuario real
  (vs. contraseña única); registro abierto (vs. cerrado); dato actual
  asignado a la primera cuenta (vs. huérfano o borrado); modo **paso a paso**
  (vs. autopilot).
- Desviaciones: el dueño pidió «una spec en un spec.md»; se escribe en
  `specs/003-login-usuarios.md` siguiendo la convención del proyecto (specs
  numeradas en `02-DOCS/wiki/sdd/specs/`), no como `spec.md` suelto.
- Interrupción registrada: antes de escribir la spec, el dueño pidió revisar
  y enmendar la constitución (v1.0.0 → v1.1.0); hecho en la misma sesión
  (ver `decisions.md`, 2026-11-17).
- Artefactos: `specs/003-login-usuarios.md`, `decisions.md` (1 entrada),
  `index.md`.
- **Aprobación**: **aprobada por el dueño el 2026-11-17** (modo paso a paso),
  tras una revisión que devolvió el bloqueo por intentos fallidos al alcance.
- Revisión del dueño sobre el draft (2026-11-17): el **bloqueo por intentos
  fallidos** pasa de decisión diferida al alcance (fuerza bruta); registrado
  en `## Revisions` de la spec y en `decisions.md`.
- Ronda de clarify (2026-11-17, dueño): contraseña mínima 8; bloqueo 5
  intentos → 15 min por email; sesión persistente confirmada; **recuperación
  de contraseña entra al alcance** (dos criterios de aceptación nuevos).
  Spec sin preguntas abiertas restantes; suposiciones restantes tipadas y
  con base escrita.

**Métricas del paso** — Inicio ~09:20 / fin ~10:00 (UTC-5, aprox.) ·
duración ~40 min (incluida la enmienda de la constitución) · tokens: n/d ·
intervenciones humanas: ~12 (pedido inicial, 4 respuestas de frontera,
interrupción constitución, 3 decisiones de enmienda, ratificación v1.1.0,
orden de reanudar, revisión del draft que devuelve el bloqueo por intentos
al alcance, decisión de commits) · artefactos: spec, feature doc, decisions,
index.

## Plan (`plan`)

- Resumen del enfoque técnico: identidad en **Supabase Auth** (nunca
  tocamos contraseñas) + acceso a datos con **cliente scoped al usuario por
  petición** para que el aislamiento lo impongan las **políticas RLS** en la
  base, no un filtro del servidor. Sesión propia en memoria (cookie httponly
  con id aleatorio → tokens Supabase, refresh transparente); bloqueo 5→15 min
  con lógica pura inyectable; `movimientos.user_id` nullable + políticas +
  índice por migración MCP; claim del dato huérfano por la primera cuenta con
  la service key; recuperación por email de Supabase (enlace 1 h, sesiones
  de la cuenta cerradas al completar). 8 pasos, #6 y #7 paralelizables.
- Artefactos: `plans/003-login-usuarios.md`, `decisions.md` (1 entrada),
  `index.md`.
- Desviaciones / decisiones: ver `decisions.md` 2026-11-17 (plan). Riesgo
  mayor: política RLS mal escrita — mitigada con verificación en vivo de dos
  cuentas y panel tier 2.
- **Aprobación**: **aprobado por el dueño el 2026-11-17** (modo paso a paso).

**Métricas del paso** — Inicio ~10:17 / fin ~10:30 (UTC-5, aprox.) ·
duración ~15 min (incluida la ronda de clarify) · tokens: n/d ·
intervenciones humanas: 4 (ronda de clarify: contraseña, bloqueo, sesión,
recuperación al alcance) · artefactos: plan, decisions, index.

## Tasks (`tasks`)

- Resumen del desglose: 12 tareas TDD (T001–T012) en el plan — migración
  MCP con RLS, bloqueo puro, session store, endpoints de auth, protección
  de existentes, bloqueo en login, recuperación, claim del huérfano,
  frontend (login/reset/gating), verificación en vivo y cierre. Paralelos:
  T002/T003 entre sí; T008 con T009/T010. Riesgo: 10 de 12 tareas tier 2
  (clase auth) — panel de 3 por tarea y ship esperando al humano.
- Artefactos: `plans/003-login-usuarios.md` (sección `## Tasks` + forecast
  de revisión).
- Desviaciones / decisiones: forecast de riesgo corrido con `rsc risk` sobre
  los paths esperados (no a ojo); entrega sugerida `ask-on-risk` porque el
  diff estimado (~600–800 líneas) supera el line budget por defecto (400).

**Métricas del paso** — Inicio ~10:35 / fin ~10:45 (UTC-5, aprox.) ·
duración ~10 min · tokens: n/d · intervenciones humanas: 0 (desglose
derivado del plan aprobado) · artefactos: tasks + forecast en el plan.

## Desarrollo (`implement`)

- Pendiente.

## Revisión de agentes

- Pendiente. Auth es tier 2 (always-human): panel de 3 refuters obligatorio.

## Verificación (`verify`)

- Pendiente.

## Ship (`ship`)

- Pendiente. Tier 2: el merge espera aprobación humana explícita del dueño.

## Métricas

| Paso | Duración | Tokens | Interv. humanas | Notas |
|---|---|---|---|---|
| Registro | ~5 min | — | 1 | Prompt inicial del dueño |
| Spec | ~30 min | n/d | ~10 | Incluye enmienda constitución v1.1.0 |
| Plan | | | | |
| Tasks | | | | |
| Desarrollo | | | | |
| Revisión | | | | |
| Verificación | | | | |
| Ship | | | | |
| **Total** | | | | |
