/**
 * 粒子系統模組 - Particle System Module
 * 提供粒子效果和動畫功能
 */

/**
 * 粒子類別 - Particle Class
 */
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 2;
        this.vy = options.vy || (Math.random() - 0.5) * 2;
        this.size = options.size || Math.random() * 5 + 2;
        this.color = options.color || '#ff6b6b';
        this.life = options.life || 1.0;
        this.maxLife = this.life;
        this.gravity = options.gravity || 0;
        this.friction = options.friction || 0.98;
        this.rotation = options.rotation || 0;
        this.rotationSpeed = options.rotationSpeed || (Math.random() - 0.5) * 0.1;
        this.opacity = options.opacity || 1.0;
        this.shape = options.shape || 'circle'; // 'circle', 'square', 'triangle', 'star'
        this.glow = options.glow || false;
        this.glowColor = options.glowColor || this.color;
        this.glowSize = options.glowSize || this.size * 2;
    }
    
    /**
     * 更新粒子狀態 - Update particle state
     * @param {number} deltaTime - 時間增量
     */
    update(deltaTime) {
        // 應用物理
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += this.gravity * deltaTime;
        
        // 應用摩擦力
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // 更新旋轉
        this.rotation += this.rotationSpeed * deltaTime;
        
        // 減少生命值
        this.life -= 0.016; // 假設60fps
        
        // 更新透明度
        this.opacity = this.life / this.maxLife;
        
        return this.life > 0;
    }
    
    /**
     * 繪製粒子 - Draw particle
     * @param {CanvasRenderingContext2D} ctx - 畫布上下文
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 發光效果
        if (this.glow) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = this.glowSize;
        }
        
        ctx.fillStyle = this.color;
        
        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'square':
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;
                
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size, this.size);
                ctx.lineTo(-this.size, this.size);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'star':
                this.drawStar(ctx, 0, 0, 5, this.size, this.size * 0.5);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * 繪製星星 - Draw star
     * @param {CanvasRenderingContext2D} ctx - 畫布上下文
     * @param {number} cx - 中心X
     * @param {number} cy - 中心Y
     * @param {number} spikes - 尖角數量
     * @param {number} outerRadius - 外半徑
     * @param {number} innerRadius - 內半徑
     */
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }
}

/**
 * 粒子發射器類別 - Particle Emitter Class
 */
class ParticleEmitter {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.isActive = true;
        this.emitRate = options.emitRate || 10; // 每秒發射數量
        this.emitCount = options.emitCount || 0; // 總發射數量，0表示無限
        this.emittedCount = 0;
        this.emitTimer = 0;
        this.particleOptions = options.particleOptions || {};
        this.burstMode = options.burstMode || false;
        this.burstCount = options.burstCount || 50;
        this.burstInterval = options.burstInterval || 1000; // 毫秒
        this.burstTimer = 0;
        this.area = options.area || { width: 0, height: 0 }; // 發射區域
    }
    
    /**
     * 更新發射器 - Update emitter
     * @param {number} deltaTime - 時間增量
     */
    update(deltaTime) {
        // 更新現有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }
        
        // 發射新粒子
        if (this.isActive) {
            if (this.burstMode) {
                this.burstTimer += deltaTime * 1000;
                if (this.burstTimer >= this.burstInterval) {
                    this.burstTimer = 0;
                    this.emitBurst();
                }
            } else {
                this.emitTimer += deltaTime;
                const emitInterval = 1 / this.emitRate;
                
                while (this.emitTimer >= emitInterval && 
                      (this.emitCount === 0 || this.emittedCount < this.emitCount)) {
                    this.emitParticle();
                    this.emitTimer -= emitInterval;
                    this.emittedCount++;
                }
            }
        }
    }
    
    /**
     * 發射單個粒子 - Emit single particle
     */
    emitParticle() {
        const x = this.x + (Math.random() - 0.5) * this.area.width;
        const y = this.y + (Math.random() - 0.5) * this.area.height;
        
        const particle = new Particle(x, y, this.particleOptions);
        this.particles.push(particle);
    }
    
    /**
     * 爆發式發射粒子 - Emit particles in burst
     */
    emitBurst() {
        for (let i = 0; i < this.burstCount; i++) {
            this.emitParticle();
        }
        this.emittedCount += this.burstCount;
    }
    
    /**
     * 繪製所有粒子 - Draw all particles
     * @param {CanvasRenderingContext2D} ctx - 畫布上下文
     */
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    /**
     * 開始發射 - Start emitting
     */
    start() {
        this.isActive = true;
    }
    
    /**
     * 停止發射 - Stop emitting
     */
    stop() {
        this.isActive = false;
    }
    
    /**
     * 清除所有粒子 - Clear all particles
     */
    clear() {
        this.particles = [];
    }
    
    /**
     * 獲取粒子數量 - Get particle count
     * @returns {number} 粒子數量
     */
    getParticleCount() {
        return this.particles.length;
    }
}

