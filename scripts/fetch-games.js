/**
 * Script to fetch real game release dates from RAWG API
 * 
 * RAWG API is free and provides game data including release dates
 * Get your free API key at: https://rawg.io/apidocs
 * 
 * Usage:
 * 1. Get a free API key from https://rawg.io/apidocs
 * 2. Create a .env file with: RAWG_API_KEY=your_key_here
 * 3. Run: node scripts/fetch-games.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from environment variables
const RAWG_API_KEY = process.env.RAWG_API_KEY || 'YOUR_API_KEY_HERE';

// List of games to fetch (you can add more game names here)
// Focus on games with confirmed future release dates (2025-2026+)
const GAMES_TO_FETCH = [
  'Grand Theft Auto VI',
  'Metroid Prime 4',
  'Fable',
  'The Elder Scrolls VI',
  'Marvel\'s Blade',
  'Hollow Knight: Silksong',
  'Perfect Dark',
  'Avowed',
  'Death Stranding 2',
  'Star Wars Outlaws',
  'Indiana Jones and the Great Circle',
  'Doom: The Dark Ages',
  'Assassin\'s Creed Shadows',
  'Black Myth: Wukong',
  'Senua\'s Saga: Hellblade II',
  'Dragon Age: The Veilguard',
  'Final Fantasy VII Rebirth',
  'Persona 3 Reload',
  'Like a Dragon: Infinite Wealth',
  'Tekken 8',
  'Gears of War: E-Day',
  'State of Decay 3',
  'Everwild',
  'Contraband',
  'Project 007',
  'Wolverine',
  'Spider-Man 2',
  'Horizon Forbidden West',
  'God of War Ragnarök',
  'Starfield',
];

/**
 * Map RAWG platform names to our platform names
 */
function mapPlatform(rawgPlatform) {
  const platformMap = {
    'PC': 'PC',
    'PlayStation 5': 'PlayStation',
    'PlayStation 4': 'PlayStation',
    'Xbox Series X/S': 'Xbox',
    'Xbox One': 'Xbox',
    'Nintendo Switch': 'Switch',
    'Steam': 'Steam',
  };
  
  return platformMap[rawgPlatform] || rawgPlatform;
}

/**
 * Fetch game data from RAWG API
 */
