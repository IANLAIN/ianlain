// Service Worker - PWA resource caching

const CACHE_NAME = 'ianlain-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/main.css',
    '/src/css/base/_reset.css',
    '/src/css/base/_variables.css',
    '/src/css/base/_typography.css',
    '/src/css/layout/_layout.css',
    '/src/css/components/_navbar.css',
    '/src/css/components/_cards.css',
    '/src/css/components/_buttons.css',
    '/src/css/components/_search.css',
    '/src/css/sections/_hero.css',
    '/src/css/sections/_sections.css',
    '/src/css/utilities/_animations.css',
    '/src/css/utilities/_backgrounds.css',
    '/src/js/main.js',
    '/src/js/core/constants.js',
    '/src/js/core/dom.js',
    '/src/js/core/utils.js',
    '/src/js/core/prefetch.js',
    '/src/js/core/router.js',
    '/src/js/core/router-init.js',
    '/src/js/components/navigation.js',
    '/src/js/components/animations.js',
    '/src/js/components/search.js',
    '/src/js/features/hypercube.js',
    '/src/js/features/cosmic.js',
    '/src/js/i18n/i18n.js',
    '/src/js/i18n/translations.js',
    '/src/pages/news/index.html',
    '/src/pages/news/css/news.css',
    '/src/pages/news/js/news.js',
    '/src/assets/images/favicon.svg',
    '/src/assets/images/favicon-32.png',
    '/src/assets/images/favicon-192.png',
    '/src/assets/images/profile.jpg',
    '/src/config/manifest.json'
];

// Install and cache resources
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate and clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => 
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Strategy: Cache first, network fallback
self.addEventListener('fetch', (e) => {
    // Only cache GET requests
    if (e.request.method !== 'GET') return;
    
    // Ignore external requests (fonts, CDN)
    if (!e.request.url.startsWith(self.location.origin)) return;
    
    e.respondWith(
        caches.match(e.request).then((cached) => {
            if (cached) return cached;
            
            return fetch(e.request).then((response) => {
                // Don't cache invalid responses
                if (!response || response.status !== 200) return response;
                
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, clone);
                });
                
                return response;
            });
        })
    );
});
