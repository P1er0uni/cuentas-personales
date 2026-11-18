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

- Sesión 1 (2026-11-17): **T001–T004 completas** con el ciclo completo
  build→risk→review→controls por tarea. Migración MCP (user_id + 4
  políticas RLS + índice); bloqueo anti fuerza bruta (normalización de
  email, cota con evicción que respeta bloqueos activos, ventana fija,
  ciclo fresco al expirar — 4 rondas, la última autorizada por el dueño
  tras blocker confirmado de saturación); session store en memoria con
  cookie httponly; endpoints de auth (registro/login/logout/sesión) con
  wrappers de Supabase Auth y doble capa anti-fuga de internals.
- Commits en `feature/003-login-usuarios` (14 a la fecha): trabajo previo
  de main rotulado, gobernanza v1.1.0, artefactos de la feature, y uno por
  tarea/ronda (ver `progress/003-login-usuarios.md` para el detalle con
  evidencia RED→GREEN de cada una).
- Hallazgos de revisión: 30 entradas en el ledger local de rsc (L1–L30);
  2 blockers confirmados y cerrados (evicción de bloqueados, pérdida de
  fallos por saturación); 1 fuga de internals cerrada con doble capa.
- Suite: **91/91 verde** (51 base + 17 auth + 12 session + 11 login-api).
- **Pendiente** (decisión del dueño: parar tras T004): T005–T012. Ver
  `progress/003-login-usuarios.md` — sección «Estado de sesión».

**Métricas del paso** — Inicio ~11:00 / fin ~15:45 (UTC-5) · duración
~4 h 45 min (T001–T004) · tokens: n/d (pendiente de extraer de
transcripciones — REGLAS-DOCUMENTACION Regla 4) · intervenciones humanas:
~6 (frontier, git, D1 ronda 4, scope de parada, 2 aclaraciones) ·
artefactos: progress ledger, decisions.md (5 entradas), 14 commits.

- Sesión 2 (2026-11-18, **autopilot autorizado por el dueño** — «no
  solicitarás permisos para nada… dudas bajo tu propio criterio»):
  **T005–T011 completas** con el ciclo build→risk→review→controls por
  tarea. T005: `dbPara(tokens, usuario)` + `requireSesion` adjunta el
  cliente scoped; los 6 endpoints de datos tras el gating; `user_id` en el
  insert del repo scoped (3 rondas — el hallazgo de ronda 1 se confirmó
  contra la base real). T006: bloqueo cableado al login (429 con minutos
  restantes). T007: recuperación pedir/confirmar + fix D2 (errores
  internos no cuentan bloqueo). T008: claim del huérfano (esPrimeraCuenta
  + claimHuerfanos idempotente). T009/T010: login.html, reset.html y
  gating/logout en index.html. T011: verificación en vivo contra
  Supabase real (ver sección «Verificación en vivo»).
- Suite final: **124/124 verde** (10 archivos: 51 base + 17 auth + 12
  session + 41 login-api + 3 db-scoped).
- Commits de la sesión: uno por tarea/ronda (ver progress ledger);
  hallazgos de revisión con fix + guarda en cada ronda.

**Métricas del paso (sesión 2)** — Inicio ~09:30 / fin ~17:15 (UTC-5) ·
duración ~7 h 45 min (T005–T011, en paralelo donde el plan lo permitió) ·
tokens: ≈1.9M de subagentes (suma de los reportes de uso: developers,
refuters, verifiers) + orquestador n/d · intervenciones humanas: **1**
(la autorización de autopilot al reanudar) · artefactos: progress ledger
(T005–T011 con evidencia), decisions.md (7 entradas nuevas), 16 commits.

## Revisión de agentes

- Sesión 1 (2026-11-17): T001–T004 con panel de 3 refuters por tarea
  (tier 2); 2 blockers confirmados y cerrados; 1 fuga de internals con
  doble capa. Ver `progress/003-login-usuarios.md`.
