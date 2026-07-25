'use client'

import { useEffect } from 'react'

// El admin es siempre oscuro. El tema se aplica en <html> (no en un div anidado) para que los
// portales — toasts de sileo, Select y AlertDialog, que se montan en document.body — hereden el
// tema oscuro. Sin esto renderizan en claro (letras negras sobre fondo oscuro).
// Al desmontar (navegar al sitio público) se restaura el estado previo del documento.
export function AdminThemeLock() {
  useEffect(() => {
    const el = document.documentElement
    const prevTheme = el.getAttribute('data-theme')
    const hadDark = el.classList.contains('dark')

    el.setAttribute('data-theme', 'dark')
    el.classList.add('dark')

    return () => {
      if (prevTheme === null) el.removeAttribute('data-theme')
      else el.setAttribute('data-theme', prevTheme)
      if (!hadDark) el.classList.remove('dark')
    }
  }, [])

  return null
}
