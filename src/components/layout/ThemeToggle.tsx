'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(localStorage.getItem('theme') === 'dark')
  }, [])

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    localStorage.setItem('theme', next)
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  return (
    <button onClick={toggle} aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
      {isDark ? '○' : '●'}
    </button>
  )
}
