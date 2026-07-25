'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProjectFormData, CategoryFormData, SiteSettingsFormData } from './schemas'

// --- Proyectos ---

export async function createProject(data: ProjectFormData, id?: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').insert({
    ...(id ? { id } : {}),
    ...data,
    category_id: data.category_id ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/proyectos')
}

export async function updateProject(id: string, data: Partial<ProjectFormData>) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/proyectos')
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/proyectos')
}

export async function reorderProjects(orderedIds: string[]) {
  const supabase = await createClient()
  const updates = orderedIds.map((id, index) =>
    supabase.from('projects').update({ order: index }).eq('id', id)
  )
  await Promise.all(updates)
  revalidatePath('/admin/proyectos')
}

// --- Categorías ---

export async function createCategory(data: CategoryFormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
}

// --- Configuración ---

export async function updateSiteSettings(data: SiteSettingsFormData) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('site_settings').select('id').single()
  if (!existing) throw new Error('No existe fila de site_settings')
  const { error } = await supabase.from('site_settings').update(data).eq('id', existing.id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}
