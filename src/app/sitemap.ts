import type { MetadataRoute } from 'next'
import { getPublishedProjects } from '@/lib/projects/queries'
import { siteUrl } from '@/lib/site/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects()

  const projectEntries: MetadataRoute.Sitemap = projects.map(p => ({
    url: `${siteUrl}/proyectos/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/proyectos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...projectEntries,
  ]
}
