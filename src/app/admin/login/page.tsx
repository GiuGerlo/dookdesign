'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: `${code}@dookdesign.com`,
      password,
    })
    setLoading(false)
    if (error) {
      setError('Código o contraseña incorrectos')
    } else {
      router.push('/admin/inicio')
    }
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image
            src="/logo-dook.png"
            alt="DooK Design"
            width={160}
            height={38}
            className="h-9 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
            priority
          />
        </div>

        <div className="bg-card border border-white/10 rounded-xl p-8 space-y-5">
          <div>
            <h1 className="text-sm font-semibold text-foreground">Acceso al panel</h1>
            <p className="text-xs text-muted-foreground mt-1">Ingresá tu código y contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Código
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="0000"
                required
                autoFocus
                className="bg-background/50 border-white/[0.08] focus-visible:border-primary focus-visible:ring-primary/20 tracking-[0.3em] text-center text-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Contraseña
              </Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-background/50 border-white/[0.08] focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full mt-1" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
