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
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2 } from 'lucide-react'
import { sileo } from 'sileo'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { uploadRender, deleteRender, getRenderUrl, optimizeRender } from '@/lib/admin/storage'
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

interface RenderThumbProps {
  path: string
  focus: number
  focusX: number
  onFocus: (path: string, value: number) => void
  onFocusX: (path: string, value: number) => void
  onDelete: (path: string) => void
  onOpen: () => void
}

// Ratio del preview / hero desktop. Hay recorte vertical (ajustable) si la imagen es MÁS ALTA
// que esto; recorte horizontal si es MÁS ANCHA. Si calza justo, ninguno aplica.
const HERO_RATIO = 16 / 9

function RenderThumb({ path, focus, focusX, onFocus, onFocusX, onDelete, onOpen }: RenderThumbProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: path })
  // null = todavía no cargó; true/false = si la imagen tiene recorte ajustable en ese eje.
  const [adjustable, setAdjustable] = useState<boolean | null>(null)
  const [adjustableX, setAdjustableX] = useState<boolean | null>(null)
  // Archivo faltante en storage (ref huérfana) → placeholder en vez de caja negra.
  const [broken, setBroken] = useState(false)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="render-thumb render-thumb--wide" {...attributes}>
      <div className="render-thumb__handle" {...listeners}>⠿</div>
      {broken ? (
        <div className="render-thumb__img flex items-center justify-center bg-white/[0.04] px-2 text-center text-[10px] text-muted-foreground">
          Imagen no disponible — borrala y volvé a subirla
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={getRenderUrl(path)}
          alt=""
          className="render-thumb__img"
          onClick={onOpen}
          onLoad={e => {
            const el = e.currentTarget
            const ar = el.naturalWidth / el.naturalHeight
            setAdjustable(ar < HERO_RATIO - 0.001)
            setAdjustableX(ar > HERO_RATIO + 0.001)
          }}
          onError={() => setBroken(true)}
          style={{ cursor: 'zoom-in', objectPosition: `${focusX}% ${focus}%` }}
        />
      )}
      {/* Encuadre vertical del hero: arriba = mostrar parte superior, abajo = inferior. Preview en vivo.
          Se desactiva si la imagen es más ancha que el hero (no hay recorte vertical que mover). */}
      <input
        type="range"
        min={0}
        max={100}
        value={focus}
        disabled={adjustable === false}
        onChange={e => onFocus(path, Number(e.target.value))}
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        aria-label="Encuadre vertical del hero"
        title={
          adjustable === false
            ? 'Imagen más ancha que el hero: entra completa, sin recorte vertical para ajustar'
            : 'Encuadre del hero (arriba ↔ abajo)'
        }
        className="render-thumb__focus"
        style={{ writingMode: 'vertical-lr' }}
      />
      {/* Encuadre horizontal: izquierda ↔ derecha. Se desactiva si la imagen es más alta que el hero. */}
      <input
        type="range"
        min={0}
        max={100}
        value={focusX}
        disabled={adjustableX === false}
        onChange={e => onFocusX(path, Number(e.target.value))}
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        aria-label="Encuadre horizontal del hero"
        title={
          adjustableX === false
            ? 'Imagen más alta que el hero: entra completa a lo ancho, sin recorte horizontal para ajustar'
            : 'Encuadre del hero (izquierda ↔ derecha)'
        }
        className="render-thumb__focus render-thumb__focus--x"
      />
      {(adjustable === false || adjustableX === false) && (
        <span className="render-thumb__badge" title="La imagen calza en un eje: solo se ajusta el otro">
          {adjustable === false ? 'sin recorte vertical' : 'sin recorte horizontal'}
        </span>
      )}
      <AlertDialog>
        <AlertDialogTrigger
          render={<button type="button" className="render-thumb__delete" aria-label="Borrar render" />}
        >
          ×
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar render?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará esta imagen del proyecto. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent hover:bg-white/5">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => onDelete(path)}
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface RendersUploadProps {
  projectId: string
  value: string[]
  onChange: (paths: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
  focus: Record<string, number>
  onFocusChange: (map: Record<string, number>) => void
  focusX: Record<string, number>
  onFocusXChange: (map: Record<string, number>) => void
}

export function RendersUpload({ projectId, value, onChange, onUploadingChange, focus, onFocusChange, focusX, onFocusXChange }: RendersUploadProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const [uploadingCount, setUploadingCount] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0)
  }, [uploadingCount, onUploadingChange])

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0) return
    setUploadingCount(c => c + accepted.length)
    try {
      const newPaths = await Promise.all(
        accepted.map(async file => uploadRender(await optimizeRender(file), projectId))
      )
      onChange([...value, ...newPaths])
    } catch {
      sileo.error({ title: 'No se pudieron subir algunas imágenes' })
    } finally {
      setUploadingCount(c => c - accepted.length)
    }
  }, [value, onChange, projectId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    disabled: uploadingCount > 0,
  })

  async function handleDelete(path: string) {
    try {
      await deleteRender(path)
      onChange(value.filter(p => p !== path))
      // Podar el encuadre del render borrado (evita claves huérfanas en los mapas).
      if (path in focus) {
        const next = { ...focus }
        delete next[path]
        onFocusChange(next)
      }
      if (path in focusX) {
        const next = { ...focusX }
        delete next[path]
        onFocusXChange(next)
      }
    } catch {
      sileo.error({ title: 'No se pudo borrar el render' })
    }
  }

  function handleFocus(path: string, val: number) {
    onFocusChange({ ...focus, [path]: val })
  }

  function handleFocusX(path: string, val: number) {
    onFocusXChange({ ...focusX, [path]: val })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string)
      const newIndex = value.indexOf(over.id as string)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }

  const uploading = uploadingCount > 0

  return (
    <div className="renders-upload">
      <div
        {...getRootProps()}
        className={`renders-dropzone${isDragActive ? ' renders-dropzone--active' : ''}${uploading ? ' opacity-60 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Soltá los archivos…' : 'Arrastrá renders o hacé clic para seleccionar'}</p>
      </div>

      {uploading && (
        <p className="renders-hint flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Optimizando y subiendo {uploadingCount} {uploadingCount === 1 ? 'imagen' : 'imágenes'}…
        </p>
      )}

      {(value.length > 0 || uploading) && (
        <DndContext id="admin-renders" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <div className="renders-grid renders-grid--wide">
              {value.map((path, i) => (
                <RenderThumb
                  key={path}
                  path={path}
                  focus={focus[path] ?? 50}
                  focusX={focusX[path] ?? 50}
                  onFocus={handleFocus}
                  onFocusX={handleFocusX}
                  onDelete={handleDelete}
                  onOpen={() => setLightboxIndex(i)}
                />
              ))}
              {uploading &&
                Array.from({ length: uploadingCount }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="render-thumb render-thumb--wide flex items-center justify-center animate-pulse"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {value.length > 0 && !uploading && (
        <p className="renders-hint">El primer render es la portada del proyecto. Cada miniatura tiene el formato del hero (desktop): el deslizador de la derecha ajusta el encuadre vertical (arriba ↔ abajo) y el de abajo el horizontal (izquierda ↔ derecha); la miniatura muestra en vivo cómo se verá. Cada eje solo se activa si hay recorte en esa dirección (imágenes panorámicas no tienen recorte vertical; muy altas, no horizontal). Clic en la imagen para verla en grande.</p>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={value.map(p => ({ src: getRenderUrl(p) }))}
        plugins={[Zoom]}
      />
    </div>
  )
}
