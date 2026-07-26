import { getPublishedProjects, getSiteSettings } from '@/lib/projects/queries'
import { getPublicRenderUrl } from '@/lib/site/images'
import { homeGridSchema } from '@/lib/admin/schemas'
import { SiteNav } from '@/components/site/SiteNav'
import { HomeHero } from '@/components/site/HomeHero'
import { HomeGallery, type GalleryItem } from '@/components/site/HomeGallery'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Reveal } from '@/components/site/Reveal'
import { JsonLd } from '@/components/site/JsonLd'
import { siteUrl, SITE_NAME, AUTHOR, INSTAGRAM_URL, SITE_DESCRIPTION } from '@/lib/site/seo'

export default async function Home() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(),
  ])

  // Portada: la elegida en admin; si no hay, el primer render del proyecto destacado (o del más reciente).
  const fallbackCover = (projects.find(p => p.featured) ?? projects[0])?.renders[0] ?? null
  const heroPath = settings?.hero_image ?? fallbackCover
  const heroUrl = heroPath ? getPublicRenderUrl(heroPath) : null

  // Grilla curada del home (home_grid): join por id con los publicados, ignorando ids huérfanos.
  const parsed = homeGridSchema.safeParse(settings?.home_grid ?? [])
  const grid = parsed.success ? parsed.data : []
  const byId = new Map(projects.map(p => [p.id, p]))

  let items: GalleryItem[] = grid
    .map(g => {
      const p = byId.get(g.project_id)
      if (!p) return null
      return {
        slug: p.slug,
        title: p.title,
        year: p.year,
        coverUrl: p.renders[0] ? getPublicRenderUrl(p.renders[0]) : null,
        size: g.size,
      }
    })
    .filter((x): x is GalleryItem => x !== null)

  // Fallback: si no hay grilla curada, los primeros 6 publicados como celdas chicas.
  if (items.length === 0) {
    items = projects.slice(0, 6).map(p => ({
      slug: p.slug,
      title: p.title,
      year: p.year,
      coverUrl: p.renders[0] ? getPublicRenderUrl(p.renders[0]) : null,
      size: 'sm' as const,
    }))
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'es-AR',
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#agustin`,
        name: AUTHOR,
        jobTitle: 'Diseñador industrial',
        url: siteUrl,
        image: heroUrl ?? `${siteUrl}/opengraph.png`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rosario',
          addressRegion: 'Santa Fe',
          addressCountry: 'AR',
        },
        sameAs: [INSTAGRAM_URL],
        worksFor: { '@id': `${siteUrl}/#website` },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteNav overHero />
      <main>
        <h1 className="sr-only">DooK Design — Diseño industrial de Agustín Cavallera</h1>
        <HomeHero imageUrl={heroUrl} />

        <Reveal className="px-5 pb-8 pt-20 text-center md:px-16 md:pb-12 md:pt-32">
          <section id="sobre" aria-label="Sobre mí">
            <h2 className="mb-7 text-[11px] font-medium uppercase tracking-[0.14em] text-(--text-secondary)">
              Sobre mí
            </h2>
            <p className="mx-auto max-w-[680px] whitespace-pre-line text-2xl font-light leading-[1.65]">
              {settings?.about_text || 'Soy Agustín Cavallera, diseñador industrial.'}
            </p>
          </section>
        </Reveal>

        <HomeGallery items={items} />
      </main>
      <SiteFooter settings={settings} />
    </>
  )
}
