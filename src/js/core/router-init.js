// Minimal router initialization for sub-pages

/** Route mappings (must match constants.js) */
const ROUTES = {
    '/': '/index.html',
    '/game': '/src/pages/galaga/index.html',
    '/galaga': '/src/pages/galaga/index.html'
};

/** Restores clean URL from session storage */
function restoreCleanUrl() {
    const storedRoute = sessionStorage.getItem('spa_route');
    if (storedRoute && ROUTES[storedRoute]) {
        sessionStorage.removeItem('spa_route');
        window.history.replaceState({}, '', storedRoute);
    }
}

/** Intercepts link clicks for clean navigation */
function interceptLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        
        // Skip external links and anchors
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        
        try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return;
            
            // Build reverse map
            const reverseRoutes = {};
            Object.entries(ROUTES).forEach(([clean, real]) => {
                reverseRoutes[real] = clean;
            });
            
            const path = url.pathname;
            
            // Check if it's a clean route or real path
            if (ROUTES[path]) {
                e.preventDefault();
                sessionStorage.setItem('spa_route', path);
                window.location.href = ROUTES[path];
            } else if (reverseRoutes[path]) {
                e.preventDefault();
                sessionStorage.setItem('spa_route', reverseRoutes[path]);
                window.location.href = path;
            }
        } catch {
            // Let default behavior handle it
        }
    });
}

// Initialize
restoreCleanUrl();
interceptLinks();
