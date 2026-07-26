import { createClient } from '@/lib/supabase/server'
import { homeGridSchema } from '@/lib/admin/schemas'
import { HomeGridEditor } from '@/components/admin/HomeGridEditor'

export default async function InicioPage() {
  const supabase = await createClient()
  const [{ data: projects }, { data: settings }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('year', { ascending: false })
      .order('order', { ascending: true }),
    supabase.from('site_settings').select('home_grid').single(),
  ])

  const parsed = homeGridSchema.safeParse(settings?.home_grid ?? [])
  const initialGrid = parsed.success ? parsed.data : []

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-1.5">Inicio</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Elegí qué proyectos aparecen en la grilla del home, en qué orden y con qué tamaño.
      </p>
      <HomeGridEditor projects={projects ?? []} initialGrid={initialGrid} />
    </div>
  )
}
