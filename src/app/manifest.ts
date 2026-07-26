import type { MetadataRoute } from 'next'
import { SITE_NAME, AUTHOR, SITE_DESCRIPTION } from '@/lib/site/seo'

// Web App Manifest: íconos de instalación (Android/PWA), nombre y theme-color.
// Next.js agrega solo <link rel="manifest">. favicon.ico / icon.png / apple-icon.png
// se auto-detectan por estar en src/app/ (no van acá).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Diseño industrial de ${AUTHOR}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#323238',
    theme_color: '#323238',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
