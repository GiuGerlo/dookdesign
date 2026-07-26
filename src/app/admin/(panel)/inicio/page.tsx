import { createClient } from '@/lib/supabase/server'
import { homeGridSchema } from '@/lib/admin/schemas'
import { HomeGridEditor } from '@/components/admin/HomeGridEditor'
import { HeroSettingsForm } from '@/components/admin/HeroSettingsForm'

export default async function InicioPage() {
  const supabase = await createClient()
  const [{ data: projects }, { data: settings }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('year', { ascending: false })
      .order('order', { ascending: true }),
    supabase.from('site_settings').select('*').single(),
  ])

  const parsed = homeGridSchema.safeParse(settings?.home_grid ?? [])
  const initialGrid = parsed.success ? parsed.data : []

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-1.5">Inicio</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Elegí la portada del home y qué proyectos aparecen en la grilla, en qué orden y con qué tamaño.
      </p>
      {settings && <HeroSettingsForm settings={settings} />}
      <HomeGridEditor projects={projects ?? []} initialGrid={initialGrid} />
    </div>
  )
}
