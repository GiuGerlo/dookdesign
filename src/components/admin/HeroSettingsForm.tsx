'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { Loader2 } from 'lucide-react'
import { sileo } from 'sileo'
import { heroSettingsSchema, type HeroSettingsFormData } from '@/lib/admin/schemas'
import { updateHeroSettings } from '@/lib/admin/actions'
import { uploadRender, uploadVideo, deleteRender, getRenderUrl, optimizeRender } from '@/lib/admin/storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tables } from '@/types/database'

// Video de portada: se sube crudo, sin comprimir. Aviso al usuario para que use algo liviano.
const MAX_VIDEO_MB = 20

export function HeroSettingsForm({ settings }: { settings: Tables<'site_settings'> }) {
  const [uploading, setUploading] = useState(false)
  // Aspecto real de la ventana → el preview espeja el recorte que verá el visitante en este dispositivo.
  // ponytail: el recorte móvil real difiere (hero de alto fijo 560px); el preview refleja el viewport actual.
  const [previewAr, setPreviewAr] = useState(16 / 9)

  useEffect(() => {
    const update = () => setPreviewAr(window.innerWidth / window.innerHeight)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<HeroSettingsFormData>({
    resolver: zodResolver(heroSettingsSchema),
    defaultValues: {
      hero_image: settings.hero_image,
      hero_video: settings.hero_video,
      hero_focus: settings.hero_focus ?? 50,
      hero_focus_x: settings.hero_focus_x ?? 50,
    },
  })

  const heroImage = watch('hero_image')
  const heroVideo = watch('hero_video')
  const heroFocus = watch('hero_focus')
  const heroFocusX = watch('hero_focus_x')
  const mediaPath = heroVideo || heroImage
  const mediaUrl = mediaPath ? getRenderUrl(mediaPath) : null

  // null = sin cargar; false = media más ancho que el hero → sin recorte en ese eje.
  const [adjustableY, setAdjustableY] = useState<boolean | null>(null)
  const [adjustableX, setAdjustableX] = useState<boolean | null>(null)

  // Compara el aspecto del media contra el del preview (= viewport) para saber qué eje recorta.
  function detectAdjustable(ar: number) {
    setAdjustableY(ar < previewAr - 0.02)
    setAdjustableX(ar > previewAr + 0.02)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'video/mp4': [] },
    multiple: false,
    disabled: uploading,
    onDrop: async ([file]) => {
      if (!file) return
      const isVideo = file.type.startsWith('video')
      if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
        sileo.error({ title: `El video supera ${MAX_VIDEO_MB}MB — usá uno más liviano` })
        return
      }
      setUploading(true)
      try {
        const prev = mediaPath
        const path = isVideo
          ? await uploadVideo(file, 'site')
          : await uploadRender(await optimizeRender(file), 'site')
        // Borrar la portada anterior recién después de subir la nueva (si falla, no perdemos nada).
        if (prev) await deleteRender(prev).catch(() => {})
        // Una portada activa a la vez: seteo la nueva, limpio el otro tipo.
        setValue('hero_image', isVideo ? null : path, { shouldDirty: true })
        setValue('hero_video', isVideo ? path : null, { shouldDirty: true })
        setAdjustableY(null)
        setAdjustableX(null)
        sileo.success({ title: 'Portada subida — guardá para aplicar' })
      } catch {
        sileo.error({ title: 'No se pudo subir la portada' })
      } finally {
        setUploading(false)
      }
    },
  })

  async function onSubmit(data: HeroSettingsFormData) {
    try {
      await updateHeroSettings(data)
      sileo.success({ title: 'Portada guardada' })
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al guardar' })
    }
  }

  const labelClass = 'text-[11px] uppercase tracking-wider text-muted-foreground font-medium'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5 flex-row items-center justify-between">
          <CardTitle className={labelClass}>Portada del home</CardTitle>
          <Button type="submit" size="sm" disabled={isSubmitting || uploading}>
            {isSubmitting ? 'Guardando…' : 'Guardar portada'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {mediaUrl && (
            <div
              className="relative overflow-hidden rounded-md bg-black/30"
              style={{ aspectRatio: previewAr }}
            >
              {heroVideo ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  onLoadedMetadata={e => detectAdjustable(e.currentTarget.videoWidth / e.currentTarget.videoHeight)}
                  style={{ objectPosition: `${heroFocusX}% ${heroFocus}%` }}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={mediaUrl}
                  alt="Portada del home"
                  className="h-full w-full object-cover"
                  onLoad={e => detectAdjustable(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
                  style={{ objectPosition: `${heroFocusX}% ${heroFocus}%` }}
                />
              )}
              <input
                type="range"
                min={0}
                max={100}
                value={heroFocus}
                disabled={adjustableY === false}
                onChange={e => setValue('hero_focus', Number(e.target.value), { shouldDirty: true })}
                aria-label="Encuadre vertical de la portada"
                title={adjustableY === false ? 'Sin recorte vertical para ajustar' : 'Encuadre del hero (arriba ↔ abajo)'}
                className="render-thumb__focus"
                style={{ writingMode: 'vertical-lr', opacity: 1 }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={heroFocusX}
                disabled={adjustableX === false}
                onChange={e => setValue('hero_focus_x', Number(e.target.value), { shouldDirty: true })}
                aria-label="Encuadre horizontal de la portada"
                title={adjustableX === false ? 'Sin recorte horizontal para ajustar' : 'Encuadre del hero (izquierda ↔ derecha)'}
                className="render-thumb__focus render-thumb__focus--x"
                style={{ opacity: 1 }}
              />
              {(adjustableY === false || adjustableX === false) && (
                <span className="render-thumb__badge">
                  {adjustableY === false ? 'sin recorte vertical' : 'sin recorte horizontal'}
                </span>
              )}
            </div>
          )}
          <div
            {...getRootProps()}
            className={`renders-dropzone${isDragActive ? ' renders-dropzone--active' : ''}${uploading ? ' opacity-60 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <p className="flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Subiendo…
              </p>
            ) : (
              <p>{mediaPath ? 'Arrastrá una imagen o video para reemplazar la portada' : 'Arrastrá la imagen o video de portada del home o hacé clic'}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Se muestra a pantalla completa en el inicio. Imagen (se optimiza sola) o video mp4 liviano (ideal &lt;{MAX_VIDEO_MB}MB, reproduce en loop y sin sonido). El preview de arriba muestra el recorte real en este dispositivo; ajustá el encuadre con los deslizadores.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
