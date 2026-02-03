/**
 * 動畫工具模組 - Animation Utilities Module
 * 提供統一的動畫效果和工具函數
 */

class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.animationId = 0;
    }

    /**
     * 淡入效果 - Fade in effect
     * @param {HTMLElement} element - 要動畫的元素
     * @param {number} duration - 動畫持續時間（毫秒）
     * @param {Function} callback - 動畫完成後的回調函數
     */
    fadeIn(element, duration = 500, callback = null) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '1';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 淡出效果 - Fade out effect
     * @param {HTMLElement} element - 要動畫的元素
     * @param {number} duration - 動畫持續時間（毫秒）
     * @param {Function} callback - 動畫完成後的回調函數
     */
    fadeOut(element, duration = 500, callback = null) {
        if (!element) return;
        
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.opacity = '1';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 滑入效果 - Slide in effect
     * @param {HTMLElement} element - 要動畫的元素
     * @param {string} direction - 方向 ('up', 'down', 'left', 'right')
     * @param {number} duration - 動畫持續時間（毫秒）
     * @param {Function} callback - 動畫完成後的回調函數
     */
    slideIn(element, direction = 'up', duration = 500, callback = null) {
        if (!element) return;
        
        const directions = {
            'up': 'translateY(20px)',
            'down': 'translateY(-20px)',
            'left': 'translateX(20px)',
            'right': 'translateX(-20px)'
        };
        
        const startTransform = directions[direction] || directions['up'];
        element.style.transform = startTransform;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const t = Math.min(progress / duration, 1);
            
            // 使用緩動函數
            const ease = this.easeOutCubic(t);
            
            element.style.opacity = ease.toString();
            element.style.transform = `translate${direction === 'up' || direction === 'down' ? 'Y' : 'X'}(${20 * (1 - ease)}px)`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = 'translate(0, 0)';
                element.style.opacity = '1';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 脈衝效果 - Pulse effect
     * @param {HTMLElement} element - 要動畫的元素
     * @param {number} scale - 縮放比例
     * @param {number} duration - 動畫持續時間（毫秒）
     * @param {number} iterations - 重複次數（Infinity為無限）
     */
    pulse(element, scale = 1.1, duration = 500, iterations = 1) {
        if (!element) return;
        
        const animationId = this.animationId++;
        this.animations.set(animationId, { element, running: true });
        
        let iteration = 0;
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const t = (progress % duration) / duration;
            
            // 使用正弦波創造脈衝效果
            const pulseValue = 1 + (scale - 1) * Math.sin(t * Math.PI);
            element.style.transform = `scale(${pulseValue})`;
            
            if (progress >= duration * (iteration + 1)) {
                iteration++;
                if (iteration >= iterations && iterations !== Infinity) {
                    element.style.transform = 'scale(1)';
                    this.animations.delete(animationId);
                    return;
                }
            }
            
            if (this.animations.has(animationId) && this.animations.get(animationId).running) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = 'scale(1)';
            }
        };
        
        requestAnimationFrame(animate);
        return animationId;
    }

    /**
     * 停止動畫 - Stop animation
     * @param {number} animationId - 動畫ID
     */
    stopAnimation(animationId) {
        if (this.animations.has(animationId)) {
            const animation = this.animations.get(animationId);
            animation.running = false;
            animation.element.style.transform = '';
            this.animations.delete(animationId);
        }
    }

    /**
     * 搖晃效果 - Shake effect
     * @param {HTMLElement} element - 要動畫的元素
     * @param {number} intensity - 搖晃強度
     * @param {number} duration - 動畫持續時間（毫秒）
     * @param {Function} callback - 動畫完成後的回調函數
     */
    shake(element, intensity = 10, duration = 500, callback = null) {
        if (!element) return;
        
        const originalTransform = element.style.transform;
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const t = Math.min(progress / duration, 1);
            
            // 使用衰減的正弦波創造搖晃效果
            const shakeValue = intensity * Math.sin(t * 20 * Math.PI) * (1 - t);
            element.style.transform = `translateX(${shakeValue}px) ${originalTransform}`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 彈跳效果 - Bounce effect
     * @param {HTMLElement} element - 要動畫的元素
     * @param {number} height - 彈跳高度
     * @param {number} duration - 動畫持續時間（毫秒）
     * @param {Function} callback - 動畫完成後的回調函數
     */
    bounce(element, height = 20, duration = 500, callback = null) {
        if (!element) return;
        
        const originalTransform = element.style.transform;
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const t = Math.min(progress / duration, 1);
            
            // 使用彈跳緩動函數
            const bounceValue = this.bounceEasing(t) * height;
            element.style.transform = `translateY(${-bounceValue}px) ${originalTransform}`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 顏色過渡效果 - Color transition effect
     * @param {HTMLElement} element - 要動畫的元素
     * @param {string} fromColor - 起始顏色
     * @param {string} toColor - 結束顏色
     * @param {number} duration - 動畫持續時間（毫秒）
     * @param {Function} callback - 動畫完成後的回調函數
     */
    colorTransition(element, fromColor, toColor, duration = 500, callback = null) {
        if (!element) return;
        
        const fromRGB = this.hexToRgb(fromColor);
        const toRGB = this.hexToRgb(toColor);
        
        if (!fromRGB || !toRGB) return;
        
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const t = Math.min(progress / duration, 1);
            
            const r = Math.round(fromRGB.r + (toRGB.r - fromRGB.r) * t);
            const g = Math.round(fromRGB.g + (toRGB.g - fromRGB.g) * t);
            const b = Math.round(fromRGB.b + (toRGB.b - fromRGB.b) * t);
            
            element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.backgroundColor = toColor;
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    // 緩動函數 - Easing functions
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    bounceEasing(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    // 工具函數 - Utility functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * 創建粒子效果 - Create particle effect
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} color - 粒子顏色
     * @param {number} count - 粒子數量
     * @param {HTMLElement} container - 容器元素
     */
    createParticles(x, y, color = '#FFD700', count = 20, container = document.body) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = color;
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            container.appendChild(particle);
            
            // 隨機方向
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            let opacity = 1;
            const animate = () => {
                const rect = particle.getBoundingClientRect();
                particle.style.left = `${rect.left + vx}px`;
                particle.style.top = `${rect.top + vy}px`;
                opacity -= 0.02;
                particle.style.opacity = opacity.toString();
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
}

// 導出單例實例
const animationSystem = new AnimationSystem();

// 導出工具函數
export function fadeIn(element, duration, callback) {
    return animationSystem.fadeIn(element, duration, callback);
}

export function fadeOut(element, duration, callback) {
    return animationSystem.fadeOut(element, duration, callback);
}

export function slideIn(element, direction, duration, callback) {
    return animationSystem.slideIn(element, direction, duration, callback);
}

export function pulse(element, scale, duration, iterations) {
    return animationSystem.pulse(element, scale, duration, iterations);
}

export function shake(element, intensity, duration, callback) {
    return animationSystem.shake(element, intensity, duration, callback);
}

export function bounce(element, height, duration, callback) {
    return animationSystem.bounce(element, height, duration, callback);
}

export function colorTransition(element, fromColor, toColor, duration, callback) {
    return animationSystem.colorTransition(element, fromColor, toColor, duration, callback);
}

export function createParticles(x, y, color, count, container) {
    return animationSystem.createParticles(x, y, color, count, container);
}

export default animationSystem;