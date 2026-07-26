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
  onDelete: (path: string) => void
  onOpen: () => void
}

function RenderThumb({ path, onDelete, onOpen }: RenderThumbProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: path })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="render-thumb" {...attributes}>
      <div className="render-thumb__handle" {...listeners}>⠿</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getRenderUrl(path)}
        alt=""
        className="render-thumb__img"
        onClick={onOpen}
        style={{ cursor: 'zoom-in' }}
      />
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
}

export function RendersUpload({ projectId, value, onChange, onUploadingChange }: RendersUploadProps) {
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
    } catch {
      sileo.error({ title: 'No se pudo borrar el render' })
    }
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
            <div className="renders-grid">
              {value.map((path, i) => (
                <RenderThumb key={path} path={path} onDelete={handleDelete} onOpen={() => setLightboxIndex(i)} />
              ))}
              {uploading &&
                Array.from({ length: uploadingCount }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="render-thumb flex items-center justify-center animate-pulse"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {value.length > 0 && !uploading && (
        <p className="renders-hint">El primer render es la portada del proyecto. Clic en una imagen para verla en grande.</p>
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
