'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

interface LightboxSlide {
  src: string
  alt: string
}

interface LightboxContextValue {
  open: (index: number) => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox debe usarse dentro de <LightboxProvider>')
  return ctx
}

// Lightbox único compartido: el hero y la galería lo abren en el mismo índice de imagen.
export function LightboxProvider({ slides, children }: { slides: LightboxSlide[]; children: ReactNode }) {
  const [index, setIndex] = useState(-1)

  return (
    <LightboxContext.Provider value={{ open: setIndex }}>
      {children}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom]}
      />
    </LightboxContext.Provider>
  )
}
