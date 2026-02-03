/**
 * 遊戲循環模組 - Game Loop Module
 * 提供統一的遊戲循環和狀態管理功能
 */

/**
 * 遊戲狀態枚舉 - Game State Enum
 */
export const GameState = {
    INITIALIZING: 'initializing',
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    COMPLETED: 'completed',
    TRANSITION: 'transition'
};

/**
 * 遊戲循環類別 - Game Loop Class
 */
export class GameLoop {
    constructor(options = {}) {
        this.state = GameState.INITIALIZING;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.isRunning = false;
        this.animationId = null;
        this.stats = {
            totalFrames: 0,
            totalTime: 0,
            averageFps: 0,
            minFps: Infinity,
            maxFps: 0
        };
        
        // 配置選項
        this.targetFps = options.targetFps || 60;
        this.maxDeltaTime = options.maxDeltaTime || 0.1; // 最大時間增量（秒）
        this.showStats = options.showStats || false;
        this.statsElement = options.statsElement || null;
        
        // 回調函數
        this.onUpdate = options.onUpdate || (() => {});
        this.onRender = options.onRender || (() => {});
        this.onStateChange = options.onStateChange || (() => {});
        
        // 性能監控
        this.frameTimes = [];
        this.maxFrameTimeSamples = 60;
        
        this.init();
    }
    
    /**
     * 初始化遊戲循環 - Initialize game loop
     */
    init() {
        console.log('遊戲循環初始化');
        this.setState(GameState.INITIALIZING);
    }
    
    /**
     * 設置遊戲狀態 - Set game state
     * @param {string} newState - 新狀態
     * @param {Object} data - 狀態數據
     */
    setState(newState, data = {}) {
        const oldState = this.state;
        this.state = newState;
        
        console.log(`遊戲狀態變更: ${oldState} -> ${newState}`, data);
        this.onStateChange(newState, oldState, data);
        
        // 狀態特定處理
        switch (newState) {
            case GameState.PLAYING:
                if (!this.isRunning) {
                    this.start();
                }
                break;
                
            case GameState.PAUSED:
                // 暫停時可以繼續運行循環但跳過遊戲邏輯更新
                break;
                
            case GameState.GAME_OVER:
            case GameState.COMPLETED:
                // 遊戲結束時可以停止循環或繼續運行
                break;
        }
    }
    
    /**
     * 獲取當前狀態 - Get current state
     * @returns {string} 當前狀態
     */
    getState() {
        return this.state;
    }
    
    /**
     * 開始遊戲循環 - Start game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
        this.animationId = requestAnimationFrame((timestamp) => this.loop(timestamp));
        
        console.log('遊戲循環開始');
    }
    
    /**
     * 停止遊戲循環 - Stop game loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        console.log('遊戲循環停止');
    }
    
    /**
     * 暫停遊戲 - Pause game
     */
    pause() {
        if (this.state === GameState.PLAYING) {
            this.setState(GameState.PAUSED);
        }
    }
    
    /**
     * 恢復遊戲 - Resume game
     */
    resume() {
        if (this.state === GameState.PAUSED) {
            this.setState(GameState.PLAYING);
        }
    }
    
