# dookdesign

Portfolio de **Agustín Cavallera**, diseñador industrial. Galería visual de diseños y renders en alta calidad, con panel de administración propio para que Agustín gestione todo el contenido sin tocar código.

- **Producción**: [dookdesign.com](https://dookdesign.com)

---

## Qué incluye

**Sitio público**
- Home con portada editable (imagen desktop + móvil, cada una con su encuadre) y grilla curada de proyectos.
- Listado `/proyectos` con grilla libre editable desde el admin.
- Detalle de proyecto `/proyectos/[slug]`: hero carrusel, renders de entorno, ficha (categoría, año, materiales, medidas), galería con lightbox y variantes de color (swatches que mueven el carrusel a la imagen del color).
- Carrito de presupuesto (persistente en el navegador): se juntan productos por color y cantidad y se genera un pedido por WhatsApp a Agustín con el lugar de envío. Sin pagos ni checkout.
- Banner "Envíos a todo el país", footer con contacto y redes.
- Tema claro/oscuro con transición animada, animaciones de scroll, 100% responsive.

**Panel admin** (`/admin`, protegido con login)
- CRUD de proyectos con upload de renders por dropzone a Supabase Storage, reordenamiento drag-and-drop, encuadre por imagen y colores del producto (picker de color asociado a un render).
- Gestión de portada del home, página `/proyectos`, categorías y configuración global (about, contacto).
- Dashboard de analytics (Vercel Web Analytics) con países, dispositivos, referrers y páginas top.

**SEO / observabilidad**
- Metadata + OpenGraph, JSON-LD, sitemap, robots y `llms.txt` dinámicos.
- Vercel Analytics + Speed Insights.
- Cron keep-alive para que el free tier de Supabase no se pause.

---

## Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript) sobre Node 24.
- **Estilos**: Tailwind CSS v4 + shadcn/ui (variante Base UI) en el admin.
- **DB / Storage / Auth**: Supabase (Postgres con RLS + Storage con CDN para renders + Supabase Auth).
- **Animaciones**: `motion`, `embla-carousel-react`, `yet-another-react-lightbox`.
- **Forms**: React Hook Form + Zod. Picker de color: `react-colorful`.
- **Infra**: Vercel (deploy automático por push; prod desde `main`, preview desde `dev`).
- **Gestor de paquetes**: pnpm (siempre pnpm, nunca npm).

---

## Correr en local

Requisitos: Node 24+, pnpm, un proyecto Supabase.

```bash
pnpm install
cp .env.example .env.local   # completar los valores
pnpm dev                     # http://localhost:3000
```

### Variables de entorno

Ver `.env.example`. Las claves:

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase (público). |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server-side. Nunca exponer al cliente. |
| `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` / `VERCEL_TEAM_ID` | Dashboard de analytics en `/admin/analytics`. |
| `CRON_SECRET` | Protege el endpoint del cron keep-alive. |

`.env*` nunca se commitea (salvo `.env.example`).

### Scripts

```bash
pnpm dev         # dev server (Turbopack)
pnpm build       # build de producción
pnpm start       # servir el build
pnpm typecheck   # tsc --noEmit
```

---

## Base de datos

Migraciones versionadas en `supabase/migrations/` (`0001` … `0021`). Schema principal: tabla `projects` (metadata + renders + medidas + entrega + colores), `categories`, `site_settings`, con RLS por rol (lectura pública de publicados, escritura solo admin) y bucket público `renders`. El carrito no usa DB: vive en el navegador (localStorage).

---

## Estructura

```
src/
  app/
    (site)/          # sitio público (home, /proyectos, detalle)
    admin/           # panel con login (CRUD, config, analytics)
    api/keep-alive/  # endpoint del cron
  components/
    site/            # UI pública
    admin/           # UI del panel
    ui/              # primitivos shadcn
  lib/               # queries Supabase, helpers, schemas Zod
  types/             # tipos generados de la DB
supabase/migrations/ # SQL versionado
docs/                # roadmap, changelog, ADRs, planes
```

---

## Deploy

Modelo de dos ramas, deploy automático de Vercel por push:

- **`dev`** → preview en `dev.dookdesign.com`. Se sube acá para que Agustín valide.
- **`main`** → producción en `dookdesign.com`. Merge desde `dev` cuando está aprobado.

---

## Documentación

- Guía del proyecto y convenciones: `CLAUDE.md` y `.claude/rules/`.
- Estado y planificación: `docs/roadmap.md`.
- Historial de cambios: `docs/changelog.md`.
- Decisiones de arquitectura: `docs/adr/`.
