// Service Worker for GrillMaps PWA
const CACHE_NAME = 'grillmaps-v6.0.0';
const OFFLINE_URL = '/sw/offline.html';

// Resources to cache for offline functionality
const CORE_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/official-grilling-areas.json',
  '/data/locations.json',
  '/data/bbq-areas.json',
  '/sw/offline.html',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/favicon.svg'
];

// Mapbox resources to cache
const MAPBOX_CACHE_RESOURCES = [
  'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js',
  'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css'
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching core resources...');
        return cache.addAll([
          ...CORE_CACHE_RESOURCES,
          ...MAPBOX_CACHE_RESOURCES
        ]);
      })
      .then(() => {
        // Skip waiting to activate new service worker immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  // Handle only GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle navigation requests (for offline page)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately
          return cachedResponse;
        }
        
        // Fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync any pending data when connection is restored
      syncOfflineData()
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/badge-72x72.svg',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Spots',
          icon: '/icons/action-explore.svg'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/action-close.svg'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('GrillMaps Update', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Utility function for background sync
async function syncOfflineData() {
  try {
    // Implement any offline data synchronization here
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}