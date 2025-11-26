/**
 * Utility Functions
 * Pure, reusable helper functions following DRY principle
 */

/**
 * Throttle function execution
 * Limits how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {number} delay - Minimum time between calls in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func(...args);
        }
    };
};

/**
 * Debounce function execution
 * Delays execution until pause in calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Wait time after last call in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Get nested object value using dot notation path
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot notation path (e.g., 'nav.home')
 * @returns {*} Value at path or undefined
 */
export const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

/**
 * Toggle class on element
 * @param {Element} element - DOM element
 * @param {string} className - Class to toggle
 * @param {boolean} [force] - Force add/remove
 */
export const toggleClass = (element, className, force) => {
    if (!element) return;
    element.classList.toggle(className, force);
};

/**
 * Add classes to element
 * @param {Element} element - DOM element
 * @param {...string} classes - Classes to add
 */
export const addClasses = (element, ...classes) => {
    if (!element) return;
    element.classList.add(...classes);
};

/**
 * Remove classes from element
 * @param {Element} element - DOM element
 * @param {...string} classes - Classes to remove
 */
export const removeClasses = (element, ...classes) => {
    if (!element) return;
    element.classList.remove(...classes);
};

/**
 * Smooth scroll to element or position
 * @param {Element|string} target - Element, selector, or scroll position
 * @param {number} [offset=80] - Offset from top
 */
export const smoothScrollTo = (target, offset = 80) => {
    if (!target) return;
    
    let element;
    if (typeof target === 'string') {
        element = document.querySelector(target);
    } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
        return;
    } else {
        element = target;
    }
    
    if (!element) return;
    
    const offsetTop = element === document.body ? 0 : element.offsetTop - offset;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
};

/**
 * Create IntersectionObserver with common defaults
 * @param {IntersectionObserverCallback} callback - Observer callback
 * @param {Object} [options] - Custom options
 * @returns {IntersectionObserver}
 */
export const createObserver = (callback, options = {}) => {
    const defaultOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

/**
 * Query selector shorthand
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element|null}
 */
export const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Query selector all shorthand
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {NodeList}
 */
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Check if device prefers reduced motion
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if device is mobile
 * @returns {boolean}
 */
export const isMobile = () => {
    return window.matchMedia('(max-width: 768px)').matches;
};

/**
 * Safe localStorage getter
 * @param {string} key - Storage key
 * @param {*} [defaultValue=null] - Default value if key not found
 * @returns {*}
 */
export const getStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

/**
 * Safe localStorage setter
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
};

/**
 * Create element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} [attrs={}] - Attributes object
 * @param {...(Element|string)} children - Child elements or text
 * @returns {Element}
 */
export const createElement = (tag, attrs = {}, ...children) => {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child) {
            element.appendChild(child);
        }
    });
    
    return element;
};

/**
 * Random number utilities (DRY principle)
 */
export const random = {
    /**
     * Get random float between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number}
     */
    between: (min, max) => Math.random() * (max - min) + min,
    
    /**
     * Get random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number}
     */
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    /**
     * Get random item from array
     * @param {Array} arr - Array to pick from
     * @returns {*}
     */
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    
    /**
     * Get random boolean with optional probability
     * @param {number} [probability=0.5] - Probability of true (0-1)
     * @returns {boolean}
     */
    bool: (probability = 0.5) => Math.random() < probability
};

/**
 * Logger utility for consistent console output
 * Can be disabled in production by setting Logger.enabled = false
 */
export const Logger = {
    enabled: true,
    prefix: '',
    
    log: (module, ...args) => {
        if (Logger.enabled) console.log(`[${module}]`, ...args);
    },
    
    warn: (module, ...args) => {
        if (Logger.enabled) console.warn(`[${module}]`, ...args);
    },
    
    error: (module, ...args) => {
        console.error(`[${module}]`, ...args);
    }
};

