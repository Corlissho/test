/**
 * 存儲工具模組 - Storage Utilities Module
 * 提供統一的本地存儲管理
 */

class StorageSystem {
    constructor() {
        this.prefix = 'gameverse_';
        this.supported = this.checkLocalStorageSupport();
    }

    /**
     * 檢查localStorage支持 - Check localStorage support
     * @returns {boolean} 是否支持localStorage
     */
    checkLocalStorageSupport() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage is not supported:', e);
            return false;
        }
    }

    /**
     * 獲取帶前綴的鍵名 - Get prefixed key name
     * @param {string} key - 原始鍵名
     * @returns {string} 帶前綴的鍵名
     */
    getPrefixedKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * 設置存儲項目 - Set storage item
     * @param {string} key - 鍵名
     * @param {any} value - 值（將被轉換為JSON字符串）
     * @returns {boolean} 是否成功
     */
    setItem(key, value) {
        if (!this.supported) return false;
        
        try {
            const stringValue = JSON.stringify(value);
            localStorage.setItem(this.getPrefixedKey(key), stringValue);
            return true;
        } catch (e) {
            console.error('Failed to set item in localStorage:', e);
            return false;
        }
    }

    /**
     * 獲取存儲項目 - Get storage item
     * @param {string} key - 鍵名
     * @param {any} defaultValue - 默認值（當項目不存在時返回）
     * @returns {any} 存儲的值或默認值
     */
    getItem(key, defaultValue = null) {
        if (!this.supported) return defaultValue;
        
        try {
            const item = localStorage.getItem(this.getPrefixedKey(key));
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (e) {
            console.error('Failed to get item from localStorage:', e);
            return defaultValue;
        }
    }

    /**
     * 移除存儲項目 - Remove storage item
     * @param {string} key - 鍵名
     * @returns {boolean} 是否成功
     */
    removeItem(key) {
        if (!this.supported) return false;
        
        try {
            localStorage.removeItem(this.getPrefixedKey(key));
            return true;
        } catch (e) {
            console.error('Failed to remove item from localStorage:', e);
            return false;
        }
    }

    /**
     * 清除所有存儲項目 - Clear all storage items
     * @param {boolean} includeNonPrefixed - 是否包含非前綴項目
     * @returns {boolean} 是否成功
     */
    clear(includeNonPrefixed = false) {
        if (!this.supported) return false;
        
        try {
            if (includeNonPrefixed) {
                localStorage.clear();
            } else {
                // 只清除帶前綴的項目
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }
            return true;
        } catch (e) {
            console.error('Failed to clear localStorage:', e);
            return false;
        }
    }

    /**
     * 檢查項目是否存在 - Check if item exists
     * @param {string} key - 鍵名
     * @returns {boolean} 是否存在
     */
    hasItem(key) {
        if (!this.supported) return false;
        
        try {
            return localStorage.getItem(this.getPrefixedKey(key)) !== null;
        } catch (e) {
            console.error('Failed to check item in localStorage:', e);
            return false;
        }
    }

    /**
     * 獲取所有鍵名 - Get all keys
     * @param {boolean} stripPrefix - 是否去除前綴
     * @returns {string[]} 所有鍵名
     */
    getAllKeys(stripPrefix = true) {
        if (!this.supported) return [];
        
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keys.push(stripPrefix ? key.substring(this.prefix.length) : key);
                }
            }
            return keys;
        } catch (e) {
            console.error('Failed to get keys from localStorage:', e);
            return [];
        }
    }

    /**
     * 獲取所有項目 - Get all items
     * @returns {Object} 所有項目的鍵值對
     */
    getAllItems() {
        if (!this.supported) return {};
        
        try {
            const items = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    const itemKey = key.substring(this.prefix.length);
                    const itemValue = JSON.parse(localStorage.getItem(key));
                    items[itemKey] = itemValue;
                }
            }
            return items;
        } catch (e) {
            console.error('Failed to get all items from localStorage:', e);
            return {};
        }
    }

    /**
     * 設置遊戲統計數據 - Set game statistics
     * @param {string} gameId - 遊戲ID
     * @param {Object} stats - 統計數據
     * @returns {boolean} 是否成功
     */
    setGameStats(gameId, stats) {
        return this.setItem(`stats_${gameId}`, stats);
    }

    /**
     * 獲取遊戲統計數據 - Get game statistics
     * @param {string} gameId - 遊戲ID
     * @returns {Object} 統計數據
     */
    getGameStats(gameId) {
        return this.getItem(`stats_${gameId}`, {
            plays: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            bestScore: 0,
            totalTime: 0,
            lastPlayed: null
        });
    }

    /**
     * 更新遊戲統計數據 - Update game statistics
     * @param {string} gameId - 遊戲ID
     * @param {Object} update - 更新數據
     * @returns {Object} 更新後的統計數據
     */
    updateGameStats(gameId, update) {
        const currentStats = this.getGameStats(gameId);
        const updatedStats = {
            ...currentStats,
            ...update,
            lastPlayed: new Date().toISOString()
        };
        
        // 確保數值類型正確
        if (update.plays !== undefined) updatedStats.plays = currentStats.plays + 1;
        if (update.wins !== undefined) updatedStats.wins = currentStats.wins + (update.wins ? 1 : 0);
        if (update.losses !== undefined) updatedStats.losses = currentStats.losses + (update.losses ? 1 : 0);
        if (update.draws !== undefined) updatedStats.draws = currentStats.draws + (update.draws ? 1 : 0);
        if (update.score !== undefined) {
            updatedStats.bestScore = Math.max(currentStats.bestScore, update.score);
        }
        if (update.time !== undefined) {
            updatedStats.totalTime = currentStats.totalTime + update.time;
        }
        
        this.setGameStats(gameId, updatedStats);
        return updatedStats;
    }

    /**
     * 設置遊戲設置 - Set game settings
     * @param {Object} settings - 設置對象
     * @returns {boolean} 是否成功
     */
    setGameSettings(settings) {
        return this.setItem('settings', settings);
    }

    /**
     * 獲取遊戲設置 - Get game settings
     * @returns {Object} 設置對象
     */
    getGameSettings() {
        return this.getItem('settings', {
            sound: true,
            music: true,
            volume: 0.7,
            difficulty: 'medium',
            language: 'zh-TW',
            controls: 'keyboard',
            theme: 'dark'
        });
    }

    /**
     * 更新遊戲設置 - Update game settings
     * @param {Object} update - 更新數據
     * @returns {Object} 更新後的設置
     */
    updateGameSettings(update) {
        const currentSettings = this.getGameSettings();
        const updatedSettings = { ...currentSettings, ...update };
        this.setGameSettings(updatedSettings);
        return updatedSettings;
    }

    /**
     * 保存遊戲進度 - Save game progress
     * @param {string} gameId - 遊戲ID
     * @param {Object} progress - 進度數據
     * @returns {boolean} 是否成功
     */
    saveGameProgress(gameId, progress) {
        return this.setItem(`progress_${gameId}`, {
            ...progress,
            savedAt: new Date().toISOString()
        });
    }

    /**
     * 加載遊戲進度 - Load game progress
     * @param {string} gameId - 遊戲ID
     * @returns {Object|null} 進度數據或null
     */
    loadGameProgress(gameId) {
        return this.getItem(`progress_${gameId}`);
    }

    /**
     * 刪除遊戲進度 - Delete game progress
     * @param {string} gameId - 遊戲ID
     * @returns {boolean} 是否成功
     */
    deleteGameProgress(gameId) {
        return this.removeItem(`progress_${gameId}`);
    }

    /**
     * 設置成就數據 - Set achievement data
     * @param {string} achievementId - 成就ID
     * @param {Object} data - 成就數據
     * @returns {boolean} 是否成功
     */
    setAchievement(achievementId, data) {
        return this.setItem(`achievement_${achievementId}`, data);
    }

    /**
     * 獲取成就數據 - Get achievement data
     * @param {string} achievementId - 成就ID
     * @returns {Object|null} 成就數據或null
     */
    getAchievement(achievementId) {
        return this.getItem(`achievement_${achievementId}`);
    }

    /**
     * 解鎖成就 - Unlock achievement
     * @param {string} achievementId - 成就ID
     * @param {string} name - 成就名稱
     * @param {string} description - 成就描述
     * @returns {Object} 成就數據
     */
    unlockAchievement(achievementId, name, description) {
        const achievement = {
            id: achievementId,
            name: name,
            description: description,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progress: 100
        };
        
        this.setAchievement(achievementId, achievement);
        return achievement;
    }

    /**
     * 更新成就進度 - Update achievement progress
     * @param {string} achievementId - 成就ID
     * @param {number} progress - 進度百分比 (0-100)
     * @param {string} name - 成就名稱
     * @param {string} description - 成就描述
     * @returns {Object} 成就數據
     */
    updateAchievementProgress(achievementId, progress, name = '', description = '') {
        const current = this.getAchievement(achievementId) || {
            id: achievementId,
            name: name,
            description: description,
            unlocked: false,
            unlockedAt: null,
            progress: 0
        };
        
        const updated = {
            ...current,
            progress: Math.min(100, Math.max(progress, current.progress))
        };
        
        if (updated.progress >= 100 && !updated.unlocked) {
            updated.unlocked = true;
            updated.unlockedAt = new Date().toISOString();
        }
        
        this.setAchievement(achievementId, updated);
        return updated;
    }

    /**
     * 獲取所有成就 - Get all achievements
     * @returns {Object} 所有成就
     */
    getAllAchievements() {
        const items = this.getAllItems();
        const achievements = {};
        
        Object.keys(items).forEach(key => {
            if (key.startsWith('achievement_')) {
                const achievementId = key.substring('achievement_'.length);
                achievements[achievementId] = items[key];
            }
        });
        
        return achievements;
    }

    /**
     * 導出所有數據 - Export all data
     * @returns {string} JSON格式的數據
     */
    exportData() {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: this.getAllItems()
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * 導入數據 - Import data
     * @param {string} jsonData - JSON格式的數據
     * @returns {boolean} 是否成功
     */
    importData(jsonData) {
        if (!this.supported) return false;
        
        try {
            const data = JSON.parse(jsonData);
            
            // 驗證數據格式
            if (!data || typeof data !== 'object' || !data.data) {
                throw new Error('Invalid data format');
            }
            
            // 清除現有數據
            this.clear(false);
            
            // 導入新數據
            Object.keys(data.data).forEach(key => {
                this.setItem(key, data.data[key]);
            });
            
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }

    /**
     * 獲取存儲使用情況 - Get storage usage
     * @returns {Object} 存儲使用情況
     */
    getStorageUsage() {
        if (!this.supported) return { used: 0, total: 0, percentage: 0 };
        
        try {
            let used = 0;
            const keys = this.getAllKeys(false);
            
            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    used += key.length + item.length;
                }
            });
            
            // 轉換為KB
            used = Math.round(used / 1024 * 100) / 100;
            
            // 估計總容量（通常為5MB）
            const total = 5120; // 5MB in KB
            const percentage = Math.round((used / total) * 100);
            
            return { used, total, percentage };
        } catch (e) {
            console.error('Failed to get storage usage:', e);
            return { used: 0, total: 0, percentage: 0 };
        }
    }
}

