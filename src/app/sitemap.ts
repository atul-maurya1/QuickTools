import { MetadataRoute } from 'next'

const BASE_URL = 'https://quicktools.app'
const FORMATS = ['jpg', 'png', 'webp', 'gif', 'avif']
const COMPRESSION_TARGETS = ['50kb', '100kb', '200kb', '500kb', '1mb', '2mb']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/compress-image`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/decrease-size`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/increase-size`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/image-converter`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/resize-image`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/scale-image`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/bulk-processor`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const conversionRoutes: MetadataRoute.Sitemap = []
  for (const from of FORMATS) {
    for (const to of FORMATS) {
      if (from !== to) {
        conversionRoutes.push({
          url: `${BASE_URL}/convert/${from}-to-${to}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.8,
        })
      }
    }
  }

  const compressionRoutes: MetadataRoute.Sitemap = COMPRESSION_TARGETS.map(t => ({
    url: `${BASE_URL}/compress-image-to-${t}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...conversionRoutes, ...compressionRoutes]
}
