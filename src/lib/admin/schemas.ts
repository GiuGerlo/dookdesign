import { z } from 'zod'

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
  instagram_url: z.string().url().nullable().or(z.literal('')).transform(v => v || null),
  behance_url: z.string().url().nullable().or(z.literal('')).transform(v => v || null),
  location: z.string().nullable().or(z.literal('')).transform(v => v || null),
})

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>

// Grilla curada del home: qué proyecto va, en qué orden y con qué tamaño.
export const homeGridSchema = z
  .array(
    z.object({
      project_id: z.string().uuid(),
      size: z.enum(['sm', 'wide', 'tall', 'big']),
    })
  )
  .max(12)

export type HomeGridItem = z.infer<typeof homeGridSchema>[number]
export type HomeGridSize = HomeGridItem['size']

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
