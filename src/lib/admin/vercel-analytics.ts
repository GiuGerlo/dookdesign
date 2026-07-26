import 'server-only'

// Dashboard de analytics: consume la Web Analytics API de Vercel del lado server.
// El token nunca sale del server. Si falta config o la API falla, devuelve null → la UI muestra aviso.

const BASE = 'https://api.vercel.com/v1/query/web-analytics'
const TOKEN = process.env.VERCEL_TOKEN
const TEAM = process.env.VERCEL_TEAM_ID
const PROJECT = process.env.VERCEL_PROJECT_ID

export type AnalyticsRow = { value: string; visitors: number; pageviews: number }
export interface AnalyticsData {
  totals: { visitors: number; pageviews: number }
  topPages: AnalyticsRow[]
  countries: AnalyticsRow[]
  devices: AnalyticsRow[]
  referrers: AnalyticsRow[]
}

interface AggregateRow {
  visitors: number
  pageviews: number
  [dim: string]: string | number
}

async function callApi(
  path: 'visits/count' | 'visits/aggregate',
  params: Record<string, string>
): Promise<unknown | null> {
  if (!TOKEN || !TEAM || !PROJECT) return null
  const url = new URL(`${BASE}/${path}`)
  url.searchParams.set('teamId', TEAM)
  url.searchParams.set('projectId', PROJECT)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      // Cachear 5 min: los datos no cambian al segundo y así somos amables con la API.
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function aggregate(by: string, range: { since: string; until: string }, limit = 8): Promise<AnalyticsRow[]> {
  const json = (await callApi('visits/aggregate', { ...range, by, limit: String(limit) })) as
    | { data?: AggregateRow[] }
    | null
  if (!json?.data) return []
  return json.data.map(r => ({
    value: String(r[by] ?? ''),
    visitors: Number(r.visitors ?? 0),
    pageviews: Number(r.pageviews ?? 0),
  }))
}

export async function getAnalytics(days: number): Promise<AnalyticsData | null> {
  // Sin config → null: la UI muestra el aviso de "no configurado".
  if (!TOKEN || !TEAM || !PROJECT) return null

  const until = new Date()
  const since = new Date(Date.now() - days * 86_400_000)
  const range = { since: since.toISOString(), until: until.toISOString() }

  // Páginas: over-fetch para filtrar rutas /admin. País con límite alto para totales exactos.
  const [pagesRaw, countriesRaw, devices, referrers] = await Promise.all([
    aggregate('requestPath', range, 20),
    aggregate('country', range, 100),
    aggregate('deviceType', range),
    aggregate('referrerHostname', range),
  ])

  // Totales por suma del agregado por país: cada visitante tiene un solo país → visitantes únicos
  // y páginas vistas exactos (incluye el bucket "Others" si lo hubiera). Evita el endpoint count.
  const totals = countriesRaw.reduce(
    (t, r) => ({ visitors: t.visitors + r.visitors, pageviews: t.pageviews + r.pageviews }),
    { visitors: 0, pageviews: 0 }
  )

  const topPages = pagesRaw
    .filter(r => r.value && !r.value.startsWith('/admin') && r.value !== 'Others')
    .slice(0, 8)
  const countries = countriesRaw.filter(r => r.value && r.value !== 'Others').slice(0, 8)

  return { totals, topPages, countries, devices, referrers }
}
