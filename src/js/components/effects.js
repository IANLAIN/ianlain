// Efectos visuales mejorados

import { createElement, prefersReducedMotion, isMobile, random, Logger } from '../core/utils.js';

// Crear partículas flotantes
function createMinimalParticles() {
    const container = createElement('div', {
        className: 'floating-particles',
        style: {
            position: 'fixed',
            inset: '0',
            pointerEvents: 'none',
            zIndex: '-1',
            overflow: 'hidden'
        }
    });
    
    document.body.appendChild(container);
    
    for (let i = 0; i < 10; i++) {
        const size = random.between(2, 6);
        const particle = createElement('div', {
            className: 'particle',
            style: {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4), transparent)',
                borderRadius: '50%',
                bottom: '-20px',
                left: `${random.between(0, 100)}%`,
                animation: `floatUp ${random.between(20, 45)}s linear infinite`,
                animationDelay: `${random.between(0, 10)}s`,
                opacity: '0.4'
            }
        });
        container.appendChild(particle);
    }
    
    Logger.log('Effects', 'Particles created');
}

// Inicializar efectos (solo desktop y sin reduced motion)
export function initEnhancedEffects() {
    if (prefersReducedMotion()) {
        Logger.log('Effects', 'Skipped - reduced motion preferred');
        return;
    }
    
    if (!isMobile() && window.matchMedia('(min-width: 1024px)').matches) {
        createMinimalParticles();
    }
}
