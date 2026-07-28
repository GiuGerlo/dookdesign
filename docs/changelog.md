# Changelog

Historial por fase. Formato en `.claude/rules/docs-workflow.md`.

<!-- Cada entrada nueva va arriba (más reciente primero).

## [YYYY-MM-DD] fase-X — Título

**Resumen**: 1-2 oraciones.

**Cambios**:
- ...

**Breaking**: nada / ...
**Migración**: nada / pasos.
-->

## [2026-07-28] fase-8 — Colores por producto + carrito de presupuesto por WhatsApp

**Resumen**: Cada proyecto puede definir sus colores reales (hex + nombre) asociados a una imagen; en el detalle los swatches mueven el carrusel a la imagen del color. Se agrega un carrito (localStorage) accesible desde el navbar: el visitante junta productos por color y cantidad, escribe el lugar de envío y genera un pedido de presupuesto por WhatsApp a Agustín. Sin pagos ni checkout (ver ADR 0002).

**Cambios**:
- **Colores** (`projects.colors`, jsonb, cada uno `{ hex, name, render }`): card "Colores" en el CRUD con picker `react-colorful` (hex exacto, no presets), nombre y asociación a un render subido. Si se borra el render asociado, el color se marca "sin imagen" y bloquea guardar hasta reasignar.
- **Detalle público**: swatches de color bajo el título del hero → al tocar uno el carrusel salta a la imagen de ese color (Embla `scrollTo`). Con colores, elegir uno es obligatorio para agregar al carrito; sin colores se agrega igual.
- **Carrito** (`src/lib/site/cart.ts`): store cliente con `useSyncExternalStore` + localStorage (`dook_cart`), sin backend ni Provider. Ícono con badge siempre visible en el navbar; drawer deslizante con lista (thumb, color, cantidad, eliminar), campo obligatorio "Enviar a" y botón "Pedir presupuesto".
- **Pedido**: `buildCartWhatsappUrl` arma un mensaje multilínea (producto — color — cantidad + lugar) → `wa.me` al número de `site_settings`. Tras abrir WhatsApp el drawer pasa a confirmación (vaciado manual: no se puede saber si el visitante envió).
- Se reemplaza el botón WhatsApp directo del detalle por el flujo de carrito (queda el contacto por email).

**Breaking**: nada.
**Migración**: `0021_project_colors.sql` (aditiva, `colors jsonb default '[]'`). **Deps**: +`react-colorful`.

## [2026-07-27] post-launch-lote — Entorno dev, medidas/entrega, banner de envíos, logos y banderas

**Resumen**: Lote de fixes/features post-launch: se monta el entorno `dev` (preview con dominio fijo para que Agustín valide antes de prod), se agregan medidas y entrega estimada a los proyectos, un banner de "Envíos a todo el país" en el footer, y se mejoran analytics (banderas + nombre de país) y los logos del footer.

**Cambios**:
- **Infra dev**: rama `dev` (preview en Vercel con dominio fijo `dev.dookdesign.com`; flujo dev → validar → merge a `main` → prod). Se borró la rama stale `fase/5-paginas-publicas`. Nota: dev y prod comparten la misma DB Supabase (free tier) → aísla código/diseño, no contenido. Deployment Protection de previews apagada para que Agustín entre sin cuenta de Vercel.
- **Medidas** (`projects.width_cm`, `length_cm`, `height_cm`, integer nullable): CRUD en card "Información" (3 inputs cm) + detalle público como chips etiquetados **Ancho/Largo/Alto** debajo de Materiales en la columna izquierda (muestra solo las presentes).
- **Entrega estimada** (`projects.delivery_days`, integer nullable): input en el CRUD + "Entrega estimada en X días" centrada full-width en el detalle.
- **Banner "Envíos a todo el país"** 🇦🇷: sección estática grande y centrada en el footer, arriba del CTA, con líneas divisorias. Bandera del paquete `country-flag-icons` (vector real).
- **Analytics** (`/admin/analytics`): países ahora con **bandera vectorial + nombre completo** (`Intl.DisplayNames` es-AR + `country-flag-icons`), antes solo el código ISO.
- **Footer**: barra final con tipografía simétrica (mismo size/uppercase/tracking en copyright y crédito del dev); **logos de marca reales** de WhatsApp e Instagram (SVG inline, antes íconos genéricos de lucide). Fix: el ícono de Instagram nunca se aplicaba (key del map `'Instagram'` vs handle `'dookdesign__'`).

**Breaking**: nada.
**Migración**: `0020_project_measures_delivery.sql` (aplicada, aditiva/nullable). **Deps**: +`country-flag-icons`. **Operativo**: asignar `dev.dookdesign.com` a la rama `dev` en Vercel (hecho) + apagar Vercel Authentication en previews (hecho).

## [2026-07-26] hero-2-imagenes — Portada con imagen separada desktop/móvil (sin video)

