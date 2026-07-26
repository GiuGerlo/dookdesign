import Image from 'next/image'
import { ScrollCue } from '@/components/site/ScrollCue'

interface HomeHeroProps {
  imageUrl: string | null
  mobileImageUrl?: string | null
  focusY?: number
  focusX?: number
  mobileFocusY?: number
  mobileFocusX?: number
}

// Hero fullscreen del home: portada elegida en admin (imagen desktop + imagen móvil) + logo DK.
// <picture> baja SOLO la imagen que corresponde al dispositivo (móvil <768px). El encuadre por
// dispositivo va en un <style> con media query (no se puede por-fuente con object-position inline).
export function HomeHero({
  imageUrl,
  mobileImageUrl,
  focusY = 50,
  focusX = 50,
  mobileFocusY = 50,
  mobileFocusX = 50,
}: HomeHeroProps) {
  const desktopSrc = imageUrl ?? mobileImageUrl ?? null
  return (
    <header className="relative h-[560px] overflow-hidden md:h-svh">
      {desktopSrc ? (
        <>
          <picture>
            {mobileImageUrl && <source media="(max-width: 767px)" srcSet={mobileImageUrl} />}
            {/* ponytail: <img> crudo (no next/image) — el hero se sirve del bucket tal cual, sin re-encode. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={desktopSrc}
              alt="Render destacado de DooK Design"
              fetchPriority="high"
              className="home-hero__cover absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <style>{`
            .home-hero__cover{object-position:${focusX}% ${focusY}%}
            @media (max-width:767px){.home-hero__cover{object-position:${mobileFocusX}% ${mobileFocusY}%}}
          `}</style>
        </>
      ) : (
        <div className="absolute inset-0 bg-(--surface)" aria-hidden />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.55)_100%)]"
      />
      <div className="absolute bottom-6 left-5 right-5 flex flex-wrap items-end justify-between gap-3 md:left-16 md:right-16">
        <div className="relative h-[clamp(120px,20vw,240px)] w-[clamp(120px,20vw,240px)] motion-safe:animate-[hero-fade-up_800ms_ease-out]">
          <Image
            src="/logo-dk.png"
            alt="DK — DooK Design"
            fill
            sizes="240px"
            priority
            className="object-contain object-left-bottom brightness-0 invert"
          />
        </div>
        <p className="whitespace-nowrap pb-3 text-[13px] font-medium tracking-[0.08em] text-[#E6E6E6] motion-safe:animate-[hero-fade-up_800ms_ease-out_300ms_both]">
          DISEÑO&nbsp;ARGENTINO
        </p>
      </div>
      <ScrollCue />
    </header>
  )
}
