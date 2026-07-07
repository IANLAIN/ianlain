// DOM element cache for optimized queries

import { SELECTORS } from './constants.js';
import { $, $$, Logger } from './utils.js';

/** Singleton DOM cache manager */
class DOMManager {
    constructor() {
        this._cache = new Map();
        this._initialized = false;
    }
    
    /** Initializes DOM element cache */
    init() {
        if (this._initialized) return;
        this._cache.clear();
        this._cacheElements();
        this._initialized = true;
        Logger.log('DOM', 'Initialized');
    }
    
    /** Caches commonly used elements */
    _cacheElements() {
        this._cache.set('navbar', $(SELECTORS.navbar));
        this._cache.set('logo', $(SELECTORS.logo));
        this._cache.set('langButtons', $$(SELECTORS.langButtons));
        this._cache.set('profileImage', $(SELECTORS.profileImage));
        this._cache.set('gameModal', $(SELECTORS.gameModal));
        this._cache.set('gameModalClose', $$(SELECTORS.gameModalClose));
        this._cache.set('gameOpenButtons', $$(SELECTORS.gameOpenButtons));
        this._cache.set('gameModalLink', $(SELECTORS.gameModalLink));
    }
    
    /**
     * Gets cached element by key
     * @param {string} key - Cache key
     * @returns {Element|null}
     */
    get(key) {
        return this._cache.get(key) || null;
    }
    
    /**
     * Queries and caches single element
     * @param {string} selector - CSS selector
     * @returns {Element|null}
     */
    query(selector) {
        if (!this._cache.has(selector)) {
            this._cache.set(selector, $(selector));
        }
        return this._cache.get(selector);
    }
    
    /**
     * Queries and caches multiple elements
     * @param {string} selector - CSS selector
     * @returns {NodeList}
     */
    queryAll(selector) {
        const cacheKey = `all:${selector}`;
        if (!this._cache.has(cacheKey)) {
            this._cache.set(cacheKey, $$(selector));
        }
        return this._cache.get(cacheKey);
    }
    
    /** Refreshes a cache entry */
    refresh(key, selector) {
        this._cache.set(key, $(selector));
    }
    
    /** Clears all cached elements */
    clear() {
        this._cache.clear();
        this._initialized = false;
    }
    
    /**
     * Checks if an element exists in the DOM
     * @param {string} selector - CSS selector
     * @returns {boolean}
     */
    exists(selector) {
        return !!$(selector);
    }

    /**
     * Removes an element from the DOM
     * @param {string} selector - CSS selector
     */
    remove(selector) {
        const element = $(selector);
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
            // Remove from cache if present
            this._cache.forEach((value, key) => {
                if (value === element) {
                    this._cache.delete(key);
                }
            });
        }
    }

    // Convenience getters
    get navbar() { return this.get('navbar'); }
    get logo() { return this.get('logo'); }
    get langButtons() { return this.get('langButtons'); }
    get profileImage() { return this.get('profileImage'); }
    get gameModal() { return this.get('gameModal'); }
    get gameModalClose() { return this.get('gameModalClose'); }
    get gameOpenButtons() { return this.get('gameOpenButtons'); }
    get gameModalLink() { return this.get('gameModalLink'); }
}

export const DOM = new DOMManager();
