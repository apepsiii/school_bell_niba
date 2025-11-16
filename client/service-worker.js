/**
 * Service Worker for School Bell Client
 * Handles offline caching and push notifications
 */

const CACHE_NAME = 'school-bell-v1';
const AUDIO_CACHE = 'school-bell-audio-v1';

// Files to cache on install
const STATIC_CACHE = [
    '/player',
    '/client/index.html',
    '/client/player.js',
    '/client/manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css',
    'https://cdn.socket.io/4.5.4/socket.io.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE);
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
                    cacheNames.map(cache => {
                        if (cache !== CACHE_NAME && cache !== AUDIO_CACHE) {
                            console.log('Service Worker: Clearing old cache:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle audio files specially
    if (url.pathname.includes('/api/client/audio/')) {
        event.respondWith(
            caches.open(AUDIO_CACHE)
                .then(cache => {
                    return cache.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('Service Worker: Serving audio from cache:', url.pathname);
                                return cachedResponse;
                            }
                            
                            // Fetch and cache audio
                            return fetch(request)
                                .then(response => {
                                    if (response.status === 200) {
                                        cache.put(request, response.clone());
                                    }
                                    return response;
                                })
                                .catch(err => {
                                    console.error('Service Worker: Audio fetch failed:', err);
                                    return new Response('Audio not available offline', {
                                        status: 503,
                                        statusText: 'Service Unavailable'
                                    });
                                });
                        });
                })
        );
        return;
    }
    
    // Handle API requests - network first, then cache
    if (url.pathname.includes('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Clone and cache successful API responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log('Service Worker: Serving API from cache (offline)');
                                return cachedResponse;
                            }
                            
                            // Return offline response
                            return new Response(JSON.stringify({
                                success: false,
                                error: 'Offline',
                                offline: true
                            }), {
                                headers: { 'Content-Type': 'application/json' }
                            });
                        });
                })
        );
        return;
    }
    
    // Handle other requests - cache first, then network
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache:', url.pathname);
                    return cachedResponse;
                }
                
                return fetch(request)
                    .then(response => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(err => {
                        console.error('Service Worker: Fetch failed:', err);
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/player');
                        }
                        
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Push notification event
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    let data = {};
    if (event.data) {
        data = event.data.json();
    }
    
    const title = data.title || '🔔 Bel Sekolah';
    const options = {
        body: data.body || 'Ada pemberitahuan baru',
        icon: '/static/img/bell-icon.png',
        badge: '/static/img/bell-badge.png',
        vibrate: [200, 100, 200],
        tag: 'school-bell',
        requireInteraction: true,
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/player')
    );
});

// Message event - handle messages from client
self.addEventListener('message', event => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'cacheAudio') {
        const audioUrl = event.data.url;
        caches.open(AUDIO_CACHE)
            .then(cache => {
                return fetch(audioUrl)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(audioUrl, response);
                            console.log('Service Worker: Audio cached:', audioUrl);
                        }
                    });
            })
            .catch(err => {
                console.error('Service Worker: Failed to cache audio:', err);
            });
    }
    
    if (event.data.action === 'clearCache') {
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => caches.delete(cache))
                );
            })
            .then(() => {
                console.log('Service Worker: All caches cleared');
                event.ports[0].postMessage({ success: true });
            });
    }
});

console.log('Service Worker: Script loaded');