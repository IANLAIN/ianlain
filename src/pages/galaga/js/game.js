/**
 * Galaga Game Core
 * Main game logic and loop
 */

import { GAME_CONFIG, COLORS, SELECTORS, CookieManager } from './config.js';
import { audio } from './audio.js';
import { 
    drawPlayer, drawAlien, drawAsteroid, drawKamikaze, 
    drawBullet, drawParticle, drawStar 
} from './renderers.js';

class GalagaGame {
    constructor() {
        this.canvas = document.getElementById(SELECTORS.CANVAS);
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.highScore = CookieManager.get();
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        
        // Timers
        this.lastFireTime = 0;
        this.lastSpawnTime = 0;
        this.spawnRate = GAME_CONFIG.SPAWN_RATE;
        
        // Controls
        this.keys = { left: false, right: false };
        this.touchLeft = false;
        this.touchRight = false;
        this.isMuted = false;
        
        this.init();
    }

    init() {
        this.resize();
        this.createStars();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }

    setupEventListeners() {
        // Resize handler
        window.addEventListener('resize', () => {
            this.resize();
            this.createStars();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === ' ' && !this.isRunning && !this.isPaused) this.startGame();
            if (e.key === 'p' || e.key === 'P') this.togglePause();
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
        });

        // Touch controls
        this.setupTouchZone(SELECTORS.TOUCH.LEFT, 'touchLeft');
        this.setupTouchZone(SELECTORS.TOUCH.RIGHT, 'touchRight');

