// Galaga - Local storage utilities

/**
 * Cookie configuration for persistent storage
 */
const COOKIES = {
    HIGH_SCORE: 'galaga_highscore',
    FIRST_VISIT: 'galaga_visited'
};

// ============================================================================
// COOKIE UTILITIES
// ============================================================================

/**
 * Sets a cookie with expiration
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration
 */
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Gets a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
function getCookie(name) {
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Checks if this is the user's first visit
 * @returns {boolean} True if first visit
 */
export function isFirstVisit() {
    return !getCookie(COOKIES.FIRST_VISIT);
}

/**
 * Marks the user as having visited
 */
export function markVisited() {
    setCookie(COOKIES.FIRST_VISIT, 'true', 365);
}

/**
 * Gets local high score
 * @returns {number} High score or 0
 */
export function getLocalHighScore() {
    return parseInt(getCookie(COOKIES.HIGH_SCORE)) || 0;
}

/**
 * Saves local high score if it's higher than current
 * @param {number} score - Score to save
 * @returns {boolean} True if new high score was set
 */
export function saveLocalHighScore(score) {
    const current = getLocalHighScore();
    if (score > current) {
        setCookie(COOKIES.HIGH_SCORE, score.toString(), 365);
        return true;
    }
    return false;
}
