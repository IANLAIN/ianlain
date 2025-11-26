/**
 * Galaga Entity Renderers
 * Drawing functions for game entities
 */

import { COLORS } from './config.js';

/**
 * Draw a path from points array
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - Array of [x, y] coordinates
 * @param {string} color - Fill color
 * @param {boolean} fill - Whether to fill or stroke
 */
export function drawPath(ctx, points, color, fill = true) {
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

/**
 * Draw the player spaceship
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} player - Player object
 */
export function drawPlayer(ctx, player) {
    if (!player) return;
    
    const { x, y, width, isInvincible, invincibleTimer } = player;
    
    // Flicker when invincible
    if (isInvincible && Math.floor(invincibleTimer / 5) % 2 === 0) return;

    ctx.save();
    ctx.translate(x, y);

    const s = width / 2;
    
    // Shadow glow
    ctx.shadowBlur = 25;
    ctx.shadowColor = COLORS.CYAN;
    
    // Main fuselage
    drawPath(ctx, [
        [0, -s * 1.2], [s * 0.25, -s * 0.6], [s * 0.25, s * 0.6],
        [0, s * 0.8], [-s * 0.25, s * 0.6], [-s * 0.25, -s * 0.6]
    ], COLORS.DARK_BG);
    
    // Fuselage highlight
    drawPath(ctx, [
        [0, -s * 1.1], [s * 0.15, -s * 0.5], [s * 0.15, s * 0.4],
        [-s * 0.15, s * 0.4], [-s * 0.15, -s * 0.5]
    ], '#1e293b');
    
    // Wings
    drawPath(ctx, [
        [-s * 0.25, -s * 0.3], [-s * 1.1, s * 0.5], 
        [-s * 1.1, s * 0.7], [-s * 0.25, s * 0.5]
    ], COLORS.CYAN);
    drawPath(ctx, [
        [s * 0.25, -s * 0.3], [s * 1.1, s * 0.5], 
        [s * 1.1, s * 0.7], [s * 0.25, s * 0.5]
    ], COLORS.CYAN);
    
    // Wing details
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(-s * 1.0, s * 0.45, s * 0.6, s * 0.1);
    ctx.fillRect(s * 0.4, s * 0.45, s * 0.6, s * 0.1);
    
    // Cockpit gradient
    const cockpitGrad = ctx.createLinearGradient(0, -s * 0.8, 0, -s * 0.2);
    cockpitGrad.addColorStop(0, '#67e8f9');
    cockpitGrad.addColorStop(0.5, COLORS.CYAN);
    cockpitGrad.addColorStop(1, '#0e7490');
    ctx.fillStyle = cockpitGrad;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.5, s * 0.12, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine pods
    ctx.fillStyle = COLORS.DARK_GRAY;
    ctx.fillRect(-s * 0.35, s * 0.3, s * 0.15, s * 0.4);
    ctx.fillRect(s * 0.2, s * 0.3, s * 0.15, s * 0.4);
    
    // Engine glow animation
    const engineTime = Date.now() * 0.01;
    const flicker = 0.7 + Math.sin(engineTime) * 0.3;
    
    const engineGrad = ctx.createLinearGradient(0, s * 0.7, 0, s * 1.3);
    engineGrad.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
    engineGrad.addColorStop(0.3, 'rgba(52, 211, 153, 0.7)');
    engineGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.4)');
    engineGrad.addColorStop(1, 'transparent');
    
    ctx.shadowColor = COLORS.EMERALD;
    ctx.shadowBlur = 20;
    
    // Center engine
    drawPath(ctx, [
        [-s * 0.15, s * 0.7], [s * 0.15, s * 0.7],
        [s * 0.08, s * (0.7 + 0.5 * flicker)], [-s * 0.08, s * (0.7 + 0.5 * flicker)]
    ], engineGrad);
    
    // Side engines
    drawPath(ctx, [
        [-s * 0.35, s * 0.65], [-s * 0.22, s * 0.65],
        [-s * 0.25, s * (0.65 + 0.35 * flicker)], [-s * 0.32, s * (0.65 + 0.35 * flicker)]
    ], engineGrad);
    
    drawPath(ctx, [
        [s * 0.22, s * 0.65], [s * 0.35, s * 0.65],
        [s * 0.32, s * (0.65 + 0.35 * flicker)], [s * 0.25, s * (0.65 + 0.35 * flicker)]
    ], engineGrad);

    ctx.restore();
}

