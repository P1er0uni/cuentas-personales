# Progress — 003-login-usuarios

> Ledger append-only del ciclo `implement`. Fuente de verdad para reanudar:
> una tarea con `status: complete` aquí está HECHA — nunca re-despachar.

## Pre-ciclo — 2026-11-17

- sdd-init ejecutado dentro del gate de `implement` (config.yaml faltante):
  `02-DOCS/wiki/sdd/config.yaml` escrito (stack node/express/supabase, npm,
  Vitest, strict_tdd: true, interactive) y registro refrescado (273 skills).
- Decisión de git (dueño): el trabajo pendiente de main viaja como **commit
  separado rotulado** en `feature/003-login-usuarios`; sin unlock.
- Pendiente de ejecutar cuando el clasificador de permisos responda:
  `git switch -c feature/003-login-usuarios` + 3 commits (trabajo previo de
  main / gobernanza v1.1.0 / artefactos de la feature).

## T001 — 2026-11-17
- status: in_progress
- tarea: migración MCP — `movimientos.user_id` (uuid, nullable, FK
  `auth.users`, ON DELETE CASCADE) + 4 políticas RLS (`auth.uid() = user_id`)
  + índice `movimientos_user_id_idx`.
- bloqueo transitorio: clasificador de permisos caído; la llamada
  `apply_migration` está lista para reintentar.

## T001 — cierre ronda 1 — 2026-11-17
- status: complete
- done: migración aplicada; `pg_policies` verificó las 4 políticas con
  predicados EXACTOS `(auth.uid() = user_id)`; anónimo ve 0 filas (smoke de
  RLS); columna + FK visibles en `list_tables`.
- risk: tier 2 (migración/RLS de datos personales) — panel de 3.
- review ronda 1/3: correctness **PASS** (13 ataques a ciegas) · security
  **PASS** (16 vectores) · tests **3 hallazgos** (1 should-fix + 2
  questions, todos contra el texto del done-check). Consolidate: 3 únicos;
  F1 verificado por finding-verifier → **CONFIRMED**. Fix de clase: done-check
  de T001 enmendado en el plan (pg_policies con predicado exacto + «anónimo
  ve 0» marcado como smoke + nota de traza contribuye/prueba). L1/L2/L3
  `fixed` en ledger; panel registrado en bc9df73.
- controls: tests ✅ 66/66 (tras integrar T002/T003) · build ✅ (sin paso de
  build; la suite carga todos los módulos) · security ✅ (lente security del
  panel; `.env` verificado gitignored y jamás commiteado) · traceability ✅
  (AC2/AC4/AC5, con nota contribuye/prueba).

## T002 — 2026-11-17
- status: built (review pendiente)
- red: `test/auth.test.js` 2 failed | 4 passed (stub primero; fallo en
  aserción, no en import).
- green: 6/6 (5 fallos → 15 min; ventana a 1 min → minutosRestantes 1;
  reiniciar a cero; expirada → null; antes de 5 → null; por email aislado).
- files: `src/auth.js`, `test/auth.test.js` · commit 0d2b57d (worktree) →
  cherry-pick **bc9df73** en feature/003-login-usuarios.
- risk: tier 2 (clase auth) — panel pendiente.

## T003 — 2026-11-17
- status: built (review pendiente)
- red: `test/session.test.js` 6 failed | 3 passed (stub) → green 9/9.
- files: `src/session.js`, `test/session.test.js` · commit d4db94a
  (worktree) → cherry-pick **12ad95a**.
- contrato: crear/leer/destruir/destruirTodasDe/requireSesion/
  cookieDeRespuesta; cookie `sid` HttpOnly SameSite=Lax; sin dependencias
  nuevas (randomUUID + parseo manual de Cookie).
- risk: tier 2 (clase session) — panel pendiente.

## Infra del ciclo — 2026-11-17
- `vitest.config.js` nuevo: excluye `.claude/worktrees/**` del
  descubrimiento de tests (los worktrees de agentes paralelos no tienen
  `.env` y contaminaban la barra P2). Suite combinada tras integrar
  T002+T003: **66/66 verde, 8 archivos**.

## T002 — ronda 1 de revisión — 2026-11-17
- Panel de 3: correctness PASS + 1 question · security 3 hallazgos (2
  should-fix + 1 question) · tests 3 hallazgos (2 should-fix + 1 nit).
