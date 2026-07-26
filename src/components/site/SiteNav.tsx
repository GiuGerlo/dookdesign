'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/site/ThemeToggle'

const MENU_LINKS = [
  { label: 'Sobre mí', href: '/#sobre' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Contacto', href: '/#contacto' },
]

// Nav fija del sitio: transparente arriba, fondo + blur al scrollear.
// `overHero`: la página abre con una foto oscura fullscreen → íconos/logo en claro hasta scrollear.
export function SiteNav({ overHero = false, scrolledLabel }: { overHero?: boolean; scrolledLabel?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const overheroActive = overHero && !scrolled && !menuOpen

  return (
    <>
      <nav
        className={`site-nav${overheroActive ? ' site-nav--overhero' : ''}${scrolled ? ' site-nav--scrolled' : ''} fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-5 md:px-16 md:py-7 transition-[background,box-shadow,border-color] duration-300`}
      >
        <Link href="/" aria-label="dookdesign — inicio" className="relative block h-[34px] w-[120px]">
          <Image
            src="/logo-dook-sec.png"
            alt=""
            fill
            sizes="120px"
            className="logo-for-dark object-contain object-left transition-opacity duration-300"
            priority
          />
          <Image
            src="/logo-dook.png"
            alt=""
            fill
            sizes="120px"
            className="logo-for-light object-contain object-left transition-opacity duration-300"
            priority
          />
        </Link>

        {scrolledLabel && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-sm font-semibold tracking-[-0.01em] transition-opacity duration-300 md:block"
            style={{ opacity: scrolled && !menuOpen ? 1 : 0 }}
          >
            {scrolledLabel}
          </span>
        )}

        <div className="flex items-center gap-4">
          <ThemeToggle className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-current/40 text-current transition-colors duration-300" />
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            className="relative z-[60] flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px]"
          >
            <span
              className="block h-[2px] w-6 bg-current transition-transform duration-300"
              style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block h-[2px] w-6 bg-current transition-opacity duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-[2px] w-6 bg-current transition-transform duration-300"
              style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </nav>

      {/* Overlay del menú */}
      <div
        className="fixed inset-0 z-30 flex flex-col justify-center px-[clamp(20px,6vw,80px)] transition-[opacity,visibility] duration-[450ms]"
        style={{
          background: 'var(--bg)',
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? 'visible' : 'hidden',
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-1">
          {MENU_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className="group flex items-baseline gap-5 py-1.5 text-(--text-primary)"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 550ms cubic-bezier(0.4,0,0.2,1) ${menuOpen ? 140 + i * 75 : 0}ms, transform 550ms cubic-bezier(0.4,0,0.2,1) ${menuOpen ? 140 + i * 75 : 0}ms`,
              }}
            >
              <span className="text-[13px] font-medium tabular-nums text-(--text-secondary) transition-colors duration-300 group-hover:text-(--brand)">0{i + 1}</span>
              <span className="text-[clamp(44px,9vw,100px)] font-bold leading-[1.05] tracking-[-0.03em] transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-(--brand)">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
