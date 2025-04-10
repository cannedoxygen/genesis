/**
 * AIKIRA: GENESIS PROTOCOL
 * NFT Minting Logic
 * 
 * This module handles all NFT-related functionality:
 * - Minting Genesis NFTs after game completion
 * - Generating metadata for NFTs
 * - Uploading metadata to IPFS
 * - Burning NFTs for $AIKIRA tokens
 * - Integration with Base Network
 */

import { ethers } from 'ethers';
import { NFTStorage, File } from 'nft.storage';
import GenesisNFTABI from '../contracts/abis/GenesisNFT.json';
import { isWalletConnected, getProvider, getSigner } from './wallet';

// Genesis NFT contract address - configure for Base Network
const GENESIS_NFT_ADDRESS = process.env.REACT_APP_GENESIS_NFT_ADDRESS || '0x0'; 

// NFT.Storage API key for IPFS uploads
const NFT_STORAGE_API_KEY = process.env.REACT_APP_NFT_STORAGE_API_KEY || '';

// Default token reward amount
const DEFAULT_TOKEN_REWARD = '5,000';

// NFT Storage client for IPFS uploads
let nftStorageClient = null;

/**
 * Initialize NFT Storage client for IPFS uploads
 * @returns {boolean} Initialization success
 */
export function initializeNFTStorage() {
  try {
    if (NFT_STORAGE_API_KEY) {
      nftStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });
      return true;
    }
    console.warn('NFT.Storage API key not found. IPFS uploads will be simulated.');
    return false;
  } catch (error) {
    console.error('Failed to initialize NFT.Storage:', error);
    return false;
  }
}

/**
 * Get Genesis NFT contract instance
 * @returns {ethers.Contract|null} Contract instance or null if not available
 */
export function getGenesisNFTContract() {
  try {
    const signer = getSigner();
    if (!signer) return null;
    
    return new ethers.Contract(GENESIS_NFT_ADDRESS, GenesisNFTABI, signer);
  } catch (error) {
    console.error('Error getting Genesis NFT contract:', error);
    return null;
  }
}

/**
 * Generate metadata for Genesis NFT
 * @param {Object} gameData Game completion data
 * @returns {Object} NFT metadata object
 */
export function generateNFTMetadata(gameData) {
  // Default completion date is today
  const completionDate = new Date().toISOString().split('T')[0];
  
  // Default BYTE warnings is 0
  const byteWarnings = gameData?.byteInteractions || 0;
  
  // Get wallet address if connected
  const walletAddress = gameData?.walletAddress || 'Not Connected';
  
  // Format wallet address for display
  const formattedWallet = walletAddress !== 'Not Connected' 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress;
  
  // Get token reward amount
  const tokenReward = gameData?.tokenReward || DEFAULT_TOKEN_REWARD;
  
  // Create metadata object
  return {
    name: `AIKIRA Genesis Protocol - DNA Fragment #${Date.now().toString().slice(-6)}`,
    description: "This NFT represents the successful recovery of the dinosaur DNA fragment from the Genesis Protocol. It can be burned to claim $AIKIRA tokens.",
    image: "ipfs://placeholder-image-hash", // Will be replaced with actual hash
    external_url: "https://aikira.io",
    attributes: [
      {
        trait_type: "Completion Date",
        value: completionDate
      },
      {
        trait_type: "Protocol Fragments",
        value: "5/5"
      },
      {
        trait_type: "BYTE Warnings",
        value: byteWarnings
      },
      {
        trait_type: "Wallet",
        value: formattedWallet
      },
      {
        trait_type: "Redeemable",
        value: `${tokenReward} $AIKIRA`
      }
    ]
  };
}

/**
 * Generate NFT image from game state
 * @param {Object} gameData Game completion data
 * @returns {Promise<Blob>} Image blob
 */