- Consolidate: 6 únicos; los 4 should-fix verificados por finding-verifier →
  **4 CONFIRMED** (normalización de email, mutante ceil/round, Map sin cota,
  mutante delete/clear). Registrados en ledger como L4–L10.
- Fix de ronda 2 despachado (worktree): normalizar key, cota con barrido de
  expiradas + evicción de la más antigua, semántica de ciclo de vida
  (fallo en bloqueo activo no extiende; expirada la ventana, ciclo fresco de
  5), y 6+ tests nuevos que matan los mutantes.

## T003 — ronda 1 de revisión — 2026-11-17
- Panel de 3: security PASS (14 vectores) · tests 4 hallazgos (2 should-fix
  + 2 nits) · correctness PASS + 1 nit.
- Consolidate: 5 únicos; los 2 should-fix verificados → **2 CONFIRMED**
  (id no adivinable sin falsificar; destruir sin multi-sesión). Producción
  correcta en ambos — son gaps de tests. Registrados como L11–L15.
- Fix de ronda 2 despachado (worktree): pins anti-mutante (UUID v4 regex +
  unicidad, destruir multi-sesión, Path=/, contador de siguiente) y trim
  individual de clave/valor en parsearCookie (único cambio de producción).

## T002 — ronda 2 (fixes) — 2026-11-17
- Fix integrado: **6136262** — normalización de email (trim+lowercase) en las
  tres funciones; `registrarFallo` no-op durante bloqueo activo;
  `decidirBloqueo` elimina entry al expirar (ciclo fresco de 5); cota
  `MAX_REGISTRO = 1000` con barrido de expiradas + evicción de la más
  antigua. 7 tests nuevos (4 de comportamiento en RED primero; 3 guard
  tests anti-mutante). Auth 13/13.
- Nota: el developer registró también la decisión en decisions.md desde su
  worktree; se descartó ese commit (28a39f6) porque la entrada ya existía en
  el árbol principal — sin duplicar el log.

## T003 — ronda 2 (fixes) — 2026-11-17
- Fix integrado: **3a708aa** — pins anti-mutante (50 ids únicos con formato
  UUID v4; destruir multi-sesión con B sobreviviendo; Path=/ asentado;
  contador de siguiente = 1) y parseo de cookie tolerante a espacios (RED →
  fix → GREEN). Session 12/12.

## Estado de suite tras ronda 2 — 2026-11-17
- `npm test`: **76/76 verde, 8 archivos** (51 base + 13 auth + 12 session).
- Ronda 2 de revisión abierta para T002 y T003 (solo diff nuevo).

## T003 — cierre ronda 2 — 2026-11-17
- status: **complete**
- Panel de ronda 2 (solo diff nuevo 3a708aa): security **PASS** (7 vectores)
  · correctness **PASS** (8 ataques) · tests **PASS** (5 mutantes de ronda 1
  muertos + mutantes nuevos del fix muertos). Cero hallazgos en los tres
  lentes. Panel registrado en 65b048b.
- Controls: tests ✅ 12/12 session, suite 76/76 · build ✅ · security ✅
  (lente del panel) · traceability ✅ (AC6/AC9: store probado; endpoints en
  T004/T005).

## T002 — ronda 2 de revisión (parcial) — 2026-11-17
- correctness y security convergen en **1 should-fix**: `mantenerCota`
  evicta la entry más antigua sin verificar bloqueo activo — un atacante
  bloqueado puede des-bloquearse llenando el Map con ~1000 emails
  desechables (bypass introducido por el propio fix de la cota). Pendiente:
  lente tests de ronda 2; luego consolidate + verify + fix en ronda 3.

## T002 — cierre ronda 2 — 2026-11-17
- Panel completo: security 1 should-fix · correctness 1 should-fix (mismo
  defecto, convergido) · tests 2 should-fix (pins faltantes).
- Consolidate: 3 únicos (L16–L18; L17 marcado repeat de L10 por el ledger).
  Verificación adversarial: **3 CONFIRMED** — y F3 (evicción) **escalado a
  blocker**: el verificador reprodujo el ataque paso a paso y el test F3
  del fix anterior asertaba el comportamiento buggy en vez de capturarlo.
  Violación directa de AC10.
- Aviso del ledger: posible gap de evidencia en AC10 (objeciones distintas
  del lente tests en rondas 1 y 2). No se debilita el criterio; la prueba
  conductual del bloqueo vive en T011 (en vivo). Anotado.
