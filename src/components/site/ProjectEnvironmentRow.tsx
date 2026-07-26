import { RenderImage } from '@/components/site/RenderImage'
import { Reveal } from '@/components/site/Reveal'

export interface EnvironmentImage {
  url: string
  alt: string
}

interface ProjectEnvironmentRowProps {
  images: EnvironmentImage[]
}

// Renders de entorno: fila fija de contexto (máx 3), recortada (cover), sin zoom ni lightbox.
export function ProjectEnvironmentRow({ images }: ProjectEnvironmentRowProps) {
  if (images.length === 0) return null

  return (
    <Reveal className="mx-auto max-w-[1600px] px-5 pt-3.5 md:px-16 md:pt-5">
      {/* Flex centrado: con 1 o 2 imágenes quedan al medio (no pegadas a la izquierda). */}
      <div className="flex flex-col items-center gap-3.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px] bg-(--surface) sm:w-[calc((100%-2.5rem)/3)]"
          >
            <RenderImage
              src={img.url}
              alt={img.alt}
              sizes="(max-width: 639px) 100vw, 33vw"
            />
          </div>
        ))}
      </div>
    </Reveal>
  )
}
