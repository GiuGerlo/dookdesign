# Spec — Fase 5: páginas públicas (Home + /proyectos + /proyectos/[slug])

- **Fecha**: 2026-07-25
- **Estado**: aprobado (diseño visual armado en claude design por el usuario; decisiones tomadas con Agustín)
- **Diseños fuente** (claude design, proyecto `aa13bc56-ae13-4fff-9f75-2ac1b1c50fe6`):
  `Home Público.dc.html`, `Proyectos.dc.html`, `Proyecto Detalle.dc.html`.

## Alcance

Tres páginas públicas con data real de Supabase (RLS anon → solo `published=true`):

1. **Home `/`** — hoy stub.
2. **Listado `/proyectos`** — filtrable.
3. **Detalle `/proyectos/[slug]`** — galería fullscreen de renders.

Deps de UI de esta fase: `motion`, `embla-carousel-react` (lightbox `yet-another-react-lightbox` ya instalado).

## Página Home `/`

Secciones: Hero → Sobre mí → Proyectos (mosaico) → Footer/Contacto.

- Nav fija: transparente sobre el hero → fondo sólido + blur + borde al scrollear. Hamburguesa animada en móvil (panel con links numerados).
- Toggle claro/oscuro sol/luna con circular reveal (View Transitions API; fallback instantáneo sin soporte o con `prefers-reduced-motion`).
- Hero: render del proyecto `featured` fullscreen con logo DK superpuesto + scroll indicator.
- Sobre mí: `site_settings.about_text` (texto plano, `whitespace-pre-line`).
- Proyectos: mosaico de publicados con B&W→color al hover + overlay "Ver proyecto →"; link al detalle; CTA "Ver todos" → `/proyectos`.
- Footer: CTA contacto global (WhatsApp/email de `site_settings`), columnas, logo dev.
- Reveals al scroll con motion.

## Página `/proyectos` (listado)

<15 proyectos, sin paginación.

1. Header del sitio reutilizado.
2. Intro: título "Proyectos" + línea corta, reveal sutil.
3. Filtros: chips de **categoría** (+ "Todos") y **año** (+ "Todos"), combinados (AND), client-side. Estado vacío elegante.
4. Grid: 1 col móvil · 2 tablet · 3 desktop. Orden year desc, order asc. Card = portada `renders[0]` (~4:3), title, year, badge categoría.
   - Imagen `grayscale(1)` → color al hover (+ zoom leve), ~300ms, **solo `@media (hover:hover)`**; touch siempre color. Card entera clickeable.
5. "Ver más": 6 iniciales; el resto se revela con stagger.

## Página `/proyectos/[slug]` (detalle)

1. **Hero carrusel fullscreen** (~100svh, `object-cover`): swipe + flechas + contador `1/6`; autoplay lento opcional pausable (`prefers-reduced-motion`). Overlay título + año/categoría, degradado, scroll indicator. Primera imagen `priority`.
2. **Contenido** (reveals): título + año + badge categoría; `description` `max-w-prose whitespace-pre-line` (no HTML crudo); materiales como badges.
3. **Galería**: grilla de todos los renders → lightbox fullscreen (zoom pan/pinch/doble-tap, flechas, Esc/click fuera, trap de foco).
4. **CTA contacto global**: WhatsApp (`wa.me` + mensaje del producto) y Email (`mailto` + subject) desde `site_settings` vía `src/lib/site/contact.ts`.
5. Nav "← Volver a proyectos". Slug inexistente → 404.

## Reglas transversales

- Semántica (`main/nav/section`, un solo `h1`), `alt` = title (+índice).
- Teclado en filtros/cards/carrusel/lightbox; flechas + Esc. Foco visible. Touch targets ≥44px.
- `prefers-reduced-motion` respetado. Contraste AA en ambos temas.
- Imágenes `next/image` con `sizes` correctos, hero `priority`, sin layout shift.

## Seguridad

- mailto/wa.me con `encodeURIComponent` + número saneado (helper existente). Sin `dangerouslySetInnerHTML`.
- Headers de seguridad (HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, CSP) en `next.config.ts` al cerrar la fase + `/security-review`.

## Criterio de done

Ver plan `docs/plans/5-paginas-publicas-plan.md` (verificación por sub-fase + QA manual del usuario antes de cada commit).
