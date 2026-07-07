// App entry point - orchestrates module initialization

import { DOM } from './core/dom.js';
import { Logger, debounce } from './core/utils.js';
import { Router } from './core/router.js';
import { I18N } from './i18n/i18n.js';
import { initLanding } from './components/landing.js';
import { initHypercube } from './features/hypercube.js';

/** Initializes all app modules */
function init() {
    DOM.init();
    Router.init();
    I18N.init();
    initLanding();
    initHypercube();
    
    // Handle resize events globally
    window.addEventListener('resize', debounce(() => {
        Logger.log('App', 'Window resized');
    }, 200));
    
    Logger.log('App', 'Initialization complete');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { init };
