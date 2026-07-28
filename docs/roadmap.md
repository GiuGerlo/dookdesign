# Roadmap — dookdesign

> Planificación viva. Estado de cada fase acá. Leer al inicio de cada sesión.

## Estados

`pendiente` · `en progreso` · `DONE` · `bloqueada` (depende de otra fase)

## Fases

Esquema de fases: **números 1–N**.

| Fase | Título | Estado | Depende de | Cierre |
|------|--------|--------|-----------|--------|
| 1 | Bootstrap infra (Next.js 16 + Supabase + Vercel) | DONE | — | 2026-07-23 |
| 2 | Diseño visual con Agustín (colores, fuentes, estructura) | DONE | 1 | 2026-07-23 |
| 3 | Modelo de datos + Supabase (Postgres + Storage + RLS) | DONE | 1 | 2026-07-23 |
| 4 | Admin con login (Supabase Auth) — CRUD + upload de renders | DONE | 3 | 2026-07-23 |
| 4.5 | Admin redesign (shadcn/ui, bugs, sileo, logos) | DONE | 4 | 2026-07-23 |
| 5 | Galería pública + página de proyecto con animaciones | DONE | 2, 4 | 2026-07-25 |
| 6 | Post-launch: portada video, /proyectos editable, keep-alive + observabilidad + hardening | DONE | 5 | 2026-07-26 |
| 7 | Post-launch lote: entorno dev, medidas/entrega, banner envíos, logos + banderas | DONE | 6 | 2026-07-27 |
| 8 | Colores por producto + carrito de presupuesto por WhatsApp | en progreso | 7 | — |

> Ajustá las fases a medida que se concreten. Cada fase: spec → plan → tasks → cierre
> (ver `.claude/rules/docs-workflow.md`).

## Decisiones tomadas (grilling 2026-07-22)

1. **Storage:** Supabase free (1 GB) sirve por ahora. Revisitar si el material crece: servir WebP + Supabase Storage transforms para achicar. Techo conocido, no bloqueante.
2. **Infra/comercial:** Vercel Hobby aceptado. Portfolio con links a WhatsApp = contacto, no tienda → riesgo bajo de takedown (el portfolio de Giuliano en Vercel lo confirma). **Dominio:** arranca gratis con `dookdesign.vercel.app`; custom (`dookdesign.com`) recién al launch, comprar en Cloudflare Registrar (~USD 10/año).
3. **Gestión de contenido:** Agustín gestiona TODO vía un **admin propio con login** (Supabase Auth). Patrón inspirado en `C:\Dev\React\giulianogerlo-portfolio` (AdminRoute + upload por dropzone + CRUD + preview), adaptado a Next.js 16.

**Stack confirmado:** Next.js 16 (no Vite). Optimización de imágenes con `next/image` + Supabase Storage transforms.

## Fase 5 — Diseño del Home público (2026-07-23, en progreso)

Se maquetó en HTML/CSS el **Home público** como referencia visual y de interacción (pendiente portar a componentes Next.js/React + Tailwind con data de Supabase). Concepto "Precision Void" del spec Fase 2 respetado: DM Sans, acento `#3532C5`, paleta dark/light.

**Secciones del Home (orden final):** Hero → Sobre mí → Proyectos → Footer/Contacto.

**Decisiones de diseño tomadas con Agustín:**
- Layout elegido: variante clásica (hero full-bleed + mucho espacio negativo). Se descartó la variante editorial asimétrica.
- Hero: render DX8 a pantalla completa con el logo **DK** (solo iniciales) superpuesto en blanco; el render featured lo elige Agustín en admin.
- Galería: grilla mosaico con tamaños variados (destacado grande + verticales/horizontales), no todas iguales.
- Efecto B&N → color al hover (ref. Starck) + overlay "Ver proyecto →" al pasar el mouse.
- Toggle claro/oscuro con **iconos sol/luna**.
- Categorías: por ahora "Todos / Mobiliario" (única categoría real confirmada).
- Único proyecto con render real: **DX8** (2 imágenes). El resto son placeholders rayados con label.

