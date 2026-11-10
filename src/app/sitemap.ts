import type { MetadataRoute } from 'next';

const base = 'https://crew.nextwavefusion.com';
const publicPaths = ['', '/community', '/members', '/career', '/wealth', '/membership'];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: 'weekly', priority: path === '' ? 1 : 0.6 }));
}
