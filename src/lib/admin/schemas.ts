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
})

export type ProjectFormData = z.infer<typeof projectSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Requerido'),
  slug: z.string().min(1, 'Requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export const siteSettingsSchema = z.object({
  about_text: z.string(),
  whatsapp_url: z.string().url().nullable().or(z.literal('')).transform(v => v || null),
  email: z.string().email().nullable().or(z.literal('')).transform(v => v || null),
})

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>

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