**Interacciones implementadas en la maqueta:**
- Nav fijo: transparente sobre el hero → fondo sólido + blur + borde al scrollear; logo e iconos que cambian de color.
- Scroll indicator (chevron animado) en el hero, se desvanece al bajar.
- Reveal on scroll (fade + subida) por sección y cards con stagger (IntersectionObserver).
- **Transición de tema con circular reveal** vía View Transitions API (`document.startViewTransition` + `clip-path`); fallback instantáneo si el navegador no soporta o `prefers-reduced-motion`.
- Menú hamburguesa animado (barras → X) con panel fade + links escalonados numerados (01/02/03).
- Loader shimmer mientras cargan los renders.
- Footer completo: CTA "¿Tenés un proyecto en mente?" + botón, columnas Contacto/Redes/Estudio, logo del dev (gg) theme-aware.
- 100% responsive (mosaico desktop → 3 cols tablet → 2 cols mobile).

**Nota para implementación (Claude Code):** la maqueta usa animaciones nativas. Para el toggle de tema en React se recomienda el hook `useModeAnimation` de `react-theme-switch-animation` (usa la misma View Transitions API + `flushSync` por debajo, tipos CIRCLE/BLUR).

## Estado actual del admin (2026-07-23)

El panel admin está funcional y en producción. Rutas bajo `/admin/`:

- `/admin/login` — auth con código 4 dígitos + password (Supabase Auth, `{code}@dookdesign.com`)
- `/admin/proyectos` — lista drag-and-drop con reordenamiento, badges published/featured, miniaturas
- `/admin/proyectos/nuevo` y `/admin/proyectos/[id]` — form completo con upload de renders
- `/admin/categorias` — CRUD con edición inline
- `/admin/configuracion` — about_text, whatsapp_url, email global (contacto **único global**; ver ADR 0001)

**Stack admin:**
- shadcn/ui (Base UI variant) + Tailwind v4 — dark mode forzado siempre
- sileo para notificaciones (posición `top-center`)
- AlertDialog (Base UI) para confirmaciones de borrado destructivo
- dnd-kit para drag-and-drop de proyectos
- react-dropzone para upload de renders a Supabase Storage

**Gotchas conocidos:**
- shadcn instalado con `--base base-ui` → `AlertDialogTrigger` y `Button` NO tienen prop `asChild`, usar `render={<El />}` + `nativeButton={false}` si el elemento no es `<button>`
- Auth guard: `src/proxy.ts` (Next.js 16 renombró `middleware`→`proxy`) protege `/admin/*` y redirige a login sin sesión. Usa `getUser()` (revalida token contra Supabase, no `getSession()`).
- Tema del admin: siempre oscuro, aplicado en `<html>` por `AdminThemeLock` (montado en `admin/layout.tsx`). Necesario para que los portales (sileo toasts, Select, AlertDialog → `document.body`) hereden el oscuro. No volver a ponerlo solo en un div anidado.
- RLS: cada tabla necesita policy `SELECT` explícita para `authenticated` además de la de `anon` (si no, el admin logueado no lee). Hecho para `categories` (0005), `site_settings` (0007) y `storage.objects`/renders (0009 — sin esto `storage.remove()` borra en silencio). El bucket `renders` es público (0008) para servir por CDN.
- Favicon: necesita versión cuadrada 32×32 del logo

## Fase 5 — Cierre (2026-07-25)

**DONE**. Las tres páginas públicas implementadas con data real de Supabase (ver `docs/changelog.md`):

- **Home `/`**: hero + Sobre mí + grilla curada (editable en `/admin/inicio`, `home_grid`) + footer/CTA.
- **Listado `/proyectos`**: filtros categoría+año, "ver más" tras 6, estado vacío.
- **Detalle `/proyectos/[slug]`**: hero carrusel (embla) + contenido + galería con lightbox zoom + CTA WhatsApp/email por proyecto + "Otros proyectos" + prev en nav al scrollear.
- Headers de seguridad en `next.config.ts`; `/security-review` sin findings.
- Deps: `motion`, `embla-carousel-react`, `yet-another-react-lightbox`. Migraciones `0010`/`0011` aplicadas.

**Pendiente operativo (post-fase):**
- Merge de `fase/5-paginas-publicas` → `main`.
- Deploy a Vercel (prod desde `main`), verificar imágenes de Supabase y headers en el entorno real.
- Cargar el WhatsApp como **número** en `/admin/configuracion` para que el CTA lleve el mensaje por proyecto.
- Favicon cuadrado 32×32 (pendiente de fases anteriores).

## Ajustes post-deploy (2026-07-26)

