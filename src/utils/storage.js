/**
 * AIKIRA: GENESIS PROTOCOL
 * Storage Helpers
 * 
 * This module provides utilities for storing and retrieving game data:
 * - Saving/loading game progress
 * - Managing local settings
 * - Caching assets and game state
 */

// Constants
const GAME_PROGRESS_KEY = 'aikira-progress';
const SETTINGS_KEY = 'aikira-settings';
const ASSETS_CACHE_KEY = 'aikira-assets-cache';
const SESSION_DATA_KEY = 'aikira-session';

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save game progress to localStorage
 * @param {Object} gameState Current game state
 * @returns {boolean} Success
 */
export function saveProgress(gameState) {
  if (!isStorageAvailable() || !gameState) return false;
  
  try {
    localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify({
      currentChapter: gameState.currentChapter,
      cluesCollected: gameState.cluesCollected,
      puzzlesSolved: gameState.puzzlesSolved,
      byteInteractions: gameState.byteInteractions,
      timestamp: Date.now()
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving game progress:', error);
    return false;
  }
}

/**
 * Load game progress from localStorage
 * @returns {Object|null} Saved game state or null if not found/error
 */
export function loadProgress() {
  if (!isStorageAvailable()) return null;
  
  try {
    const savedState = localStorage.getItem(GAME_PROGRESS_KEY);
    if (!savedState) return null;
    
    return JSON.parse(savedState);
  } catch (error) {
    console.error('Error loading game progress:', error);
    return null;
  }
}

/**
 * Reset game progress
 * @returns {boolean} Success
 */
export function resetProgress() {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(GAME_PROGRESS_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting game progress:', error);
    return false;
  }
}

/**
 * Save game settings
 * @param {Object} settings Settings object
 * @returns {boolean} Success
 */
export function saveSettings(settings) {
  if (!isStorageAvailable() || !settings) return false;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Load game settings
 * @returns {Object|null} Settings object or null if not found/error
 */
export function loadSettings() {
  if (!isStorageAvailable()) return null;
  
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (!savedSettings) {
      // Return default settings if not found
      return {
        audioEnabled: true,
        musicVolume: 0.7,
        sfxVolume: 1.0,
        highQualityGraphics: true,
        showFPS: false,
        language: 'en',
        showTutorials: true
      };
    }
    
    return JSON.parse(savedSettings);
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}

/**
 * Update a single setting
 * @param {string} key Setting key
 * @param {any} value Setting value
 * @returns {boolean} Success
 */
export function updateSetting(key, value) {
  if (!isStorageAvailable() || !key) return false;
  
  try {
    const settings = loadSettings() || {};
    settings[key] = value;
    return saveSettings(settings);
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
}

/**
 * Cache asset URL with timestamp
 * @param {string} assetType Type of asset (e.g., 'image', 'audio')
 * @param {string} assetKey Unique key for the asset
 * @param {string} url Asset URL
 * @returns {boolean} Success
 */
export function cacheAssetUrl(assetType, assetKey, url) {
  if (!isStorageAvailable() || !assetType || !assetKey || !url) return false;
  
  try {
    const assetCache = JSON.parse(localStorage.getItem(ASSETS_CACHE_KEY) || '{}');
    
    if (!assetCache[assetType]) {
      assetCache[assetType] = {};
    }
    
    assetCache[assetType][assetKey] = {
      url,
      timestamp: Date.now()
    };
    
    localStorage.setItem(ASSETS_CACHE_KEY, JSON.stringify(assetCache));
    return true;
  } catch (error) {
    console.error('Error caching asset URL:', error);
    return false;
  }
}

/**
 * Get cached asset URL
 * @param {string} assetType Type of asset
 * @param {string} assetKey Unique key for the asset
 * @returns {string|null} Cached URL or null if not found/error
 */
export function getCachedAssetUrl(assetType, assetKey) {
  if (!isStorageAvailable() || !assetType || !assetKey) return null;
  
  try {
    const assetCache = JSON.parse(localStorage.getItem(ASSETS_CACHE_KEY) || '{}');
    
    if (!assetCache[assetType] || !assetCache[assetType][assetKey]) {
      return null;
    }
    
    return assetCache[assetType][assetKey].url;
  } catch (error) {
    console.error('Error getting cached asset URL:', error);
    return null;
  }
}

/**
 * Clear asset cache
 * @param {string} [assetType] Optional asset type to clear (clears all if not specified)
 * @returns {boolean} Success
 */
export function clearAssetCache(assetType) {
  if (!isStorageAvailable()) return false;
  
  try {
    if (assetType) {
      // Clear specific asset type
      const assetCache = JSON.parse(localStorage.getItem(ASSETS_CACHE_KEY) || '{}');
      
      if (assetCache[assetType]) {
        delete assetCache[assetType];
        localStorage.setItem(ASSETS_CACHE_KEY, JSON.stringify(assetCache));
      }
    } else {
      // Clear all asset cache
      localStorage.removeItem(ASSETS_CACHE_KEY);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing asset cache:', error);
    return false;
  }
}

/**
 * Save session data (temporary, not persisted between sessions)
 * @param {Object} data Session data
 * @returns {boolean} Success
 */
export function saveSessionData(data) {
  if (!isStorageAvailable() || !data) return false;
  
  try {
    sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving session data:', error);
    return false;
  }
}

/**
 * Load session data
 * @returns {Object|null} Session data or null if not found/error
 */
export function loadSessionData() {
  if (!isStorageAvailable()) return null;
  
  try {
    const sessionData = sessionStorage.getItem(SESSION_DATA_KEY);
    if (!sessionData) return null;
    
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error loading session data:', error);
    return null;
  }
}

/**
 * Clear session data
 * @returns {boolean} Success
 */
export function clearSessionData() {
  if (!isStorageAvailable()) return false;
  
  try {
    sessionStorage.removeItem(SESSION_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing session data:', error);
    return false;
  }
}

/**
 * Get total storage usage in bytes
 * @returns {number} Storage usage in bytes
 */
export function getStorageUsage() {
  if (!isStorageAvailable()) return 0;
  
  try {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      // Calculate size in bytes (2 bytes per character)
      totalSize += (key.length + value.length) * 2;
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error getting storage usage:', error);
    return 0;
  }
}

/**
 * Check if storage is nearly full (>90% usage)
 * @returns {boolean} True if storage is nearly full
 */
export function isStorageNearlyFull() {
  if (!isStorageAvailable()) return true;
  
  try {
    const usedSpace = getStorageUsage();
    const totalSpace = 5 * 1024 * 1024; // Estimate 5MB limit (varies by browser)
    
    return usedSpace > totalSpace * 0.9;
  } catch (error) {
    console.error('Error checking storage usage:', error);
    return true; // Assume full on error
  }
}

// Export default save/load functions for compatibility
export default {
  saveProgress,
  loadProgress,
  saveSettings,
  loadSettings
};