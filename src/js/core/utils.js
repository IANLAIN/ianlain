// Funciones utilitarias reutilizables

// Limitar frecuencia de ejecución
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

// Retrasar ejecución hasta pausa en llamadas
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Obtener valor anidado con notación de punto
export const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

// Toggle clase en elemento
export const toggleClass = (element, className, force) => {
    if (!element) return;
    element.classList.toggle(className, force);
};

// Añadir clases a elemento
export const addClasses = (element, ...classes) => {
    if (!element) return;
    element.classList.add(...classes);
};

// Remover clases de elemento
export const removeClasses = (element, ...classes) => {
    if (!element) return;
    element.classList.remove(...classes);
};

// Scroll suave a elemento o posición
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

// Crear IntersectionObserver con defaults
export const createObserver = (callback, options = {}) => {
    const defaultOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Query selector shorthand
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Verificar preferencia de movimiento reducido
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Verificar si es móvil
export const isMobile = () => {
    return window.matchMedia('(max-width: 768px)').matches;
};

// localStorage getter seguro
export const getStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

// localStorage setter seguro
export const setStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
};

// Crear elemento con atributos e hijos
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

// Utilidades de números aleatorios
export const random = {
    between: (min, max) => Math.random() * (max - min) + min,
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    bool: (probability = 0.5) => Math.random() < probability
};

// Logger (deshabilitado en producción)
export const Logger = {
    enabled: false,
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