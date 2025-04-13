/**
 * AIKIRA: GENESIS PROTOCOL
 * Base Network Integration
 * 
 * This module provides Base Network-specific functionality:
 * - Setting up Base Network configuration
 * - Providing Base Network contract interfaces
 * - Handling $AIKIRA token interactions
 * - Managing network-specific operations
 */

import { ethers } from 'ethers';
// Use dynamic import to avoid direct dependency issues
let AikiraTokenABI;
try {
  AikiraTokenABI = require('../contracts/abis/AikiraToken.json');
} catch (e) {
  // Fallback if ABI file not found
  console.warn('AikiraToken ABI not found, using placeholder');
  AikiraTokenABI = [];
}

import { 
  connectWallet, 
  disconnectWallet, 
  getProvider, 
  getSigner, 
  isWalletConnected, 
  switchToBase,
  getConnectedAddress,
  isBaseNetwork,
  getConnectedChainId
} from './wallet';

// Export wallet functions for convenience
export {
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  switchToBase,
  getConnectedAddress,
  isBaseNetwork,
  getConnectedChainId
};

// Base Network constants
export const BASE_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84531;

// Network selection based on environment
export const CHAIN_ID = process.env.REACT_APP_USE_TESTNET === 'true'
  ? BASE_TESTNET_CHAIN_ID
  : BASE_CHAIN_ID;

// Contract addresses - set from environment variables or defaults
export const AIKIRA_TOKEN_ADDRESS = process.env.REACT_APP_AIKIRA_TOKEN_ADDRESS || '0xa884C16a93792D1E0156fF4C8A3B2C59b8d04C9A';
export const GENESIS_NFT_ADDRESS = process.env.REACT_APP_GENESIS_NFT_ADDRESS || '0x0';

// Default reward amount
export const DEFAULT_TOKEN_REWARD_AMOUNT = ethers.utils.parseEther('5000');

// RPC URLs for fallback providers
const RPC_URLS = {
  [BASE_CHAIN_ID]: 'https://mainnet.base.org',
  [BASE_TESTNET_CHAIN_ID]: 'https://goerli.base.org'
};

/**
 * Initialize blockchain connection
 * @returns {Promise<boolean>} Success
 */
export function initializeBlockchain() {
  return initializeBaseNetwork();
}

/**
 * Initialize Base Network connection
 * @returns {Promise<boolean>} Success
 */
export async function initializeBaseNetwork() {
  try {
    // Check if wallet is connected
    if (!isWalletConnected()) {
      console.log('Wallet not connected. Initializing with read-only access.');
      
      // Create fallback provider for read-only access
      const fallbackProvider = new ethers.providers.JsonRpcProvider(
        RPC_URLS[CHAIN_ID]
      );
      
      return true;
    }
    
    // Check if on Base Network
    const chainId = getConnectedChainId();
    if (!isBaseNetwork(chainId)) {
      console.warn('Not connected to Base Network. Will prompt to switch.');
      return await switchToBase();
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing Base Network:', error);
    return false;
  }
}

/**
 * Get Base Network explorer URL for address/transaction
 * @param {string} hash Address or transaction hash
 * @param {string} type Type of URL ('address' or 'tx')
 * @returns {string} Explorer URL
 */
export function getExplorerUrl(hash, type = 'address') {
  const baseUrl = CHAIN_ID === BASE_TESTNET_CHAIN_ID
    ? 'https://goerli.basescan.org'
    : 'https://basescan.org';
  
  return `${baseUrl}/${type}/${hash}`;
}

/**
 * Get Aikira Token contract
 * @returns {ethers.Contract|null} Contract or null if not available
 */
export function getAikiraTokenContract() {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    // Use signer if available, otherwise use provider for read-only
    const signerOrProvider = getSigner() || provider;
    
    return new ethers.Contract(
      AIKIRA_TOKEN_ADDRESS,
      AikiraTokenABI,
      signerOrProvider
    );
  } catch (error) {
    console.error('Error getting Aikira Token contract:', error);
    return null;
  }
}

/**
 * Get Aikira token balance
 * @param {string} address Address to check (defaults to connected wallet)
 * @returns {Promise<string|null>} Balance as formatted string or null if error
 */
export async function getAikiraBalance(address) {
  try {
    const contract = getAikiraTokenContract();
    if (!contract) return null;
    
    // Use connected wallet address if none provided
    const targetAddress = address || getConnectedAddress();
    if (!targetAddress) return null;
    
    // Get balance
    const balance = await contract.balanceOf(targetAddress);
    
    // Format with 18 decimals
    return ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting Aikira token balance:', error);
    return null;
  }
}

/**
 * Check if Base Network is supported in current environment
 * @returns {boolean} True if Base Network is supported
 */
