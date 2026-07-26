'use client'

import { useEffect, useState } from 'react'

// Chevron animado "scroll" sobre el hero; se desvanece al empezar a bajar.
export function ScrollCue({ label = 'Scroll' }: { label?: string }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-5 left-0 right-0 z-[2] flex flex-col items-center gap-1.5 transition-opacity duration-400"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <span className="text-[10px] uppercase tracking-[0.24em] text-white/85">{label}</span>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="motion-safe:animate-[scroll-cue_1.7s_ease-in-out_infinite] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}
