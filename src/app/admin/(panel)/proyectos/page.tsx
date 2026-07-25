import { createClient } from '@/lib/supabase/server'
import { ProjectList } from '@/components/admin/ProjectList'

export default async function ProyectosPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-6">Proyectos</h1>
      <ProjectList projects={projects ?? []} />
    </div>
  )
}