export async function generateNFTImage(gameData) {
  // In a real implementation, this would generate a custom image
  // For now, we'll just use a placeholder image from the assets
  
  try {
    // Create a canvas to render the NFT image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;
    
    // Load background image
    const bgImage = new Image();
    bgImage.src = '/assets/images/rewards/nft-background.jpg';
    
    // Wait for image to load
    await new Promise((resolve) => {
      bgImage.onload = resolve;
    });
    
    // Draw background
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    
    // Add DNA helix
    const dnaImage = new Image();
    dnaImage.src = '/assets/images/props/dna-helix.png';
    
    // Wait for DNA image to load
    await new Promise((resolve) => {
      dnaImage.onload = resolve;
    });
    
    // Draw DNA in center
    ctx.drawImage(
      dnaImage, 
      canvas.width / 2 - 150, 
      canvas.height / 2 - 250, 
      300, 
      500
    );
    
    // Add text elements
    ctx.fillStyle = '#00EAFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AIKIRA', canvas.width / 2, 100);
    ctx.fillText('GENESIS PROTOCOL', canvas.width / 2, 150);
    
    // Add completion info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`DNA FRAGMENT RECOVERED`, canvas.width / 2, canvas.height - 150);
    ctx.fillText(`REDEEMABLE FOR ${gameData?.tokenReward || DEFAULT_TOKEN_REWARD} $AIKIRA`, canvas.width / 2, canvas.height - 100);
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  } catch (error) {
    console.error('Error generating NFT image:', error);
    
    // Return a fallback image if generation fails
    const response = await fetch('/assets/images/rewards/default-nft.png');
    return await response.blob();
  }
}

/**
 * Upload NFT metadata and image to IPFS
 * @param {Object} metadata NFT metadata
 * @param {Blob} imageBlob Image blob
 * @returns {Promise<string|null>} IPFS URI or null if upload failed
 */
