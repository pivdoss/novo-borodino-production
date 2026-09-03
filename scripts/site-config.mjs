const isProduction = process.env.NODE_ENV === 'production';
const localProductionPreview = process.env.ALLOW_LOCAL_PRODUCTION_PREVIEW === 'true';
const rawSiteUrl = String(process.env.SITE_URL || (isProduction ? '' : 'http://localhost:4173')).trim();

if (!rawSiteUrl) {
  throw new Error('SITE_URL is required for a production build. Use the real HTTPS domain, for example https://your-domain.ru');
}

let parsedSiteUrl;
try {
  parsedSiteUrl = new URL(rawSiteUrl);
} catch {
  throw new Error('SITE_URL must be an absolute URL, for example https://your-domain.ru');
}

if (!['http:', 'https:'].includes(parsedSiteUrl.protocol) || parsedSiteUrl.pathname !== '/' || parsedSiteUrl.search || parsedSiteUrl.hash) {
  throw new Error('SITE_URL must contain only the site origin, without a path, query or fragment.');
}

if (isProduction && !localProductionPreview && (parsedSiteUrl.protocol !== 'https:' || /(^|\.)localhost$/i.test(parsedSiteUrl.hostname) || parsedSiteUrl.hostname === '127.0.0.1' || parsedSiteUrl.hostname === 'example.invalid')) {
  throw new Error('Production SITE_URL must be a real HTTPS domain and must not use localhost, 127.0.0.1 or example.invalid.');
}

export const siteUrl = parsedSiteUrl.origin;
