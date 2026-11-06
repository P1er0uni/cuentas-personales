# Reglas de documentación del proceso SDD

Reglas del piloto. Se aplican a toda feature que entre al flujo SDD del harness
RSC. El objetivo: trazabilidad completa del proceso — qué se hizo, cuándo, cuánto
duró y cuánto costó (tokens) — para poder evaluar el método antes de escalarlo.

## Regla 1 — Un solo documento por feature

Cada feature tiene **exactamente un documento**:
`02-DOCS/wiki/sdd/features/NNN-<slug>.md` (NNN = número correlativo, igual que la
spec correspondiente en `specs/NNN-<slug>/`). El documento nace en el momento del
registro de ingreso y crece por append durante toda la vida de la feature. No hay
documentos paralelos por paso: todo vive en ese único archivo.

## Regla 2 — Se abre con el registro de ingreso, y se registra en git

Lo primero que se escribe al entrar una feature es la sección
**«Registro de ingreso»**: fecha y hora de entrada, descripción de lo pedido,
quién lo pide y cualquier contexto relevante. Si la feature aún no tiene número
asignado, se le asigna en este momento.

Ese registro **se commitea a git inmediatamente**: el primer commit de la rama
de la feature es el documento con su registro de ingreso. Cada cierre de paso
(Regla 3) también se commitea en la misma rama; el documento llega a `main`
junto con el PR de la feature. Nada de feature sin commit de registro.

## Regla 3 — Al finalizar cada paso del workflow, se documenta

El paso no termina cuando termina el trabajo: termina cuando su sección está
escrita en el documento de la feature. El orden de secciones es el del workflow:

1. Registro de ingreso
2. Spec (`specify`)
3. Plan (`plan`)
4. Tasks (`tasks`)
5. Desarrollo (`implement` — ramas, commits, decisiones de código)
6. Revisión de agentes (hallazgos de refuters/verificadores y su resolución)
7. Verificación (`verify` — tests, evidencia)
8. Ship (`ship` — PR, merge, cierre)

Si un paso no aplica (p. ej. no hubo hallazgos de revisión), la sección se escribe
igual explicando por qué está vacía.

## Regla 4 — Cada sección registra tiempos y tokens

Toda sección de paso cierra con un bloque de métricas:

- **Inicio / fin** del paso (fecha y hora) y **duración** en minutos.
- **Tokens consumidos** en el paso — los obtiene **el agente**, sin intervención
  humana: agrega el uso por mensaje de las transcripciones de sesión
  (`~/.claude/projects/<proyecto>/*.jsonl`, campo `usage`) dentro de la ventana
  inicio–fin del paso, y lo cruza con `rsc memory metrics` cuando esté disponible.
  El costo se calcula con la tabla de precios del modelo en uso (configurable;
  el piloto corre con GLM). Si una fuente no da dato, se anota «n/d» — nunca se
  inventa.
- **Intervenciones humanas**: número de mensajes/decisiones del usuario durante
  el paso (aprobaciones, correcciones, respuestas a preguntas).
- **Artefactos producidos**: rutas de archivos generados en el paso.

## Regla 5 — Métricas acumuladas al final

El documento cierra (y se mantiene actualizado) con una sección **«Métricas»**:
tabla con una fila por paso (duración, tokens, intervenciones) y fila de total.
Es la cifra que se usa para comparar features y medir el método.

## Regla 6 — Append-only

El documento es un registro: lo escrito no se reescribe ni se borra. Las
correcciones van como notas nuevas («Corrección: …»). Si una feature se cancela,
se escribe la sección de cierre explicando el motivo y hasta qué paso llegó.

## Regla 7 — Responsabilidad

El agente que ejecuta un paso del workflow es responsable de escribir su sección
al terminarlo, antes de pasar al siguiente paso. Si una sesión muere a mitad de
un paso, la siguiente sesión completa la sección faltante con lo reconstruible y
anota la interrupción.
