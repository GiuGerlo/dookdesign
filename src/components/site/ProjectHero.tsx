'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollCue } from '@/components/site/ScrollCue'
import { useLightbox } from '@/components/site/ProjectLightbox'

export interface HeroSlide {
  url: string | null
  alt: string
  lightboxIndex: number
}

interface ProjectHeroProps {
  slides: HeroSlide[]
  title: string
  year: number
  categoryName: string | null
}

// Hero carrusel fullscreen del detalle. Embla para swipe/drag; el chrome es propio.
// Click en la imagen abre el lightbox compartido. Overlay con entrada fade-up escalonada.
export function ProjectHero({ slides, title, year, categoryName }: ProjectHeroProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = useState(0)
  const { open } = useLightbox()
  const pointerDown = useRef<{ x: number; y: number } | null>(null)
  const n = slides.length

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Flechas de teclado (ignorar si el lightbox está abierto).
  useEffect(() => {
    if (!emblaApi || n < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('.yarl__root')) return
      if (e.key === 'ArrowRight') emblaApi.scrollNext()
      else if (e.key === 'ArrowLeft') emblaApi.scrollPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [emblaApi, n])

  function handleSlideClick(slide: HeroSlide, e: React.MouseEvent) {
    // Distinguir tap de drag: si el puntero se movió >10px entre down y up, fue arrastre → ignorar.
    const down = pointerDown.current
    const moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) : 0
    if (slide.lightboxIndex >= 0 && moved < 10) {
      open(slide.lightboxIndex)
    }
  }

  const arrowClass =
    'absolute top-1/2 z-[6] flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-black/45'

  return (
    <header className="relative h-[84svh] overflow-hidden bg-(--surface) md:h-svh">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div
              key={i}
              onPointerDown={e => { pointerDown.current = { x: e.clientX, y: e.clientY } }}
              onClick={e => handleSlideClick(s, e)}
              className={`relative h-full flex-[0_0_100%] ${s.url ? 'cursor-zoom-in' : ''}`}
            >
              {s.url ? (
                <Image
                  src={s.url}
                  alt={s.alt}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  unoptimized
                  className="object-contain md:object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(135deg,#2A2A2F,#2A2A2F_14px,#323238_14px,#323238_28px)]">
                  <span className="font-mono text-[13px] tracking-[0.06em] text-[#9999A8]">RENDER {i + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_30%,rgba(0,0,0,0.15)_60%,rgba(0,0,0,0.7)_100%)]"
      />

      <Link
        href="/proyectos"
        className="absolute left-5 top-[78px] z-[5] inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.02em] text-[#F0F0F0] transition-opacity hover:opacity-70 motion-safe:animate-[hero-fade-up_700ms_ease-out] md:left-16 md:top-[104px]"
      >
        ← Volver a proyectos
      </Link>

      <div className="pointer-events-none absolute inset-x-5 bottom-8 z-[5] md:inset-x-16 md:bottom-14">
        <div className="mb-4 flex items-center gap-3.5 motion-safe:animate-[hero-fade-up_700ms_ease-out_120ms_both]">
          {categoryName && (
            <span className="rounded-full border border-white/45 px-3 py-[5px] text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
              {categoryName}
            </span>
          )}
          <span className="text-sm font-medium tabular-nums tracking-[0.04em] text-white/85">{year}</span>
        </div>
        <h1 className="max-w-[80%] text-[clamp(56px,11vw,160px)] font-bold leading-[0.92] tracking-[-0.04em] text-white motion-safe:animate-[hero-fade-up_800ms_ease-out_200ms_both]">
          {title}
        </h1>
      </div>

      {n > 1 && (
        <>
          <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Anterior" className={`${arrowClass} left-3 md:left-7`}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Siguiente" className={`${arrowClass} right-3 md:right-7`}>
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-8 right-5 z-[6] flex items-center gap-4 md:bottom-14 md:right-16">
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                  aria-current={i === selected}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: i === selected ? 26 : 8, background: i === selected ? '#fff' : 'rgba(255,255,255,0.45)' }}
                />
              ))}
            </div>
            <span className="text-[13px] font-medium tabular-nums tracking-[0.06em] text-white">
              {selected + 1} / {n}
            </span>
          </div>
        </>
      )}

      <ScrollCue />
    </header>
  )
}
