// Homepage functionality
(function() {
  'use strict';
  
  console.log('=== HOMEPAGE SCRIPT LOADED ===');
  
  // Get games data from script tag (reload each time)
  function getGamesData() {
    let gamesForAutocomplete = [];
    try {
      const dataScript = document.getElementById('games-json-data');
      if (dataScript && dataScript.textContent) {
        const data = JSON.parse(dataScript.textContent);
        gamesForAutocomplete = data.gamesData || [];
        console.log('Games loaded for autocomplete:', gamesForAutocomplete.length);
      } else {
        console.warn('Games data script not found or empty');
      }
    } catch (e) {
      console.error('Error loading games data:', e);
    }
    return gamesForAutocomplete;
  }

  // Load wishlist from localStorage
  function loadWishlist() {
    try {
      const wishlist = JSON.parse(localStorage.getItem('droptimer-wishlist') || '[]');
      return new Set(wishlist);
    } catch {
      return new Set();
    }
  }

  // Initialize search and filters
  function initSearch() {
    const searchInput = document.getElementById('main-search-input');
    const clearBtn = document.getElementById('main-clear-search');
    const gridView = document.getElementById('games-grid');
    const listView = document.getElementById('games-list');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-number');
    const filterAllBtn = document.getElementById('filter-all-btn');
    const filterWishlistBtn = document.getElementById('filter-wishlist-btn');
    
    if (!searchInput || !clearBtn || !gridView || !listView || !emptyState || !resultsCount) {
      console.error('Missing search elements');
      return;
    }

    let currentFilter = 'all'; // 'all' or 'wishlist'

    function filterGames() {
      const term = searchInput.value.toLowerCase().trim();
      const wishlist = loadWishlist();
      const gridItems = gridView.querySelectorAll('[data-game-name]');
      const listItems = listView.querySelectorAll('[data-game-name]');
      let count = 0;

      gridItems.forEach(function(item) {
        const name = item.getAttribute('data-game-name') || '';
        const slug = item.getAttribute('data-game-slug') || '';
        const matchesSearch = name.includes(term);
        const matchesFilter = currentFilter === 'all' || wishlist.has(slug);
        
        if (matchesSearch && matchesFilter) {
          item.style.display = '';
          count++;
        } else {
          item.style.display = 'none';
        }
      });

      listItems.forEach(function(item) {
        const name = item.getAttribute('data-game-name') || '';
        const slug = item.getAttribute('data-game-slug') || '';
        const matchesSearch = name.includes(term);
        const matchesFilter = currentFilter === 'all' || wishlist.has(slug);
        
        if (matchesSearch && matchesFilter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      resultsCount.textContent = count;
      
      if (count === 0) {
        emptyState.classList.remove('hidden');
        gridView.classList.add('hidden');
        listView.classList.add('hidden');
      } else {
        emptyState.classList.add('hidden');
      }

      clearBtn.classList.toggle('hidden', term === '');
    }

    // Filter button handlers
    if (filterAllBtn && filterWishlistBtn) {
      filterAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentFilter = 'all';
        filterAllBtn.classList.add('text-neon-cyan', 'bg-neon-cyan/10');
        filterAllBtn.classList.remove('text-text-secondary');
        filterWishlistBtn.classList.remove('text-neon-cyan', 'bg-neon-cyan/10');
        filterWishlistBtn.classList.add('text-text-secondary');
        filterGames();
      });

      filterWishlistBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentFilter = 'wishlist';
        filterWishlistBtn.classList.add('text-neon-cyan', 'bg-neon-cyan/10');
        filterWishlistBtn.classList.remove('text-text-secondary');
        filterAllBtn.classList.remove('text-neon-cyan', 'bg-neon-cyan/10');
        filterAllBtn.classList.add('text-text-secondary');
        filterGames();
      });
    }

    window.filterGames = filterGames;
    
    searchInput.addEventListener('input', filterGames);
    
    clearBtn.addEventListener('click', function(e) {
      e.preventDefault();
      searchInput.value = '';
      filterGames();
      searchInput.focus();
    });

    // Listen for wishlist changes
    window.addEventListener('storage', function() {
      filterGames();
    });
    
    filterGames();
    console.log('Search and filters initialized');
  }

  // Initialize view toggle
  function initViewToggle() {
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    const gridView = document.getElementById('games-grid');
    const listView = document.getElementById('games-list');
    
    if (!gridBtn || !listBtn || !gridView || !listView) {
      console.error('Missing view toggle elements');
      return;
    }

    function setView(view) {
      if (view === 'grid') {
        gridView.classList.remove('hidden');
        listView.classList.add('hidden');
        // Active state for grid button
        gridBtn.classList.add('bg-neon-cyan/20', 'text-neon-cyan');
        gridBtn.classList.remove('text-text-secondary', 'hover:bg-dark-card-hover');
        // Inactive state for list button
        listBtn.classList.remove('bg-neon-cyan/20', 'text-neon-cyan');
        listBtn.classList.add('text-text-secondary', 'hover:bg-dark-card-hover');
      } else {
        gridView.classList.add('hidden');
        listView.classList.remove('hidden');
        // Active state for list button
        listBtn.classList.add('bg-neon-cyan/20', 'text-neon-cyan');
        listBtn.classList.remove('text-text-secondary', 'hover:bg-dark-card-hover');
        // Inactive state for grid button
        gridBtn.classList.remove('bg-neon-cyan/20', 'text-neon-cyan');
        gridBtn.classList.add('text-text-secondary', 'hover:bg-dark-card-hover');
      }
      localStorage.setItem('droptimer-view', view);
    }

    setView(localStorage.getItem('droptimer-view') || 'grid');
    
    gridBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      setView('grid');
    });
    
    listBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      setView('list');
    });
    
    console.log('View toggle initialized');
  }

  // Initialize autocomplete
  function initAutocomplete() {
    const searchInput = document.getElementById('main-search-input');
    const dropdown = document.getElementById('autocomplete-dropdown');
    
    if (!searchInput || !dropdown) {
      console.error('Missing autocomplete elements');
      return;
    }
    
    let selectedIndex = -1;
    let filteredGames = [];
    
    function showAutocomplete(matches) {
      filteredGames = matches;
      if (matches.length === 0 || searchInput.value.trim() === '') {
        dropdown.classList.add('hidden');
        return;
      }
      
      dropdown.innerHTML = '';
      matches.slice(0, 5).forEach(function(game) {
        const item = document.createElement('div');
        item.className = 'px-4 py-3 cursor-pointer hover:bg-dark-card-hover transition-colors flex items-center gap-3 text-left';
        
        // Get image path - handle both local paths and full URLs
        const imagePath = game.image || '';
        let imageUrl = '';
        if (imagePath.startsWith('http')) {
          imageUrl = imagePath;
        } else if (imagePath.startsWith('/')) {
          imageUrl = imagePath;
        } else {
          imageUrl = '/images/games/' + game.slug + '.jpg';
        }
        
        // Create image element with proper fallback - fixed 48x48px
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = game.name;
        img.className = 'flex-shrink-0 rounded';
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.minWidth = '48px';
        img.style.minHeight = '48px';
        img.style.maxWidth = '48px';
        img.style.maxHeight = '48px';
        img.style.objectFit = 'cover';
        
        // Fallback div - fixed 48x48px
        const fallback = document.createElement('div');
        fallback.className = 'flex-shrink-0 rounded flex items-center justify-center bg-dark-card-hover';
        fallback.style.display = 'none';
        fallback.style.width = '48px';
        fallback.style.height = '48px';
        fallback.style.minWidth = '48px';
        fallback.style.minHeight = '48px';
        fallback.style.maxWidth = '48px';
        fallback.style.maxHeight = '48px';
        fallback.innerHTML = '<svg class="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
        
        img.onerror = function() {
          img.style.display = 'none';
          fallback.style.display = 'flex';
        };
        
        // Platform logos mapping - using official logo images
        const platformLogos = {
          'PC': '<img src="/images/platforms/pc.svg" alt="PC" class="w-3 h-3" />',
          'PlayStation': '<img src="/images/platforms/playstation.svg" alt="PlayStation" class="w-3 h-3" />',
          'Xbox': '<img src="/images/platforms/xbox.svg" alt="Xbox" class="w-3 h-3" />',
          'Switch': '<img src="/images/platforms/switch.svg" alt="Nintendo Switch" class="w-3 h-3" />',
          'Steam': '<img src="/images/platforms/steam.svg" alt="Steam" class="w-3 h-3" />'
        };
        
        const platformColors = {
          'PC': 'bg-blue-600',
          'PlayStation': 'bg-blue-500',
          'Xbox': 'bg-green-500',
          'Switch': 'bg-red-500',
          'Steam': 'bg-slate-700'
        };
        
        // Create platform badges HTML
        const platformBadges = game.platforms.map(function(platform) {
          const logo = platformLogos[platform] || '';
          const color = platformColors[platform] || 'bg-gray-600';
          return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ' + color + ' text-white">' + logo + '<span class="text-[10px]">' + platform + '</span></span>';
        }).join('');
        
        // Text content - name and platforms on same line
        const textDiv = document.createElement('div');
        textDiv.className = 'flex-1 min-w-0';
        textDiv.innerHTML = '<div class="flex items-center gap-2 flex-wrap"><span class="font-semibold text-base text-text-primary text-left">' + game.name + '</span><div class="flex items-center gap-1.5 flex-wrap">' + platformBadges + '</div></div>';
        
        // Append all elements
        item.appendChild(img);
        item.appendChild(fallback);
        item.appendChild(textDiv);
        
        item.addEventListener('click', function() {
          searchInput.value = game.name;
          dropdown.classList.add('hidden');
          if (window.filterGames) {
            window.filterGames();
          }
        });
        dropdown.appendChild(item);
      });
      
      dropdown.classList.remove('hidden');
    }
    
    // Add autocomplete listener (search already has input listener)
    const autocompleteHandler = function() {
      const term = searchInput.value.toLowerCase().trim();
      const gamesForAutocomplete = getGamesData();
      
      if (term.length >= 2 && gamesForAutocomplete.length > 0) {
        const matches = gamesForAutocomplete.filter(function(game) {
          return game.name.toLowerCase().includes(term);
        });
        selectedIndex = -1;
        showAutocomplete(matches);
      } else {
        dropdown.classList.add('hidden');
      }
    };
    
    searchInput.addEventListener('input', autocompleteHandler);
    
    searchInput.addEventListener('keydown', function(e) {
      if (!dropdown.classList.contains('hidden') && filteredGames.length > 0) {
        const items = dropdown.querySelectorAll('div');
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
          items.forEach(function(item, i) {
            item.classList.toggle('bg-dark-card-hover', i === selectedIndex);
          });
          if (items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          items.forEach(function(item, i) {
            item.classList.toggle('bg-dark-card-hover', i === selectedIndex);
          });
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          const selectedGame = filteredGames[selectedIndex];
          if (selectedGame) {
            searchInput.value = selectedGame.name;
            dropdown.classList.add('hidden');
            if (window.filterGames) {
              window.filterGames();
            }
          }
        } else if (e.key === 'Escape') {
          dropdown.classList.add('hidden');
        }
      }
    });
    
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
    
    console.log('Autocomplete initialized');
  }

  // Initialize everything
  function init() {
    console.log('=== INITIALIZING HOMEPAGE ===');
    
    // Wait for all elements to be available
    const requiredElements = [
      'main-search-input',
      'view-grid-btn',
      'games-grid',
      'games-json-data'
    ];
    
    let allReady = true;
    for (let i = 0; i < requiredElements.length; i++) {
      if (!document.getElementById(requiredElements[i])) {
        allReady = false;
        break;
      }
    }
    
    if (!allReady) {
      console.log('Elements not ready, retrying...');
      setTimeout(init, 100);
      return;
    }
    
    initSearch();
    initViewToggle();
    initAutocomplete();
    console.log('=== INITIALIZATION COMPLETE ===');
  }

  // Start initialization
  function startInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(init, 200);
      });
    } else {
      setTimeout(init, 200);
    }
  }

  startInit();

  // Re-initialize on Astro page load
  document.addEventListener('astro:page-load', function() {
    console.log('Astro page loaded, re-initializing...');
    setTimeout(init, 100);
  });
})();