- Fix de ronda 3 (ÚLTIMA del presupuesto) despachado: guard de evicción
  (víctima = más antigua NO bloqueada; si todas bloqueadas, el Map crece),
  test F3 corregido (base SIGUE bloqueada tras llenar el Map), pin del guard
  de registrarFallo con entry expirada presente, pin del barrido con
  expirada reclamada antes que una viva.

## T002 — ronda 3 (fix del BLOCKER) — 2026-11-17
- Fix integrado: **3ae68df** — evicción respeta bloqueo activo (víctima =
  más antigua NO bloqueada; todas bloqueadas → el Map crece, nunca se
  des-bloquea a un atacante); test F3 corregido (asienta que base SIGUE
  bloqueada — antes asertaba el bug); pins F1 (guard con entry expirada
  presente) y F2 (barrido con DOS expiradas para observabilidad). El
  implementador verificó los mutantes ejecutándolos y revirtiéndolos.
- RED honesto: test F3 corregido falló contra el código buggy
  (`expected null not to be null`). Auth 15/15; suite completa **78/78**.
- Decisión registrada por el implementador en decisions.md («Evicción
  respeta el bloqueo activo»), integrada con el cherry-pick.
- Panel de ronda 3 (final) despachado sobre el diff nuevo. Si no converge:
  T002 se aparca en la cola de decisiones (regla del presupuesto de 3).

## T002 — cierre ronda 3 — 2026-11-17
- Panel: security PASS + 1 question (saturación) · correctness **1 BLOCKER**
  (mismo escenario, trazado línea a línea) · tests PASS + 2 nits + 2
  questions (límites exactos y orden sin pin — repetidos o menores).
- Consolidate: 4 únicos; el BLOCKER verificado → **CONFIRMED con
  reproducción** (script externo: con 999 señuelos bloqueados, 10 fallos
  sobre un email nuevo no bloquean; baseline en Map vacío: 5 fallos
  bloquean). El trade-off documentado en decisions.md era inalcanzable
  (falso). Registrado como L19.

## Decision queue — 003-login-usuarios

### D1 — T002 ronda 4 (blocker de saturación) — CERRADA por el dueño
- **Kind**: blocking · **Task**: T002 · **Tier**: 2.
- **Pregunta**: el fix de ronda 3 cerró el bypass de des-bloqueo pero abrió
  el inverso (fallos de emails nuevos se pierden bajo saturación; AC10
  desactivada para ellos). Presupuesto de 3 rondas agotado. ¿Fix extra,
  aparcar, o aceptar residual?
- **Opciones**: fix ahora (una línea: la evicción salta la clave recién
  insertada) / aparcar T002 y seguir con T04 / aceptar como riesgo residual
  (question según el lente security: setup ~5000 peticiones, ventana 15 min).
- **Recomendación**: fix ahora.
- **Decisión del dueño (2026-11-17)**: **«arréglalo, manteniendo los
  estándares de desarrollo que estábamos usando»** — ronda 4 autorizada
  con TDD completo y revisión. Entrada cerrada por el humano.
- **Evidencia**: reproducción del verificador (transcripción de la sesión);
  hallazgo L19 en el ledger de revisión.

## T002 — ronda 4 (autorizada por el dueño, D1) — 2026-11-17
- Fix integrado: **e4912d1** — `mantenerCota(ahora, claveRecienInsertada)`
  con skip en el loop de evicción; la entry nueva nunca es víctima de su
  propia inserción. Test F5 nuevo (999 señuelos bloqueados + 5 fallos sobre
  email nuevo → bloquea), RED honesto contra el código buggy. Auth 16/16;
  suite **79/79**. Entrada append-only en decisions.md corrigiendo el
  trade-off (ahora verdadero: bajo saturación total el Map crece).
- El ledger mecánico de rsc rechazó la ronda 4 (regla de 3 rondas) — la
  autorización humana de D1 la supersede; el panel final se despachó sobre
  el diff nuevo y sus veredictos se registran aquí (el ledger local no abre
  ronda 4).