**Resumen**: La portada del home pasa a tener dos imágenes independientes (una ancha para desktop, una angosta para móvil), cada una con su propio encuadre X/Y. Se elimina el soporte de video.

**Cambios**:
- **DB**: `site_settings` + `hero_image_mobile`, `hero_focus_mobile`, `hero_focus_x_mobile`. Migración `0019` (aplicada, aditiva). `hero_video` queda como columna muerta (el código ya no la usa; dropear a mano cuando se confirme).
- **Admin** (`HeroSettingsForm`): dos slots (desktop + móvil), cada uno con dropzone, preview con el aspecto de su dispositivo (desktop = viewport, móvil ≈ 0.7) y sliders X/Y. Se quitó todo lo de video (`uploadVideo` borrado de storage).
- **Público** (`HomeHero`): `<picture>` con `<source media="(max-width:767px)">` → baja solo la imagen del dispositivo; encuadre por dispositivo vía `<style>` con media query. Si no hay imagen móvil, usa la de desktop.

**Breaking**: se quita el video de portada (si alguien había subido uno, deja de mostrarse).
**Migración**: `0019` (aplicada). `hero_video` no se dropeó (requiere OK explícito).

## [2026-07-26] fase-6 — Post-launch: keep-alive, observabilidad y hardening

**Resumen**: Cron diario que mantiene despierto Supabase (evita la pausa por inactividad del free tier), Speed Insights, y se sacó el OG dinámico por producto (nunca funcionó fiable) dejando el OG estático del sitio.

**Cambios**:
- **Keep-alive**: ruta `src/app/api/keep-alive/route.ts` (query trivial a `site_settings`, opcional `CRON_SECRET`) + `vercel.json` con cron diario `0 6 * * *`. Cualquier request resetea el timer de pausa de 7 días.
- **Speed Insights**: `@vercel/speed-insights` + `<SpeedInsights/>` en `layout.tsx` (junto a Analytics). CSP no requiere cambios (mismo origen `/_vercel`).
- **OG de producto eliminado**: se borró la ruta `/proyectos/[slug]/og` (sharp, rota en Vercel), se probó un proxy weserv que tampoco convenció, y finalmente **todos los productos usan el OG estático `/og-home.png`**. Se quitó `sharp` de deps + su workaround de libvips en `next.config.ts`.
- **Dependabot**: `.github/dependabot.yml` (npm semanal, PRs agrupados minor/patch).
- **Scripts**: `pnpm typecheck` (`tsc --noEmit`). Lint pospuesto: `eslint-config-next` 16 arrastra un resolver nativo (`unrs-resolver`) que choca con pnpm 11.

**Breaking**: nada.
**Migración**: nada. **Operativo**: setear `CRON_SECRET` en Vercel (Production) para proteger el endpoint del cron.

## [2026-07-26] proyectos-pagina — Página /proyectos editable desde admin

**Resumen**: La página pública `/proyectos` pasa a grilla libre curable (orden, tamaño y encuadre X/Y por proyecto y breakpoint) más texto de intro editable, gestionada en la nueva sección `/admin/proyectos-pagina`. Se quitaron filtros y "Ver más".

**Cambios**:
- **DB**: `site_settings.projects_intro` (text) + `projects_grid` (jsonb). Migración `0018_projects_page.sql` (aplicada).
- **Schemas**: `gridItemSchema` extraído; `homeGridSchema` (cap 12) y `projectsGridSchema` (sin tope) derivan de él.
- **Admin**: `ProjectsPageEditor` reutiliza `GridTile` del home (drag/tamaño/encuadre/Desktop-Móvil), auto-incluye todos los publicados. Nueva ruta + links en nav (fix de active-link por colisión de prefijo).
- **Público**: `ProjectsFreeGrid` reusa `.home-grid` + `gridItemVars`. `ProjectsGrid.tsx` borrado.

**Breaking**: se pierden los filtros categoría/año y el "Ver más" en `/proyectos`.
**Migración**: `0018` (aplicada).

## [2026-07-26] portada-inicio — Portada del home con imagen o video, movida a /admin/inicio

**Resumen**: La portada del home se gestiona ahora en `/admin/inicio` (no en Configuración), acepta imagen **o** video, y el preview espeja el recorte real del dispositivo. Login redirige a `/admin/inicio` y bloquea el acceso si ya hay sesión.

**Cambios**:
- **DB**: `site_settings.hero_video` (text). Migración `0017_hero_video.sql` (aplicada).
- **Admin**: `HeroSettingsForm` (imagen/video + sliders X/Y + preview con `aspectRatio` = viewport) en `/admin/inicio`; sacada de `SiteSettingsForm`. `uploadVideo` en storage (crudo, aviso de peso).
- **Público**: `HomeHero` renderiza `<video autoplay loop muted>` si hay `hero_video`, si no la imagen.
- **Seguridad/login**: `proxy.ts` redirige a `/admin/inicio` si un logueado abre `/admin/login`; login apunta a inicio.
- **Fixes UI**: layout de "Editar proyecto" a masonry (sin huecos blancos); placeholder gris `onError` en renders/renders de entorno (evita cajas negras por refs huérfanas).