    /**
     * 切換暫停狀態 - Toggle pause state
     */
    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.pause();
        } else if (this.state === GameState.PAUSED) {
            this.resume();
        }
    }
    
    /**
     * 遊戲循環主函數 - Game loop main function
     * @param {number} timestamp - 時間戳
     */
    loop(timestamp) {
        if (!this.isRunning) return;
        
        // 計算時間增量
        this.deltaTime = (timestamp - this.lastTime) / 1000; // 轉換為秒
        this.lastTime = timestamp;
        
        // 限制最大時間增量，避免跳幀問題
        if (this.deltaTime > this.maxDeltaTime) {
            this.deltaTime = this.maxDeltaTime;
        }
        
        // 更新FPS計算
        this.updateFps(timestamp);
        
        // 根據狀態執行更新
        if (this.state === GameState.PLAYING) {
            this.onUpdate(this.deltaTime);
        }
        
        // 總是執行渲染（即使暫停也要渲染UI）
        this.onRender(this.deltaTime);
        
        // 更新統計信息
        this.updateStats();
        
        // 繼續下一幀
        this.animationId = requestAnimationFrame((nextTimestamp) => this.loop(nextTimestamp));
    }
    
    /**
     * 更新FPS計算 - Update FPS calculation
     * @param {number} timestamp - 時間戳
     */
    updateFps(timestamp) {
        this.frameCount++;
        
        // 每秒更新一次FPS
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
            
            // 更新統計信息
            this.stats.averageFps = (this.stats.totalFrames / (this.stats.totalTime / 1000)) || 0;
            this.stats.minFps = Math.min(this.stats.minFps, this.fps);
            this.stats.maxFps = Math.max(this.stats.maxFps, this.fps);
            
            // 更新顯示（如果啟用）
            if (this.showStats && this.statsElement) {
                this.updateStatsDisplay();
            }
        }
        
        // 記錄幀時間用於性能分析
        this.frameTimes.push(this.deltaTime);
        if (this.frameTimes.length > this.maxFrameTimeSamples) {
            this.frameTimes.shift();
        }
    }
    
    /**
     * 更新統計信息 - Update statistics
     */
    updateStats() {
        this.stats.totalFrames++;
        this.stats.totalTime += this.deltaTime * 1000; // 轉換為毫秒
    }
    
    /**
     * 更新統計顯示 - Update stats display
     */
    updateStatsDisplay() {
        if (!this.statsElement) return;
        
        const avgFrameTime = this.getAverageFrameTime() * 1000; // 轉換為毫秒
        const fpsVariation = this.getFpsVariation();
        
        this.statsElement.innerHTML = `
            <div style="font-family: monospace; background: rgba(0,0,0,0.7); color: white; padding: 8px; border-radius: 4px;">
                <div>FPS: ${Math.round(this.fps)} / ${this.targetFps}</div>
                <div>幀時間: ${avgFrameTime.toFixed(2)}ms</div>
                <div>狀態: ${this.state}</div>
                <div>平均FPS: ${this.stats.averageFps.toFixed(1)}</div>
                <div>波動: ${fpsVariation.toFixed(1)}%</div>
            </div>
        `;
    }
    
    /**
     * 獲取平均幀時間 - Get average frame time
     * @returns {number} 平均幀時間（秒）
     */
    getAverageFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        
        const sum = this.frameTimes.reduce((a, b) => a + b, 0);
        return sum / this.frameTimes.length;
    }
    
    /**
     * 獲取FPS波動 - Get FPS variation
     * @returns {number} FPS波動百分比
     */
    getFpsVariation() {
        if (this.frameTimes.length < 2) return 0;
        
        const avg = this.getAverageFrameTime();
        const variance = this.frameTimes.reduce((sum, time) => {
            return sum + Math.pow(time - avg, 2);
        }, 0) / this.frameTimes.length;
        
        const stdDev = Math.sqrt(variance);
        return (stdDev / avg) * 100;
    }
    
    /**
     * 獲取性能報告 - Get performance report
     * @returns {Object} 性能報告
     */
    getPerformanceReport() {
        return {
            currentFps: this.fps,
            averageFps: this.stats.averageFps,
            minFps: this.stats.minFps,
            maxFps: this.stats.maxFps,
            frameTime: this.getAverageFrameTime() * 1000,
            fpsVariation: this.getFpsVariation(),
            totalFrames: this.stats.totalFrames,
            totalTime: this.stats.totalTime / 1000, // 轉換為秒
            state: this.state
        };
    }
    
    /**
     * 重置統計信息 - Reset statistics
     */
    resetStats() {
        this.stats = {
            totalFrames: 0,
            totalTime: 0,
            averageFps: 0,
            minFps: Infinity,
            maxFps: 0
        };
        this.frameTimes = [];
    }
    
    /**
     * 設置更新回調 - Set update callback
     * @param {Function} callback - 更新回調函數
     */
    setUpdateCallback(callback) {
        this.onUpdate = callback;
    }
    
    /**
     * 設置渲染回調 - Set render callback
     * @param {Function} callback - 渲染回調函數
     */
    setRenderCallback(callback) {
        this.onRender = callback;
    }
    
    /**
     * 設置狀態變更回調 - Set state change callback
     * @param {Function} callback - 狀態變更回調函數
     */
    setStateChangeCallback(callback) {
        this.onStateChange = callback;
    }
    
    /**
     * 啟用統計顯示 - Enable stats display
     * @param {HTMLElement} element - 顯示元素
     */
    enableStats(element = null) {
        this.showStats = true;
        if (element) {
            this.statsElement = element;
        } else if (!this.statsElement) {
            // 創建默認統計顯示元素
            this.statsElement = document.createElement('div');
            this.statsElement.style.position = 'fixed';
            this.statsElement.style.top = '10px';
            this.statsElement.style.right = '10px';
            this.statsElement.style.zIndex = '1000';
            document.body.appendChild(this.statsElement);
        }
    }
    
    /**
     * 禁用統計顯示 - Disable stats display
     */
    disableStats() {
        this.showStats = false;
        if (this.statsElement && this.statsElement.parentNode) {
            this.statsElement.parentNode.removeChild(this.statsElement);
            this.statsElement = null;
        }
    }
    
    /**
     * 銷毀遊戲循環 - Destroy game loop
     */
    destroy() {
        this.stop();
        this.disableStats();
        
        this.onUpdate = null;
        this.onRender = null;
        this.onStateChange = null;
        
        console.log('遊戲循環銷毀');
    }
}

