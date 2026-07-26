// URL pública de un render en Supabase Storage (bucket público, servido por CDN).
// Versión pura y universal: usable en server components (getRenderUrl de admin es 'use client').

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export function getPublicRenderUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/renders/${path}`
}