- Sesión 2 (2026-11-18, autopilot autorizado por el dueño): T005–T010 con
  su ciclo completo. Resumen por tarea (detalle y evidencia de mutantes en
  el progress ledger):
  - **T005** (3 rondas): ronda 1 — should-fix CONFIRMADO contra la base real
    (insert scoped sin `user_id` → RLS `WITH CHECK` rechazaría todo INSERT
    autenticado); ronda 2 — fix + should-fix CONFIRMADO (el test guardián
    ejercía el mock, no el módulo); ronda 3 — test del módulo real con mock
    del SDK. Panel final: 3 lentes PASS.
  - **T009** (1 ronda): panel 3 lentes PASS; 2 questions advisory.
  - **T006** (1 ronda): 3 lentes PASS; 4 mutantes corridos, todos muertos;
    question D2 (conflation de errores internos) plegada a T007.
  - **T007** (2 rondas): ronda 1 — 2 should-fix CONFIRMADOS (camino de error
    de AC12 sin test; done-check ignoraba los tests D2); ronda 2 — guard +
    enmienda del done-check. Panel final: 3 lentes PASS. D2 cerrada con
    guardas (`AuthNoDisponible` no cuenta bloqueo).
  - **T008** (2 rondas): ronda 1 — should-fix CONFIRMADO (camino de error
    del claim sin guarda) + question (redacción de la carrera); ronda 2 —
    test del camino de error + corrección de la decisión. Panel final:
    3 lentes PASS.
  - **T010** (tier 1, 2 rondas): ronda 1 — tag `</script>` duplicado,
    shadowing de `confirm`, redirect redundante; ronda 2 — PASS + nit de
    comentario corregido.
- Hallazgos acumulados del ciclo: ~45 entradas en el ledger local; 7
  should-fix confirmados (todos cerrados con fix + guarda); 0 blockers en
  la sesión 2. Nota operativa: los lentes que mutan el árbol se despachan
  en secuencia (un stall del watchdog por concurrencia lo motivó).

## Verificación en vivo (T011) — 2026-11-18

Contra el proyecto Supabase real (`getjrfqsirqflixdkdvl`), servidor local
`npm start`, cuentas de test creadas para la ocasión. Evidencia completa
con salidas HTTP en `progress/003-login-usuarios.md` (sección T011).

- **Login de 2 cuentas reales** ✅ — `t011-ana` y `t011-bruno` (confirmadas
  vía admin API; ver bloqueo de config abajo): 200 + cookie, `GET /api/sesion`
  200 con el usuario.
- **RLS real / aislamiento** ✅ — A crea movimiento → 201 con su `user_id`
  (el `WITH CHECK` de la política acepta el INSERT: la guarda de T005
  funciona contra la base real). A lista/saldo/resumen/CSV: SOLO lo suyo.
  B: SOLO lo suyo (saldo −50 vs +150 de A). Ninguno ve la fila ajena.
- **401 sin sesión** ✅ — los 6 endpoints de datos sin cookie → 401.
- **AC7** ✅ — password erróneo e email inexistente: mismo cuerpo
  `{"error":"credenciales incorrectas"}` 401.
- **AC9 logout** ✅ — 204 + cookie expirada; sesión muerta (401 después).
- **AC11 recuperación completa** ✅ — enlace real generado (admin
  `generateLink`): params `token, type, redirect_to`; el `token` del enlace
  funciona como código en `POST /api/recuperar/confirmar` → 204; password
  vieja → 401; nueva → 200; sesión previa destruida (401).
- **AC12** ✅ — `POST /api/recuperar` con email existente vs inexistente:
  idéntico `200 {"ok": true}`. Código falso → 400 «enlace inválido».
- **AC10 bloqueo real** ✅ — 5 logins fallidos (401×5), el 6.º con la
  password CORRECTA → `429 {"error":"cuenta bloqueada, reintenta en 15
  minutos"}`.
