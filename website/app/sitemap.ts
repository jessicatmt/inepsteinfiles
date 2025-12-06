import { MetadataRoute } from 'next'
import peopleData from '@/public/people_index.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://inepsteinfiles.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.5 },
  ]

  // Dynamic person pages
  const personPages: MetadataRoute.Sitemap = peopleData.people.map((person) => ({
    url: `${baseUrl}/${person.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }))

  return [...staticPages, ...personPages]
}
