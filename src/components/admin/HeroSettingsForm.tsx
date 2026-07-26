'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { Loader2 } from 'lucide-react'
import { sileo } from 'sileo'
import { heroSettingsSchema, type HeroSettingsFormData } from '@/lib/admin/schemas'
import { updateHeroSettings } from '@/lib/admin/actions'
import { uploadRender, deleteRender, getRenderUrl, optimizeRender } from '@/lib/admin/storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tables } from '@/types/database'

// Slot de una imagen de portada (desktop o móvil): dropzone + preview con el aspecto del dispositivo
// + sliders de encuadre X/Y. Cada eje se activa solo si hay recorte en esa dirección.
function HeroImageSlot({
  title,
  hint,
  previewAr,
  imagePath,
  focus,
  focusX,
  onImage,
  onFocus,
  onFocusX,
}: {
  title: string
  hint: string
  previewAr: number
  imagePath: string | null
  focus: number
  focusX: number
  onImage: (path: string | null) => void
  onFocus: (v: number) => void
  onFocusX: (v: number) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [adjustableY, setAdjustableY] = useState<boolean | null>(null)
  const [adjustableX, setAdjustableX] = useState<boolean | null>(null)
  const imageUrl = imagePath ? getRenderUrl(imagePath) : null

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    disabled: uploading,
    onDrop: async ([file]) => {
      if (!file) return
      setUploading(true)
      try {
        const prev = imagePath
        const path = await uploadRender(await optimizeRender(file), 'site')
        if (prev) await deleteRender(prev).catch(() => {})
        setAdjustableY(null)
        setAdjustableX(null)
        onImage(path)
        sileo.success({ title: 'Imagen subida — guardá para aplicar' })
      } catch {
        sileo.error({ title: 'No se pudo subir la imagen' })
      } finally {
        setUploading(false)
      }
    },
  })

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
      {imageUrl && (
        <div
          className="relative mx-auto overflow-hidden rounded-md bg-black/30"
          style={{ aspectRatio: previewAr, maxWidth: previewAr < 1 ? 240 : undefined }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            onLoad={e => {
              const ar = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight
              setAdjustableY(ar < previewAr - 0.02)
              setAdjustableX(ar > previewAr + 0.02)
            }}
            style={{ objectPosition: `${focusX}% ${focus}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={focus}
            disabled={adjustableY === false}
            onChange={e => onFocus(Number(e.target.value))}
            aria-label="Encuadre vertical"
            title={adjustableY === false ? 'Sin recorte vertical para ajustar' : 'Encuadre (arriba ↔ abajo)'}
            className="render-thumb__focus"
            style={{ writingMode: 'vertical-lr', opacity: 1 }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={focusX}
            disabled={adjustableX === false}
            onChange={e => onFocusX(Number(e.target.value))}
            aria-label="Encuadre horizontal"
            title={adjustableX === false ? 'Sin recorte horizontal para ajustar' : 'Encuadre (izquierda ↔ derecha)'}
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
          <p>{imagePath ? 'Arrastrá una imagen para reemplazar' : 'Arrastrá la imagen o hacé clic'}</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

// Aspecto representativo del hero en móvil (h-[560px] a ~390px de ancho ≈ 0.7).
const MOBILE_PREVIEW_AR = 0.7

export function HeroSettingsForm({ settings }: { settings: Tables<'site_settings'> }) {
  // Preview desktop = aspecto real de la ventana (el hero desktop es h-svh = pantalla completa).
  const [desktopAr, setDesktopAr] = useState(16 / 9)
  useEffect(() => {
    const update = () => setDesktopAr(window.innerWidth / window.innerHeight)
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
      hero_image_mobile: settings.hero_image_mobile,
      hero_focus: settings.hero_focus ?? 50,
      hero_focus_x: settings.hero_focus_x ?? 50,
      hero_focus_mobile: settings.hero_focus_mobile ?? 50,
      hero_focus_x_mobile: settings.hero_focus_x_mobile ?? 50,
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
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar portada'}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <HeroImageSlot
            title="Imagen desktop (ancha)"
            hint="Se muestra a pantalla completa en pantallas grandes. Ideal horizontal, alta resolución."
            previewAr={desktopAr}
            imagePath={watch('hero_image')}
            focus={watch('hero_focus')}
            focusX={watch('hero_focus_x')}
            onImage={p => setValue('hero_image', p, { shouldDirty: true })}
            onFocus={v => setValue('hero_focus', v, { shouldDirty: true })}
            onFocusX={v => setValue('hero_focus_x', v, { shouldDirty: true })}
          />
          <HeroImageSlot
            title="Imagen móvil (angosta)"
            hint="Se muestra en celulares. Ideal más vertical/cuadrada. Si no cargás una, se usa la de desktop."
            previewAr={MOBILE_PREVIEW_AR}
            imagePath={watch('hero_image_mobile')}
            focus={watch('hero_focus_mobile')}
            focusX={watch('hero_focus_x_mobile')}
            onImage={p => setValue('hero_image_mobile', p, { shouldDirty: true })}
            onFocus={v => setValue('hero_focus_mobile', v, { shouldDirty: true })}
            onFocusX={v => setValue('hero_focus_x_mobile', v, { shouldDirty: true })}
          />
        </CardContent>
      </Card>
    </form>
  )
}
