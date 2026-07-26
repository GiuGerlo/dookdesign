import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

// Lecturas públicas para el frontend. Usa el cliente anon (RLS filtra published=true).

export async function getPublishedProjects(): Promise<Tables<'projects'>[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('year', { ascending: false })
    .order('order', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<Tables<'projects'> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function getCategories(): Promise<Tables<'categories'>[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getSiteSettings(): Promise<Tables<'site_settings'> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_settings').select('*').maybeSingle()
  if (error) throw new Error(error.message)
  return data
}