## T002 — cierre ronda 4 — 2026-11-17
- status: **complete**
- Panel de ronda 4 (diff e4912d1): security **PASS** (7 vectores; bypass de
  saturación genuinamente cerrado; crecimiento acotado por tasa y
  auto-curable) · correctness **PASS** (12 ataques; todas las afirmaciones
  del fix verificadas contra el código) · tests 1 should-fix (L24: el brazo
  de evicción por saturación sin pin — mutante `if (true) continue`
  sobrevivía) → verificado con **prueba empírica** (mutante corrido,
  escenario reproducido) → **CONFIRMED**.
- Fix L24: pin F6 (test redactado y verificado contra el mutante por el
  finding-verifier; transcrito por el orquestador por ser adición mecánica
  de un test ajeno) — commit **ca85066**. Auth 17/17; suite **80/80**.
- Controls: tests ✅ 80/80 · build ✅ · security ✅ (lente del panel) ·
  traceability ✅ (AC10: bloqueo probado unit-level; conductual en T011).
- Nota del ledger: aviso de gap de evidencia en AC10 (objeciones del lente
  tests en rondas 1–4). No se debilitó el criterio; la profundidad de las
  objeciones refleja lo sutil del contrato de bloqueo. Prueba conductual en
  T011 en vivo.

## T004 — 2026-11-17
- status: built (review pendiente)
- red: 10 tests fallando con 404 (endpoints inexistentes) → green 10/10.
- files: `test/login-api.test.js` (nuevo, 10 tests, fakes vía vi.mock
  siguiendo el patrón de api.test.js), `src/auth.js` (+wrappers reales de
  Supabase Auth con import lazy de supabase — evita arrastrar la service
  key a los tests unitarios), `src/app.js` (+4 endpoints).
- commit 0-worktree b206c1a → cherry-pick **6f678d4**. Suite **90/90**.
- decisiones de diseño: login SIN bloqueo (T006 lo cablea — alcance
  deliberado); logout idempotente (204 siempre, cookie expirada siempre).
- risk: tier 2 (src/auth.js + test/login-api.test.js, clase auth) — panel
  de 3 despachado (ronda 1).

## T004 — ronda 1 de revisión — 2026-11-17
- Panel: security 1 should-fix (L25: registro reenvía mensaje crudo de
  Supabase — fuga de internals) · correctness PASS + 1 question sancionado
  por AC7 (login colapsa caída de servicio a 401 genérico) · tests 1
  should-fix (L26: cookies sin HttpOnly/SameSite verificados en el gate de
  T004) + 3 questions (mock-swallowing aceptado por el plan §5; rama
  ContrasenaInvalida no ejercitada L28; llamada auth.logout no testeada).
- Consolidate: 5 únicos; L25 y L26 verificados → **2 CONFIRMED con
  reproducción** (mock de rate-limit para la fuga; mutante sin HttpOnly
  sobrevive T004 aunque muere en T003 — el gate de T004 no prueba su
  propio contrato).

## T004 — ronda 2 (fixes L25/L26) — 2026-11-17
- Fix integrado: **987f9d1** — `auth.registrar` lanza `ContrasenaInvalida()`
  genérico (el crudo no sale del wrapper); el endpoint responde
  `400 {errores: ['no se pudo crear la cuenta']}` fijo; test L25 nuevo
  (fake con rate-limit crudo → RED contra el código viejo, GREEN tras el
  fix — también ejercita la rama ContrasenaInvalida, cerrando L28 de paso);
  pins HttpOnly/SameSite en los tests de cookie de registro y login.
- RED: 1 failed | 10 passed (la fuga llegaba al cliente) → GREEN: 11/11;
  suite **91/91**. L25/L26 `fixed` en ledger. Ronda 2 abierta, panel
  despachado sobre el diff nuevo.

## T004 — cierre ronda 2 — 2026-11-17
- status: **complete**
- Panel de ronda 2 (diff 987f9d1): security **PASS** (6 vectores; fuga
  cerrada de punta a punta, ningún endpoint reenvía err.message) ·
  correctness **PASS** + 1 question · tests **PASS** + 1 question — ambos
  questions son el mismo mutante equivalente (el fix del wrapper es
  defensa-en-profundidad que la suite no presencía por el vi.mock;
  verificación en vivo en T011). Registrado como L30. Cero should-fix,
  cero blockers. Panel registrado.
- De paso, la rama ContrasenaInvalida del endpoint quedó ejercitada
  (L28 de ronda 1 cerrado por el test L25).
- Controls: tests ✅ 91/91 · build ✅ · security ✅ (lente del panel) ·
  traceability ✅ (AC1, AC7, AC8, AC9 a nivel de gate de T004).