export async function uploadToIPFS(metadata, imageBlob) {
  try {
    // Check if NFT.Storage is initialized
    if (!nftStorageClient) {
      if (!initializeNFTStorage()) {
        console.warn('NFT.Storage not initialized. Using simulated IPFS hash.');
        // Return a fake IPFS URI for testing
        return `ipfs://QmSimulatedHash${Date.now()}/${metadata.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      }
    }
    
    // Upload image to IPFS
    const imageFile = new File(
      [imageBlob],
      'aikira-nft.png',
      { type: 'image/png' }
    );
    
    // Store image on IPFS
    const imageUpload = await nftStorageClient.store({
      name: metadata.name,
      description: metadata.description,
      image: imageFile
    });
    
    // Update metadata with image URI
    const updatedMetadata = {
      ...metadata,
      image: imageUpload.data.image.href
    };
    
    // Create metadata file
    const metadataBlob = new Blob(
      [JSON.stringify(updatedMetadata, null, 2)],
      { type: 'application/json' }
    );
    
    const metadataFile = new File(
      [metadataBlob],
      'metadata.json',
      { type: 'application/json' }
    );
    
    // Store metadata on IPFS
    const metadataUpload = await nftStorageClient.store({
      name: metadata.name,
      description: metadata.description,
      properties: metadataFile
    });
    
    // Return the IPFS URI
    return metadataUpload.url;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    
    // For development, return a fake IPFS URI
    if (process.env.NODE_ENV === 'development') {
      return `ipfs://QmDevelopmentHash${Date.now()}/${metadata.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    }
    
    return null;
  }
}

/**
 * Mint a Genesis NFT
 * @param {Object} gameData Game completion data
 * @returns {Promise<{success: boolean, tokenId: number|null, error: string|null}>} Mint result
 */
export async function mintGenesisNFT(gameData) {
  try {
    // Check if wallet is connected
    if (!isWalletConnected()) {
      return {
        success: false,
        tokenId: null,
        error: 'Wallet not connected'
      };
    }
    
    // Get contract instance
    const contract = getGenesisNFTContract();
    if (!contract) {
      return {
        success: false,
        tokenId: null,
        error: 'Failed to initialize contract'
      };
    }
    
    // Generate metadata
    const metadata = generateNFTMetadata(gameData);
    
    // Generate image
    const imageBlob = await generateNFTImage(gameData);
    
    // Upload to IPFS
    const tokenURI = await uploadToIPFS(metadata, imageBlob);
    if (!tokenURI) {
      return {
        success: false,
        tokenId: null,
        error: 'Failed to upload metadata'
      };
    }
    
    // Get wallet address
    const signer = getSigner();
    const address = await signer.getAddress();
    
    // Check for gas fee
    const balance = await signer.getBalance();
    const gasEstimate = await contract.estimateGas.safeMint(address, tokenURI);
    
    if (balance.lt(gasEstimate)) {
      return {
        success: false,
        tokenId: null,
        error: 'Insufficient ETH for gas fee'
      };
    }
    
    // Mint NFT
    const tx = await contract.safeMint(address, tokenURI);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Get token ID from event logs
    let tokenId = null;
    for (const event of receipt.events) {
      if (event.event === 'Transfer') {
        tokenId = event.args.tokenId.toNumber();
        break;
      }
    }
    
    // Trigger event for UI update
    if (window.gameEvents) {
      window.gameEvents.emit('nftMinted', {
        tokenId,
        tokenURI,
        metadata
      });
    }
    
    return {
      success: true,
      tokenId,
      txHash: receipt.transactionHash,
      error: null
    };
  } catch (error) {
    console.error('Error minting Genesis NFT:', error);
    
    return {
      success: false,
      tokenId: null,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Burn NFT to claim tokens
 * @param {number} tokenId NFT token ID
 * @returns {Promise<{success: boolean, txHash: string|null, error: string|null}>} Burn result
 */
export async function burnNFTForTokens(tokenId) {
  try {
    // Check if wallet is connected
    if (!isWalletConnected()) {
      return {
        success: false,
        txHash: null,
        error: 'Wallet not connected'
      };
    }
    
    // Get contract instance
    const contract = getGenesisNFTContract();
    if (!contract) {
      return {
        success: false,
        txHash: null,
        error: 'Failed to initialize contract'
      };
    }
    
    // Check token ownership
    const owner = await contract.ownerOf(tokenId);
    const signer = getSigner();
    const address = await signer.getAddress();
    
    if (owner.toLowerCase() !== address.toLowerCase()) {
      return {
        success: false,
        txHash: null,
        error: 'You do not own this token'
      };
    }
    
    // Check if token has already been burned
    const isBurned = await contract.tokenBurned(tokenId);
    if (isBurned) {
      return {
        success: false,
        txHash: null,
        error: 'Token has already been burned'
      };
    }
    
    // Burn token for $AIKIRA tokens
    const tx = await contract.burnForTokens(tokenId);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Trigger event for UI update
    if (window.gameEvents) {
      window.gameEvents.emit('nftBurned', {
        tokenId,
        txHash: receipt.transactionHash
      });
    }
    
    return {
      success: true,
      txHash: receipt.transactionHash,
      error: null
    };
  } catch (error) {
    console.error('Error burning NFT for tokens:', error);
    
    return {
      success: false,
      txHash: null,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Get user's Genesis NFTs
 * @returns {Promise<Array|null>} Array of NFTs or null if error
 */
export async function getUserNFTs() {
  try {
    // Check if wallet is connected
    if (!isWalletConnected()) {
      return null;
    }
    
    // Get contract instance
    const contract = getGenesisNFTContract();
    if (!contract) {
      return null;
    }
    
    // Get wallet address
    const signer = getSigner();
    const address = await signer.getAddress();
    
    // Get token count (balance)
    const balance = await contract.balanceOf(address);
    
    // No tokens found
    if (balance.isZero()) {
      return [];
    }
    
    // Get token IDs
    const nfts = [];
    for (let i = 0; i < balance.toNumber(); i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(address, i);
      const tokenURI = await contract.tokenURI(tokenId);
      
      // Fetch metadata from IPFS gateway
      let metadata = {};
      try {
        // Convert IPFS URI to gateway URL
        const gatewayURL = tokenURI.replace(
          'ipfs://', 
          'https://ipfs.io/ipfs/'
        );
        
        const response = await fetch(gatewayURL);
        metadata = await response.json();
      } catch (e) {
        console.warn('Failed to fetch NFT metadata:', e);
        metadata = {
          name: `Genesis NFT #${tokenId}`,
          description: 'Genesis Protocol NFT',
          image: '/assets/images/rewards/default-nft.png'
        };
      }
      
      nfts.push({
        tokenId: tokenId.toNumber(),
        tokenURI,
        metadata
      });
    }
    
    return nfts;
  } catch (error) {
    console.error('Error getting user NFTs:', error);
    return null;
  }
}

/**
 * Check Genesis completion status
 * @returns {Promise<boolean>} Whether user has completed Genesis Protocol
 */
export async function checkGenesisCompletion() {
  try {
    // Check if wallet is connected
    if (!isWalletConnected()) {
      return false;
    }
    
    // Get contract instance
    const contract = getGenesisNFTContract();
    if (!contract) {
      return false;
    }
    
    // Get wallet address
    const signer = getSigner();
    const address = await signer.getAddress();
    
    // Check completion status
    return await contract.userHasCompletedGame(address);
  } catch (error) {
    console.error('Error checking Genesis completion:', error);
    return false;
  }
}

// Initialize NFT Storage on module load
initializeNFTStorage();