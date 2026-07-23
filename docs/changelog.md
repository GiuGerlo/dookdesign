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
