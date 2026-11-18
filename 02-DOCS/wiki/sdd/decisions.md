# Decisiones SDD — log (append-only)

Toda decisión significativa: fecha, opciones consideradas, elección y por qué.

| Fecha | Decisión | Opciones consideradas | Elección | Por qué |
|---|---|---|---|---|
| 2026-11-06 | Herramienta SDD del piloto | Spec Kit / OpenSpec / SDD Method / cc-sdd / RSC Harness | **RSC Harness** (`@ericrisco/rsc`) | Es la que ya se usó en piloto-rsc; specs numeradas spec/plan/tasks con EARS |
| 2026-11-06 | Alcance del mini-proyecto | registro+resumen / +presupuestos / +cuentas múltiples | **Registro + resumen** | Piloto pequeño pero con sustancia |
| 2026-11-06 | Interfaz y persistencia | CLI / API / Web app; JSON / SQLite / memoria | **Web app + SQLite** | Pedido del dueño; realismo sin exceso |
| 2026-11-06 | Workflow de código | main directo / ramas+PR | **Ramas + PR** | Igual que piloto-rsc; main cerrada |
| 2026-11-06 | Merge gate | siempre humano / auto-merge | **Auto-merge si verify pasa** y sin hallazgos bloqueantes | Menos fricción; verify es la puerta |
| 2026-11-06 | Barra de calidad | tests / tests+linter | **Tests Vitest en verde** | Suficiente para el piloto; linter sería enmienda |
| 2026-11-06 | Reglas de documentación | — | **Aprobadas** (`REGLAS-DOCUMENTACION.md`): un doc por feature, cierre de paso documentado y commiteado, métricas de tiempos/tokens/costo por paso (el agente los obtiene de las transcripciones) | Trazabilidad del método antes de escalar |
| 2026-11-06 | Feature 001 | presupuestos / filtro por mes / edición / exportar CSV | **Exportar a CSV** | Primer ciclo SDD corto y medible |
| 2026-11-06 | Dónde se genera el CSV (001) | en el navegador con el JSON / en el servidor con ruta nueva | **En el servidor** (`GET /api/movimientos/csv` + generador puro) | Un solo generador testeable (unit + integration); el navegador solo descarga |
| 2026-11-06 | Formula injection en CSV (001) | ignorar / sanitizar | **Sanitizar**: prefijar `'` en celdas que empiezan con `= + - @` | Práctica estándar; evita que Excel ejecute fórmulas desde datos del usuario |

## 2026-11-13 — Feature 002: el disparador del SDD pasa a ser un issue de GitHub

- **Decisión**: el flujo SDD se dispara desde issues de GitHub (issue plano, sin
  etiquetas), detectados al abrir sesión con una oferta no bloqueante de una
  línea. Sin automatismo programado (decisión del dueño). Promoción desde FTD:
  `rsc risk` tier 2 por tocar `.claude/` (harness) exige spec aprobada.
- **Opciones consideradas**: (a) prompt tipeado como hasta hoy — no deja
  artefacto durable; (b) issue con etiqueta `sdd` — filtrado innecesario para un
  repo personal; (c) polling programado — más costo en tokens y menos control
  humano, descartado por el dueño.
- **Por qué**: el issue versiona la idea, la desacopla del momento de
  desarrollo y se vincula de punta a punta (spec `issue: N`, PR `Closes #N`).

## 2026-11-13 — Feature 002 (revisión): vigilante local + autopilot

- **Decisión**: el disparador evoluciona a pedido del dueño — un vigilante
  local detecta issues nuevos (polling ≤ 2 min) y abre solo una ventana de
  PowerShell con Claude Code corriendo la cadena SDD en autopilot. El hook de
  detección al abrir sesión pasa a ser fallback. El auto-merge queda fuera:
  el PR espera al humano (tier 2).
- **Opciones consideradas**: (a) GitHub Actions en la nube — descartado: el
  harness rsc no corre allá y el costo por token no usa la suscripción;
  (b) comando semi-manual — descartado: el dueño quiere cero pasos manuales
  tras crear el issue.
- **Por qué**: crear el issue debe ser el único paso manual del dueño.

## 2026-11-16 — CLAUDE.md: métricas por paso y trazabilidad prompt → spec → plan

