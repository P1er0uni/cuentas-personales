---
type: plan
title: Plan — Login de usuarios
description: Plan técnico de estructura para el login multi-usuario — Supabase Auth, RLS real por usuario, sesión propia, bloqueo anti fuerza bruta y recuperación por email.
tags: [sdd, plan]
timestamp: 2026-11-17T15:20:00Z
topic: sdd
slug: 003-login-usuarios
status: approved
---

# Plan — Login de usuarios

> Spec: [../specs/003-login-usuarios.md](../specs/003-login-usuarios.md) ·
> Constitution: [../constitution.md](../constitution.md) (v1.1.0) · Status: approved (paso a paso, 2026-11-17)
> Last updated: 2026-11-17

## 0. Global Constraints

- **Stack (constitución P1, v1.1.0):** Node.js ESM (≥ 18), Express 5,
  `@supabase/supabase-js` ^2.119.0, Supabase PostgreSQL (proyecto
  `getjrfqsirqflixdkdvl`, migraciones vía MCP), Vitest, frontend estático en
  `public/` sin paso de build, npm.
- **Servidor único cliente de la base (P1/P7):** la service role key vive solo
  en el servidor (`.env` gitignored); el navegador jamás habla con Supabase.
- **RLS real (P7 + spec):** toda tabla con datos personales lleva RLS
  activado; el aislamiento se exige en la base, no solo como filtro del
  servidor.
- **Formas de error (P3):** validación → `400 {"errores": [...]}`; 404 →
  `{"error": "..."}`; sin sesión → `401 {"error": "..."}`.
- **Barra de merge (P2):** `npm test` en verde con tests nuevos de la feature.
- **Contraseña:** longitud mínima 8, sin requisitos de complejidad.
- **Bloqueo anti fuerza bruta:** 5 intentos fallidos → 15 minutos de bloqueo,
  contado por email; el mensaje indica el bloqueo.
- **Sesión:** persiste entre visitas hasta logout; sin expiración corta.
- **Recuperación:** email con enlace (caducidad 1 h, default Supabase); tras
  completar el reset, las sesiones activas de esa cuenta quedan cerradas.
- **UX floor (P8):** formularios nativos con labels visibles, operables por
  teclado, modo oscuro, sin dependencias de build.
- **Git (P4/P5/P6):** rama `feature/003-login-usuarios`, commits gitmoji en
  español, autoría git humana (sin `Co-Authored-By` de IA), PR para mergear.
- **Ship:** auth es tier 2 (always-human) — el merge espera aprobación
  explícita del dueño.

## 1. Context & constraints

- Criterios que moldean el diseño: spec §Acceptance #1–#12 (registro con
  sesión, herencia del dato huérfano, propiedad por cuenta, aislamiento entre
  dos cuentas, saldo/resumen/CSV por usuario, 401 sin sesión, credenciales
  incorrectas genéricas, email duplicado, logout, bloqueo, recuperación,
  recuperación sin revelar existencia).
- La spec exige aislamiento **real en la base** (§What it must respect): RLS
  con políticas, no un `WHERE user_id = ...` en el servidor.
- Constitución v1.1.0: P1 (stack Supabase), P2 (tests como merge bar), P3
  (formas de error), P7 (RLS + service key solo servidor), P8 (UX floor),
  P11 (doc de feature con métricas).
- Fuera de alcance (spec §Non-goals): login social, verificación de email al
  registrarse, rate limiting general de la API, cambio de contraseña
  autenticado, compartir datos entre cuentas, roles.
- Estado actual: `movimientos` con RLS activado **sin políticas** (todo
  bloqueado para clientes anónimos; el servidor pasa por encima con la
  service key) y 1 fila sin dueño.

## 2. Architecture

```text
[ public/ (login.html · reset.html · index.html) ]
        |  fetch JSON (same-origin)
        v
[ Express app.js ] --requireSesion--> [ endpoints de datos: existentes ]
        |                    \--------> [ endpoints de auth: registro/login/logout/sesion/recuperar ]
        v
[ src/auth.js ]  (registro/login/reset + registro de bloqueo, lógica pura)
        |
        v
[ Supabase Auth (GoTrue) ]  EXTERNO — dueño de identidades y contraseñas
        |
        v (JWT del usuario, por petición)
[ src/db.js: cliente scoped al usuario ] --> [ PostgreSQL: movimientos + RLS ]
                                                  ^
[ session store en memoria ] --cookie httponly--> [ navegador ]
        ^
[ src/db.js: cliente service key ]  solo para: migración, claim del dato huérfano
```

