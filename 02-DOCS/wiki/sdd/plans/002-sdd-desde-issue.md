---
type: plan
title: Plan — SDD disparado por GitHub Issue
description: Cómo se construye el disparador — vigilante local (nuevo) + hook de sesión (fallback, ya construido), tests, y aterrizaje.
tags: [sdd, plan]
timestamp: 2026-11-13T00:00:00Z
topic: sdd
slug: 002-sdd-desde-issue
branch: feature/002-sdd-desde-issue
---

# Plan — SDD disparado por GitHub Issue

> Spec: [`../specs/002-sdd-desde-issue.md`](../specs/002-sdd-desde-issue.md) ·
> Rama: `feature/002-sdd-desde-issue` · `rsc risk`: **tier 2** (toca harness)

## Arquitectura

Dos piezas, una convención:

1. **Fallback (ya construido y probado)**: `.claude/issue-trigger.mjs` corre en
   SessionStart (entrada aditiva en `.claude/settings.json`); si hay issues
   abiertos, inyecta al contexto la oferta de arrancar el SDD. Fail-open.
2. **Vigilante (a construir)**: `.claude/issue-watcher.mjs` — script Node ESM
   que corre en la máquina del dueño (`npm run watch:issues`). Cada 60 s
   consulta los issues abiertos con `gh`; los que no estén en su registro de
   vistos disparan una ventana nueva de PowerShell con Claude Code
   trabajando ese issue en autopilot. Una ventana por issue; el registro se
   persiste **antes** de lanzar (nunca ventanas duplicadas). Fail-open: si
   `gh` falla, anota y reintenta en el ciclo siguiente.
3. **Convención de vinculación** (compartida, ya en el texto del hook):
   spec con `issue: N` en frontmatter; PR con `Closes #N`.

### Decisiones técnicas

- **Lenguaje/ubicación**: Node ESM en `.claude/` junto al hook — es código de
  proceso, no de producto; la constitución (src/ para producto) no aplica.
- **Registro de vistos**: `.claude/.issue-watcher-seen.json` (array de
  números), gitignored — estado operativo local, no conocimiento del
  proyecto (suposición validada en clarify).
- **Ventana nueva**: `powershell.exe -NoExit -Command "Set-Location …; claude
  '<prompt>'"` lanzado con `spawn` detached; el prompt instruye autopilot
  (cadena SDD completa sin pedir autorizaciones, PR abierto con `Closes #N`,
  sin merge).
- **Modos de prueba**: `--once` (un solo ciclo y sale; sirve para tarea
  programada y para verificar) y `--dry-run` (imprime qué haría sin lanzar ni
  marcar vistos — la herramienta de verificación).
- **Lógica pura separada** para testear sin red: `computeNewIssues(seen,
  issues)`, `loadSeen(path)`, `saveSeen(path, seen)` exportadas del módulo.

## Tasks

1. **Tests primero (TDD rojo)**: `test/issue-watcher.test.js` — casos de
   `computeNewIssues` (vacio/parcial/todo visto), round-trip de
   `loadSeen`/`saveSeen`, archivo inexistente → conjunto vacío. Correr: falla
   (el módulo no existe).
2. **Vigilante (TDD verde)**: `.claude/issue-watcher.mjs` con las funciones
   puras + loop de polling + lanzamiento de ventanas + modos `--once` y
   `--dry-run`. `npm test` en verde.
3. **Cableado**: `npm run watch:issues` en `package.json`; línea en
   `.gitignore` para el registro de vistos.
4. **Verificación del disparador**: `--once --dry-run` con los issues
   actuales (#3 abierto) — debe listar #3 como nuevo sin abrir nada;
   repetir — sin `--dry-run` marcaría vistos; verificar persistencia.
5. **Cierre del issue #2** (prueba del trigger, ya validado) con comentario;
   #3 queda abierto como candidato de la prueba en vivo del dueño.
6. **Panel de revisión tier 2**: 3 refuters (correctness, security, tests) →
   consolidate → finding-verifier de blockers → ledger.
7. **Ship**: commits por paso (Regla 2/3), push, PR con cuerpo spec-linked.

## Riesgos

- El prompt de la ventana auto-abierta cruza límites de quoting de
  PowerShell: mantenerlo sin comillas simples ni dobles internas.
- rsc sync futuro podría tocar `.claude/settings.json` (fallback en riesgo;
  documentado en la spec).
- La sesión auto-abierta corre en esta misma carpeta: rsc le indicará
  trabajar en worktree — comportamiento deseado.
