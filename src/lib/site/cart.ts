// Carrito de presupuesto — store cliente sin backend ni Provider.
// useSyncExternalStore (nativo React) + localStorage. Compartido entre el navbar
// (badge + drawer) y el botón "Agregar al carrito" del detalle.
// ponytail: sin sync multi-tab (storage event); agregar solo si hace falta.
import { useSyncExternalStore } from 'react'

export interface CartItem {
  key: string // dedup: projectId + color
  projectId: string
  slug: string
  title: string
  colorName: string | null
  colorHex: string | null
  thumb: string | null // path de render (se convierte a URL pública al mostrar)
  quantity: number
}

interface CartState {
  items: CartItem[]
  open: boolean
}

const STORAGE_KEY = 'dook_cart'
export const MAX_QTY = 99

// Estado del servidor: siempre vacío → sin mismatch en la primera hidratación.
const SERVER_STATE: CartState = { items: [], open: false }

let state: CartState = { items: [], open: false }
const listeners = new Set<() => void>()

// Hidratar una sola vez al cargar el módulo en el cliente.
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const items = raw ? JSON.parse(raw) : null
    if (Array.isArray(items)) state = { items, open: false }
  } catch {
    // localStorage no disponible o JSON corrupto → carrito vacío.
  }
}

function emit() {
  for (const l of listeners) l()
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  } catch {
    // Sin persistencia (modo privado, cuota) → el carrito vive solo en memoria.
  }
}

// Reemplaza el estado por una nueva referencia (requerido por useSyncExternalStore).
function set(next: Partial<CartState>, save = false) {
  state = { ...state, ...next }
  if (save) persist()
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return SERVER_STATE
}

// --- Acciones ---

export function addItem(item: Omit<CartItem, 'key'>) {
  const key = `${item.projectId}:${item.colorName ?? ''}`
  const existing = state.items.find(i => i.key === key)
  const items = existing
    ? state.items.map(i =>
        i.key === key ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + item.quantity) } : i,
      )
    : [...state.items, { ...item, key, quantity: Math.min(MAX_QTY, item.quantity) }]
  set({ items, open: true }, true) // agregar abre el drawer (grill #6)
}

export function setQty(key: string, quantity: number) {
  if (quantity < 1) return removeItem(key)
  const q = Math.min(MAX_QTY, Math.floor(quantity))
  set({ items: state.items.map(i => (i.key === key ? { ...i, quantity: q } : i)) }, true)
}

export function removeItem(key: string) {
  set({ items: state.items.filter(i => i.key !== key) }, true)
}

export function clear() {
  set({ items: [] }, true)
}

export function openCart() {
  set({ open: true })
}

export function closeCart() {
  set({ open: false })
}

// --- Hook ---

export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const count = snapshot.items.reduce((n, i) => n + i.quantity, 0)
  return {
    items: snapshot.items,
    open: snapshot.open,
    count,
    addItem,
    setQty,
    removeItem,
    clear,
    openCart,
    closeCart,
  }
}