- **AC2 claim real** ✅ — `db.claimHuerfanos` invocado contra la base real:
  1 fila huérfana reclamada (UPDATE ... WHERE user_id IS NULL vía service
  key). La fila preexistente quedó asignada a `t011-ana` (ver D4).
- **Hallazgo corregido en vivo**: el enlace real de Supabase lleva
  `?token=...` y `reset.html` solo leía `code`/`token_hash` → fix inmediato
  (commit eea3f0f): ahora acepta los tres formatos.

### Bloqueos de config (no programables desde aquí — decisiones D3/D4)

- **Confirmación de email ACTIVADA** en el proyecto (default). El signUp
  real crea la cuenta pero NO devuelve sesión → `POST /api/registro`
  responde 500 (el wrapper espera `data.session`). Por eso las cuentas de
  test se confirmaron vía admin API. **AC1-live y AC8-live quedan
  pendientes del toggle** (dashboard: Authentication → Sign In / Providers
  → Email → «Confirm email» OFF); con la config corregida, registro → 201 +
  cookie y email duplicado → 400 (ambos probados por la suite con fakes y
  por el contrato de GoTrue).
- **Redirect del enlace de reset**: el `redirect_to` del enlace es
  `http://localhost:3000` (site URL del proyecto); el email real apuntará
  ahí, no a `/reset.html`. Con el toggle de arriba, ajustar también la
  plantilla del email de recuperación (dashboard) para apuntar a
  `http://localhost:3000/reset.html?token={{ .TokenHash }}` — o dejar el
  site URL con path `/reset.html`. `reset.html` ya acepta `token`/`token_hash`/`code`.

## Verificación (`verify`)

- En vivo: ver sección anterior (T011). Gate de cierre sobre la rama
  completa: pendiente (T12 / stage 5).

## Ship (`ship`)

- Pendiente. Tier 2: el merge espera aprobación humana explícita del dueño.

## Métricas

| Paso | Duración | Tokens | Interv. humanas | Notas |
|---|---|---|---|---|
| Registro | ~5 min | — | 1 | Prompt inicial del dueño |
| Spec | ~40 min | n/d | ~12 | Incluye enmienda constitución v1.1.0 |
| Plan | ~15 min | n/d | 4 | Incluye ronda de clarify |
| Tasks | ~10 min | n/d | 0 | Forecast de riesgo con `rsc risk` |
| Desarrollo | ~4 h 45 min + ~7 h 45 min | n/d + ≈1.9M (subagentes) | ~6 + 1 | Dos sesiones: paso a paso (T001–T004) y autopilot (T005–T011) |
| Revisión | (dentro de Desarrollo) | (incluidos arriba) | 0 | Panel de 3 por tarea tier 2; ~45 hallazgos en el ledger; 7 should-fix confirmados, todos cerrados |
| Verificación | ~1 h 15 min (en vivo) | incluidos | 0 | T011 contra Supabase real; 2 bloqueos de config → D3/D4 |
| Ship | pendiente | — | — | Tier 2: espera aprobación humana explícita |
| **Total** | ~14 h 45 min | ≈1.9M+ (subagentes) + n/d | ~24 | Sin contar la sesión de ship |

## Estado final del ciclo (2026-11-18)

- **T001–T012 completas** (ver `progress/003-login-usuarios.md`, fuente de
  verdad). Suite **124/124 verde**.
- **Pendiente del dueño** (cola de decisiones):
  - **D3** (blocking, config): desactivar «Confirm email» en el dashboard
    de Supabase → luego verificar AC1-live y AC8-live (curl, segundos).
  - **D4** (review-after): la fila preexistente quedó reclamada por la
    cuenta de test `t011-ana`; opciones documentadas en el ledger.
  - **Ship** (tier 2, always-human): merge a main espera aprobación
    explícita del dueño.
