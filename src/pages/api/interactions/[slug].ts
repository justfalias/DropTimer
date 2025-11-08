import type { APIRoute } from 'astro';
import { supabase, getOrCreateAnonymousUserId, type InteractionType } from '@/lib/supabase';

// This is a server endpoint, so it doesn't need getStaticPaths
export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id') || getOrCreateAnonymousUserId();
  
  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Game slug is required' }),
      { 
        status: 400,
          headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!supabase) {
    return new Response(
      JSON.stringify({ 
        wishlist_count: 0,
        user_has_wishlisted: false,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Obtener estadísticas agregadas
    const { data: stats, error: statsError } = await supabase
      .from('game_rankings')
      .select('wishlist_count')
      .eq('game_slug', slug)
      .single();

    // Obtener interacciones del usuario
    const { data: userInteractions, error: userError } = await supabase
      .from('game_interactions')
      .select('interaction_type')
      .eq('game_slug', slug)
      .eq('user_id', userId);

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching stats:', statsError);
    }

    if (userError) {
      console.error('Error fetching user interactions:', userError);
    }

    const wishlist_count = stats?.wishlist_count || 0;
    const user_has_wishlisted = userInteractions && userInteractions.length > 0;

    return new Response(
      JSON.stringify({
        wishlist_count,
        user_has_wishlisted,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30', // Cache por 30 segundos
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/interactions/[slug]:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        wishlist_count: 0,
        user_has_wishlisted: false,
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  
  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Game slug is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!supabase) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await request.json();
    const { user_id } = body;

    const userId = user_id || getOrCreateAnonymousUserId();

    // Insertar o actualizar interacción (usando upsert con unique constraint)
    const { data, error } = await supabase
      .from('game_interactions')
      .upsert({
        game_slug: slug,
        user_id: userId,
        interaction_type: 'wishlist',
      }, {
        onConflict: 'game_slug,user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting interaction:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save interaction' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        interaction: data,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in POST /api/interactions/[slug]:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  
  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Game slug is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!supabase) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id') || getOrCreateAnonymousUserId();

    const { error } = await supabase
      .from('game_interactions')
      .delete()
      .eq('game_slug', slug)
      .eq('user_id', user_id);

    if (error) {
      console.error('Error deleting interaction:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete interaction' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/interactions/[slug]:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

