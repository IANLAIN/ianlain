/**
 * DOM Manager
 * Centralized DOM element references for better performance
 * Elements are cached to avoid repeated DOM queries
 */

import { SELECTORS } from './constants.js';
import { $, $$, Logger } from './utils.js';

/**
 * DOM element cache
 * Provides lazy-loaded, cached references to DOM elements
 */
class DOMManager {
    constructor() {
        this._cache = new Map();
        this._initialized = false;
    }
    
    /**
     * Initialize DOM references
     * Should be called after DOMContentLoaded
     */
    init() {
        if (this._initialized) return;
        
        // Clear cache for fresh initialization
        this._cache.clear();
        
        // Cache commonly used elements
        this._cacheElements();
        
        this._initialized = true;
        Logger.log('DOM', 'Initialized');
    }
    
    /**
     * Cache DOM elements
     * @private
     */
    _cacheElements() {
        // Navigation elements
        this._cache.set('navbar', $(SELECTORS.navbar));
        this._cache.set('hamburger', $(SELECTORS.hamburger));
        this._cache.set('navMenu', $(SELECTORS.navMenu));
        this._cache.set('navLinks', $$(SELECTORS.navLinks));
        this._cache.set('logo', $(SELECTORS.logo));
        
        // Language elements
        this._cache.set('langButtons', $$(SELECTORS.langButtons));
        
        // Hero elements
        this._cache.set('heroContent', $(SELECTORS.heroContent));
        this._cache.set('profileImage', $(SELECTORS.profileImage));
        this._cache.set('profileWrapper', $(SELECTORS.profileWrapper));
        this._cache.set('hypercubeCanvas', $(SELECTORS.hypercubeCanvas));
        
        // Content elements
        this._cache.set('sections', $$(SELECTORS.sections));
        this._cache.set('interestCards', $$(SELECTORS.interestCards));
        this._cache.set('socialLinks', $$(SELECTORS.socialLinks));
    }
    
    /**
     * Get cached element
     * @param {string} key - Cache key
     * @returns {Element|NodeList|null}
     */
    get(key) {
        return this._cache.get(key) || null;
    }
    
    /**
     * Get element by selector (with caching)
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
     * Get all elements by selector (with caching)
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
    
    /**
     * Refresh specific cache entry
     * @param {string} key - Cache key
     * @param {string} selector - CSS selector
     */
    refresh(key, selector) {
        this._cache.set(key, $(selector));
    }
    
    /**
     * Clear all cached elements
     */
    clear() {
        this._cache.clear();
        this._initialized = false;
    }
    
    // Convenience getters for common elements
    get navbar() { return this.get('navbar'); }
    get hamburger() { return this.get('hamburger'); }
    get navMenu() { return this.get('navMenu'); }
    get navLinks() { return this.get('navLinks'); }
    get logo() { return this.get('logo'); }
    get langButtons() { return this.get('langButtons'); }
    get heroContent() { return this.get('heroContent'); }
    get profileImage() { return this.get('profileImage'); }
    get interestCards() { return this.get('interestCards'); }
    get sections() { return this.get('sections'); }
}

// Export singleton instance
export const DOM = new DOMManager();