async function fetchGameData(gameName) {
  try {
    const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(gameName)}&key=${RAWG_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Get the first result (most relevant)
      const game = data.results[0];
      
      // Get detailed game info
      const detailUrl = `https://api.rawg.io/api/games/${game.id}?key=${RAWG_API_KEY}`;
      const detailResponse = await fetch(detailUrl);
      const detailData = await detailResponse.json();
      
      // Extract platform-specific release dates
      const platformReleaseDates = {};
      const platforms = [];
      
      if (detailData.platforms && Array.isArray(detailData.platforms)) {
        detailData.platforms.forEach(platformData => {
          const platformName = platformData.platform.name;
          const mappedPlatform = mapPlatform(platformName);
          
          if (['PC', 'PlayStation', 'Xbox', 'Switch', 'Steam'].includes(mappedPlatform)) {
            if (!platforms.includes(mappedPlatform)) {
              platforms.push(mappedPlatform);
            }
            
            // Get platform-specific release date if available
            const platformReleaseDate = platformData.released_at || detailData.released || game.released;
            if (platformReleaseDate && (!platformReleaseDates[mappedPlatform] || platformReleaseDate < platformReleaseDates[mappedPlatform])) {
              platformReleaseDates[mappedPlatform] = platformReleaseDate;
            }
          }
        });
      }
      
      // Fallback to general release date if no platforms found
      const generalReleaseDate = detailData.released || game.released;
      if (platforms.length === 0) {
        platforms.push('PC'); // Default platform
      }
      
      return {
        name: game.name,
        slug: game.slug,
        releaseDate: generalReleaseDate,
        platformReleaseDates: Object.keys(platformReleaseDates).length > 0 ? platformReleaseDates : undefined,
        image: game.background_image || detailData.background_image,
        description: detailData.description_raw || detailData.description || '',
        platforms: platforms,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching ${gameName}:`, error.message);
    return null;
  }
}

/**
 * Download image from URL and save locally
 */
async function downloadImage(imageUrl, slug) {
  try {
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return null;
    }
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.log(`⚠️  Could not download image for ${slug}`);
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    const imagesDir = path.join(__dirname, '../public/images/games');
    
    // Create images directory if it doesn't exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Get file extension from URL or default to jpg
    const urlPath = new URL(imageUrl).pathname;
    const ext = urlPath.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
    const filename = `${slug}${ext}`;
    const filepath = path.join(imagesDir, filename);
    
    fs.writeFileSync(filepath, Buffer.from(buffer));
    
    return `/images/games/${filename}`;
  } catch (error) {
    console.error(`Error downloading image for ${slug}:`, error.message);
    return null;
  }
}

/**
 * Convert RAWG game data to our format
 */
async function convertToOurFormat(rawgData) {
  if (!rawgData) return null;
  
  // Convert platform names
  const platforms = rawgData.platforms
    .map(mapPlatform)
    .filter((p, i, arr) => arr.indexOf(p) === i) // Remove duplicates
    .filter(p => ['PC', 'PlayStation', 'Xbox', 'Switch', 'Steam'].includes(p)); // Only our supported platforms
  
  // Convert general release date format (RAWG uses YYYY-MM-DD, we need ISO with time)
  const releaseDate = rawgData.releaseDate 
    ? new Date(rawgData.releaseDate + 'T00:00:00Z').toISOString()
    : null;
  
  // Convert platform-specific release dates
  const platformReleaseDates = {};
  if (rawgData.platformReleaseDates) {
    Object.keys(rawgData.platformReleaseDates).forEach(platform => {
      const dateStr = rawgData.platformReleaseDates[platform];
      if (dateStr) {
        platformReleaseDates[platform] = new Date(dateStr + 'T00:00:00Z').toISOString();
      }
    });
  }
  
  // Check if any release date is in the future
  const now = new Date();
  let hasFutureDate = false;
  
  // Check general release date
  if (releaseDate) {
    const gameDate = new Date(releaseDate);
    if (gameDate >= now) {
      hasFutureDate = true;
    }
  }
  
  // Check platform-specific dates
  if (!hasFutureDate && Object.keys(platformReleaseDates).length > 0) {
    hasFutureDate = Object.values(platformReleaseDates).some(dateStr => {
      const gameDate = new Date(dateStr);
      return gameDate >= now;
    });
  }
  
  // Skip games that are already released on all platforms
  if (!hasFutureDate) {
    return null; // Return null to skip this game
  }
  
  // Download image locally
  const localImagePath = await downloadImage(rawgData.image, rawgData.slug);
  
  return {
    slug: rawgData.slug,
    name: rawgData.name,
    platforms: platforms.length > 0 ? platforms : ['PC'], // Default to PC if no platforms match
    releaseDate: releaseDate || new Date('2025-12-31T00:00:00Z').toISOString(), // Default future date if no date
    platformReleaseDates: Object.keys(platformReleaseDates).length > 0 ? platformReleaseDates : undefined,
    image: localImagePath || '/images/games/default.jpg', // Use local path
    description: rawgData.description.substring(0, 200) + '...', // Limit description length
  };
}

/**
 * Fetch popular upcoming games from a specific date
 */
async function fetchUpcomingGames(fromDate = '2025-12-01', page = 1, pageSize = 20) {
  try {
    // Search for games releasing from the specified date onwards, ordered by popularity
    const url = `https://api.rawg.io/api/games?dates=${fromDate},2026-12-31&ordering=-rating,-added&page_size=${pageSize}&page=${page}&key=${RAWG_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching upcoming games:`, error.message);
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🎮 Fetching game data from RAWG API...\n');
  
  if (RAWG_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ Error: Please set your RAWG API key!');
    console.log('\n📝 Steps:');
    console.log('1. Get a free API key at: https://rawg.io/apidocs');
    console.log('2. Create a .env file in the project root');
    console.log('3. Add: RAWG_API_KEY=your_key_here');
    console.log('4. Install dotenv: npm install dotenv');
    console.log('5. Run this script again\n');
    return;
  }
  
  const games = [];
  
  // First, fetch popular upcoming games from December 2025 onwards
  console.log('🔍 Searching for popular games releasing from December 2025...\n');
  const upcomingGames = await fetchUpcomingGames('2025-12-01', 1, 30);
  
  if (upcomingGames.length > 0) {
    console.log(`Found ${upcomingGames.length} upcoming games. Processing...\n`);
    
    for (const game of upcomingGames) {
      console.log(`Fetching details for: ${game.name}...`);
      
      // Get detailed game info
      const detailUrl = `https://api.rawg.io/api/games/${game.id}?key=${RAWG_API_KEY}`;
      const detailResponse = await fetch(detailUrl);
      const detailData = await detailResponse.json();
      
      // Extract platform-specific release dates
      const platformReleaseDates = {};
      const platforms = [];
      
      if (detailData.platforms && Array.isArray(detailData.platforms)) {
        detailData.platforms.forEach(platformData => {
          const platformName = platformData.platform.name;
          const mappedPlatform = mapPlatform(platformName);
          
          if (['PC', 'PlayStation', 'Xbox', 'Switch', 'Steam'].includes(mappedPlatform)) {
            if (!platforms.includes(mappedPlatform)) {
              platforms.push(mappedPlatform);
            }
            
            const platformReleaseDate = platformData.released_at || detailData.released || game.released;
            if (platformReleaseDate && (!platformReleaseDates[mappedPlatform] || platformReleaseDate < platformReleaseDates[mappedPlatform])) {
              platformReleaseDates[mappedPlatform] = platformReleaseDate;
            }
          }
        });
      }
      
      const generalReleaseDate = detailData.released || game.released;
      if (platforms.length === 0) {
        platforms.push('PC');
      }
      
      const rawgData = {
        name: game.name,
        slug: game.slug,
        releaseDate: generalReleaseDate,
        platformReleaseDates: Object.keys(platformReleaseDates).length > 0 ? platformReleaseDates : undefined,
        image: game.background_image || detailData.background_image,
        description: detailData.description_raw || detailData.description || '',
        platforms: platforms,
      };
      
      const converted = await convertToOurFormat(rawgData);
      if (converted) {
        games.push(converted);
        console.log(`✅ Added: ${converted.name} - Release: ${converted.releaseDate}`);
      } else {
        console.log(`⏭️  Skipped: ${game.name} (already released or invalid date)`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Also fetch manually specified games
  console.log('\n📋 Fetching manually specified games...\n');
  for (const gameName of GAMES_TO_FETCH) {
    console.log(`Fetching: ${gameName}...`);
    const rawgData = await fetchGameData(gameName);
    
    if (rawgData) {
      const converted = await convertToOurFormat(rawgData);
      if (converted) {
        games.push(converted);
        console.log(`✅ Found: ${converted.name} - Release: ${converted.releaseDate}`);
      } else {
        console.log(`⏭️  Skipped: ${gameName} (already released or invalid date)`);
      }
    } else {
      console.log(`❌ Not found: ${gameName}`);
    }
    
    // Be nice to the API - wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Filter out games that are already released
  const now = new Date();
  const futureGames = games.filter(game => {
    const gameDate = new Date(game.releaseDate);
    return gameDate >= now;
  });
  
  // Read existing games.json
  const gamesPath = path.join(__dirname, '../src/data/games.json');
  let existingGames = [];
  
  try {
    const existingData = fs.readFileSync(gamesPath, 'utf-8');
    existingGames = JSON.parse(existingData);
    // Also filter existing games to only keep future releases
    const now = new Date();
    existingGames = existingGames.filter(game => {
      const gameDate = new Date(game.releaseDate);
      return gameDate >= now;
    });
    
    // Download images for existing games that still have URLs
    console.log('\n📥 Downloading images for existing games...');
    for (const game of existingGames) {
      if (game.image && game.image.startsWith('http')) {
        console.log(`Downloading image for ${game.name}...`);
        const localImagePath = await downloadImage(game.image, game.slug);
        if (localImagePath) {
          game.image = localImagePath;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      }
    }
  } catch (error) {
    console.log('No existing games file found, creating new one...');
  }
  
  // Merge with existing games (avoid duplicates by slug)
  const existingSlugs = new Set(existingGames.map(g => g.slug));
  const newGames = futureGames.filter(g => !existingSlugs.has(g.slug));
  
  const allGames = [...existingGames, ...newGames];
  
  // Sort by release date
  allGames.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  
  // Write updated games.json
  fs.writeFileSync(gamesPath, JSON.stringify(allGames, null, 2));
  
  console.log(`\n✨ Done! Updated games.json with ${newGames.length} new games.`);
  console.log(`📊 Total games: ${allGames.length} (all future releases)`);
}

main().catch(console.error);

