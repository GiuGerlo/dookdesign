import type { Metadata } from 'next'
import { getPublishedProjects, getSiteSettings } from '@/lib/projects/queries'
import { getPublicRenderUrl } from '@/lib/site/images'
import { projectsGridSchema, type HomeGridItem } from '@/lib/admin/schemas'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Reveal } from '@/components/site/Reveal'
import { ProjectsFreeGrid } from '@/components/site/ProjectsFreeGrid'
import type { GalleryItem } from '@/components/site/HomeGallery'

const INTRO_FALLBACK =
  'Una selección de piezas de diseño industrial — mobiliario y objetos pensados desde el material hasta la forma terminada.'

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Portfolio de diseño industrial de Agustín Cavallera: mobiliario y objetos, del material a la forma terminada.',
  alternates: { canonical: '/proyectos' },
  openGraph: {
    type: 'website',
    url: '/proyectos',
    title: 'Proyectos — DooK Design',
    description:
      'Portfolio de diseño industrial de Agustín Cavallera: mobiliario y objetos, del material a la forma terminada.',
  },
}

export default async function ProyectosPage() {
  const [projects, settings] = await Promise.all([getPublishedProjects(), getSiteSettings()])

  // Grilla libre curada en admin (projects_grid); todos los publicados aparecen (los no ubicados, auto-flow).
  const parsed = projectsGridSchema.safeParse(settings?.projects_grid ?? [])
  const savedById = new Map((parsed.success ? parsed.data : []).map(g => [g.project_id, g]))

  const items: GalleryItem[] = projects.map(p => {
    const grid: HomeGridItem = savedById.get(p.id) ?? { project_id: p.id, size: 'sm' }
    return {
      slug: p.slug,
      title: p.title,
      year: p.year,
      coverUrl: p.renders[0] ? getPublicRenderUrl(p.renders[0]) : null,
      focusY: grid.focus ?? 50,
      focusX: grid.focus_x ?? 50,
      grid,
    }
  })

  return (
    <>
      <SiteNav whatsappUrl={settings?.whatsapp_url} />
      <main>
        <Reveal className="mx-auto max-w-[1600px] px-5 pb-10 pt-32 md:px-16 md:pb-12 md:pt-44">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.14em] text-(--text-secondary)">Portfolio</p>
          <h1 className="mb-8 text-[clamp(52px,10vw,140px)] font-bold leading-[0.94] tracking-[-0.04em]">Proyectos</h1>
          <p className="max-w-[560px] whitespace-pre-line text-[clamp(18px,2.4vw,22px)] font-light leading-[1.6] text-(--text-secondary)">
            {settings?.projects_intro || INTRO_FALLBACK}
          </p>
        </Reveal>

        <ProjectsFreeGrid items={items} />
      </main>
      <SiteFooter settings={settings} />
    </>
  )
}
