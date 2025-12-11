// Galaga - Leaderboard API (Supabase integration)

const SUPABASE_URL = 'https://xqkiwzeiotrqzzzuhuxn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxa2l3emVpb3RycXp6enVodXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODkzNDEsImV4cCI6MjA4MDY2NTM0MX0.CIUVRQlRU94Hc9u1ECCcQafy_SDO7FufuEV1zTKNnyE';

// Supabase REST API helper
const supabaseRest = async (endpoint, options = {}) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'return=representation'
    };
    
    const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
};

// Cookie names
const COOKIES = {
    USERNAME: 'galaga_username',
    FIRST_VISIT: 'galaga_visited',
    HIGH_SCORE: 'galaga_highscore'
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

/**
 * Deletes a cookie
 * @param {string} name - Cookie name
 */
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
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
 * Gets saved username from cookie
 * @returns {string|null} Username or null
 */
export function getSavedUsername() {
    return getCookie(COOKIES.USERNAME);
}

/**
 * Saves username to cookie
 * @param {string} username - Username to save
 */
export function saveUsername(username) {
    setCookie(COOKIES.USERNAME, username, 365);
}

/**
 * Gets local high score
 * @returns {number} High score or 0
 */
export function getLocalHighScore() {
    return parseInt(getCookie(COOKIES.HIGH_SCORE)) || 0;
}

/**
 * Saves local high score
 * @param {number} score - Score to save
 */
export function saveLocalHighScore(score) {
    const current = getLocalHighScore();
    if (score > current) {
        setCookie(COOKIES.HIGH_SCORE, score.toString(), 365);
    }
}

// ============================================================================
// API CALLS (Supabase Direct)
// ============================================================================

/**
 * Fetches top scores from the leaderboard
 * @param {number} limit - Number of scores to fetch (default 10)
 * @returns {Promise<Array>} Array of score objects
 */
export async function fetchLeaderboard(limit = 10) {
    try {
        const scores = await supabaseRest(
            `scores?select=id,username,score,level,created_at&order=score.desc&limit=${limit}`
        );
        return scores || [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

/**
 * Fetches a user's best score and rank
 * @param {string} username - Username to look up
 * @returns {Promise<Object|null>} User's best score or null
 */
export async function fetchUserScore(username) {
    try {
        // Get user's best score
        const scores = await supabaseRest(
            `scores?username=eq.${encodeURIComponent(username)}&order=score.desc&limit=1`
        );
        
        if (!scores || scores.length === 0) {
            return null;
        }
        
        const userBest = scores[0];
        
        // Calculate rank (count scores higher than this one + 1)
        const rankResult = await supabaseRest(
            `scores?score=gt.${userBest.score}&select=id`,
            { headers: { 'Prefer': 'count=exact' } }
        );
        
        // Rank is count of higher scores + 1
        const rank = (rankResult?.length || 0) + 1;
        
        return { best: userBest, rank };
    } catch (error) {
        console.error('Error fetching user score:', error);
        return null;
    }
}

/**
 * Submits a score to the leaderboard
 * @param {string} username - Player's username
 * @param {number} score - Score achieved
 * @param {number} level - Level reached
 * @returns {Promise<Object>} Result with rank and personal best info
 */
export async function submitScore(username, score, level = 1) {
    // Save locally first
    saveLocalHighScore(score);
    
    // Sanitize username
    const cleanUsername = username.trim().substring(0, 12).replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
    
    if (cleanUsername.length < 3) {
        return { success: false, error: 'Username must be 3-12 characters' };
    }
    
    try {
        // Get previous best before inserting
        const previousBest = await fetchUserScore(cleanUsername);
        
        // Insert new score
        const result = await supabaseRest('scores', {
            method: 'POST',
            body: JSON.stringify({
                username: cleanUsername,
                score: Math.floor(score),
                level: level
            })
        });
        
        if (!result || result.length === 0) {
            throw new Error('Insert failed');
        }
        
        // Calculate rank
        const rankScores = await supabaseRest(
            `scores?score=gt.${score}&select=id`
        );
        const rank = (rankScores?.length || 0) + 1;
        
        // Check if personal best
        const isPersonalBest = !previousBest?.best || score > previousBest.best.score;
        
        return {
            success: true,
            rank,
            isPersonalBest,
            message: isPersonalBest ? 'New personal best!' : 'Score recorded'
        };
    } catch (error) {
        console.error('Error submitting score:', error);
        return { success: false, error: 'Failed to submit score' };
    }
}

/**
 * Fetches global game statistics
 * @returns {Promise<Object|null>} Stats object or null
 */
export async function fetchStats() {
    try {
        // Fetch all scores to calculate stats (Supabase REST doesn't support aggregates directly)
        const scores = await supabaseRest('scores?select=score,username');
        
        if (!scores || scores.length === 0) {
            return {
                totalGames: 0,
                totalPlayers: 0,
                highestScore: 0,
                averageScore: 0
            };
        }
        
        const uniquePlayers = new Set(scores.map(s => s.username));
        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        
        return {
            totalGames: scores.length,
            totalPlayers: uniquePlayers.size,
            highestScore: Math.max(...scores.map(s => s.score)),
            averageScore: Math.round(totalScore / scores.length)
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

/**
 * Checks if Supabase is available
 * @returns {Promise<boolean>} True if API is healthy
 */
export async function checkApiHealth() {
    try {
        await supabaseRest('scores?select=id&limit=1');
        return true;
    } catch {
        return false;
    }
}
