// Client-side router - hides real file paths with clean URLs

import { Logger } from './utils.js';
import { ROUTES } from './constants.js';

/** Singleton Router - manages clean URLs and navigation */
class RouterManager {
    constructor() {
        this._initialized = false;
        this._routes = new Map();
        this._reverseRoutes = new Map();
    }

    /** Initializes router with route definitions */
    init() {
        if (this._initialized) return;
        
        this._buildRouteMaps();
        this._restoreCleanUrl();
        this._interceptLinks();
        
        this._initialized = true;
        Logger.log('Router', 'Initialized');
    }

    /** Restores clean URL after redirect (GitHub Pages SPA support) */
    _restoreCleanUrl() {
        const storedRoute = sessionStorage.getItem('spa_route');
        if (storedRoute && this._routes.has(storedRoute)) {
            sessionStorage.removeItem('spa_route');
            window.history.replaceState({}, '', storedRoute);
            Logger.log('Router', `Restored clean URL: ${storedRoute}`);
        }
    }

    /** Builds bidirectional route maps from config */
    _buildRouteMaps() {
        Object.entries(ROUTES).forEach(([cleanPath, realPath]) => {
            this._routes.set(cleanPath, realPath);
            this._reverseRoutes.set(realPath, cleanPath);
        });
    }

    /** Intercepts all internal links to use router */
    _interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Skip external links and anchors
            if (this._isExternalLink(href) || href.startsWith('#')) return;

            // Handle internal navigation
            e.preventDefault();
            this.navigate(href);
        });
    }

    /**
     * Navigates to a path (clean or real)
     * @param {string} path - URL path to navigate to
     */
    navigate(path) {
        const normalizedPath = this._normalizePath(path);
        
        // Check if it's a clean route
        if (this._routes.has(normalizedPath)) {
            sessionStorage.setItem('spa_route', normalizedPath);
            window.location.href = this._routes.get(normalizedPath);
            return;
        }
        
        // Check if it's a real path that should use clean URL
        const cleanPath = this._reverseRoutes.get(normalizedPath);
        if (cleanPath) {
            sessionStorage.setItem('spa_route', cleanPath);
            window.location.href = normalizedPath;
            return;
        }
        
        // Regular internal link - navigate normally
        window.location.href = path;
    }

    /**
     * Gets clean URL for a real path
     * @param {string} realPath - Real file path
     * @returns {string} Clean URL or original path
     */
    getCleanUrl(realPath) {
        const normalized = this._normalizePath(realPath);
        return this._reverseRoutes.get(normalized) || realPath;
    }

    /**
     * Gets real path for a clean URL
     * @param {string} cleanPath - Clean URL
     * @returns {string} Real path or original
     */
    getRealPath(cleanPath) {
        return this._routes.get(cleanPath) || cleanPath;
    }

    /** Normalizes path for consistent comparison */
    _normalizePath(path) {
        try {
            const url = new URL(path, window.location.origin);
            return url.pathname;
        } catch {
            return path;
        }
    }

    /** Checks if link is external */
    _isExternalLink(href) {
        if (!href) return true;
        if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;
        
        try {
            const url = new URL(href, window.location.origin);
            return url.origin !== window.location.origin;
        } catch {
            return false;
        }
    }
}

/** Singleton instance */
export const Router = new RouterManager();

/** Gets clean URL for templates */
export const getCleanUrl = (path) => Router.getCleanUrl(path);
