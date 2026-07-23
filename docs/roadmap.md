# Roadmap — dookdesign

> Planificación viva. Estado de cada fase acá. Leer al inicio de cada sesión.

## Estados

`pendiente` · `en progreso` · `DONE` · `bloqueada` (depende de otra fase)

## Fases

Esquema de fases: **números 1–N**.

| Fase | Título | Estado | Depende de | Cierre |
|------|--------|--------|-----------|--------|
| 1 | Bootstrap infra (Next.js 16 + Supabase + Vercel) | pendiente | — | — |
| 2 | Diseño visual con Agustín (colores, fuentes, estructura) | pendiente | 1 | — |
| 3 | Modelo de datos + Supabase (Postgres + Storage + RLS) | pendiente | 1 | — |
| 4 | Admin con login (Supabase Auth) — CRUD + upload de renders | pendiente | 3 | — |
| 5 | Galería + página de proyecto con animaciones | pendiente | 2, 4 | — |

> Ajustá las fases a medida que se concreten. Cada fase: spec → plan → tasks → cierre
> (ver `.claude/rules/docs-workflow.md`).

## Decisiones tomadas (grilling 2026-07-22)

1. **Storage:** Supabase free (1 GB) sirve por ahora. Revisitar si el material crece: servir WebP + Supabase Storage transforms para achicar. Techo conocido, no bloqueante.
2. **Infra/comercial:** Vercel Hobby aceptado. Portfolio con links a WhatsApp = contacto, no tienda → riesgo bajo de takedown (el portfolio de Giuliano en Vercel lo confirma). **Dominio:** arranca gratis con `dookdesign.vercel.app`; custom (`dookdesign.com`) recién al launch, comprar en Cloudflare Registrar (~USD 10/año).
3. **Gestión de contenido:** Agustín gestiona TODO vía un **admin propio con login** (Supabase Auth). Patrón inspirado en `C:\Dev\React\giulianogerlo-portfolio` (AdminRoute + upload por dropzone + CRUD + preview), adaptado a Next.js 16.

**Stack confirmado:** Next.js 16 (no Vite). Optimización de imágenes con `next/image` + Supabase Storage transforms.

## Pendiente próxima sesión (2026-07-23, con Agustín)

Definir identidad visual (colores, fuentes, estructura, animaciones) con `/frontend-design`. Preguntas preparadas en memoria `dookdesign-agustin-session`.
