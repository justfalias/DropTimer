-- DropTimer.gg - Supabase Database Setup
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Tabla para interacciones de usuarios (deseados)
CREATE TABLE IF NOT EXISTS game_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_slug TEXT NOT NULL,
  user_id TEXT NOT NULL, -- ID anónimo o de usuario autenticado
  interaction_type TEXT NOT NULL DEFAULT 'wishlist' CHECK (interaction_type = 'wishlist'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_slug, user_id) -- Un usuario solo puede agregar un juego a su lista de deseados una vez
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_game_interactions_slug ON game_interactions(game_slug);
CREATE INDEX IF NOT EXISTS idx_game_interactions_user ON game_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_interactions_type ON game_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_game_interactions_created ON game_interactions(created_at DESC);

-- Vista agregada para rankings (más eficiente que calcular en cada query)
CREATE OR REPLACE VIEW game_rankings AS
SELECT 
  game_slug,
  COUNT(*) as wishlist_count,
  MAX(created_at) as last_interaction_at
FROM game_interactions
GROUP BY game_slug;

-- Función para obtener estadísticas de un juego específico
CREATE OR REPLACE FUNCTION get_game_stats(game_slug_param TEXT)
RETURNS TABLE (
  wishlist_count BIGINT,
  user_has_wishlisted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as wishlist_count,
    FALSE as user_has_wishlisted -- Se calculará en el cliente con el user_id
  FROM game_interactions
  WHERE game_slug = game_slug_param;
END;
$$ LANGUAGE plpgsql;

-- Habilitar Row Level Security (RLS)
ALTER TABLE game_interactions ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer las interacciones (para rankings)
CREATE POLICY "Anyone can read interactions" ON game_interactions
  FOR SELECT USING (true);

-- Política: Cualquiera puede insertar interacciones (sin login requerido)
CREATE POLICY "Anyone can insert interactions" ON game_interactions
  FOR INSERT WITH CHECK (true);

-- Política: Los usuarios pueden eliminar sus propias interacciones
CREATE POLICY "Users can delete their own interactions" ON game_interactions
  FOR DELETE USING (true); -- Por ahora permitimos a todos, luego se puede restringir por user_id

-- Comentarios para documentación
COMMENT ON TABLE game_interactions IS 'Almacena juegos deseados (wishlist) de usuarios';
COMMENT ON COLUMN game_interactions.user_id IS 'ID único del usuario (anónimo o autenticado)';
COMMENT ON COLUMN game_interactions.interaction_type IS 'Tipo de interacción: wishlist (siempre)';
COMMENT ON VIEW game_rankings IS 'Vista agregada con rankings de juegos por número de usuarios que los desean';