## T009 — 2026-11-18
- status: built (review pendiente)
- done-check verificado por el implementador: `npm start` + curl →
  `login.html` 200; `node --check` del script inline OK; checklist manual
  documentado (labels visibles con `<label for>`, teclado con tabs ARIA +
  focus visible, modo oscuro con las mismas variables que index.html,
  mapeo de las formas de error 400 `{"errores": [...]}` y 401 `{"error": "..."}`).
- files: `public/login.html` (nuevo, 266 líneas) · commit worktree 5a44152 →
  cherry-pick **e94ba89**. Suite 102/102 (no añade tests; §5 scopea el
  frontend fuera de la suite automatizada, verificación en vivo en T011).
- decisiones de diseño: tabs Acceso/Registro con roles ARIA
  tablist/tab/tabpanel; `getJSON` unificado que detecta `errores[]` vs
  `error` string (más completo que el de index.html); enlace a `reset.html`
  ya presente (T010 lo materializa).
- risk: tier 2 (clase auth — login.html) — panel de 3 despachado (ronda 1).

## T009 — cierre ronda 1 — 2026-11-18
- status: **complete**
- Panel de ronda 1 (diff e94ba89): security **PASS** (8 vectores: textContent
  sin XSS, same-origin, cookie HttpOnly no tocada, cero dependencias externas)
  · correctness **PASS** (12 ataques; contratos 400/401 bien consumidos,
  redirección correcta, ids consistentes) · tests **PASS** (evidencia del
  done-check verificada por curl + inspección mecánica de los correlatos
  a11y; suite 102/102 intacta). Cero should-fix, cero blockers.
- Consolidate: 2 questions únicos — F1: el done-check de T009 under-nombra la
  forma de error de AC7 (`{"error": "..."}` singular; la página cubre ambas
  formas, hueco de wording del plan, no de código); F2: enlace a `reset.html`
  es 404 hasta que T010 aterrice (referencia adelantada esperada por el
  orden del plan). Ambos advisory, ninguno bloquea.
- Controls: tests ✅ 102/102 · build ✅ (estático sin build; node --check del
  script) · security ✅ (lente del panel) · traceability ✅ (AC1/AC7/AC8 a
  nivel API en login-api.test.js; conductual de página en T011).
- Panel registrado en el ledger (ronda 1 de 3, e94ba89).

## T005 — 2026-11-18
- status: built (review pendiente)
- red: 11 tests nuevos en `test/login-api.test.js` (describe «T005») fallando
  por las razones correctas: los 6 endpoints de datos devolvían 200/201/204
  en vez de 401; el test de aislamiento recibía 2 movimientos en vez de 1
  (singleton sin scope); saldo/resumen/CSV computaban sobre el set global;
  DELETE cross-user devolvía 204 en vez de 404.
- green: `dbPara(tokens)` en `src/db.js` (fábrica de repo scoped con cliente
  Supabase + JWT del usuario en Authorization); `requireSesion` adjunta
  `req.dbCliente` + `req.usuario`; los 6 endpoints de datos tras el gating,
  handlers sobre `req.dbCliente`. Tests existentes (api/csv/smoke/session)
  actualizados con sesión; mismos asserts.
- files: `src/db.js`, `src/session.js`, `src/app.js`, `test/login-api.test.js`,
  `test/api.test.js`, `test/csv-api.test.js`, `test/smoke.test.js`,
  `test/session.test.js` · commit worktree a90ae32 → cherry-pick **9630ab4**.
  Suite 102/102.
- risk: tier 2 (clase auth) — panel de 3 despachado (ronda 1).

## T005 — ronda 1 de revisión — 2026-11-18
- Panel: security **PASS** (6 endpoints gateados, handlers 100% sobre
  req.dbCliente, sin fuga de secrets/internals, tests capaces de fallar) ·
  correctness **1 should-fix** + 1 nit · tests **PASS** + 2 nits.
- Consolidate: 4 únicos. F1 [should-fix] verificado por finding-verifier →
  **CONFIRMED con trazado contra la base real** (pg_policies: INSERT con
  `WITH CHECK (auth.uid() = user_id)`; pg_trigger vacío; user_id sin default):
  `crearMovimiento` del repo scoped no seteaba `user_id` → todo INSERT
  autenticado sería rechazado por RLS → 500 en vez de 201 (AC3 roto en
  producción). F2 nit: import muerto de `db` en app.js. F3 nit: mensaje 401
  sin pinear (mutante sobrevive). F4 nit: aserciones negativas
  order-dependent.