- **`src/auth.js`** (interno) — envuelve registro/login/logout/reset contra
  Supabase Auth y mantiene el registro de intentos fallidos (lógica pura
  testeable: decidirBloqueo, registrarFallo, reiniciar).
- **Session store + middleware `requireSesion`** (interno) — cookie httponly
  con id de sesión aleatorio → mapa en memoria `{ idSesion → { usuario, tokens
  Supabase } }`; adjunta al request el cliente de base scoped al usuario;
  responde 401 si no hay sesión válida.
- **`src/db.js`** (interno) — fábrica de cliente Supabase scoped a un
  usuario (para que RLS filtre de verdad) + el cliente service key existente,
  reservado a migración y claim del dato huérfano.
- **Endpoints en `src/app.js`** (interno) — `POST /api/registro`,
  `POST /api/login`, `POST /api/logout`, `GET /api/sesion`,
  `POST /api/recuperar`, `POST /api/recuperar/confirmar`; los endpoints de
  datos existentes quedan tras `requireSesion`.
- **`public/`** (interno) — `login.html` (acceso + registro),
  `reset.html` (nueva contraseña desde el enlace del email), `index.html`
  existente ahora con gating (401 → redirigir a login) y botón de logout.
- **Supabase Auth** (externo) — identidad: hashing de contraseñas, emisión
  de JWT, email de recuperación. Nosotros nunca tocamos contraseñas.
- **PostgreSQL + RLS** (externo) — dueño del dato; las políticas son la
  frontera de aislamiento.

**Decisión arquitectónica principal:** identidad por **Supabase Auth** y
acceso a datos con **cliente scoped al usuario por petición**, de modo que el
aislamiento lo impongan las políticas RLS en la base — no un filtro en el
servidor. Alternativas viables: (a) service key + `WHERE user_id` en el
servidor — rechazada: la spec exige aislamiento real en la base y un bug de
filtro filtra finanzas ajenas; (b) tabla `usuarios` propia con bcrypt —
rechazada: re-implementa hashing, reset y bloqueo que Supabase ya da
auditados, y complica keyear RLS sin `auth.uid()`. La elegida cumple P7 y la
spec §What it must respect al pie de la letra.

## 3. Interfaces & contracts

```text
auth.registrar(email, password) -> { usuario, tokens } | EmailYaRegistrado | ContraseñaInvalida
  - precondición: password.length >= 8; email con forma válida
  - postcondición: la cuenta existe en Supabase Auth; si es la PRIMERA cuenta,
    las filas huérfanas de movimientos (user_id NULL) pasan a ser suyas
    (claim por service key, una sola vez)

auth.login(email, password) -> { usuario, tokens } | CredencialesInvalidas | Bloqueado(minutosRestantes)
  - precondición: email no bloqueado por intentos fallidos
  - invariantes: fallo → registrarFallo(email); éxito → reiniciar(email);
    respuesta de error idéntica exista o no el email (no revela existencia)

auth.logout(tokens) -> void
  - postcondición: la sesión del store queda destruida y los tokens invalidados

auth.pedirRecuperacion(email) -> void
  - invariante: respuesta idéntica exista o no el email (no revela existencia)

auth.confirmarRecuperacion(codigoDelEnlace, nuevaPassword) -> void | EnlaceInvalidoOExpirado | ContraseñaInvalida
  - precondición: password.length >= 8
  - postcondición: login posible con la nueva; sesiones activas de la cuenta, cerradas

sesion.crear(tokens, usuario) -> idSesion   ·   sesion.leer(idSesion) -> { usuario, tokens } | null
  - invariante: idSesion aleatorio no adivinable; cookie httponly, sameSite=lax

requireSesion(req, res, siguiente) -> siguiente() | 401 {"error": "..."}
  - postcondición: req.dbCliente queda scoped al usuario (RLS aplica)

db.listarMovimientos() / crearMovimiento(...) / eliminarMovimiento(id)   (contrato async existente, sin cambio de firma)
  - cambio de significado: operan contra el cliente scoped; el aislamiento
    lo garantiza RLS (auth.uid() = user_id), no un WHERE explícito
```

## 4. Data model & flow

**Entidades**

- **Usuario** — lo posee Supabase Auth (`auth.users`): id (uuid), email.
  No creamos tabla propia de usuarios en este ciclo.
- **Sesión** — en memoria del servidor: `{ idSesion → { usuarioId, email,
  tokens Supabase } }`. No persiste: reiniciar el servidor cierra todas las
  sesiones (trade-off de piloto, registrado en riesgos).
