// Constantes y helpers de SEO reutilizables. La URL canónica se toma de env para
// no hardcodear el dominio (dev/preview/prod). Default: dominio de producción.

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dookdesign.com').replace(/\/$/, '')

export const SITE_NAME = 'DooK Design'
export const AUTHOR = 'Agustín Cavallera'
export const LOCALE = 'es_AR'
export const SITE_DESCRIPTION =
  'Portfolio de diseño industrial de Agustín Cavallera: mobiliario y objetos, del material a la forma terminada. Renders de alta calidad.'
export const INSTAGRAM_URL = 'https://www.instagram.com/dookdesign__/'

// URL absoluta a partir de un path relativo ('/proyectos/dx8' → 'https://dookdesign.com/proyectos/dx8').
export function absoluteUrl(path = ''): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
