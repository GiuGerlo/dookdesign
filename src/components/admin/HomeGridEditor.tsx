'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Plus } from 'lucide-react'
import { sileo } from 'sileo'
import { updateHomeGrid } from '@/lib/admin/actions'
import { getRenderUrl } from '@/lib/admin/storage'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { HomeGridItem, HomeGridSize } from '@/lib/admin/schemas'
import type { Tables } from '@/types/database'

type Project = Tables<'projects'>

const SIZES: { value: HomeGridSize; label: string }[] = [
  { value: 'sm', label: 'Chico' },
  { value: 'wide', label: 'Ancho' },
  { value: 'tall', label: 'Alto' },
  { value: 'big', label: 'Destacado' },
]

const sizeClass: Record<HomeGridSize, string> = {
  sm: 'home-tile--sm',
  wide: 'home-tile--wide',
  tall: 'home-tile--tall',
  big: 'home-tile--big',
}

function GridTile({
  item,
  project,
  onSize,
  onRemove,
}: {
  item: HomeGridItem
  project: Project
  onSize: (size: HomeGridSize) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.project_id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const thumbUrl = project.renders?.[0] ? getRenderUrl(project.renders[0]) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative overflow-hidden rounded-md border border-white/[0.08] bg-card',
        sizeClass[item.size],
        isDragging && 'opacity-50 shadow-2xl ring-1 ring-primary/40'
      )}
    >
      {thumbUrl ? (
        <Image src={thumbUrl} alt="" fill sizes="25vw" unoptimized className="object-cover opacity-70" />
      ) : (
        <div className="absolute inset-0 bg-white/5" />
      )}

      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-black/20 to-black/40 p-2">
        <div className="flex items-start justify-between gap-1">
          <button
            className="cursor-grab touch-none rounded p-0.5 text-white/70 hover:text-white active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-0.5 text-white/70 hover:text-destructive"
            aria-label="Quitar de la grilla"
          >
            <X className="h-4 w-4" />
          </button>
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
  const [grid, setGrid] = useState<HomeGridItem[]>(() =>
    initialGrid.filter(g => byId.has(g.project_id))
  )
  const [saving, setSaving] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const available = projects.filter(p => !grid.some(g => g.project_id === p.id))
  const dirty = JSON.stringify(grid) !== JSON.stringify(initialGrid.filter(g => byId.has(g.project_id)))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = grid.findIndex(g => g.project_id === active.id)
    const newIndex = grid.findIndex(g => g.project_id === over.id)
    setGrid(arrayMove(grid, oldIndex, newIndex))
  }

  function setSize(projectId: string, size: HomeGridSize) {
    setGrid(grid.map(g => (g.project_id === projectId ? { ...g, size } : g)))
  }

  function remove(projectId: string) {
    setGrid(grid.filter(g => g.project_id !== projectId))
  }

  function add(projectId: string) {
    if (!projectId) return
    setGrid([...grid, { project_id: projectId, size: 'sm' }])
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
        <div className="flex items-center gap-2">
          <label htmlFor="add-project" className="text-sm text-muted-foreground">
            Agregar proyecto
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
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? 'Guardando…' : 'Guardar grilla'}
        </Button>
      </div>

      {grid.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16">
          <p className="text-sm text-muted-foreground">
            Sin proyectos en la grilla. El home mostrará los 6 más recientes.
          </p>
          <Plus className="h-5 w-5 text-muted-foreground/50" />
        </div>
      ) : (
        <DndContext
          id="admin-home-grid"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={grid.map(g => g.project_id)} strategy={rectSortingStrategy}>
            <div className="home-grid">
              {grid.map(item => {
                const project = byId.get(item.project_id)
                if (!project) return null
                return (
                  <GridTile
                    key={item.project_id}
                    item={item}
                    project={project}
                    onSize={size => setSize(item.project_id, size)}
                    onRemove={() => remove(item.project_id)}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