- **Decisión**: la sección «Convenciones» de CLAUDE.md (lo que el agente carga
  en cada sesión) pasa a exigir lo que REGLAS-DOCUMENTACION.md ya mandataba:
  bloque de métricas por paso (inicio/fin, duración, tokens, intervenciones)
  y registro del prompt inicial con la spec y el plan que produjo. Se corrige
  de paso la ruta de las specs (`specs/` → `02-DOCS/wiki/sdd/specs/`; la
  carpeta raíz nunca existió en este repo).
- **Excepción al gate, autorizada por el dueño**: `rsc risk` marcó tier 2
  (CLAUDE.md = capa harness), lo que exige rama + spec gate + panel de 3.
  El dueño eligió desbloquear main (`rsc main unlock`) y hacer el cambio
  directo, sin PR ni panel. Queda registrado aquí como decisión consciente,
  no como omisión.
- **Opciones consideradas**: (a) rama feature/003 + spec + gate + panel —
  ceremonia completa para una edición de documentación; (b) desbloquear main
  y editar directo — elegida por el dueño.
- **Por qué**: cambio de solo documentación, revisable a ojo en el diff;
  la fricción del tier 2 no compra protección adicional aquí (P7).

## 2026-11-17 — Enmienda v1.1.0 de la constitución: alineación tras la migración a Supabase

- **Decisión**: el dueño revisa la constitución y la enmienda (v1.0.0 →
  v1.1.0): P1 stack swap better-sqlite3 → Supabase (PostgreSQL); P7
  privacidad reescrita — los datos viven en la nube de Supabase con RLS
  activado y la service key solo en el servidor; P9 y DoD sin referencias a
  SQLite/`data/`. P5 ratificada sin cambios: **main se re-cierra** — el unlock
  del 2026-11-16 queda como excepción registrada, no como estado permanente.
  Auth pasa a camino always-human en REVIEW.md, con `src/db.js` elevado en
  `.rsc/sello-config.json` → `risk.raise` (los archivos `auth|login|session`
  ya eran tier 2 en la tabla por defecto de `rsc risk`).
- **Opciones consideradas**: P5 — re-cerrar (elegida) vs enmendar a abierta;
  P7 — aceptar nube con RLS (elegida) vs exigir datos solo locales (implicaba
  revertir la migración); always-human auth — agregar ya antes del login
  (elegida) vs esperar a que aterrice la feature.
- **Por qué**: la constitución citaba un stack que ya no existe y una postura
  de privacidad que la migración misma había violado; un documento de
  non-negotiables que miente no protege nada. El re-cierre de main restaura el
  flujo branch→PR→ship que el piloto debe medir.

## 2026-11-17 — Feature 003 (login): alcance decidido en la ronda de frontera

- **Decisión**: el login es **multi-usuario real** con registro abierto y
  aislamiento de datos por cuenta (RLS en la base, no solo filtro del
  servidor); el movimiento preexistente lo hereda la primera cuenta que se
  registre; el ciclo corre en modo **paso a paso** (aprobación del dueño en
  cada fase).
- **Opciones consideradas**: contraseña única compartida (descartada: sin
  cuentas ni aislamiento) / login sin aislamiento (descartada: cada quien
  vería las finanzas del otro); registro cerrado (descartado: más ceremonia
  que valor en el piloto); dato actual huérfano o borrado (descartados por el
  dueño); autopilot (descartado: el dueño quiere aprobar cada fase).
- **Por qué**: es la primera feature de producto tras la migración a Supabase
  y la primera que ejercita la constitución v1.1.0 (P7: RLS) y el camino
  always-human de auth; el multi-usuario real es lo que hace que valga.

## 2026-11-17 — Feature 003 (revisión de spec): el bloqueo por intentos fallidos entra al alcance

- **Decisión**: el dueño revisa el draft de la spec y contradice la decisión
  diferida — el **bloqueo por intentos fallidos** (anti fuerza bruta) pasa al
  alcance del ciclo: Goals, Behaviour y un criterio de aceptación nuevos.
  Los parámetros (nº de intentos y duración del bloqueo) quedan como pregunta
  abierta para `clarify` (recomendación: 5 intentos → 15 min, por email).
- **Opciones consideradas**: mantener diferido (elegido primero por «solo lo
  necesario»; revertido por el dueño) vs. incluirlo (elegido: sin bloqueo, un
  atacante puede probar credenciales por fuerza bruta sin costo).
