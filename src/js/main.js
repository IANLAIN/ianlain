// App entry point - orchestrates module initialization

import { DOM } from './core/dom.js';
import { Logger } from './core/utils.js';
import { initPrefetch } from './core/prefetch.js';
import { Router } from './core/router.js';
import { initNavigation } from './components/navigation.js';
import { initAnimations, revealSections, createScrollToTop } from './components/animations.js';
import { I18N } from './i18n/i18n.js';
import { initHypercube } from './features/hypercube.js';

/** Initializes all app modules */
function init() {
    DOM.init();
    Router.init();
    I18N.init();
    initNavigation();
    initAnimations();
    createScrollToTop();
    revealSections();
    initHypercube();
    initPrefetch();
    Logger.log('App', 'Initialization complete');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { init };
