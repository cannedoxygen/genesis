/**
 * AIKIRA: GENESIS PROTOCOL
 * Social Sharing
 * 
 * This module provides social media sharing functionality:
 * - Twitter/X sharing for NFT achievements
 * - Generic social media sharing
 * - Image generation for social sharing
 * - URL generation and tracking
 */

import { loadSettings } from './storage';

// Default sharing text
const DEFAULT_SHARE_TEXT = "Just finished Genesis Protocol. BYTE didn't bark once. Holding or burning this NFT for $AIKIRA? #AIKIRA #GenesisProtocol";

// Social media platform configurations
const PLATFORMS = {
  twitter: {
    name: 'Twitter',
    shareUrl: 'https://twitter.com/intent/tweet',
    params: {
      text: 'text',
      url: 'url',
      hashtags: 'hashtags',
      via: 'via'
    }
  },
  facebook: {
    name: 'Facebook',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    params: {
      u: 'url',
      quote: 'text'
    }
  },
  telegram: {
    name: 'Telegram',
    shareUrl: 'https://t.me/share/url',
    params: {
      url: 'url',
      text: 'text'
    }
  },
  reddit: {
    name: 'Reddit',
    shareUrl: 'https://www.reddit.com/submit',
    params: {
      url: 'url',
      title: 'text'
    }
  }
};

/**
 * Generate URL for social sharing
 * @param {string} platform Platform name ('twitter', 'facebook', etc.)
 * @param {Object} shareData Share data object
 * @param {string} shareData.text Text to share
 * @param {string} shareData.url URL to share
 * @param {string[]} shareData.hashtags Array of hashtags (without # symbol)
 * @param {string} shareData.via Via attribution
 * @returns {string|null} Share URL or null if platform not supported
 */
export function generateShareUrl(platform, shareData) {
  // Get platform config
  const platformConfig = PLATFORMS[platform.toLowerCase()];
  if (!platformConfig) return null;
  
  // Build share URL
  const url = new URL(platformConfig.shareUrl);
  const params = {};
  
  // Map share data to platform parameters
  for (const [paramKey, shareKey] of Object.entries(platformConfig.params)) {
    if (shareData[shareKey]) {
      let value = shareData[shareKey];
      
      // Handle arrays (e.g., hashtags for Twitter)
      if (Array.isArray(value)) {
        if (platform.toLowerCase() === 'twitter') {
          value = value.join(',');
        } else {
          value = value.join(' ');
        }
      }
      
      params[paramKey] = value;
    }
  }
  
  // Add parameters to URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
}

/**
 * Share to Twitter/X
 * @param {Object} shareData Share data object
 * @param {string} shareData.text Text to share (default is DEFAULT_SHARE_TEXT)
 * @param {string} shareData.url URL to share (optional)
 * @param {string[]} shareData.hashtags Array of hashtags without # (optional)
 * @param {string} shareData.via Via attribution (optional)
 * @returns {boolean} Success (true if share window opened)
 */
export function shareToTwitter(shareData = {}) {
  // Use default text if not provided
  const text = shareData.text || DEFAULT_SHARE_TEXT;
  
  // Use default hashtags if not provided
  const hashtags = shareData.hashtags || ['AIKIRA', 'GenesisProtocol'];
  
  // Build share data
  const data = {
    text,
    hashtags,
    ...shareData
  };
  
  // Generate share URL
  const shareUrl = generateShareUrl('twitter', data);
  if (!shareUrl) return false;
  
  // Open share window
  try {
    window.open(shareUrl, '_blank', 'width=550,height=420');
    return true;
  } catch (error) {
    console.error('Error opening Twitter share window:', error);
    return false;
  }
}

/**
 * Share to any supported platform
 * @param {string} platform Platform name ('twitter', 'facebook', etc.)
 * @param {Object} shareData Share data object
 * @returns {boolean} Success (true if share window opened)
 */
export function shareToSocial(platform, shareData = {}) {
  // Handle Twitter specifically
  if (platform.toLowerCase() === 'twitter') {
    return shareToTwitter(shareData);
  }
  
  // Check if platform is supported
  if (!PLATFORMS[platform.toLowerCase()]) {
    console.error(`Unsupported platform: ${platform}`);
    return false;
  }
  
  // Generate share URL
  const shareUrl = generateShareUrl(platform, shareData);
  if (!shareUrl) return false;
  
  // Open share window
  try {
    window.open(shareUrl, '_blank', 'width=550,height=420');
    return true;
  } catch (error) {
    console.error(`Error opening ${platform} share window:`, error);
    return false;
  }
}

/**
 * Generate sharing text for NFT achievement
 * @param {Object} nftData NFT data
 * @param {number} byteWarnings Number of BYTE warnings (for achievements)
 * @returns {string} Share text
 */
