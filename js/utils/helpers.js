/**
 * 工具函數模組 - Helper Functions Module
 * 提供通用的工具函數和輔助功能
 */

/**
 * 防抖函數 - Debounce function
 * @param {Function} func - 要執行的函數
 * @param {number} wait - 等待時間（毫秒）
 * @param {boolean} immediate - 是否立即執行
 * @returns {Function} 防抖後的函數
 */
export function debounce(func, wait = 300, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * 節流函數 - Throttle function
 * @param {Function} func - 要執行的函數
 * @param {number} limit - 限制時間（毫秒）
 * @returns {Function} 節流後的函數
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 生成隨機ID - Generate random ID
 * @param {number} length - ID長度
 * @returns {string} 隨機ID
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 生成隨機數字 - Generate random number
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {boolean} integer - 是否為整數
 * @returns {number} 隨機數字
 */
export function random(min, max, integer = true) {
    const value = Math.random() * (max - min) + min;
    return integer ? Math.floor(value) : value;
}

/**
 * 格式化時間 - Format time
 * @param {number} milliseconds - 毫秒數
 * @param {boolean} showMs - 是否顯示毫秒
 * @returns {string} 格式化後的時間
 */
export function formatTime(milliseconds, showMs = false) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    
    let result = '';
    if (hours > 0) {
        result += `${hours.toString().padStart(2, '0')}:`;
    }
    result += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (showMs) {
        result += `.${ms.toString().padStart(3, '0')}`;
    }
    
    return result;
}

/**
 * 格式化數字 - Format number
 * @param {number} number - 要格式化的數字
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的數字
 */
export function formatNumber(number, decimals = 0) {
    if (typeof number !== 'number') return '0';
    
    if (number >= 1000000) {
        return (number / 1000000).toFixed(decimals) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(decimals) + 'K';
    } else {
        return number.toFixed(decimals);
    }
}

/**
 * 深拷貝對象 - Deep clone object
 * @param {any} obj - 要拷貝的對象
 * @returns {any} 深拷貝後的對象
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
}

/**
 * 合併對象 - Merge objects
 * @param {...Object} objects - 要合併的對象
 * @returns {Object} 合併後的對象
 */
export function mergeObjects(...objects) {
    const result = {};
    objects.forEach(obj => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (obj[key] !== undefined) {
                    if (result[key] && typeof result[key] === 'object' && typeof obj[key] === 'object') {
                        result[key] = mergeObjects(result[key], obj[key]);
                    } else {
                        result[key] = deepClone(obj[key]);
                    }
                }
            });
        }
    });
    return result;
}

/**
 * 檢查是否為空對象 - Check if object is empty
 * @param {Object} obj - 要檢查的對象
 * @returns {boolean} 是否為空
 */
export function isEmptyObject(obj) {
    if (!obj || typeof obj !== 'object') return true;
    return Object.keys(obj).length === 0;
}

/**
 * 獲取URL參數 - Get URL parameters
 * @param {string} name - 參數名稱
 * @param {string} url - URL（默認為當前URL）
 * @returns {string|null} 參數值
 */
export function getUrlParam(name, url = window.location.href) {
    const params = new URLSearchParams(new URL(url).search);
    return params.get(name);
}

/**
 * 設置URL參數 - Set URL parameters
 * @param {Object} params - 參數對象
 * @param {string} url - URL（默認為當前URL）
 * @returns {string} 新的URL
 */
export function setUrlParams(params, url = window.location.href) {
    const urlObj = new URL(url);
    Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
            urlObj.searchParams.delete(key);
        } else {
            urlObj.searchParams.set(key, params[key]);
        }
    });
    return urlObj.toString();
}

/**
 * 複製到剪貼板 - Copy to clipboard
 * @param {string} text - 要複製的文字
 * @returns {Promise<boolean>} 是否成功
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // 備用方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
}

/**
 * 下載文件 - Download file
 * @param {string} content - 文件內容
 * @param {string} filename - 文件名稱
 * @param {string} type - 文件類型
 */
export function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 讀取文件 - Read file
 * @param {File} file - 文件對象
 * @returns {Promise<string>} 文件內容
 */
export function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

/**
 * 檢查設備類型 - Check device type
 * @returns {Object} 設備信息
 */
export function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    const isDesktop = !isMobile && !isTablet;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return {
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        userAgent: ua,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1
    };
}

/**
 * 檢查網絡狀態 - Check network status
 * @returns {Promise<boolean>} 是否在線
 */
export function checkNetworkStatus() {
    return navigator.onLine;
}

/**
 * 添加網絡狀態監聽 - Add network status listener
 * @param {Function} onlineCallback - 在線時的回調
 * @param {Function} offlineCallback - 離線時的回調
 */
export function addNetworkListener(onlineCallback, offlineCallback) {
    window.addEventListener('online', onlineCallback);
    window.addEventListener('offline', offlineCallback);
    
    // 返回移除監聽的函數
    return () => {
        window.removeEventListener('online', onlineCallback);
        window.removeEventListener('offline', offlineCallback);
    };
}

/**
 * 延遲執行 - Delay execution
 * @param {number} ms - 延遲時間（毫秒）
 * @returns {Promise<void>} Promise
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重試函數 - Retry function
 * @param {Function} fn - 要執行的函數
 * @param {number} retries - 重試次數
 * @param {number} delayMs - 重試間隔（毫秒）
 * @returns {Promise<any>} 執行結果
 */
