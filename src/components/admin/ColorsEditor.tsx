'use client'

import { useEffect, useState } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { X, ImageOff, Check } from 'lucide-react'
import { getRenderUrl } from '@/lib/admin/storage'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ProjectColor } from '@/lib/admin/schemas'

interface ColorsEditorProps {
  value: ProjectColor[]
  renders: string[]
  onChange: (colors: ProjectColor[]) => void
}

// Editor de colores del proyecto: hex (picker react-colorful) + nombre + render asociado.
// El detalle público muestra un swatch por color; al tocarlo mueve el carrusel a ese render.
// Grill #3: si el render asociado ya no está en `renders` (se borró), el color se marca
// "sin imagen" y hay que reasignar antes de guardar (se valida en ProjectForm.onSubmit).
export function ColorsEditor({ value, renders, onChange }: ColorsEditorProps) {
  // Índice del color con el picker abierto → modal centrado (no empuja el layout ni se corta).
  const [openPicker, setOpenPicker] = useState<number | null>(null)

  // Cerrar el modal con Esc.
  useEffect(() => {
    if (openPicker === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPicker(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openPicker])

  function patch(i: number, next: Partial<ProjectColor>) {
    onChange(value.map((c, idx) => (idx === i ? { ...c, ...next } : c)))
  }

  function add() {
    onChange([...value, { hex: '#808080', name: '', render: renders[0] ?? '' }])
    setOpenPicker(value.length) // abrir el picker del recién agregado
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
    setOpenPicker(null)
  }

  const labelClass = 'text-[11px] uppercase tracking-wider text-muted-foreground font-medium'
  const inputClass = 'bg-background/40 border-white/[0.08] focus-visible:border-primary focus-visible:ring-primary/20'

  if (renders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Subí renders primero: cada color se asocia a una imagen del proyecto.
      </p>
    )
  }

  const editing = openPicker !== null ? value[openPicker] : null

  return (
    <div className="space-y-4">
      {value.map((color, i) => {
        const missing = !renders.includes(color.render)
        return (
          <div key={i} className="rounded-lg border border-white/[0.08] bg-background/30 p-3 space-y-3">
            {/* Fila: swatch (abre modal) + nombre + eliminar */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setOpenPicker(i)}
                aria-label="Elegir color"
                className="h-9 w-9 shrink-0 rounded-md border border-white/15 shadow-inner transition-transform hover:scale-105"
                style={{ background: color.hex }}
              />
              <Input
                value={color.name}
                onChange={e => patch(i, { name: e.target.value })}
                placeholder="Nombre del color (ej. Verde oliva)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Eliminar color"
                className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Imagen asociada */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={labelClass}>Imagen asociada</span>
                {missing && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                    <ImageOff className="h-3 w-3" /> Reasigná: la imagen ya no existe
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {renders.map(path => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => patch(i, { render: path })}
                    aria-label="Asociar esta imagen"
                    aria-pressed={color.render === path}
                    className={`relative h-14 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                      color.render === path ? 'border-primary' : 'border-transparent hover:border-white/30'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getRenderUrl(path)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      <Button type="button" variant="outline" size="sm" onClick={add} className="border-white/[0.08]">
        + Agregar color
      </Button>

      {/* Modal del picker: centrado, sin empujar el layout ni cortarse. */}
      {editing && openPicker !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpenPicker(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Elegir color"
            className="colors-picker w-full max-w-xs rounded-xl border border-white/10 bg-card p-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <HexColorPicker color={editing.hex} onChange={hex => patch(openPicker, { hex })} />
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-1 rounded-md border border-white/[0.08] bg-background/40 px-2">
                <span className="text-sm text-muted-foreground">#</span>
                <HexColorInput
                  color={editing.hex}
                  onChange={hex => patch(openPicker, { hex })}
                  className="w-full bg-transparent py-2 font-mono text-sm uppercase outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenPicker(null)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-white py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              <Check className="h-4 w-4" /> Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
