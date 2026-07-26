import { createClient } from '@supabase/supabase-js'

// Keep-alive: Supabase free pausa el proyecto tras ~7 días sin actividad. Un cron diario (vercel.json)
// pega acá y corre una query trivial → resetea el timer de inactividad y el sitio no se cae.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Vercel Cron manda `Authorization: Bearer <CRON_SECRET>` si la env existe. Si está seteada, exigirla.
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error } = await supabase.from('site_settings').select('id').limit(1)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })

  return Response.json({ ok: true, ts: new Date().toISOString() })
}
