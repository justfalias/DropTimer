// Countdown timer functionality
(function() {
  'use strict';
  
  console.log('=== COUNTDOWN TIMER SCRIPT LOADED ===');
  
  // Store initialized timers
  const initializedTimers = new WeakSet();
  
  function initCountdownTimer(element) {
    // Skip if already initialized
    if (initializedTimers.has(element)) {
      return;
    }
    initializedTimers.add(element);
    
    const releaseDateAttr = element.getAttribute('data-release-date');
    if (!releaseDateAttr) {
      console.warn('No release date found for timer');
      return;
    }
    
    const daysEl = element.querySelector('[data-days]');
    const hoursEl = element.querySelector('[data-hours]');
    const minutesEl = element.querySelector('[data-minutes]');
    const secondsEl = element.querySelector('[data-seconds]');
    const timerContainer = element.querySelector('[data-timer-container]');
    const expiredEl = element.querySelector('[data-expired]');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
      console.warn('Timer elements not found', { daysEl, hoursEl, minutesEl, secondsEl });
      return;
    }

    let targetDate = new Date(releaseDateAttr).getTime();
    let intervalId = null;

    function updateTimer() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        if (expiredEl) expiredEl.style.display = 'block';
        if (timerContainer) timerContainer.style.display = 'none';
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }

      if (expiredEl) expiredEl.style.display = 'none';
      if (timerContainer) timerContainer.style.display = '';

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    function startTimer() {
      if (intervalId) {
        clearInterval(intervalId);
      }
      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
      console.log('Timer started for:', releaseDateAttr);
    }

    startTimer();
    
    // Listen for platform changes
    const updateHandler = function(e) {
      if (e.detail && e.detail.releaseDate) {
        targetDate = new Date(e.detail.releaseDate).getTime();
        startTimer();
      }
    };
    
    window.addEventListener('updateTimer', updateHandler);
  }
  
  function initAllTimers() {
    const timerElements = document.querySelectorAll('.countdown-timer');
    console.log('Found timer elements:', timerElements.length);
    
    if (timerElements.length === 0) {
      return;
    }
    
    timerElements.forEach((element) => {
      initCountdownTimer(element);
    });
  }
  
  function waitForTimers(callback, maxAttempts = 20) {
    let attempts = 0;
    const check = setInterval(function() {
      attempts++;
      const timerElements = document.querySelectorAll('.countdown-timer');
      if (timerElements.length > 0) {
        clearInterval(check);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(check);
        console.warn('No timer elements found after', maxAttempts, 'attempts');
      }
    }, 100);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      waitForTimers(initAllTimers);
    });
  } else {
    waitForTimers(initAllTimers);
  }
  
  // Re-initialize on Astro page load (for View Transitions)
  document.addEventListener('astro:page-load', function() {
    console.log('Astro page loaded, re-initializing timers...');
    setTimeout(function() {
      waitForTimers(initAllTimers);
    }, 50);
  });
})();

