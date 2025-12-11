// Internationalization manager

import { APP_CONFIG, SELECTORS, CLASSES } from '../core/constants.js';
import { translations } from './translations.js';
import { getNestedValue, toggleClass, Logger, $$ } from '../core/utils.js';
import { DOM } from '../core/dom.js';

/** Singleton i18n manager */
class I18NManager {
    constructor() {
        this._currentLang = this._loadSavedLanguage();
        this._initialized = false;
    }
    
    /** Loads saved language or returns default */
    _loadSavedLanguage() {
        try {
            return localStorage.getItem(APP_CONFIG.storage.language) || APP_CONFIG.defaults.language;
        } catch {
            return APP_CONFIG.defaults.language;
        }
    }
    
    get currentLanguage() {
        return this._currentLang;
    }
    
    /** Initializes i18n system and applies saved language */
    init() {
        if (this._initialized) return;
        
        this._setupLanguageButtons();
        this.apply(this._currentLang);
        
        this._initialized = true;
        Logger.log('i18n', `Initialized with language: ${this._currentLang}`);
    }
    
    /** Sets up language button click handlers */
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
     * Applies language to the page
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
        
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        Logger.log('i18n', `Applied language: ${lang}`);
    }
    
    /** Saves language preference to storage */
    _saveLanguage(lang) {
        try {
            localStorage.setItem(APP_CONFIG.storage.language, lang);
        } catch (e) {
            Logger.warn('i18n', 'Could not save language preference');
        }
    }
    
    /** Updates document lang attribute */
    _updateDocumentLang(lang) {
        document.documentElement.setAttribute('lang', lang);
    }
    
    /** Updates active state on language buttons */
    _updateLanguageButtons(lang) {
        const langButtons = DOM.langButtons;
        if (!langButtons) return;
        
        langButtons.forEach(btn => {
            toggleClass(btn, CLASSES.active, btn.dataset.lang === lang);
        });
    }
    
    /** Translates all elements with data-i18n attribute */
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
            
            if (!el.dataset.i18nOriginal) {
                el.dataset.i18nOriginal = el.textContent.trim();
            }
            
            el.textContent = translation;
            translatedCount++;
        });
        
        Logger.log('i18n', `Translated ${translatedCount} elements`);
    }
    
    /**
     * Gets translation by key
     * @param {string} key - Dot-notation translation key
     * @param {string} [lang] - Language code
     * @returns {string|undefined} Translated text
     */
    translate(key, lang = this._currentLang) {
        return getNestedValue(translations[lang], key);
    }
    
    /** Alias for translate */
    t(key, lang) {
        return this.translate(key, lang);
    }
}

export const I18N = new I18NManager();