        // Buttons
        this.bindClick(SELECTORS.BUTTONS.START, () => this.startGame());
        this.bindClick(SELECTORS.BUTTONS.RESTART, () => this.startGame());
        this.bindClick(SELECTORS.BUTTONS.BACK, () => this.goBack());
        this.bindClick(SELECTORS.BUTTONS.BACK_2, () => this.goBack());
        this.bindClick(SELECTORS.BUTTONS.PAUSE, () => this.togglePause());
        this.bindClick(SELECTORS.BUTTONS.RESUME, () => this.togglePause());
        this.bindClick(SELECTORS.BUTTONS.QUIT, () => this.quitToMenu());
        this.bindClick(SELECTORS.BUTTONS.MUTE, () => this.toggleMute());
    }

    setupTouchZone(id, prop) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('touchstart', (e) => { 
                e.preventDefault(); 
                this[prop] = true; 
            });
            el.addEventListener('touchend', () => this[prop] = false);
        }
    }

    bindClick(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    }

    goBack() {
        window.location.href = '../../../index.html';
    }

    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        const pauseScreen = document.getElementById(SELECTORS.SCREENS.PAUSE);
        pauseScreen.classList.toggle('hidden', !this.isPaused);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        audio.setMasterVolume(this.isMuted ? 0 : 0.3);
        
        const icon = document.querySelector('#muteBtn i');
        if (icon) icon.className = this.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }

    quitToMenu() {
        this.togglePause();
        this.isRunning = false;
        audio.stopMusic();
        document.getElementById(SELECTORS.SCREENS.START).classList.remove('hidden');
    }

    updateHighScoreDisplay() {
        const el1 = document.getElementById(SELECTORS.HUD.HIGH_SCORE_START);
        const el2 = document.getElementById(SELECTORS.HUD.HIGH_SCORE);
        if (el1) el1.textContent = this.highScore;
        if (el2) el2.textContent = this.highScore;
    }

    startGame() {
        audio.init();
        audio.startMusic();
        
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.spawnRate = GAME_CONFIG.SPAWN_RATE;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        
        // Reset lives display
        document.querySelectorAll(SELECTORS.HUD.LIVES).forEach(icon => {
            icon.classList.remove('lost');
        });
        
        // Create player
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 50,
            height: 50,
            isInvincible: false,
            invincibleTimer: 0
        };

        // Hide all screens
        Object.values(SELECTORS.SCREENS).forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });
        
        document.getElementById(SELECTORS.HUD.SCORE).textContent = '0';
    }

    gameOver() {
        this.isRunning = false;
        audio.stopMusic();
        audio.gameOver();
        
        const newHighScore = this.score > this.highScore;
        if (newHighScore) {
            this.highScore = this.score;
            CookieManager.set(this.highScore);
            this.updateHighScoreDisplay();
        }

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('newHighScore').style.display = newHighScore ? 'block' : 'none';
        document.getElementById(SELECTORS.SCREENS.GAME_OVER).classList.remove('hidden');
    }

    loseLife() {
        this.lives--;
        
        const lifeIcons = document.querySelectorAll(SELECTORS.HUD.LIVES);
        lifeIcons[this.lives]?.classList.add('lost');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.isInvincible = true;
            this.player.invincibleTimer = 120;
            audio.playerHit();
            this.createExplosion(this.player.x, this.player.y, COLORS.CYAN);
        }
    }

    fire() {
        const now = Date.now();
        if (now - this.lastFireTime < GAME_CONFIG.FIRE_RATE) return;
        
        this.lastFireTime = now;
        audio.shoot();
        
        this.bullets.push({
            x: this.player.x,
            y: this.player.y - this.player.height / 2,
            width: 4,
            height: 15,
            speed: GAME_CONFIG.BULLET_SPEED
        });
    }

    spawnEnemy() {
        const now = Date.now();
        if (now - this.lastSpawnTime < this.spawnRate) return;
        
        this.lastSpawnTime = now;
        
        // Increase difficulty
        this.spawnRate = Math.max(GAME_CONFIG.MIN_SPAWN_RATE, this.spawnRate - 10);

        const rand = Math.random();
        let type = 'asteroid';
        let speed = GAME_CONFIG.ASTEROID_SPEED;
        let size = 30 + Math.random() * 30;

        if (rand > GAME_CONFIG.SPAWN_CHANCES.KAMIKAZE) {
            type = 'kamikaze';
            speed = GAME_CONFIG.ALIEN_SPEED * 1.5;
            size = 35;
        } else if (rand > GAME_CONFIG.SPAWN_CHANCES.ALIEN) {
            type = 'alien';
            speed = GAME_CONFIG.ALIEN_SPEED;
            size = 40;
        }
        
        this.enemies.push({
            x: Math.random() * (this.canvas.width - size) + size / 2,
            y: -size,
            width: size,
            height: size,
            speed,
            type,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.05
        });
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            const speed = Math.random() * 5 + 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color,
                life: 1
            });
        }
    }

    getExplosionColor(enemyType) {
        switch (enemyType) {
            case 'alien': return COLORS.PURPLE;
            case 'kamikaze': return COLORS.RED;
            default: return COLORS.YELLOW;
        }
    }

    handleEnemyDestruction(enemy) {
        this.createExplosion(enemy.x, enemy.y, this.getExplosionColor(enemy.type));
        audio.explosion();
    }

    checkCollision(obj1, obj2) {
        return Math.abs(obj1.x - obj2.x) < (obj1.width + obj2.width) / 2 &&
               Math.abs(obj1.y - obj2.y) < (obj1.height + obj2.height) / 2;
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // Update stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });

        // Player movement
        if (this.keys.left || this.touchLeft) {
            this.player.x = Math.max(
                this.player.width / 2, 
                this.player.x - GAME_CONFIG.PLAYER_SPEED
            );
        }
        if (this.keys.right || this.touchRight) {
            this.player.x = Math.min(
                this.canvas.width - this.player.width / 2, 
                this.player.x + GAME_CONFIG.PLAYER_SPEED
            );
        }

        // Invincibility countdown
        if (this.player.isInvincible) {
            this.player.invincibleTimer--;
            if (this.player.invincibleTimer <= 0) {
                this.player.isInvincible = false;
            }
        }

        // Auto fire
        this.fire();

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });

        // Spawn enemies
        this.spawnEnemy();

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            enemy.rotation += enemy.rotationSpeed;
            enemy.wobble += enemy.wobbleSpeed;
            
            if (enemy.type === 'alien') {
                enemy.x += Math.sin(enemy.wobble) * 2;
            } else if (enemy.type === 'kamikaze') {
                const dx = this.player.x - enemy.x;
                enemy.x += dx * 0.02;
                enemy.y += 1;
            }

            // Player collision
            if (!this.player.isInvincible && this.checkCollision(enemy, this.player)) {
                this.handleEnemyDestruction(enemy);
                this.loseLife();
                return false;
            }

            // Bullet collision
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                if (this.checkCollision(enemy, this.bullets[i])) {
                    this.bullets.splice(i, 1);
                    this.handleEnemyDestruction(enemy);
                    
                    let points = GAME_CONFIG.POINTS.ASTEROID;
                    if (enemy.type === 'alien') points = GAME_CONFIG.POINTS.ALIEN;
                    if (enemy.type === 'kamikaze') points = GAME_CONFIG.POINTS.KAMIKAZE;
                    
                    this.score += points;
                    document.getElementById(SELECTORS.HUD.SCORE).textContent = this.score;
                    return false;
                }
            }

            return enemy.y < this.canvas.height + enemy.height;
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vx *= 0.98;
            p.vy *= 0.98;
            return p.life > 0;
        });
    }

    draw() {
        const ctx = this.ctx;
        
        // Clear with trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars
        ctx.shadowBlur = 0;
        this.stars.forEach(star => drawStar(ctx, star));

        if (this.isRunning) {
            // Draw bullets
            this.bullets.forEach(bullet => drawBullet(ctx, bullet));

            // Draw enemies
            this.enemies.forEach(enemy => {
                switch (enemy.type) {
                    case 'alien': drawAlien(ctx, enemy); break;
                    case 'kamikaze': drawKamikaze(ctx, enemy); break;
                    default: drawAsteroid(ctx, enemy);
                }
            });

            // Draw player
            drawPlayer(ctx, this.player);

            // Draw particles
            this.particles.forEach(p => drawParticle(ctx, p));
            ctx.globalAlpha = 1;
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize game
const game = new GalagaGame();

export default game;
