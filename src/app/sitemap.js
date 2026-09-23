import { concepts } from '@/data/concepts';

/**
 * Next.js Metadata Route: sitemap.xml
 * Dynamically generates a complete XML sitemap of all primary pages
 * and all 38 interactive concept simulation pages.
 */
export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nerdverse-alpha.vercel.app';
  const now = new Date();

  // Core Static Landing Pages
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/concepts`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ];

  // Dynamic Concept Thought Experiment Pages (all 38 concepts)
  const conceptRoutes = concepts.map((concept) => ({
    url: `${baseUrl}/concepts/${concept.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: concept.featured ? 0.9 : 0.8,
  }));

  return [...staticRoutes, ...conceptRoutes];
}
