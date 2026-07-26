'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { Loader2 } from 'lucide-react'
import { sileo } from 'sileo'
import { siteSettingsSchema, type SiteSettingsFormData } from '@/lib/admin/schemas'
import { updateSiteSettings } from '@/lib/admin/actions'
import { uploadRender, deleteRender, getRenderUrl, optimizeRender } from '@/lib/admin/storage'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tables } from '@/types/database'

export function SiteSettingsForm({ settings }: { settings: Tables<'site_settings'> }) {
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      about_text: settings.about_text ?? '',
      whatsapp_url: settings.whatsapp_url ?? '',
      email: settings.email ?? '',
      hero_image: settings.hero_image,
      instagram_url: settings.instagram_url ?? '',
      behance_url: settings.behance_url ?? '',
      location: settings.location ?? '',
    },
  })

  const heroImage = watch('hero_image')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    disabled: uploading,
    onDrop: async ([file]) => {
      if (!file) return
      setUploading(true)
      try {
        const path = await uploadRender(await optimizeRender(file), 'site')
        // Borrar la portada anterior recién después de subir la nueva (si falla, no perdemos nada)
        if (heroImage) await deleteRender(heroImage).catch(() => {})
        setValue('hero_image', path, { shouldDirty: true })
        sileo.success({ title: 'Portada subida — guardá para aplicar' })
      } catch {
        sileo.error({ title: 'No se pudo subir la portada' })
      } finally {
        setUploading(false)
      }
    },
  })

  async function onSubmit(data: SiteSettingsFormData) {
    try {
      await updateSiteSettings(data)
      sileo.success({ title: 'Configuración guardada' })
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al guardar' })
    }
  }

  const labelClass = 'text-[11px] uppercase tracking-wider text-muted-foreground font-medium'
  const inputClass = 'bg-background/40 border-white/[0.08] focus-visible:border-primary focus-visible:ring-primary/20'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
        <Card className="bg-card border-white/[0.08]">
          <CardHeader className="pb-4 pt-5">
            <CardTitle className={labelClass}>Portada del home</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {heroImage && (
              <div className="relative h-[240px] overflow-hidden rounded-md bg-black/30">
                {/* object-contain: se ve la imagen completa en su proporción original (así se sube al bucket) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getRenderUrl(heroImage)}
                  alt="Portada actual del home"
                  className="w-full h-full object-contain"
                />
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
                  Optimizando y subiendo…
                </p>
              ) : (
                <p>{heroImage ? 'Arrastrá una imagen para reemplazar la portada' : 'Arrastrá la imagen de portada del home o hacé clic'}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Se muestra a pantalla completa en el inicio. Ideal: horizontal, alta resolución (se optimiza sola).
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/[0.08] flex flex-col">
          <CardHeader className="pb-4 pt-5">
            <CardTitle className={labelClass}>Sobre Agustín</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Textarea
              {...register('about_text')}
              placeholder="Texto sobre Agustín Cavallera..."
              className={`${inputClass} flex-1 min-h-[200px] resize-none`}
            />
            {errors.about_text && <p className="text-xs text-destructive mt-1.5">{errors.about_text.message}</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Contacto, redes y ubicación</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>WhatsApp URL</Label>
            <Input type="url" {...register('whatsapp_url')} placeholder="https://wa.me/..." className={inputClass} />
            {errors.whatsapp_url && <p className="text-xs text-destructive">{errors.whatsapp_url.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Email</Label>
            <Input type="email" {...register('email')} className={inputClass} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Instagram URL</Label>
            <Input type="url" {...register('instagram_url')} placeholder="https://instagram.com/..." className={inputClass} />
            {errors.instagram_url && <p className="text-xs text-destructive">{errors.instagram_url.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Behance URL</Label>
            <Input type="url" {...register('behance_url')} placeholder="https://behance.net/..." className={inputClass} />
            {errors.behance_url && <p className="text-xs text-destructive">{errors.behance_url.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Ubicación</Label>
            <Input {...register('location')} placeholder="Buenos Aires, Argentina" className={inputClass} />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>
          <p className="text-xs text-muted-foreground self-end pb-2.5">
            Los campos vacíos no se muestran en el sitio.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>
    </form>
  )
}
