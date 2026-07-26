import Link from 'next/link'
import { RenderImage } from '@/components/site/RenderImage'
import { Reveal } from '@/components/site/Reveal'

export interface RelatedProject {
  slug: string
  title: string
  year: number
  coverUrl: string | null
  categoryName: string | null
}

// Franja "Otros proyectos" antes del footer: seguir explorando el portfolio.
export function RelatedProjects({ projects }: { projects: RelatedProject[] }) {
  if (projects.length === 0) return null

  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-6 md:px-16 md:pb-10">
      <div className="border-t border-(--site-border) pt-12 md:pt-16">
        <p className="mb-8 text-[11px] font-medium uppercase tracking-[0.14em] text-(--text-secondary)">Otros proyectos</p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Link href={`/proyectos/${p.slug}`} className="project-card flex flex-col">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[3px] bg-(--surface)">
                  {p.coverUrl ? (
                    <RenderImage
                      src={p.coverUrl}
                      alt={`Render de ${p.title}`}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="card-render"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(135deg,var(--surface),var(--surface)_10px,var(--bg)_10px,var(--bg)_20px)] p-4 text-center">
                      <span className="font-mono text-[11px] text-(--text-secondary)">RENDER — {p.title}</span>
                    </span>
                  )}
                  <span className="project-card__overlay absolute inset-0 flex items-end bg-[linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,0.55)_100%)] p-[18px]">
                    <span className="text-[13px] font-semibold tracking-[0.02em] text-white">Ver proyecto&nbsp;→</span>
                  </span>
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold tracking-[-0.01em] text-(--brand-ink)">{p.title}</span>
                  <span className="text-xs tabular-nums tracking-[0.04em] text-(--text-secondary)">{p.year}</span>
                </span>
                {p.categoryName && (
                  <span className="mt-2 self-start rounded-full border border-(--site-border) px-[11px] py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-(--text-secondary)">
                    {p.categoryName}
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
