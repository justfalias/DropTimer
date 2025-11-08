import { createClient } from '@supabase/supabase-js';

// Variables de entorno
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Social features will be disabled.');
}

// Crear cliente de Supabase
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Generar o recuperar ID de usuario anónimo
export function getOrCreateAnonymousUserId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'droptimer-anonymous-id';
  let userId = localStorage.getItem(storageKey);
  
  if (!userId) {
    // Generar un ID único
    userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, userId);
  }
  
  return userId;
}

// Tipos para las interacciones
export type InteractionType = 'wishlist';

export interface GameInteraction {
  id?: string;
  game_slug: string;
  user_id: string;
  interaction_type: InteractionType;
  created_at?: string;
}

export interface GameStats {
  wishlist_count: number;
  user_has_wishlisted: boolean;
}

