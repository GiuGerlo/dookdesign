'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'

function applyTheme(next: 'dark' | 'light') {
  if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
  localStorage.setItem('theme', next)
}

// Toggle claro/oscuro con reveal circular desde el punto del click (View Transitions API).
// Fallback instantáneo si el navegador no soporta o el usuario prefiere menos movimiento.
export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
  }, [])

  function toggle(e: React.MouseEvent) {
    const next = isDark ? 'light' : 'dark'
    const setNext = () => {
      setIsDark(next === 'dark')
      applyTheme(next)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) {
      setNext()
      return
    }
    const x = e.clientX || window.innerWidth - 44
    const y = e.clientY || 44
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const t = document.startViewTransition(() => flushSync(setNext))
    t.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
          { duration: 520, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={className}
    >
      {isDark ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
    </button>
  )
}
