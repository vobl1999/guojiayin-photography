import { SITE } from '../config/site';
import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const sitemap = new URL('sitemap-index.xml', context.site ?? SITE.url).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
