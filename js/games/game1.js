/**
 * 遊戲1：卡通賽道賽車 - Racing Game
 * 主遊戲邏輯和功能
 */

// 導入核心模組
import { getAudioSystem } from '../core/audio-system.js';
import { getParticleSystem } from '../core/particle-system.js';
import { getGameLoop, GameState } from '../core/game-loop.js';
import { saveGameStats, loadGameStats } from '../utils/storage.js';
import { debounce, getDeviceInfo } from '../utils/helpers.js';

/**
 * 遊戲主類別 - Game Main Class
 */
export class RacingGame {
    constructor() {
        // 遊戲元素
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.miniMapCanvas = document.getElementById('miniMap');
        this.miniMapCtx = this.miniMapCanvas.getContext('2d');
        
        // UI元素
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed');
        this.livesElement = document.getElementById('lives');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.restartButton = document.getElementById('restartButton');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.statusEffectsElement = document.getElementById('statusEffects');
        this.progressFillElement = document.getElementById('progressFill');
        this.lapProgressElement = document.getElementById('lapProgress');
        this.countdownOverlay = document.getElementById('countdownOverlay');
        this.countdownNumber = document.getElementById('countdownNumber');
        
        // 控制鍵元素
        this.keyUp = document.getElementById('keyUp');
        this.keyDown = document.getElementById('keyDown');
        this.keyLeft = document.getElementById('keyLeft');
        this.keyRight = document.getElementById('keyRight');
        
        // 遊戲狀態
        this.gameRunning = false;
        this.gamePaused = false;
        this.countDownActive = false;
        this.score = 0;
        this.lives = 3;
        this.speed = 0;
        this.trackProgress = 0;
        this.currentLap = 0;
        this.gameFrameId = null;
        this.gameInitialized = false;
        this.gameStartTime = Date.now();
        
        // 遊戲配置
        this.maxSpeed = 15;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        this.totalTrackLength = 3000;
        this.trackCount = 3;
        this.trackWidth = this.canvas.width / this.trackCount;
        
        // 賽道顏色
        this.trackColors = ['#2E8B57', '#228B22', '#006400'];
        
        // 車道標記
        this.laneMarkings = [];
        for (let i = 1; i < this.trackCount; i++) {
            this.laneMarkings.push({
                x: i * this.trackWidth,
                y: 0,
                width: 10,
                height: 40,
                gap: 20
            });
        }
        
        // 道具類型定義
        this.POWERUP_TYPES = {
            SHIELD: {
                id: 'shield',
                name: '護盾',
                color: '#4CAF50',
                duration: 3000,
                icon: '🛡️'
            },
            DOUBLE_SCORE: {
                id: 'double',
                name: '分數加倍',
                color: '#9C27B0',
                duration: 30000,
                icon: '⭐'
            },
            MAGNET: {
                id: 'magnet',
                name: '磁鐵',
                color: '#2196F3',
                duration: 10000,
                icon: '🧲'
            }
        };
        
        // 玩家狀態效果
        this.playerEffects = {
            shield: { active: false, endTime: 0 },
            doubleScore: { active: false, endTime: 0 },
            magnet: { active: false, endTime: 0, range: 200 }
        };
        
        // 玩家車輛
        this.playerCar = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 120,
            width: 50,
            height: 100,
            color: '#FF416C',
            track: 1,
            speed: 0,
            maxSpeed: this.maxSpeed,
            acceleration: this.acceleration,
            deceleration: this.deceleration,
            isInvulnerable: false
        };
        
        // 敵方車輛和道具陣列
        this.enemyCars = [];
        this.powerUps = [];
        
        // 控制狀態
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        
        // 觸控控制
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastLaneChangeTime = 0;
        this.laneChangeCooldown = 200;
        
        // 核心系統
        this.audioSystem = getAudioSystem();
        this.particleSystem = getParticleSystem(this.canvas);
        this.gameLoop = getGameLoop({
            targetFps: 60,
            showStats: false,
            onUpdate: this.update.bind(this),
            onRender: this.render.bind(this),
            onStateChange: this.handleStateChange.bind(this)
        });
        
