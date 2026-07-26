import type { Metadata } from 'next'
import { getPublishedProjects, getCategories, getSiteSettings } from '@/lib/projects/queries'
import { getPublicRenderUrl } from '@/lib/site/images'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Reveal } from '@/components/site/Reveal'
import { ProjectsGrid, type ProjectCardData } from '@/components/site/ProjectsGrid'

export const metadata: Metadata = {
  title: 'Proyectos — dookdesign',
  description:
    'Portfolio de diseño industrial de Agustín Cavallera: mobiliario y objetos, del material a la forma terminada.',
}

export default async function ProyectosPage() {
  const [projects, categories, settings] = await Promise.all([
    getPublishedProjects(),
    getCategories(),
    getSiteSettings(),
  ])

  const categoryById = new Map(categories.map(c => [c.id, c]))
  const cards: ProjectCardData[] = projects.map(p => {
    const cat = p.category_id ? categoryById.get(p.category_id) : null
    return {
      slug: p.slug,
      title: p.title,
      year: p.year,
      coverUrl: p.renders[0] ? getPublicRenderUrl(p.renders[0]) : null,
      categoryName: cat?.name ?? null,
      categorySlug: cat?.slug ?? null,
    }
  })
  const usedCategories = categories
    .filter(c => cards.some(card => card.categorySlug === c.slug))
    .map(c => ({ slug: c.slug, name: c.name }))

  return (
    <>
      <SiteNav />
      <main>
        <Reveal className="mx-auto max-w-[1600px] px-5 pb-10 pt-32 md:px-16 md:pb-12 md:pt-44">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.14em] text-(--text-secondary)">Portfolio</p>
          <h1 className="mb-8 text-[clamp(52px,10vw,140px)] font-bold leading-[0.94] tracking-[-0.04em]">Proyectos</h1>
          <p className="max-w-[560px] text-[clamp(18px,2.4vw,22px)] font-light leading-[1.6] text-(--text-secondary)">
            Una selección de piezas de diseño industrial — mobiliario y objetos pensados desde el material hasta la forma terminada.
          </p>
        </Reveal>

        <ProjectsGrid projects={cards} categories={usedCategories} />
      </main>
      <SiteFooter settings={settings} />
    </>
  )
}
