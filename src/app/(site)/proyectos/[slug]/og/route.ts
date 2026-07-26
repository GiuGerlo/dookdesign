import sharp from 'sharp'
import { getProjectBySlug } from '@/lib/projects/queries'
import { getPublicRenderUrl } from '@/lib/site/images'

// OG image del producto: el render principal recortado a 1200×630 (ratio 1.91:1) para que
// WhatsApp/redes muestren el preview grande. El render original es webp 4:3 → sharp lo decodifica
// y recorta. Se cachea en el CDN (una generación por proyecto).
export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  const path = project?.renders?.[0]
  if (!path) return new Response('Not found', { status: 404 })

  const res = await fetch(getPublicRenderUrl(path))
  if (!res.ok) return new Response('Not found', { status: 404 })

  const input = Buffer.from(await res.arrayBuffer())
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
}
