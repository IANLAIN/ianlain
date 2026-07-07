// App-wide configuration and constants

/** Route mappings: clean URL → real path (Keep synced with 404.html) */
export const ROUTES = {
    '/': '/index.html',
    '/game': '/src/pages/galaga/index.html',
    '/galaga': '/src/pages/galaga/index.html',
    '/news': '/src/pages/news/index.html'
};

/** Global app configuration */
export const APP_CONFIG = {
    storage: {
        language: 'ianlain_language'
    },
    defaults: {
        language: 'en'
    }
};

/** @type {Object} DOM selector strings */
export const SELECTORS = {
    navbar: '.navbar',
    logo: '.logo',
    langButtons: '.lang-btn',
    i18nElements: '[data-i18n]',
    profileImage: '.profile-image',
    gameModal: '[data-game-modal]',
    gameModalClose: '[data-action="close-game"]',
    gameOpenButtons: '[data-action="open-game"]',
    gameModalLink: '.game-modal__link'
};

/** @type {Object} CSS class names */
export const CLASSES = {
    active: 'active',
    visible: 'visible',
    hidden: 'hidden',
    scrolled: 'scrolled'
};

/** @type {string[]} Supported languages */
export const LANGUAGES = ['en', 'es', 'fr', 'zh'];

// Freeze objects to prevent mutations
Object.freeze(ROUTES);
Object.freeze(APP_CONFIG);
Object.freeze(SELECTORS);
Object.freeze(CLASSES);
Object.freeze(LANGUAGES);
