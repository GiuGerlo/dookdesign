'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, X } from 'lucide-react'
import { sileo } from 'sileo'
import { uploadRender, deleteRender, getRenderUrl, optimizeEnvironmentRender } from '@/lib/admin/storage'
import { envSizeGeom, ENV_DEFAULT, type EnvLayoutItem, type EnvSize } from '@/lib/admin/schemas'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const MAX = 3

const SIZES: { value: EnvSize; label: string }[] = [
  { value: 'cuadrada', label: 'Cuadrada' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'panoramica', label: 'Panorámica' },
]

// '4 / 3' → 1.333
function arToNumber(ar: string): number {
  const [w, h] = ar.split('/').map(s => Number(s.trim()))
  return h ? w / h : 1
}

interface EnvThumbProps {
  path: string
  layout: EnvLayoutItem
  onSize: (size: EnvSize) => void
  onFocus: (value: number) => void
  onFocusX: (value: number) => void
  onDelete: () => void
}

function EnvThumb({ path, layout, onSize, onFocus, onFocusX, onDelete }: EnvThumbProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: path })
  const [imgAspect, setImgAspect] = useState<number | null>(null)
  // Archivo faltante en storage (ref huérfana) → placeholder gris en vez de caja negra.
  const [broken, setBroken] = useState(false)
  const geom = envSizeGeom[layout.size]
  const cellAr = arToNumber(geom.ar)
  // Recorte por eje según el aspecto de la imagen vs la forma de la celda (mutuamente excluyentes).
  const adjustableY = imgAspect != null ? imgAspect < cellAr - 0.02 : null
  const adjustableX = imgAspect != null ? imgAspect > cellAr + 0.02 : null

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        aspectRatio: geom.ar,
        gridColumn: `span ${geom.span}`,
        zIndex: isDragging ? 20 : undefined,
      }}
      className={cn(
        'relative overflow-hidden rounded-md border border-white/[0.08] bg-card',
        isDragging && 'opacity-70 shadow-2xl ring-1 ring-primary/40'
      )}
    >
      {broken ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04] px-2 text-center text-[10px] text-muted-foreground">
          Imagen no disponible — borrala y volvé a subirla
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getRenderUrl(path)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          onLoad={e => setImgAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
          onError={() => setBroken(true)}
          style={{ objectPosition: `${layout.focus_x}% ${layout.focus}%` }}
        />
      )}

      <input
        type="range"
        min={0}
        max={100}
        value={layout.focus}
        disabled={adjustableY === false}
        onChange={e => onFocus(Number(e.target.value))}
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        aria-label="Encuadre vertical"
        title={adjustableY === false ? 'Sin recorte vertical para ajustar' : 'Encuadre (arriba ↔ abajo)'}
        className="render-thumb__focus"
        style={{ writingMode: 'vertical-lr', opacity: 1, zIndex: 10 }}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={layout.focus_x}
        disabled={adjustableX === false}
        onChange={e => onFocusX(Number(e.target.value))}
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        aria-label="Encuadre horizontal"
        title={adjustableX === false ? 'Sin recorte horizontal para ajustar' : 'Encuadre (izquierda ↔ derecha)'}
        className="render-thumb__focus render-thumb__focus--x"
        style={{ opacity: 1, zIndex: 10, top: 34, bottom: 'auto' }}
      />

      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-black/10 to-black/40 p-2">
        <div className="flex items-start justify-between gap-1">
          <button
            className="cursor-grab touch-none rounded p-0.5 text-white/70 hover:text-white active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          {(adjustableY === false || adjustableX === false) && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium leading-none text-white/90">
              {adjustableY === false ? 'sin recorte ↕' : 'sin recorte ↔'}
            </span>
          )}
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <button
                  type="button"
                  className="rounded p-0.5 text-white/70 hover:text-destructive"
                  aria-label="Borrar render de entorno"
                />
              }
            >
              <X className="h-4 w-4" />
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Borrar render de entorno?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminará esta imagen del proyecto. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-transparent hover:bg-white/5">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={onDelete}>
                  Borrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex flex-wrap gap-1">
          {SIZES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSize(s.value)}
              aria-pressed={layout.size === s.value}
              className={cn(
                'rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors',
                layout.size === s.value
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
  )
}

