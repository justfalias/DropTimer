import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

// This is a server endpoint, so it doesn't need getStaticPaths
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const sortBy = url.searchParams.get('sort') || 'wishlist_count'; // wishlist_count, last_interaction_at
  const limit = parseInt(url.searchParams.get('limit') || '100');

  if (!supabase) {
    return new Response(
      JSON.stringify({ rankings: [] }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Validar sortBy
    const validSorts = ['wishlist_count', 'last_interaction_at'];
    const sortColumn = validSorts.includes(sortBy) ? sortBy : 'wishlist_count';

    const { data, error } = await supabase
      .from('game_rankings')
      .select('*')
      .order(sortColumn, { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching rankings:', error);
      return new Response(
        JSON.stringify({ rankings: [] }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ rankings: data || [] }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60', // Cache por 1 minuto
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/rankings:', error);
    return new Response(
      JSON.stringify({ rankings: [] }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

