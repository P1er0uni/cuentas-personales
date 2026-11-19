# Informe de métricas — Ciclo 003 · Login de usuarios

> Feature: [`../features/003-login-usuarios.md`](../features/003-login-usuarios.md) ·
> Rama: `feature/003-login-usuarios` · Ciclo: 2026-11-17 → 2026-11-18.
> Informe elaborado el 2026-11-19 a partir de las **transcripciones reales** de
> las sesiones (JSONL de Claude Code, modelo `glm-5.3` en todas las llamadas).

## Método de medición

- **Tokens**: suma de los campos `usage` de cada llamada API en las
  transcripciones — sesión principal (orquestador) **y** subagentes
  (developers, refuters, verifiers). Tres tipos: **input** (tokens nuevos
  enviados), **output** (tokens generados) y **cache-read** (contexto re-leído
  de la caché; no se re-cobra como input nuevo).
- **Tiempo**: «muro» = primera a última llamada del paso. «Activo» = suma de
  huecos entre llamadas consecutivas acotados a 5 min; los huecos mayores
  (esperando respuesta humana, o la pausa nocturna) **no** cuentan. En
  `implement` el tiempo activo fusiona orquestador y subagentes (los paneles
  corren en paralelo y el orquestador espera mientras tanto).
- **Intervenciones humanas**: mensajes reales del dueño en el chat, más las
  respuestas a diálogos de preguntas (AskUserQuestion), que no aparecen como
  mensajes. Se anota el propósito de cada una.
- Las ventanas de cada paso se fijaron con los timestamps de la transcripción,
  que ajustan (±minutos) las horas aproximadas del doc de feature.

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Tiempo muro del ciclo | ~14 h 33 min (2 sesiones) |
| Tiempo activo (sin esperas humanas) | **~10 h 30 min** |
| Tokens input | 20,319,073 (~20.3 M) |
| Tokens output | 3,534,247 (~3.5 M) |
| Tokens cache-read | 357,179,456 (~357 M) |
| Llamadas API totales | ~4,300 (orquestador ~1,700 · subagentes ~2,600) |
| Subagentes despachados | 87 (42 en sesión 1 · 45 en sesión 2) |
| Intervenciones humanas | ~21 mensajes de chat + ~16 respuestas a diálogos ≈ **37** |
| Costo estimado (API, referencia) | **US$ 20–41** según escenario de caché (ver §Costo) |

## Métricas por paso

Costo estimado con el **escenario A** (cache-read cobrado a 0.1× input); sin
cobro de caché sería el escenario B (≈la mitad). Precios de referencia en §Costo.

| Paso | Muro | Activo | Input | Output | Cache-read | Interv. | Costo est. A |
|---|---|---|---|---|---|---|---|
| Pre-arranque (check MCP) | ~2 min | 1 min | 131,186 | 2,519 | 214,656 | 1 | $0.10 |
| Spec (+ enmienda constitución) | ~32 min | 26 min | 337,297 | 208,967 | 10,737,920 | ~12 | $1.31 |
| Plan (+ clarify) | 7 min | 7 min | 90,126 | 67,779 | 5,205,888 | 5 | $0.52 |
| Tasks | 4 min | 4 min | 41,265 | 31,947 | 2,363,840 | 0 | $0.24 |
| Analyze + arranque implement | 28 min | 23 min | 570,838 | 69,403 | 11,053,888 | 4 | $1.16 |
| Implement sesión 1 (T001–T004) | 4 h 36 min | ~3 h (178 min) | 6,160,717 | 1,655,752 | 145,829,632 | 8 chat | $16.09 |
| Implement sesión 2 (T005–T011, autopilot) | ~8 h | ~6 h 08 (368 min) | 9,932,200 | 1,453,863 | 162,683,456 | 2 | $18.92 |
| Cierre T012 (docs + métricas) | ~45 min | 23 min | 3,055,444 | 44,017 | 19,090,176 | 0 | $3.08 |
| **Total** | **~14 h 33 min** | **~10 h 30 min** | **20,319,073** | **3,534,247** | **357,179,456** | **~37** | **$41.42** |

Desglose orquestador vs subagentes:

| Rol | Input | Output | Llamadas |
|---|---|---|---|
| Orquestador (sesión principal) | 7,710,913 | 1,199,127 | ~1,700 |
| Subagentes (87 runs) | 12,608,160 | 2,335,120 | ~2,600 |
| **Proporción de subagentes** | **62 %** | **66 %** | **60 %** |

## Intervenciones humanas por paso (y para qué)

- **Pre-arranque (1)** — confirmar que el MCP de Supabase estaba operativo
  antes de empezar.
- **Spec (~12)** — prompt inicial del feature; interrupción para enmendar la
  constitución (v1.0.0 → v1.1.0: 3 decisiones de enmienda + ratificación);
  orden de reanudar; 4 respuestas de frontera (multi-usuario real, registro
  abierto, dato preexistente a la primera cuenta, modo paso a paso); revisión
  del draft que devolvió el bloqueo por intentos fallidos al alcance;
  decisión sobre commits.
- **Plan (5)** — pedir el plan; 4 respuestas de clarify (contraseña mínima 8,
  bloqueo 5 intentos → 15 min, sesión persistente, recuperación de contraseña
  al alcance).