**Breaking**: la portada ya no se edita en `/admin/configuracion`.
**Migración**: `0017` (aplicada). Limpieza puntual de `environment_renders` huérfanos del proyecto `ef83de82`.

## [2026-07-26] admin-analytics — Dashboard de analytics en /admin

**Resumen**: Nueva página `/admin/analytics` que consume la Web Analytics API de Vercel del lado server, para que el cliente vea el tráfico con su login de admin existente (sin darle acceso a Vercel).

**Cambios**:
- **Helper** `src/lib/admin/vercel-analytics.ts` (`server-only`): llama a `api.vercel.com/v1/query/web-analytics/{visits/count,visits/aggregate}` con `VERCEL_TOKEN`; cachea 5 min (`revalidate: 300`). Filtra rutas `/admin` de top páginas. Devuelve `null` si falta config → la UI avisa.
- **Página** `/admin/analytics` (server component): selector 7/30/90 días por URL (`?days=`, sin JS de cliente), 2 tarjetas (visitantes + páginas vistas) y 4 rankings (top páginas, países con bandera, dispositivos, referrers).
- **Nav**: item "Analytics" (icono `BarChart3`) en `AdminNav` + `AdminBottomNav`.
- **Env**: `VERCEL_TOKEN` (secreto), `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` documentadas en `.env.example`.

**Breaking**: nada.
**Migración**: nada. **Requiere** crear un Vercel Access Token y setear las 3 env vars en `.env.local` y en Vercel.

**Resumen**: Los renders de entorno dejan de ser una fila fija 4:3: cada celda (máx 3) elige su forma (cuadrada/horizontal/vertical/panorámica), se reordena por drag y se encuadra con sliders X/Y. Las imágenes rectangulares entran sin recorte excesivo.

**Cambios**:
- **Layout por imagen**: nueva columna `projects.environment_layout` (jsonb) = `{ "<path>": { size, focus, focus_x } }`. `envSizeEnum` + `envSizeGeom` (span + aspect-ratio) + `ENV_DEFAULT` en `schemas.ts`.
- **Público** (`ProjectEnvironmentRow`): flex-wrap centrado; cada celda toma ancho por `span` (1-2 de 3) y `aspect-ratio` por forma, con `object-position` del encuadre (cover). Data vieja sin layout = 4:3 centrado (fallback).
- **Admin** (`EnvironmentRendersUpload`): reescrito con dnd-kit sortable (reorden), 4 botones de forma, sliders Y (derecha) + X (arriba), badge "sin recorte" por eje (detección aspecto imagen vs celda), preview en vivo. Poda el layout al borrar; inicializa defaults al subir.

**Breaking**: nada. Renders de entorno existentes se ven 4:3 como antes hasta reeditarlos.
**Migración**: `0016_environment_layout.sql` (aplicada) — `environment_layout` jsonb.

## [2026-07-26] grilla+encuadre-x — Grilla libre + recorte horizontal

**Resumen**: La grilla del home pasa de auto-flow a posición libre por celda (drag), con layouts independientes para desktop y móvil; y el encuadre gana el eje horizontal (X) en los 3 lugares donde ya existía el vertical.

**Cambios**:
- **Recorte eje X**: paridad con el eje Y en portada del home (`site_settings.hero_focus_x`), hero de proyecto (`projects.render_focus_x`, mapa path→0-100) y grilla (`home_grid[].focus_x`). Slider horizontal + badge "sin recorte" por eje (mutuamente excluyentes) en `SiteSettingsForm`, `RendersUpload` y `HomeGridEditor`. `object-position` pasa a `X% Y%` en `HomeHero`, `HomeGallery` y `.hero-img` (var `--hero-focus-x`).
- **Grilla 100% modificable**: cada celda de `home_grid` guarda `desktop` y `mobile` (`{col,row}`, 1-based, opcionales). `HomeGridEditor` reescrito: toggle Desktop/Móvil, drag libre (dnd-kit `useDraggable`, snap a celda + clamp, sin anti-colisión → overlap permitido y WYSIWYG). El sitio posiciona vía CSS vars (`gridItemVars`) con media query; ausencia de posición = auto-flow (fallback backward-compat). Se quitó `grid-auto-flow: dense` y las clases `.home-tile--*`.

**Breaking**: nada. Data vieja de `home_grid` (sin posición) sigue mostrándose por auto-flow hasta reeditarla.
**Migración**: `0015_focus_x.sql` (aplicada) — `hero_focus_x` smallint + `render_focus_x` jsonb. La posición de la grilla no necesita migración (jsonb).

