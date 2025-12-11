// Galaga - Sprite rendering functions

import { COLORS, SPRITE_SIZE, ENEMY_TYPE } from './config.js';

// Helper: draws path from points array

/**
 * Draws filled/stroked path from points array
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<[number, number]>} points - Array of [x, y] coordinates
 * @param {string} color - Fill or stroke color
 * @param {boolean} [fill=true] - Whether to fill (true) or stroke (false)
 */
function drawPath(ctx, points, color, fill = true) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

// ============================================================================
// PLAYER SHIP RENDERER
// ============================================================================

/**
 * Draws the player's fighter ship (authentic Galaga style)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} player - Player object with position and state
 * @param {number} frame - Animation frame for engine glow
 */
export function drawPlayer(ctx, player, frame = 0) {
    if (!player) return;
    
    const { x, y, width = 32, isInvincible, invincibleTimer, isDual } = player;
    
    // Flicker when invincible
    if (isInvincible && Math.floor(invincibleTimer / 5) % 2 === 0) return;

    ctx.save();
    
    // Draw single or dual ships
    const shipOffsets = isDual ? [-14, 14] : [0];
    
    shipOffsets.forEach(offsetX => {
        ctx.save();
        ctx.translate(x + offsetX, y);

        const s = width / 2;
        
        // Engine glow animation
        const engineTime = frame * 0.1;
        const flicker = 0.7 + Math.sin(engineTime) * 0.3;
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.PLAYER?.SECONDARY || '#06b6d4';
        
        // Main body (white)
        ctx.fillStyle = COLORS.PLAYER?.PRIMARY || '#FFFFFF';
        
        // Nose cone
        drawPath(ctx, [
            [0, -s * 0.9],
            [-s * 0.2, -s * 0.4],
            [s * 0.2, -s * 0.4]
        ], COLORS.PLAYER?.PRIMARY || '#FFFFFF');
        
        // Body
        ctx.fillRect(-s * 0.2, -s * 0.4, s * 0.4, s * 0.7);
        
        // Wings (cyan)
        ctx.fillStyle = COLORS.PLAYER?.SECONDARY || '#06b6d4';
        
        // Left wing
        drawPath(ctx, [
            [-s * 0.2, -s * 0.2],
            [-s * 0.9, s * 0.3],
            [-s * 0.9, s * 0.5],
            [-s * 0.2, s * 0.2]
        ], COLORS.PLAYER?.SECONDARY || '#06b6d4');
        
        // Right wing
        drawPath(ctx, [
            [s * 0.2, -s * 0.2],
            [s * 0.9, s * 0.3],
            [s * 0.9, s * 0.5],
            [s * 0.2, s * 0.2]
        ], COLORS.PLAYER?.SECONDARY || '#06b6d4');
        
        // Cockpit (bright cyan)
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.3, s * 0.1, s * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine pods
        ctx.fillStyle = '#334155';
        ctx.fillRect(-s * 0.35, s * 0.1, s * 0.12, s * 0.35);
        ctx.fillRect(s * 0.23, s * 0.1, s * 0.12, s * 0.35);
        
        // Engine glow
        const engineGrad = ctx.createLinearGradient(0, s * 0.4, 0, s * 0.9);
        engineGrad.addColorStop(0, 'rgba(255, 69, 0, 0.9)');
        engineGrad.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)');
        engineGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = engineGrad;
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 10;
        
        // Engine flames
        drawPath(ctx, [
            [-s * 0.1, s * 0.4],
            [s * 0.1, s * 0.4],
            [s * 0.05, s * (0.4 + 0.5 * flicker)],
            [-s * 0.05, s * (0.4 + 0.5 * flicker)]
        ], engineGrad);
        
        ctx.restore();
    });
    
    ctx.restore();
}

/**
 * Draws a captured player ship (held by Boss)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} frame - Animation frame
 */
