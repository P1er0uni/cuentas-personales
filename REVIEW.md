# REVIEW.md — lo que el revisor lee primero

Específico de este repo. Ratificado junto con la constitución; se enmienda,
nunca se edita en silencio.

## What failure looks like here

- Un endpoint que acepta input sin validar (monto negativo o no numérico,
  fecha malformada, `tipo` fuera de `ingreso|gasto`).
- SQL concatenado en vez de prepared statement (`db.prepare`).
- Errores de API que rompen la forma `{"errores": [...]}` / `{"error": "..."}`.
- UI que pierde teclado, labels o modo oscuro.
- Un paso del workflow cerrado sin su sección de métricas en el documento de
  la feature (viola la constitución, principio 11).

## Paths to skip

`node_modules/`, `data/`, `.rsc/`, `01-TOOLS/_TEMPLATE/`.

## Nit cap

3 nits por revisión; el resto se descarta.

## Always-human paths

Hoy ninguna (app local sin auth ni pagos). Si se agrega autenticación, pagos
o infraestructura, pasa a requerir humano — y para que se *exija* (no solo se
recomiende) debe listarse en `.rsc/sello-config.json` → `risk.raise`, que lee
`rsc risk`.

## Summary starts with a count

Toda revisión abre con «N hallazgos: X bloqueantes, Y nits» antes que
cualquier otra cosa.
