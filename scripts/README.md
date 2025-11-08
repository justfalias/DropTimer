# Scripts de DropTimer

## 📥 Obtener Fechas Reales de Juegos

Este script te permite obtener fechas de lanzamiento reales desde la API de RAWG (una base de datos de videojuegos).

### 🚀 Cómo Usar

1. **Obtén una API Key gratuita:**
   - Ve a https://rawg.io/apidocs
   - Crea una cuenta gratuita
   - Obtén tu API key

2. **Crea el archivo `.env`:**
   ```bash
   cp .env.example .env
   ```

3. **Edita `.env` y agrega tu API key:**
   ```
   RAWG_API_KEY=tu_api_key_aqui
   ```

4. **Instala las dependencias:**
   ```bash
   npm install
   ```

5. **Edita el script para agregar los juegos que quieres buscar:**
   - Abre `scripts/fetch-games.js`
   - Modifica el array `GAMES_TO_FETCH` con los nombres de los juegos que quieres buscar

6. **Ejecuta el script:**
   ```bash
   npm run fetch-games
   ```

El script:
- ✅ Buscará cada juego en la API de RAWG
- ✅ Obtendrá la fecha de lanzamiento real
- ✅ Obtendrá la imagen del juego
- ✅ Obtendrá la descripción
- ✅ Obtendrá las plataformas disponibles
- ✅ Actualizará automáticamente `src/data/games.json`

### 📝 Notas

- El script respeta los juegos existentes (no los sobrescribe)
- Si un juego ya existe (mismo slug), no se agregará de nuevo
- La API de RAWG tiene límites de rate, así que el script espera 1 segundo entre cada búsqueda
- Las plataformas se mapean automáticamente a las que soporta DropTimer (PC, PlayStation, Xbox, Switch, Steam)

### 🔄 Actualizar Juegos Existentes

Si quieres actualizar las fechas de juegos existentes, puedes:
1. Eliminar el juego de `games.json`
2. Agregarlo al array `GAMES_TO_FETCH` en el script
3. Ejecutar el script de nuevo

