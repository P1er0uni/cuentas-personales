---
author: P1er0uni
branch: feature/sdd-desde-issue
status: in-progress
---
# SDD disparado por GitHub Issue

## Intent

Hoy el flujo SDD arranca cuando el usuario escribe un prompt en la sesión. Queremos que el
disparador sea un **Issue de GitHub**: el usuario crea el issue cuando quiere una feature, y al
abrir su sesión el harness detecta los issues abiertos y le ofrece arrancar el SDD con uno. El
issue actúa como prompt inicial y queda vinculado a la spec y al PR.

Por qué vale la pena: el disparador pasa a ser un artefacto versionado, visible y con historial en
GitHub — no texto efímero en un chat. Además desacopla "pensé la feature" de "arranco el
desarrollo": puedes crear issues durante el día y procesarlos cuando abras sesión.

Decisiones de diseño (aprobadas por el usuario):
- Trigger: GitHub Issue plano (sin etiqueta especial).
- Arranque: al abrir sesión, el harness detecta issues abiertos y ofrece arrancar; nada de
  polling programado ni sesiones automáticas.

## Scope

**Dentro:**
- Script detector `.claude/issue-trigger.mjs`: lista issues abiertos con `gh` y, si hay, inyecta
  un bloque que indica al agente ofrecer arrancar el SDD con uno de ellos. Fail-open: si `gh`
  falla o no existe, silencio total (nunca rompe el arranque de sesión).
- Registro del hook `SessionStart` en `.claude/settings.json` (entrada propia, aditiva, sin tocar
  los hooks de rsc).
- Convención de vinculación: la spec lleva `issue: N` en su frontmatter; el PR lleva `Closes #N`
  en el cuerpo (cierra el issue al mergear).

**Fuera (explícito):**
- Polling programado / desarrollo automático sin el usuario (rechazado en el diseño).
- Etiquetas especiales para filtrar issues (rechazado en el diseño).
- Modificar archivos gestionados por rsc (`.rsc/`, skills de rsc, `rsc-bootstrap.mjs`).
- Que el agente cree issues por sí solo.

## Checklist

- [ ] **Detector script** (`.claude/issue-trigger.mjs`) — probado con 0 issues (silencio) y con un
      issue de prueba abierto (imprime el bloque de oferta con número, título y URL).
- [x] **Hook cableado** en `.claude/settings.json` — una sesión nueva muestra el bloque de
      detección cuando hay issues abiertos.
- [x] **Convención de vinculación** registrada — el texto inyectado por el hook y este documento
      dicen: spec con `issue: N`, PR con `Closes #N`.
- [ ] **Prueba end-to-end del disparador** — issue de prueba creado en GitHub, sesión nueva lo
      detecta y ofrece arrancar; el issue se cierra al terminar la prueba.
- [ ] **`rsc risk` + loop mínimo** — tier del diff calculado; si ≥1, un revisor de contexto
      fresco; controles del proyecto corridos o registrados como "no ejecutado".

## Evidence

- Rama `feature/sdd-desde-issue` creada desde main (observado: `Switched to a new branch`).
- Detector con 0 issues: `node .claude/issue-trigger.mjs` → sin salida, exit 0 (silencio, correcto).
- Hook SessionStart añadido a `.claude/settings.json` como segunda entrada aditiva
  (`node "${CLAUDE_PROJECT_DIR}/.claude/issue-trigger.mjs"`, timeout 20s); JSON validado por Edit.
- Convención de vinculación en el texto inyectado por el hook y en la cabecera del script.
- Pendiente: caso con issue abierto (creación del issue de prueba bloqueada temporalmente por
  indisponibilidad del clasificador de permisos — se reintenta).

## Next

Crear el issue de prueba en GitHub y correr el detector con un issue abierto (tarea 1, segunda
mitad); luego `rsc risk` del diff.

## Riesgos anotados

- `.claude/settings.json` es escrito por `rsc sync`; una entrada ajena podría ser eliminada en un
  sync futuro. Verificar tras el próximo sync; si la pierde, mover el registro a
  `.claude/settings.local.json` (local, no viaja con el repo) y anotarlo aquí.
- El árbol tiene cambios sin commit de la auto-actualización de rsc 4.1.0→4.1.5
  (`.claude/rsc-bootstrap.mjs`, `.rsc.json`): no deben mezclarse con esta feature.
