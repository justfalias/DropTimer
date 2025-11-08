# 🏗️ Arquitectura de DropTimer

## 📊 Resumen de la Arquitectura Actual

**Tipo:** Frontend Estático (Static Site Generation - SSG)

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Astro (Frontend Estático)                │  │
│  │  - Páginas pre-renderizadas en build time        │  │
│  │  - Componentes Reactivos                         │  │
│  │  - View Transitions                              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Lee datos
                          ▼
┌─────────────────────────────────────────────────────────┐
│              DATOS ESTÁTICOS (JSON)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │         src/data/games.json                       │  │
│  │  - Datos de juegos en formato JSON                │  │
│  │  - Se carga en tiempo de build                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. **Desarrollo (Script de Actualización)**
```
scripts/fetch-games.js (Node.js)
    │
    ├─> Conecta a RAWG API
    ├─> Obtiene datos reales
    └─> Actualiza games.json
```

### 2. **Build Time (Astro)**
```
npm run build
    │
    ├─> Astro lee games.json
    ├─> Pre-renderiza todas las páginas
    └─> Genera HTML estático
```

### 3. **Runtime (Navegador)**
```
Usuario visita la página
    │
    ├─> Recibe HTML pre-renderizado
    ├─> JavaScript se ejecuta (countdown timers)
    └─> View Transitions para navegación
```

## 📁 Estructura del Proyecto

```
DropTimer/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── MainLayout.astro
│   │   ├── GameCard.astro
│   │   ├── CountdownTimer.astro
│   │   └── PlatformTag.astro
│   │
│   ├── pages/               # Rutas (file-based routing)
│   │   ├── index.astro     # Homepage
│   │   └── game/[slug].astro  # Página dinámica
│   │
│   ├── data/               # Datos estáticos
│   │   └── games.json      # ⭐ Fuente de datos
│   │
│   ├── types/              # TypeScript types
│   │   └── Game.ts
│   │
│   └── styles/            # Estilos globales
│       └── global.css
│
├── scripts/                # Scripts de desarrollo
│   └── fetch-games.js     # ⭐ Actualiza games.json
│
├── public/                # Archivos estáticos
│   └── favicon.svg
│
└── .env                   # Variables de entorno (API keys)
```

## 🎯 ¿Dónde está el Backend?

**Respuesta corta:** No hay backend separado (por ahora).

### Arquitectura Actual: **Frontend Estático**

- ✅ **Ventajas:**
  - Rápido (todo pre-renderizado)
  - Gratis (puedes hostear en Netlify, Vercel, GitHub Pages)
  - SEO friendly
  - Seguro (no hay servidor que atacar)

- ⚠️ **Limitaciones:**
  - Los datos se actualizan solo cuando ejecutas el script
  - No hay actualización en tiempo real
  - No hay autenticación de usuarios
  - No hay base de datos

## 🔮 Futuras Mejoras (Backend)

Si quisieras agregar un backend, podrías:

### Opción 1: **API Routes de Astro** (Híbrido)
```
src/pages/api/
  └── games.json.ts  # Endpoint API
```

### Opción 2: **Backend Separado** (Node.js/Express)
```
backend/
  ├── server.js
  ├── routes/
  │   └── games.js
  └── database/
      └── games.db
```

### Opción 3: **Serverless Functions** (Vercel/Netlify)
```
api/
  └── update-games.js  # Función serverless
```

## 🔄 Cómo Funciona Actualmente

### Actualización de Datos:
1. **Manual:** Ejecutas `npm run fetch-games`
2. **El script:**
   - Se conecta a RAWG API
   - Obtiene datos reales
   - Actualiza `games.json`
3. **Rebuild:** `npm run build` (o se hace automático en dev)

### Renderizado:
1. **Build time:** Astro lee `games.json` y pre-renderiza todas las páginas
2. **Runtime:** El navegador recibe HTML estático + JavaScript para interactividad

## 📝 Resumen

- **Frontend:** Astro (SSG) - Todo estático
- **Datos:** JSON estático (`games.json`)
- **Actualización:** Script Node.js (`fetch-games.js`)
- **Backend:** No existe (por ahora)
- **Hosting:** Cualquier servicio de static hosting

¿Quieres que agreguemos un backend o mantenerlo estático?

