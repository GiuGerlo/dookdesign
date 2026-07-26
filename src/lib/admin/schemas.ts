import { z } from 'zod'

// Renders de entorno: forma de celda elegible + encuadre X/Y por imagen.
export const envSizeEnum = z.enum(['cuadrada', 'horizontal', 'vertical', 'panoramica'])
export type EnvSize = z.infer<typeof envSizeEnum>

export const envLayoutItemSchema = z.object({
  size: envSizeEnum,
  focus: z.number().min(0).max(100),
  focus_x: z.number().min(0).max(100),
})
export type EnvLayoutItem = z.infer<typeof envLayoutItemSchema>

// Geometría por forma: span (unidades de ancho, sobre 3 en desktop) + aspect-ratio de la celda.
export const envSizeGeom: Record<EnvSize, { span: number; ar: string }> = {
  cuadrada: { span: 1, ar: '1 / 1' },
  horizontal: { span: 1, ar: '4 / 3' },
  vertical: { span: 1, ar: '3 / 4' },
  panoramica: { span: 2, ar: '16 / 9' },
}

export const ENV_DEFAULT: EnvLayoutItem = { size: 'horizontal', focus: 50, focus_x: 50 }

export const projectSchema = z.object({
  title: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  year: z.number().int().min(1900).max(2100),
  category_id: z.union([z.string().uuid(), z.literal(''), z.null()]).transform(v => v === '' ? null : v),
  materials: z.array(z.string()),
  description: z.string(),
  featured: z.boolean(),
  published: z.boolean(),
  renders: z.array(z.string()),
  environment_renders: z.array(z.string()).max(3, 'Máximo 3'),
  // Encuadre del hero por render: { "<path>": 0-100 } (% de object-position). Y e X separados.
  render_focus: z.record(z.string(), z.number().min(0).max(100)),
  render_focus_x: z.record(z.string(), z.number().min(0).max(100)),
  // Layout de renders de entorno: { "<path>": { size, focus, focus_x } }.
  environment_layout: z.record(z.string(), envLayoutItemSchema),
})

export type ProjectFormData = z.infer<typeof projectSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export const siteSettingsSchema = z.object({
  about_text: z.string(),
  // Acepta número (5493411234567) o link (wa.me / wa.link). El helper buildWhatsappUrl normaliza.
  whatsapp_url: z.string().nullable().or(z.literal('')).transform(v => v || null),
  email: z.string().email().nullable().or(z.literal('')).transform(v => v || null),
  hero_image: z.string().nullable(),
  hero_focus: z.number().min(0).max(100),
  hero_focus_x: z.number().min(0).max(100),
  instagram_url: z.string().url().nullable().or(z.literal('')).transform(v => v || null),
  behance_url: z.string().url().nullable().or(z.literal('')).transform(v => v || null),
  location: z.string().nullable().or(z.literal('')).transform(v => v || null),
})

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>

// Posición explícita de una celda en la grilla (1-based). Opcional: ausente = auto-flow.
const gridPosSchema = z.object({
  col: z.number().int().min(1),
  row: z.number().int().min(1),
})

// Grilla curada del home: qué proyecto, con qué tamaño (span), encuadre y posición por breakpoint.
export const homeGridSchema = z
  .array(
    z.object({
      project_id: z.string().uuid(),
      size: z.enum(['sm', 'wide', 'tall', 'big']),
      // Encuadre (object-position, 0-100). Opcional: default 50 = centro. Compartido entre breakpoints.
      focus: z.number().min(0).max(100).optional(),
      focus_x: z.number().min(0).max(100).optional(),
      // Posición libre por breakpoint (desktop 4 col / móvil 2 col). Ausente = auto-flow.
      desktop: gridPosSchema.optional(),
      mobile: gridPosSchema.optional(),
    })
  )
  .max(12)

export type HomeGridItem = z.infer<typeof homeGridSchema>[number]
export type HomeGridSize = HomeGridItem['size']
export type GridPos = z.infer<typeof gridPosSchema>
export type GridBreakpoint = 'desktop' | 'mobile'

// Span (ancho×alto en celdas) de cada tamaño. Compartido entre breakpoints.
export const sizeSpans: Record<HomeGridSize, { w: number; h: number }> = {
  sm: { w: 1, h: 2 },
  wide: { w: 2, h: 2 },
  tall: { w: 1, h: 4 },
  big: { w: 2, h: 4 },
}

// Columnas por breakpoint. Móvil 2, desktop 4 (coincide con .home-grid en globals.css).
export const gridCols: Record<GridBreakpoint, number> = { desktop: 4, mobile: 2 }

// CSS vars para posicionar una celda: spans siempre; col/row solo si hay posición (si no, auto).
export function gridItemVars(item: HomeGridItem): Record<string, string> {
  const { w, h } = sizeSpans[item.size]
  const vars: Record<string, string> = {
    '--dw': String(w),
    '--dh': String(h),
    '--mw': String(w),
    '--mh': String(h),
  }
  if (item.desktop) {
    vars['--dcol'] = String(item.desktop.col)
    vars['--drow'] = String(item.desktop.row)
  }
  if (item.mobile) {
    vars['--mcol'] = String(item.mobile.col)
    vars['--mrow'] = String(item.mobile.row)
  }
  return vars
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