        // 設備信息
        this.deviceInfo = getDeviceInfo();
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化遊戲 - Initialize game
     */
    init() {
        console.log('賽車遊戲初始化');
        
        // 加載遊戲統計數據
        this.loadGameStats();
        
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 初始化畫布
        this.drawInitialScene();
        
        this.gameInitialized = true;
        console.log('賽車遊戲初始化完成');
    }
    
    /**
     * 設置事件監聽器 - Setup event listeners
     */
    setupEventListeners() {
        // 鍵盤事件
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 觸控事件
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this));
        
        // 按鈕事件
        this.startButton.addEventListener('click', this.handleStartButton.bind(this));
        this.pauseButton.addEventListener('click', this.handlePauseButton.bind(this));
        this.restartButton.addEventListener('click', this.handleRestartButton.bind(this));
        
        // 窗口事件
        window.addEventListener('resize', debounce(this.handleResize.bind(this), 250));
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
    }
    
    /**
     * 加載遊戲統計數據 - Load game statistics
     */
    loadGameStats() {
        const stats = loadGameStats('racing_game');
        if (stats) {
            console.log('已加載遊戲統計數據:', stats);
        }
    }
    
    /**
     * 保存遊戲統計數據 - Save game statistics
     */
    saveGameStats() {
        const stats = {
            score: this.score,
            highScore: Math.max(this.score, loadGameStats('racing_game')?.highScore || 0),
            laps: this.currentLap,
            totalPlayTime: Date.now() - this.gameStartTime,
            lastPlayed: new Date().toISOString()
        };
        
        saveGameStats('racing_game', stats);
    }
    
    /**
     * 繪製初始場景 - Draw initial scene
     */
    drawInitialScene() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTracks();
        this.drawPlayerCar();
        this.drawMiniMap();
    }
    
    /**
     * 繪製賽道 - Draw tracks
     */
    drawTracks() {
        // 繪製賽道
        for (let i = 0; i < this.trackCount; i++) {
            this.ctx.fillStyle = this.trackColors[i];
            this.ctx.fillRect(i * this.trackWidth, 0, this.trackWidth, this.canvas.height);
            
            // 賽道邊界
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(i * this.trackWidth, 0, 5, this.canvas.height);
            this.ctx.fillRect((i + 1) * this.trackWidth - 5, 0, 5, this.canvas.height);
        }
        
        // 繪製車道標記
        this.laneMarkings.forEach(marking => {
            for (let y = 0; y < this.canvas.height; y += marking.height + marking.gap) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(marking.x - marking.width/2, y, marking.width, marking.height);
            }
        });
        
        // 繪製背景
        this.drawBackground();
    }
    
    /**
     * 繪製背景 - Draw background
     */
    drawBackground() {
        // 天空背景
        this.ctx.fillStyle = 'rgba(15, 52, 96, 0.7)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 100);
        this.ctx.lineTo(150, 50);
        this.ctx.lineTo(300, 120);
        this.ctx.lineTo(500, 80);
        this.ctx.lineTo(700, 130);
        this.ctx.lineTo(800, 90);
        this.ctx.lineTo(800, 0);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 雲朵
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.drawCloud(100, 60, 40);
        this.drawCloud(400, 40, 30);
        this.drawCloud(600, 80, 50);
    }
    
    /**
     * 繪製雲朵 - Draw cloud
     */
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y + size * 0.3, size * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 繪製玩家車輛 - Draw player car
     */
    drawPlayerCar() {
        const car = this.playerCar;
        
        // 護盾效果
        if (this.playerEffects.shield.active) {
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                car.x + car.width/2,
                car.y + car.height/2,
                Math.max(car.width, car.height)/2 + 15,
                0, Math.PI * 2
            );
            this.ctx.stroke();
            
            const pulse = (Date.now() % 1000) / 1000;
            this.ctx.globalAlpha = 0.3 + 0.2 * Math.sin(pulse * Math.PI * 2);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.beginPath();
            this.ctx.arc(
                car.x + car.width/2,
                car.y + car.height/2,
                Math.max(car.width, car.height)/2 + 10,
                0, Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
        
        // 車輛主體
        this.ctx.fillStyle = car.color;
        this.ctx.fillRect(car.x, car.y, car.width, car.height);
        
        // 磁鐵效果範圍
        if (this.playerEffects.magnet.active) {
            this.ctx.strokeStyle = '#2196F3';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(
                car.x + car.width/2,
                car.y + car.height/2,
                this.playerEffects.magnet.range,
                0, Math.PI * 2
            );
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // 車輛細節
        this.ctx.fillStyle = '#4FC3F7';
        this.ctx.fillRect(car.x + 5, car.y + 10, car.width - 10, 30);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(car.x + 5, car.y + car.height - 15, 10, 10);
        this.ctx.fillRect(car.x + car.width - 15, car.y + car.height - 15, 10, 10);
        
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(car.x - 5, car.y + 15, 5, 25);
        this.ctx.fillRect(car.x + car.width, car.y + 15, 5, 25);
        this.ctx.fillRect(car.x - 5, car.y + car.height - 40, 5, 25);
        this.ctx.fillRect(car.x + car.width, car.y + car.height - 40, 5, 25);
    }
    
    /**
     * 繪製敵方車輛 - Draw enemy cars
     */
    drawEnemyCars() {
        this.enemyCars.forEach(car => {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y, car.width, car.height);
            
            this.ctx.fillStyle = '#999';
            this.ctx.fillRect(car.x + 5, car.y + 10, car.width - 10, 20);
            
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(car.x - 5, car.y + 15, 5, 20);
            this.ctx.fillRect(car.x + car.width, car.y + 15, 5, 20);
            this.ctx.fillRect(car.x - 5, car.y + car.height - 35, 5, 20);
            this.ctx.fillRect(car.x + car.width, car.y + car.height - 35, 5, 20);
        });
    }
    
    /**
     * 繪製道具 - Draw power-ups
     */
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            const powerUpType = this.POWERUP_TYPES[powerUp.type];
            if (powerUpType) {
                this.drawPowerUp(powerUp.x, powerUp.y, powerUp.size, powerUpType);
            }
        });
    }
    
    /**
     * 繪製單個道具 - Draw single power-up
     */
    drawPowerUp(x, y, size, powerUpType) {
        switch(powerUpType.id) {
            case 'shield':
                this.drawShieldPowerUp(x, y, size);
                break;
            case 'double':
                this.drawDoubleScorePowerUp(x, y, size);
                break;
            case 'magnet':
                this.drawMagnetPowerUp(x, y, size);
                break;
        }
    }
    
    /**
     * 繪製護盾道具 - Draw shield power-up
     */
    drawShieldPowerUp(x, y, size) {
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(x + size/2, y + size/4);
        this.ctx.lineTo(x + size/4, y + size/2);
        this.ctx.lineTo(x + size/2, y + size*3/4);
        this.ctx.lineTo(x + size*3/4, y + size/2);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 繪製分數加倍道具 - Draw double score power-up
     */
    drawDoubleScorePowerUp(x, y, size) {
        this.ctx.fillStyle = '#9C27B0';
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.drawStar(this.ctx, x + size/2, y + size/2, 5, size/4, size/8);
    }
    
    /**
     * 繪製磁鐵道具 - Draw magnet power-up
     */
    drawMagnetPowerUp(x, y, size) {
        this.ctx.fillStyle = '#2196F3';
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/3, Math.PI * 0.25, Math.PI * 0.75);
        this.ctx.arc(x + size/2, y + size/2, size/3, Math.PI * 1.25, Math.PI * 1.75);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 繪製星星 - Draw star
     */
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * 繪製小地圖 - Draw mini map
     */
    drawMiniMap() {
        this.miniMapCtx.clearRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
        const scale = Math.min(this.miniMapCanvas.width / this.canvas.width, this.miniMapCanvas.height / this.canvas.height) * 0.8;
        
        // 繪製賽道
        for (let i = 0; i < this.trackCount; i++) {
            this.miniMapCtx.fillStyle = this.trackColors[i];
            this.miniMapCtx.fillRect(i * this.trackWidth * scale, 0, this.trackWidth * scale, this.miniMapCanvas.height);
        }
        
        // 繪製車道標記
        for (let i = 1; i < this.trackCount; i++) {
            this.miniMapCtx.fillStyle = '#FFFFFF';
            this.miniMapCtx.fillRect(i * this.trackWidth * scale - 2, 0, 4, this.miniMapCanvas.height);
        }
        
        // 繪製玩家車輛
        this.miniMapCtx.fillStyle = '#FF416C';
        this.miniMapCtx.beginPath();
        this.miniMapCtx.arc(
            (this.playerCar.x + this.playerCar.width/2) * scale,
            this.miniMapCanvas.height - 20,
            8,
            0, Math.PI * 2
        );
        this.miniMapCtx.fill();
        
        // 繪製敵方車輛
        this.enemyCars.forEach(car => {
            this.miniMapCtx.fillStyle = car.color;
            this.miniMapCtx.beginPath();
            this.miniMapCtx.arc(
                car.x * scale,
                this.miniMapCanvas.height - (car.y / this.canvas.height) * this.miniMapCanvas.height,
                5,
                0, Math.PI * 2
            );
            this.miniMapCtx.fill();
        });
        
        // 繪製方向指示
        this.miniMapCtx.fillStyle = '#FFFFFF';
        this.miniMapCtx.font = '10px Arial';
        this.miniMapCtx.textAlign = 'center';
        this.miniMapCtx.fillText('↑', this.miniMapCanvas.width / 2, 15);
    }
    
    /**
     * 事件處理器 - Event handlers
     */
    handleKeyDown(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = true;
            switch(e.key) {
                case 'ArrowUp': this.keyUp.classList.add('active'); break;
                case 'ArrowDown': this.keyDown.classList.add('active'); break;
                case 'ArrowLeft': this.keyLeft.classList.add('active'); break;
                case 'ArrowRight': this.keyRight.classList.add('active'); break;
            }
        }
    }
    
    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = false;
            switch(e.key) {
                case 'ArrowUp': this.keyUp.classList.remove('active'); break;
                case 'ArrowDown': this.keyDown.classList.remove('active'); break;
                case 'ArrowLeft': this.keyLeft.classList.remove('active'); break;
                case 'ArrowRight': this.keyRight.classList.remove('active'); break;
            }
        }
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
    
    handleTouchMove(e) {
        if (!this.gameRunning || this.gamePaused) return;
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;
        const now = Date.now();
        
        if (Math.abs(deltaX) > 30 && now - this.lastLaneChangeTime > this.laneChangeCooldown) {
            if (deltaX > 0 && this.playerCar.track < this.trackCount - 1) {
                this.playerCar.track++;
                this.playerCar.x = this.playerCar.track * this.trackWidth + (this.trackWidth - this.playerCar.width) / 2;
                this.touchStartX = touchX;
                this.lastLaneChangeTime = now;
            } else if (deltaX < 0 && this.playerCar.track > 0) {
                this.playerCar.track--;
                this.playerCar.x = this.playerCar.track * this.trackWidth + (this.trackWidth - this.playerCar.width) / 2;
                this.touchStartX = touchX;
                this.lastLaneChangeTime = now;
            }
        }
        
        if (Math.abs(deltaY) > 20) {
            if (deltaY > 0 && this.playerCar.speed > 0) {
                this.playerCar.speed -= this.playerCar.deceleration * 3;
                this.touchStartY = touchY;
            } else if (deltaY < 0 && this.playerCar.speed < this.playerCar.maxSpeed) {
                this.playerCar.speed += this.playerCar.acceleration * 2;
                this.touchStartY = touchY;
            }
        }
        e.preventDefault();
    }
    
    handleStartButton() {
        this.audioSystem.playButtonClick();
        this.audioSystem.resumeAudio();
        if (!this.gameInitialized) {
            alert('遊戲資源尚未完全加載，請稍等...');
            return;
        }
        if (!this.gameRunning && !this.countDownActive) {
            this.startCountdown();
            this.startButton.textContent = '重新開始';
        } else if (this.gameOverScreen.style.display === 'flex') {
            this.startCountdown();
        } else if (this.gameRunning) {
            this.gameRunning = false;
            if (this.gameFrameId) {
                cancelAnimationFrame(this.gameFrameId);
                this.gameFrameId = null;
            }
            this.startCountdown();
        }
    }
    
    handlePauseButton() {
        this.audioSystem.playButtonClick();
        if (this.gameRunning && !this.countDownActive) {
            this.gamePaused = !this.gamePaused;
            this.pauseButton.textContent = this.gamePaused ? '繼續遊戲' : '暫停遊戲';
            if (!this.gamePaused) {
                this.gameLoop.start();
            }
        }
    }
    
    handleRestartButton() {
        this.audioSystem.playButtonClick();
        this.gameRunning = false;
        if (this.gameFrameId) {
            cancelAnimationFrame(this.gameFrameId);
            this.gameFrameId = null;
        }
        this.init();
        this.startCountdown();
        this.gameOverScreen.style.display = 'none';
    }
    
    handleResize() {
        // 處理窗口大小調整
        console.log('窗口大小調整');
    }
    
    handleWindowBlur() {
        if (this.gameRunning && !this.gamePaused) {
            this.gamePaused = true;
            this.pauseButton.textContent = '繼續遊戲';
        }
    }
    
    handleWindowFocus() {
        // 窗口獲得焦點
    }
    
    /**
     * 遊戲循環方法 - Game loop methods
     */
    update(deltaTime) {
        // 更新遊戲邏輯
        if (!this.gameRunning || this.gamePaused || this.countDownActive) {
            return;
        }
        
        // 更新玩家車輛
        this.updatePlayerCar();
        
        // 更新敵方車輛
        this.updateEnemyCars();
        
        // 更新道具
        this.updatePowerUps();
        
        // 檢查碰撞
        this.checkCollisions();
        
        // 檢查效果過期
        this.checkEffectsExpiry();
        
        // 更新粒子系統
        this.particleSystem.update(deltaTime);
    }
    
    render() {
        // 渲染遊戲畫面
        if (!this.gameRunning || this.gamePaused || this.countDownActive) {
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTracks();
        this.drawEnemyCars();
        this.drawPowerUps();
        this.drawPlayerCar();
        this.particleSystem.draw(this.ctx);
        this.drawMiniMap();
        
        // 更新UI
        this.updateUI();
    }
    
    handleStateChange(state) {
        console.log('遊戲狀態改變:', state);
    }
    
    /**
     * 遊戲邏輯方法 - Game logic methods
     */
    updatePlayerCar() {
        const car = this.playerCar;
        
        if (this.keys.ArrowUp && car.speed < car.maxSpeed) {
            car.speed += car.acceleration;
        } else if (this.keys.ArrowDown && car.speed > 0) {
            car.speed -= car.deceleration * 2;
        } else if (car.speed > 0) {
            car.speed -= car.deceleration;
        } else if (car.speed < 0) {
            car.speed = 0;
        }
        
        if (this.keys.ArrowLeft && car.track > 0) {
            car.track--;
            car.x = car.track * this.trackWidth + (this.trackWidth - car.width) / 2;
            this.keys.ArrowLeft = false;
            this.audioSystem.playLaneChange();
        } else if (this.keys.ArrowRight && car.track < this.trackCount - 1) {
            car.track++;
            car.x = car.track * this.trackWidth + (this.trackWidth - car.width) / 2;
            this.keys.ArrowRight = false;
            this.audioSystem.playLaneChange();
        }
        
        this.speed = Math.round(car.speed * 10);
        
        // 更新賽道進度
        if (car.speed > 0) {
            this.trackProgress += (car.speed / this.maxSpeed) * 0.05;
            if (this.trackProgress >= 100) {
                this.trackProgress = 0;
                this.currentLap++;
                this.score += 100;
                this.audioSystem.playLapComplete();
                this.showFloatingText(this.canvas.width/2, this.canvas.height/2, `+100 圈速獎勵!`, '#FFD700');
            }
            if (this.trackProgress > 100) this.trackProgress = 100;
        }
    }
    
    updateEnemyCars() {
        for (let i = this.enemyCars.length - 1; i >= 0; i--) {
            const car = this.enemyCars[i];
            car.y += car.speed;
            if (car.y > this.canvas.height) {
                this.enemyCars.splice(i, 1);
                let points = 10;
                if (this.playerEffects.doubleScore.active) {
                    points *= 2;
                }
                this.score += points;
            }
        }
        
        if (Math.random() < 0.03) {
            this.generateEnemyCar();
        }
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.playerEffects.magnet.active) {
                const dx = (this.playerCar.x + this.playerCar.width/2) - (powerUp.x + powerUp.size/2);
                const dy = (this.playerCar.y + this.playerCar.height/2) - (powerUp.y + powerUp.size/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.playerEffects.magnet.range) {
                    const speed = 8;
                    powerUp.x += (dx / distance) * speed;
                    powerUp.y += (dy / distance) * speed;
                } else {
                    powerUp.y += 5;
                }
            } else {
                powerUp.y += 5;
            }
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
        
        if (Math.random() < 0.015) {
            this.generatePowerUp();
        }
    }
    
    generateEnemyCar() {
        const track = Math.floor(Math.random() * this.trackCount);
        const x = track * this.trackWidth + (this.trackWidth - 50) / 2;
        const y = -100;
        const colors = ['#FF9800', '#9C27B0', '#2196F3', '#F44336'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        let enemySpeed = 3 + Math.random() * 5;
        this.enemyCars.push({
            x: x,
            y: y,
            width: 50,
            height: 100,
            color: color,
            track: track,
            speed: enemySpeed
        });
    }
    
    generatePowerUp() {
        const track = Math.floor(Math.random() * this.trackCount);
        const x = track * this.trackWidth + (this.trackWidth - 30) / 2;
        const y = -30;
        const powerUpTypes = Object.keys(this.POWERUP_TYPES);
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        this.powerUps.push({
            x: x,
            y: y,
            size: 30,
            track: track,
            type: randomType
        });
    }
    
    checkCollisions() {
        // 檢查與敵方車輛的碰撞
        for (let i = this.enemyCars.length - 1; i >= 0; i--) {
            const car = this.enemyCars[i];
            if (
                this.playerCar.x < car.x + car.width &&
                this.playerCar.x + this.playerCar.width > car.x &&
                this.playerCar.y < car.y + car.height &&
                this.playerCar.y + this.playerCar.height > car.y
            ) {
                if (this.playerEffects.shield.active) {
                    this.particleSystem.createExplosion(car.x + car.width/2, car.y + car.height/2, '#4CAF50', 15);
                    this.enemyCars.splice(i, 1);
                    this.score += 20;
                    this.audioSystem.playPowerUp('shield');
                } else {
                    this.particleSystem.createExplosion(car.x + car.width/2, car.y + car.height/2, '#FF416C', 25);
                    this.enemyCars.splice(i, 1);
                    this.lives--;
                    this.audioSystem.playCollision();
                    this.updateUI();
                    if (this.lives <= 0) {
                        this.audioSystem.playGameOver();
                        this.endGame();
                    }
                }
                return;
            }
        }
        
        // 檢查與道具的碰撞
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (
                this.playerCar.x < powerUp.x + powerUp.size &&
                this.playerCar.x + this.playerCar.width > powerUp.x &&
                this.playerCar.y < powerUp.y + powerUp.size &&
                this.playerCar.y + this.playerCar.height > powerUp.y
            ) {
                const powerUpType = this.POWERUP_TYPES[powerUp.type];
                this.powerUps.splice(i, 1);
                this.audioSystem.playPowerUp(powerUp.type);
                this.particleSystem.createExplosion(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2, powerUpType.color, 12);
                this.applyPowerUpEffect(powerUpType);
                this.updateUI();
            }
        }
    }
    
    applyPowerUpEffect(powerUpType) {
        if (!powerUpType) return;
        const now = Date.now();
        const endTime = now + powerUpType.duration;
        switch(powerUpType.id) {
            case 'shield':
                this.playerEffects.shield.active = true;
                this.playerEffects.shield.endTime = endTime;
                this.playerCar.isInvulnerable = true;
                break;
            case 'double':
                this.playerEffects.doubleScore.active = true;
                this.playerEffects.doubleScore.endTime = endTime;
                break;
            case 'magnet':
                this.playerEffects.magnet.active = true;
                this.playerEffects.magnet.endTime = endTime;
                break;
        }
        this.updateStatusEffects();
        setTimeout(() => {
            this.removePowerUpEffect(powerUpType
