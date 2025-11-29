// Service Worker - Cache de recursos para PWA

const CACHE_NAME = 'ianlain-v1';
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
    '/src/css/sections/_hero.css',
    '/src/css/sections/_sections.css',
    '/src/css/utilities/_animations.css',
    '/src/css/utilities/_backgrounds.css',
    '/src/js/main.js',
    '/src/js/core/constants.js',
    '/src/js/core/dom.js',
    '/src/js/core/utils.js',
    '/src/js/components/navigation.js',
    '/src/js/components/animations.js',
    '/src/js/components/effects.js',
    '/src/js/features/hypercube.js',
    '/src/js/features/cosmic.js',
    '/src/js/features/spaceships.js',
    '/src/js/i18n/i18n.js',
    '/src/js/i18n/translations.js',
    '/images/favicon.svg',
    '/images/favicon-32.png',
    '/images/favicon-192.png',
    '/images/profile.jpg',
    '/manifest.json'
];

// Instalar y cachear recursos
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activar y limpiar caches antiguos
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

// Estrategia: Cache first, network fallback
self.addEventListener('fetch', (e) => {
    // Solo cachear requests GET
    if (e.request.method !== 'GET') return;
    
    // Ignorar requests externos (fonts, CDN)
    if (!e.request.url.startsWith(self.location.origin)) return;
    
    e.respondWith(
        caches.match(e.request).then((cached) => {
            if (cached) return cached;
            
            return fetch(e.request).then((response) => {
                // No cachear respuestas no válidas
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
