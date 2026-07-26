'use client'

import { useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Monitor, Smartphone } from 'lucide-react'
import { sileo } from 'sileo'
import { updateProjectsPage } from '@/lib/admin/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { GridTile, BP, MAX_ROW, clamp } from '@/components/admin/HomeGridEditor'
import {
  sizeSpans,
  type HomeGridItem,
  type HomeGridSize,
  type GridBreakpoint,
} from '@/lib/admin/schemas'
import type { Tables } from '@/types/database'

type Project = Tables<'projects'>

// Semilla: TODOS los publicados. Cada uno usa su celda guardada o un default apilado al final.
function buildSeed(projects: Project[], saved: HomeGridItem[]): HomeGridItem[] {
  const byId = new Map(projects.map(p => [p.id, p]))
  const savedById = new Map(saved.filter(g => byId.has(g.project_id)).map(g => [g.project_id, g]))
  const seed: HomeGridItem[] = []
  const nextRow = (bp: GridBreakpoint) =>
    seed.reduce((max, g) => {
      const p = g[bp]
      return p ? Math.max(max, p.row + sizeSpans[g.size].h) : max
    }, 1)
  for (const p of projects) {
    const item = savedById.get(p.id)
    seed.push(
      item ?? {
        project_id: p.id,
        size: 'sm',
        desktop: { col: 1, row: nextRow('desktop') },
        mobile: { col: 1, row: nextRow('mobile') },
      }
    )
  }
  return seed
}

export function ProjectsPageEditor({
  projects,
  initialGrid,
  initialIntro,
}: {
  projects: Project[]
  initialGrid: HomeGridItem[]
  initialIntro: string
}) {
  const byId = new Map(projects.map(p => [p.id, p]))
  const [seed] = useState(() => buildSeed(projects, initialGrid))
  const [grid, setGrid] = useState<HomeGridItem[]>(seed)
  const [intro, setIntro] = useState(initialIntro)
  const [bp, setBp] = useState<GridBreakpoint>('desktop')
  const [saving, setSaving] = useState(false)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const dirty = intro !== initialIntro || JSON.stringify(grid) !== JSON.stringify(seed)
  const { cols, rowH, gap, maxW } = BP[bp]

  const usedRows = grid.reduce((m, g) => {
    const p = g[bp]
    return p ? Math.max(m, p.row + sizeSpans[g.size].h - 1) : m
  }, 0)
  const rows = Math.min(MAX_ROW, Math.max(6, usedRows + 2))

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

  async function save() {
    setSaving(true)
    try {
      await updateProjectsPage(intro, grid)
      sileo.success({ title: 'Página de proyectos guardada' })
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const labelClass = 'text-[11px] uppercase tracking-wider text-muted-foreground font-medium'

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="proyectos-intro">Texto de introducción</label>
        <Textarea
          id="proyectos-intro"
          value={intro}
          onChange={e => setIntro(e.target.value)}
          rows={3}
          placeholder="Una selección de piezas de diseño industrial…"
          className="bg-background/40 border-white/[0.08] resize-none focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? 'Guardando…' : 'Guardar página'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Aparecen todos los proyectos publicados. Arrastrá cada celda con el asa (⠿), elegí tamaño y encuadre. Lo que ves acá es lo que se publica en {bp === 'desktop' ? 'desktop' : 'móvil'}.
      </p>

      {grid.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-16 text-center">
          <p className="text-sm text-muted-foreground">Sin proyectos publicados todavía.</p>
        </div>
      ) : (
        <DndContext id="admin-projects-grid" sensors={sensors} onDragEnd={handleDragEnd}>
          <div style={{ position: 'relative', maxWidth: maxW ? `${maxW}px` : undefined, margin: maxW ? '0 auto' : undefined }}>
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
