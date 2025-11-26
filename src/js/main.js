/**
 * Main Application Entry Point
 * Initializes all modules and starts the application
 */

// Core
import { DOM } from './core/dom.js';
import { Logger } from './core/utils.js';

// Components
import { initNavigation } from './components/navigation.js';
import { initAnimations, revealSections, createScrollToTop } from './components/animations.js';
import { initEnhancedEffects } from './components/effects.js';

// I18N
import { I18N } from './i18n/i18n.js';

// Features
import { initHypercube } from './features/hypercube.js';

/**
 * Initialize the application
 */
function init() {
    // Console branding
    console.log(
        '%c IanLain Portfolio v2.0 ',
        'background: linear-gradient(90deg, #06b6d4, #8b5cf6); color: #fff; font-size: 16px; padding: 10px 20px; border-radius: 5px; font-weight: bold;'
    );
    console.log(
        '%c Modular Architecture • Optimized Performance ',
        'color: #06b6d4; font-size: 12px;'
    );
    
    // Initialize DOM cache first
    DOM.init();
    
    // Initialize core modules
    I18N.init();
    initNavigation();
    
    // Initialize animations
    initAnimations();
    createScrollToTop();
    revealSections();
    
    // Initialize hypercube visualization
    initHypercube();
    
    // Delayed initialization for enhanced effects (non-critical)
    setTimeout(() => {
        initEnhancedEffects();
    }, 2000);
    
    Logger.log('App', 'Initialization complete');
}

/**
 * Start application when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential external use
export { init };
