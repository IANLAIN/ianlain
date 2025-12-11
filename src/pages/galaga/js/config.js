// Galaga - Game configuration and constants

// Enemy types
export const ENEMY_TYPE = Object.freeze({
    BEE: 'bee',           // Zako - Basic enemy (blue/yellow)
    BUTTERFLY: 'butterfly', // Goei - Mid-tier enemy (red/purple)
    BOSS: 'boss'          // Boss Galaga - Commander (green/blue)
});

// ============================================================================
// SCORING SYSTEM - Authentic 1981 values
// ============================================================================

/** @type {Object} Point values for each enemy type */
export const SCORING = Object.freeze({
    // Bee (Zako) - In formation: 50, Diving: 100
    [ENEMY_TYPE.BEE]: Object.freeze({
        FORMATION: 50,
        DIVING: 100
    }),
    
    // Butterfly (Goei) - In formation: 80, Diving: 160
    [ENEMY_TYPE.BUTTERFLY]: Object.freeze({
        FORMATION: 80,
        DIVING: 160
    }),
    
    // Boss Galaga - Formation: 150, Diving alone: 400, With 1 escort: 800, With 2 escorts: 1600
    [ENEMY_TYPE.BOSS]: Object.freeze({
        FORMATION: 150,
        DIVING_ALONE: 400,
        DIVING_ONE_ESCORT: 800,
        DIVING_TWO_ESCORTS: 1600,
        // Special: Destroying captured fighter without killing Boss = 0 points
        CAPTURED_FIGHTER_RESCUED: 0
    }),
    
    // Challenging Stage bonuses
    CHALLENGING_STAGE: Object.freeze({
        PER_ENEMY: 100,          // Each enemy in Challenging Stage
        PERFECT_BONUS: 10000,    // All 40 enemies destroyed
        ENEMY_COUNT: 40          // Total enemies per Challenging Stage
    })
});

// ============================================================================
// FORMATION CONFIGURATION
// ============================================================================

/** @type {Object} Formation grid settings - 10 columns x 5 rows = 40 enemies + 4 bosses */
export const FORMATION = Object.freeze({
    COLS: 10,
    ROWS: 5,
    
    // Grid spacing in pixels (adjusted based on canvas size)
    CELL_WIDTH: 32,
    CELL_HEIGHT: 32,
    
    // Starting Y position from top
    TOP_OFFSET: 60,
    
    // Formation breathing/movement
    MOVE_SPEED: 0.5,           // Horizontal oscillation speed
    MOVE_AMPLITUDE: 30,        // Pixels to move left/right
    
    // Row layout (from top):
    // Row 0: 4 Boss Galagas (centered)
    // Row 1: 8 Butterflies  
    // Row 2: 8 Butterflies
    // Row 3: 10 Bees
    // Row 4: 10 Bees
    LAYOUT: Object.freeze([
        { type: ENEMY_TYPE.BOSS, count: 4, offset: 3 },      // 4 bosses, offset by 3 to center
        { type: ENEMY_TYPE.BUTTERFLY, count: 8, offset: 1 }, // 8 butterflies
        { type: ENEMY_TYPE.BUTTERFLY, count: 8, offset: 1 }, // 8 butterflies
        { type: ENEMY_TYPE.BEE, count: 10, offset: 0 },      // 10 bees
        { type: ENEMY_TYPE.BEE, count: 10, offset: 0 }       // 10 bees
    ])
});

// ============================================================================
// WAVE ENTRY PATTERNS
// ============================================================================

/** @type {Object} Entry path configurations for enemies entering the screen */
export const ENTRY_PATTERNS = Object.freeze({
    // Each wave consists of groups of 4-8 enemies entering in sequence
    GROUPS_PER_WAVE: 8,
    ENEMIES_PER_GROUP: 5,
    
    // Timing between entries
    GROUP_DELAY: 800,          // ms between each group
    ENEMY_DELAY: 100,          // ms between enemies in same group
    
    // Entry from different sides
    ENTRY_TYPES: Object.freeze({
        TOP_LEFT: 'topLeft',
        TOP_RIGHT: 'topRight',
        BOTTOM_LEFT: 'bottomLeft',
        BOTTOM_RIGHT: 'bottomRight',
        TOP_CENTER: 'topCenter'
    })
});

// ============================================================================
// COOKIE MANAGER
// ============================================================================