/**
 * Draw an alien ship
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} enemy - Enemy object
 */
export function drawAlien(ctx, enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(Math.PI);

    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.PURPLE;

    const s = enemy.width / 2;
    
    // Main body
    drawPath(ctx, [
        [0, -s * 0.8], [s * 0.3, -s * 0.3], [s * 0.3, s * 0.5],
        [-s * 0.3, s * 0.5], [-s * 0.3, -s * 0.3]
    ], COLORS.PURPLE);
    
    // Wings
    drawPath(ctx, [
        [-s * 0.3, -s * 0.2], [-s * 0.9, s * 0.3], 
        [-s * 0.9, s * 0.6], [-s * 0.3, s * 0.4]
    ], '#7c3aed');
    drawPath(ctx, [
        [s * 0.3, -s * 0.2], [s * 0.9, s * 0.3], 
        [s * 0.9, s * 0.6], [s * 0.3, s * 0.4]
    ], '#7c3aed');
    
    // Cockpit
    ctx.fillStyle = COLORS.RED;
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing tips
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(-s * 0.95, s * 0.35, s * 0.15, s * 0.3);
    ctx.fillRect(s * 0.8, s * 0.35, s * 0.15, s * 0.3);
    
    // Engine glow
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.fillRect(-s * 0.15, s * 0.5, s * 0.3, s * 0.2 + Math.random() * s * 0.15);

    ctx.restore();
}

/**
 * Draw an asteroid
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} enemy - Enemy object
 */
export function drawAsteroid(ctx, enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.rotation);

    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.YELLOW;

    const s = enemy.width / 2;
    
    // Irregular shape
    drawPath(ctx, [
        [0, -s], [s * 0.7, -s * 0.5], [s, 0], [s * 0.6, s * 0.7],
        [0, s], [-s * 0.7, s * 0.6], [-s, 0], [-s * 0.5, -s * 0.7]
    ], COLORS.GRAY);

    // Craters
    ctx.fillStyle = COLORS.LIGHT_GRAY;
    ctx.beginPath();
    ctx.arc(-s * 0.2, -s * 0.2, s * 0.15, 0, Math.PI * 2);
    ctx.arc(s * 0.3, s * 0.2, s * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draw a kamikaze enemy
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} enemy - Enemy object
 */
export function drawKamikaze(ctx, enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(Math.PI);

    ctx.shadowBlur = 20;
    ctx.shadowColor = COLORS.RED;

    const s = enemy.width / 2;
    
    // Main body
    drawPath(ctx, [
        [0, -s], [s * 0.5, s * 0.5], [0, s * 0.2], [-s * 0.5, s * 0.5]
    ], COLORS.RED);
    
    // Spikes
    drawPath(ctx, [
        [-s * 0.5, -s * 0.2], [-s * 0.8, 0], [-s * 0.4, 0.2]
    ], '#b91c1c');
    drawPath(ctx, [
        [s * 0.5, -s * 0.2], [s * 0.8, 0], [s * 0.4, 0.2]
    ], '#b91c1c');
    
    // Core
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine trail
    drawPath(ctx, [
        [-s * 0.2, s * 0.4], [0, s * 0.8 + Math.random() * s * 0.5], [s * 0.2, s * 0.4]
    ], '#f59e0b');

    ctx.restore();
}

/**
 * Draw a bullet
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} bullet - Bullet object
 */
export function drawBullet(ctx, bullet) {
    ctx.fillStyle = COLORS.EMERALD;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.EMERALD;
    ctx.fillRect(
        bullet.x - bullet.width / 2, 
        bullet.y - bullet.height / 2, 
        bullet.width, 
        bullet.height
    );
}

/**
 * Draw a particle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} particle - Particle object
 */
export function drawParticle(ctx, particle) {
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draw a star
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} star - Star object
 */
export function drawStar(ctx, star) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
}
