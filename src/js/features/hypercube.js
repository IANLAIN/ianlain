/**
 * 4D Hypercube Visualization
 * Renders an interactive rotating tesseract with cosmic background
 */

import { throttle } from '../core/utils.js';
import { CosmicBackground } from './cosmic.js';
import { SpaceshipManager } from './spaceships.js';

export class Hypercube {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // State
        this.scrollProgress = 0;
        this.autoRotation = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        this.isVisible = true;
        this.animationId = null;
        
        // Get colors from CSS
        const style = getComputedStyle(document.documentElement);
        this.primaryColor = style.getPropertyValue('--primary')?.trim() || '#06b6d4';
        this.secondaryColor = style.getPropertyValue('--secondary')?.trim() || '#8b5cf6';
        this.tertiaryColor = style.getPropertyValue('--accent')?.trim() || '#10b981';
        
        // Sub-features
        this.cosmic = null;
        this.spaceshipManager = null;
        
        // 4D Hypercube vertices
        this.vertices4D = [
            [-1, -1, -1, -1], [1, -1, -1, -1], [1, 1, -1, -1], [-1, 1, -1, -1],
            [-1, -1, 1, -1], [1, -1, 1, -1], [1, 1, 1, -1], [-1, 1, 1, -1],
            [-1, -1, -1, 1], [1, -1, -1, 1], [1, 1, -1, 1], [-1, 1, -1, 1],
            [-1, -1, 1, 1], [1, -1, 1, 1], [1, 1, 1, 1], [-1, 1, 1, 1]
        ];
        
        // Edges connecting vertices
        this.edges = [
            // Inner cube
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7],
            // Outer cube
            [8, 9], [9, 10], [10, 11], [11, 8],
            [12, 13], [13, 14], [14, 15], [15, 12],
            [8, 12], [9, 13], [10, 14], [11, 15],
            // Connecting edges (4th dimension)
            [0, 8], [1, 9], [2, 10], [3, 11],
            [4, 12], [5, 13], [6, 14], [7, 15]
        ];
        
        this.init();
    }
    
    /**
     * Initialize the hypercube
     */
    init() {
        this.resize();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        
        this.cosmic = new CosmicBackground(this.canvas, this.ctx);
        this.spaceshipManager = new SpaceshipManager();
        
        this.animate();
    }
    
    /**
     * Setup visibility observer for performance
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.1 });
        
        observer.observe(this.canvas);
    }
    
    /**
     * Resize canvas to window dimensions
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.scale = Math.min(this.canvas.width, this.canvas.height) * 0.18;
        
        if (this.cosmic) this.cosmic.resize();
        if (this.spaceshipManager) this.spaceshipManager.resize();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', throttle(() => this.resize(), 250));
        
        window.addEventListener('scroll', throttle(() => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        }, 50), { passive: true });
        
        window.addEventListener('mousemove', throttle((e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, 50), { passive: true });
    }
    
    /**
     * Rotate a 4D point on a plane
     * @param {number[]} point - 4D point [x, y, z, w]
     * @param {number} angle - Rotation angle
     * @param {number} i - First axis index
     * @param {number} j - Second axis index
     * @returns {number[]} Rotated point
     */
    rotate4D(point, angle, i, j) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const result = [...point];
        result[i] = point[i] * cos - point[j] * sin;
        result[j] = point[i] * sin + point[j] * cos;
        return result;
    }
    
    /**
     * Project 4D point to 3D
     * @param {number[]} point - 4D point
     * @returns {number[]} 3D point
     */
    project4Dto3D(point) {
        const w = 2;
        const distance4D = 2;
        const factor = distance4D / (distance4D - point[3] / w);
        return [
            point[0] * factor,
            point[1] * factor,
            point[2] * factor
        ];
    }
    
    /**
     * Project 3D point to 2D screen
     * @param {number[]} point - 3D point
     * @returns {number[]} 2D point with depth factor
     */
    project3Dto2D(point) {
        const distance3D = 4;
        const factor = distance3D / (distance3D - point[2]);
        return [
            point[0] * factor * this.scale + this.centerX,
            point[1] * factor * this.scale + this.centerY,
            factor
        ];
    }
    
    /**
     * Transform a vertex through all rotations
     * @param {number[]} vertex - Original 4D vertex
     * @returns {number[]} Transformed 2D point
     */
    transformVertex(vertex) {
        let point = [...vertex];
        
        const scrollAngle = this.scrollProgress * Math.PI * 4;
        const autoAngle = this.autoRotation;
        
        // Apply 4D rotations
        point = this.rotate4D(point, scrollAngle + autoAngle * 0.5, 0, 3); // XW
        point = this.rotate4D(point, scrollAngle * 0.7 + autoAngle * 0.3, 1, 3); // YW
        point = this.rotate4D(point, autoAngle * 0.4, 2, 3); // ZW
        point = this.rotate4D(point, autoAngle * 0.2 + this.mouseX * 0.3, 0, 1); // XY
        point = this.rotate4D(point, autoAngle * 0.3 + this.mouseY * 0.3, 0, 2); // XZ
        point = this.rotate4D(point, scrollAngle * 0.5, 1, 2); // YZ
        
        // Project to screen
        const point3D = this.project4Dto3D(point);
        return this.project3Dto2D(point3D);
    }
    
    /**
     * Get edge color based on index and depth
     * @param {number} index - Edge index
     * @param {number} depth - Depth factor
     * @returns {string} RGBA color string
     */
    getEdgeColor(index, depth) {
        const alpha = 0.3 + depth * 0.4;
        
        if (index < 12) {
            return `rgba(6, 182, 212, ${alpha})`; // Cyan - inner cube
        } else if (index < 24) {
            return `rgba(139, 92, 246, ${alpha})`; // Purple - outer cube
        } else {
            return `rgba(16, 185, 129, ${alpha})`; // Emerald - connecting
        }
    }
    
    /**
     * Draw the hypercube
     */
    draw() {
        // Clear with solid black
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cosmic background
        if (this.cosmic) {
            this.cosmic.draw(this.time);
        }
        
        // Project all vertices
        const projected = this.vertices4D.map(v => this.transformVertex(v));
        
        // Draw edges
        this.edges.forEach((edge, index) => {
            const p1 = projected[edge[0]];
            const p2 = projected[edge[1]];
            const avgDepth = (p1[2] + p2[2]) / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(p1[0], p1[1]);
            this.ctx.lineTo(p2[0], p2[1]);
            this.ctx.strokeStyle = this.getEdgeColor(index, avgDepth);
            this.ctx.lineWidth = 1 + avgDepth * 1.5;
            this.ctx.stroke();
        });
        
        // Draw vertices
        projected.forEach((point, index) => {
            const size = 2 + point[2] * 3;
            const alpha = 0.5 + point[2] * 0.5;
            
            const color = index < 8 
                ? `rgba(6, 182, 212, ${alpha})`  // Inner cube vertices
                : `rgba(139, 92, 246, ${alpha})`; // Outer cube vertices
            
            this.ctx.beginPath();
            this.ctx.arc(point[0], point[1], size, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        });
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (this.isVisible) {
            this.autoRotation += 0.008;
            this.time += 16;
            this.draw();
            
            if (this.spaceshipManager) {
                this.spaceshipManager.animate();
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

/**
 * Initialize hypercube on page load
 */
export function initHypercube() {
    const hypercube = new Hypercube('hypercube-canvas');
    return hypercube;
}
