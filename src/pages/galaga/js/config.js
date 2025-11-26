/**
 * Galaga Game Configuration
 * All game constants and settings
 */

export const GAME_CONFIG = Object.freeze({
    // Player settings
    PLAYER_SPEED: 8,
    BULLET_SPEED: 12,
    FIRE_RATE: 200, // ms between shots
    INITIAL_LIVES: 3,
    
    // Enemy settings
    ALIEN_SPEED: 2,
    ASTEROID_SPEED: 3,
    SPAWN_RATE: 1500, // ms between enemy spawns
    MIN_SPAWN_RATE: 500,
    
    // Points
    POINTS: Object.freeze({
        ALIEN: 100,
        ASTEROID: 50,
        KAMIKAZE: 200
    }),
    
    // Spawn chances
    SPAWN_CHANCES: Object.freeze({
        ALIEN: 0.7,      // 30% chance (rand > 0.7)
        KAMIKAZE: 0.9    // 10% chance (rand > 0.9)
    })
});

export const COLORS = Object.freeze({
    CYAN: '#06b6d4',
    PURPLE: '#8b5cf6',
    EMERALD: '#10b981',
    RED: '#ef4444',
    YELLOW: '#fbbf24',
    DARK_BG: '#0f172a',
    DARK_GRAY: '#334155',
    GRAY: '#6b7280',
    LIGHT_GRAY: '#4b5563'
});

export const SELECTORS = Object.freeze({
    CANVAS: 'gameCanvas',
    HUD: {
        SCORE: 'scoreDisplay',
        HIGH_SCORE: 'highScoreDisplay',
        HIGH_SCORE_START: 'highScore',
        LIVES: '.life-icon'
    },
    SCREENS: {
        START: 'startScreen',
        PAUSE: 'pauseScreen',
        GAME_OVER: 'gameOverScreen'
    },
    BUTTONS: {
        START: 'startBtn',
        RESTART: 'restartBtn',
        PAUSE: 'pauseBtn',
        RESUME: 'resumeBtn',
        QUIT: 'quitBtn',
        MUTE: 'muteBtn',
        BACK: 'backBtn',
        BACK_2: 'backBtn2'
    },
    TOUCH: {
        LEFT: 'touchLeft',
        RIGHT: 'touchRight'
    }
});

/**
 * Cookie utilities for high score persistence
 */
export const CookieManager = {
    COOKIE_NAME: 'iansGalagaHighScore',
    
    set(value, days = 365) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${this.COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    },
    
    get() {
        const value = document.cookie.split('; ').find(row => row.startsWith(this.COOKIE_NAME + '='));
        return value ? parseInt(decodeURIComponent(value.split('=')[1])) || 0 : 0;
    }
};
