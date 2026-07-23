# Spec de Diseño Visual — dookdesign

**Fecha**: 2026-07-23
**Fase**: 2 — Identidad visual
**Estado**: aprobado por Agustín Cavallera (2026-07-23)

---

## 1. Concepto

**"Precision Void"** — El portfolio como sala de exhibición. Espacio negativo generoso que obliga la mirada hacia los renders. El acento azul `#3532C5` rompe el silencio cuando el diseño lo necesita. Cero decoración innecesaria.

Referencias visuales:
- **Fontenla Furniture** (fontenlastore.com) — uso editorial de imágenes de producto
- **Philippe Starck** (starck.com) — efecto B&W → color al hover en galería (solo desktop)

---

## 2. Paleta de colores

### Modo oscuro (dark)

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--bg` | `#323238` | Fondo principal |
| `--surface` | `#2A2A2F` | Cards, overlays |
| `--text-primary` | `#F0F0F0` | Títulos, texto principal |
| `--text-secondary` | `#9999A8` | Metadata, labels, fechas |
| `--accent` | `#3532C5` | Hover, links, CTA, toggle activo |
| `--accent-hover` | `#4A47D4` | Estado hover sobre acento |

### Modo claro (light)

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--bg` | `#DEDEDE` | Fondo principal |
| `--surface` | `#EBEBEB` | Cards, overlays |
| `--text-primary` | `#1A1A20` | Títulos, texto principal |
| `--text-secondary` | `#5A5A6A` | Metadata, labels, fechas |
| `--accent` | `#3532C5` | Mismo azul en ambos modos |
| `--accent-hover` | `#2926A8` | Estado hover sobre acento |

**Implementación**: CSS custom properties en `:root` (light por defecto) y `[data-theme="dark"]`. Toggle guardado en `localStorage`. El modo se aplica en `<html>` o `<body>`.

---

## 3. Tipografía

**Una sola familia**: DM Sans — Google Fonts variable font.

```html
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
</style>
```

Toda la jerarquía se construye con pesos distintos de DM Sans:

| Rol | Peso | Tamaño aprox. | Notas |
|-----|------|---------------|-------|
| Nombre en hero | 700–800 | `clamp(4rem, 10vw, 10rem)` | "dookdesign" |
| Títulos de sección | 500–600 | `2–3rem` | "Proyectos", "Sobre mí" |
| Título de proyecto | 600 | `1.5–2rem` | Nombre del diseño |
| Label de metadata | 400 | `0.75rem`, uppercase, `letter-spacing: 0.1em` | "MATERIALES", "AÑO" |
| Valor de metadata / body | 300–400 | `0.9–1rem` | "Madera, acero COR-TEN" |
| CTA / botones | 500 | `0.875rem` | "Escribir por WhatsApp" |

---

## 4. Estructura del sitio

Arquitectura: **single-page scroll** + página de proyecto dinámica.

| Ruta | Descripción |
|------|-------------|
| `/` | Landing: hero + galería + sobre mí + footer/contacto |
| `/proyectos/[slug]` | Página individual de proyecto con galería de renders |
| `/admin` | Panel de gestión (Fase 4, protegido con Supabase Auth) |

### Secciones en `/` (en orden de scroll)

**1. Hero**
- Render destacado a pantalla completa (`100dvh`)
- Nombre "dookdesign" superpuesto — tipografía grande, peso 700
- No hay botón explícito; el scroll invite a continuar
- El render featured lo elige Agustín en el admin (`featured: true`)

**2. Proyectos**
- Filtro de categorías en la parte superior (tabs o pills)
- Grilla de cards: 2 columnas mobile, 3 columnas desktop
- **Desktop**: imagen en B&W (`filter: grayscale(1)`) → color al hover (`grayscale(0)`) — transición suave
- **Mobile**: color directo, sin efecto B&W (poco intuitivo en touch)
- Al hacer click en card → `/proyectos/[slug]`

**3. Sobre mí**
- Solo texto: 1–2 párrafos sobre Agustín y su trabajo
- Sin foto
- Sección minimal con mucho espacio alrededor

**4. Footer / Contacto**
- Links globales: WhatsApp + email
- Sin formulario — solo íconos/links directos
- Copyright

### Página `/proyectos/[slug]`

- Título + año (tipografía grande)
- Chips de metadata: categoría, materiales
- Descripción en párrafos
- Galería de renders: scroll o grid, imagen a fullscreen al click
- CTAs fijos o al pie: botón WhatsApp + email

---

## 5. Animaciones

**Principio rector**: texto → sutil, imágenes/renders → dramático.

| Elemento | Efecto |
|----------|--------|
| Sección al entrar en scroll | Fade-in + translateY sutil (200ms ease-out, stagger entre items) |
| Cards de proyecto | Reveal: scale `0.96 → 1` + fade (300ms ease-out) |
| Hover en card (desktop) | `grayscale(1) → grayscale(0)` en 400ms ease + leve `scale(1.02)` |
| Carga del hero render | Fade desde fondo (800ms), texto aparece con delay 400ms |
| Transición entre páginas | Fade suave (200ms) — Next.js View Transitions API |
| Toggle dark/light | Transición CSS global de colores (300ms) |

Librería de animaciones: **a definir en ADR al implementar Fase 5** (candidatos: Framer Motion, Motion, o CSS-only). Este spec no lo prescribe todavía.

---

## 6. Organización de proyectos

- Galería con **filtro por categorías** (tabs o pills visibles)
- Categorías las define Agustín en el admin — ejemplos: Mobiliario, Producto, Arquitectura de interiores
- Orden manual en el admin (campo `order` entero)
- Campo `featured` (boolean) para el render que aparece en el hero

---

## 7. Schema de datos por proyecto

Se mapea a tabla Postgres en Supabase (detalle en Fase 3):

| Campo | Tipo | Req. | Notas |
|-------|------|------|-------|
| `slug` | text | ✓ | URL del proyecto, único |
| `title` | text | ✓ | Nombre del diseño |
| `year` | integer | ✓ | Año de realización |
| `category_id` | uuid | ✓ | FK a tabla `categories` |
| `materials` | text[] | ✓ | Lista de materiales |
| `description` | text | ✓ | 1–3 párrafos en texto plano o markdown |
| `whatsapp_url` | text | — | URL con mensaje pre-cargado (`wa.me/...`) |
| `email` | text | — | Email de contacto (puede ser global del sitio) |
| `featured` | boolean | — | Aparece en hero; default `false` |
| `order` | integer | — | Orden manual en galería |
| `renders` | text[] | ✓ | Paths en Supabase Storage bucket `renders` |
| `created_at` | timestamptz | auto | — |

---

## 8. Idioma

**Español** — toda la UI, labels, textos de navegación, contenido.

---

## 9. Fuera de scope en este spec

- Diseño del panel admin (Fase 4)
- Librería de animaciones concreta (ADR en Fase 5)
- Categorías exactas (Agustín las define al cargar contenido en Fase 3)
- SEO / OpenGraph / meta tags (Fase 5)
- Dominio custom (al lanzar, ver runbook)
