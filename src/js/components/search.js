// Web search overlay with DuckDuckGo

import { $, Logger } from '../core/utils.js';
import { CLASSES } from '../core/constants.js';

/** Search overlay controller */
class SearchController {
    constructor() {
        this._overlay = null;
        this._input = null;
        this._toggle = null;
        this._close = null;
        this._initialized = false;
    }

    /** Initialize search functionality */
    init() {
        if (this._initialized) return;
        
        this._cacheElements();
        if (!this._overlay || !this._toggle) return;
        
        this._bindEvents();
        this._initialized = true;
        Logger.log('Search', 'Initialized');
    }

    /** Cache DOM elements */
    _cacheElements() {
        this._overlay = $('#searchOverlay');
        this._input = $('#searchInput');
        this._toggle = $('#searchToggle');
        this._close = $('#searchClose');
    }

    /** Bind event listeners */
    _bindEvents() {
        // Toggle button
        this._toggle.addEventListener('click', () => this.open());
        
        // Close button
        this._close?.addEventListener('click', () => this.close());
        
        // Close on overlay click (outside search box)
        this._overlay.addEventListener('click', (e) => {
            if (e.target === this._overlay) this.close();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this._handleKeydown(e));
    }

    /** Handle keyboard events */
    _handleKeydown(e) {
        // Ctrl/Cmd + K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.toggle();
        }
        
        // Escape to close
        if (e.key === 'Escape' && this._isOpen()) {
            this.close();
        }
    }

    /** Open search overlay */
    open() {
        this._overlay.classList.add(CLASSES.active);
        document.body.style.overflow = 'hidden';
        this._overlay.setAttribute('aria-hidden', 'false');
        this._toggle.setAttribute('aria-expanded', 'true');
        
        // Focus input after animation
        setTimeout(() => this._input?.focus(), 100);
        Logger.log('Search', 'Opened');
    }

    /** Close search overlay */
    close() {
        this._overlay.classList.remove(CLASSES.active);
        document.body.style.overflow = '';
        this._overlay.setAttribute('aria-hidden', 'true');
        this._toggle.setAttribute('aria-expanded', 'false');
        
        // Return focus to toggle button
        this._toggle.focus();
        
        // Clear input
        if (this._input) this._input.value = '';
        Logger.log('Search', 'Closed');
    }

    /** Toggle search overlay */
    toggle() {
        this._isOpen() ? this.close() : this.open();
    }

    /** Check if overlay is open */
    _isOpen() {
        return this._overlay?.classList.contains(CLASSES.active);
    }
}

/** Singleton instance */
export const Search = new SearchController();

/** Initialize search */
export function initSearch() {
    Search.init();
}
