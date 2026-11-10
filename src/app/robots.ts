import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/dashboard', '/wallet', '/documents', '/notifications', '/saved', '/onboarding', '/auth/'] }],
    sitemap: 'https://crew.nextwavefusion.com/sitemap.xml',
  };
}
