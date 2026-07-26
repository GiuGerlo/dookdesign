'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Plus, Monitor, Smartphone } from 'lucide-react'
import { sileo } from 'sileo'
import { updateHomeGrid } from '@/lib/admin/actions'
import { getRenderUrl } from '@/lib/admin/storage'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  sizeSpans,
  gridCols,
  type HomeGridItem,
  type HomeGridSize,
  type GridBreakpoint,
} from '@/lib/admin/schemas'
import type { Tables } from '@/types/database'

type Project = Tables<'projects'>

const SIZES: { value: HomeGridSize; label: string }[] = [
  { value: 'sm', label: 'Chico' },
  { value: 'wide', label: 'Ancho' },
  { value: 'tall', label: 'Alto' },
  { value: 'big', label: 'Destacado' },
]

// Geometría por breakpoint — DEBE coincidir con .home-grid en globals.css para que sea WYSIWYG.
export const BP: Record<GridBreakpoint, { cols: number; rowH: number; gap: number; maxW?: number }> = {
  desktop: { cols: gridCols.desktop, rowH: 130, gap: 16 },
  mobile: { cols: gridCols.mobile, rowH: 90, gap: 12, maxW: 420 },
}
export const MAX_ROW = 30

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export function GridTile({
  item,
  project,
  bp,
  onSize,
  onFocus,
  onFocusX,
  onRemove,
}: {
  item: HomeGridItem
  project: Project
  bp: GridBreakpoint
  onSize: (size: HomeGridSize) => void
  onFocus: (value: number) => void
  onFocusX: (value: number) => void
  onRemove?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.project_id,
  })
  const thumbUrl = project.renders?.[0] ? getRenderUrl(project.renders[0]) : null
  const focus = item.focus ?? 50
  const focusX = item.focus_x ?? 50
  const pos = item[bp]
  const { w, h } = sizeSpans[item.size]

  // Recorte ajustable por eje: vertical si la imagen es más ALTA que la celda (imgAspect < boxAspect),
  // horizontal si es más ANCHA (imgAspect > boxAspect). Son mutuamente excluyentes.
  const tileRef = useRef<HTMLDivElement | null>(null)
  const [imgAspect, setImgAspect] = useState<number | null>(null)
  const [boxAspect, setBoxAspect] = useState<number | null>(null)
  useEffect(() => {
    const el = tileRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (r.height > 0) setBoxAspect(r.width / r.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const adjustableY = imgAspect != null && boxAspect != null ? imgAspect < boxAspect - 0.02 : null
  const adjustableX = imgAspect != null && boxAspect != null ? imgAspect > boxAspect + 0.02 : null

  return (
    <div
      ref={el => {
        setNodeRef(el)
        tileRef.current = el
      }}
      style={{
        gridColumn: pos ? `${pos.col} / span ${w}` : `auto / span ${w}`,
        gridRow: pos ? `${pos.row} / span ${h}` : `auto / span ${h}`,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : undefined,
      }}
      className={cn(
        'relative overflow-hidden rounded-md border border-white/[0.08] bg-card',
        isDragging && 'opacity-70 shadow-2xl ring-1 ring-primary/40'
      )}
    >
      {thumbUrl ? (
        <Image
          src={thumbUrl}
          alt=""
          fill
          sizes="25vw"
          unoptimized
          className="object-cover opacity-70"
          onLoad={e => setImgAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
          style={{ objectPosition: `${focusX}% ${focus}%` }}
        />
      ) : (
        <div className="absolute inset-0 bg-white/5" />
      )}

      {thumbUrl && (
        <>
          <input
            type="range"
            min={0}
            max={100}
            value={focus}
            disabled={adjustableY === false}
            onChange={e => onFocus(Number(e.target.value))}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            aria-label="Encuadre vertical en la grilla"
            title={
              adjustableY === false
                ? 'Imagen más ancha que la celda: sin recorte vertical para ajustar'
                : 'Encuadre (arriba ↔ abajo)'
            }
            className="render-thumb__focus"
            style={{ writingMode: 'vertical-lr', opacity: 1, zIndex: 10 }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={focusX}
            disabled={adjustableX === false}
            onChange={e => onFocusX(Number(e.target.value))}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            aria-label="Encuadre horizontal en la grilla"
            title={
              adjustableX === false
                ? 'Imagen más alta que la celda: sin recorte horizontal para ajustar'
                : 'Encuadre (izquierda ↔ derecha)'
            }
            className="render-thumb__focus render-thumb__focus--x"
            // Arriba-centro (bajo la fila de controles) para no pisar los botones de tamaño de abajo.
            style={{ opacity: 1, zIndex: 10, top: 34, bottom: 'auto' }}
          />
        </>
      )}

      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-black/20 to-black/40 p-2">
        <div className="flex items-start justify-between gap-1">
          <button
            className="cursor-grab touch-none rounded p-0.5 text-white/70 hover:text-white active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Mover celda"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          {(adjustableY === false || adjustableX === false) && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium leading-none text-white/90">
              {adjustableY === false ? 'sin recorte ↕' : 'sin recorte ↔'}
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-0.5 text-white/70 hover:text-destructive"
              aria-label="Quitar de la grilla"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="truncate text-xs font-medium text-white">{project.title}</p>
          <div className="flex flex-wrap gap-1">
            {SIZES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => onSize(s.value)}
                aria-pressed={item.size === s.value}
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors',
                  item.size === s.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomeGridEditor({
  projects,
  initialGrid,
}: {
  projects: Project[]
  initialGrid: HomeGridItem[]
}) {
  const byId = new Map(projects.map(p => [p.id, p]))
  // Descartar ids huérfanos (proyecto despublicado/borrado) al iniciar.
  const cleanInitial = initialGrid.filter(g => byId.has(g.project_id))
  const [grid, setGrid] = useState<HomeGridItem[]>(() => cleanInitial)
  const [bp, setBp] = useState<GridBreakpoint>('desktop')
  const [saving, setSaving] = useState(false)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const available = projects.filter(p => !grid.some(g => g.project_id === p.id))
  const dirty = JSON.stringify(grid) !== JSON.stringify(cleanInitial)
  const { cols, rowH, gap, maxW } = BP[bp]

  // Filas a dibujar como guía: hasta la celda más baja ocupada + 2 de aire (mínimo 6).
  const usedRows = grid.reduce((m, g) => {
    const p = g[bp]
    return p ? Math.max(m, p.row + sizeSpans[g.size].h - 1) : m
  }, 0)
  const rows = Math.min(MAX_ROW, Math.max(6, usedRows + 2))

  // ponytail: snap a la celda más cercana, sin anti-colisión; el overlap es intencional y se ve en el preview.
  function handleDragEnd(event: DragEndEvent) {
    const el = gridRef.current
    const t = event.active.rect.current.translated
    if (!el || !t) return
    const r = el.getBoundingClientRect()
    const cellW = (r.width - gap * (cols - 1)) / cols
    const w = sizeSpans[grid.find(g => g.project_id === event.active.id)?.size ?? 'sm'].w
    const h = sizeSpans[grid.find(g => g.project_id === event.active.id)?.size ?? 'sm'].h
    const col = clamp(Math.round((t.left - r.left) / (cellW + gap)) + 1, 1, cols - w + 1)
    const row = clamp(Math.round((t.top - r.top) / (rowH + gap)) + 1, 1, Math.max(1, rows - h + 1))
    setGrid(grid.map(g => (g.project_id === event.active.id ? { ...g, [bp]: { col, row } } : g)))
  }

  function setSize(projectId: string, size: HomeGridSize) {
    setGrid(grid.map(g => (g.project_id === projectId ? { ...g, size } : g)))
  }

  function setFocus(projectId: string, focus: number) {
    setGrid(grid.map(g => (g.project_id === projectId ? { ...g, focus } : g)))
  }

  function setFocusX(projectId: string, focus_x: number) {
    setGrid(grid.map(g => (g.project_id === projectId ? { ...g, focus_x } : g)))
  }

  function remove(projectId: string) {
    setGrid(grid.filter(g => g.project_id !== projectId))
  }

  function add(projectId: string) {
    if (!projectId) return
    // Posición inicial en ambos breakpoints: columna 1, apilado debajo de lo existente.
    const nextRow = (b: GridBreakpoint) =>
      grid.reduce((max, g) => {
        const p = g[b]
        return p ? Math.max(max, p.row + sizeSpans[g.size].h) : max
      }, 1)
    setGrid([
      ...grid,
      { project_id: projectId, size: 'sm', desktop: { col: 1, row: nextRow('desktop') }, mobile: { col: 1, row: nextRow('mobile') } },
    ])
  }

  async function save() {
    setSaving(true)
    try {
      await updateHomeGrid(grid)
      sileo.success({ title: 'Grilla del home guardada' })
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Toggle de breakpoint: editás desktop y móvil por separado (mismos proyectos y tamaños). */}
          <div className="flex rounded-md border border-white/[0.08] p-0.5">
            {(['desktop', 'mobile'] as const).map(b => {
              const Icon = b === 'desktop' ? Monitor : Smartphone
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBp(b)}
                  aria-pressed={bp === b}
                  className={cn(
                    'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors',
                    bp === b ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {b === 'desktop' ? 'Desktop' : 'Móvil'}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="add-project" className="text-sm text-muted-foreground">
              Agregar
            </label>
            <select
              id="add-project"
              value=""
              onChange={e => {
                add(e.target.value)
                e.target.value = ''
              }}
              disabled={available.length === 0}
              className="rounded-md border border-white/[0.08] bg-background/40 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              <option value="" disabled>
                {available.length === 0 ? 'Todos ya están' : 'Elegí un proyecto…'}
              </option>
              {available.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? 'Guardando…' : 'Guardar grilla'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Arrastrá cada celda con el asa (⠿) a la posición que quieras. Se puede superponer: lo que ves acá es lo que se publica en {bp === 'desktop' ? 'desktop' : 'móvil'}.
      </p>

      {grid.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16">
          <p className="text-sm text-muted-foreground">
            Sin proyectos en la grilla. El home mostrará los 6 más recientes.
          </p>
          <Plus className="h-5 w-5 text-muted-foreground/50" />
        </div>
      ) : (
        <DndContext id="admin-home-grid" sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            style={{
              position: 'relative',
              maxWidth: maxW ? `${maxW}px` : undefined,
              margin: maxW ? '0 auto' : undefined,
            }}
          >
            {/* Guía: celdas punteadas alineadas al grid para ver dónde cae cada tile al arrastrar. */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, ${rowH}px)`,
                gap: `${gap}px`,
                pointerEvents: 'none',
              }}
            >
              {Array.from({ length: cols * rows }).map((_, i) => (
                <div key={i} style={{ border: '1px dashed rgba(255,255,255,0.10)', borderRadius: 6 }} />
              ))}
            </div>
            <div
              ref={gridRef}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, ${rowH}px)`,
                gridAutoRows: `${rowH}px`,
                gap: `${gap}px`,
              }}
            >
              {grid.map(item => {
                const project = byId.get(item.project_id)
                if (!project) return null
                return (
                  <GridTile
                    key={item.project_id}
                    item={item}
                    project={project}
                    bp={bp}
                    onSize={size => setSize(item.project_id, size)}
                    onFocus={value => setFocus(item.project_id, value)}
                    onFocusX={value => setFocusX(item.project_id, value)}
                    onRemove={() => remove(item.project_id)}
                  />
                )
              })}
            </div>
          </div>
        </DndContext>
      )}
    </div>
  )
}
