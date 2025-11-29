// Gestor de caché DOM para mejor rendimiento

import { SELECTORS } from './constants.js';
import { $, $$, Logger } from './utils.js';

class DOMManager {
    constructor() {
        this._cache = new Map();
        this._initialized = false;
    }
    
    // Inicializar referencias DOM
    init() {
        if (this._initialized) return;
        this._cache.clear();
        this._cacheElements();
        this._initialized = true;
        Logger.log('DOM', 'Initialized');
    }
    
    // Cachear elementos comunes
    _cacheElements() {
        this._cache.set('navbar', $(SELECTORS.navbar));
        this._cache.set('hamburger', $(SELECTORS.hamburger));
        this._cache.set('navMenu', $(SELECTORS.navMenu));
        this._cache.set('navLinks', $$(SELECTORS.navLinks));
        this._cache.set('logo', $(SELECTORS.logo));
        this._cache.set('langButtons', $$(SELECTORS.langButtons));
        this._cache.set('heroContent', $(SELECTORS.heroContent));
        this._cache.set('profileImage', $(SELECTORS.profileImage));
        this._cache.set('profileWrapper', $(SELECTORS.profileWrapper));
        this._cache.set('hypercubeCanvas', $(SELECTORS.hypercubeCanvas));
        this._cache.set('sections', $$(SELECTORS.sections));
        this._cache.set('interestCards', $$(SELECTORS.interestCards));
        this._cache.set('socialLinks', $$(SELECTORS.socialLinks));
    }
    
    // Obtener elemento cacheado
    get(key) {
        return this._cache.get(key) || null;
    }
    
    // Query con caché
    query(selector) {
        if (!this._cache.has(selector)) {
            this._cache.set(selector, $(selector));
        }
        return this._cache.get(selector);
    }
    
    // Query all con caché
    queryAll(selector) {
        const cacheKey = `all:${selector}`;
        if (!this._cache.has(cacheKey)) {
            this._cache.set(cacheKey, $$(selector));
        }
        return this._cache.get(cacheKey);
    }
    
    // Refrescar entrada de caché
    refresh(key, selector) {
        this._cache.set(key, $(selector));
    }
    
    // Limpiar caché
    clear() {
        this._cache.clear();
        this._initialized = false;
    }
    
    // Getters de conveniencia
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

export const DOM = new DOMManager();
