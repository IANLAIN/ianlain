// Galaga - Main game loop and state management

import { 
    GAME_CONFIG, 
    COLORS, 
    SELECTORS, 
    ENEMY_TYPE, 
    SCORING, 
    FORMATION, 
    ENTRY_PATTERNS,
    CookieManager 
} from './config.js';
import { audio } from './audio.js';
import { 
    drawPlayer, 
    drawAlien, 
    drawBullet, 
    drawStar, 
    drawExplosion, 
    drawScore,
    drawLives,
    drawLevelFlags,
    drawReadyMessage,
    drawGameOver,
    drawTractorBeam
} from './renderers.js';
import {
    isFirstVisit,
    markVisited,
    getSavedUsername,
    saveUsername,
    getLocalHighScore,
    saveLocalHighScore,
    fetchLeaderboard,
    fetchUserScore,
    submitScore,
    fetchStats,
    checkApiHealth
} from './api.js';
import { throttle } from '../../../js/core/utils.js';

/**
 * Main Game Class
 * Manages the game loop, state, and all entities
 */
class GalagaGame {
    constructor() {
        this.canvas = document.getElementById(SELECTORS.CANVAS);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
        
        // Game State
        this.state = 'MENU'; // MENU, READY, PLAYING, LEVEL_TRANSITION, GAME_OVER
        this.level = 1;
        this.score = 0;
        this.highScore = CookieManager.get();
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.frameCount = 0;
        this.lastTime = 0;
        
        // Leaderboard & User State
        this.username = getSavedUsername() || '';
        this.isApiAvailable = false;
        this.leaderboard = [];
        
        // Entities
        this.player = {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            speed: GAME_CONFIG.PLAYER_SPEED,
            isDual: false,
            isCaptured: false,
            isInvincible: false,
            invincibleTimer: 0,
            state: 'ALIVE' // ALIVE, EXPLODING, CAPTURED
        };
        
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        this.explosions = [];
        
        // Wave Management
        this.waveState = 'ENTRY'; // ENTRY, FORMATION, ATTACK
        this.waveTimer = 0;
        this.enemiesToSpawn = [];
        this.spawnTimer = 0;
        
        // Input
        this.keys = { left: false, right: false, fire: false };
        this.lastFireTime = 0;
        
        // Audio
        this.isMuted = false;
        
        // Performance tracking
        this.isVisible = true;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Bind methods
        this.handleResize = throttle(this.handleResize.bind(this), 250);
        this.loop = this.loop.bind(this);
        
        this.init();
    }
    
    /** Initialize game */
    init() {
        this.resize();
        this.setupEventListeners();
        this.createStars();
        
        // Check API health
        checkApiHealth().then(isHealthy => {
            this.isApiAvailable = isHealthy;
            if (isHealthy) {
                this.loadLeaderboard();
            }
        });
        
        // Start loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }
    
    /** Handle window resize */
    handleResize() {
        this.resize();
    }
    
    /** Resize canvas */
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }
    
