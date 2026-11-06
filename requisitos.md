# Requisitos para empezar — checklist de arranque del piloto

Estado al 2026-11-06. Este documento es la lista de lo necesario para arrancar
la feature 001 por el flujo SDD; se actualiza a medida que se cierra cada punto.

## Infraestructura

- [x] Repo git local con remoto en GitHub (`P1er0uni/cuentas-personales`, main)
- [x] Node.js 24 LTS + npm funcionando
- [x] Mini-proyecto base operando: Express 5 + better-sqlite3 + Vitest (7/7 tests)
- [x] App corriendo en `http://localhost:3000`

## Harness SDD

- [x] RSC Harness v4.0.5 instalado (plan `fd4f9dc3…` aceptado)
- [x] `rsc doctor`: healthy — 32 skills, 5 agentes de revisión, guards armados
- [x] Gitmoji guard armado · knowledge-sync activo (rama `rsc/knowledge`)

## Gobierno del proceso

- [x] Reglas de documentación aprobadas → `02-DOCS/wiki/sdd/REGLAS-DOCUMENTACION.md`
- [x] Log de decisiones → `02-DOCS/wiki/sdd/decisions.md`
- [x] `REVIEW.md` en la raíz (qué cuenta como fallo, nit cap, rutas a saltar)
- [x] Knowledge map → `02-DOCS/wiki/index.md`
- [x] **Constitución ratificada v1.0.0** (2026-11-06, 11 principios + DoD)
- [x] Commit del montaje completo y push a GitHub (`bf46f29`, 2026-11-06)

## Feature 001 — Exportar a CSV

- [x] Registrada y documentada → `02-DOCS/wiki/sdd/features/001-exportar-csv.md`
- [ ] Commit de registro en su rama `feature/001-exportar-csv` (Regla 2)
- [ ] Spec (`specify`) → Plan → Tasks → Desarrollo → Revisión de agentes → Verify → Ship

## Cómo arrancamos (secuencia exacta)

1. Ratificar la constitución (quita `status: draft`, pasa a v1.0.0)
2. Commitear el montaje completo y pushear a GitHub
3. Crear la rama `feature/001-exportar-csv`; su primer commit es el registro de ingreso
4. Correr la fase `specify` para la feature 001
5. En adelante: cada paso del workflow se cierra con su sección de métricas en
   el documento de la feature + commit, antes de pasar al siguiente

## Métricas del piloto (cómo se miden)

- **Tiempos**: reloj por paso — inicio, fin y duración quedan en el doc de la feature
- **Tokens y costo**: los agrega el agente desde las transcripciones de sesión
  (`~/.claude/projects/<proyecto>/*.jsonl`, campo `usage`) por ventana inicio–fin
  del paso; costo con tabla de precios del modelo en uso (GLM)
- **Intervenciones humanas**: mensajes/decisiones del usuario durante cada paso