## T005 — ronda 2 (fixes F1–F4) — 2026-11-18
- Fix integrado: **2ae6bb7** — `dbPara(tokens, usuario)` + `repoPara(cliente,
  usuario)`; `crearMovimiento` del repo scoped inserta
  `user_id: usuario.id` (defensa en profundidad: RLS WITH CHECK sigue
  validando el valor contra el JWT); `requireSesion` pasa `data.usuario`;
  import muerto eliminado; pin `toEqual({error: 'No autenticado'})` en los
  6 tests de 401 (mutante corrido: 6 tests mueren); tests de resumen/CSV
  autocontenidos. RED honesto (test F1 falló contra el código sin fix).
  Auth de la decisión en decisions.md (fix de aplicación vs trigger de
  base). Suite 103/103.

## T005 — ronda 2 de revisión — 2026-11-18
- Panel (diff 2ae6bb7): security **PASS** (7 vectores: sin inyección de
  user_id desde el body — doble destrucción de campos; sin suplantación;
  RLS frontera intacta) · correctness **PASS** (8 ataques: fix de clase,
  singleton preservado, pins exactos) · tests **1 should-fix**.
- Consolidate: 1 único, verificado → **CONFIRMED con reproducción**: el
  test F1 ejerce el MOCK de src/db.js, no el `crearMovimiento` real —
  mutante (quitar la línea del user_id) sobrevive la suite COMPLETA
  (103/103 verde). Clase mock-swallowing-logic-under-test; la regresión F1
  sin guarda automatizada (AC3).

## T005 — ronda 3 (fix, ÚLTIMA del presupuesto) — 2026-11-18
- Fix integrado: **9b73019** — `test/db-scoped.test.js` nuevo (3 tests):
  mockea el SDK `@supabase/supabase-js` (la frontera), NO el módulo;
  `vi.hoisted` setea la env var de test; import dinámico de src/db.js REAL
  en beforeAll. Guarda: (1) insert scoped incluye `user_id: usuario.id` +
  5 campos; (2) singleton NO incluye user_id (bypass RLS preservado);
  (3) campos intactos. RED honesto: mutante aplicado → test 1 muere
  (`user_id: 42` faltante); revertido → verde. Suite **106/106**.

## T005 — cierre ronda 3 — 2026-11-18
- status: **complete**
- Panel de ronda 3 (diff 9b73019): security **PASS** (6 vectores: sin red
  ni secrets, env idempotente sin contaminación cruzada) · correctness
  **PASS** (8 ataques: módulo real ejercido sin interceptación, fake fiel
  a la cadena insert().select().single(), orden hoisted/import estable) ·
  tests **PASS** + 1 nit (test 3 redundante, subsumido por el toEqual del
  test 1 — anotado, sin fix: triangulación inofensiva). Cero should-fix,
  cero blockers. El mutante de ronda 2 muere (verificado por el panel).
- Controls: tests ✅ 106/106 (10 archivos) · build ✅ (sin paso de build;
  la suite carga todos los módulos) · security ✅ (lente del panel) ·
  traceability ✅ (AC3 con guarda real en db-scoped.test.js; AC4/AC5 tests
  de aislamiento por usuario; AC6 los 6 tests de 401 con pin de mensaje).
- Nota: la verificación CONDUCTUAL de RLS (usuario real ve solo lo suyo)
  sigue siendo T011 en vivo, como manda el plan §5.

## T006 — 2026-11-18
- status: built
- red: 4 tests nuevos (describe «T006 — bloqueo…») fallando: esperaban 429
  y recibían 200 (el endpoint no tenía bloqueo).
- green: `POST /api/login` cableado al bloqueo puro de T002:
  `decidirBloqueo(email, Date.now())` antes del intento → 429
  `{"error": "cuenta bloqueada, reintenta en N minutos"}` (mismo cuerpo con
  credenciales correctas); `CredencialesInvalidas` → `registrarFallo` + 401;
  éxito → `reiniciar` + 200. Guard `typeof email === 'string'` antes del
  bloqueo. El fake del test ganó el espejo en memoria del contrato de
  bloqueo (el test mockea src/auth.js entero; la lógica pura ya tiene sus
  17 tests unitarios).
