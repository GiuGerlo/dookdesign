import { RenderImage } from '@/components/site/RenderImage'
import { Reveal } from '@/components/site/Reveal'
import { envSizeGeom, type EnvSize } from '@/lib/admin/schemas'

export interface EnvironmentImage {
  url: string
  alt: string
  size: EnvSize
  focusX: number
  focusY: number
}

interface ProjectEnvironmentRowProps {
  images: EnvironmentImage[]
}

// Renders de entorno: fila de contexto (máx 3), forma de celda elegible + encuadre X/Y, sin lightbox.
export function ProjectEnvironmentRow({ images }: ProjectEnvironmentRowProps) {
  if (images.length === 0) return null

  return (
    <Reveal className="mx-auto max-w-[1600px] px-5 pt-3.5 md:px-16 md:pt-5">
      {/* Flex centrado: con 1 o 2 imágenes quedan al medio. Cada celda toma su ancho (span/3) y forma (aspect). */}
      <div className="flex flex-col items-center gap-3.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5">
        {images.map((img, i) => {
          const { span, ar } = envSizeGeom[img.size]
          return (
            <div
              key={i}
              className="relative w-full overflow-hidden rounded-[3px] bg-(--surface) sm:w-[var(--env-basis)]"
              // Ancho: span de 3 unidades en desktop (restando los gaps de 1.25rem). Móvil: full.
              style={{ aspectRatio: ar, ['--env-basis' as string]: `calc((100% - 2.5rem) * ${span} / 3 + ${span - 1} * 1.25rem)` }}
            >
              <RenderImage
                src={img.url}
                alt={img.alt}
                sizes="(max-width: 639px) 100vw, 33vw"
                objectPosition={`${img.focusX}% ${img.focusY}%`}
              />
            </div>
          )
        })}
      </div>
    </Reveal>
  )
}