export function drawCapturedShip(ctx, x, y, frame) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI); // Upside down
    ctx.globalAlpha = 0.8;
    
    // Simplified red-tinted ship
    ctx.fillStyle = '#FF6666';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 10;
    
    drawPath(ctx, [
        [0, -10],
        [-10, 10],
        [0, 5],
        [10, 10]
    ], '#FF6666');
    
    ctx.restore();
}

// ============================================================================
// ENEMY SPRITE RENDERERS
// ============================================================================

/**
 * Draws a Bee (Zako) enemy - blue body with yellow accents
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {number} frame - Animation frame (wing flap)
 */
export function drawBee(ctx, x, y, frame = 0) {
    const wingFrame = Math.floor(frame / 8) % 2;
    
    ctx.save();
    ctx.translate(x, y);
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = COLORS.BEE?.PRIMARY || '#4169E1';
    
    // Wings (animated)
    const wingColor = COLORS.BEE?.SECONDARY || '#FFD700';
    const wingAngle = wingFrame ? 0.3 : -0.3;
    
    // Left wing
    ctx.save();
    ctx.rotate(-0.4 + wingAngle);
    ctx.fillStyle = wingColor;
    ctx.fillRect(-14, -3, 9, 6);
    ctx.restore();
    
    // Right wing
    ctx.save();
    ctx.rotate(0.4 - wingAngle);
    ctx.fillStyle = wingColor;
    ctx.fillRect(5, -3, 9, 6);
    ctx.restore();
    
    // Body (blue)
    ctx.fillStyle = COLORS.BEE?.PRIMARY || '#4169E1';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -9, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-4, -11, 3, 3);
    ctx.fillRect(1, -11, 3, 3);
    
    // Antennae
    ctx.strokeStyle = wingColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, -13);
    ctx.lineTo(-5, -17);
    ctx.moveTo(3, -13);
    ctx.lineTo(5, -17);
    ctx.stroke();
    
    ctx.restore();
}

/**
 * Draws a Butterfly (Goei) enemy - red/purple with fancy wings
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {number} frame - Animation frame
 */
