'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react'
import { ScrollCue } from '@/components/site/ScrollCue'
import { useLightbox } from '@/components/site/ProjectLightbox'
import { useCart, MAX_QTY } from '@/lib/site/cart'

export interface HeroSlide {
  url: string | null
  alt: string
  lightboxIndex: number
  focusY: number
  focusX: number
}

// Color del producto ya resuelto a un índice de slide (page.tsx mapea render→índice).
export interface HeroColor {
  hex: string
  name: string
  render: string
  slideIndex: number
}

interface ProjectHeroProps {
  slides: HeroSlide[]
  title: string
  year: number
  categoryName: string | null
  colors: HeroColor[]
  projectId: string
  slug: string
  firstRender: string | null
}

// Hero carrusel fullscreen del detalle. Embla para swipe/drag; el chrome es propio.
// Click en la imagen abre el lightbox compartido. Overlay con entrada fade-up escalonada.
// Los swatches de color mueven el carrusel (grill #2) y son la variante que va al carrito.
export function ProjectHero({ slides, title, year, categoryName, colors, projectId, slug, firstRender }: ProjectHeroProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = useState(0)
  const { open } = useLightbox()
  const { addItem } = useCart()
  const pointerDown = useRef<{ x: number; y: number } | null>(null)
  const n = slides.length

  // Variante elegida para el carrito. Con colores es obligatorio elegir (grill #1) → arranca null.
  const [colorIdx, setColorIdx] = useState<number | null>(null)
  const [qty, setQty] = useState(1)
  const selColor = colorIdx != null ? colors[colorIdx] : null

  function pickColor(i: number) {
    setColorIdx(i)
    const slide = colors[i]?.slideIndex ?? -1
    if (slide >= 0) emblaApi?.scrollTo(slide)
  }

  function handleAdd() {
    addItem({
      projectId,
      slug,
      title,
      colorName: selColor?.name ?? null,
      colorHex: selColor?.hex ?? null,
      thumb: selColor?.render ?? firstRender,
      quantity: qty,
    })
    setQty(1)
  }

  const needsColor = colors.length > 0 && colorIdx === null

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
                  className="hero-img"
                  style={{ '--hero-focus': `${s.focusY}%`, '--hero-focus-x': `${s.focusX}%` } as React.CSSProperties}
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

        {/* Compra: swatches (obligatorio si hay colores) + cantidad + agregar. pointer-events-auto
            porque el overlay del título pasa clicks a la imagen. */}
        <div className="pointer-events-auto mt-6 flex flex-col gap-3.5 motion-safe:animate-[hero-fade-up_800ms_ease-out_320ms_both] md:mt-8">
          {colors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              {colors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickColor(i)}
                  title={c.name}
                  aria-label={`Color ${c.name}`}
                  aria-pressed={colorIdx === i}
                  className={`h-8 w-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                    colorIdx === i ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-black/30' : 'border-white/50'
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
              <span className="ml-1 text-[13px] font-medium text-white/85">{selColor?.name ?? 'Elegí un color'}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-white/35 bg-black/25 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                aria-label="Menos"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-7 text-center text-sm font-semibold tabular-nums text-white">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(q => Math.min(MAX_QTY, q + 1))}
                aria-label="Más"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={needsColor}
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-white/90 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
              {needsColor ? 'Elegí un color' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>

      {n > 1 && (
        <>
          <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Anterior" className={`${arrowClass} left-3 md:left-7`}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Siguiente" className={`${arrowClass} right-3 md:right-7`}>
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Contador/dots: en móvil arriba a la derecha (junto a "Volver", lejos del bloque de
              compra); en desktop abajo a la derecha. Evita el pisado con cantidad/CTA. */}
          <div className="absolute right-5 top-[76px] z-[6] flex items-center gap-4 md:top-auto md:bottom-14 md:right-16">
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

      {/* ScrollCue solo en desktop: en móvil se pisaba con el bloque de compra. */}
      <div className="hidden md:block">
        <ScrollCue />
      </div>
    </header>
  )
}
