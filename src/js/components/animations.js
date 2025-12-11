// Scroll-triggered animations and reveal effects

import { APP_CONFIG, SELECTORS, CLASSES } from '../core/constants.js';
import { DOM } from '../core/dom.js';
import { 
    createObserver, 
    addClasses, 
    toggleClass, 
    throttle, 
    createElement,
    prefersReducedMotion,
    Logger,
    $,
    $$
} from '../core/utils.js';

/** Initializes scroll-triggered animations */
export function initAnimations() {
    if (prefersReducedMotion()) {
        Logger.log('Animations', 'Reduced motion preferred, skipping');
        return;
    }
    
    const animatedElements = $$(SELECTORS.animatedElements);
    
    if (!animatedElements.length) return;
    
    // Observer callback for fade-in animations
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                addClasses(entry.target, CLASSES.fadeInUp);
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };
    
    // Create observer with config
    const observer = createObserver(animateOnScroll, {
        threshold: APP_CONFIG.animation.observerThreshold,
        rootMargin: APP_CONFIG.animation.observerRootMargin
    });
    
    // Setup initial styles and observe elements
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s var(--ease-smooth)';
        observer.observe(el);
    });
    
    // Stagger animation for interest cards
    initCardStaggerAnimation();
    
    Logger.log('Animations', `Initialized for ${animatedElements.length} elements`);
}

/** Staggered animation for interest cards */
function initCardStaggerAnimation() {
    const interestCards = DOM.interestCards;
    
    if (!interestCards || !interestCards.length) return;
    
    interestCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = 'all 0.7s var(--ease-smooth)';
        card.style.transitionDelay = `${index * APP_CONFIG.animation.staggerDelay}s`;
    });
    
    const cardObserver = createObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: APP_CONFIG.animation.cardThreshold });
    
    interestCards.forEach(card => cardObserver.observe(card));
}

/** Reveals sections on scroll */
export function revealSections() {
    if (prefersReducedMotion()) return;
    
    const sections = $$('section');
    if (!sections.length) return;
    
    const revealOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                addClasses(entry.target, CLASSES.sectionVisible);
                observer.unobserve(entry.target);
            }
        });
    };
    
    const sectionObserver = createObserver(revealOnScroll, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s var(--ease-smooth)';
        sectionObserver.observe(section);
    });
    
    const heroSection = $('#home');
    if (heroSection) {
        heroSection.style.opacity = '1';
        heroSection.style.transform = 'translateY(0)';
    }
}

/** Creates and manages scroll-to-top button */
export function createScrollToTop() {
    const scrollBtn = createElement('button', {
        className: 'scroll-to-top',
        type: 'button',
        'aria-label': 'Scroll to top'
    }, createElement('i', { className: 'fas fa-chevron-up' }));
    
    document.body.appendChild(scrollBtn);
    
    const updateVisibility = throttle(() => {
        toggleClass(scrollBtn, CLASSES.visible, window.scrollY > 300);
    }, APP_CONFIG.performance.throttleDelay);
    
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    
    scrollBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    Logger.log('Animations', 'Scroll-to-top button created');
}