- **Registro de bloqueo** — en memoria: `{ email → { fallos, bloqueadoHasta }
  }` con lógica pura inyectable (reloj falso en tests).
- **Movimiento** — gana `user_id uuid NULLABLE REFERENCES auth.users(id)`.
  NULL = huérfano (solo la fila preexistente, hasta el claim de la primera
  cuenta).

**Migración (vía MCP, orden importa):** ① `ALTER TABLE movimientos ADD
COLUMN user_id uuid REFERENCES auth.users(id)` (nullable — la fila existente
no bloquea); ② políticas RLS: SELECT/INSERT/DELETE/UPDATE con `USING
(auth.uid() = user_id)` y `WITH CHECK (auth.uid() = user_id)`; ③ índice sobre
`user_id`. El NOT NULL definitivo no entra en este ciclo (el claim de la
primera cuenta es el backfill).

**Flujo primario (registro → uso aislado):** visitante envía email+password
→ `POST /api/registro` valida (≥ 8) → `auth.registrar` crea la cuenta en
Supabase Auth → si es la primera cuenta, claim de filas huérfanas por service
key → `sesion.crear` → cookie httponly → el frontend muestra `index.html` →
cada petición de datos pasa `requireSesion` → cliente scoped → RLS devuelve
solo filas con `auth.uid() = user_id`.

**Flujo de recuperación:** `POST /api/recuperar` (email) → respuesta genérica
→ Supabase envía email con enlace (caducidad 1 h) → el enlace lleva a
`reset.html` → `POST /api/recuperar/confirmar` con el código del enlace y la
nueva contraseña → sesiones activas de esa cuenta destruidas → login con la
nueva contraseña.

- Fronteras de consistencia: el claim de huérfanos es idempotente (segunda
  ejecución no encuentra filas NULL); registro + claim no son transaccionales
  entre sí (aceptable: el claim es una sola vez y verificable).
- Impacto de migración: columna nueva nullable + políticas + índice; nada
  destructivo; reversible (drop column/policies).

## 5. Testing strategy

| Criterio (spec §Acceptance) | Nivel | Asserts | Fakes |
| --- | --- | --- | --- |
| #1 registro → sesión iniciada | integration | POST /api/registro 201 + cookie de sesión + GET /api/sesion devuelve al usuario | auth service fake, session store real |
| #2 primera cuenta hereda fila | integration | tras registro con claim pendiente, la fila huérfana queda con su user_id (fake db registra el claim) | fake db + fake auth |
| #3 movimiento asociado a la cuenta | integration | POST /api/movimientos con sesión → 201; el fake db recibe el cliente scoped | fake db |
| #4 aislamiento entre dos usuarios | integration | dos sesiones; lo creado por A no aparece en el listado de B | fake db con datos por usuario |
| #5 saldo/resumen/CSV solo suyos | integration | los tres endpoints computan sobre el set del usuario | fake db |
| #6 401 sin sesión | integration | cada endpoint de datos sin cookie → 401 con `{"error": "..."}` | sin fake extra |
| #7 credenciales incorrectas genéricas | integration | login con email inexistente y con password erróneo devuelven el MISMO error | fake auth |
| #8 email duplicado | integration | segundo registro con mismo email → 400 con error claro | fake auth |
| #9 logout | integration | tras POST /api/logout, la cookie muere y GET /api/sesion → 401 | — |
| #10 bloqueo tras 5 fallos | unit (lógica pura con reloj falso) + integration | al 6.º intento dentro de la ventana → Bloqueado con minutos restantes, aunque las credenciales valgan | reloj falso |
| #11 recuperación completa | integration | pedir → respuesta genérica; confirmar con código válido → login con la nueva password funciona y la vieja no | fake auth |
| #12 recuperación no revela existencia | integration | email no registrado → misma respuesta que registrado | fake auth |

- Línea e2e: **Supabase real queda fuera de la suite automatizada** (sin
  service key en CI-less; los tests no dependen de red). Lo que Supabase
  aporta de verdad — políticas RLS, hashing, email de recuperación, emisión
  de JWT — se verifica **en vivo** en el cierre del ciclo: dos cuentas
  reales, aislamiento comprobado, un reset de contraseña real, bloqueo real
  tras 5 fallos. Evidencia documentada en el doc de la feature (P11).
- Dependencia real obligatoria en la verificación en vivo: la base con las
  políticas aplicadas (ningún mock puede demostrar aislamiento real).
