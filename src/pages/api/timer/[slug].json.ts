import type { APIRoute } from 'astro';
import gamesData from '@/data/games.json';
import type { Game } from '@/types/Game';

// This is a server endpoint, so it doesn't need getStaticPaths
export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const apiKey = request.headers.get('X-API-Key') || new URL(request.url).searchParams.get('api_key');
  
  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Game slug is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const games: Game[] = gamesData as Game[];
  const game = games.find((g) => g.slug === slug);

  if (!game) {
    return new Response(
      JSON.stringify({ error: 'Game not found' }),
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Get the earliest release date
  function getEarliestReleaseDate(game: Game): string {
    if (game.platformReleaseDates && Object.keys(game.platformReleaseDates).length > 0) {
      const dates = Object.values(game.platformReleaseDates).filter(Boolean) as string[];
      if (dates.length > 0) {
        return dates.sort()[0];
      }
    }
    return game.releaseDate;
  }

  const releaseDate = getEarliestReleaseDate(game);
  const now = new Date().getTime();
  const target = new Date(releaseDate).getTime();
  const difference = target - now;

  // Calculate time remaining
  const isExpired = difference <= 0;
  const days = isExpired ? 0 : Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = isExpired ? 0 : Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = isExpired ? 0 : Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = isExpired ? 0 : Math.floor((difference % (1000 * 60)) / 1000);

  const response = {
    game: {
      slug: game.slug,
      name: game.name,
      platforms: game.platforms,
      releaseDate: releaseDate,
      image: game.image,
    },
    countdown: {
      isExpired,
      days,
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(difference / 1000),
    },
    timestamp: new Date().toISOString(),
    // API key info (for future monetization)
    ...(apiKey ? { apiKey: 'valid' } : { apiKey: null }),
  };

  return new Response(
    JSON.stringify(response, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    }
  );
};

