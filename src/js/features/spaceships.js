// Animated spaceships module (reserved for future use)

import { throttle, random } from '../core/utils.js';

const SHIP_TYPES = ['fighter', 'cruiser', 'scout', 'bomber'];

const SHIP_COLORS = {
    fighter: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9', engine: '#10b981' },
    cruiser: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', engine: '#ec4899' },
    scout: { primary: '#10b981', secondary: '#059669', accent: '#34d399', engine: '#06b6d4' },
    bomber: { primary: '#ef4444', secondary: '#dc2626', accent: '#fbbf24', engine: '#f97316' }
};

export class SpaceshipManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.ships = [];
        this.lastChaseTime = 0;
        this.chaseInterval = 10000;
        this.isVisible = true;
        this.animationId = null;
        
        this.createOverlayCanvas();
        this.setupVisibilityObserver();
        this.initShips();
    }
    
    /** Creates overlay canvas for spaceship rendering */
    createOverlayCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'spaceship-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', throttle(() => this.resize(), 250));
    }
    
    /** Pauses animation when tab is hidden */
    setupVisibilityObserver() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
        });
    }
    
    /** Resizes canvas to window dimensions */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /** Gets color palette for ship type */
    getShipColors(type) {
        return SHIP_COLORS[type] || SHIP_COLORS.fighter;
    }
    
    /** Creates initial ship fleet */
    initShips() {
        const shipCount = random.int(2, 3);
        
        for (let i = 0; i < shipCount; i++) {
            const type = random.pick(SHIP_TYPES);
            this.ships.push(this.createShip(type, false));
        }
    }
    
    /** Creates new ship with random spawn position */
    createShip(type, isChasing) {
        const startEdge = random.int(0, 3);
        let x, y, vx, vy;
        
        switch (startEdge) {
            case 0: // Top
                x = random.between(0, this.canvas.width);
                y = -50;
                vx = random.between(-1, 1);
                vy = random.between(0.5, 2);
                break;
            case 1: // Right
                x = this.canvas.width + 50;
                y = random.between(0, this.canvas.height);
                vx = -random.between(0.5, 2);
                vy = random.between(-1, 1);
                break;
            case 2: // Bottom
                x = random.between(0, this.canvas.width);
                y = this.canvas.height + 50;
                vx = random.between(-1, 1);
                vy = -random.between(0.5, 2);
                break;
            default: // Left
                x = -50;
                y = random.between(0, this.canvas.height);
                vx = random.between(0.5, 2);
                vy = random.between(-1, 1);
        }
        
        return {
            type,
            x,
            y,
            vx,
            vy,
            scale: random.between(2, 5),
            rotation: Math.atan2(vy, vx) - Math.PI / 2,
            colors: this.getShipColors(type),
            isChasing,
            chaseTarget: null,
            life: 1,
            isChaseEvent: false,
            laserCooldown: 0
        };
    }
    
    /** Starts chase sequence between two ships */
    startChaseEvent() {
        const now = Date.now();
        if (now - this.lastChaseTime < this.chaseInterval) return;
        
        this.lastChaseTime = now;
        this.chaseInterval = random.between(10000, 15000);
        
        const side = random.int(0, 3);
        let startX, startY, endX, endY;
        
        // Calculate middle region of screen (20%-80%)
        const midYStart = this.canvas.height * 0.2;
        const midYRange = this.canvas.height * 0.6;
        const midXStart = this.canvas.width * 0.2;
        const midXRange = this.canvas.width * 0.6;
        
        switch (side) {
            case 0: // Left to right
                startX = -100;
                startY = midYStart + random.between(0, midYRange);
                endX = this.canvas.width + 100;
                endY = startY + random.between(-100, 100);
                break;
            case 1: // Right to left
                startX = this.canvas.width + 100;
                startY = midYStart + random.between(0, midYRange);
                endX = -100;
                endY = startY + random.between(-100, 100);
                break;
            case 2: // Top to bottom
                startX = midXStart + random.between(0, midXRange);
                startY = -100;
                endX = startX + random.between(-100, 100);
                endY = this.canvas.height + 100;
                break;
            default: // Bottom to top
                startX = midXStart + random.between(0, midXRange);
                startY = this.canvas.height + 100;
                endX = startX + random.between(-100, 100);
                endY = -100;
        }
        
        const speed = random.between(4, 6);
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        
        // Create ships with random types
        const targetType = random.pick(SHIP_TYPES);
        const chaserType = random.pick(SHIP_TYPES);
        
        const targetShip = {
            type: targetType,
            x: startX,
            y: startY,
            vx,
            vy,
            scale: 4,
            rotation: Math.atan2(vy, vx) - Math.PI / 2,
            colors: this.getShipColors(targetType),
            isChasing: false,
            chaseTarget: null,
            life: 1,
            isChaseEvent: true,
            laserCooldown: 0
        };
        
        const chaserShip = {
            type: chaserType,
            x: startX - vx * 30,
            y: startY - vy * 30,
            vx: vx * 1.05,
            vy: vy * 1.05,
            scale: 4,
            rotation: Math.atan2(vy, vx) - Math.PI / 2,
            colors: this.getShipColors(chaserType),
            isChasing: true,
            chaseTarget: targetShip,
            life: 1,
            isChaseEvent: true,
            laserCooldown: 0
        };
        
        this.ships.push(targetShip);
        this.ships.push(chaserShip);
    }
    
    /** Draws single ship */
    drawShip(ship) {
        const ctx = this.ctx;
        const s = ship.scale * 3;
        
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.rotation + Math.PI);
        
        // Simple triangular ship
        ctx.fillStyle = ship.colors.primary;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.5, s * 0.5);
        ctx.lineTo(0, s * 0.2);
        ctx.lineTo(-s * 0.5, s * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    /** Updates all ship positions */
    update() {
        this.startChaseEvent();
        
        this.ships = this.ships.filter(ship => {
            ship.x += ship.vx;
            ship.y += ship.vy;
            
            const targetRotation = Math.atan2(ship.vy, ship.vx) - Math.PI / 2;
            ship.rotation = ship.rotation + (targetRotation - ship.rotation) * 0.1;
            
            if (ship.laserCooldown > 0) ship.laserCooldown--;
            
            const margin = 150;
            const outOfBounds = ship.x < -margin || ship.x > this.canvas.width + margin ||
                               ship.y < -margin || ship.y > this.canvas.height + margin;
            
            if (outOfBounds) {
                if (ship.isChaseEvent) {
                    return false;
                } else {
                    const newShip = this.createShip(ship.type, false);
                    Object.assign(ship, newShip);
                }
            }
            
            return true;
        });
    }
    
    /** Draws all ships to canvas */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ships.forEach(ship => this.drawShip(ship));
    }
    
    /** Animation frame (only when visible) */
    animate() {
        if (!this.isVisible) return;
        this.update();
        this.draw();
    }
}