export function generateShareText(nftData = {}, byteWarnings = 0) {
  let shareText = DEFAULT_SHARE_TEXT;
  
  // Add dynamic elements based on NFT data
  if (nftData) {
    // Add token reward amount if available
    const rewardAttribute = nftData.attributes?.find(attr => attr.trait_type === 'Redeemable');
    if (rewardAttribute) {
      shareText = shareText.replace('$AIKIRA', rewardAttribute.value);
    }
    
    // Add perfect run achievement
    if (byteWarnings === 0) {
      shareText = "Perfect run! Completed Genesis Protocol without triggering BYTE. " + shareText;
    } else if (byteWarnings > 3) {
      shareText = "BYTE barked at me " + byteWarnings + " times, but I still completed Genesis Protocol! " + shareText;
    }
  }
  
  return shareText;
}

/**
 * Generate a sharing image from NFT data
 * @param {Object} nftData NFT data and image
 * @returns {Promise<Blob|null>} Image blob or null if error
 */
export async function generateShareImage(nftData) {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (Twitter card size)
    canvas.width = 1200;
    canvas.height = 628;
    
    // Draw background
    ctx.fillStyle = '#0a1525';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load NFT image if available
    if (nftData.image) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Convert IPFS URL to gateway URL if needed
        const imageUrl = nftData.image.startsWith('ipfs://')
          ? nftData.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
          : nftData.image;
        
        img.src = imageUrl;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          
          // Timeout after 5 seconds
          setTimeout(reject, 5000);
        });
        
        // Draw image centered in canvas
        const size = Math.min(canvas.width, canvas.height) * 0.6;
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;
        
        ctx.drawImage(img, x, y, size, size);
      } catch (imageError) {
        console.warn('Error loading NFT image, using fallback:', imageError);
        
        // Draw fallback DNA helix
        ctx.fillStyle = '#00eaff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw AIKIRA logo text
    ctx.fillStyle = '#00eaff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AIKIRA', canvas.width / 2, 120);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Arial';
    ctx.fillText('GENESIS PROTOCOL', canvas.width / 2, 170);
    
    // Draw NFT details
    if (nftData.attributes) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      
      // Draw redeemable value
      const rewardAttribute = nftData.attributes.find(attr => attr.trait_type === 'Redeemable');
      if (rewardAttribute) {
        ctx.fillText(`REDEEMABLE FOR ${rewardAttribute.value}`, canvas.width / 2, canvas.height - 100);
      }
      
      // Draw completion date
      const dateAttribute = nftData.attributes.find(attr => attr.trait_type === 'Completion Date');
      if (dateAttribute) {
        ctx.fillText(`COMPLETED: ${dateAttribute.value}`, canvas.width / 2, canvas.height - 60);
      }
    }
    
    // Add hashtags
    ctx.fillStyle = '#00eaff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('#AIKIRA #GenesisProtocol', canvas.width / 2, canvas.height - 20);
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  } catch (error) {
    console.error('Error generating share image:', error);
    return null;
  }
}

/**
 * Copy share text to clipboard
 * @param {string} text Text to copy
 * @returns {Promise<boolean>} Success
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    
    // Fallback method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackError) {
      console.error('Clipboard fallback error:', fallbackError);
      return false;
    }
  }
}

/**
 * Get share button configuration
 * @returns {Array} Array of platform configs with enabled status
 */
export function getShareButtons() {
  // Load settings to check enabled platforms
  const settings = loadSettings() || {};
  const enabledPlatforms = settings.enabledSocialPlatforms || ['twitter'];
  
  // Build configuration for all platforms
  return Object.entries(PLATFORMS).map(([key, config]) => ({
    id: key,
    name: config.name,
    enabled: enabledPlatforms.includes(key)
  }));
}

/**
 * Check if the current browser supports native sharing
 * @returns {boolean} True if Web Share API is supported
 */
export function hasNativeSharing() {
  return navigator.share !== undefined;
}

/**
 * Use native browser sharing if available
 * @param {Object} shareData Share data object
 * @param {string} shareData.title Title to share
 * @param {string} shareData.text Text to share
 * @param {string} shareData.url URL to share
 * @returns {Promise<boolean>} Success
 */
export async function useNativeSharing(shareData) {
  if (!hasNativeSharing()) return false;
  
  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    console.error('Error using native sharing:', error);
    return false;
  }
}

/**
 * Share NFT achievement
 * @param {Object} nftData NFT data
 * @param {string} platform Platform to share to (optional, uses native if available)
 * @returns {Promise<boolean>} Success
 */
export async function shareNFTAchievement(nftData, platform = null) {
  // Generate share text
  const text = generateShareText(nftData, nftData.attributes?.find(attr => 
    attr.trait_type === 'BYTE Warnings'
  )?.value || 0);
  
  // Set up share data
  const shareData = {
    title: 'AIKIRA: GENESIS PROTOCOL',
    text,
    url: window.location.href,
    hashtags: ['AIKIRA', 'GenesisProtocol']
  };
  
  // Try native sharing first if no platform specified
  if (!platform && hasNativeSharing()) {
    const success = await useNativeSharing({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url
    });
    
    if (success) return true;
  }
  
  // Fall back to specified platform or default to Twitter
  return shareToSocial(platform || 'twitter', shareData);
}

// Export default sharing functions
export default {
  shareToTwitter,
  shareToSocial,
  shareNFTAchievement
};