- **Por qué**: el login sin límite de intentos es la puerta más fácil de
  atacar de toda la app; el dueño lo consideró parte del requisito, no un
  extra.

## 2026-11-17 — Feature 003 (clarify): parámetros cerrados y recuperación entra al alcance

- **Decisión**: ronda de clarify con el dueño — contraseña con longitud
  mínima de 8 (sin complejidad teatral); bloqueo tras 5 intentos fallidos por
  15 minutos, contado por email; sesión persistente hasta logout confirmada;
  y la **recuperación de contraseña por email entra al alcance** (estaba como
  non-goal; el dueño la pidió dentro del ciclo). El cambio de contraseña
  autenticado sigue fuera.
- **Opciones consideradas**: contraseña 8 vs 12 vs sin mínimo; bloqueo 5→15
  vs 3→30 vs 10→5; sesión persistente vs con expiración; recuperación dentro
  vs fuera del ciclo.
- **Por qué**: el dueño prefiere margen razonable contra fuerza bruta sin
  fricción de usuario legítimo, y considera la recuperación parte de un login
  completo, no un extra.

## 2026-11-17 — Feature 003 (plan): identidad en Supabase Auth y aislamiento por cliente scoped al usuario

- **Decisión**: la arquitectura del login usa **Supabase Auth** como dueño
  de identidades (hashing, JWT, email de recuperación — nunca tocamos
  contraseñas) y accede a los datos con un **cliente Supabase scoped al
  usuario por petición**, de modo que el aislamiento lo imponen las
  **políticas RLS en la base** (`auth.uid() = user_id`), no un filtro en el
  servidor. Sesión propia en memoria del servidor (cookie httponly con id
  aleatorio → tokens Supabase); bloqueo anti fuerza bruta con lógica pura
  inyectable; la service key queda reservada a migración y al claim del dato
  huérfano por la primera cuenta.
- **Opciones consideradas**: (a) service key + `WHERE user_id` en el
  servidor — rechazada: la spec exige aislamiento real en la base y un bug
  de filtro filtra finanzas ajenas; (b) tabla `usuarios` propia con bcrypt —
  rechazada: re-implementa hashing/reset/bloqueo ya dados y auditados, y
  complica keyear RLS sin `auth.uid()`.
- **Por qué**: cumple la constitución P7 y la spec §What it must respect al
  pie de la letra; minimiza superficie criptográfica propia en un camino
  always-human.

## 2026-11-17 — Feature 003 (análisis): hallazgo 1 resuelto, demás MEDIUM aceptados

- **Decisión**: el dueño resuelve el hallazgo 1 del análisis de consistencia
  (`analysis/003-login-usuarios.md`) aceptando la limitación: el session
  store vive en memoria del servidor y **reiniciar el servidor cierra todas
  las sesiones**. Aceptable porque la app corre local; revisar al desplegar
  a un servidor real. Los hallazgos MEDIUM 2–5 (done-checks finos) se
  aceptan tal cual, sin cambios. Registrado en la spec (suposición de sesión
  + Revisions).
- **Opciones consideradas**: registrar la limitación aceptada (elegida) vs
  mover el session store a persistente (más costo, innecesario en local) vs
  dejarlo solo como riesgo del plan (la spec quedaría prometiendo algo que el
  plan no cumple).
- **Por qué**: la spec y el plan vuelven a decir lo mismo; el día que haya
  despliegue real, la spec misma señala qué revisar.

## 2026-11-17 — vitest.config.js excluye worktrees de agentes (feature: 003, implement)

- Contexto: los developers paralelos trabajan en worktrees bajo
  `.claude/worktrees/`; vitest descubría sus copias de los tests (sin `.env`,
  gitignored) y la barra de merge (P2) contaba archivos ajenos al árbol real.
- Opciones: excluir por config (elegida) vs filtrar por comando en cada
  corrida vs prohibir worktrees dentro de la carpeta del proyecto.
- Decisión: `vitest.config.js` con `exclude` de `.claude/worktrees/**`
  (mantiene los excludes default de node_modules y dist).
- Por qué: el cambio vive con el proyecto, aplica a toda corrida futura y no
  debilita ningún test — solo acota el descubrimiento al árbol real.