## [2026-07-26] hero+og — Encuadre del home + OG por defecto corregido

**Resumen**: Se extiende el encuadre ajustable a la portada del home y se corrige el OG por defecto del sitio (se veía chico/pixelado en WhatsApp).

**Cambios**:
- **Encuadre de la portada del home**: `site_settings.hero_focus` (smallint 0-100, default 50). Slider vertical con preview (cover 16:9) en `/admin/configuracion`; `HomeHero` aplica `object-position`. Migración `0014`.
- **Encuadre en la grilla del inicio**: cada celda de `home_grid` guarda `focus` (0-100, opcional). Slider por celda en `/admin/inicio` (`HomeGridEditor`) con preview en vivo; `HomeGallery` lo aplica vía `RenderImage` (nueva prop `objectPosition`).
- **OG por defecto**: el `opengraph.png` era 2250×1500 (3:2) → WhatsApp lo mostraba chico. Nuevo `public/og-home.png` 1200×630 (1.91:1) con el logo centrado y con aire. Referencias del código apuntan a `/og-home.png` (el `opengraph.png` original queda sin uso).

**Breaking**: nada.
**Migración**: `0014_hero_focus.sql` (aplicada).

## [2026-07-26] hero — Encuadre ajustable por imagen

**Resumen**: El hero del detalle recortaba las imágenes centradas (object-cover) y "comía" partes del render (ej. la plataforma de DX8). Ahora cada render del carrusel guarda su propio encuadre vertical, ajustable desde el admin.

**Cambios**:
- **DB**: `projects.render_focus` (jsonb, mapa `{ "<path>": 0-100 }` = % de `object-position` Y, keyed por path del render). Migración `0013`.
- **Admin**: slider vertical en cada thumb de renders (`RendersUpload`) con preview en vivo (la miniatura muestra el recorte al mover). Se poda la clave al borrar el render.
- **Sitio**: `ProjectHero` aplica el encuadre vía clase `.hero-img` + var CSS `--hero-focus`. Solo en desktop (cover); mobile sigue mostrando la imagen completa (contain).

**Breaking**: nada.
**Migración**: `0013_render_focus.sql` (aplicada).

## [2026-07-26] seo — Correcciones post-audit + OG de producto 1200×630

**Resumen**: Tras el audit sobre el sitio live: H1 en la home y OG de producto en formato grande (1200×630) para el preview de redes.

**Cambios**:
- **H1 en la home**: `<h1 class="sr-only">` con el nombre/rubro (antes solo había `<h2>`). Sin cambio visual.
- **OG de producto 1200×630**: nueva route `src/app/(site)/proyectos/[slug]/og/route.ts` que recorta el render principal a 1200×630 con `sharp` (el render es webp 4:3 → WhatsApp lo mostraba como thumbnail chico). `generateMetadata` apunta `og:image`/`twitter:image` a esa route. Se cachea en el CDN. `sharp` agregado como dep directa + `serverExternalPackages: ['sharp']` en `next.config.ts`.
  - **Fix Vercel**: en prod la route daba 500 (`libvips-cpp.so ... No such file` — el file-tracing de Next no arrastraba el binario nativo de libvips a la lambda). Solución: `outputFileTracingIncludes` para forzar `@img/sharp-*-linux-x64` + import dinámico de sharp con `try/catch` que cae al OG por defecto (nunca 500).
- **Instagram con logo**: el footer usaba `AtSign` (@) porque lucide-react 1.25 ya no trae logos de marca. Reemplazado por un SVG inline del logo de Instagram (`src/components/site/SiteFooter.tsx`).

**Breaking**: nada.
**Migración**: nada.
**Pendiente usuario**: reemplazar `public/opengraph.png` (OG por defecto), agregar dominio `www` en Vercel, cargar `about_text`.

## [2026-07-26] seo — SEO integral + OpenGraph + Analytics + fix email

**Resumen**: Portfolio comercial → SEO técnico/on-page completo, OpenGraph dinámico por proyecto, datos estructurados, AEO (llms.txt), Vercel Analytics, y arreglo del botón de email.

**Cambios**:
- **Email**: `buildMailto` → `buildEmailUrl` (Gmail web compose, abre en pestaña nueva). El `mailto:` no abría nada sin cliente de correo en el SO. Actualizado en detalle y footer.
- **Metadata raíz** (`layout.tsx`): `metadataBase`, título con template, keywords, `openGraph` (usa `public/opengraph.png`), `twitter` (`summary_large_image`), `robots`, canonical. Helper `src/lib/site/seo.ts` (`siteUrl` desde `NEXT_PUBLIC_SITE_URL`, default `dookdesign.com`).
- **OpenGraph dinámico por proyecto**: `generateMetadata` de `[slug]` usa el **primer render del producto** como `og:image` + canonical + `twitter`. Al compartir `/proyectos/dx8` se ve la imagen principal.
- **Datos estructurados (JSON-LD)**: componente `JsonLd`. Home = `WebSite` + `Person` (Agustín, Rosario, sameAs Instagram). Detalle = `CreativeWork` (imágenes, creator, año, categoría) + `BreadcrumbList`.
- **Sitemap/Robots**: `app/sitemap.ts` (dinámico: home, /proyectos, cada proyecto publicado) y `app/robots.ts` (bloquea `/admin`, apunta al sitemap).
- **AEO**: `app/llms.txt/route.ts` — resumen del sitio + proyectos publicados en texto plano, generado desde la DB.
- **Vercel Analytics**: `@vercel/analytics` + `<Analytics/>` en el layout. CSP sin cambios (beacon mismo origen).

