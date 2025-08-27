
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { db } from './db';
import { images } from '../shared/schema';
import { eq } from 'drizzle-orm';

export async function generateSitemap() {
  try {
    const baseUrl = process.env.BASE_URL || 'https://imagevault.replit.app';
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/plans', changefreq: 'weekly', priority: 0.8 },
      { url: '/features', changefreq: 'weekly', priority: 0.8 },
      { url: '/docs', changefreq: 'weekly', priority: 0.7 },
      { url: '/about', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.4 },
      { url: '/terms', changefreq: 'yearly', priority: 0.4 },
      { url: '/auth/login', changefreq: 'weekly', priority: 0.5 },
      { url: '/auth/register', changefreq: 'weekly', priority: 0.5 },
    ];

    // Add public images
    const publicImages = await db.select({
      id: images.id,
      updatedAt: images.updatedAt
    }).from(images).where(eq(images.isPublic, true)).limit(1000);

    publicImages.forEach(image => {
      links.push({
        url: `/i/${image.id}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: image.updatedAt?.toISOString()
      });
    });

    const stream = new SitemapStream({ hostname: baseUrl });
    const data = await streamToPromise(Readable.from(links).pipe(stream));
    
    // Write sitemap to public directory
    const fs = require('fs');
    const path = require('path');
    
    const publicDir = path.join(process.cwd(), 'client', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), data.toString());
    
    console.log('✅ Sitemap generated successfully');
    return data.toString();
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    throw error;
  }
}

export async function generateRobotsTxt() {
  const baseUrl = process.env.BASE_URL || 'https://imagevault.replit.app';
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /dashboard
Disallow: /settings
Disallow: /upload

Sitemap: ${baseUrl}/sitemap.xml
`;

  try {
    const fs = require('fs');
    const path = require('path');
    
    const publicDir = path.join(process.cwd(), 'client', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
    console.log('✅ Robots.txt generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate robots.txt:', error);
  }
}