/**
 * 粒子系統類別 - Particle System Class
 */
export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;
        this.emitters = new Map();
        this.lastTime = 0;
        this.isRunning = false;
        this.animationId = null;
        this.presets = this.createPresets();
    }
    
    /**
     * 創建預設效果 - Create preset effects
     * @returns {Object} 預設效果配置
     */
    createPresets() {
        return {
            // 爆炸效果
            explosion: {
                emitRate: 100,
                emitCount: 100,
                particleOptions: {
                    vx: () => (Math.random() - 0.5) * 10,
                    vy: () => (Math.random() - 0.5) * 10,
                    size: () => Math.random() * 8 + 2,
                    color: '#ff6b6b',
                    life: 1.5,
                    gravity: 0.2,
                    friction: 0.95,
                    shape: 'circle',
                    glow: true,
                    glowColor: '#ff6b6b'
                }
            },
            
            // 火焰效果
            fire: {
                emitRate: 30,
                emitCount: 0,
                particleOptions: {
                    vx: () => (Math.random() - 0.5) * 1,
                    vy: () => -Math.random() * 3 - 1,
                    size: () => Math.random() * 6 + 3,
                    color: () => {
                        const colors = ['#ff6b6b', '#ff8e53', '#ffd166'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    },
                    life: 1.0,
                    gravity: -0.1,
                    friction: 0.99,
                    shape: 'circle',
                    glow: true,
                    glowColor: '#ff6b6b'
                }
            },
            
            // 煙霧效果
            smoke: {
                emitRate: 20,
                emitCount: 0,
                particleOptions: {
                    vx: () => (Math.random() - 0.5) * 0.5,
                    vy: () => -Math.random() * 1 - 0.5,
                    size: () => Math.random() * 15 + 5,
                    color: '#666666',
                    life: 3.0,
                    gravity: -0.05,
                    friction: 0.98,
                    opacity: 0.3,
                    shape: 'circle'
                }
            },
            
            // 星星效果
            stars: {
                emitRate: 5,
                emitCount: 0,
                particleOptions: {
                    vx: () => (Math.random() - 0.5) * 0.5,
                    vy: () => (Math.random() - 0.5) * 0.5,
                    size: () => Math.random() * 4 + 2,
                    color: () => {
                        const colors = ['#ffffff', '#ffd166', '#a0e7e5'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    },
                    life: 5.0,
                    rotationSpeed: () => (Math.random() - 0.5) * 0.05,
                    shape: 'star',
                    glow: true,
                    glowColor: '#ffffff'
                }
            },
            
            // 魔法效果
            magic: {
                burstMode: true,
                burstCount: 30,
                burstInterval: 2000,
                particleOptions: {
                    vx: () => (Math.random() - 0.5) * 3,
                    vy: () => (Math.random() - 0.5) * 3,
                    size: () => Math.random() * 6 + 3,
                    color: () => {
                        const colors = ['#a0e7e5', '#b19cd9', '#ffd166'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    },
                    life: 2.0,
                    gravity: 0,
                    friction: 0.97,
                    shape: 'circle',
                    glow: true,
                    glowColor: '#a0e7e5'
                }
            },
            
            // 雨滴效果
            rain: {
                emitRate: 50,
                emitCount: 0,
                particleOptions: {
                    vx: () => (Math.random() - 0.5) * 0.5,
                    vy: () => Math.random() * 5 + 3,
                    size: () => Math.random() * 3 + 1,
                    color: '#4d96ff',
                    life: 3.0,
                    gravity: 0.5,
                    friction: 0.99,
                    shape: 'square'
                }
            }
        };
    }
    
    /**
     * 創建發射器 - Create emitter
     * @param {string} name - 發射器名稱
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} options - 發射器選項
     * @returns {ParticleEmitter} 粒子發射器
     */
    createEmitter(name, x, y, options = {}) {
        const emitter = new ParticleEmitter(x, y, options);
        this.emitters.set(name, emitter);
        return emitter;
    }
    
    /**
     * 創建預設效果發射器 - Create preset effect emitter
     * @param {string} name - 發射器名稱
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} presetName - 預設效果名稱
     * @param {Object} overrides - 覆蓋選項
     * @returns {ParticleEmitter} 粒子發射器
     */
    createPresetEmitter(name, x, y, presetName, overrides = {}) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn(`預設效果未找到: ${presetName}`);
            return this.createEmitter(name, x, y, overrides);
        }
        
        const options = { ...preset, ...overrides };
        return this.createEmitter(name, x, y, options);
    }
    
    /**
     * 獲取發射器 - Get emitter
     * @param {string} name - 發射器名稱
     * @returns {ParticleEmitter|null} 粒子發射器
     */
    getEmitter(name) {
        return this.emitters.get(name) || null;
    }
    
    /**
     * 移除發射器 - Remove emitter
     * @param {string} name - 發射器名稱
     */
    removeEmitter(name) {
        this.emitters.delete(name);
    }
    
    /**
     * 開始粒子系統 - Start particle system
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }
    
    /**
     * 停止粒子系統 - Stop particle system
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 動畫循環 - Animation loop
     */
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 轉換為秒
        this.lastTime = currentTime;
        
        // 清除畫布
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 更新所有發射器
        for (const emitter of this.emitters.values()) {
            emitter.update(deltaTime);
            
            // 繪製粒子
            if (this.ctx) {
                emitter.draw(this.ctx);
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * 清除所有發射器 - Clear all emitters
     */
    clearAll() {
        for (const emitter of this.emitters.values()) {
            emitter.clear();
        }
        this.emitters.clear();
    }
    
    /**
     * 獲取總粒子數量 - Get total particle count
     * @returns {number} 總粒子數量
     */
    getTotalParticleCount() {
        let count = 0;
        for (const emitter of this.emitters.values()) {
            count += emitter.getParticleCount();
        }
        return count;
    }
    
    /**
     * 設置畫布 - Set canvas
     * @param {HTMLCanvasElement} canvas - 畫布元素
     */
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;
    }
    
    /**
     * 銷毀粒子系統 - Destroy particle system
     */
    destroy() {
        this.stop();
        this.clearAll();
        this.emitters.clear();
        this.canvas = null;
        this.ctx = null;
    }
}

/**
 * 創建粒子系統實例 - Create particle system instance
 * @param {HTMLCanvasElement} canvas - 畫布元素
 * @returns {ParticleSystem} 粒子系統
 */
export function createParticleSystem(canvas) {
    return new ParticleSystem(canvas);
}

/**
 * 全局粒子系統實例 - Global particle system instance
 */
let globalParticleSystem = null;

/**
 * 獲取全局粒子系統 - Get global particle system
 * @param {HTMLCanvasElement} canvas - 畫布元素（可選）
 * @returns {ParticleSystem} 全局粒子系統
 */
export function getParticleSystem(canvas = null) {
    if (!globalParticleSystem) {
        globalParticleSystem = createParticleSystem(canvas);
    } else if (canvas && globalParticleSystem.canvas !== canvas) {
        globalParticleSystem.setCanvas(canvas);
    }
    return globalParticleSystem;
}