## 2026-11-17 — Semántica del ciclo de vida del bloqueo (feature: 003, T002, ronda 2)

- Contexto: dos lentes del panel de T002 marcaron comportamientos sin
  decidir: la ventana se re-extiende con cada fallo posterior al 5.º
  (bloqueo indefinido posible) y el contador no se reinicia al expirar (1
  typo tras esperar 15 min = re-bloqueo inmediato).
- Opciones: (a) ventana fija desde el 5.º fallo + ciclo fresco al expirar
  (elegida); (b) ventana deslizante que se extiende con cada fallo; (c)
  contador persistente entre ciclos.
- Decisión: `registrarFallo` es no-op durante bloqueo activo (la ventana no
  se mueve — el caller ya rechazó el intento); `decidirBloqueo` elimina la
  entry al detectar la ventana expirada, de modo que el ciclo siguiente
  arranca con 5 intentos frescos. Además: la clave del contador es el email
  normalizado (trim + lowercase, como Supabase Auth) y el registro tiene
  cota (barrido de expiradas + evicción de la más antigua) contra DoS de
  memoria.
- Por qué: castiga al atacante (ventana fija, sin bypass por variaciones de
  email) sin castigar doble al legítimo (esperar los 15 min devuelve los 5
  intentos); la cota evita que el estado anti-ataque sea en sí el vector de
  DoS.

## 2026-11-17 — Evicción respeta el bloqueo activo (feature: 003, T002, ronda 3)

- Contexto: hallazgo F3 (BLOCKER) de la ronda 2 — `mantenerCota` evicta la
  primera clave del Map sin mirar `bloqueadoHasta`, de modo que un atacante
  bloqueado (1.ª clave) se des-bloquea al llenar el registro con ~1000 emails
  desechables, violando AC10. El test F3 original asentaba el comportamiento
  buggy (`decidirBloqueo(base, ...).toBeNull()` tras llenar el Map).
- Decisión: la víctima de evicción es la entry más antigua **no bloqueada
  activamente** (`bloqueadoHasta === null || ahora >= bloqueadoHasta`). Si
  todas las entries están bloqueadas activamente, no se evicta nada y el Map
  crece temporalmente — nunca se des-bloquea a un atacante para ahorrar
  memoria. El test F3 se corrigió para asentar que `base` sigue bloqueada.
- Por qué: la cota protege contra DoS de memoria, pero no a costa de regalar
  el bloqueo al atacante que la provoca; el crecimiento temporal acotado por
  la ventana de bloqueo es aceptable.
- Nota (pin F2): el pin del barrido de expiradas usa **dos** entries expiradas
  (EXP1, EXP2) en vez de una, porque tras el fix F3 la evicción por sí sola ya
  reclama una entry expirada (es «no bloqueada activamente» y la más antigua).
  Con una sola expirada el mutante «elimina el loop de barrido» no es
  observable: barrido y evicción reclaman la misma entry. Con dos, el barrido
  reclama ambas (la 2.ª arranca fresca luego) y la evicción sola solo reclama
  una (la 2.ª lingería con `fallos=5` y un fallo posterior la re-bloquearía al
  instante). Esa diferencia es lo que el pin asienta.

## 2026-11-17 — Fix ronda 4: la entry recién insertada no se evicta a sí misma (feature: 003, T002, ronda 4)

- Contexto: BLOCKER confirmado y reproducido por el verificador —
  `registrarFallo` inserta la entry nueva (con `bloqueadoHasta === null`) y
  **después** llama `mantenerCota`. La entry nueva es siempre candidata a
  víctima de evicción. Con el Map saturado de entries activamente bloqueadas
  (atacante bloquea ~999 emails señuelo con 5 fallos c/u), la evicción salta
  todas las bloqueadas y encuentra SOLO la nueva → la evicta →
  `entry.fallos += 1` corre sobre el objeto detached → el fallo se pierde →
  ningún email nuevo puede acumular fallos → AC10 desactivada para emails
  nuevos durante la ventana de saturación. El verificador lo reprodujo: con
  saturación, 10 fallos no bloquean; sin ella, 5 bastan.
- Decisión: `mantenerCota` recibe la clave recién insertada y el loop de
  evicción la salta (`if (k === claveRecienInsertada) continue`). Así la
  entry nueva NUNCA es víctima de su propia inserción. Mínimo código: un
  parámetro con default `null` (backward-compatible) y un `continue`.
