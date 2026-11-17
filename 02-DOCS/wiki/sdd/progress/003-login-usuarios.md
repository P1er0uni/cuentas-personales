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