- Contraseña ≥ 8 y validación de email: unit del validador puro + integration
  en #1/#8.

## 6. Sequencing & dependencies

1. **Migración SQL vía MCP** (columna `user_id` nullable + políticas RLS +
   índice) — depende de: nada — serial. Verificación: `list_tables` muestra
   la columna y las políticas; una consulta anónima no ve filas.
2. **`src/auth.js`** (wrappers + lógica pura de bloqueo, TDD rojo→verde) —
   depende de: nada — serial. Unit del bloqueo con reloj falso.
3. **Session store + `requireSesion`** — depende de: #2 — serial. Unit +
   integration del 401.
4. **Endpoints de auth + protección de los existentes** — depende de: #3 —
   serial. Integration #1, #4–#10.
5. **Recuperación** (endpoints pedir/confirmar) — depende de: #4 — serial.
   Integration #11–#12.
6. **Claim del dato huérfano** (primera cuenta) — depende de: #1, #4 —
   serial. Integration #2.
7. **Frontend** (`login.html`, `reset.html`, gating en `index.html`, logout)
   — depende de: #4 y #5 — parallelizable con #6 (no toca `src/`).
8. **Verificación en vivo + config Supabase** (confirmación de email
   desactivada, redirect del enlace de reset, SMTP) — depende de: todos —
   serial, cierre del ciclo.

- Paralelizables: #6 y #7 (scopes disjuntos: `src/db.js`/migración vs
  `public/`).
