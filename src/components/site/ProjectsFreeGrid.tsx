import type { CSSProperties } from 'react'
import Link from 'next/link'
import { RenderImage } from '@/components/site/RenderImage'
import { Reveal } from '@/components/site/Reveal'
import { gridItemVars } from '@/lib/admin/schemas'
import type { GalleryItem } from '@/components/site/HomeGallery'

// Grilla libre de la página /proyectos: span, posición y encuadre de cada celda vienen de admin (projects_grid).
export function ProjectsFreeGrid({ items }: { items: GalleryItem[] }) {
  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-16 md:pb-28">
      <div className="home-grid">
        {items.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 8) * 0.06} style={gridItemVars(p.grid) as CSSProperties}>
            <Link href={`/proyectos/${p.slug}`} className="project-card flex h-full flex-col">
              <span className="relative flex-1 overflow-hidden rounded-[2px] bg-(--surface)">
                {p.coverUrl ? (
                  <RenderImage
                    src={p.coverUrl}
                    alt={`Render de ${p.title}`}
                    sizes="(max-width: 1079px) 100vw, 50vw"
                    className="card-render"
                    objectPosition={`${p.focusX}% ${p.focusY}%`}
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
    </section>
  )
}