// 導出單例實例
const storageSystem = new StorageSystem();

// 導出常用函數
export function setItem(key, value) {
    return storageSystem.setItem(key, value);
}

export function getItem(key, defaultValue = null) {
    return storageSystem.getItem(key, defaultValue);
}

export function removeItem(key) {
    return storageSystem.removeItem(key);
}

export function clear(includeNonPrefixed = false) {
    return storageSystem.clear(includeNonPrefixed);
}

export function hasItem(key) {
    return storageSystem.hasItem(key);
}

export function setGameStats(gameId, stats) {
    return storageSystem.setGameStats(gameId, stats);
}

export function getGameStats(gameId) {
    return storageSystem.getGameStats(gameId);
}

export function updateGameStats(gameId, update) {
    return storageSystem.updateGameStats(gameId, update);
}

export function getGameSettings() {
    return storageSystem.getGameSettings();
}

export function updateGameSettings(update) {
    return storageSystem.updateGameSettings(update);
}

export function saveGameProgress(gameId, progress) {
    return storageSystem.saveGameProgress(gameId, progress);
}

export function loadGameProgress(gameId) {
    return storageSystem.loadGameProgress(gameId);
}

export function unlockAchievement(achievementId, name, description) {
    return storageSystem.unlockAchievement(achievementId, name, description);
}

export function getAllAchievements() {
    return storageSystem.getAllAchievements();
}

export function exportData() {
    return storageSystem.exportData();
}

export function importData(jsonData) {
    return storageSystem.importData(jsonData);
}

export function getStorageUsage() {
    return storageSystem.getStorageUsage();
}

export default storageSystem;