- files: `src/app.js`, `test/login-api.test.js` · commit worktree 1a8ff6c →
  cherry-pick **b5621de**. Suite 110/110.
- decisiones: el 5.º fallo responde 401 (el bloqueo se fija en el handler de
  error) y el 429 aparece en el 6.º intento — consistente con el contrato
  «al 6.º intento dentro de la ventana → Bloqueado».
- risk: tier 2 (clase auth) — panel de 3 (ronda 1).

## T006 — cierre ronda 1 — 2026-11-18
- status: **complete**
- Panel de ronda 1 (diff b5621de): correctness **PASS** (12 ataques: orden
  de operaciones, semántica 5.º/6.º, guard protector, sin doble conteo
  concurrente, AC7 intacto) · security **PASS** + 1 question · tests
  **PASS** + 1 nit (4 mutantes corridos: quitar decidirBloqueo/registrarFallo/
  reiniciar/hardcodear mensaje → todos mueren). Cero should-fix, cero
  blockers.
- Consolidate: 2 únicos. F1 [nit]: mutante «hardcode 15» sobrevive a nivel
  de integración (la lógica pura dinámica sí está probada en auth.test.js;
  el gap es solo del cableado, requeriría reloj fake inyectado — anotado,
  sin fix). F2 [question]: `auth.login` (T004) conflata errores internos de
  Supabase en `CredencialesInvalidas` → un error transitorio con credenciales
  correctas suma al contador de bloqueo de la víctima. Causa raíz fuera del
  alcance de T006 → entrada D2 en la cola de decisiones (review-after).
- Controls: tests ✅ 110/110 · build ✅ · security ✅ (lente del panel) ·
  traceability ✅ (AC10: cableado probado por 4 tests con mutantes muertos;
  lógica pura 17 tests; conductual en vivo en T011).

## Decision queue — 003-login-usuarios

### D2 — conflation de errores internos en CredencialesInvalidas — review-after
- **Kind**: review-after · **Task**: T004 (causa raíz) / T006 (síntoma) ·
  **Tier**: 2.
- **Pregunta**: `auth.login` lanza `CredencialesInvalidas` para CUALQUIER
  error de `signInWithPassword` (rate limit, red, timeout), no solo
  credenciales incorrectas. El bloqueo de T006 cuenta esos errores
  transitorios como fallos del usuario → una víctima con credenciales
  correctas puede quedar bloqueada tras 5 incidentes de Supabase.
- **Opciones**: (a) distinguir en `auth.login` credenciales incorrectas
  (mensaje «Invalid login credentials») de errores internos (nueva clase,
  mismo 401 genérico sin `registrarFallo`); (b) aceptar como residual
  (requiere que Supabase falle 5 veces en la ventana).
- **Recomendación**: (a) — fix pequeño, preserva AC7 (401 idéntico), cierra
  el espíritu de AC10 («5 intentos fallidos», no «5 errores del servidor»).
- **Estado (2026-11-18, autopilot)**: plegado al alcance de T007 (que ya
  toca `src/auth.js` para los wrappers de recuperación), con decisión
  registrada en decisions.md. El dueño lo lee en review-after; si prefiere
  (b), se revierte ese bloque de T007.

## T007 — 2026-11-18
- status: built
- red: 7 tests de recuperación fallando con 404 (endpoints inexistentes) →
  green. Los 2 tests del fix D2 pasaron desde el inicio (el catch genérico
  ya hacía lo correcto) — quedan como guardas de regresión.
- green: `POST /api/recuperar` (200 `{"ok": true}` SIEMPRE, exista o no el
  email, incluso si el servicio falla — AC12 estricto) y
  `POST /api/recuperar/confirmar` (204 + `sesion.destruirTodasDe(usuario.id)`
  | 400 con errores). Wrappers en src/auth.js:
  `pedirRecuperacion` (resetPasswordForEmail) y `confirmarRecuperacion`
  (verifyOtp type recovery + updateUser) — devuelve `{ usuario }` para poder
  destruir sesiones (decisión en decisions.md). Fix D2 (hallazgo de la cola
  de decisiones): `AuthNoDisponible` para errores internos de Supabase →
  401 genérico SIN `registrarFallo` (AC7 intacto, AC10: errores del
  servidor no cuentan como fallos del usuario).
