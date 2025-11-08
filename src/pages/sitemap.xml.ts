import type { APIRoute } from 'astro';
import gamesData from '@/data/games.json';
import type { Game } from '@/types/Game';

export const GET: APIRoute = () => {
  const games: Game[] = gamesData as Game[];
  const siteUrl = 'https://droptimer.gg'; // Update with your actual domain
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Game Pages -->
  ${games.map((game) => `
  <url>
    <loc>${siteUrl}/${game.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${game.image.startsWith('http') ? game.image : `${siteUrl}${game.image}`}</image:loc>
      <image:title>${game.name}</image:title>
    </image:image>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

