'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Loader2 } from 'lucide-react'
import { sileo } from 'sileo'
import { uploadRender, deleteRender, getRenderUrl, optimizeEnvironmentRender } from '@/lib/admin/storage'
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

interface EnvThumbProps {
  path: string
  onDelete: (path: string) => void
}

function EnvThumb({ path, onDelete }: EnvThumbProps) {
  return (
    <div className="render-thumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={getRenderUrl(path)} alt="" className="render-thumb__img" />
      <AlertDialog>
        <AlertDialogTrigger
          render={<button type="button" className="render-thumb__delete" aria-label="Borrar render de entorno" />}
        >
          ×
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

interface EnvironmentRendersUploadProps {
  projectId: string
  value: string[]
  onChange: (paths: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
}

// Renders de entorno: máx 3, sin reorden ni lightbox. Solo subir/borrar.
export function EnvironmentRendersUpload({
  projectId,
  value,
  onChange,
  onUploadingChange,
}: EnvironmentRendersUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0)

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0)
  }, [uploadingCount, onUploadingChange])

  const remaining = MAX - value.length

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (accepted.length === 0) return
      // Recorta al cupo restante (dropzone ya limita, pero por si sueltan de más).
      const batch = accepted.slice(0, MAX - value.length)
      if (batch.length === 0) return
      setUploadingCount(c => c + batch.length)
      try {
        const newPaths = await Promise.all(
          batch.map(async file => uploadRender(await optimizeEnvironmentRender(file), projectId))
        )
        onChange([...value, ...newPaths])
      } catch {
        sileo.error({ title: 'No se pudieron subir algunas imágenes' })
      } finally {
        setUploadingCount(c => c - batch.length)
      }
    },
    [value, onChange, projectId]
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
    } catch {
      sileo.error({ title: 'No se pudo borrar el render' })
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
        <div className="renders-grid">
          {value.map(path => (
            <EnvThumb key={path} path={path} onDelete={handleDelete} />
          ))}
          {uploading &&
            Array.from({ length: uploadingCount }).map((_, i) => (
              <div key={`skeleton-${i}`} className="render-thumb flex items-center justify-center animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ))}
        </div>
      )}

      <p className="renders-hint">
        {full
          ? 'Máximo 3 renders de entorno. Borrá uno para subir otro.'
          : `Hasta 3 imágenes de contexto (fijas, sin zoom). Quedan ${remaining}.`}
      </p>
    </div>
  )
}
