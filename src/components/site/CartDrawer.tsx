'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart, MAX_QTY } from '@/lib/site/cart'
import { getPublicRenderUrl } from '@/lib/site/images'
import { buildCartWhatsappUrl } from '@/lib/site/contact'

// Drawer del carrito de presupuesto. Vive en SiteNav → presente en todo el sitio.
// Al pedir presupuesto abre WhatsApp con el detalle y pasa a un estado de confirmación
// (no se puede saber si el usuario envió → vaciado manual, grill #4).
const CONTACT_KEY = 'dook_checkout'

export function CartDrawer({ whatsappUrl }: { whatsappUrl?: string | null }) {
  const { items, count, open, setQty, removeItem, clear, closeCart } = useCart()
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [sent, setSent] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Cargar nombre + lugar guardados (para no reescribir en cada pedido).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONTACT_KEY) ?? '{}')
      if (typeof saved.fullName === 'string') setFullName(saved.fullName)
      if (typeof saved.location === 'string') setLocation(saved.location)
    } catch {
      // sin cache → campos vacíos
    }
  }, [])

  // Persistir nombre + lugar en cache al cambiar.
  useEffect(() => {
    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify({ fullName, location }))
    } catch {
      // localStorage no disponible → no persiste
    }
  }, [fullName, location])

  // Al cerrar, resetear el estado de confirmación para la próxima apertura.
  useEffect(() => {
    if (!open) setSent(false)
  }, [open])

  // Esc para cerrar + bloquear scroll del body mientras está abierto.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, closeCart])

  const canSubmit = items.length > 0 && fullName.trim().length > 0 && location.trim().length > 0

  function handleSubmit() {
    const url = buildCartWhatsappUrl(whatsappUrl, items, fullName, location)
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none"
        style={{ opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden', pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal={open}
        aria-label="Tu pedido"
        aria-hidden={!open}
        className="fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-md flex-col bg-(--bg) shadow-2xl outline-none transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <header className="flex items-center justify-between border-b border-(--site-border) px-5 py-5">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.01em]">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            Tu pedido{count > 0 && <span className="text-(--text-secondary) tabular-nums">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-(--text-secondary) transition-colors hover:text-(--text-primary)"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="text-[clamp(20px,3vw,26px)] font-semibold leading-snug">
              Abrimos WhatsApp con tu pedido.
            </p>
            <p className="max-w-[32ch] text-sm text-(--text-secondary)">
              Enviá el mensaje a Agustín para confirmar. Cuando lo hayas mandado, podés vaciar el carrito.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => { clear(); closeCart() }}
                className="btn-invert rounded-full px-7 py-3.5 text-sm font-semibold"
              >
                Vaciar carrito
              </button>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="rounded-full px-7 py-3 text-sm font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
              >
                Seguir editando
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-(--text-secondary)" aria-hidden />
            <p className="text-(--text-secondary)">Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-(--site-border) overflow-y-auto px-5">
              {items.map(item => (
                <li key={item.key} className="flex gap-3.5 py-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-(--surface)">
                    {item.thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getPublicRenderUrl(item.thumb)} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Quitar ${item.title}`}
                        className="shrink-0 text-(--text-secondary) transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.colorName && (
                      <span className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                        <span className="h-3 w-3 rounded-full border border-black/15" style={{ background: item.colorHex ?? undefined }} aria-hidden />
                        {item.colorName}
                      </span>
                    )}
                    <div className="mt-auto flex w-fit items-center gap-1 rounded-full border border-(--site-border) p-0.5">
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.quantity - 1)}
                        aria-label="Restar"
                        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-(--surface)"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.quantity + 1)}
                        disabled={item.quantity >= MAX_QTY}
                        aria-label="Sumar"
                        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-(--surface) disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-(--site-border) px-5 py-5">
              <div className="space-y-1.5">
                <label htmlFor="cart-name" className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
                  Nombre y apellido *
                </label>
                <input
                  id="cart-name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  autoComplete="name"
                  className="w-full rounded-lg border border-(--site-border) bg-(--surface) px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-(--brand-ink)"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cart-location" className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--text-secondary)">
                  Enviar a *
                </label>
                <input
                  id="cart-location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ciudad / dirección"
                  className="w-full rounded-lg border border-(--site-border) bg-(--surface) px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-(--brand-ink)"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="btn-invert w-full rounded-full py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pedir presupuesto
              </button>
              {items.length > 0 && !canSubmit && (
                <p className="text-center text-xs text-(--text-secondary)">Completá nombre y lugar de envío para continuar.</p>
              )}
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
