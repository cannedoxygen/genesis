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
// import { NFTStorage, File } from 'nft.storage';
// import GenesisNFTABI from '../contracts/abis/GenesisNFT.json';
import { isWalletConnected, getProvider, getSigner } from './wallet';

// Genesis NFT contract address - configure for Base Network
const GENESIS_NFT_ADDRESS = process.env.REACT_APP_GENESIS_NFT_ADDRESS || '0x0'; 

// Define ABI directly in the file instead
const GenesisNFTABI = [
  // Read functions
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function userHasCompletedGame(address user) view returns (bool)",
  "function tokenBurned(uint256 tokenId) view returns (bool)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  // Write functions
  "function safeMint(address to, string memory uri) returns (uint256)",
  "function burnForTokens(uint256 tokenId)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

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
    console.log('Mock NFT Storage initialization');
    return true;
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
    
    return new ethers.Contract(
      GENESIS_NFT_ADDRESS,
      GenesisNFTABI,
      signer
    );
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
  // Return a mock blob
  return new Blob(['mock image data'], { type: 'image/png' });
}

/**
 * Upload NFT metadata and image to IPFS
 * @param {Object} metadata NFT metadata
 * @param {Blob} imageBlob Image blob
 * @returns {Promise<string|null>} IPFS URI or null if upload failed
 */
export async function uploadToIPFS(metadata, imageBlob) {
  try {
    console.log('Mock upload to IPFS');
    // Return a fake IPFS URI for testing
    return `ipfs://QmSimulatedHash${Date.now()}/${metadata.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
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
    console.log('Mock minting NFT with data:', gameData);
    
    // Generate a mock success response
    const mockTokenId = Math.floor(Math.random() * 1000000);
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 42)}`;
    
    // Trigger event for UI update
    if (window.gameEvents) {
      window.gameEvents.emit('nftMinted', {
        tokenId: mockTokenId,
        tokenURI: 'ipfs://mock-uri',
        metadata: generateNFTMetadata(gameData)
      });
    }
    
    return {
      success: true,
      tokenId: mockTokenId,
      txHash: mockTxHash,
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
    console.log('Mock burning NFT with ID:', tokenId);
    
    // Generate a mock success response
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 42)}`;
    
    // Trigger event for UI update
    if (window.gameEvents) {
      window.gameEvents.emit('nftBurned', {
        tokenId,
        txHash: mockTxHash
      });
    }
    
    return {
      success: true,
      txHash: mockTxHash,
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
    console.log('Mock getting user NFTs');
    
    // Return a mock NFT
    return [{
      tokenId: 12345,
      tokenURI: 'ipfs://mock-uri',
      metadata: {
        name: 'AIKIRA Genesis Protocol - DNA Fragment #123456',
        description: 'This NFT represents the successful recovery of the dinosaur DNA fragment.',
        image: '/assets/images/rewards/default-nft.png',
        attributes: [
          { trait_type: 'Completion Date', value: new Date().toISOString().split('T')[0] },
          { trait_type: 'Protocol Fragments', value: '5/5' },
          { trait_type: 'BYTE Warnings', value: 0 },
          { trait_type: 'Redeemable', value: '5,000 $AIKIRA' }
        ]
      }
    }];
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
    console.log('Mock checking Genesis completion');
    return true;
  } catch (error) {
    console.error('Error checking Genesis completion:', error);
    return false;
  }
}

// Initialize NFT Storage on module load
initializeNFTStorage();