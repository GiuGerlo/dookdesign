import Link from 'next/link'
import { RenderImage } from '@/components/site/RenderImage'
import { Reveal } from '@/components/site/Reveal'
import type { HomeGridSize } from '@/lib/admin/schemas'

export interface GalleryItem {
  slug: string
  title: string
  year: number
  coverUrl: string | null
  size: HomeGridSize
}

interface HomeGalleryProps {
  items: GalleryItem[]
}

const sizeClass: Record<HomeGridSize, string> = {
  sm: 'home-tile--sm',
  wide: 'home-tile--wide',
  tall: 'home-tile--tall',
  big: 'home-tile--big',
}

// Grilla curada del home: orden y tamaño de cada celda vienen de admin (home_grid).
export function HomeGallery({ items }: HomeGalleryProps) {
  return (
    <section id="proyectos" className="mx-auto max-w-[1600px] px-5 pb-16 pt-6 md:px-16 md:pb-28 md:pt-12">
      <Reveal className="mb-14 text-center">
        <h2 className="text-[44px] font-semibold tracking-[-0.02em]">Proyectos</h2>
      </Reveal>

      <div className="home-grid">
        {items.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.07} className={sizeClass[p.size]}>
            <Link href={`/proyectos/${p.slug}`} className="project-card flex h-full flex-col">
              <span className="relative flex-1 overflow-hidden rounded-[2px] bg-(--surface)">
                {p.coverUrl ? (
                  <RenderImage
                    src={p.coverUrl}
                    alt={`Render de ${p.title}`}
                    sizes="(max-width: 1079px) 100vw, 50vw"
                    className="card-render"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(135deg,var(--surface),var(--surface)_10px,var(--bg)_10px,var(--bg)_20px)] p-4 text-center">
                    <span className="font-mono text-[11px] text-(--text-secondary)">RENDER — {p.title}</span>
                  </span>
                )}
                <span className="project-card__overlay absolute inset-0 flex items-end bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.55)_100%)] p-[18px]">
                  <span className="text-[13px] font-semibold tracking-[0.02em] text-white">Ver proyecto&nbsp;→</span>
                </span>
              </span>
              <span className="mt-3.5 flex justify-between">
                <span className="text-base font-semibold text-(--brand-ink)">{p.title}</span>
                <span className="text-xs tracking-[0.04em] text-(--text-secondary)">{p.year}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Link href="/proyectos" className="btn-invert rounded-full px-8 py-3 text-[13px] font-medium">
          Ver más proyectos
        </Link>
      </div>
    </section>
  )
}
