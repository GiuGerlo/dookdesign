---
description: Cierra la fase actual — actualiza roadmap, changelog, sugiere commit.
---

Cerrá la fase indicada por `$ARGUMENTS`.

Pasos:

1. Verificá tasks pendientes — si hay alguna sin completar, listalas y parate.
2. Verificá build: `pnpm build` (y lint). Corré tests si existen. Si falla, listá errores y parate.
3. Sugerí correr `/security-review` sobre el branch (no lo invoques vos, decíselo al usuario).
4. Actualizá `docs/roadmap.md`: estado de la fase `$ARGUMENTS` → DONE, fecha de cierre, marcá dependientes desbloqueados.
5. Agregá entrada a `docs/changelog.md` con:
   - Fecha.
   - Resumen ≤2 oraciones.
   - Bullets de cambios principales.
   - Breaking / migración si aplica.
6. Marcá DONE el `docs/plans/$ARGUMENTS-*-plan.md` (sello al final del archivo: `> ✅ DONE — YYYY-MM-DD`).
7. Sugerí mensaje de commit en formato Conventional Commits (≤50 chars en subject). Usá skill `caveman-commit` si está disponible.
8. **No** hagas el commit vos — el usuario lo ejecuta.
