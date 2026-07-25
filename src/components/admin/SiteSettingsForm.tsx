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
            rows={8}
            placeholder="Texto sobre Agustín Cavallera..."
            className={`${inputClass} resize-none`}
          />
          {errors.about_text && <p className="text-xs text-destructive mt-1.5">{errors.about_text.message}</p>}
        </CardContent>
      </Card>

      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Contacto global</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>WhatsApp URL</Label>
            <Input
              type="url"
              {...register('whatsapp_url')}
              placeholder="https://wa.me/..."
              className={inputClass}
            />
            {errors.whatsapp_url && <p className="text-xs text-destructive">{errors.whatsapp_url.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Email</Label>
            <Input type="email" {...register('email')} className={inputClass} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
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
