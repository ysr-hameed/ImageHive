
import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export function SEOHead({
  title = "ImageVault - Professional Image Hosting & CDN",
  description = "Fast, secure, and reliable image hosting with global CDN. Upload, store, and deliver images at scale with advanced analytics and API access.",
  keywords = "image hosting, CDN, image storage, photo hosting, image API, cloud storage, image optimization, fast delivery, secure hosting, image management",
  image = "/og-image.png",
  url,
  type = "website",
  siteName = "ImageVault"
}: SEOProps) {
  const [location] = useLocation();
  
  const currentUrl = url || `${window.location.origin}${location}`;
  const fullTitle = title.includes('ImageVault') ? title : `${title} | ImageVault`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', 'ImageVault');
    updateMeta('robots', 'index, follow');
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph tags
    updateProperty('og:title', fullTitle);
    updateProperty('og:description', description);
    updateProperty('og:image', image);
    updateProperty('og:url', currentUrl);
    updateProperty('og:type', type);
    updateProperty('og:site_name', siteName);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Additional SEO tags
    updateMeta('theme-color', '#3b82f6');
    updateMeta('msapplication-TileColor', '#3b82f6');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Schema.org structured data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": siteName,
      "description": description,
      "url": currentUrl,
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": siteName
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      (script as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);

  }, [fullTitle, description, keywords, image, currentUrl, type, siteName]);

  return null;
}

// Page-specific SEO configurations
export const seoConfigs = {
  home: {
    title: "ImageVault - Professional Image Hosting & CDN",
    description: "Fast, secure, and reliable image hosting with global CDN. Upload, store, and deliver images at scale with advanced analytics and API access.",
    keywords: "image hosting, CDN, image storage, photo hosting, image API, cloud storage, image optimization, fast delivery, secure hosting, image management"
  },
  plans: {
    title: "Pricing Plans - ImageVault",
    description: "Choose the perfect plan for your image hosting needs. From free tier to enterprise solutions with unlimited storage and bandwidth.",
    keywords: "image hosting pricing, CDN pricing, photo storage plans, image API pricing, cloud storage cost, professional image hosting"
  },
  features: {
    title: "Features - ImageVault",
    description: "Discover powerful features including global CDN, image optimization, advanced analytics, API access, custom domains, and more.",
    keywords: "image hosting features, CDN features, image optimization, image analytics, image API, custom domains, image management tools"
  },
  docs: {
    title: "Documentation - ImageVault API",
    description: "Complete API documentation and integration guides for ImageVault. Learn how to upload, manage, and deliver images programmatically.",
    keywords: "image API documentation, image hosting API, REST API, image upload API, CDN API, developer guide, integration guide"
  },
  upload: {
    title: "Upload Images - ImageVault",
    description: "Upload and manage your images with ease. Supports bulk uploads, drag & drop, and advanced optimization settings.",
    keywords: "upload images, bulk image upload, photo upload, image management, drag drop upload, image optimization"
  },
  dashboard: {
    title: "Dashboard - ImageVault",
    description: "Manage your images, view analytics, and monitor usage from your personalized dashboard.",
    keywords: "image dashboard, photo management, image analytics, usage statistics, image library"
  },
  analytics: {
    title: "Analytics - ImageVault",
    description: "Get detailed insights into your image performance, view statistics, and track usage patterns.",
    keywords: "image analytics, photo statistics, image performance, usage tracking, image insights"
  },
  about: {
    title: "About - ImageVault",
    description: "Learn about ImageVault's mission to provide reliable, fast, and secure image hosting solutions for developers and businesses.",
    keywords: "about ImageVault, image hosting company, CDN provider, photo storage service, image management platform"
  },
  contact: {
    title: "Contact Us - ImageVault",
    description: "Get in touch with our team for support, sales inquiries, or partnership opportunities.",
    keywords: "contact ImageVault, support, sales, partnership, customer service, help"
  }
};
