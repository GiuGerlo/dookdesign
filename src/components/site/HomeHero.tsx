import Image from 'next/image'
import { ScrollCue } from '@/components/site/ScrollCue'

interface HomeHeroProps {
  imageUrl: string | null
  focusY?: number
  focusX?: number
}

// Hero fullscreen del home: portada elegida en admin + logo DK superpuesto.
export function HomeHero({ imageUrl, focusY = 50, focusX = 50 }: HomeHeroProps) {
  return (
    <header className="relative h-[560px] overflow-hidden md:h-svh">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Render destacado de DooK Design"
          fill
          sizes="100vw"
          priority
          // ponytail: bucket tal cual — Next re-encodaba a q75 y el hero se veía borroso.
          unoptimized
          className="object-cover"
          style={{ objectPosition: `${focusX}% ${focusY}%` }}
        />
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
