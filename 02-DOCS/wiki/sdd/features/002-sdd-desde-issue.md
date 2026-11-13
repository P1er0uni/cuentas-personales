# Feature 002 — SDD disparado por GitHub Issue

> Spec: [`../specs/002-sdd-desde-issue.md`](../specs/002-sdd-desde-issue.md) ·
> Rama: `feature/002-sdd-desde-issue` · Modo: **autopilot** (aprobación global
> del dueño, 2026-11-13)

## Registro de ingreso

- **Fecha/hora de entrada**: 2026-11-13 (tarde). La feature ingresa al flujo
  como promoción desde FTD: el trabajo del hook de detección ya estaba hecho
  cuando `rsc risk` marcó tier 2 (toca harness) y exigió spec.
- **Lo pedido**: cambiar el disparador del flujo SDD de "prompt tipeado" a
  "issue de GitHub". Evolución a mitad de ciclo a pedido del dueño: un
  vigilante local detecta issues nuevos y abre solo una ventana de PowerShell
  con Claude Code desarrollándolos en autopilot. El hook de sesión queda como
  fallback.
- **Quién lo pide**: el dueño del proyecto (P1er0uni).
- **Contexto relevante**: piloto para ejercitar el flujo SDD antes de
  escalarlo; esta feature es de **capa proceso** (no toca el producto de
  cuentas personales); `gh` autenticado; issues de prueba #2 (trigger) y #3
  (Primera issue) abiertos al momento del ingreso.

## Spec (`specify`)

- Promoción desde FTD: el doc FTD (`../../ftd/sdd-desde-issue.md`) se convirtió
  en input de la spec; el trabajo hecho (script detector + hook SessionStart,
  probados con 0 y 1 issues) se conservó.
- Revisión mayor a pedido del dueño antes de aprobar: el disparador pasa de
  "oferta al abrir sesión" a "vigilante local + ventana en autopilot". El hook
  pasa a fallback. Registrado en `## Revisions` de la spec y en
  `decisions.md`.
- Opciones descartadas: GitHub Actions en la nube (harness rsc no corre allá,
  costo por token); comando semi-manual (el dueño quiere cero pasos manuales).
- Gate: `rsc spec gate` → **PASS** (5 puntos abiertos, todos tipados).
- **Aprobación**: en autopilot — «implementa la spec 2, no me pida
  autorizaciones» (2026-11-13). No es aprobación ítem por ítem; queda
  registrado así en la spec.

**Métricas del paso** — Inicio ~16:00 / fin ~19:30 (aprox., reconstruido) ·
duración repartida en diálogo con el dueño · tokens: n/d · intervenciones
humanas: ~8 (dos rondas AskUserQuestion, aprobación, revisión de
requerimiento) · artefactos: `specs/002-sdd-desde-issue.md`, `decisions.md`
(2 entradas), `index.md`.

## Plan (`plan`)

(ver abajo — se completa al ejecutar el paso)

## Tasks (`tasks`)

## Desarrollo (`implement`)

## Revisión de agentes (`review`)

## Verificación (`verify`)

## Ship (`ship`)

## Métricas
