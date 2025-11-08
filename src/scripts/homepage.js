// Homepage functionality
(function() {
  'use strict';
  
  console.log('=== HOMEPAGE SCRIPT LOADED ===');
  
  // Get games data from script tag
  let gamesForAutocomplete = [];
  try {
    const dataScript = document.getElementById('games-json-data');
    if (dataScript) {
      const data = JSON.parse(dataScript.textContent);
      gamesForAutocomplete = data.gamesData || [];
      console.log('Games loaded for autocomplete:', gamesForAutocomplete.length);
    }
  } catch (e) {
    console.error('Error loading games data:', e);
  }

  // Wait for DOM
  function waitForElement(selector, callback, maxAttempts = 50) {
    let attempts = 0;
    const check = setInterval(function() {
      attempts++;
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(check);
        callback(element);
      } else if (attempts >= maxAttempts) {
        clearInterval(check);
        console.error('Element not found:', selector);
      }
    }, 100);
  }

  // Initialize search
  function initSearch() {
    const searchInput = document.getElementById('main-search-input');
    const clearBtn = document.getElementById('main-clear-search');
    const gridView = document.getElementById('games-grid');
    const listView = document.getElementById('games-list');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-number');
    
    if (!searchInput || !clearBtn || !gridView || !listView || !emptyState || !resultsCount) {
      console.error('Missing search elements');
      return;
    }

    function filterGames() {
      const term = searchInput.value.toLowerCase().trim();
      const gridItems = gridView.querySelectorAll('[data-game-name]');
      const listItems = listView.querySelectorAll('[data-game-name]');
      let count = 0;

      gridItems.forEach(function(item) {
        const name = item.getAttribute('data-game-name') || '';
        if (name.includes(term)) {
          item.style.display = '';
          count++;
        } else {
          item.style.display = 'none';
        }
      });

      listItems.forEach(function(item) {
        const name = item.getAttribute('data-game-name') || '';
        if (name.includes(term)) {
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

    window.filterGames = filterGames;
    
    searchInput.addEventListener('input', filterGames);
    
    clearBtn.addEventListener('click', function(e) {
      e.preventDefault();
      searchInput.value = '';
      filterGames();
      searchInput.focus();
    });
    
    filterGames();
    console.log('Search initialized');
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
        item.className = 'px-4 py-3 cursor-pointer hover:bg-dark-card-hover transition-colors';
        item.innerHTML = '<div class="font-medium text-text-primary">' + game.name + '</div><div class="text-sm text-text-secondary">' + game.platforms.join(', ') + '</div>';
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
    
    searchInput.addEventListener('input', function() {
      const term = searchInput.value.toLowerCase().trim();
      
      if (window.filterGames) {
        window.filterGames();
      }
      
      if (term.length >= 2 && gamesForAutocomplete.length > 0) {
        const matches = gamesForAutocomplete.filter(function(game) {
          return game.name.toLowerCase().includes(term);
        });
        selectedIndex = -1;
        showAutocomplete(matches);
      } else {
        dropdown.classList.add('hidden');
      }
    });
    
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
    initSearch();
    initViewToggle();
    initAutocomplete();
    console.log('=== INITIALIZATION COMPLETE ===');
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 100);
    });
  } else {
    setTimeout(init, 100);
  }

  // Re-initialize on Astro page load
  document.addEventListener('astro:page-load', function() {
    console.log('Astro page loaded, re-initializing...');
    setTimeout(init, 50);
  });
})();

