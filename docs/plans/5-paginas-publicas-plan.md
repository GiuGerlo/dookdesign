# Plan — Fase 5: páginas públicas (Home + /proyectos + /proyectos/[slug])

- **Spec**: `docs/superpowers/specs/2026-07-25-fase5-paginas-publicas-design.md`
- **Rama**: `fase/5-paginas-publicas` — 3 sub-fases = 3 commits (Home → listado → detalle). Merge a main al cerrar.
- **Estado**: DONE (2026-07-25) — B1+B1.1 (home), B2 (/proyectos), B3 (detalle + headers) implementados y verificados con build.

## Reusar (ya existe)

- `src/lib/projects/queries.ts` — getPublishedProjects / getProjectBySlug / getCategories / getSiteSettings.
- `src/lib/site/contact.ts` — buildWhatsappUrl / buildMailto (title opcional → mensaje genérico).
- `src/lib/site/images.ts` — getPublicRenderUrl (puro, server-safe).
- `yet-another-react-lightbox` (+ plugin Zoom). Tema: vars CSS + `[data-theme="dark"]`; script anti-flash en layout raíz.

## Setup (1er commit) — ✅

- [x] Rama creada.
- [x] `pnpm add motion embla-carousel-react`.
- [x] `src/lib/site/images.ts` nuevo.
- [x] `contact.ts`: title opcional (CTA genérico de la home).
- [x] Spec + este plan.

## Sub-fase B1 — Home

- [ ] Importar `Home Público.dc.html` del claude design.
- [ ] Portar: `SiteHeader` (nav blur + hamburguesa), `ThemeToggle` sol/luna + View Transitions, Hero featured, Sobre mí, mosaico proyectos, Footer/CTA. Componentes en `src/components/site/`.
- [ ] Data real: `getPublishedProjects()` + `getSiteSettings()`.
- [ ] `pnpm build` + guía QA → commit usuario: `feat(site): home publica con data de supabase`.

## Sub-fase B2 — /proyectos

- [ ] Importar `Proyectos.dc.html`.
- [ ] `proyectos/page.tsx` (server) + `ProjectsGrid`/`FilterBar`/`ProjectCard` (client): filtros AND categoría+año, B&W→color hover, "ver más" tras 6, estado vacío.
- [ ] `pnpm build` + guía QA → commit: `feat(site): listado /proyectos con filtros`.

## Sub-fase B3 — /proyectos/[slug] + cierre

- [ ] Importar `Proyecto Detalle.dc.html`.
- [ ] `proyectos/[slug]/page.tsx` (server, `notFound()`, `generateMetadata`) + `ProjectHeroCarousel` (embla), contenido, `ProjectGallery` + lightbox Zoom, `ContactCTA`, volver.
- [ ] Headers de seguridad en `next.config.ts` (HSTS, XCTO, XFO, Referrer-Policy, CSP).
- [ ] `/security-review` + review `web-design-guidelines` (3 páginas).
- [ ] `docs/roadmap.md` fase 5 DONE + `docs/changelog.md` + plan DONE.
- [ ] `pnpm build` + guía QA → commit: `feat(site): detalle de proyecto + headers seguridad`.

## Verificación

- **B1**: home claro/oscuro, toggle reveal circular, nav blur, mosaico linkea detalle, CTA wa.me con mensaje, responsive 375px.
- **B2**: filtros combinados, hover B&W→color solo desktop, "ver más", vacío elegante, teclado.
- **B3**: carrusel swipe/flechas/contador, lightbox zoom/Esc/foco, CTA mensaje del proyecto, 404 en slug malo, sin layout shift.
- Transversal: `prefers-reduced-motion`, ambos temas, sin `console.log`.
