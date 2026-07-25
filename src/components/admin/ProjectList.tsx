'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Plus, Star, Eye, EyeOff } from 'lucide-react'
import { sileo } from 'sileo'
import { deleteProject, reorderProjects } from '@/lib/admin/actions'
import { getRenderUrl } from '@/lib/admin/storage'
import { Badge } from '@/components/ui/badge'
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
import type { Tables } from '@/types/database'
import { cn } from '@/lib/utils'

type Project = Tables<'projects'>

function ProjectRow({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const thumbUrl = project.renders?.[0] ? getRenderUrl(project.renders[0]) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-card transition-shadow',
        isDragging && 'opacity-50 shadow-2xl ring-1 ring-primary/40'
      )}
    >
      <button
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none p-0.5"
        {...attributes}
        {...listeners}
        aria-label="Reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="w-10 h-10 rounded-md bg-white/5 overflow-hidden shrink-0">
        {thumbUrl ? (
          <Image src={thumbUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
        <p className="text-xs text-muted-foreground">{project.year}</p>
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {project.featured && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1 text-xs px-2">
            <Star className="h-3 w-3" />
            Destacado
          </Badge>
        )}
        <Badge
          variant="secondary"
          className={cn(
            'border-0 text-xs gap-1 px-2',
            project.published
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-white/5 text-muted-foreground'
          )}
        >
          {project.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {project.published ? 'Publicado' : 'Borrador'}
        </Badge>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          nativeButton={false} render={<Link href={`/admin/proyectos/${project.id}`} />}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" />}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Borrar proyecto?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará &ldquo;{project.title}&rdquo; y todos sus renders. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/10 bg-transparent hover:bg-white/5">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => onDelete(project.id)}
              >
                Borrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const [list, setList] = useState(projects)
  const sensors = useSensors(useSensor(PointerSensor))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex(p => p.id === active.id)
    const newIndex = list.findIndex(p => p.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setList(next)
    await reorderProjects(next.map(p => p.id))
  }

  async function handleDelete(id: string) {
    await deleteProject(id)
    setList(list.filter(p => p.id !== id))
    sileo.success({ title: 'Proyecto eliminado' })
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? 'proyecto' : 'proyectos'}
        </p>
        <Button size="sm" nativeButton={false} render={<Link href="/admin/proyectos/nuevo" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo proyecto
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-lg py-16 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Sin proyectos aún.</p>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-transparent hover:bg-white/5"
            nativeButton={false} render={<Link href="/admin/proyectos/nuevo" />}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Crear el primero
          </Button>
        </div>
      ) : (
        <DndContext id="admin-projects" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={list.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {list.map(project => (
                <ProjectRow key={project.id} project={project} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