- Trade-off materializado: la entrada «Evicción respeta el bloqueo activo»
  (ronda 3) documenta que «si todas las entries están bloqueadas activamente,
  el Map crece temporalmente». **Antes de este fix ese trade-off era
  inalcanzable** — la entry nueva siempre se evictaba, así que el Map nunca
  crecía por encima de MAX_REGISTRO. **Con este fix, el crecimiento temporal
  del Map bajo saturación total se materializa de verdad**: si todas las
  demás entries están bloqueadas activamente, el Map crece a lo sumo hasta
  que las ventanas expiren y el barrido reclame. Nunca se pierde un fallo,
  nunca se des-bloquea a un atacante. Autorizado explícitamente por el dueño
  (el presupuesto automático de 3 rondas estaba agotado; el humano cerró la
  entrada de la cola de decisiones con un «sí»).
- Por qué: la cota protege contra DoS de memoria, pero no a costa de regalar
  el bloqueo ni de perder fallos legítimos; el crecimiento temporal acotado
  por la ventana de bloqueo es aceptable y ahora es real.

## 2026-11-18 — user_id en el insert desde la sesión vs trigger de base (feature: 003-login-usuarios, task: T005)

- Contexto: `crearMovimiento` del repositorio scoped (`dbPara`) hacía
  `.insert({ tipo, monto, categoria, fecha, descripcion })` sin `user_id`.
  Con el cliente scoped, el INSERT queda sujeto a la política RLS
  `movimientos_insert_propios` con `WITH CHECK (auth.uid() = user_id)`; no hay
  trigger ni default que pueble `user_id` → NULL → el check falla → PostgREST
  rechaza → 500 en vez del 201 contratado. Todo INSERT autenticado roto en
  producción.
- Options:
  1. Fix en capa de aplicación: `dbPara` recibe la identidad del usuario
     (`dbPara(tokens, usuario)`) y `crearMovimiento` del repo scoped incluye
     `user_id: usuario.id` en el insert. RLS sigue validando el valor.
  2. Trigger de base: `BEFORE INSERT ON movimientos SET user_id = auth.uid()`
     para que la columna se pueble automáticamente desde el JWT.
- Decision: opción 1 (fix en capa de aplicación).
- Why: el fix de aplicación es testeable con los fakes en memoria existentes
  sin requerir migración de base ni acceso a Supabase; el RED/GREEN se cierra
  en la suite local. RLS sigue siendo la frontera real: si el `user_id`
  enviado no coincide con el JWT, `WITH CHECK` lo rechaza igual (defensa en
  profundidad). El trigger (opción 2) queda como alternativa futura si se
  quiere un cinturón extra a nivel de base.

## 2026-11-18 — confirmarRecuperacion devuelve { usuario } para destruir sesiones (feature: 003-login-usuarios, task: T007)

- Contexto: `POST /api/recuperar/confirmar` debe destruir todas las sesiones
  activas de la cuenta tras completar el reset (AC11). Para ello necesita el
  `usuarioId` — pero el endpoint solo recibe `{ codigo, password }`, no sabe
  de quién es la cuenta. El wrapper `auth.confirmarRecuperacion` sí puede
  obtenerlo del SDK: `verifyOtp({ token_hash, type: 'recovery' })` devuelve
  `{ data: { user } }` con el usuario verificado.
- Options:
  1. `confirmarRecuperacion` devuelve `void` y el endpoint obtiene el
     usuarioId por separado (p. ej. decodificando el JWT del código).
  2. `confirmarRecuperacion` devuelve `{ usuario }` — el wrapper ya tiene el
     usuario de `verifyOtp` y lo retorna al endpoint.
  3. `confirmarRecuperacion` devuelve el usuarioId plano (string).
- Decision: opción 2 — `confirmarRecuperacion` devuelve `{ usuario: { id, email } }`.
- Why: el wrapper ya obtiene el usuario en `verifyOtp`; devolverlo evita
  decodificar JWTs o hacer una segunda llamada. La forma `{ usuario }` es
  consistente con `registrar` y `login` (que también devuelven `{ usuario, ... }`).
  El endpoint usa `usuario.id` para `sesion.destruirTodasDe(usuario.id)`.