- **Tasks (0)** — desglose derivado del plan aprobado, sin intervención.
- **Analyze + arranque (4)** — arrancar por la tarea indicada; pedir `analyze`;
  responder al hallazgo del análisis (RLS no ejercitable en local); confirmar
  qué tareas se implementarían.
- **Implement sesión 1 (8 mensajes)** — 2 «continúa» (reanudar tras pausas del
  clasificador de permisos); pedir explicación sencilla del blocker de
  saturación del bloqueo; confirmar el entendimiento antes de decidir;
  **D1**: autorizar la ronda 4 («arréglalo, manteniendo los estándares»);
  decidir parar tras T004; pedir checkboxes de tareas en el plan y corregir
  su formato.
- **Implement sesión 2 (2)** — reanudar («¿en dónde nos quedamos?») y
  **autorizar autopilot** («no solicitarás permisos para nada»). Esa única
  autorización eliminó todas las demás intervenciones del día: **0 mensajes
  durante ~8 horas** de trabajo (T005–T011, incluida la verificación en vivo).
- **Cierre T012 (0)** — la documentación final y las métricas corrieron solas.
  1 pregunta **post-ciclo** («¿ya puedo entrar a la página y probar el
  login?») entró horas después y no perteneció al ciclo.

Lectura: en modo paso a paso el dueño intervino ~12 veces por fase de diseño y
8 veces en 4 h 45 de implementación; en autopilot, 1 autorización cubrió 8 h
de implementación con 11 tareas y verificación en vivo. El costo del autopilot
en autonomía fue 0 intervenciones; su riesgo se contuvo con el panel de 3
revisores por tarea y la cola de decisiones (D2 se resolvió sola y quedó
documentada para review-after).

## Costo — precio por tipo de token

**Advertencia**: el modelo de todo el ciclo fue `glm-5.3`. La búsqueda web no
devolvió precios publicados para ese modelo, así que la estimación usa como
**referencia** el precio público de la generación anterior (GLM-4.x en z.ai);
trátalo como orden de magnitud, no como factura:

| Tipo de token | Precio de referencia | Tokens del ciclo | Costo |
|---|---|---|---|
| Input (no caché) | $0.60 / M | 20.32 M | $12.19 |
| Output | $2.20 / M | 3.53 M | $7.78 |
| Cache-read (hipótesis: 10 % del input) | $0.06 / M | 357.18 M | $21.43 |
| **Total escenario A (caché cobrada)** | | | **$41.42** |
| **Total escenario B (caché no cobrada aparte)** | | | **$19.97** |

Notas:

- El **cache-read domina el costo potencial**: 357 M de tokens re-leídos
  (94 % del tráfico total) vienen de que cada llamada re-envía el contexto
  acumulado. Es el precio estructural de sesiones largas con contexto grande;
  el prompt caching lo abarata, pero no lo elimina.
- Si el acceso al modelo es por **suscripción** (no API por token), el costo
  marginal de este ciclo fue $0 y estas cifras representan el valor
  equivalente consumido de la cuota.
- Las transcripciones no registran costo monetario (`costUSD` ausente), por lo
  que todo costo aquí es estimación desde tokens, nunca medición de factura.

## Hallazgos sobre el proceso

1. **El gasto se concentra en `implement`**: $35 de $41 (85 %) del costo y
   93 % de los tokens. Spec + plan + tasks + analyze juntos costaron ~$3.3 y
   45 minutos de tiempo activo. El diseño fue barato; la construcción con
   revisión adversarial por tarea, cara — y esa fue la decisión deliberada
   del tier 2 (clase auth).
2. **La revisión adversarial es el motor del gasto en implement**: 87 runs de
   subagentes (developers + panel de 3 refuters + verifiers) consumieron el
   62 % del input. Retorno: ~45 hallazgos en el ledger, 7 should-fix
   confirmados con reproducción y 2 blockers (uno de ellos, el bypass de
   des-bloqueo por saturación, solo visible con el ataque construido paso a
   paso). Ninguno habría salido de una revisión superficial.
3. **Discrepancia con el doc de feature**: allí se registraron «≈1.9M de
   tokens de subagentes» para la sesión 2 (suma de los auto-reportes de los
   agentes). Las transcripciones completas muestran **9.0 M** (7.9 M input +
   1.1 M output) solo en subagentes de esa sesión. Los auto-reportes
   sub-estiman; conviene corregir la tabla del doc de feature con estas
   cifras.
4. **El tiempo muro engaña**: 14 h 33 de muro vs 10 h 30 activos. En
   implement sesión 1, 163 min fueron esperas (decisiones humanas, sobre
   todo alrededor de D1); en sesión 2, ~110 min de huecos internos con
   autopilot activo (stalls del watchdog y despachos secuenciales de lentes).
5. **El ciclo no está cerrado del todo**: D3 (toggle «Confirm email»), D4
   (fila preexistente reclamada por `t011-ana`) y el ship (merge a main,
   tier 2) siguen esperando al dueño. Este informe no cubre esa sesión futura.

## Fuentes

- Transcripciones: `dc56faf1…` (2026-11-17, spec→implement T001–T004) y
  `41c417e4…` (2026-11-18, autopilot T005–T012), en
  `~/.claude/projects/C--Users-nunezpi-Documents-Prueba/`.
- Documentación del ciclo: `features/003-login-usuarios.md`,
  `progress/003-login-usuarios.md`, `plans/003-login-usuarios.md`.
- Script de extracción (desechable, fuera del repo):
  `%TEMP%\metricas003\*.cjs`.
