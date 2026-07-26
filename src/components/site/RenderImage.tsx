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
        // unoptimized: sirve el webp del bucket tal cual (ya optimizado a 3840px en el admin). Máxima
        // calidad. La nitidez en reposo la garantiza la capa GPU forzada en .card-render (globals.css).
        unoptimized
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-400 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </>
  )
}
