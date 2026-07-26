import { createClient } from '@/lib/supabase/server'
import { projectsGridSchema } from '@/lib/admin/schemas'
import { ProjectsPageEditor } from '@/components/admin/ProjectsPageEditor'

export default async function ProyectosPaginaPage() {
  const supabase = await createClient()
  const [{ data: projects }, { data: settings }] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('year', { ascending: false })
      .order('order', { ascending: true }),
    supabase.from('site_settings').select('projects_intro, projects_grid').single(),
  ])

  const parsed = projectsGridSchema.safeParse(settings?.projects_grid ?? [])
  const initialGrid = parsed.success ? parsed.data : []

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-1.5">Página de proyectos</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Editá el texto de intro y el orden, tamaño y encuadre de los proyectos en la página pública /proyectos.
      </p>
      <ProjectsPageEditor
        projects={projects ?? []}
        initialGrid={initialGrid}
        initialIntro={settings?.projects_intro ?? ''}
      />
    </div>
  )
}
