# Stack tecnológico

> Ampliá cada sección con versiones fijadas y decisiones (ADR) a medida que se concreten.

## Backend

- Next.js 16 (App Router, Route Handlers) sobre Node 24. Sin backend separado.
- Auth: Supabase Auth para el admin (Agustín gestiona todo el contenido). Rutas `/admin` protegidas.
- **Referencia de patrón:** `C:\Dev\React\giulianogerlo-portfolio` (Vite + React + Supabase). De ahí se replica la idea del admin (AdminRoute, upload por dropzone con react-dropzone, CRUD, preview, migraciones + RLS en `supabase/migrations/`), **adaptado a Next.js 16**. Ojo: ese proyecto es Vite/react-router, acá es Next App Router — copiar el patrón, no el código literal.
- Datos: cliente `@supabase/supabase-js` (o `@supabase/ssr` para server components).

## Frontend

- Next.js 16 (React 19, TypeScript, App Router).
- Tailwind CSS. Animaciones: definir librería (ej. Framer Motion) en ADR cuando se decida el sistema de movimiento con Agustín.
- Imágenes: `next/image` + optimización nativa de Vercel. Renders servidos desde Supabase Storage (CDN). Priorizar `blur` placeholders y `sizes` correctos por lo pesado de los archivos.
- Diseño bespoke con skill `/frontend-design`. Sin shadcn por ahora.

## Base de datos

- Supabase (Postgres). Naming: snake_case en inglés.
- Storage: bucket para renders (alta calidad). Metadata de cada diseño en tablas Postgres.
- Charset UTF-8.

## Infra local

- `.env.local` con claves de Supabase (ver `.env.example`). `.env*` ignorado salvo el example.
- Dev local: `pnpm dev`. Gestor de paquetes: **pnpm siempre**, nunca npm.

## Producción

- Vercel Hobby (gratis): producción desde `main`/`production` + preview deploys automáticos por rama (instancia de desarrollo online, gratis).
- Supabase free tier para DB + Storage.
- CI/CD: deploy automático de Vercel por push. GitHub Actions solo si hace falta más.

## Herramientas de desarrollo

- Context7 MCP — docs actualizadas de librerías (global, ya disponible).
- Skills de diseño: `/frontend-design`.
