// URL pública de un render en Supabase Storage (bucket público, servido por CDN).
// Versión pura y universal: usable en server components (getRenderUrl de admin es 'use client').

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export function getPublicRenderUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/renders/${path}`
}

// OG image de producto: recorte 1200×630 (1.91:1) vía proxy weserv.
// Reemplaza la generación con sharp, que fallaba en Vercel (libvips) y caía al logo.
export function getOgImageUrl(path: string): string {
  const src = getPublicRenderUrl(path).replace(/^https?:\/\//, '')
  return `https://images.weserv.nl/?url=ssl:${encodeURIComponent(src)}&w=1200&h=630&fit=cover&output=jpg`
}
