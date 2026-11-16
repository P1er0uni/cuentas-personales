---
author: P1er0uni
branch: feature/003-refuters-openai
status: in-progress
---
# Refuters en modelos OpenAI

## Intent

El panel de revisión adversarial (los 3 refuters) hoy corre el mismo modelo que
el resto del harness (GLM-5.3 vía alias `sonnet`). El dueño quiere diversidad
real de modelos: que cada refuter ataque el diff desde un modelo OpenAI
distinto. Sin API key todavía — se deja todo armado para que la key sea el
último paso.

## Scope

**In:**
- Cambiar `model:` en los 3 agentes: `refuter-correctness` → `gpt-6-astra`,
  `refuter-security` → `gpt-6-cyber`, `refuter-tests` → `gpt-6-luna`
  (nombres verificados contra el catálogo vigente de OpenAI, 2026-11-16;
  o3/GPT-5 quedaron deprecados).
- Instalar `claude-code-router` (npm global, sin admin) como traductor entre
  Claude Code y la API de OpenAI.
- Config del router con proveedor OpenAI y **placeholder** de la key
  (variable de entorno `OPENAI_API_KEY`, nunca un secreto en archivo commiteado).

**Out:**
- La API key misma (llega después, la setea el dueño).
- Cambiar orquestador, developer o finding-verifier (siguen en GLM).
- Validar los IDs de modelo contra la API real (requiere key; queda pendiente).

**Riesgo conocido y aceptado:** hasta que existan router activo + key, el
panel tier 2 NO puede invocar a los refuters (error de modelo desconocido).
Cualquier ciclo SDD tier 2 que corra en ese intervalo queda sin panel hasta
completar el último paso.

## Checklist

- [x] Rama `feature/003-refuters-openai` creada desde `origin/main` — prueba: `git status` en la rama.
- [x] Los 3 refuters declaran su modelo OpenAI — prueba: `model:` en cada `.claude/agents/refuter-*.md`.
- [ ] `claude-code-router` instalado a nivel usuario — prueba: salida de `ccr version`.
- [ ] Config del router con proveedor OpenAI y placeholder, sin secreto — prueba: contenido del config, `git check-ignore` si toca el repo.
- [ ] `rsc risk` evaluado sobre el cambio — prueba: tier reportado.
- [ ] Revisor de contexto fresco si el tier lo exige — prueba: veredicto del review.

## Evidence

- 2026-11-16 — Rama creada: `## feature/003-refuters-openai...origin/main` (basada en el main remoto con el merge del PR #4).
- 2026-11-16 — Modelos editados y verificados en los archivos: `refuter-correctness.md` → `model: gpt-6-astra`, `refuter-security.md` → `model: gpt-6-cyber`, `refuter-tests.md` → `model: gpt-6-luna`. Catálogo vigente consultado (developers.openai.com, 2026-11-16): o3 y GPT-5 deprecados.
- 2026-11-16 — Paquete verificado en npm: `@musistudio/claude-code-router@3.1.5` existe. Instalación INTENTADA 3 veces y bloqueada por caída del clasificador de permisos del harness (glm-5.2 timeout, infraestructura, no del proyecto). Pendiente de reintento.
- 2026-11-16 — Cableado GLM verificado: `ANTHROPIC_BASE_URL=https://api-ap-southeast-1.modelarts-maas.com/anthropic`, `ANTHROPIC_MODEL=glm-5.3`, token en `ANTHROPIC_AUTH_TOKEN` (settings de usuario). El config del router preservará ModelArts como ruta por defecto.

## Next

Instalar `@musistudio/claude-code-router@3.1.5` (npm -g, nivel usuario) y
escribir `~/.claude-code-router/config.json`: proveedor modelarts (GLM, por
variable de entorno del token) como default + proveedor openai con placeholder
`OPENAI_API_KEY` para gpt-6-astra/cyber/luna. Después: `rsc risk` y reviewer
si el tier lo exige. La key la aporta el dueño al final; con ella se validan
los IDs reales contra la API y se corre el panel una vez de prueba.

**Encolado por decisión del dueño (2026-11-16):** el MCP de Supabase
(migración de cuentas-personales de SQLite a Postgres, modo "todo con
permiso" vía reglas `ask`) se aplica DESPUÉS de este cambio, por la cadena
ASDD completa — es cambio de fondo (esquema, código, tests).
