'use client'

import { createClient } from '@/lib/supabase/client'

const BUCKET = 'renders'

export async function uploadRender(file: File, projectId: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${projectId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(`Error al subir render: ${error.message}`)
  return path
}

export async function deleteRender(path: string): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Error al borrar render: ${error.message}`)
  // remove() no lanza si RLS bloquea: devuelve data vacío. Verificar que borró algo.
  if (!data || data.length === 0) throw new Error('No se pudo borrar el render (permisos)')
}

export function getRenderUrl(path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
