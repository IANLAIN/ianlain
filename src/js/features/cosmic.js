// Cosmic background: animated stars, planets and shooting stars

import { random } from '../core/utils.js';

/** Renders animated cosmic background elements */
export class CosmicBackground {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.stars = [];
        this.planets = [];
        this.shootingStars = [];
        
        this.initStars();
        this.initPlanets();
    }
    
    initStars() {
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: random.between(0, this.canvas.width),
                y: random.between(0, this.canvas.height),
                size: random.between(0.5, 2.5),
                brightness: Math.random(),
                twinkleSpeed: random.between(0.01, 0.03),
                twinkleOffset: random.between(0, Math.PI * 2),
                layer: random.int(0, 2)
            });
        }
    }
    
    initPlanets() {
        const configs = [
            { baseSize: 30, color: '#ff6b6b', ringColor: '#feca57', hasRing: true },
            { baseSize: 20, color: '#54a0ff', ringColor: null, hasRing: false },
            { baseSize: 45, color: '#5f27cd', ringColor: '#a29bfe', hasRing: true }
        ];
        
        this.planets = configs.map((c, i) => ({
            x: random.between(0, this.canvas.width),
            y: random.between(0, this.canvas.height),
            baseSize: c.baseSize,
            size: c.baseSize,
            color: c.color,
            ringColor: c.ringColor,
            hasRing: c.hasRing,
            orbitSpeed: random.between(0.0002, 0.0007) * (i % 2 === 0 ? 1 : -1),
            orbitRadius: random.between(50, 150),
            orbitAngle: random.between(0, Math.PI * 2),
            centerX: random.between(0, this.canvas.width),
            centerY: random.between(0, this.canvas.height),
            depth: random.between(0.3, 0.8),
            glowIntensity: random.between(0.3, 0.8)
        }));
    }
    
    resize() {
        this.stars.forEach(star => {
            star.x = random.between(0, this.canvas.width);
            star.y = random.between(0, this.canvas.height);
        });
        this.planets.forEach(planet => {
            planet.centerX = random.between(0, this.canvas.width);
            planet.centerY = random.between(0, this.canvas.height);
        });
    }
    
    /** Randomly spawns shooting stars */
    addShootingStar() {
        if (random.bool(0.003) && this.shootingStars.length < 2) {
            this.shootingStars.push({
                x: random.between(0, this.canvas.width),
                y: 0,
                speed: random.between(8, 13),
                angle: random.between(Math.PI / 4, Math.PI / 4 + 0.5),
                length: random.between(50, 100),
                life: 1
            });
        }
    }
    
    /** Main render method - draws all cosmic elements */
    draw(time) {
        this.drawStars(time);
        this.drawPlanets(time);
        this.drawShootingStars();
        this.addShootingStar();
    }
    
    /** Simplified render - only stars (for performance) */
    drawSimplified(time) {
        this.drawStars(time);
    }
    
    /** Draws twinkling stars */
    drawStars(time) {
        this.stars.forEach(star => {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
            const brightness = 0.3 + (star.brightness + twinkle * 0.3) * 0.7;
            const size = star.size * (0.8 + twinkle * 0.2);
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.fill();
        });
    }
    
    /** Draws orbiting planets with glow */
    drawPlanets(time) {
        this.planets.forEach(planet => {
            planet.orbitAngle += planet.orbitSpeed;
            planet.x = planet.centerX + Math.cos(planet.orbitAngle) * planet.orbitRadius * planet.depth;
            planet.y = planet.centerY + Math.sin(planet.orbitAngle) * planet.orbitRadius * planet.depth * 0.3;
            planet.size = planet.baseSize * planet.depth;
            
            // Glow effect
            const glowGradient = this.ctx.createRadialGradient(
                planet.x, planet.y, planet.size * 0.5,
                planet.x, planet.y, planet.size * 2
            );
            glowGradient.addColorStop(0, planet.color.replace(')', `, ${planet.glowIntensity * 0.3})`).replace('rgb', 'rgba'));
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
            this.ctx.fillRect(planet.x - planet.size * 2, planet.y - planet.size * 2, planet.size * 4, planet.size * 4);
            
            // Planet body
            const bodyGradient = this.ctx.createRadialGradient(
                planet.x - planet.size * 0.3, planet.y - planet.size * 0.3, 0,
                planet.x, planet.y, planet.size
            );
            bodyGradient.addColorStop(0, planet.color);
            bodyGradient.addColorStop(1, this.darkenColor(planet.color, 0.5));
            
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
            this.ctx.fillStyle = bodyGradient;
            this.ctx.fill();
            
            // Ring if applicable
            if (planet.hasRing && planet.ringColor) {
                this.ctx.save();
                this.ctx.translate(planet.x, planet.y);
                this.ctx.scale(1, 0.3);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, planet.size * 1.8, 0, Math.PI * 2);
                this.ctx.strokeStyle = planet.ringColor;
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = 0.6;
                this.ctx.stroke();
                this.ctx.restore();
            }
        });
    }
    
    /** Draws and updates shooting star trails */
    drawShootingStars() {
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.life -= 0.02;
            
            if (star.life <= 0 || star.x > this.canvas.width || star.y > this.canvas.height) {
                return false;
            }
            
            // Trail
            const gradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x - Math.cos(star.angle) * star.length,
                star.y - Math.sin(star.angle) * star.length
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(
                star.x - Math.cos(star.angle) * star.length,
                star.y - Math.sin(star.angle) * star.length
            );
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Head
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.life})`;
            this.ctx.fill();
            
            return true;
        });
    }
    
    /** Darkens hex color by factor */
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substring(0, 2), 16) * factor);
        const g = Math.floor(parseInt(hex.substring(2, 4), 16) * factor);
        const b = Math.floor(parseInt(hex.substring(4, 6), 16) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    }
}
