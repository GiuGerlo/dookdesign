import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/admin/ProjectForm'

export default async function NuevoProyectoPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-6">Nuevo proyecto</h1>
      <ProjectForm categories={categories ?? []} />
    </div>
  )
}
