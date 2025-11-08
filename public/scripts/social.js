// Social features: Wishlist, Rankings
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  console.log('=== SOCIAL FEATURES LOADED ===');
  
  // Get anonymous user ID
  function getOrCreateAnonymousUserId() {
    const storageKey = 'droptimer-anonymous-id';
    let userId = localStorage.getItem(storageKey);
    
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(storageKey, userId);
    }
    
    return userId;
  }
  
  const userId = getOrCreateAnonymousUserId();
  
  // Cache for stats to avoid too many requests
  const statsCache = new Map();
  const CACHE_DURATION = 30000; // 30 seconds
  
  // Load stats for a game
  async function loadGameStats(gameSlug) {
    // Check cache
    const cached = statsCache.get(gameSlug);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      const response = await fetch(`/api/interactions/${gameSlug}?user_id=${userId}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // Cache the result
      statsCache.set(gameSlug, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error loading game stats:', error);
      return null;
    }
  }
  
  // Update stats display for a game card
  function updateGameStatsDisplay(gameSlug, stats) {
    if (!stats) return;
    
    const statsElement = document.querySelector(`[data-game-stats="${gameSlug}"]`);
    if (!statsElement) return;
    
    const wishlistCountEl = statsElement.querySelector('[data-wishlist-count] [data-count]');
    
    if (wishlistCountEl) {
      wishlistCountEl.textContent = stats.wishlist_count || 0;
    }
    
    // Update wishlisted state for card highlighting
    const gameCard = document.querySelector(`[data-game-slug="${gameSlug}"]`);
    if (gameCard && stats.user_has_wishlisted) {
      gameCard.setAttribute('data-wishlisted', 'true');
    } else if (gameCard) {
      gameCard.setAttribute('data-wishlisted', 'false');
    }
  }
  
  // Load and display stats for all games on the page
  async function loadAllGameStats() {
    const gameStatsElements = document.querySelectorAll('[data-game-stats]');
    
    if (gameStatsElements.length === 0) return;
    
    const gameSlugs = Array.from(gameStatsElements).map(el => 
      el.getAttribute('data-game-stats')
    );
    
    // Load stats for all games (with batching to avoid too many requests)
    const batchSize = 5;
    for (let i = 0; i < gameSlugs.length; i += batchSize) {
      const batch = gameSlugs.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (slug) => {
          const stats = await loadGameStats(slug);
          if (stats) {
            updateGameStatsDisplay(slug, stats);
          }
        })
      );
      
      // Small delay between batches
      if (i + batchSize < gameSlugs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  // Toggle wishlist interaction
  async function toggleWishlist(gameSlug) {
    try {
      // Get current stats
      const currentStats = await loadGameStats(gameSlug);
      const isActive = currentStats?.user_has_wishlisted || false;
      
      const method = isActive ? 'DELETE' : 'POST';
      const url = isActive 
        ? `/api/interactions/${gameSlug}?user_id=${userId}`
        : `/api/interactions/${gameSlug}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({
          user_id: userId,
        }) : undefined,
      });
      
      if (!response.ok) {
        console.error('Failed to toggle wishlist');
        return;
      }
      
      // Clear cache and reload stats
      statsCache.delete(gameSlug);
      const newStats = await loadGameStats(gameSlug);
      if (newStats) {
        updateGameStatsDisplay(gameSlug, newStats);
      }
      
      return newStats;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  }
  
  // Load rankings for sorting
  async function loadRankings(sortBy = 'wishlist_count') {
    try {
      const response = await fetch(`/api/rankings?sort=${sortBy}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.rankings || [];
    } catch (error) {
      console.error('Error loading rankings:', error);
      return null;
    }
  }
  
  // Sort games by rankings
  async function sortGamesByRankings(sortBy) {
    const rankings = await loadRankings(sortBy);
    if (!rankings || rankings.length === 0) return;
    
    const gamesContainer = document.getElementById('games-container');
    if (!gamesContainer) return;
    
    // Create a map of slug to ranking
    const rankingMap = new Map();
    rankings.forEach(r => {
      rankingMap.set(r.game_slug, r);
    });
    
    // Get all game cards
    const gameCards = Array.from(gamesContainer.querySelectorAll('[data-game-slug]'));
    
    // Sort by ranking
    gameCards.sort((a, b) => {
      const slugA = a.getAttribute('data-game-slug');
      const slugB = b.getAttribute('data-game-slug');
      
      const rankA = rankingMap.get(slugA);
      const rankB = rankingMap.get(slugB);
      
      const countA = rankA?.wishlist_count || 0;
      const countB = rankB?.wishlist_count || 0;
      
      return countB - countA; // Descending order
    });
    
    // Re-append in sorted order
    gameCards.forEach(card => gamesContainer.appendChild(card));
  }
  
  // Initialize
  function init() {
    console.log('=== INITIALIZING SOCIAL FEATURES ===');
    
    // Load stats for all games
    loadAllGameStats();
    
    // Set up sort buttons
    const sortButtons = document.querySelectorAll('[data-sort]');
    sortButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const sortBy = btn.getAttribute('data-sort');
        
        // Update button states
        sortButtons.forEach(b => {
          b.classList.remove('text-neon-cyan', 'bg-neon-cyan/10');
          b.classList.add('text-text-secondary');
        });
        btn.classList.add('text-neon-cyan', 'bg-neon-cyan/10');
        btn.classList.remove('text-text-secondary');
        
        if (sortBy === 'release') {
          // Sort by release date (default) - would need to reload page or have release date data
          // For now, just reset to original order
          location.reload();
        } else if (sortBy === 'wishlist') {
          await sortGamesByRankings('wishlist_count');
        }
      });
    });
  }
  
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 100);
    });
  } else {
    setTimeout(init, 100);
  }
  
  // Re-initialize on Astro page load
  document.addEventListener('astro:page-load', function() {
    console.log('Astro page loaded, re-initializing social features...');
    setTimeout(init, 50);
  });
  
  // Export functions for use in other scripts
  window.dropTimerSocial = {
    toggleWishlist,
    loadGameStats,
    updateGameStatsDisplay,
  };
})();