export function isBaseSupported() {
  // Check if window.ethereum exists (MetaMask or similar)
  if (!window.ethereum) return false;
  
  // Check for Base support
  const chainIdHex = `0x${CHAIN_ID.toString(16)}`;
  return window.ethereum.chainId === chainIdHex || 
         window.ethereum._metamask?.isUnlocked?.() ||
         true; // Assume support if we can't determine
}

/**
 * Get formatted Aikira token display string
 * @param {string|number} amount Amount to format
 * @returns {string} Formatted string with $AIKIRA
 */
export function formatAikiraAmount(amount) {
  if (!amount) return '0 $AIKIRA';
  
  let formattedAmount;
  
  // Handle various input formats
  if (typeof amount === 'string' && amount.includes('$AIKIRA')) {
    return amount; // Already formatted
  } else if (typeof amount === 'string' && amount.match(/^\d+,\d+$/)) {
    return `${amount} $AIKIRA`; // Has commas, e.g. "5,000"
  } else if (typeof amount === 'string' || typeof amount === 'number') {
    // Format number with commas
    formattedAmount = Number(amount).toLocaleString();
    return `${formattedAmount} $AIKIRA`;
  }
  
  // Fallback
  return `${amount} $AIKIRA`;
}

/**
 * Create a read-only provider for Base Network
 * @returns {ethers.providers.Provider} Provider
 */
export function createReadOnlyProvider() {
  return new ethers.providers.JsonRpcProvider(RPC_URLS[CHAIN_ID]);
}

/**
 * Check if an address has claimed a Genesis NFT
 * @param {string} address Address to check
 * @returns {Promise<boolean>} True if user has a Genesis NFT
 */
export async function hasClaimedGenesisNFT(address) {
  try {
    // Import GenesisNFT contract ABI and functions dynamically
    // to avoid circular dependencies
    const { getGenesisNFTContract } = await import('./nft');
    
    const contract = getGenesisNFTContract();
    if (!contract) return false;
    
    // Use connected wallet address if none provided
    const targetAddress = address || getConnectedAddress();
    if (!targetAddress) return false;
    
    // Check if user has completed the game
    return await contract.userHasCompletedGame(targetAddress);
  } catch (error) {
    console.error('Error checking Genesis NFT claim status:', error);
    return false;
  }
}

/**
 * Get Base Network status information
 * @returns {Promise<Object>} Network status
 */
export async function getBaseNetworkStatus() {
  try {
    let provider;
    
    if (isWalletConnected()) {
      provider = getProvider();
    } else {
      provider = createReadOnlyProvider();
    }
    
    if (!provider) {
      return {
        connected: false,
        chainId: null,
        isBase: false,
        blockNumber: null,
        gasPrice: null,
        networkName: 'Not Connected'
      };
    }
    
    // Get network and block info
    const [network, blockNumber, gasPrice] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getGasPrice()
    ]);
    
    // Format gas price in Gwei
    const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
    
    // Determine network name
    let networkName;
    switch (network.chainId) {
      case 1:
        networkName = 'Ethereum Mainnet';
        break;
      case BASE_CHAIN_ID:
        networkName = 'Base Mainnet';
        break;
      case BASE_TESTNET_CHAIN_ID:
        networkName = 'Base Goerli Testnet';
        break;
      default:
        networkName = network.name || 'Unknown Network';
    }
    
    return {
      connected: true,
      chainId: network.chainId,
      isBase: isBaseNetwork(network.chainId),
      blockNumber,
      gasPrice: gasPriceGwei,
      networkName
    };
  } catch (error) {
    console.error('Error getting Base Network status:', error);
    
    return {
      connected: false,
      chainId: null,
      isBase: false,
      blockNumber: null,
      gasPrice: null,
      networkName: 'Error'
    };
  }
}

// Placeholder functions to fix import errors in NFTRewardScene.js
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
  const tokenReward = gameData?.tokenReward || '5,000';
  
  // Create metadata object
  return {
    name: `AIKIRA Genesis Protocol - DNA Fragment #${Date.now().toString().slice(-6)}`,
    description: "This NFT represents the successful recovery of the dinosaur DNA fragment from the Genesis Protocol. It can be burned to claim $AIKIRA tokens.",
    image: "/assets/images/rewards/default-nft.png",
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

export async function uploadToIPFS(metadata, imageBlob) {
  console.log('Simulating IPFS upload...');
  return `ipfs://QmSimulatedHash${Date.now()}/${metadata.name.replace(/\s+/g, '-').toLowerCase()}.json`;
}

export async function mintGenesisNFT(gameData) {
  console.log('Simulating NFT minting...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    tokenId: Math.floor(Math.random() * 1000),
    txHash: '0x' + Math.random().toString(16).substring(2, 42),
    error: null
  };
}

export async function burnNFTForTokens(tokenId) {
  console.log(`Simulating burning NFT #${tokenId} for tokens...`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    txHash: '0x' + Math.random().toString(16).substring(2, 42),
    error: null
  };
}

// Initialize Base Network on module load
initializeBaseNetwork();