/**
 * 時間控制器類別 - Time Controller Class
 * 用於管理遊戲時間、計時器和延遲
 */
export class TimeController {
    constructor() {
        this.startTime = performance.now();
        this.gameTime = 0;
        this.timeScale = 1.0;
        this.paused = false;
        this.timers = new Map();
        this.nextTimerId = 1;
    }
    
    /**
     * 更新遊戲時間 - Update game time
     * @param {number} deltaTime - 時間增量（秒）
     */
    update(deltaTime) {
        if (!this.paused) {
            this.gameTime += deltaTime * this.timeScale;
        }
        
        // 更新計時器
        this.updateTimers(deltaTime);
    }
    
    /**
     * 設置時間縮放 - Set time scale
     * @param {number} scale - 時間縮放因子
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
    }
    
    /**
     * 暫停時間 - Pause time
     */
    pause() {
        this.paused = true;
    }
    
    /**
     * 恢復時間 - Resume time
     */
    resume() {
        this.paused = false;
    }
    
    /**
     * 獲取遊戲時間 - Get game time
     * @returns {number} 遊戲時間（秒）
     */
    getGameTime() {
        return this.gameTime;
    }
    
    /**
     * 獲取真實時間 - Get real time
     * @returns {number} 真實時間（秒）
     */
    getRealTime() {
        return (performance.now() - this.startTime) / 1000;
    }
    
    /**
     * 設置計時器 - Set timer
     * @param {Function} callback - 回調函數
     * @param {number} delay - 延遲時間（秒）
     * @param {boolean} repeat - 是否重複
     * @returns {number} 計時器ID
     */
    setTimer(callback, delay, repeat = false) {
        const timerId = this.nextTimerId++;
        this.timers.set(timerId, {
            callback,
            delay,
            repeat,
            elapsed: 0,
            active: true
        });
        return timerId;
    }
    
    /**
     * 清除計時器 - Clear timer
     * @param {number} timerId - 計時器ID
     */
    clearTimer(timerId) {
        this.timers.delete(timerId);
    }
    
    /**
     * 清除所有計時器 - Clear all timers
     */
    clearAllTimers() {
        this.timers.clear();
    }
    
    /**
     * 更新計時器 - Update timers
     * @param {number} deltaTime - 時間增量（秒）
     */
    updateTimers(deltaTime) {
        const scaledDelta = deltaTime * this.timeScale;
        
        for (const [timerId, timer] of this.timers) {
            if (!timer.active) continue;
            
            timer.elapsed += scaledDelta;
            
            if (timer.elapsed >= timer.delay) {
                try {
                    timer.callback();
                } catch (error) {
                    console.error('計時器回調錯誤:', error);
                }
                
                if (timer.repeat) {
                    timer.elapsed = 0;
                } else {
                    timer.active = false;
                    this.timers.delete(timerId);
                }
            }
        }
    }
    
    /**
     * 延遲執行 - Delay execution
     * @param {number} delay - 延遲時間（秒）
     * @returns {Promise<void>} Promise
     */
    delay(delay) {
        return new Promise(resolve => {
            this.setTimer(resolve, delay);
        });
    }
}

/**
 * 創建遊戲循環實例 - Create game loop instance
 * @param {Object} options - 配置選項
 * @returns {GameLoop} 遊戲循環實例
 */
export function createGameLoop(options = {}) {
    return new GameLoop(options);
}

/**
 * 創建時間控制器實例 - Create time controller instance
 * @returns {TimeController} 時間控制器實例
 */
export function createTimeController() {
    return new TimeController();
}

/**
 * 全局遊戲循環實例 - Global game loop instance
 */
let globalGameLoop = null;

/**
 * 全局時間控制器實例 - Global time controller instance
 */
let globalTimeController = null;

/**
 * 獲取全局遊戲循環 - Get global game loop
 * @param {Object} options - 配置選項
 * @returns {GameLoop} 全局遊戲循環
 */
export function getGameLoop(options = {}) {
    if (!globalGameLoop) {
        globalGameLoop = createGameLoop(options);
    }
    return globalGameLoop;
}

/**
 * 獲取全局時間控制器 - Get global time controller
 * @returns {TimeController} 全局時間控制器
 */
export function getTimeController() {
    if (!globalTimeController) {
        globalTimeController = createTimeController();
    }
    return globalTimeController;
}