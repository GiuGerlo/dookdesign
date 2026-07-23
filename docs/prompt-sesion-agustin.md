# Prompt para arrancar la sesión de diseño con Agustín

> Copiá y pegá esto al inicio de una sesión nueva de Claude Code en `C:\Dev\dookdesign`.

---

Estoy con Agustín Cavallera (el diseñador dueño del portfolio) para definir la identidad visual de dookdesign. Antes de nada, leé para tener todo el contexto:

- `docs/roadmap.md` (fases + decisiones ya tomadas)
- `CLAUDE.md` y `.claude/rules/stack.md` (stack: Next.js 16 + Supabase + Vercel, pnpm siempre)
- `docs/runbooks/setup-manual.md` (qué falta configurar)

Contexto rápido: portfolio de Agustín, diseñador industrial. Necesita mostrar diseños con renders en alta calidad, página muy visual con animaciones, carga fluida de imágenes pesadas. Él va a gestionar el contenido vía un admin con login. Referencia de patrón: mi otro portfolio en `C:\Dev\React\giulianogerlo-portfolio`.

Hoy NO escribimos código todavía. El objetivo es **definir el diseño CON Agustín** usando la skill `/frontend-design`. Entrevistalo y sacale:

1. **Paleta de colores** — principal, acento, fondo. Modo claro/oscuro/ambos.
2. **Tipografías** — una display (títulos) + una de texto. ¿Tiene fuentes de su marca?
3. **Estructura del sitio** — secciones (home/hero, galería de proyectos, sobre él, contacto por WhatsApp).
4. **Estilo de animaciones** — sutil vs dramático, transiciones de página, scroll, hover en los renders.
5. **Referencias** — 2-3 sitios que le gusten para tono visual.
6. **Organización de proyectos** — ¿categorías? (mobiliario, producto, etc.).
7. **Metadata por diseño** — título, año, cliente, materiales, descripción, cuántos renders por proyecto.
8. **Idioma** del sitio (ES / EN / bilingüe).

Cuando tengamos esto definido, armá un spec del diseño (guardalo en `docs/superpowers/specs/`) y actualizá el roadmap. Trabajá ordenado, en español claro y conciso. Yo testeo/apruebo cada cosa.
