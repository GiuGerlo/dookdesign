'use client'

import { useState } from 'react'
import Image from 'next/image'

interface RenderImageProps {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
}

// next/image `fill` con skeleton shimmer hasta que carga (los renders pesan aun optimizados).
// El contenedor padre debe ser position:relative con tamaño definido.
export function RenderImage({ src, alt, sizes, priority = false, className = '' }: RenderImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <div className="img-skeleton" aria-hidden />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        // ponytail: unoptimized = sirve el webp del bucket tal cual (ya viene optimizado a 3840px/~1MB).
        // Next re-encodaba a q75 y se veía borroso. Costo: móvil baja la full-res. Revisar si el ancho de banda molesta.
        unoptimized
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-400 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </>
  )
}