- files: `src/auth.js`, `src/app.js`, `test/login-api.test.js`,
  `decisions.md` (2 entradas) · commit worktree 0b8f2d6 → cherry-pick
  **c21132d**. Suite 119/119.
- risk: tier 2 (clase auth) — panel de 3 (ronda 1). Nota operativa: los
  lentes correctness y tests se despacharon secuencialmente tras un stall
  del watchdog por concurrencia de mutantes sobre el árbol.

## T007 — ronda 1 de revisión — 2026-11-18
- Panel: correctness **PASS** (12 ataques) + 2 questions + 1 nit · security
  **PASS** (8 vectores) + 2 questions · tests **2 should-fix** + 1 question
  + 1 nit (6 mutantes corridos).
- Consolidate: 8 únicos; los 2 should-fix verificados por finding-verifier
  (secuencial) → **2 CONFIRMADOS con reproducción**: F1 — el catch de
  /api/recuperar era código muerto en la suite (fake nunca lanzaba; mutante
  404-revelador sobrevivía 119/119 — AC12 sin guarda en el camino de
  error); F2 — el done-check `-t "recuperar"` se saltaba los 2 tests D2 del
  mismo commit (mutante registrarFallo-en-AuthNoDisponible pasaba el
  done-check y rompía la suite).
- Questions/nits anotados: fragilidad del regex `/invalid login
  credentials/i` (si Supabase cambia el texto, el bloqueo se desactiva
  silenciosamente — verificación en vivo T011); half-state verifyOtp/
  updateUser (OTP quemado sin cambio de password — inherente al flujo
  Supabase); error transitorio mapeado a «enlace inválido»; timing
  side-channel en /api/recuperar (canal de tiempo, no de respuesta —
  non-goal); sin rate limit en confirmar (non-goal de la spec); test AC11
  de integración no verifica supervivencia de sesiones ajenas (cubierto por
  unit test de session).

## T007 — ronda 2 (fixes F1/F2) — 2026-11-18
- Fix integrado: **271379c** — fake `pedirRecuperacion` lanza para
  `smtpfallo@` (fallo de servicio, no email inexistente); test nuevo: 200
  `{"ok": true}` EXACTO aunque el servicio falle (guard con RED honesto:
  mutante 404 → test muere → revertido). Done-check de T007 enmendado en el
  plan a `-t "recuperar|D2"` (10 passed | 27 skipped; precedente T001).
  Decisión del conteo y de no renombrar el describe D2 en decisions.md.
  Suite 120/120.

## T007 — cierre ronda 2 — 2026-11-18
- status: **complete**
- Panel de ronda 2 (diff 271379c): security **PASS** (guard mata 3
  mutantes del catch; sin fuga del mensaje crudo; regex del done-check sin
  huecos) · correctness **PASS** (9 ataques: aserciones exactas, fake lanza
  por la razón correcta, enmienda fiel, nada debilitado) · tests **PASS**
  (2 mutantes corridos → ambos mueren; filtro exacto sin fugas; test no
  vacuo). Cero hallazgos en los tres lentes.
- Controls: tests ✅ 120/120 (10 archivos) · build ✅ · security ✅ (lente
  del panel) · traceability ✅ (AC11/AC12 con guarda del camino de error;
  AC10-D2 con done-check que cubre sus tests; conductual en vivo en T011).
- D2 (cola de decisiones) queda CERRADA por este fix: los errores internos
  ya no cuentan como fallos de bloqueo, con guardas automatizadas.

## Estado de sesión — 2026-11-17 (cierre por decisión del dueño)
- **Completas**: T001 (migración), T002 (bloqueo, 4 rondas — la 4.ª
  autorizada por el dueño vía D1), T003 (sesión), T004 (endpoints de auth,
  2 rondas).
- **Pendientes para la próxima sesión** (el dueño decidió parar aquí):
  T005 (protección de endpoints de datos con requireSesion + cliente
  scoped), T006 (bloqueo cableado al login), T007 (recuperación), T008
  (claim del huérfano), T009 (login.html), T010 (reset.html + gating),
  T011 (verificación en vivo), T012 (cierre).
- Suite: **91/91 verde**. Rama feature/003-login-usuarios con 14 commits.
- Reanudar: leer este ledger + `git log feature/003-login-usuarios`;
  despachar T005 con su fila del plan y su bloque de Interfaces.
