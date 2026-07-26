'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sileo } from 'sileo'
import { siteSettingsSchema, type SiteSettingsFormData } from '@/lib/admin/schemas'
import { updateSiteSettings } from '@/lib/admin/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tables } from '@/types/database'

export function SiteSettingsForm({ settings }: { settings: Tables<'site_settings'> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      about_text: settings.about_text ?? '',
      whatsapp_url: settings.whatsapp_url ?? '',
      email: settings.email ?? '',
      instagram_url: settings.instagram_url ?? '',
      behance_url: settings.behance_url ?? '',
      location: settings.location ?? '',
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
      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Sobre Agustín</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('about_text')}
            placeholder="Texto sobre Agustín Cavallera..."
            className={`${inputClass} min-h-[200px] resize-none`}
          />
          {errors.about_text && <p className="text-xs text-destructive mt-1.5">{errors.about_text.message}</p>}
        </CardContent>
      </Card>

      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Contacto, redes y ubicación</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>WhatsApp (número)</Label>
            <Input {...register('whatsapp_url')} placeholder="5493411234567" className={inputClass} />
            {errors.whatsapp_url && <p className="text-xs text-destructive">{errors.whatsapp_url.message}</p>}
            <p className="text-xs text-muted-foreground">Cargá el número con código de país (sin +). Así el mensaje llega pre-cargado con el proyecto. También acepta un link wa.me/wa.link (pero sin mensaje por producto).</p>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>
    </form>
  )
}