export const CookieManager = {
    get: () => {
        const match = document.cookie.split('; ').find(row => row.startsWith('galaga_highscore='));
        return match ? parseInt(decodeURIComponent(match.split('=')[1])) || 0 : 0;
    },
    set: (score) => {
        const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
        document.cookie = `galaga_highscore=${score}; expires=${expires}; path=/; SameSite=Lax`;
    }
};

// ============================================================================
// DIVING ATTACK CONFIGURATION
// ============================================================================

/** @type {Object} Diving attack behavior settings */
export const DIVING = Object.freeze({
    // How often enemies initiate dives
    DIVE_INTERVAL: 2000,       // Base interval between dives (ms)
    MIN_DIVE_INTERVAL: 800,    // Minimum interval (increases with stage)
    
    // Dive speeds
    BASE_SPEED: 3,
    MAX_SPEED: 6,
    
    // Boss special attack
    TRACTOR_BEAM_DURATION: 3000,  // How long tractor beam is active (ms)
    TRACTOR_BEAM_WIDTH: 48,       // Width of capture beam
    TRACTOR_BEAM_HEIGHT: 120,     // Length of capture beam
    
    // Escort behavior (enemies accompanying Boss dive)
    MAX_ESCORTS: 2,               // Maximum butterflies that can escort Boss
    ESCORT_OFFSET_X: 24,          // Horizontal spacing from Boss
    ESCORT_OFFSET_Y: 16           // Vertical offset behind Boss
});

// ============================================================================
// PLAYER CONFIGURATION
// ============================================================================

/** @type {Object} Player ship settings */
export const PLAYER = Object.freeze({
    SPEED: 5,                  // Movement speed (pixels per frame)
    BULLET_SPEED: 10,          // Bullet velocity
    MAX_BULLETS: 2,            // Maximum bullets on screen at once
    FIRE_COOLDOWN: 150,        // Minimum ms between shots
    
    // Dual Fighter mode (after rescuing captured ship)
    DUAL_FIRE_SPREAD: 20,      // Horizontal offset for dual bullets
    DUAL_FIGHTER_WIDTH: 48,    // Combined hitbox width
    
    // Respawn
    RESPAWN_DELAY: 2000,       // ms before respawning after death
    INVINCIBILITY_TIME: 2000,  // ms of invincibility after respawn
    
    // Starting values
    INITIAL_LIVES: 3,
    BONUS_LIFE_AT: [20000, 70000]  // Extra life at these scores
});

/** @type {Object} Main game configuration - aliases for convenience */
export const GAME_CONFIG = Object.freeze({
    PLAYER_SPEED: PLAYER.SPEED,
    BULLET_SPEED: PLAYER.BULLET_SPEED,
    MAX_BULLETS: PLAYER.MAX_BULLETS,
    FIRE_COOLDOWN: PLAYER.FIRE_COOLDOWN,
    INITIAL_LIVES: PLAYER.INITIAL_LIVES,
    RESPAWN_DELAY: PLAYER.RESPAWN_DELAY,
    INVINCIBILITY_TIME: PLAYER.INVINCIBILITY_TIME
});

// ============================================================================
// CHALLENGING STAGE CONFIGURATION
// ============================================================================

/** @type {Object} Challenging Stage (Bonus Stage) settings */
export const CHALLENGING_STAGE = Object.freeze({
    // Occurs every 3rd stage (stages 3, 7, 11, 15, etc. in original)
    // We'll simplify to every 3 stages: 3, 6, 9, 12...
    FREQUENCY: 3,
    
    // Wave patterns - enemies fly in formation patterns without attacking
    WAVE_COUNT: 5,             // Number of enemy waves
    ENEMIES_PER_WAVE: 8,       // Enemies per wave
    TOTAL_ENEMIES: 40,         // Total enemies in Challenging Stage
    
    // No enemies shoot or dive in Challenging Stage
    // Player tries to destroy all 40 for 10000 bonus
    
    // Timing
    WAVE_INTERVAL: 1500,       // ms between waves
    ENEMY_SPEED: 4             // Speed of fly-by enemies
});

// ============================================================================
// GAME TIMING AND DIFFICULTY
// ============================================================================

/** @type {Object} Difficulty scaling per stage */
export const DIFFICULTY = Object.freeze({
    // Base values
    BASE_DIVE_FREQUENCY: 1.0,
    BASE_ENEMY_SPEED: 1.0,
    BASE_BULLET_SPEED: 1.0,
    
    // Scaling per stage (multipliers)
    DIVE_FREQUENCY_SCALE: 0.05,    // +5% more frequent per stage
    ENEMY_SPEED_SCALE: 0.03,       // +3% faster per stage
    BULLET_SPEED_SCALE: 0.02,      // +2% faster per stage
    
    // Caps
    MAX_DIFFICULTY_MULTIPLIER: 2.5
});

