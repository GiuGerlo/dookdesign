import { createClient } from '@/lib/supabase/server'
import { CategoryList } from '@/components/admin/CategoryList'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-6">Categorías</h1>
      <CategoryList categories={categories ?? []} />
    </div>
  )
}
