// Navbar interactions and mobile menu

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

/** Updates active nav link based on scroll position */
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

/** Handles scroll events - hides/shows navbar */
function handleScroll() {
    const currentScroll = window.pageYOffset;
    const navbar = DOM.navbar;
    
    if (!navbar) return;
    
    toggleClass(navbar, CLASSES.scrolled, currentScroll > APP_CONFIG.scroll.threshold);
    
    if (currentScroll > lastScrollPosition && currentScroll > APP_CONFIG.scroll.hideNavThreshold) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollPosition = currentScroll;
    updateActiveSection();
}

/** Closes mobile menu */
function closeMenu() {
    const hamburger = DOM.hamburger;
    const navMenu = DOM.navMenu;
    
    removeClasses(hamburger, CLASSES.active);
    removeClasses(navMenu, CLASSES.active);
    document.body.style.overflow = '';
}

/** Toggles mobile menu open/closed */
function toggleMenu() {
    const hamburger = DOM.hamburger;
    const navMenu = DOM.navMenu;
    
    toggleClass(hamburger, CLASSES.active);
    toggleClass(navMenu, CLASSES.active);
    
    document.body.style.overflow = navMenu.classList.contains(CLASSES.active) ? 'hidden' : '';
}

/** Initializes navigation event listeners */
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

    // Scroll event listener
    window.addEventListener('scroll', throttle(handleScroll, APP_CONFIG.performance.throttleDelay), { passive: true });
    
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
    
    // Close menu on resize if screen becomes large
    window.addEventListener('resize', throttle(() => {
        if (window.innerWidth > 768 && navMenu.classList.contains(CLASSES.active)) {
            closeMenu();
        }
    }, 200));
    
    Logger.log('Navigation', 'Initialized');
}
