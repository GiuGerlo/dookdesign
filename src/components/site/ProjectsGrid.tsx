'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RenderImage } from '@/components/site/RenderImage'
import { Reveal } from '@/components/site/Reveal'

export interface ProjectCardData {
  slug: string
  title: string
  year: number
  coverUrl: string | null
  categoryName: string | null
  categorySlug: string | null
}

interface ProjectsGridProps {
  projects: ProjectCardData[]
  categories: { slug: string; name: string }[]
}

const INITIAL_COUNT = 6

const pillClass = 'cursor-pointer rounded-full border px-[18px] py-[9px] text-[13px] font-medium transition-colors duration-150'

function pillStyle(active: boolean) {
  return {
    borderColor: active ? 'var(--brand)' : 'var(--site-border)',
    background: active ? 'var(--brand)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
  }
}

export function ProjectsGrid({ projects, categories }: ProjectsGridProps) {
  const [category, setCategory] = useState('todos')
  const [year, setYear] = useState('todos')
  const [showAll, setShowAll] = useState(false)

  const years = [...new Set(projects.map(p => p.year))].sort((a, b) => b - a)

  const matched = projects.filter(
    p =>
      (category === 'todos' || p.categorySlug === category) &&
      (year === 'todos' || p.year === Number(year))
  )
  const visible = showAll ? matched : matched.slice(0, INITIAL_COUNT)
  const hiddenCount = matched.length - INITIAL_COUNT

  function selectCategory(slug: string) {
    setCategory(slug)
    setShowAll(false)
  }
  function selectYear(y: string) {
    setYear(y)
    setShowAll(false)
  }
  function reset() {
    setCategory('todos')
    setYear('todos')
    setShowAll(false)
  }

  const catChips = [{ slug: 'todos', name: 'Todos' }, ...categories]
  const yearChips = ['todos', ...years.map(String)]

  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-16 md:pb-28">
      {/* Filtros */}
      <Reveal className="mb-12 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.12em] text-(--text-secondary)">Categoría</span>
          {catChips.map(c => (
            <button
              key={c.slug}
              type="button"
              onClick={() => selectCategory(c.slug)}
              aria-pressed={category === c.slug}
              className={pillClass}
              style={pillStyle(category === c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <span aria-hidden className="hidden h-6 w-px bg-(--site-border) md:block" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.12em] text-(--text-secondary)">Año</span>
          {yearChips.map(y => (
            <button
              key={y}
              type="button"
              onClick={() => selectYear(y)}
              aria-pressed={year === y}
              className={`${pillClass} tabular-nums`}
              style={pillStyle(year === y)}
            >
              {y === 'todos' ? 'Todos' : y}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs font-medium tabular-nums tracking-[0.04em] text-(--text-secondary)">
          {matched.length} {matched.length === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </Reveal>

      {matched.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-2.5 text-[22px] font-light">Sin proyectos para este filtro.</p>
          <p className="mb-7 font-mono text-xs tracking-[0.04em] text-(--text-secondary)">Probá con otra categoría o año.</p>
          <button type="button" onClick={reset} className="btn-invert rounded-full px-7 py-3 text-[13px] font-medium">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p, i) => (
              <Reveal key={p.slug} delay={(i % INITIAL_COUNT) * 0.06}>
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
                    <span className="text-lg font-semibold tracking-[-0.01em] text-(--brand)">{p.title}</span>
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

          {!showAll && hiddenCount > 0 && (
            <div className="mt-14 flex justify-center">
              <button type="button" onClick={() => setShowAll(true)} className="btn-invert rounded-full px-8 py-3 text-[13px] font-medium">
                Ver más&nbsp;({hiddenCount})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