interface EnvironmentRendersUploadProps {
  projectId: string
  value: string[]
  onChange: (paths: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
  layout: Record<string, EnvLayoutItem>
  onLayoutChange: (map: Record<string, EnvLayoutItem>) => void
}

// Renders de entorno: máx 3. Reordenar por drag, forma de celda + encuadre X/Y por imagen.
export function EnvironmentRendersUpload({
  projectId,
  value,
  onChange,
  onUploadingChange,
  layout,
  onLayoutChange,
}: EnvironmentRendersUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0)
  }, [uploadingCount, onUploadingChange])

  const remaining = MAX - value.length

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (accepted.length === 0) return
      const batch = accepted.slice(0, MAX - value.length)
      if (batch.length === 0) return
      setUploadingCount(c => c + batch.length)
      try {
        const newPaths = await Promise.all(
          batch.map(async file => uploadRender(await optimizeEnvironmentRender(file), projectId))
        )
        onChange([...value, ...newPaths])
        // Inicializar layout de las nuevas con defaults.
        const nextLayout = { ...layout }
        for (const p of newPaths) nextLayout[p] = { ...ENV_DEFAULT }
        onLayoutChange(nextLayout)
      } catch {
        sileo.error({ title: 'No se pudieron subir algunas imágenes' })
      } finally {
        setUploadingCount(c => c - batch.length)
      }
    },
    [value, onChange, projectId, layout, onLayoutChange]
  )

  const uploading = uploadingCount > 0
  const full = value.length >= MAX

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: remaining > 0 ? remaining : 0,
    disabled: uploading || full,
  })

  async function handleDelete(path: string) {
    try {
      await deleteRender(path)
      onChange(value.filter(p => p !== path))
      if (path in layout) {
        const next = { ...layout }
        delete next[path]
        onLayoutChange(next)
      }
    } catch {
      sileo.error({ title: 'No se pudo borrar el render' })
    }
  }

  function patch(path: string, part: Partial<EnvLayoutItem>) {
    onLayoutChange({ ...layout, [path]: { ...(layout[path] ?? ENV_DEFAULT), ...part } })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string)
      const newIndex = value.indexOf(over.id as string)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }

  return (
    <div className="renders-upload">
      {!full && (
        <div
          {...getRootProps()}
          className={`renders-dropzone${isDragActive ? ' renders-dropzone--active' : ''}${uploading ? ' opacity-60 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          <p>{isDragActive ? 'Soltá los archivos…' : 'Arrastrá imágenes de entorno o hacé clic para seleccionar'}</p>
        </div>
      )}

      {uploading && (
        <p className="renders-hint flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Optimizando y subiendo {uploadingCount} {uploadingCount === 1 ? 'imagen' : 'imágenes'}…
        </p>
      )}

      {(value.length > 0 || uploading) && (
        <DndContext id="admin-env-renders" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-3">
              {value.map(path => (
                <EnvThumb
                  key={path}
                  path={path}
                  layout={layout[path] ?? ENV_DEFAULT}
                  onSize={size => patch(path, { size })}
                  onFocus={focus => patch(path, { focus })}
                  onFocusX={focus_x => patch(path, { focus_x })}
                  onDelete={() => handleDelete(path)}
                />
              ))}
              {uploading &&
                Array.from({ length: uploadingCount }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex aspect-[4/3] items-center justify-center rounded-md border border-white/[0.08] bg-card animate-pulse"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="renders-hint">
        {full
          ? 'Máximo 3 renders de entorno. Borrá uno para subir otro.'
          : `Hasta 3 imágenes de contexto. Elegí la forma de cada celda y encuadrá con los deslizadores. Quedan ${remaining}.`}
      </p>
    </div>
  )
}
