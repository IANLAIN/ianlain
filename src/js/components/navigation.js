/**
 * Navigation Module
 * Handles navbar, hamburger menu, scroll behavior, and active section highlighting
 */

import { APP_CONFIG, SELECTORS, CLASSES } from '../core/constants.js';
import { DOM } from '../core/dom.js';
import { 
    throttle, 
    toggleClass, 
    addClasses, 
    removeClasses, 
    smoothScrollTo,
    Logger,
    $
} from '../core/utils.js';

let lastScrollPosition = 0;

/**
 * Update active navigation link based on scroll position
 */
function updateActiveSection() {
    const sections = DOM.sections;
    const navLinks = DOM.navLinks;
    
    if (!sections || !navLinks) return;
    
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        const navLink = $(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => removeClasses(link, CLASSES.active));
            if (navLink) addClasses(navLink, CLASSES.active);
        }
    });
}

/**
 * Handle scroll events for navbar
 */
function handleScroll() {
    const currentScroll = window.pageYOffset;
    const navbar = DOM.navbar;
    
    if (!navbar) return;
    
    // Add scrolled class when scrolled past threshold
    toggleClass(navbar, CLASSES.scrolled, currentScroll > APP_CONFIG.scroll.threshold);
    
    // Hide navbar when scrolling down, show when scrolling up
    if (currentScroll > lastScrollPosition && currentScroll > APP_CONFIG.scroll.hideNavThreshold) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollPosition = currentScroll;
    updateActiveSection();
}

/**
 * Close mobile menu
 */
function closeMenu() {
    const hamburger = DOM.hamburger;
    const navMenu = DOM.navMenu;
    
    removeClasses(hamburger, CLASSES.active);
    removeClasses(navMenu, CLASSES.active);
    document.body.style.overflow = '';
}

/**
 * Toggle mobile menu
 */
function toggleMenu() {
    const hamburger = DOM.hamburger;
    const navMenu = DOM.navMenu;
    
    toggleClass(hamburger, CLASSES.active);
    toggleClass(navMenu, CLASSES.active);
    
    document.body.style.overflow = navMenu.classList.contains(CLASSES.active) ? 'hidden' : '';
}

/**
 * Initialize navigation functionality
 */
export function initNavigation() {
    const hamburger = DOM.hamburger;
    const navMenu = DOM.navMenu;
    const navLinks = DOM.navLinks;
    const logo = DOM.logo;
    
    if (!hamburger || !navMenu || !navLinks) {
        Logger.warn('Navigation', 'Required elements not found');
        return;
    }
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', toggleMenu);
    
    // Navigation links - smooth scroll and close menu
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            
            const href = link.getAttribute('href');
            smoothScrollTo(href, APP_CONFIG.scroll.offset);
        });
    });
    
    // Logo click - scroll to top
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            smoothScrollTo(0);
        });
    }
    
    // Scroll handler with throttle for performance
    const throttledScrollHandler = throttle(handleScroll, APP_CONFIG.performance.throttleDelay);
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains(CLASSES.active)) {
            closeMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains(CLASSES.active) && 
            !navMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            closeMenu();
        }
    });
    
    Logger.log('Navigation', 'Initialized');
}
