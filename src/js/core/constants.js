/**
 * Application Constants
 * Centralized configuration values for the entire application
 * Following DRY principle - single source of truth
 */

export const APP_CONFIG = {
    // Scroll behavior settings
    scroll: {
        offset: 80,
        threshold: 100,
        hideNavThreshold: 200
    },
    
    // Animation configuration
    animation: {
        observerThreshold: 0.15,
        observerRootMargin: '0px 0px -80px 0px',
        cardThreshold: 0.2,
        staggerDelay: 0.15
    },
    
    // Performance optimization
    performance: {
        throttleDelay: 50,
        debounceDelay: 300
    },
    
    // Local storage keys
    storage: {
        language: 'ianlain_language',
        theme: 'ianlain_theme'
    },
    
    // Default values
    defaults: {
        language: 'en'
    }
};

/**
 * DOM Selectors
 * Centralized selector strings to avoid magic strings
 */
export const SELECTORS = {
    // Navigation
    navbar: '.navbar',
    hamburger: '.hamburger',
    navMenu: '.nav-menu',
    navLinks: '.nav-link',
    navItem: '.nav-item',
    logo: '.logo',
    
    // Language
    langButtons: '.lang-btn',
    i18nElements: '[data-i18n]',
    
    // Hero section
    heroContent: '.hero-content',
    profileImage: '.profile-image',
    profileWrapper: '.profile-image-wrapper',
    hypercubeCanvas: '#hypercube-canvas',
    
    // Content sections
    sections: 'section[id]',
    interestCards: '.interest-card',
    socialLinks: '.social-link',
    
    // Animated elements
    animatedElements: '.interest-card, .about-content, .contact-content, .education',
    
    // UI elements
    scrollToTop: '.scroll-to-top'
};

/**
 * CSS Classes
 * Centralized class names for JavaScript manipulation
 */
export const CLASSES = {
    active: 'active',
    visible: 'visible',
    hidden: 'hidden',
    scrolled: 'scrolled',
    sectionVisible: 'section-visible',
    fadeInUp: 'fade-in-up'
};

/**
 * Supported Languages
 */
export const LANGUAGES = ['en', 'es', 'fr', 'zh'];

/**
 * Freeze objects to prevent accidental mutations
 */
Object.freeze(APP_CONFIG);
Object.freeze(SELECTORS);
Object.freeze(CLASSES);
Object.freeze(LANGUAGES);
