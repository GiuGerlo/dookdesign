import { getPublishedProjects, getCategories, getSiteSettings } from '@/lib/projects/queries'
import { siteUrl, SITE_NAME, AUTHOR, SITE_DESCRIPTION, INSTAGRAM_URL } from '@/lib/site/seo'

// llms.txt: resumen del sitio en texto plano para motores de respuesta / LLMs (AEO).
// Se genera desde la DB → siempre refleja los proyectos publicados.
export async function GET() {
  const [projects, categories, settings] = await Promise.all([
    getPublishedProjects(),
    getCategories(),
    getSiteSettings(),
  ])
  const catName = new Map(categories.map(c => [c.id, c.name]))

  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Proyectos',
  ]
  for (const p of projects) {
    const cat = p.category_id ? catName.get(p.category_id) : null
    const meta = [cat, p.year].filter(Boolean).join(', ')
    lines.push(`- [${p.title}](${siteUrl}/proyectos/${p.slug})${meta ? `: ${meta}` : ''}`)
  }

  lines.push('', '## Sobre', `${AUTHOR}, diseñador industrial.${settings?.location ? ` ${settings.location}.` : ''}`)

  const contacto: string[] = []
  if (settings?.email) contacto.push(`- Email: ${settings.email}`)
  if (INSTAGRAM_URL) contacto.push(`- Instagram: ${INSTAGRAM_URL}`)
  if (contacto.length > 0) lines.push('', '## Contacto', ...contacto)

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
