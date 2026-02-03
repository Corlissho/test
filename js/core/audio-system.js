/**
 * 音頻系統模組 - Audio System Module
 * 提供統一的音頻播放和管理功能
 */

/**
 * 音頻系統類別 - Audio System Class
 */
export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.music = null;
        this.isMuted = false;
        this.volume = 1.0;
        this.musicVolume = 0.7;
        this.soundVolume = 0.8;
        
        this.init();
    }
    
    /**
     * 初始化音頻系統 - Initialize audio system
     */
    init() {
        try {
            // 創建音頻上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                console.log('音頻系統初始化成功');
            } else {
                console.warn('瀏覽器不支持Web Audio API');
            }
        } catch (error) {
            console.error('音頻系統初始化失敗:', error);
        }
    }
    
    /**
     * 加載音效 - Load sound effect
     * @param {string} name - 音效名稱
     * @param {string} url - 音效URL
     * @returns {Promise<AudioBuffer>} 音頻緩衝區
     */
    async loadSound(name, url) {
        if (this.sounds.has(name)) {
            return this.sounds.get(name);
        }
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            
            if (this.audioContext) {
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sounds.set(name, audioBuffer);
                return audioBuffer;
            } else {
                // 備用方案：使用HTML5 Audio
                const audio = new Audio(url);
                this.sounds.set(name, audio);
                return audio;
            }
        } catch (error) {
            console.error(`加載音效失敗 ${name}:`, error);
            return null;
        }
    }
    
    /**
     * 播放音效 - Play sound effect
     * @param {string} name - 音效名稱
     * @param {Object} options - 播放選項
     */
    playSound(name, options = {}) {
        if (this.isMuted) return null;
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`音效未找到: ${name}`);
            return null;
        }
        
        const {
            volume = this.soundVolume,
            loop = false,
            playbackRate = 1.0,
            fadeIn = 0,
            fadeOut = 0
        } = options;
        
        try {
            if (sound instanceof AudioBuffer && this.audioContext) {
                // 使用Web Audio API播放
                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();
                
                source.buffer = sound;
                source.loop = loop;
                source.playbackRate.value = playbackRate;
                
                gainNode.gain.value = volume * this.volume;
                
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // 淡入效果
                if (fadeIn > 0) {
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(
                        volume * this.volume,
                        this.audioContext.currentTime + fadeIn
                    );
                }
                
                source.start();
                
                // 淡出效果
                if (fadeOut > 0) {
                    const stopTime = this.audioContext.currentTime + sound.duration - fadeOut;
                    gainNode.gain.setValueAtTime(volume * this.volume, stopTime);
                    gainNode.gain.linearRampToValueAtTime(0, stopTime + fadeOut);
                    source.stop(stopTime + fadeOut);
                } else if (!loop) {
                    source.stop(this.audioContext.currentTime + sound.duration);
                }
                
                return { source, gainNode };
            } else if (sound instanceof HTMLAudioElement) {
                // 使用HTML5 Audio播放
                const audio = sound.cloneNode();
                audio.volume = volume * this.volume;
                audio.loop = loop;
                audio.playbackRate = playbackRate;
                
                // 淡入效果
                if (fadeIn > 0) {
                    audio.volume = 0;
                    audio.play();
                    
                    let startVolume = 0;
                    const targetVolume = volume * this.volume;
                    const fadeStep = targetVolume / (fadeIn * 60); // 假設60fps
                    
                    const fadeInterval = setInterval(() => {
                        startVolume += fadeStep;
                        audio.volume = Math.min(startVolume, targetVolume);
                        
                        if (startVolume >= targetVolume) {
                            clearInterval(fadeInterval);
                        }
                    }, 1000 / 60);
                } else {
                    audio.play();
                }
                
                return audio;
            }
        } catch (error) {
            console.error(`播放音效失敗 ${name}:`, error);
        }
        
        return null;
    }
    
    /**
     * 播放背景音樂 - Play background music
     * @param {string} name - 音樂名稱
     * @param {Object} options - 播放選項
     */
    playMusic(name, options = {}) {
        if (this.music) {
            this.stopMusic();
        }
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`背景音樂未找到: ${name}`);
            return null;
        }
        
        const {
            volume = this.musicVolume,
            loop = true,
            fadeIn = 1.0,
            fadeOut = 1.0
        } = options;
        
        this.music = this.playSound(name, {
            volume,
            loop,
            fadeIn,
            fadeOut: 0 // 音樂不自動淡出
        });
        
        return this.music;
    }
    
    /**
     * 停止背景音樂 - Stop background music
     * @param {number} fadeOut - 淡出時間（秒）
     */
    stopMusic(fadeOut = 1.0) {
        if (!this.music) return;
        
        if (fadeOut > 0) {
            if (this.music.source && this.music.gainNode) {
                // Web Audio API淡出
                const currentTime = this.audioContext.currentTime;
                this.music.gainNode.gain.cancelScheduledValues(currentTime);
                this.music.gainNode.gain.setValueAtTime(this.music.gainNode.gain.value, currentTime);
                this.music.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOut);
                this.music.source.stop(currentTime + fadeOut);
            } else if (this.music instanceof HTMLAudioElement) {
                // HTML5 Audio淡出
                const startVolume = this.music.volume;
                const fadeStep = startVolume / (fadeOut * 60);
                
                const fadeInterval = setInterval(() => {
                    this.music.volume = Math.max(0, this.music.volume - fadeStep);
                    
                    if (this.music.volume <= 0) {
                        clearInterval(fadeInterval);
                        this.music.pause();
                        this.music.currentTime = 0;
                    }
                }, 1000 / 60);
            }
            
            setTimeout(() => {
                this.music = null;
            }, fadeOut * 1000);
        } else {
            if (this.music.source) {
                this.music.source.stop();
            } else if (this.music instanceof HTMLAudioElement) {
                this.music.pause();
                this.music.currentTime = 0;
            }
            this.music = null;
        }
    }
    
    /**
     * 設置音量 - Set volume
     * @param {number} volume - 音量（0.0 - 1.0）
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // 更新正在播放的音效
        this.sounds.forEach((sound, name) => {
            if (sound instanceof HTMLAudioElement && !sound.paused) {
                sound.volume = this.volume;
            }
        });
        
        // 更新背景音樂
        if (this.music) {
            if (this.music.gainNode) {
                this.music.gainNode.gain.value = this.musicVolume * this.volume;
            } else if (this.music instanceof HTMLAudioElement) {
                this.music.volume = this.musicVolume * this.volume;
            }
        }
    }
    
    /**
     * 設置音效音量 - Set sound effect volume
     * @param {number} volume - 音量（0.0 - 1.0）
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * 設置音樂音量 - Set music volume
     * @param {number} volume - 音量（0.0 - 1.0）
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            if (this.music.gainNode) {
                this.music.gainNode.gain.value = this.musicVolume * this.volume;
            } else if (this.music instanceof HTMLAudioElement) {
                this.music.volume = this.musicVolume * this.volume;
            }
        }
    }
    
    /**
     * 靜音/取消靜音 - Toggle mute
     * @param {boolean} muted - 是否靜音
     */
    setMuted(muted) {
        this.isMuted = muted;
        
        if (muted) {
            if (this.music) {
                if (this.music.gainNode) {
                    this.music.gainNode.gain.value = 0;
                } else if (this.music instanceof HTMLAudioElement) {
                    this.music.volume = 0;
                }
            }
        } else {
            if (this.music) {
                if (this.music.gainNode) {
                    this.music.gainNode.gain.value = this.musicVolume * this.volume;
                } else if (this.music instanceof HTMLAudioElement) {
                    this.music.volume = this.musicVolume * this.volume;
                }
            }
        }
    }
    
    /**
     * 切換靜音 - Toggle mute
     */
    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }
    
    /**
     * 暫停所有音頻 - Pause all audio
     */
    pauseAll() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
        
        this.sounds.forEach(sound => {
            if (sound instanceof HTMLAudioElement) {
                sound.pause();
            }
        });
        
        if (this.music instanceof HTMLAudioElement) {
            this.music.pause();
        }
    }
    
    /**
     * 恢復所有音頻 - Resume all audio
     */
    resumeAll() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (this.music instanceof HTMLAudioElement && !this.isMuted) {
            this.music.play();
        }
    }
    
    /**
     * 停止所有音效 - Stop all sound effects
     */
    stopAllSounds() {
        this.sounds.forEach(sound => {
            if (sound instanceof HTMLAudioElement) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }
    
    /**
     * 預加載常用音效 - Preload common sound effects
     * @param {Object} soundMap - 音效映射表
     */
    async preloadSounds(soundMap) {
        const promises = [];
        
        for (const [name, url] of Object.entries(soundMap)) {
            promises.push(this.loadSound(name, url));
        }
        
        await Promise.all(promises);
        console.log('音效預加載完成');
    }
    
    /**
     * 獲取音頻上下文狀態 - Get audio context state
     * @returns {string} 音頻上下文狀態
     */
    getContextState() {
        return this.audioContext ? this.audioContext.state : 'unsupported';
    }
    
    /**
     * 銷毀音頻系統 - Destroy audio system
     */
    destroy() {
        this.stopMusic();
        this.stopAllSounds();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.sounds.clear();
        this.music = null;
    }
}

/**
 * 創建音頻系統實例 - Create audio system instance
 * @returns {AudioSystem} 音頻系統實例
 */
export function createAudioSystem() {
    return new AudioSystem();
}

/**
 * 全局音頻系統實例 - Global audio system instance
 */
let globalAudioSystem = null;

/**
 * 獲取全局音頻系統 - Get global audio system
 * @returns {AudioSystem} 全局音頻系統
 */
export function getAudioSystem() {
    if (!globalAudioSystem) {
        globalAudioSystem = createAudioSystem();
    }
    return globalAudioSystem;
}
