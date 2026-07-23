# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Mantener corto.** Este archivo carga al inicio de cada sesión. Detalles viven en `.claude/rules/` y `docs/`. Si necesitás agregar más de 5 líneas a una sección, mejor creá una regla nueva o ampliá un doc.

## 1. Qué es esto

dookdesign — portfolio de Agustín Cavallera, diseñador industrial. Galería de diseños y renders en alta calidad, con página muy visual y animaciones; las imágenes pesadas deben cargar fluido. Ver `docs/roadmap.md` para fases y estado.

## 2. Stack objetivo

Resumen — detalle completo en `.claude/rules/stack.md`.

- **Backend**: Next.js 16 (App Router, Route Handlers) sobre Node 24 + Supabase
- **Frontend**: Next.js 16 (React 19, TypeScript, App Router) + Tailwind CSS
- **DB**: Supabase (Postgres metadata + Storage con CDN para renders) — free tier
- **Infra**: Vercel Hobby (prod + preview deploys, gratis) · Supabase · dev local `pnpm dev`

## 3. Cómo navegar el repo

- **Reglas que sigue el agente** → `.claude/rules/`.
- **Slash commands del proyecto** → `.claude/commands/` (`/fase-start`, `/fase-close`, `/sync-plan`).
- **Planificación viva** → `docs/roadmap.md`.
- **Specs de brainstorming** → `docs/superpowers/specs/`.
- **Planes de implementación** → `docs/plans/`.
- **Decisiones arquitectónicas** → `docs/adr/`.
- **Historial por fase** → `docs/changelog.md`.
- **Operación / deploy** → `docs/runbooks/`.

## 4. Flujo de trabajo (resumen)

Detalle en `.claude/rules/git-workflow.md` y `.claude/rules/docs-workflow.md`.

1. Todo cambio creativo/de diseño arranca con `/brainstorming` o `/frontend-design` → spec en `docs/superpowers/specs/`.
2. Spec aprobado → plan en `docs/plans/` (via skill writing-plans).
3. Una **fase = un commit**. Los commits los hace el **usuario**; el agente sugiere mensaje en formato Conventional (≤50 chars) — ver skill `caveman-commit`.
4. Cerrar fase → actualizar `roadmap.md` + `changelog.md`.

## 5. Convenciones rápidas

- Idioma de UI, commits, docs y comentarios técnicos: **español**.
- Variables/funciones/identificadores de código: **inglés** (snake_case en DB, camelCase en JS/TS, PascalCase en componentes y modelos).
- Nunca commitear `.env`, credenciales, ni `settings.local.json`.
- **Paquetes: siempre `pnpm`, nunca `npm`.**
- Cerrar cada fase actualizando `docs/changelog.md`. El usuario testea manual antes de commitear.