    /** Setup event listeners */
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => this.handleInput(e, true));
        window.addEventListener('keyup', (e) => this.handleInput(e, false));
        
        // Touch controls
        this.setupTouchControls();
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.lastTime = performance.now();
            }
        });
    }
    
    /** Initialize leaderboard system and check first visit */
    async initLeaderboard() {
        // Check if this is first visit
        const firstVisit = isFirstVisit();
        if (firstVisit) {
            markVisited();
        }
        
        // Pre-populate username if saved
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput && this.username) {
            usernameInput.value = this.username;
        }
        
        // Check API availability
        this.isApiAvailable = await checkApiHealth();
        
        // Load initial leaderboard
        if (this.isApiAvailable) {
            this.leaderboard = await fetchLeaderboard(10);
        }
    }

    setupTouchControls() {
        const touchLeft = document.getElementById(SELECTORS.TOUCH.LEFT);
        const touchRight = document.getElementById(SELECTORS.TOUCH.RIGHT);
        const touchFire = document.getElementById(SELECTORS.TOUCH.FIRE);
        
        if (touchLeft) {
            touchLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.left = true; });
            touchLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.left = false; });
        }
        if (touchRight) {
            touchRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.right = true; });
            touchRight.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.right = false; });
        }
        if (touchFire) {
            touchFire.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.fire = true; this.tryFire(); });
            touchFire.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.fire = false; });
        }
    }

    handleInput(e, isDown) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = isDown;
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = isDown;
                break;
            case ' ':
            case 'z':
                this.keys.fire = isDown;
                if (isDown) this.tryFire();
                break;
            case 'Enter':
                if (isDown && this.state === 'MENU') this.startGame();
                break;
        }
    }

    startGame() {
        // Validate username
        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput?.value?.trim() || '';
        
        if (username.length < 3) {
            usernameInput?.classList.add('error');
            setTimeout(() => usernameInput?.classList.remove('error'), 500);
            return;
        }
        
        // Save username
        this.username = username;
        saveUsername(username);
        
        audio.init();
        audio.gameStart();
        
        this.state = 'READY';
        this.level = 1;
        this.score = 0;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.player.isDual = false;
        this.player.state = 'ALIVE';
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 50;
        
        this.resetLevel();
        
        // Hide menu UI
        const menu = document.getElementById('startScreen');
        if (menu) menu.style.display = 'none';
        
        setTimeout(() => {
            this.state = 'PLAYING';
        }, 4000); // Wait for start music
    }
    
    /** Restarts the game from game over screen */
    restartGame() {
        this.hideGameOver();
        const menu = document.getElementById('startScreen');
        if (menu) menu.style.display = 'flex';
    }
    
    // ========================================================================
    // LEADERBOARD METHODS
    // ========================================================================
    
    /** Shows the leaderboard overlay */
    async showLeaderboard() {
        const screen = document.getElementById('leaderboardScreen');
        const startScreen = document.getElementById('startScreen');
        
        if (screen) screen.style.display = 'flex';
        if (startScreen) startScreen.style.display = 'none';
        
        await this.updateLeaderboardDisplay();
    }
    
    /** Hides the leaderboard overlay */
    hideLeaderboard() {
        const screen = document.getElementById('leaderboardScreen');
        const startScreen = document.getElementById('startScreen');
        
        if (screen) screen.style.display = 'none';
        if (startScreen) startScreen.style.display = 'flex';
    }
    
    /** Updates the leaderboard table with current scores */
    async updateLeaderboardDisplay() {
        const tbody = document.getElementById('leaderboardBody');
        const statsEl = document.getElementById('leaderboardStats');
        
        if (!tbody) return;
        
        // Fetch fresh data if API is available
        if (this.isApiAvailable) {
            this.leaderboard = await fetchLeaderboard(10);
            const stats = await fetchStats();
            
            if (stats && statsEl) {
                statsEl.innerHTML = `
                    <span>TOTAL GAMES: ${stats.totalGames}</span>
                    <span>PILOTS: ${stats.totalPlayers}</span>
                    <span>TOP SCORE: ${stats.highestScore}</span>
                `;
            }
        }
        
        if (this.leaderboard.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading-text">NO SCORES YET</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.leaderboard.map((score, index) => {
            const isCurrentUser = score.username === this.username;
            return `
                <tr class="${isCurrentUser ? 'current-user' : ''}">
                    <td>${index + 1}</td>
                    <td>${score.username}</td>
                    <td>${score.score.toLocaleString()}</td>
                    <td>${score.level || '-'}</td>
                </tr>
            `;
        }).join('');
    }
    
    /** Hides the game over screen */
    hideGameOver() {
        const screen = document.getElementById('gameOverScreen');
        if (screen) screen.style.display = 'none';
    }
    
    /** Shows the game over screen with score submission */
    async showGameOver() {
        const screen = document.getElementById('gameOverScreen');
        const finalScore = document.getElementById('finalScore');
        const rankDisplay = document.getElementById('rankDisplay');
        const rankText = document.getElementById('rankText');
        
        if (screen) screen.style.display = 'flex';
        if (finalScore) finalScore.textContent = this.score.toLocaleString();
        
        // Submit score to leaderboard
        if (this.isApiAvailable && this.username) {
            const result = await submitScore(this.username, this.score, this.level);
            
            if (result.success && rankDisplay && rankText) {
                rankDisplay.style.display = 'block';
                
                if (result.isPersonalBest) {
                    rankText.className = 'rank-text new-record';
                    rankText.textContent = `NEW PERSONAL BEST! RANK #${result.rank}`;
                } else {
                    rankText.className = 'rank-text';
                    rankText.textContent = `GLOBAL RANK: #${result.rank}`;
                }
            }
        } else {
            if (rankDisplay) rankDisplay.style.display = 'none';
        }
    }

    resetLevel() {
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.explosions = [];
        this.waveState = 'ENTRY';
        this.generateWave();
    }

    generateWave() {
        // Create enemies based on level config
        // This is a simplified version of the complex Galaga wave patterns
        const layout = FORMATION.LAYOUT;
        this.enemiesToSpawn = [];
        
        let idCounter = 0;
        
        layout.forEach((row, rowIndex) => {
            for (let i = 0; i < row.count; i++) {
                // Calculate grid position
                const colOffset = (FORMATION.COLS - row.count) / 2;
                const gridX = colOffset + i;
                const gridY = rowIndex;
                
                this.enemiesToSpawn.push({
                    id: idCounter++,
                    type: row.type,
                    gridX: gridX,
                    gridY: gridY,
                    x: -50, // Start off screen
                    y: -50,
                    state: 'ENTRY',
                    pathIndex: 0
                });
            }
        });
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() < 0.9 ? 1 : 2,
                speed: Math.random() * 2 + 0.5,
                color: Math.random() < 0.8 ? '#ffffff' : (Math.random() < 0.5 ? '#ff0000' : '#0000ff') // Twinkling stars
            });
        }
    }

    tryFire() {
        if (this.state !== 'PLAYING' || this.player.state !== 'ALIVE') return;
        
        const now = Date.now();
        const maxBullets = this.player.isDual ? 4 : 2;
        
        if (this.bullets.length < maxBullets && now - this.lastFireTime > 200) {
            audio.shoot();
            
            if (this.player.isDual) {
                this.bullets.push({ x: this.player.x - 10, y: this.player.y, speed: 10, active: true });
                this.bullets.push({ x: this.player.x + 10, y: this.player.y, speed: 10, active: true });
            } else {
                this.bullets.push({ x: this.player.x, y: this.player.y - 10, speed: 10, active: true });
            }
            
            this.lastFireTime = now;
        }
    }

    update(dt) {
        this.frameCount++;
        
        // Update Stars (always moving)
        this.stars.forEach(star => {
            star.y += star.speed * (this.state === 'PLAYING' && this.waveState === 'ENTRY' ? 3 : 1); // Warp speed effect
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });

        if (this.state !== 'PLAYING') return;

        // Player Movement
        if (this.player.state === 'ALIVE') {
            if (this.keys.left) this.player.x -= this.player.speed;
            if (this.keys.right) this.player.x += this.player.speed;
            
            // Clamp to screen
            const margin = 20;
            if (this.player.x < margin) this.player.x = margin;
            if (this.player.x > this.canvas.width - margin) this.player.x = this.canvas.width - margin;
        }

        // Update Bullets
        this.bullets.forEach(b => b.y -= b.speed);
        this.bullets = this.bullets.filter(b => b.y > -20 && b.active);

        // Spawn Enemies
        if (this.enemiesToSpawn.length > 0 && this.frameCount % 10 === 0) {
            const enemy = this.enemiesToSpawn.shift();
            // Calculate target formation position
            const targetX = (this.canvas.width / 2) - (FORMATION.COLS * FORMATION.CELL_WIDTH / 2) + (enemy.gridX * FORMATION.CELL_WIDTH);
            const targetY = FORMATION.TOP_OFFSET + (enemy.gridY * FORMATION.CELL_HEIGHT);
            
            enemy.targetX = targetX;
            enemy.targetY = targetY;
            enemy.x = targetX; // Simplified entry for now
            enemy.y = targetY;
            enemy.state = 'FORMATION';
            
            this.enemies.push(enemy);
        }

        // Update Enemies
        const time = Date.now() * 0.001;
        this.enemies.forEach(enemy => {
            // Breathing animation in formation
            if (enemy.state === 'FORMATION') {
                enemy.x = enemy.targetX + Math.sin(time * 2) * 10;
            }
            
            // Random diving attacks
            if (enemy.state === 'FORMATION' && Math.random() < 0.001) {
                enemy.state = 'DIVING';
                enemy.diveStartX = enemy.x;
                enemy.diveStartY = enemy.y;
                enemy.diveTime = 0;
                audio.dive();
            }
            
            if (enemy.state === 'DIVING') {
                enemy.diveTime += 0.05;
                // Simple bezier curve dive
                enemy.y += 3;
                enemy.x += Math.sin(enemy.diveTime) * 5;
                
                if (enemy.y > this.canvas.height) {
                    // Return to formation
                    enemy.y = 0;
                    enemy.state = 'FORMATION';
                }
            }
        });

        // Collision Detection
        this.checkCollisions();
        
        // Level Clear Check
        if (this.enemies.length === 0 && this.enemiesToSpawn.length === 0) {
            this.levelComplete();
        }
    }

    checkCollisions() {
        // Bullets vs Enemies
        this.bullets.forEach(bullet => {
            this.enemies.forEach(enemy => {
                if (!bullet.active || enemy.state === 'DEAD') return;
                
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 20) {
                    bullet.active = false;
                    this.destroyEnemy(enemy);
                }
            });
        });
        
        // Enemies vs Player
        if (this.player.state === 'ALIVE' && !this.player.isInvincible) {
            this.enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 25) {
                    this.killPlayer();
                }
            });
        }
    }

    destroyEnemy(enemy) {
        enemy.state = 'DEAD';
        this.enemies = this.enemies.filter(e => e !== enemy);
        
        // Score
        let points = SCORING[enemy.type].FORMATION;
        if (enemy.state === 'DIVING') points = SCORING[enemy.type].DIVING;
        this.score += points;
        
        // Explosion
        this.explosions.push({
            x: enemy.x,
            y: enemy.y,
            timer: 0,
            color: enemy.type === ENEMY_TYPE.BOSS ? '#ff0000' : '#ffff00'
        });
        
        audio.enemyExplosion(enemy.type);
    }

    killPlayer() {
        this.player.state = 'EXPLODING';
        audio.playerDeath();
        
        this.explosions.push({
            x: this.player.x,
            y: this.player.y,
            timer: 0,
            isPlayer: true
        });
        
        setTimeout(() => {
            this.lives--;
            if (this.lives > 0) {
                this.player.state = 'ALIVE';
                this.player.isInvincible = true;
                this.player.x = this.canvas.width / 2;
                setTimeout(() => this.player.isInvincible = false, 3000);
            } else {
                this.state = 'GAME_OVER';
                CookieManager.set(Math.max(this.score, this.highScore));
                this.showGameOver();
            }
        }, 2000);
    }

    levelComplete() {
        this.state = 'LEVEL_TRANSITION';
        setTimeout(() => {
            this.level++;
            this.resetLevel();
            this.state = 'PLAYING';
        }, 3000);
    }

    draw() {
        // Clear screen
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawStars();
        
        if (this.state === 'MENU') {
            // Draw Logo
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '40px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GALAGA', this.canvas.width/2, this.canvas.height/3);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.fillText('PRESS START', this.canvas.width/2, this.canvas.height/2);
            return;
        }
        
        // Draw Entities
        if (this.player.state === 'ALIVE') {
            drawPlayer(this.ctx, this.player, this.frameCount);
        }
        
        this.enemies.forEach(enemy => {
            enemy.frame = this.frameCount;
            drawAlien(this.ctx, enemy);
        });
        
        this.bullets.forEach(bullet => {
            drawBullet(this.ctx, bullet);
        });
        
        // Draw Explosions
        this.explosions.forEach((exp, index) => {
            drawExplosion(this.ctx, exp);
            exp.timer++;
            if (exp.timer > 20) this.explosions.splice(index, 1);
        });
        
        this.drawUI();
        
        if (this.state === 'READY') {
            drawReadyMessage(this.ctx, this.canvas.width, this.canvas.height);
        }
        
        if (this.state === 'GAME_OVER') {
            drawGameOver(this.ctx, this.canvas.width, this.canvas.height, this.score);
        }
    }

    drawStars() {
        this.stars.forEach(star => drawStar(this.ctx, star));
    }

    drawUI() {
        drawScore(this.ctx, this.score, this.highScore);
        drawLives(this.ctx, this.lives, this.canvas.height);
        drawLevelFlags(this.ctx, this.level, this.canvas.height, this.canvas.width);
    }

    loop(timestamp) {
        // Skip rendering when tab is hidden
        if (!this.isVisible) {
            requestAnimationFrame(this.loop);
            return;
        }
        
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame(this.loop);
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        audio.isMuted = this.isMuted;
        
        // Update mute button icon
        const muteIcon = document.getElementById('muteIcon');
        const muteBtn = document.getElementById(SELECTORS.BUTTONS.MUTE);
        if (muteIcon) {
            muteIcon.className = this.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        }
        if (muteBtn) {
            muteBtn.classList.toggle('muted', this.isMuted);
        }
    }
}

// Start the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new GalagaGame();
});
