'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { sileo } from 'sileo'
import { projectSchema, type ProjectFormData, slugify } from '@/lib/admin/schemas'
import { createProject, updateProject } from '@/lib/admin/actions'
import { RendersUpload } from './RendersUpload'
import { EnvironmentRendersUpload } from './EnvironmentRendersUpload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Tables } from '@/types/database'

interface ProjectFormProps {
  project?: Tables<'projects'>
  categories: Tables<'categories'>[]
}

export function ProjectForm({ project, categories }: ProjectFormProps) {
  const router = useRouter()
  const isEdit = !!project
  const [materialInput, setMaterialInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  // Id generado adelantado para proyectos nuevos: así los renders se suben a su carpeta {id}/
  // desde el vamos (no a 'new/') y la fila se inserta con ese mismo id.
  const [newId] = useState(() => crypto.randomUUID())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          slug: project.slug,
          year: project.year,
          category_id: project.category_id,
          materials: project.materials,
          description: project.description,
          featured: project.featured,
          published: project.published,
          renders: project.renders,
          environment_renders: project.environment_renders,
        }
      : {
          title: '',
          slug: '',
          year: new Date().getFullYear(),
          category_id: null,
          materials: [],
          description: '',
          featured: false,
          published: true,
          renders: [],
          environment_renders: [],
        },
  })

  const title = watch('title')
  const materials = watch('materials')

  useEffect(() => {
    if (!isEdit) setValue('slug', slugify(title))
  }, [title, isEdit, setValue])

  function addMaterial(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = materialInput.trim()
      if (val && !materials.includes(val)) setValue('materials', [...materials, val])
      setMaterialInput('')
    }
  }

  function removeMaterial(m: string) {
    setValue('materials', materials.filter(x => x !== m))
  }

  async function onSubmit(data: ProjectFormData) {
    try {
      if (isEdit && project) {
        await updateProject(project.id, data)
        sileo.success({ title: 'Proyecto actualizado' })
      } else {
        await createProject(data, projectId)
        sileo.success({ title: 'Proyecto creado' })
      }
      router.push('/admin/proyectos')
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : 'Error al guardar' })
    }
  }

  const projectId = project?.id ?? newId

  const labelClass = 'text-[11px] uppercase tracking-wider text-muted-foreground font-medium'
  const inputClass = 'bg-background/40 border-white/[0.08] focus-visible:border-primary focus-visible:ring-primary/20'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

      {/* Información */}
      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Información</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Título</Label>
            <Input {...register('title')} className={inputClass} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Slug</Label>
            <Input
              {...register('slug')}
              readOnly={isEdit}
              className={`${inputClass} font-mono text-sm ${isEdit ? 'opacity-60' : ''}`}
            />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Año</Label>
            <Input
              type="number"
              {...register('year', { valueAsNumber: true })}
              className={inputClass}
            />
            {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Categoría</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select
                  items={[
                    { value: 'none', label: 'Sin categoría' },
                    ...categories.map(cat => ({ value: cat.id, label: cat.name })),
                  ]}
                  value={field.value ?? 'none'}
                  onValueChange={val => field.onChange(val === 'none' ? null : val)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label className={labelClass}>Materiales</Label>
            {materials.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {materials.map(m => (
                  <Badge key={m} variant="secondary" className="bg-primary/10 text-primary border-0 gap-1 pr-1.5 text-xs">
                    {m}
                    <button type="button" onClick={() => removeMaterial(m)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input
              value={materialInput}
              onChange={e => setMaterialInput(e.target.value)}
              onKeyDown={addMaterial}
              placeholder="Escribí un material y presioná Enter"
              className={inputClass}
            />
          </div>
        </CardContent>
      </Card>

      {/* Descripción */}
      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('description')}
            rows={5}
            placeholder="Descripción del proyecto..."
            className={`${inputClass} resize-none`}
          />
        </CardContent>
      </Card>

      {/* Publicación */}
      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Publicación</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-8">
          {(['featured', 'published'] as const).map(field => (
            <label key={field} className="flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative">
                <input type="checkbox" {...register(field)} className="peer sr-only" />
                <div className="w-9 h-5 rounded-full bg-white/10 peer-checked:bg-primary transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {field === 'featured' ? 'Destacado' : 'Publicado'}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Renders */}
      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Renders</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="renders"
            control={control}
            render={({ field }) => (
              <RendersUpload
                projectId={projectId}
                value={field.value}
                onChange={field.onChange}
                onUploadingChange={setIsUploading}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Renders de entorno */}
      <Card className="bg-card border-white/[0.08]">
        <CardHeader className="pb-4 pt-5">
          <CardTitle className={labelClass}>Renders de entorno</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="environment_renders"
            control={control}
            render={({ field }) => (
              <EnvironmentRendersUpload
                projectId={projectId}
                value={field.value}
                onChange={field.onChange}
                onUploadingChange={setIsUploading}
              />
            )}
          />
        </CardContent>
      </Card>

      </div>

      <div className="flex items-center gap-3 justify-end pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? 'Guardando…' : isUploading ? 'Subiendo imágenes…' : isEdit ? 'Actualizar proyecto' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  )
}