export function drawButterfly(ctx, x, y, frame = 0) {
    const wingFrame = Math.floor(frame / 6) % 2;
    
    ctx.save();
    ctx.translate(x, y);
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.BUTTERFLY?.PRIMARY || '#DC143C';
    
    const wingSpread = wingFrame ? 0.2 : -0.1;
    const primaryColor = COLORS.BUTTERFLY?.PRIMARY || '#DC143C';
    const secondaryColor = COLORS.BUTTERFLY?.SECONDARY || '#9932CC';
    
    // Wings (larger, decorative)
    ctx.fillStyle = secondaryColor;
    
    // Left wing
    ctx.save();
    ctx.rotate(-0.5 + wingSpread);
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.quadraticCurveTo(-16, -8, -12, 4);
    ctx.quadraticCurveTo(-7, 2, -4, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Right wing
    ctx.save();
    ctx.rotate(0.5 - wingSpread);
    ctx.beginPath();
    ctx.moveTo(4, -5);
    ctx.quadraticCurveTo(16, -8, 12, 4);
    ctx.quadraticCurveTo(7, 2, 4, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Wing patterns
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(-9, -3, 3, 0, Math.PI * 2);
    ctx.arc(9, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-3, -12, 2, 2);
    ctx.fillRect(1, -12, 2, 2);
    
    // Curled antennae
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, -13);
    ctx.quadraticCurveTo(-7, -18, -4, -20);
    ctx.moveTo(3, -13);
    ctx.quadraticCurveTo(7, -18, 4, -20);
    ctx.stroke();
    
    ctx.restore();
}

/**
 * Draws a Boss Galaga enemy - green with crown, can capture ships
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {number} frame - Animation frame
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.hasCapturedShip=false] - Whether holding captured ship
 * @param {boolean} [options.isHit=false] - Whether boss was hit once (changes color)
 */
export function drawBoss(ctx, x, y, frame = 0, options = {}) {
    const { hasCapturedShip = false, isHit = false } = options;
    const wingFrame = Math.floor(frame / 10) % 2;
    
    ctx.save();
    ctx.translate(x, y);
    
    const primaryColor = isHit ? '#4169E1' : (COLORS.BOSS?.PRIMARY || '#228B22');
    const secondaryColor = COLORS.BOSS?.SECONDARY || '#00BFFF';
    
    ctx.shadowBlur = 12;
    ctx.shadowColor = primaryColor;
    
    // If has captured ship, draw it below
    if (hasCapturedShip) {
        drawCapturedShip(ctx, 0, 28, frame);
    }
    
    const wingAngle = wingFrame ? 0.15 : -0.15;
    
    // Large wings
    ctx.fillStyle = secondaryColor;
    
    // Left wing
    ctx.save();
    ctx.rotate(-0.3 + wingAngle);
    drawPath(ctx, [
        [-5, -4], [-18, -7], [-20, 0], [-18, 7], [-5, 5]
    ], secondaryColor);
    ctx.restore();
    
    // Right wing
    ctx.save();
    ctx.rotate(0.3 - wingAngle);
    drawPath(ctx, [
        [5, -4], [18, -7], [20, 0], [18, 7], [5, 5]
    ], secondaryColor);
    ctx.restore();
    
    // Body (larger)
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 2, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -10, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Crown (boss indicator)
    ctx.fillStyle = COLORS.BOSS?.CROWN || '#FFD700';
    ctx.shadowColor = '#FFD700';
    drawPath(ctx, [
        [-7, -15], [-5, -21], [-2, -17], [0, -23], [2, -17], [5, -21], [7, -15]
    ], COLORS.BOSS?.CROWN || '#FFD700');
    
    // Eyes (menacing red)
    ctx.fillStyle = COLORS.BOSS?.EYES || '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.beginPath();
    ctx.arc(-3, -10, 2.5, 0, Math.PI * 2);
    ctx.arc(3, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye pupils
    ctx.fillStyle = '#000';
    ctx.fillRect(-4, -11, 2, 2);
    ctx.fillRect(2, -11, 2, 2);
    
    ctx.restore();
}

/**
 * Draws appropriate enemy based on type
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} enemy - Enemy object with type, x, y, frame properties
 */
export function drawEnemy(ctx, enemy) {
    const { type, x, y, frame = 0, hasCapturedShip = false, isHit = false } = enemy;
    
    switch (type) {
        case ENEMY_TYPE.BEE:
        case 'bee':
            drawBee(ctx, x, y, frame);
            break;
        case ENEMY_TYPE.BUTTERFLY:
        case 'butterfly':
            drawButterfly(ctx, x, y, frame);
            break;
        case ENEMY_TYPE.BOSS:
        case 'boss':
            drawBoss(ctx, x, y, frame, { hasCapturedShip, isHit });
            break;
    }
}

// ============================================================================
// PROJECTILE RENDERERS
// ============================================================================

/**
 * Draws a player bullet
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} bullet - Bullet with x, y, width, height
 */
export function drawBullet(ctx, bullet) {
    ctx.save();
    
    // Bright white with glow
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 8;
    
    ctx.fillRect(
        bullet.x - (bullet.width || 2) / 2,
        bullet.y - (bullet.height || 10) / 2,
        bullet.width || 4,
        bullet.height || 10
    );
    
    ctx.restore();
}

/**
 * Draws an enemy bullet
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} bullet - Bullet with x, y properties
 * @param {number} frame - Animation frame
 */
export function drawEnemyBullet(ctx, bullet, frame = 0) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(frame * 0.2);
    
    // Red/orange rotating projectile
    ctx.fillStyle = '#FF4500';
    ctx.shadowColor = '#FF4500';
    ctx.shadowBlur = 6;
    ctx.fillRect(-3, -3, 6, 6);
    
    // Inner core
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-2, -2, 4, 4);
    
    ctx.restore();
}

// ============================================================================
// EFFECT RENDERERS
// ============================================================================

/**
 * Draws an explosion particle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} particle - Particle with x, y, size, life, color
 */
