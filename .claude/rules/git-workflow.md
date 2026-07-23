# Flujo Git

## Reglas

- **Los commits los hace el usuario**, no el agente. El agente sugiere el mensaje.
- **Una fase = un commit** (no commits intermedios por sub-pasos). "Fase" = sub-proyecto del roadmap, o sub-fase si el sub-proyecto se subdivide en su plan.
- Formato: **Conventional Commits**, subject ≤ 50 chars, en español. Body opcional, solo si el "por qué" no es obvio. Ver skill `caveman-commit`.

### Ejemplos

```
feat(infra): setup Next.js 16 + Supabase + Vercel
feat(galeria): grilla de proyectos con lazy load
fix(render): corregir blur placeholder en imagenes pesadas
refactor(data): mover queries Supabase a lib/
docs(roadmap): cerrar fase 1, abrir fase 2
```

## Branches

- `main` = rama estable. Producción se construye desde acá.
- **Una rama por fase**: `fase/<id>-<slug>` (ej. `fase/A-infra-bootstrap`), merge a `main` al aprobar.
- Si un track largo se subdivide en muchas sub-fases, se puede usar **una sola rama** para todo el track y commitear una sub-fase = un commit dentro de ella. Merge a `main` al cerrar el track.

## Ramas de entorno (deploy — cuando aplique)

Modelo de 3 ramas para pipeline dev→prod (CI/CD por GitHub Actions):

- **`main`** — trabajo local / integración. **No deploya nada.**
- **`dev`** — push dispara deploy automático a la instancia dev.
- **`production`** — push dispara deploy automático a producción.

Flujo: `main` → merge a `dev` (probar en server real) → merge a `production` (sale a prod, solo
cuando dev está OK).

## Antes de mergear una fase

- [ ] Build pasa (`pnpm build`) y lint OK. Tests cuando existan.
- [ ] `/security-review` corrido en el branch.
- [ ] `docs/roadmap.md` actualizado (estado del sub-proyecto).
- [ ] `docs/changelog.md` con entrada de la fase.
- [ ] `docs/plans/<fase>-plan.md` marcado DONE.
- [ ] Sin TODOs sin contexto. Sin `dd()` ni `console.log`.

## Nunca

- `--no-verify` / `--no-gpg-sign`.
- `push --force` a `main`.
- Amend de commits ya pusheados.
- Commits con secrets o `.env`.
