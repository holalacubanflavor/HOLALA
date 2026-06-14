import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.holalacubanflavor.com';
const LOCALES = ['es', 'en'] as const;

const STATIC_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/menu', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/catering', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/location', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
];

// Static blog slugs — will be dynamic from Sanity in Sprint 2
const BLOG_SLUGS = [
  'historia-del-sandwich-cubano',
  'mojo-cubano-la-salsa-universal',
  'comida-cubana-en-san-antonio',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages (all locales)
  for (const page of STATIC_PAGES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // Blog posts (all locales)
  for (const slug of BLOG_SLUGS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
