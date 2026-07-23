---
description: Re-sincroniza tasks ↔ plan ↔ roadmap. Detecta drift.
---

Sincronizá el estado del proyecto.

Pasos:

1. Listá tasks con `TaskList`.
2. Leé `docs/roadmap.md` y `docs/plans/*.md`.
3. Reportá inconsistencias:
   - Tasks marcadas DONE pero plan no.
   - Plan con pasos DONE pero tasks pendientes.
   - Roadmap con fase DONE pero plan/spec faltantes.
   - Specs sin plan.
   - Planes sin spec.
4. Para cada inconsistencia, sugerí la corrección concreta. **No la apliques** sin confirmación del usuario.
5. Si todo está alineado, respondé `OK — todo sincronizado.` y nada más.
