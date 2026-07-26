import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import { getAnalytics, type AnalyticsRow } from '@/lib/admin/vercel-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const RANGES = [
  { days: 1, label: '24 h' },
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
] as const
const VALID_DAYS = RANGES.map(r => r.days) as readonly number[]
const nf = new Intl.NumberFormat('es-AR')

// Código ISO de país (AR) → emoji bandera (🇦🇷).
function flag(code: string): string {
  if (code.length !== 2) return ''
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65))
}

function RankCard({
  title,
  rows,
  format = v => v,
  metric = 'visitors',
}: {
  title: string
  rows: AnalyticsRow[]
  format?: (value: string) => string
  metric?: 'visitors' | 'pageviews'
}) {
  return (
    <Card className="bg-card border-white/[0.08]">
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos en el período.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-foreground/90">{format(r.value)}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{nf.format(r[metric])}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const sp = await searchParams
  const days = VALID_DAYS.includes(Number(sp.days)) ? Number(sp.days) : 30
  const data = await getAnalytics(days)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight mb-1.5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Analytics
          </h1>
          <p className="text-sm text-muted-foreground">Tráfico del sitio (Vercel Web Analytics).</p>
        </div>
        <div className="flex rounded-md border border-white/[0.08] p-0.5">
          {RANGES.map(r => (
            <Link
              key={r.days}
              href={`/admin/analytics?days=${r.days}`}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                days === r.days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {!data ? (
        <Card className="bg-card border-white/[0.08]">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No se pudieron cargar las analytics. Revisá que estén configuradas las variables{' '}
              <code className="text-foreground">VERCEL_TOKEN</code>,{' '}
              <code className="text-foreground">VERCEL_PROJECT_ID</code> y{' '}
              <code className="text-foreground">VERCEL_TEAM_ID</code>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-card border-white/[0.08]">
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Visitantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold tabular-nums">{nf.format(data.totals.visitors)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-white/[0.08]">
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Páginas vistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold tabular-nums">{nf.format(data.totals.pageviews)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <RankCard title="Top páginas" rows={data.topPages} metric="pageviews" />
            <RankCard title="Países" rows={data.countries} format={c => `${flag(c)} ${c}`.trim()} />
            <RankCard title="Dispositivos" rows={data.devices} format={d => d.charAt(0).toUpperCase() + d.slice(1)} />
            <RankCard title="Referrers" rows={data.referrers} format={r => r || 'Directo'} />
          </div>
        </div>
      )}
    </div>
  )
}