**Breaking**: nada.
**Migración**: nada. **Env nueva**: `NEXT_PUBLIC_SITE_URL` en Vercel (default `https://dookdesign.com`).

## [2026-07-26] ajustes — Renders de entorno + fixes visuales

**Resumen**: Feedback post-deploy con Agustín: nuevo tipo de imagen "renders de entorno", tagline del logo y legibilidad del azul de marca en modo oscuro.

**Cambios**:
- **Renders de entorno** (feature): nuevo campo `projects.environment_renders` (`text[]`, máx 3). Imágenes de contexto webp que NO van a la galería, NO se amplían (sin lightbox/zoom) y NO se degradan (solo conversión a webp, `initialQuality 0.9`, `maxWidthOrHeight 2560` en `optimizeEnvironmentRender`). Se cargan en el admin con `EnvironmentRendersUpload` (dropzone + borrar, sin reorden, cupo 3) dentro de `ProjectForm`. En el detalle se muestran como fila fija recortada (`cover`) full-width **debajo del hero**, vía `ProjectEnvironmentRow`. Reutiliza bucket `renders`, storage helpers y RLS existentes.
- **Tagline del hero**: "DISEÑO INDUSTRIAL" → "DISEÑO ARGENTINO", con `whitespace-nowrap` para una sola línea (`HomeHero`).
- **Azul de marca legible en dark**: nuevo token `--brand-ink` (en claro = `#3532C5`, sin cambios; en `[data-theme="dark"]` = `#9C99F8`, tinte más claro para AA). Los títulos de proyecto y hovers de nav/footer pasan a `--brand-ink`; los pills de filtro siguen con `--brand` de fondo (texto blanco intacto).

**Breaking**: nada.
**Migración**: `0012_environment_renders.sql` (aplicada en Supabase).

## [2026-07-25] fase-5 — Páginas públicas (home + listado + detalle)

**Resumen**: Se cablearon las tres páginas públicas con data real de Supabase, portando los diseños de claude design a componentes Next.js 16 + Tailwind v4. Cierra la Fase 5.

**Cambios**:
- **Home `/`**: hero fullscreen (portada de `site_settings` o fallback al featured), "Sobre mí" (`about_text`), grilla de proyectos y footer/CTA. Componentes en `src/components/site/` (`SiteNav` con menú y toggle de tema View Transitions, `HomeHero`, `HomeGallery`, `SiteFooter`, `Reveal`, `ScrollCue`, `RenderImage`). Default tema oscuro.
- **Grilla curada del home (admin)**: `site_settings.home_grid` (jsonb) + `location`. Nueva página `/admin/inicio` con editor drag&drop (dnd-kit) para elegir qué proyecto, en qué orden y tamaño (`sm/wide/tall/big`); fallback a 6 publicados si está vacía. Migraciones `0010`/`0011`.
- **Listado `/proyectos`**: `ProjectsGrid` (client) con filtros categoría+año (AND), grilla 1/2/3 col, cards 4:3 B&N→color al hover, "Ver más" tras 6, estado vacío. Intro estático.
- **Detalle `/proyectos/[slug]`**: `ProjectHero` (embla) carrusel fullscreen con flechas/dots/contador/teclado/swipe y **entrada fade-up escalonada**; contenido (materiales + descripción); `ProjectGallery` con lightbox zoom; CTA WhatsApp/Email global con mensaje por proyecto; **"Otros proyectos"** (3 cards: misma categoría primero al azar, luego otras); título del proyecto en el nav al scrollear. `generateMetadata` por proyecto; slug inexistente → 404.
  - **Lightbox compartido** (`ProjectLightbox`, context): la galería y el click en la imagen del hero abren el mismo lightbox (`yet-another-react-lightbox` + Zoom), mapeado por índice de render.