export async function retry(fn, retries = 3, delayMs = 1000) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < retries - 1) {
                await delay(delayMs);
            }
        }
    }
    throw lastError;
}

/**
 * 創建事件發射器 - Create event emitter
 * @returns {Object} 事件發射器對象
 */
export function createEventEmitter() {
    const events = new Map();
    
    return {
        on(event, listener) {
            if (!events.has(event)) {
                events.set(event, []);
            }
            events.get(event).push(listener);
            return () => this.off(event, listener);
        },
        
        off(event, listener) {
            if (!events.has(event)) return;
            const listeners = events.get(event);
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        },
        
        emit(event, ...args) {
            if (!events.has(event)) return;
            const listeners = events.get(event).slice();
            listeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        },
        
        once(event, listener) {
            const onceListener = (...args) => {
                this.off(event, onceListener);
                listener(...args);
            };
            this.on(event, onceListener);
        },
        
        clear(event) {
            if (event) {
                events.delete(event);
            } else {
                events.clear();
            }
        }
    };
}

/**
 * 創建計時器 - Create timer
 * @param {number} interval - 間隔時間（毫秒）
 * @param {Function} callback - 回調函數
 * @param {boolean} immediate - 是否立即執行
 * @returns {Object} 計時器對象
 */
export function createTimer(interval, callback, immediate = false) {
    let timerId = null;
    let isRunning = false;
    let startTime = null;
    let elapsed = 0;
    
    const timer = {
        start() {
            if (isRunning) return;
            isRunning = true;
            startTime = Date.now() - elapsed;
            
            if (immediate) {
                callback();
            }
            
            const tick = () => {
                if (!isRunning) return;
                elapsed = Date.now() - startTime;
                
                if (elapsed >= interval) {
                    callback();
                    startTime = Date.now();
                    elapsed = 0;
                }
                
                timerId = requestAnimationFrame(tick);
            };
            
            timerId = requestAnimationFrame(tick);
        },
        
        stop() {
            isRunning = false;
            if (timerId) {
                cancelAnimationFrame(timerId);
                timerId = null;
            }
        },
        
        reset() {
            elapsed = 0;
            startTime = isRunning ? Date.now() : null;
        },
        
        getElapsed() {
            return isRunning ? Date.now() - startTime : elapsed;
        },
        
        getRemaining() {
            return Math.max(0, interval - this.getElapsed());
        },
        
        isRunning() {
            return isRunning;
        }
    };
    
    return timer;
}

/**
 * 創建加載器 - Create loader
 * @param {HTMLElement} element - 加載器元素
 * @returns {Object} 加載器對象
 */
export function createLoader(element) {
    if (!element) return null;
    
    let isLoading = false;
    let progress = 0;
    
    const loader = {
        show() {
            isLoading = true;
            progress = 0;
            element.style.display = 'block';
            this.updateProgress(0);
        },
        
        hide() {
            isLoading = false;
            element.style.display = 'none';
        },
        
        updateProgress(value) {
            progress = Math.max(0, Math.min(100, value));
            const progressBar = element.querySelector('.progress-bar');
            const progressText = element.querySelector('.progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}%`;
            }
            
            if (progress >= 100) {
                setTimeout(() => this.hide(), 500);
            }
        },
        
        increment(amount = 10) {
            this.updateProgress(progress + amount);
        },
        
        isVisible() {
            return isLoading;
        },
        
        getProgress() {
            return progress;
        }
    };
    
    return loader;
}

/**
 * 驗證電子郵件 - Validate email
 * @param {string} email - 電子郵件地址
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * 驗證URL - Validate URL
 * @param {string} url - URL地址
 * @returns {boolean} 是否有效
 */
export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * 安全解析JSON - Safe parse JSON
 * @param {string} jsonString - JSON字符串
 * @param {any} defaultValue - 默認值
 * @returns {any} 解析結果或默認值
 */
export function safeParseJSON(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch {
        return defaultValue;
    }
}

/**
 * 安全字符串化 - Safe stringify
 * @param {any} value - 要字符串化的值
 * @param {any} defaultValue - 默認值
 * @returns {string} JSON字符串或默認值
 */
export function safeStringify(value, defaultValue = '{}') {
    try {
        return JSON.stringify(value);
    } catch {
        return defaultValue;
    }
}

/**
 * 計算元素位置 - Calculate element position
 * @param {HTMLElement} element - 元素
 * @returns {Object} 位置信息
 */
export function getElementPosition(element) {
    if (!element) return { top: 0, left: 0, width: 0, height: 0 };
    
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom
    };
}
/**
 * 滾動到元素 - Scroll to element
 * @param {HTMLElement|string} element - 元素或選擇器
 * @param {Object} options - 滾動選項
 */
export function scrollToElement(element, options = {}) {
    const target = typeof element === 'string'
        ? document.querySelector(element)
        : element;
    
    if (!target) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        offset: 0
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    if (finalOptions.offset !== 0) {
        const elementPosition = getElementPosition(target);
        window.scrollTo({
            behavior: finalOptions.behavior,
            top: elementPosition.top - finalOptions.offset
        });
    } else {
        target.scrollIntoView({
            behavior: finalOptions.behavior,
            block: finalOptions.block,
            inline: finalOptions.inline
        });
    }
}
    
