# Flujo de documentación

Este proyecto se sostiene en docs sincronizados. Si los docs y el código mienten, ganan los docs (porque ahí está la intención) — actualizar código o doc, nunca dejar la inconsistencia.

## Ciclo por sub-proyecto

Cada sub-proyecto del roadmap pasa por estas etapas obligatorias:

1. **Spec** (`/brainstorming` → skill writing-plans):
   - Output: `docs/superpowers/specs/YYYY-MM-DD-<fase>-<slug>-design.md`.
   - Aprobado por el usuario antes de avanzar.
2. **Plan** (skill writing-plans):
   - Output: `docs/plans/<fase>-<slug>-plan.md`.
   - Granularidad: cada paso accionable, con criterio de "done".
3. **Grilling** (obligatorio tras cada plan):
   - **SIEMPRE `/grill-me`** después de armar un plan, para afilarlo antes de codear.
   - **`/grill-with-docs`** en su lugar cuando el plan tiene decisiones de arquitectura que ameritan
     ADRs/glosario (DB, auth, deploy, modelo de dominio) — así la entrevista deja los ADRs escritos.
   - Nota: los skills tienen `disable-model-invocation: true` → los dispara el usuario con el slash.
     El agente debe pedir explícitamente correrlo al terminar el plan si el usuario no lo hizo.
4. **Tasks** (TaskCreate):
   - Reflejan el plan 1:1. Marcar `in_progress` / `completed` en tiempo real.
5. **Decisiones** (ADR):
   - Cualquier decisión que afecte fuera de la fase (DB, auth, deploy, etc.) → `docs/adr/NNNN-<slug>.md`.
6. **Cierre**:
   - `docs/changelog.md` += entrada con fecha y resumen.
   - `docs/roadmap.md` → estado del sub-proyecto = DONE, dependientes desbloqueados.
   - Plan marcado DONE.
   - Sugerir commit message (`caveman-commit`).

## Formato ADR

```markdown
# NNNN — Título corto de la decisión

- **Estado**: propuesta | aceptada | reemplazada por NNNN
- **Fecha**: YYYY-MM-DD
- **Contexto**: por qué surgió la pregunta.
- **Opciones consideradas**: A / B / C con pros y contras.
- **Decisión**: qué elegimos.
- **Consecuencias**: qué cambia, qué deuda queda, qué hay que revisitar.
```

## Formato changelog

Cada entrada:

```markdown
## [YYYY-MM-DD] <fase> — Título

**Resumen**: 1-2 oraciones.

**Cambios**:
- ...
- ...

**Breaking**: nada / ...
**Migración**: nada / pasos.
```

## Sincronización

- Antes de empezar una sesión, leer `roadmap.md` para saber dónde estamos.
- Si el usuario cambia de prioridad, actualizar `roadmap.md` ANTES de codear.
- Los specs son inmutables una vez aprobados — si la realidad cambia, **nuevo spec** que reemplace, no editar el viejo silenciosamente.

## Anti-patrones

- "Lo documento después" → no. Si la fase no está documentada, no está cerrada.
- Specs de 20 páginas para una tarea de 10 minutos → escala el spec a la complejidad real.
- Duplicar info entre CLAUDE.md y rules/ → el CLAUDE.md raíz solo apunta.