- **Imágenes**: `RenderImage`/hero sirven el WebP del bucket tal cual (`unoptimized`) + capa GPU (`.render-crisp`) aplicada por `RenderImage` para nitidez en reposo (evita el reescalado borroso del navegador en cards y galería).
- **Contacto WhatsApp**: `buildWhatsappUrl` acepta número (arma `wa.me/<n>?text=…{proyecto}`) o link ya hecho (wa.me/wa.link, usado tal cual). Schema `whatsapp_url` relajado (ya no exige URL) + campo de admin re-etiquetado a "número".
- **Config admin**: `/admin/configuracion` en 2 columnas (portada `object-contain` | Sobre Agustín), contacto/redes/ubicación en una card compacta.
- **Footer**: columna "Ubicación" condicional, iconos lucide en contacto/redes/ubicación, logo gg linkeado a giulianogerlo.vercel.app (con hover). Navlinks del menú con hover.
- **Seguridad**: headers en `next.config.ts` (`headers()`) — CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. `/security-review` sobre la rama: sin findings.
- **Limpieza**: `suppressHydrationWarning` en `<body>` (extensiones tipo ColorZilla inyectan attrs); borrado `getPublishedSlugs` (sin uso, no hay `generateStaticParams`); borrada la carpeta `.design/` (mocks de referencia, ya portados).

**Breaking**: nada.
**Migración**: `0010_site_settings_hero_socials.sql` y `0011_home_grid_location.sql` aplicadas vía MCP.

---

## [2026-07-25] fase-5 (WIP) — Prep backend /proyectos + hardening admin

**Resumen**: Preparación del backend (independiente del diseño) para las páginas `/proyectos` y `/proyectos/[slug]`, más limpieza y hardening del admin. El diseño visual de esas páginas se arma aparte en claude design y se cablea después.

**Cambios**:
- **Data layer público**: `src/lib/projects/queries.ts` (server-only) — `getPublishedProjects`, `getProjectBySlug`, `getPublishedSlugs`, `getCategories`, `getSiteSettings`. Orden reciente→antiguo (year desc, order asc); RLS filtra `published=true`.
- **Helper de contacto seguro**: `src/lib/site/contact.ts` — `buildWhatsappUrl` (saneo a dígitos + `wa.me` con mensaje) y `buildMailto` (subject encodeado). Único valor dinámico es el título del proyecto (de DB) + `encodeURIComponent` → sin inyección.
- **Contacto global**: se eliminó el contacto por proyecto (redundante, mismo dueño). Migración `0006_drop_project_contact.sql` dropea `projects.whatsapp_url` y `projects.email`. Quitados de `projectSchema`, `ProjectForm` y `src/types/database.ts`. Contacto vive solo en `site_settings`. Ver **ADR 0001**.
- **Auth hardening**: `src/proxy.ts` pasa de `getSession()` a `getUser()` (revalida el token contra Supabase). Corregido gotcha desactualizado del roadmap (el guard ya existía como `proxy.ts`, no `middleware.ts`).
- **Menor**: `RendersUpload` reemplaza `console.error` por toast `sileo.error` al fallar el borrado.

**Fixes de admin (misma tanda)**:
- **Config no cargaba**: faltaba policy `SELECT` para `authenticated` en `site_settings` (RLS bloqueaba al admin logueado). Migración `0007_admin_read_site_settings.sql` (mismo patrón que 0005 para categories).
- **Letras negras / toasts en claro**: el tema oscuro estaba en un div anidado, pero los portales (sileo, Select, AlertDialog → `document.body`) heredaban el tema claro. Nuevo `AdminThemeLock` aplica el tema oscuro en `<html>` (y restaura al salir del admin).
- **UX renders**: feedback de subida (spinner + skeletons, "Guardar" deshabilitado mientras suben); borrado de render con `AlertDialog` (antes `confirm()` nativo).
- **Loading states**: `admin/(panel)/loading.tsx` (skeleton nativo de Next) al cargar las páginas del panel.
- **Optimización de renders al subir**: `browser-image-compression` procesa cada imagen en el navegador (web worker) antes de mandarla a Storage → lado más largo a 3840px (proporcional, sin recorte ni upscale) + WebP q0.8. Un render de 8K/17MB queda en ~1MB. El cliente sube el archivo crudo y el sistema lo optimiza solo.
- **Preview de renders roto**: el bucket `renders` estaba privado → `getPublicUrl` no servía las imágenes. Se marcó público (migración `0008`, aprobado por el usuario) para que galería/hero/preview y el CDN funcionen; subida/edición/borrado siguen restringidas a admin. Tradeoff aceptado: renders de proyectos en borrador quedan accesibles por URL directa (UUID no adivinable).
- **Categoría mostraba el UUID**: el `Select` (base-ui) mostraba el `value` crudo. Se pasa el prop `items` (value→label) a `Select.Root` para que muestre el nombre de la categoría.
- **Borrado de render no borraba del bucket**: faltaba policy `SELECT` para `authenticated` en `storage.objects` → `remove()` no "veía" el objeto y borraba en silencio. Migración `0009_admin_read_renders_storage.sql`. Además `deleteRender` ahora detecta el borrado vacío y `handleDelete` solo saca la miniatura si borró de verdad.
- **Renders en carpetas por proyecto**: los proyectos nuevos generan su `id` (UUID) adelantado (`crypto.randomUUID`), así los renders suben a `renders/{id}/…` desde el inicio (antes iban a `new/`). `createProject` acepta ese `id`.
- **Zoom en el admin**: clic en una miniatura abre lightbox con zoom (`yet-another-react-lightbox` + plugin Zoom; se reutiliza en Fase B).
- **Layout del form de proyecto**: 2 columnas en desktop (Información | Descripción, Publicación | Renders), 1 columna en móvil. Aprovecha el ancho, menos scroll.
- **Hydration warning de dnd-kit**: se pasa `id` estable a cada `DndContext` (`admin-projects`, `admin-renders`) para que los ids de accesibilidad sean deterministas SSR↔cliente.
- **Limpieza**: borradas `src/public/assets/img/` (mal ubicadas, Next solo sirve `/public`, sin referencias) y `public/projects/DX8/` (renders de muestra sobrantes).