## 2026-11-18 — AuthNoDisponible: errores transitorios no cuentan bloqueo (feature: 003-login-usuarios, task: T007)

- Contexto: `auth.login` lanzaba `CredencialesInvalidas` para CUALQUIER error
  de `signInWithPassword` — incluidos rate limits, red, timeouts. El bloqueo
  de T006 contaba esos errores transitorios como fallos del usuario: una
  víctima con credenciales CORRECTAS podía quedar bloqueada tras 5 incidentes
  de Supabase.
- Options:
  1. Mantener el comportamiento actual (todo error = `CredencialesInvalidas`).
  2. Distinguir en `auth.login`: "Invalid login credentials" →
     `CredencialesInvalidas`; cualquier otro error → nueva clase
     `AuthNoDisponible`. En `app.js`, `AuthNoDisponible` → 401 genérico
     (AC7 intacto) SIN `registrarFallo`.
  3. Reintentar automáticamente los errores transitorios antes de responder.
- Decision: opción 2.
- Why: la opción 1 deja el bug (víctima bloqueada por fallos ajenos). La
  opción 3 añade complejidad y latencia impredecible; el reintento pertenece
  a la capa de infraestructura, no al handler. La opción 2 es mínima: una
  nueva clase exportada, un regex sobre `error.message` (Supabase usa
  "Invalid login credentials" para credenciales incorrectas), y un branch
  explícito en el catch de login que devuelve 401 genérico sin tocar el
  contador. AC7 se preserva: mismo 401 y mismo cuerpo exista o no el email.

## 2026-11-18 — Feature 003, T007 ronda 2: done-check cubre los tests D2

- **Decisión**: el done-check de T007 se enmienda a `-t "recuperar|D2"` (regex)
  en lugar de `-t "recuperar"`. El filtro original se saltaba los 2 tests del
  fix D2 (describe sin "recuperar" en el nombre), dejando un mutante
  (AuthNoDisponible llamando registrarFallo) sobrevivir el done-check.
- **Por qué no renombrar el describe D2**: D2 trata de login/bloqueo, no de
  recuperar; renombrar para cazar el filtro sería distorsión semántica.
- **Conteo**: el comando enmendado pasa 10 tests (8 recuperación + 2 D2), no
  9 como se anticipó — el test nuevo de F1 (camino de error de AC12) también
  coincide con "recuperar". El filtro es correcto; el conteo creció con F1.

## 2026-11-18 — T008: claim del dato huérfano — dónde vive la detección de primera cuenta y trade-offs (feature: 003-login-usuarios, task: T008)

- **Dónde vive `esPrimeraCuenta`**: en `src/auth.js` (como `auth.esPrimeraCuenta()`),
  no en `src/db.js`. Razón: consulta `auth.users` (estado de Auth) y el fake de
  auth ya trackea `usuarios` en memoria — el fake puede implementarlo trivialmente
  como `usuarios.size === 0`. Usa el service key vía lazy import de `src/db.js`
  (`supabase.auth.admin.listUsers()`), consistente con `auth.logout` que ya hace
  lo mismo. `claimHuerfanos` vive en `src/db.js` (sobre el singleton service key)
  porque opera sobre la tabla `movimientos`.
- **Por qué el claim no rompe el registro si falla**: el claim se invoca en un
  try/catch separado dentro del handler de registro. Si `claimHuerfanos` lanza,
  se loguea server-side (`console.error`) y el registro prosponde normalmente
  (201 + cookie). La cuenta ya existe en Supabase Auth; el claim es
  recuperable y verificable posteriormente (T011, verificación en vivo).
  Trade-off: la fila huérfana quedaría sin dueño hasta una intervención manual
  — aceptable porque el claim es una sola vez y verificable.
- **Trade-off de la carrera (evaluar el conteo antes del signUp)**:
  `esPrimeraCuenta()` se evalúa ANTES de `auth.registrar()` para minimizar la
  ventana de carrera. Dos registros concurrentes podrían ver ambos 0 usuarios
  y ambos intentar el claim. Esto es seguro porque el claim es idempotente
  (`WHERE user_id IS NULL`): el segundo claim no encuentra filas huérfanas
  (el primero ya las adoptó) y devuelve 0. Registro + claim no son
  transaccionales entre sí — aceptable, registrado en los riesgos del plan.