- Orden duro: las políticas RLS (#1) antes que cualquier prueba contra el
  cliente scoped; el bloqueo (#2) antes de los endpoints (#4) porque estos
  consumen su contrato.

## 7. Risks & open decisions

**Riesgos** (ordenados, primero el más probable/impactante)

| Riesgo | Disparador | Impacto | Mitigación |
| --- | --- | --- | --- |
| Política RLS mal escrita (filtra datos ajenos o bloquea todo) | error en `USING`/`WITH CHECK` | fuga de finanzas entre cuentas o app inservible | verificación en vivo con dos cuentas reales (paso #8); revisión tier 2 (panel de 3) sobre el diff de migración |
| Supabase exige confirmación de email al registrarse (default en proyectos nuevos) | registro no completa sesión | #1 falla en vivo | desactivar confirmación en la config del proyecto (paso #8); la spec la deja fuera de alcance |
| Email de recuperación no llega (SMTP incluido de Supabase con rate limits) | paso #8 | #11 no demostrable en vivo | probar un reset real temprano en #8; si el SMTP incluido no sirve, queda como hallazgo documentado |
| Refresh de tokens: la sesión persistente exige refrescar el access token expirado | token expira (~1 h) | 401 inesperado con sesión "viva" | el session store guarda el refresh token y refresca transparente; si el refresh falla → 401 limpio |
| Estado en memoria (sesiones + bloqueo) se pierde al reiniciar el servidor | reinicio | todos deslogueados; bloqueos olvidados | trade-off de piloto aceptado y documentado aquí; la lógica es inyectable para persistir después |
| Cookie sin `Secure` en localhost http | entorno local | token expuesto solo en tráfico local | aceptable en piloto; `Secure` al desplegar con https (constitución futura) |
| Claim de huérfanos con carrera (dos registros simultáneos) | primera y segunda cuenta casi simultáneas | fila asignada dos veces | idempotente por diseño (`WHERE user_id IS NULL`); riesgo residual nulo en piloto single-owner |

**Decisiones abiertas**

- Dónde viven los commits del trabajo pendiente de main (migración a Supabase
  sin commitear de la sesión anterior): el dueño declinó el unlock; al crear
  `feature/003-login-usuarios` ese trabajo viaja en el working tree y debe
  resolverse (commit separado en la rama o unlock puntual) — se cierra al
  iniciar `implement`, con el dueño.
- `02-DOCS/wiki/sdd/config.yaml` no existe (sdd-init pendiente) — riesgo
  registrado en el doc de la feature; no bloquea el ciclo.

## Tasks
<!-- generated by tasks on 2026-11-17; IDs are stable, do not renumber -->
<!-- Estado: [x] completa · [ ] pendiente. Refleja el ledger de progreso
     (progress/003-login-usuarios.md), que es la fuente de verdad. -->

> Nota de traza (ronda 1 de revisión de T001, hallazgo confirmado): T001
> *contribuye* a AC4/AC5 — prueba que las políticas están aplicadas y
> textualmente correctas (`pg_policies`). Su *prueba conductual* (un
> autenticado ve solo lo suyo) no es construible sin cuentas reales y vive en
> T011. «Anónimo ve 0» es smoke test de RLS-activado, no de políticas.

| ID | Estado | [P] | Task | Done-check | Depends-on | Trace | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T001 | [x] |  | Aplicar migración vía MCP: `movimientos.user_id` (uuid, nullable, FK a `auth.users`) + 4 políticas RLS (`USING`/`WITH CHECK` con `auth.uid() = user_id`) + índice sobre `user_id` | MCP `apply_migration` sin error; `list_tables` verbose muestra columna `user_id` + FK; `pg_policies` muestra las 4 políticas con qual/with_check EXACTAMENTE `(auth.uid() = user_id)`; smoke test de RLS: rol anónimo ve 0 filas (no discrimina políticas) | — | AC2, AC4, AC5 | 2 |
| T002 | [x] | [P] | Implementar lógica pura del bloqueo en `src/auth.js` (TDD: test primero con reloj falso) | `npx vitest run test/auth.test.js` verde (estuvo rojo): 5 fallos → bloqueado 15 min; 6.º intento en ventana → rechazado; éxito → contador a cero | — | AC10 | 2 |
| T003 | [x] | [P] | Implementar session store + middleware `requireSesion` en `src/session.js` (TDD) | `npx vitest run test/session.test.js` verde (estuvo rojo): crear/leer/destruir sesión; sin cookie o sesión inválida → 401 `{"error": "..."}` | — | AC6, AC9 | 2 |
| T004 | [x] |  | Implementar endpoints de auth (`POST /api/registro`, `POST /api/login`, `POST /api/logout`, `GET /api/sesion`) con fakes de auth/db (TDD) | `npx vitest run test/login-api.test.js` verde: registro 201 + cookie; login correcto inicia sesión; credenciales incorrectas → mismo error exista o no el email; email duplicado → 400; logout destruye sesión | T002, T003 | AC1, AC7, AC8, AC9 | 2 |
| T005 | [x] |  | Proteger endpoints de datos existentes con `requireSesion` + cliente scoped por usuario (TDD, fakes por usuario) | `npx vitest run test/login-api.test.js` verde: sin sesión → 401 en los 6 endpoints de datos; dos usuarios con fakes separados no ven los movimientos del otro; saldo/resumen/CSV computan sobre el set propio | T003, T004 | AC3, AC4, AC5, AC6 | 2 |
| T006 | [x] |  | Cablear el bloqueo al login (TDD integration) | `npx vitest run test/login-api.test.js -t "bloqueo"` verde: tras 5 fallos, el 6.º intento se rechaza aunque las credenciales valgan, con minutos restantes en el mensaje | T002, T004 | AC10 | 2 |
| T007 | [ ] |  | Implementar recuperación: `POST /api/recuperar` + `POST /api/recuperar/confirmar` (TDD, fake de auth) | `npx vitest run test/login-api.test.js -t "recuperar"` verde: pedir recuperación → respuesta idéntica exista o no el email; confirmar con código válido → login con la nueva password funciona, la vieja no, y las sesiones activas quedan cerradas | T004 | AC11, AC12 | 2 |
| T008 | [ ] | [P] | Implementar claim del dato huérfano: la primera cuenta adopta las filas `user_id IS NULL` (service key, idempotente) (TDD) | `npx vitest run test/login-api.test.js -t "hereda"` verde: primera cuenta → fila huérfana con su `user_id`; segunda cuenta no hereda nada | T001, T004 | AC2 | 2 |
| T009 | [x] |  | Frontend `public/login.html`: acceso + registro con mensajes de error del API | Con `npm start`: `login.html` sirve 200; manual documentado: labels visibles, navegable por teclado, modo oscuro, muestra `{"errores": [...]` del API | T004 | AC1, AC7, AC8 | 2 |
| T010 | [ ] | [P] | Frontend `public/reset.html` (nueva contraseña) + gating en `index.html` (401 → login, botón logout) | Con `npm start`: `reset.html` sirve 200; `index.html` sin sesión redirige a login; con sesión muestra logout y al pulsarlo vuelve al login | T004, T007 | AC6, AC9, AC11 | 1 |
| T011 | [ ] |  | Verificación en vivo + config Supabase: confirmación de email desactivada, redirect del enlace de reset; dos cuentas reales aisladas, un reset real, bloqueo real | Evidencia en el doc de la feature: registro+login de 2 cuentas reales; A no ve datos de B (RLS real); reset por email completo; 6.º intento bloqueado en vivo | T001–T010 | AC1–AC12 | 2 |
| T012 | [ ] |  | Cierre: suite completa verde + documento de feature con secciones y métricas al día | `npm test` verde (51 existentes + nuevos); doc `features/003-login-usuarios.md` con Desarrollo/Revisión/Verificación cerrados y tabla de métricas completa | T001–T011 | AC1–AC12 | 1 |

**T004 — Interfaces**
- Consumes: `auth.registrar(email, password) -> { usuario, tokens } | EmailYaRegistrado | ContraseñaInvalida`;
  `auth.login(email, password) -> { usuario, tokens } | CredencialesInvalidas`;
  `sesion.crear(tokens, usuario) -> idSesion`; `sesion.destruir(idSesion) -> void`
- Produces: `POST /api/registro` → `201 {usuario}` + `Set-Cookie: sid=…; HttpOnly; SameSite=Lax` | `400 {"errores": [...]}`;
  `POST /api/login` → `200 {usuario}` + cookie | `401 {"error": "credenciales incorrectas"}`;
  `POST /api/logout` → `204` + cookie expirada; `GET /api/sesion` → `200 {usuario}` | `401 {"error": "..."}`

**T005 — Interfaces**
- Consumes: `requireSesion(req, res, siguiente)` (T003) — adjunta `req.dbCliente` scoped;
  contrato async existente de `db` (`listarMovimientos`/`crearMovimiento`/`eliminarMovimiento`), sin cambio de firma
- Produces: los 6 endpoints de datos (`GET/POST/DELETE /api/movimientos…`, `GET /api/saldo`, `GET /api/resumen`)
  tras `requireSesion`; sin sesión → `401 {"error": "no autenticado"}`; con sesión → formas de respuesta existentes intactas

**T006 — Interfaces**
- Consumes: bloqueo puro de T002: `decidirBloqueo(email, ahora) -> null | {minutosRestantes}`,
  `registrarFallo(email, ahora) -> void`, `reiniciar(email) -> void`
- Produces: `POST /api/login` en ventana de bloqueo → `429 {"error": "cuenta bloqueada, reintenta en N minutos"}`
  (mismo cuerpo aunque las credenciales sean correctas; login exitoso → `reiniciar(email)`)

**T007 — Interfaces**
- Consumes: `auth.pedirRecuperacion(email) -> void` (respuesta siempre genérica);
  `auth.confirmarRecuperacion(codigo, nuevaPassword) -> void | EnlaceInvalidoOExpirado | ContraseñaInvalida`
- Produces: `POST /api/recuperar` → `200 {"ok": true}` exista o no el email;
  `POST /api/recuperar/confirmar` → `204` | `400 {"errores": [...]}`; al confirmar, todas las sesiones
  de esa cuenta quedan destruidas en el session store

**T008 — Interfaces**
- Consumes: cliente service key (solo para el claim); condición de primera cuenta
  (`count(auth.users) == 0` antes del registro en curso)
- Produces: `claimHuerfanos(user_id) -> n` — `UPDATE movimientos SET user_id = $1 WHERE user_id IS NULL`,
  idempotente (segunda llamada → 0); invocado una sola vez desde el flujo de registro

**T009/T010 — Interfaces**
- Consumes: los contratos HTTP de T004–T007 (formas de error `{"errores": [...]}` / `{"error": "..."}`);
  `GET /api/sesion` para decidir redirect
- Produces: páginas estáticas sin dependencias de build; `index.html` redirige a `login.html` ante 401

## Review Workload Forecast

| Dimension | Forecast | Why |
| --- | --- | --- |
| Líneas estimadas | ~600–800 | src ~250 (auth, session, app, db), tests ~350 (3 archivos nuevos), public ~150, docs |
| Archivos / áreas | 11 + docs | `src/auth.js`, `src/session.js`, `src/app.js`, `src/db.js`, `public/login.html`, `public/reset.html`, `public/index.html`, 3 tests nuevos, migración MCP (sin archivo local), doc de feature |
| Riesgo | tier 2; 10 de 12 tareas tier 2 | auth es clase tier 2 por defecto (src/auth.js, session, db.js, login.html y sus tests); cada tarea tier 2 pasa por el panel de 3 y el ship espera al humano |
| Entrega sugerida | ask-on-risk | el diff estimado supera el line budget por defecto (400); la feature es cohesiva (partirla cortaría la cadena TDD), pero el dueño decide al llegar a ship |