**DONE** (feedback con Agustín tras el primer deploy):
- **Fix deploy prod**: faltaban las env vars `NEXT_PUBLIC_SUPABASE_*` en Vercel (crasheaba el server render). Solución operativa: cargarlas + redeploy con rebuild.
- **Renders de entorno**: nuevo campo `projects.environment_renders` (máx 3, webp sin degradar), admin (`EnvironmentRendersUpload`) + fila fija sin zoom debajo del hero (`ProjectEnvironmentRow`). Migración `0012`.
- **Tagline**: "DISEÑO ARGENTINO" en una línea.
- **Azul en dark**: token `--brand-ink` (aclarado a `#9C99F8` en dark) para legibilidad AA sin romper los pills.

**Pendiente**: QA manual del usuario + commit. Ajustar `--brand-ink` si no llega a AA. Correr `/security-review`.

## SEO + Analytics (2026-07-26)

**DONE**:
- **SEO técnico/on-page**: metadata raíz completa (`metadataBase`, OG, Twitter, robots, keywords, canonical), helper `src/lib/site/seo.ts`.
- **OpenGraph dinámico por proyecto**: `og:image` = primer render del producto.
- **JSON-LD**: `WebSite`+`Person` (home), `CreativeWork`+`BreadcrumbList` (detalle).
- **Sitemap/Robots/llms.txt**: rutas dinámicas (`app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts`).
- **Vercel Analytics**: `<Analytics/>` en el layout.
- **Fix email**: Gmail web compose en vez de `mailto:`.

**Pendiente operativo**:
- Setear `NEXT_PUBLIC_SITE_URL` en Vercel (el dominio real; default `dookdesign.com`).
- Verificar OG real compartiendo un link tras deploy (WhatsApp / debugger).
- Favicon cuadrado 32×32 (asset pendiente de siempre).

## Fase 6 — Post-launch hardening (2026-07-26)

**DONE**. Ver `docs/changelog.md` (entradas portada-inicio, proyectos-pagina, fase-6):
- **Portada del home** con imagen o video, gestionada en `/admin/inicio`; preview espeja el viewport; login seguro (redirige a inicio).
- **Página `/proyectos`** editable (grilla libre + intro) desde `/admin/proyectos-pagina`.
- **Keep-alive** de Supabase (cron diario) para que el free tier no pause el proyecto.
- **Speed Insights** activo (además de Analytics).
- **OG de producto** arreglado con proxy weserv; `sharp` eliminado del repo.
- **Dependabot** + script `pnpm typecheck`.

**Pendiente operativo**:
- Setear `CRON_SECRET` en Vercel (Production) para el cron de keep-alive.
- `pnpm lint` pospuesto (conflicto `eslint-config-next` 16 / `unrs-resolver` / pnpm 11); retomar si se quiere linting en CI.
- Backups periódicos de la DB si el contenido se vuelve crítico (free tier con backups limitados).

**Recomendaciones futuras (no urgentes)**: transforms de imágenes si el material crece · rate-limit en login (Vercel Firewall/BotID) · error monitoring (Sentry) opcional.

## Fase 7 — Post-launch lote (2026-07-27)

**DONE** (feedback con Agustín). Ver `docs/changelog.md` (entrada `post-launch-lote`):
- **Entorno dev**: rama `dev` = preview con dominio fijo `dev.dookdesign.com` (dev → validar → merge a `main` → prod). DB Supabase compartida con prod → aísla código/diseño, no contenido. Vercel Authentication apagada en previews para que Agustín entre sin cuenta.
- **Medidas** (ancho/largo/alto, cm) y **entrega estimada** (días) por proyecto: migración `0020` (aditiva/nullable), CRUD + detalle. Medidas como chips Ancho/Largo/Alto bajo Materiales; entrega centrada.
- **Banner "Envíos a todo el país"** en el footer (grande, centrado, con banderas reales `country-flag-icons`).
- **Analytics**: países con bandera + nombre completo (`Intl.DisplayNames` + `country-flag-icons`).
- **Footer**: tipografía simétrica en la barra final + logos de marca reales WhatsApp/Instagram (fix de ícono instagram que no se aplicaba).

**Pendiente operativo**:
- Commit del lote en `dev` (lo hace el usuario) + merge a `main` cuando Agustín valide.
- `hero_video` sigue como columna muerta (dropear a mano cuando se confirme).
- Favicon cuadrado 32×32 (asset pendiente de siempre).
