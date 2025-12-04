// Punto de entrada principal

import { DOM } from './core/dom.js';
import { Logger } from './core/utils.js';
import { initNavigation } from './components/navigation.js';
import { initAnimations, revealSections, createScrollToTop } from './components/animations.js';
import { initEnhancedEffects } from './components/effects.js';
import { I18N } from './i18n/i18n.js';
import { initHypercube } from './features/hypercube.js';

function init() {
    DOM.init();
    I18N.init();
    initNavigation();
    initAnimations();
    createScrollToTop();
    revealSections();
    initHypercube();
    
    // Efectos no críticos deshabilitados para optimización
    // setTimeout(() => {
    //     initEnhancedEffects();
    // }, 2000);
    
    Logger.log('App', 'Initialization complete');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { init };
