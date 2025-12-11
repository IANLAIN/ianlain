// App-wide configuration and constants

/** Route mappings: clean URL → real path */
export const ROUTES = {
    '/': '/index.html',
    '/game': '/src/pages/galaga/index.html',
    '/galaga': '/src/pages/galaga/index.html',
    '/news': '/src/pages/news/index.html'
};

/** Global app configuration */
export const APP_CONFIG = {
    scroll: {
        offset: 80,
        threshold: 100,
        hideNavThreshold: 200
    },
    animation: {
        observerThreshold: 0.15,
        observerRootMargin: '0px 0px -80px 0px',
        cardThreshold: 0.2,
        staggerDelay: 0.15
    },
    performance: {
        throttleDelay: 50,
        debounceDelay: 300
    },
    storage: {
        language: 'ianlain_language',
        theme: 'ianlain_theme'
    },
    defaults: {
        language: 'en'
    }
};

/** @type {Object} DOM selector strings */
export const SELECTORS = {
    navbar: '.navbar',
    hamburger: '.hamburger',
    navMenu: '.nav-menu',
    navLinks: '.nav-link',
    navItem: '.nav-item',
    logo: '.logo',
    langButtons: '.lang-btn',
    i18nElements: '[data-i18n]',
    heroContent: '.hero-content',
    profileImage: '.profile-image',
    profileWrapper: '.profile-image-wrapper',
    hypercubeCanvas: '#hypercube-canvas',
    sections: 'section[id]',
    interestCards: '.interest-card',
    socialLinks: '.social-link',
    animatedElements: '.interest-card, .about-content, .contact-content, .education',
    scrollToTop: '.scroll-to-top'
};

/** @type {Object} CSS class names */
export const CLASSES = {
    active: 'active',
    visible: 'visible',
    hidden: 'hidden',
    scrolled: 'scrolled',
    sectionVisible: 'section-visible',
    fadeInUp: 'fade-in-up'
};

/** @type {string[]} Supported languages */
export const LANGUAGES = ['en', 'es', 'fr', 'zh'];

// Freeze objects to prevent mutations
Object.freeze(ROUTES);
Object.freeze(APP_CONFIG);
Object.freeze(SELECTORS);
Object.freeze(CLASSES);
Object.freeze(LANGUAGES);