// ============================================================================
// VISUAL SETTINGS
// ============================================================================

/** @type {Object} Authentic arcade colors */
export const COLORS = Object.freeze({
    // Enemy colors (approximating original arcade)
    BEE: {
        PRIMARY: '#4169E1',    // Royal blue body
        SECONDARY: '#FFD700',  // Gold/yellow wings
        EYES: '#FFFFFF'
    },
    BUTTERFLY: {
        PRIMARY: '#DC143C',    // Crimson red
        SECONDARY: '#9932CC',  // Purple wings
        EYES: '#FFFFFF'
    },
    BOSS: {
        PRIMARY: '#228B22',    // Forest green
        SECONDARY: '#00BFFF',  // Deep sky blue
        EYES: '#FF0000',
        CROWN: '#FFD700'
    },
    
    // Player
    PLAYER: {
        PRIMARY: '#FFFFFF',
        SECONDARY: '#06b6d4',  // Cyan
        ENGINE: '#FF4500'
    },
    
    // Effects
    BULLET: '#FFFFFF',
    EXPLOSION: ['#FF4500', '#FFD700', '#FF6347', '#FFFFFF'],
    TRACTOR_BEAM: '#00FFFF',
    
    // UI
    UI_CYAN: '#06b6d4',
    UI_YELLOW: '#fbbf24',
    UI_RED: '#ef4444',
    UI_WHITE: '#FFFFFF',
    
    // Background
    STAR_COLORS: ['#FFFFFF', '#FFFFCC', '#CCCCFF', '#FFCCCC']
});

/** @type {Object} Sprite sizes in pixels */
export const SPRITE_SIZE = Object.freeze({
    PLAYER: { width: 32, height: 32 },
    BEE: { width: 24, height: 24 },
    BUTTERFLY: { width: 28, height: 28 },
    BOSS: { width: 32, height: 32 },
    BULLET: { width: 4, height: 12 },
    ENEMY_BULLET: { width: 4, height: 8 }
});

// ============================================================================
// UI AND DOM SELECTORS
// ============================================================================

export const SELECTORS = Object.freeze({
    CANVAS: 'gameCanvas',
    HUD: {
        SCORE: 'scoreDisplay',
        HIGH_SCORE: 'highScoreDisplay',
        HIGH_SCORE_START: 'highScore',
        LIVES: '.life-icon',
        STAGE: 'stageDisplay',
        CAPTURED: 'capturedIndicator'
    },
    SCREENS: {
        START: 'startScreen',
        PAUSE: 'pauseScreen',
        GAME_OVER: 'gameOverScreen',
        STAGE_CLEAR: 'stageClearScreen',
        CHALLENGING: 'challengingScreen'
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
        RIGHT: 'touchRight',
        FIRE: 'touchFire'
    }
});

// ============================================================================
// STORAGE
// ============================================================================

/** Cookie utilities for high score persistence */
export const CookieManager = {
    COOKIE_NAME: 'iansGalagaHighScore',
    
    /**
     * Save high score to cookie
     * @param {number} value - Score to save
     * @param {number} [days=365] - Cookie expiration in days
     */
    set(value, days = 365) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${this.COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    },
    
    /**
     * Retrieve high score from cookie
     * @returns {number} Stored high score or 0
     */
    get() {
        const value = document.cookie.split('; ').find(row => row.startsWith(this.COOKIE_NAME + '='));
        return value ? parseInt(decodeURIComponent(value.split('=')[1])) || 0 : 0;
    }
};

// ============================================================================
// GAME STATE ENUM
// ============================================================================

/** @enum {string} Game state machine states */
export const GAME_STATE = Object.freeze({
    TITLE: 'title',
    STAGE_INTRO: 'stageIntro',
    ENTRY_PHASE: 'entryPhase',      // Enemies entering formation
    ATTACK_PHASE: 'attackPhase',    // Normal gameplay
    CHALLENGING: 'challenging',      // Bonus stage
    STAGE_CLEAR: 'stageClear',
    PLAYER_DEATH: 'playerDeath',
    GAME_OVER: 'gameOver',
    PAUSED: 'paused'
});
