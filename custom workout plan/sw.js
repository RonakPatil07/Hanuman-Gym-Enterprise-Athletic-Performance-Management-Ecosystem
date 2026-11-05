/**
 * ==============================================================================
 * HANUMAN GYM — SERVICE WORKER (NETWORK-FIRST WITH OFFLINE FALLBACK)
 * Ensures fresh code is always loaded on navigation while preserving offline PWA support
 * ==============================================================================
 */

const CACHE_NAME = 'fitphysique-workout-cache-v5';

const ASSETS_TO_CACHE = [
  './workout-plan.html',
  './workout-plan.css',
  './workout-plan.js',
  './manifest.json',
  '../shared/site-header.css',
  '../shared/site-header.js',
  '../shared/site-footer.css',
  '../shared/site-footer.js',
  './js/ui/personalized-blueprint.js',
  './js/engine/canonical-profile.js',
  './js/engine/exercise-database.js',
  './js/engine/training-rules.js',
  './js/engine/intensity-rules.js',
  './js/engine/progression-rules.js',
  './js/engine/workout-logger.js',
  './js/engine/performance-analysis.js',
  './js/engine/adaptive-training.js',
  './js/engine/weekly-analytics.js',
  './js/engine/exercise-substitution.js',
  './js/engine/periodization-engine.js',
  './js/engine/personalization-explanations.js',
  './js/engine/program-generator.js',
  './js/engine/program-validator.js',
  './js/engine/muscle-anatomy.js',
  './js/engine/form-guides.js',
  './js/engine/voice-coach.js',
  './js/engine/social-export.js',
  './js/engine/user-profile-bridge.js',
  './js/engine/mesocycle-scrubber.js',
  './js/engine/calendar-sync.js',
  './js/engine/emg-substitution.js',
  './js/engine/gym-focus-hud.js',
  './js/engine/auto-1rm-engine.js',
  './js/engine/superset-engine.js',
  './js/engine/pwa-installer.js'
];

// Install Event: pre-cache assets and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('SW pre-cache warning:', err);
      });
    })
  );
});

// Activate Event: immediately purge all old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('SW purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First Strategy with Cache Fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If network response is valid, update the cache in background
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline) -> serve from cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./workout-plan.html');
          }
          return new Response('Offline content unavailable', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
