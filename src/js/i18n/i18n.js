/**
 * Internationalization (i18n) Manager
 * Handles language switching and text translations
 */

import { APP_CONFIG, SELECTORS, CLASSES } from '../core/constants.js';
import { translations } from './translations.js';
import { getNestedValue, toggleClass, Logger, $, $$ } from '../core/utils.js';
import { DOM } from '../core/dom.js';

/**
 * I18N Manager Class
 * Singleton pattern for managing translations
 */
class I18NManager {
    constructor() {
        this._currentLang = this._loadSavedLanguage();
        this._initialized = false;
    }
    
    /**
     * Get saved language from storage or use default
     * @returns {string} Language code
     * @private
     */
    _loadSavedLanguage() {
        try {
            return localStorage.getItem(APP_CONFIG.storage.language) || APP_CONFIG.defaults.language;
        } catch {
            return APP_CONFIG.defaults.language;
        }
    }
    
    /**
     * Get current language
     * @returns {string} Current language code
     */
    get currentLanguage() {
        return this._currentLang;
    }
    
    /**
     * Initialize i18n system
     */
    init() {
        if (this._initialized) return;
        
        this._setupLanguageButtons();
        this.apply(this._currentLang);
        
        this._initialized = true;
        Logger.log('i18n', `Initialized with language: ${this._currentLang}`);
    }
    
    /**
     * Setup language button event listeners
     * @private
     */
    _setupLanguageButtons() {
        const langButtons = DOM.langButtons;
        if (!langButtons || langButtons.length === 0) return;
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (lang && lang !== this._currentLang) {
                    this.apply(lang);
                }
            });
        });
    }
    
    /**
     * Apply language to the page
     * @param {string} lang - Language code
     */
    apply(lang) {
        if (!translations[lang]) {
            Logger.warn('i18n', `Language "${lang}" not found, using default`);
            lang = APP_CONFIG.defaults.language;
        }
        
        this._currentLang = lang;
        this._saveLanguage(lang);
        this._updateDocumentLang(lang);
        this._updateLanguageButtons(lang);
        this._translateElements(lang);
        
        // Dispatch custom event for other modules
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        
        Logger.log('i18n', `Applied language: ${lang}`);
    }
    
    /**
     * Save language preference
     * @param {string} lang - Language code
     * @private
     */
    _saveLanguage(lang) {
        try {
            localStorage.setItem(APP_CONFIG.storage.language, lang);
        } catch (e) {
            Logger.warn('i18n', 'Could not save language preference');
        }
    }
    
    /**
     * Update document lang attribute
     * @param {string} lang - Language code
     * @private
     */
    _updateDocumentLang(lang) {
        document.documentElement.setAttribute('lang', lang);
    }
    
    /**
     * Update language button states
     * @param {string} lang - Active language code
     * @private
     */
    _updateLanguageButtons(lang) {
        const langButtons = DOM.langButtons;
        if (!langButtons) return;
        
        langButtons.forEach(btn => {
            toggleClass(btn, CLASSES.active, btn.dataset.lang === lang);
        });
    }
    
    /**
     * Translate all elements with data-i18n attribute
     * @param {string} lang - Language code
     * @private
     */
    _translateElements(lang) {
        const elements = $$(SELECTORS.i18nElements);
        let translatedCount = 0;
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = getNestedValue(translations[lang], key);
            
            if (!translation) {
                Logger.warn('i18n', `Missing translation: "${key}" for "${lang}"`);
                return;
            }
            
            // Store original text for fallback
            if (!el.dataset.i18nOriginal) {
                el.dataset.i18nOriginal = el.textContent.trim();
            }
            
            el.textContent = translation;
            translatedCount++;
        });
        
        Logger.log('i18n', `Translated ${translatedCount} elements`);
    }
    
    /**
     * Get translation by key
     * @param {string} key - Dot notation key (e.g., 'nav.home')
     * @param {string} [lang] - Language code (uses current if not specified)
     * @returns {string|undefined} Translation or undefined
     */
    translate(key, lang = this._currentLang) {
        return getNestedValue(translations[lang], key);
    }
    
    /**
     * Alias for translate
     */
    t(key, lang) {
        return this.translate(key, lang);
    }
}

// Export singleton instance
export const I18N = new I18NManager();
