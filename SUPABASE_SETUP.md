# 🔧 Configuración de Supabase para DropTimer.gg

## 📋 Pasos para configurar Supabase

### 1. Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Anota la **URL** y la **anon key** de tu proyecto

### 2. Configurar la base de datos

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido de `supabase-setup.sql`
3. Ejecuta el SQL (botón "Run")

### 3. Configurar variables de entorno

Crea o actualiza tu archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**⚠️ Importante:**
- Las variables deben empezar con `PUBLIC_` para que Astro las exponga al cliente
- No compartas tu `.env` en Git (ya está en `.gitignore`)

### 4. Obtener las credenciales

En tu proyecto de Supabase:
- **URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → anon/public key

### 5. Verificar la configuración

Después de configurar, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## 🎯 Funcionalidades habilitadas

Una vez configurado, tendrás:

- ✅ **Favoritos globales**: Los favoritos se guardan en la nube
- ✅ **Sistema de votos**: Los usuarios pueden votar por juegos
- ✅ **Rankings**: Juegos ordenados por más favoritos/votos
- ✅ **Contadores en tiempo real**: Número de favoritos/votos por juego

## 🔒 Seguridad

- Las políticas RLS (Row Level Security) están configuradas
- Cualquiera puede leer y crear interacciones (sin login)
- Los usuarios pueden eliminar sus propias interacciones
- Todo funciona de forma anónima (sin registro requerido)

## 🚀 Próximos pasos

Una vez que esto funcione, puedes agregar:
- Login opcional para sincronizar entre dispositivos
- Perfiles de usuario
- Historial de interacciones

