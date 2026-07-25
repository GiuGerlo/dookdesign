'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { sileo } from 'sileo'
import type { Tables } from '@/types/database'
import { createCategory, updateCategory, deleteCategory } from '@/lib/admin/actions'
import { slugify } from '@/lib/admin/schemas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type Category = Tables<'categories'>

export function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [list, setList] = useState(categories)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => { setList(categories) }, [categories])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await createCategory({ name: newName.trim(), slug: slugify(newName) })
      setNewName('')
      router.refresh()
      sileo.success({ title: 'Categoría creada' })
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al crear' })
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return
    try {
      await updateCategory(id, { name: editName.trim(), slug: slugify(editName) })
      setList(list.map(c => c.id === id ? { ...c, name: editName.trim() } : c))
      setEditId(null)
      sileo.success({ title: 'Categoría actualizada' })
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al actualizar' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id)
      setList(list.filter(c => c.id !== id))
      sileo.success({ title: 'Categoría eliminada' })
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al borrar' })
    }
  }


  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nueva categoría"
          className="bg-card border-white/[0.08] focus-visible:border-primary focus-visible:ring-primary/20"
        />
        <Button type="submit" size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Agregar
        </Button>
      </form>

      {list.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-lg py-10 text-center">
          <p className="text-sm text-muted-foreground">Sin categorías aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-card"
            >
              {editId === cat.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                    className="h-8 bg-background/40 border-white/[0.08] flex-1 focus-visible:border-primary"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUpdate(cat.id) } }}
                  />
                  <Button
                    onClick={() => handleUpdate(cat.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setEditId(null)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                  </div>
                  <Button
                    onClick={() => { setEditId(cat.id); setEditName(cat.name) }}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" />}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Borrar &ldquo;{cat.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Los proyectos asociados quedarán sin categoría.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 bg-transparent hover:bg-white/5">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Borrar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
