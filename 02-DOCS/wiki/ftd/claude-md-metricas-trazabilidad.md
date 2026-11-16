---
author: P1er0uni
branch: main (cambio de docs/config, sin rama por regla FTD)
status: in-progress
---
# CLAUDE.md — métricas por paso y trazabilidad prompt → spec → plan

## Intent

El dueño quiere que cada ciclo SDD deje registro de métricas por paso (tiempo y
tokens) y de qué spec y qué plan se generaron a partir de su prompt inicial.
Las reglas ya existen (`02-DOCS/wiki/sdd/REGLAS-DOCUMENTACION.md`, reglas 4 y 5)
y así se hizo en las features 001 y 002, pero CLAUDE.md — lo único que el agente
carga en cada sesión — no las menciona: una sesión nueva puede saltárselas.

## Scope

**In:** extender la sección «Convenciones» de CLAUDE.md con (1) la obligación de
métricas por paso y sección «Métricas» acumulada, y (2) la trazabilidad del
prompt inicial a la spec y al plan generados, con sus rutas reales.

**Out:** tocar REGLAS-DOCUMENTACION.md, las features pasadas, settings.json,
agentes o cualquier archivo del harness. No se reescribe historial.

**Corrección de paso:** CLAUDE.md dice «specs numeradas en `specs/`» pero la
carpeta raíz `specs/` no existe; las specs viven en `02-DOCS/wiki/sdd/specs/`.
Se corrige la ruta en la misma edición (es justo la ruta que hay que registrar).

## Checklist

- [x] CLAUDE.md exige métricas por paso (inicio/fin, duración, tokens,
  intervenciones) y sección «Métricas» acumulada — prueba: releer CLAUDE.md y
  ver la convención nueva apuntando a REGLAS-DOCUMENTACION.md.
- [x] CLAUDE.md exige registrar el prompt inicial y la spec y el plan que
  generó, con rutas correctas — prueba: releer y ver rutas
  `02-DOCS/wiki/sdd/specs/` y `02-DOCS/wiki/sdd/plans/`.
- [x] `rsc risk` evaluado — prueba: tier reportado.

## Evidence

- 2026-11-16 — Edit aplicado a CLAUDE.md: la convención SDD ahora apunta a
  `REGLAS-DOCUMENTACION.md`, exige métricas por paso + sección «Métricas»,
  exige registrar prompt inicial → spec → plan, y corrige la ruta de specs
  (`specs/` no existe; la real es `02-DOCS/wiki/sdd/specs/`). Verificado
  releyendo el archivo tras el Edit.
- 2026-11-16 — `npx @ericrisco/rsc risk` → **tier 2** (clases: default, docs,
  harness; revisores: 3; aprobación humana requerida). Motivo: CLAUDE.md está
  en la tabla de riesgo como capa harness. Escalada a ASDD obligatoria:
  spec vinculada a la rama + `rsc spec gate` + panel antes de push/PR.
- 2026-11-16 — **Incidente**: la primera edición de CLAUDE.md desapareció del
  disco (buffer viejo de un editor la pisó, o revert manual). Confirmado
  releyendo el archivo: texto original. El dueño ordenó reaplicar.
- 2026-11-16 — El dueño eligió **desbloquear main** (`rsc main unlock`
  ejecutado, salida: «the agent may now work on the default branch») en vez
  de rama + gate + panel. Excepción al tier 2 registrada en `decisions.md`.
- 2026-11-16 — Edición **reaplicada** a CLAUDE.md (mismo contenido) y
  verificada por el resultado del Edit. decisions.md actualizado (entrada
  2026-11-16). `.rsc.json` quedó modificado por el unlock (pendiente de
  commit a decisión del dueño).

## Next

Commit de CLAUDE.md + `.rsc.json` + docs (a pedido del dueño; main ya está
desbloqueada). Recordarle recargar CLAUDE.md en su editor para que no pise
la edición otra vez.
