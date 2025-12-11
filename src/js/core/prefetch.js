// Hover-based link prefetching for improved navigation

import { Logger } from './utils.js';
import { ROUTES } from './constants.js';

const prefetched = new Set();

/**
 * Prefetches a URL by creating a link element
 * @param {string} url - URL to prefetch
 */
function prefetch(url) {
    // Resolve clean URL to real path for prefetching
    const realUrl = ROUTES[url] || url;
    
    if (prefetched.has(realUrl)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = realUrl;
    link.as = 'document';
    document.head.appendChild(link);
    prefetched.add(realUrl);
    Logger.log('Prefetch', `Queued: ${realUrl}`);
}

/** Sets up hover-based prefetching for marked links */
export function initPrefetch() {
    const links = document.querySelectorAll('[data-prefetch="hover"]');
    
    links.forEach(link => {
        let timeoutId = null;
        
        link.addEventListener('mouseenter', () => {
            timeoutId = setTimeout(() => {
                // Use pathname to match clean routes
                try {
                    const path = new URL(link.href).pathname;
                    prefetch(path);
                } catch (e) {
                    Logger.warn('Prefetch', `Invalid URL: ${link.href}`);
                }
            }, 100);
        }, { passive: true });
        
        link.addEventListener('mouseleave', () => {
            if (timeoutId) clearTimeout(timeoutId);
        }, { passive: true });
        
        // Touch devices: prefetch on first touch
        link.addEventListener('touchstart', () => {
            try {
                const path = new URL(link.href).pathname;
                prefetch(path);
            } catch (e) {
                Logger.warn('Prefetch', `Invalid URL: ${link.href}`);
            }
        }, { passive: true, once: true });
    });
    
    Logger.log('Prefetch', `Initialized for ${links.length} links`);
}
