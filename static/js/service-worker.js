// Service Worker for School Bell PWA
const CACHE_NAME = 'school-bell-v1';
const STATIC_CACHE = 'school-bell-static-v1';
const AUDIO_CACHE = 'school-bell-audio-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/static/css/style.css',
  '/static/js/main.js',
  '/static/js/pwa-scheduler.js',
  '/static/js/pwa-audio.js',
  '/static/js/pwa-ui.js',
  '/templates/pwa.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== AUDIO_CACHE) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle API requests - try network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Handle audio files - cache first strategy
  if (url.pathname.includes('/static/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE)
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              // Return cached audio if available
              if (response) {
                return response;
              }
              
              // Otherwise fetch and cache
              return fetch(event.request)
                .then(response => {
                  if (response.ok) {
                    cache.put(event.request, response.clone());
                  }
                  return response;
                });
            });
        })
    );
    return;
  }
  
  // Handle static files - cache first strategy
  if (STATIC_FILES.includes(url.pathname) || 
      url.pathname.includes('/static/css/') || 
      url.pathname.includes('/static/js/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
    return;
  }
  
  // Default: network first for other requests
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/templates/pwa.html');
        }
      })
  );
});

// Background sync for schedules
self.addEventListener('sync', event => {
  if (event.tag === 'sync-schedules') {
    event.waitUntil(syncSchedules());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Bel akan berbunyi segera',
    icon: '/static/icons/bell-icon-192.png',
    badge: '/static/icons/bell-badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'play',
        title: 'Putar Sekarang',
        icon: '/static/icons/play-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Tutup',
        icon: '/static/icons/close-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('School Bell', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'play') {
    // Open app and trigger play action
    event.waitUntil(
      clients.openWindow('/?action=play')
    );
  } else if (event.action === 'dismiss') {
    // Just close notification
    event.notification.close();
  } else {
    // Default: open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync schedules with server
async function syncSchedules() {
  try {
    const response = await fetch('/api/schedules');
    const schedules = await response.json();
    
    // Store in IndexedDB for offline access
    const db = await openDB();
    const tx = db.transaction(['schedules'], 'readwrite');
    const store = tx.objectStore('schedules');
    
    // Clear existing schedules
    await store.clear();
    
    // Add new schedules
    for (const schedule of schedules) {
      await store.add(schedule);
    }
    
    console.log('Schedules synced successfully');
  } catch (error) {
    console.error('Failed to sync schedules:', error);
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SchoolBellDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('schedules')) {
        const store = db.createObjectStore('schedules', { keyPath: 'id' });
        store.createIndex('day_of_week', 'day_of_week', { unique: false });
        store.createIndex('time', 'time', { unique: false });
      }
    };
  });
}