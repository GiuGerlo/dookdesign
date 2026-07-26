import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MessageCircle, Mail } from 'lucide-react'
import { getProjectBySlug, getPublishedProjects, getCategories, getSiteSettings } from '@/lib/projects/queries'
import { getPublicRenderUrl } from '@/lib/site/images'
import { buildWhatsappUrl, buildEmailUrl } from '@/lib/site/contact'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Reveal } from '@/components/site/Reveal'
import { ProjectHero } from '@/components/site/ProjectHero'
import { ProjectEnvironmentRow } from '@/components/site/ProjectEnvironmentRow'
import { ProjectGallery } from '@/components/site/ProjectGallery'
import { LightboxProvider } from '@/components/site/ProjectLightbox'
import { RelatedProjects, type RelatedProject } from '@/components/site/RelatedProjects'
import { JsonLd } from '@/components/site/JsonLd'
import { ENV_DEFAULT, type EnvLayoutItem } from '@/lib/admin/schemas'
import { siteUrl, AUTHOR } from '@/lib/site/seo'
import type { Tables } from '@/types/database'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: 'Proyecto no encontrado' }

  const description =
    project.description?.slice(0, 155) || `${project.title}, diseño industrial de Agustín Cavallera.`
  const canonical = `/proyectos/${slug}`
  // OG estático del sitio para todos los productos: el OG dinámico por render no funcionaba fiable.
  const ogImage = { url: '/og-home.png', width: 1200, height: 630, alt: `${project.title} — DooK Design` }

  return {
    title: project.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: `${project.title} — DooK Design`,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — DooK Design`,
      description,
      images: [ogImage.url],
    },
  }
}

// ponytail: shuffle simple para elegir "otros proyectos"; el orden exacto no es crítico.
function shuffle<T>(arr: T[]): T[] {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.v)
}

export default async function ProyectoDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const [published, categories, settings] = await Promise.all([
    getPublishedProjects(),
    getCategories(),
    getSiteSettings(),
  ])

  const categoryName = project.category_id
    ? (categories.find(c => c.id === project.category_id)?.name ?? null)
    : null

  // Renders → items con índice dentro del lightbox (solo los que tienen imagen).
  const renderFocus = (project.render_focus as Record<string, number>) ?? {}
  const renderFocusX = (project.render_focus_x as Record<string, number>) ?? {}
  let li = 0
  const renderItems = project.renders.map((path, i) => {
    const url = path ? getPublicRenderUrl(path) : null
    return {
      url,
      alt: `${project.title} — render ${i + 1}`,
      lightboxIndex: url ? li++ : -1,
      focusY: renderFocus[path] ?? 50,
      focusX: renderFocusX[path] ?? 50,
    }
  })
  const lightboxSlides = renderItems.filter(r => r.url).map(r => ({ src: r.url as string, alt: r.alt }))

  // Renders de entorno: fila de contexto (no van al lightbox). Forma + encuadre por imagen.
  const envLayout = (project.environment_layout as Record<string, EnvLayoutItem>) ?? {}
  const envImages = project.environment_renders
    .filter(Boolean)
    .map((path, i) => {
      const l = envLayout[path] ?? ENV_DEFAULT
      return {
        url: getPublicRenderUrl(path),
        alt: `${project.title} — entorno ${i + 1}`,
        size: l.size,
        focusY: l.focus,
        focusX: l.focus_x,
      }
    })

  // Otros proyectos: misma categoría primero (aleatorio), luego el resto (aleatorio). Máx 3.
  const others = published.filter(p => p.slug !== project.slug)
  const sameCat = shuffle(others.filter(p => p.category_id && p.category_id === project.category_id))
  const rest = shuffle(others.filter(p => !p.category_id || p.category_id !== project.category_id))
  const related: RelatedProject[] = [...sameCat, ...rest].slice(0, 3).map((p: Tables<'projects'>) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    coverUrl: p.renders[0] ? getPublicRenderUrl(p.renders[0]) : null,
    categoryName: p.category_id ? (categories.find(c => c.id === p.category_id)?.name ?? null) : null,
  }))

  const waUrl = buildWhatsappUrl(settings?.whatsapp_url, project.title)
  const emailUrl = buildEmailUrl(settings?.email, project.title)

  const projectUrl = `${siteUrl}/proyectos/${project.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${projectUrl}#work`,
        name: project.title,
        url: projectUrl,
        ...(project.description ? { description: project.description } : {}),
        ...(lightboxSlides.length > 0 ? { image: lightboxSlides.map(s => s.src) } : {}),
        dateCreated: String(project.year),
        ...(categoryName ? { genre: categoryName } : {}),
        creator: { '@type': 'Person', name: AUTHOR, url: siteUrl },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Proyectos', item: `${siteUrl}/proyectos` },
          { '@type': 'ListItem', position: 3, name: project.title, item: projectUrl },
        ],
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteNav overHero scrolledLabel={project.title} />
      <LightboxProvider slides={lightboxSlides}>
        <main>
          <ProjectHero slides={renderItems} title={project.title} year={project.year} categoryName={categoryName} />

          <ProjectEnvironmentRow images={envImages} />

          {/* Contenido */}
          <Reveal className="mx-auto max-w-[1600px] px-5 pb-6 pt-16 md:px-16 md:pb-12 md:pt-28">
            <div className="grid gap-10 md:gap-16 lg:grid-cols-[0.8fr_1.6fr]">
              <div>
                <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-(--text-secondary)">El proyecto</p>
                <h2 className="mb-8 text-[clamp(30px,4vw,44px)] font-semibold leading-[1.05] tracking-[-0.02em]">{project.title}</h2>
                <dl className="border-t border-(--site-border)">
                  <div className="flex items-baseline justify-between gap-5 border-b border-(--site-border) py-4">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--text-secondary)">Categoría</dt>
                    <dd className="text-base font-medium">{categoryName ?? '—'}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-5 border-b border-(--site-border) py-4">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--text-secondary)">Año</dt>
                    <dd className="text-base font-medium tabular-nums">{project.year}</dd>
                  </div>
                  {project.materials.length > 0 && (
                    <div className="pt-5">
                      <dt className="mb-3.5 text-[11px] font-medium uppercase tracking-[0.12em] text-(--text-secondary)">Materiales</dt>
                      <dd className="flex flex-wrap gap-2">
                        {project.materials.map(mat => (
                          <span key={mat} className="rounded-full bg-(--surface) px-4 py-2 text-xs font-medium">
                            {mat}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              {project.description && (
                <p className="max-w-[60ch] whitespace-pre-line text-[clamp(18px,2.1vw,22px)] font-light leading-[1.72] text-pretty">
                  {project.description}
                </p>
              )}
            </div>
          </Reveal>

          {lightboxSlides.length > 0 && <ProjectGallery images={renderItems} />}

          {/* CTA */}
          {(waUrl || emailUrl) && (
            <Reveal className="mx-auto max-w-[1600px] px-5 pb-14 md:px-16 md:pb-16">
              <div className="flex flex-wrap items-end justify-between gap-8 border-t border-(--site-border) pt-14 md:pt-16">
                <div className="max-w-[640px]">
                  <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-(--text-secondary)">¿Te interesa?</p>
                  <p className="text-[clamp(30px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-0.03em]">
                    Obtener mas información sobre {project.title}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {waUrl && (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-invert inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold">
                      <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
                      WhatsApp
                    </a>
                  )}
                  {emailUrl && (
                    <a href={emailUrl} target="_blank" rel="noopener noreferrer" className="btn-invert inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold">
                      <Mail className="h-[18px] w-[18px]" aria-hidden />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          <RelatedProjects projects={related} />
        </main>
      </LightboxProvider>
      <SiteFooter settings={settings} />
    </>
  )
}
