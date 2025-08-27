
import { writeFileSync } from 'fs';
import { join } from 'path';

interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export async function generateSitemap() {
  try {
    const baseUrl = process.env.BASE_URL || 'http://0.0.0.0:5000';
    
    // Static pages
    const staticPages: SitemapUrl[] = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/about', changefreq: 'monthly', priority: 0.8 },
      { url: '/features', changefreq: 'monthly', priority: 0.8 },
      { url: '/plans', changefreq: 'weekly', priority: 0.9 },
      { url: '/docs', changefreq: 'weekly', priority: 0.9 },
      { url: '/help', changefreq: 'monthly', priority: 0.7 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.5 },
      { url: '/terms', changefreq: 'yearly', priority: 0.5 },
      { url: '/auth/login', changefreq: 'monthly', priority: 0.6 },
      { url: '/auth/register', changefreq: 'monthly', priority: 0.6 },
    ];

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`}
    ${page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : ''}
    ${page.priority ? `<priority>${page.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    // Write sitemap to public directory
    const sitemapPath = join(process.cwd(), 'client', 'public', 'sitemap.xml');
    
    // Ensure directory exists
    const { mkdirSync } = await import('fs');
    const { dirname } = await import('path');
    
    try {
      mkdirSync(dirname(sitemapPath), { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
    
    writeFileSync(sitemapPath, xml, 'utf8');
    
    console.log('✅ Sitemap generated successfully at:', sitemapPath);
    return { success: true, path: sitemapPath };
    
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to add dynamic URLs (e.g., blog posts, public images)
export async function addDynamicUrls(urls: SitemapUrl[]) {
  // This can be extended to include dynamic content from database
  // For example: public images, blog posts, user galleries, etc.
  return urls;
}

// SEO meta tags generator
export function generateMetaTags(page: {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}) {
  const baseUrl = process.env.BASE_URL || 'http://0.0.0.0:5000';
  const defaultTitle = 'ImageVault - Professional Image Management Platform';
  const defaultDescription = 'Upload, optimize, and manage your images with our professional image hosting platform. API-first design with CDN delivery, custom domains, and advanced features.';
  const defaultImage = `${baseUrl}/og-image.jpg`;

  return {
    title: page.title || defaultTitle,
    description: page.description || defaultDescription,
    keywords: page.keywords || 'image hosting, CDN, image optimization, API, file upload, image management',
    'og:title': page.title || defaultTitle,
    'og:description': page.description || defaultDescription,
    'og:image': page.image || defaultImage,
    'og:url': page.url || baseUrl,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': page.title || defaultTitle,
    'twitter:description': page.description || defaultDescription,
    'twitter:image': page.image || defaultImage,
  };
}
