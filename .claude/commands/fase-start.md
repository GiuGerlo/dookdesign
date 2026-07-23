---
description: Arranca una nueva fase del roadmap — lee spec/plan, crea tasks, alinea contexto.
---

Arrancá la fase indicada por `$ARGUMENTS` (ej. `A`, `B`, o `1`, `2`, según el esquema de fases del proyecto).

Pasos:

1. Leé `docs/roadmap.md` y confirmá el estado actual de la fase `$ARGUMENTS`. Si no está en `pendiente` o `en progreso`, avisá y parate.
2. Leé `docs/superpowers/specs/*-$ARGUMENTS-*-design.md` (el spec más reciente de la fase).
3. Leé `docs/plans/$ARGUMENTS-*-plan.md` si existe.
4. Si NO existe el spec → recordá al usuario que hay que correr `/brainstorming` antes.
5. Si NO existe el plan → recordá que hay que correr writing-plans antes.
6. Si ambos existen:
   - Resumí en ≤5 bullets el objetivo de la fase y los pasos del plan.
   - Creá tasks con `TaskCreate` reflejando el plan 1:1.
   - Marcá el primer task como `in_progress`.
   - Confirmá con el usuario antes de empezar a codear.
7. Verificá que la rama actual sea `fase/$ARGUMENTS-<slug>`. Si no, sugerí crearla.
