import { createClient } from '@/lib/supabase/server'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').single()

  if (!settings) return <p className="text-sm text-muted-foreground p-6">Error al cargar configuración.</p>

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-6">Configuración</h1>
      <SiteSettingsForm settings={settings} />
    </div>
  )
}
