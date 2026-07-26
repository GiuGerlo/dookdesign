'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Layers, LayoutGrid, Tag, Settings, BarChart3, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin/inicio', label: 'Inicio', icon: Home },
  { href: '/admin/proyectos', label: 'Proyectos', icon: Layers },
  { href: '/admin/proyectos-pagina', label: 'Página proyectos', icon: LayoutGrid },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-h-dvh bg-card border-r border-white/[0.08] fixed top-0 left-0 bottom-0 z-40">
      <div className="px-5 py-6 flex justify-center">
        <Image
          src="/logo-dook.png"
          alt="DooK Design"
          width={140}
          height={34}
          className="h-9 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
          priority
        />
      </div>

      <Separator className="opacity-10" />

      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <Separator className="opacity-10" />

      <div className="p-4 space-y-3">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground text-sm transition-colors px-3 py-2 rounded-md hover:bg-white/5 w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>

        <div className="px-3 pt-1 border-t border-white/[0.06] mt-1">
          <div className="flex items-center gap-2 mt-3">
            <p className="text-[8px] uppercase tracking-widest text-muted-foreground/50 shrink-0">Desarrollado por</p>
            <a href="https://giulianogerlo.vercel.app/" target="_blank">
              <Image
                src="/logo-gg.svg"
                alt="gg.dev"
                width={100}
                height={14}
                className="h-3.5 w-auto opacity-60 hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
