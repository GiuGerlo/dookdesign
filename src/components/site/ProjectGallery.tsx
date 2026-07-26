'use client'

import { RenderImage } from '@/components/site/RenderImage'
import { useLightbox } from '@/components/site/ProjectLightbox'

export interface GalleryImage {
  url: string | null
  alt: string
  lightboxIndex: number
}

interface ProjectGalleryProps {
  images: GalleryImage[]
}

// Galería uniforme; abre el lightbox compartido (provider) en el índice de la imagen.
export function ProjectGallery({ images }: ProjectGalleryProps) {
  const { open } = useLightbox()

  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-16 md:px-16 md:pb-20">
      <p className="mb-7 text-[11px] font-medium uppercase tracking-[0.14em] text-(--text-secondary)">Galería</p>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {images.map((img, i) => {
          if (!img.url) {
            return (
              <div
                key={i}
                className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-[repeating-linear-gradient(135deg,var(--surface),var(--surface)_10px,var(--bg)_10px,var(--bg)_20px)]"
              >
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-(--text-secondary)">
                  RENDER {i + 1}
                </span>
              </div>
            )
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => open(img.lightboxIndex)}
              aria-label={`Ampliar: ${img.alt}`}
              className="relative block aspect-[4/3] cursor-zoom-in overflow-hidden rounded-[3px] bg-(--surface)"
            >
              <RenderImage
                src={img.url}
                alt={img.alt}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