**Breaking**: se eliminan columnas `projects.whatsapp_url` y `projects.email` (estaban vacías: 0 filas afectadas).
**Migración**: `0006_drop_project_contact.sql`, `0007_admin_read_site_settings.sql`, `0008_make_renders_public.sql` y `0009_admin_read_renders_storage.sql` aplicadas al proyecto Supabase vía MCP.

---

## [2026-07-23] fase-5 (WIP) — Maqueta del Home público

**Resumen**: Sesión de diseño con Agustín. Maqueta HTML/CSS del Home público (referencia visual + de interacción, aún sin portar a Next.js/React). Concepto "Precision Void" del spec Fase 2 respetado.

**Cambios**:
- **Layout elegido**: variante clásica (hero full-bleed + espacio negativo). Descartada la editorial asimétrica.
- **Estructura del Home** (orden final): Hero → Sobre mí → Proyectos → Footer/Contacto.
- **Hero**: render DX8 a pantalla completa con logo **DK** (iniciales) superpuesto en blanco; scroll indicator (chevron animado) que se desvanece al bajar.
- **Nav fijo**: transparente sobre el hero → fondo sólido + blur + borde al scrollear; logo e iconos cambian de color según scroll/tema.
- **Galería**: grilla mosaico con tamaños variados (destacado grande + verticales/horizontales); B&N → color al hover (ref. Starck) + overlay "Ver proyecto →"; loader shimmer mientras cargan renders; botón "Ver más proyectos" → `/proyectos`.
- **Toggle claro/oscuro**: iconos sol/luna + **transición circular reveal** con View Transitions API (`document.startViewTransition` + `clip-path`), fallback instantáneo sin soporte o con `prefers-reduced-motion`.
- **Menú hamburguesa**: animado (barras → X), panel con fade suave + links escalonados numerados (01/02/03).
- **Reveal on scroll**: fade + subida por sección y cards con stagger (IntersectionObserver).
- **Footer completo**: CTA "¿Tenés un proyecto en mente?" + botón, columnas Contacto/Redes/Estudio, logo del dev (gg) theme-aware (tinta oscura+verde en claro, blanca+verde en oscuro).
- **Responsive**: mosaico desktop → 3 cols tablet → 2 cols mobile.
- Categorías en la maqueta: "Todos / Mobiliario". Único proyecto con render real: **DX8** (2 imágenes); resto placeholders rayados.

**Pendiente (mañana)**: portar a componentes Next.js 16 + React + Tailwind con data de Supabase; construir la página de proyecto individual `/proyectos/[slug]`; cablear filtro de categorías, toggle con `localStorage` y hero desde `featured`.

**Nota implementación**: para el toggle de tema en React se recomienda el hook `useModeAnimation` de `react-theme-switch-animation` (misma View Transitions API + `flushSync` por debajo).

**Breaking**: nada.
**Migración**: nada.

---

## [2026-07-23] fase-4.5 — Admin redesign + bugfixes

**Resumen**: Panel admin rediseñado con shadcn/ui (Base UI variant), bugs críticos corregidos, notificaciones con sileo, logos de marca integrados.