export function drawParticle(ctx, particle) {
    ctx.save();
    ctx.globalAlpha = particle.life || 1;
    ctx.fillStyle = particle.color || '#FFD700';
    ctx.shadowBlur = 5;
    ctx.shadowColor = particle.color || '#FFD700';
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, (particle.size || 3) * (particle.life || 1), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

/**
 * Draws explosion effect at position
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} explosion - Explosion object with x, y, timer properties
 * @param {number} [maxFrames=20] - Total animation frames
 */
export function drawExplosion(ctx, explosion, maxFrames = 20) {
    const { x, y, timer: frame, isPlayer = false, color = '#FFD700' } = explosion;
    const progress = frame / maxFrames;
    const radius = 8 + progress * (isPlayer ? 40 : 24);
    const alpha = 1 - progress;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    
    const colors = isPlayer 
        ? ['#FFFFFF', '#06b6d4', '#FF4500', '#FFD700']
        : ['#FF4500', '#FFD700', '#FF6347', '#FFFFFF'];
    
    // Explosion rings
    for (let i = 0; i < 3; i++) {
        const ringRadius = radius * (1 - i * 0.2);
        const colorIndex = (i + Math.floor(frame / 3)) % colors.length;
        
        ctx.fillStyle = colors[colorIndex];
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Debris particles
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + frame * 0.1;
        const dist = radius * 1.2;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(px - 2, py - 2, 4, 4);
    }
    
    ctx.restore();
}

/**
 * Draws tractor beam effect from Boss Galaga
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Boss center X position
 * @param {number} y - Boss bottom Y position
 * @param {number} frame - Animation frame
 * @param {number} beamHeight - Current beam height
 */
export function drawTractorBeam(ctx, x, y, frame, beamHeight) {
    ctx.save();
    ctx.translate(x, y);
    
    // Beam width oscillates
    const widthMod = Math.sin(frame * 0.3) * 8;
    const halfWidth = 20 + widthMod;
    
    // Gradient beam
    const gradient = ctx.createLinearGradient(0, 0, 0, beamHeight);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
    
    ctx.fillStyle = gradient;
    
    // Expanding beam shape
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-halfWidth, beamHeight);
    ctx.lineTo(halfWidth, beamHeight);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();
    
    // Scan lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < beamHeight; i += 8) {
        const lineY = i + (frame % 8);
        if (lineY < beamHeight) {
            const lineWidth = 6 + (halfWidth - 6) * (lineY / beamHeight);
            ctx.beginPath();
            ctx.moveTo(-lineWidth, lineY);
            ctx.lineTo(lineWidth, lineY);
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

/**
 * Draws a background star
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} star - Star with x, y, size properties
 */
export function drawStar(ctx, star) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
    ctx.fillRect(star.x, star.y, star.size || 1, star.size || 1);
    ctx.restore();
}

// ============================================================================
// UI RENDERERS
// ============================================================================

/**
 * Draws game text with glow effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to display
 * @param {number} x - Center X position
 * @param {number} y - Y position
 * @param {Object} [options] - Style options
 */
export function drawGameText(ctx, text, x, y, options = {}) {
    const { color = '#FFFFFF', size = 24, align = 'center' } = options;
    
    ctx.save();
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(text, x, y);
    ctx.restore();
}

/**
 * Draws stage indicator flags (like original Galaga)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Starting X position
 * @param {number} y - Y position
 * @param {number} stage - Current stage number
 */
export function drawStageFlags(ctx, x, y, stage) {
    ctx.save();
    ctx.translate(x, y);
    
    const flags = [];
    let remaining = stage;
    
    // Calculate flag breakdown (like original arcade)
    while (remaining >= 50) { flags.push({ size: 16, color: '#FFD700' }); remaining -= 50; }
    while (remaining >= 30) { flags.push({ size: 14, color: '#FF4500' }); remaining -= 30; }
    while (remaining >= 20) { flags.push({ size: 12, color: '#9932CC' }); remaining -= 20; }
    while (remaining >= 10) { flags.push({ size: 10, color: '#00BFFF' }); remaining -= 10; }
    while (remaining >= 5) { flags.push({ size: 8, color: '#4169E1' }); remaining -= 5; }
    while (remaining >= 1) { flags.push({ size: 6, color: '#228B22' }); remaining -= 1; }
    
    // Draw flags from right to left
    let offsetX = 0;
    flags.reverse().forEach(flag => {
        ctx.fillStyle = flag.color;
        
        // Flag shape
        ctx.beginPath();
        ctx.moveTo(-offsetX, 0);
        ctx.lineTo(-offsetX - flag.size, 0);
        ctx.lineTo(-offsetX - flag.size, -flag.size);
        ctx.lineTo(-offsetX - flag.size / 2, -flag.size * 0.7);
        ctx.lineTo(-offsetX, -flag.size);
        ctx.closePath();
        ctx.fill();
        
        offsetX += flag.size + 3;
    });
    
    ctx.restore();
}

// Keep backward compatibility with old renderer names
export const drawAlien = drawEnemy; // Changed to drawEnemy to handle all types
export const drawKamikaze = drawButterfly;
export const drawAsteroid = (ctx, enemy) => {
    // Fallback for old asteroid code - draw as butterfly
    drawButterfly(ctx, enemy.x, enemy.y, enemy.frame || 0);
};

export function drawScore(ctx, score, highScore) {
    drawGameText(ctx, 'HIGH SCORE', ctx.canvas.width / 2, 20, { color: '#FF0000', size: 14 });
    drawGameText(ctx, highScore.toString(), ctx.canvas.width / 2, 40, { color: '#FFFFFF', size: 14 });
    
    drawGameText(ctx, '1UP', 60, 20, { color: '#FF0000', size: 14, align: 'left' });
    drawGameText(ctx, score.toString(), 60, 40, { color: '#FFFFFF', size: 14, align: 'left' });
}

export function drawLives(ctx, lives, height) {
    const startX = 20;
    const y = height - 20;
    
    for (let i = 0; i < Math.max(0, lives - 1); i++) {
        // Draw mini player ship
        const x = startX + i * 30;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(0.8, 0.8);
        
        // Simple ship shape
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, 8);
        ctx.lineTo(0, 4);
        ctx.lineTo(8, 8);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-8, 8);
        ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(8, 8);
        ctx.lineTo(3, 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

export const drawLevelFlags = (ctx, level, height, width) => {
    drawStageFlags(ctx, width - 30, height - 20, level);
};

export function drawReadyMessage(ctx, width, height) {
    drawGameText(ctx, 'READY', width / 2, height / 2, { color: '#06b6d4', size: 24 });
}

export function drawGameOver(ctx, width, height, score) {
    drawGameText(ctx, 'GAME OVER', width / 2, height / 2 - 20, { color: '#FF0000', size: 32 });
    drawGameText(ctx, 'RESULTS', width / 2, height / 2 + 20, { color: '#FFFF00', size: 16 });
    
    drawGameText(ctx, 'SHOTS FIRED', width / 2 - 50, height / 2 + 50, { color: '#06b6d4', size: 12, align: 'right' });
    drawGameText(ctx, 'HITS', width / 2 - 50, height / 2 + 70, { color: '#06b6d4', size: 12, align: 'right' });
    drawGameText(ctx, 'RATIO', width / 2 - 50, height / 2 + 90, { color: '#06b6d4', size: 12, align: 'right' });
    
    // Placeholder stats (would need to track these in game.js)
    drawGameText(ctx, '---', width / 2 + 50, height / 2 + 50, { color: '#FFFFFF', size: 12, align: 'left' });
    drawGameText(ctx, '---', width / 2 + 50, height / 2 + 70, { color: '#FFFFFF', size: 12, align: 'left' });
    drawGameText(ctx, '---', width / 2 + 50, height / 2 + 90, { color: '#FFFFFF', size: 12, align: 'left' });
}

