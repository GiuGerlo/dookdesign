import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/admin/ProjectForm'

export default async function EditarProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: categories }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!project) notFound()

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-6">Editar proyecto</h1>
      <ProjectForm project={project} categories={categories ?? []} />
    </div>
  )
}
