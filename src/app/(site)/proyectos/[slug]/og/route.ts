import { getProjectBySlug } from '@/lib/projects/queries'
import { getPublicRenderUrl } from '@/lib/site/images'
import { siteUrl } from '@/lib/site/seo'

// OG image del producto: el render principal recortado a 1200×630 (ratio 1.91:1) para que
// WhatsApp/redes muestren el preview grande. El render original es webp 4:3 → sharp lo decodifica
// y recorta. Se cachea en el CDN (una generación por proyecto).
// Si algo falla (sharp, fetch, proyecto sin renders) → cae al OG por defecto del sitio, nunca 500.
export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const fallback = () => Response.redirect(`${siteUrl}/opengraph.png`, 302)

  try {
    const project = await getProjectBySlug(slug)
    const path = project?.renders?.[0]
    if (!path) return fallback()

    const res = await fetch(getPublicRenderUrl(path))
    if (!res.ok) return fallback()

    const input = Buffer.from(await res.arrayBuffer())
    // Import dinámico: si el binario nativo no carga, lo captura el catch (no rompe el módulo).
    const sharp = (await import('sharp')).default
    const out = await sharp(input)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82 })
      .toBuffer()

    return new Response(new Uint8Array(out), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    })
  } catch {
    return fallback()
  }
}