**Cambios**:
- **shadcn/ui** instalado con `--base base-ui` (no Radix) — componentes: Button, Input, Textarea, Select, Label, Badge, Card, Separator, AlertDialog, Sonner→sileo
- **Dark mode forzado** en todo `/admin` vía wrapper `data-theme="dark" className="dark"` en `src/app/admin/layout.tsx`
- **Bug A — categoría no aparecía**: `useEffect` en `CategoryList` sincroniza estado local con props cuando `router.refresh()` actualiza el Server Component
- **Bug B — error al crear proyecto sin categoría**: schema Zod usa `z.union([z.string().uuid(), z.literal(''), z.null()]).transform(...)` en lugar de `z.preprocess` (que infería `unknown`)
- **Bug C — categorías vacías para admin logueado**: faltaba RLS policy `SELECT` para `authenticated` en tabla `categories`. Migración `0005_admin_read_categories.sql` aplicada
- **Logo sidebar**: `logo-dook.png` centrado (140px), con `filter: brightness(0) invert(1)`
- **Footer sidebar**: "Desarrollado por" + `logo-gg.svg` en la misma línea
- **sileo** instalado — reemplaza sonner para toasts (`sileo.success/error`), posición `top-center`
- **AlertDialog** (Base UI) para confirmaciones destructivas de borrado — `sileo` solo para feedback de éxito/error
- **Base UI gotchas resueltos**: `AlertDialogTrigger` y `Button` no tienen `asChild` → usar `render={<El />}` + `nativeButton={false}` para elementos no-button
- Forms sin `max-w-*` — ocupan todo el ancho disponible
- `favicon.ico` movido a `src/app/favicon.ico` (App Router lo detecta automáticamente)

**Breaking**: nada para el sitio público.
**Migración**: `0005_admin_read_categories.sql` ya aplicada al proyecto Supabase vía MCP.

---

## [2026-07-23] fase-3 — Modelo de datos Supabase

**Resumen**: Schema de Postgres creado y aplicado vía MCP. RLS configurado para admin por dominio `@dookdesign.com`. Tipos TypeScript generados.

**Cambios**:
- Tablas: `categories` (id, name, slug) + `projects` (14 campos per spec Fase 2)
- RLS: anon lee `published=true`, admin (`*@dookdesign.com`) CRUD completo
- Storage policies en bucket `renders`: solo admin puede subir/editar/borrar
- Grants explícitos por rol (service_role, authenticated, anon)
- `src/types/database.ts` — tipos generados + helpers `Tables<>`, `TablesInsert<>`, `TablesUpdate<>`
- Clientes Supabase tipados con `Database`
- `supabase/migrations/` — 3 archivos versionados (0001_schema, 0002_storage_policies, 0003_grants)

**Breaking**: nada.
**Migración**: nada (schema nuevo).

---

## [2026-07-23] fase-1 — Bootstrap Next.js 16 + Supabase SSR

**Resumen**: App Next.js 16 bootstrapeada manualmente con Tailwind v4, sistema de colores del spec, cliente Supabase SSR, y proxy de auth protegiendo `/admin`. Build limpio sin warnings.

**Cambios**:
- Next.js 16.2.11 + React 19 + TypeScript + Tailwind v4 + `@supabase/ssr`
- Sistema de colores completo en CSS variables (dark/light toggle sin flash)
- DM Sans (variable font) via `next/font/google`
- `src/proxy.ts` — protege `/admin/*`, redirige a `/admin/login` sin sesión
- `src/lib/supabase/client.ts` y `server.ts` — clientes browser y server
- `ThemeToggle` componente con `localStorage`
- Estructura de carpetas: `(site)/`, `admin/`, `lib/supabase/`, `components/layout/`

**Breaking**: nada.
**Migración**: nada.

---

## [2026-07-23] fase-2 — Identidad visual con Agustín

**Resumen**: Sesión de diseño con Agustín Cavallera. Definidos colores, tipografía, estructura, animaciones y schema de proyectos. Spec aprobado.

**Cambios**:
- Spec creado: `docs/superpowers/specs/2026-07-23-fase2-identidad-visual-design.md`
- Concepto "Precision Void": minimal refinado, espacio negativo, azul eléctrico como único acento
- Paleta: dark `#323238` / light `#DEDEDE` + acento `#3532C5` (toggle claro/oscuro)
- Tipografía: DM Sans variable (única familia, jerarquía por pesos)
- Galería con filtro por categorías; renders en B&W → color al hover (solo desktop, ref. Starck)
- Hero: render a pantalla completa + nombre superpuesto
- Schema de proyecto: slug, title, year, category, materials, description, whatsapp_url, email, featured, order, renders[]
- Idioma: español

**Breaking**: nada.
**Migración**: nada.

---

## [2026-07-22] fase-0 — Bootstrap estructura

**Resumen**: Bootstrap del proyecto con el starter-kit .claude. Stack definido y docs base armados. Sin código de app todavía.

**Cambios**:
- Stack: Next.js 16 (App Router) + Supabase (Postgres + Storage) + Vercel Hobby. Todo gratis.
- Docs/reglas: `CLAUDE.md`, `stack.md`, `skills.md`, `roadmap.md`, `.env.example` (claves Supabase).
- Regla dura: **pnpm siempre, nunca npm**.
- Skills instaladas: `frontend-design`, `web-design-guidelines`, `vercel-react-best-practices`, `supabase-postgres-best-practices`, `brainstorming`, `grill-me`.
- Git init en `main`. MCP: pendiente instalar Supabase MCP.

**Breaking**: nada.
**Migración**: nada.
