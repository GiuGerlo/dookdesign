'use client'

import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'renders'

// Optimiza un render pesado en el navegador (web worker) antes de subirlo: reduce el lado más
// largo a 3840px conservando la proporción (nunca agranda, nunca recorta) y lo pasa a WebP.
// Un render de 8K/17MB queda en ~1MB sin que el cliente haga nada.
export async function optimizeRender(file: File): Promise<File> {
  const out = await imageCompression(file, {
    maxWidthOrHeight: 3840,
    fileType: 'image/webp',
    initialQuality: 0.8,
    useWebWorker: true,
  })
  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([out], name, { type: 'image/webp' })
}

// Renders de entorno: imágenes de contexto de baja/media calidad. Solo se convierten a WebP
// conservando la calidad (no se degradan). Downscale suave a 2560px porque van en una fila chica
// y fija (sin zoom), no necesitan 4K.
export async function optimizeEnvironmentRender(file: File): Promise<File> {
  const out = await imageCompression(file, {
    maxWidthOrHeight: 2560,
    fileType: 'image/webp',
    initialQuality: 0.9,
    useWebWorker: true,
  })
  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([out], name, { type: 'image/webp' })
}

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

// Video de portada: se sube crudo (image-compression rompe con video). Mismo bucket público.
// ponytail: sin transcode ni límite duro — el admin avisa de usar un mp4 liviano.
export async function uploadVideo(file: File, projectId: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'mp4'
  const path = `${projectId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(`Error al subir video: ${error.message}`)
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
