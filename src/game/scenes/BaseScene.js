/**
 * AIKIRA: GENESIS PROTOCOL
 * Base Network Integration
 * 
 * This file handles all Base Network functionality:
 * - Wallet connection via RainbowKit
 * - Contract interactions
 * - NFT minting and claiming
 * - Transaction signing and state management
 */

import { ethers } from 'ethers';
import GenesisNFTABI from './abis/GenesisNFT.json';
import AikiraTokenABI from './abis/AikiraToken.json';

// Contract addresses - will be set after deployment
const GENESIS_NFT_ADDRESS = '0x...'; // Replace after deployment
const AIKIRA_TOKEN_ADDRESS = '0x...'; // Replace after deployment

// Base Network configuration
const BASE_CHAIN_ID = 8453; // Base Mainnet
const BASE_TESTNET_CHAIN_ID = 84531; // Base Goerli Testnet

// Network configuration
const networks = {
  [BASE_CHAIN_ID]: {
    name: 'Base',
    currency: 'ETH',
    explorer: 'https://basescan.org',
    rpc: 'https://mainnet.base.org'
  },
  [BASE_TESTNET_CHAIN_ID]: {
    name: 'Base Goerli',
    currency: 'ETH',
    explorer: 'https://goerli.basescan.org',
    rpc: 'https://goerli.base.org'
  }
};

// State management
let provider = null;
let signer = null;
let genesisNFTContract = null;
let aikiraTokenContract = null;
let connectedAddress = null;
let connectedChainId = null;
let walletConnected = false;

/**
 * Initialize blockchain connection
 * @returns {Promise<boolean>} Connection success
 */
export async function initializeBlockchain() {
  try {
    // Check if ethereum is available (MetaMask or other wallet)
    if (window.ethereum) {
      // Create provider
      provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return true;
    } else {
      console.log('Ethereum wallet not detected');
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize blockchain:', error);
    return false;
  }
}

/**
 * Connect wallet
 * @returns {Promise<string|null>} Connected address or null if failed
 */
export async function connectWallet() {
  try {
    if (!provider) {
      const initialized = await initializeBlockchain();
      if (!initialized) return null;
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length > 0) {
      connectedAddress = accounts[0];
      
      // Get signer
      signer = provider.getSigner();
      
      // Get connected chain ID
      const { chainId } = await provider.getNetwork();
      connectedChainId = chainId;
      
      // Check if connected to Base
      if (!isBaseNetwork(chainId)) {
        console.warn('Not connected to Base Network. Please switch networks.');
      }
      
      // Initialize contracts
      await initializeContracts();
      
      walletConnected = true;
      
      return connectedAddress;
    }
    
    return null;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
}

/**
 * Check if connected to Base Network
 * @param {number} chainId Chain ID to check
 * @returns {boolean} True if connected to Base Network
 */
function isBaseNetwork(chainId) {
  return chainId === BASE_CHAIN_ID || chainId === BASE_TESTNET_CHAIN_ID;
}

/**
 * Initialize contract instances
 */
async function initializeContracts() {
  if (!signer) return;
  
  // Initialize Genesis NFT contract
  genesisNFTContract = new ethers.Contract(
    GENESIS_NFT_ADDRESS,
    GenesisNFTABI,
    signer
  );
  
  // Initialize Aikira Token contract
  aikiraTokenContract = new ethers.Contract(
    AIKIRA_TOKEN_ADDRESS,
    AikiraTokenABI,
    signer
  );
}

/**
 * Handle account changes
 * @param {string[]} accounts New accounts
 */
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    connectedAddress = null;
    signer = null;
    walletConnected = false;
    
    // Notify game
    if (window.gameEvents) {
      window.gameEvents.emit('walletDisconnected');
    }
  } else if (accounts[0] !== connectedAddress) {
    // Account changed
    connectedAddress = accounts[0];
    
    if (provider) {
      signer = provider.getSigner();
      initializeContracts();
    }
    
    // Notify game
    if (window.gameEvents) {
      window.gameEvents.emit('walletChanged', connectedAddress);
    }
  }
}

/**
 * Handle chain changes
 * @param {string} chainIdHex New chain ID (hex string)
 */
function handleChainChanged(chainIdHex) {
  // Parse chain ID as integer
  const chainId = parseInt(chainIdHex, 16);
  
  connectedChainId = chainId;
  
  // Check if connected to Base
  const onBase = isBaseNetwork(chainId);
  
  // Notify game
  if (window.gameEvents) {
    window.gameEvents.emit('networkChanged', {
      chainId,
      isBase: onBase,
      networkName: onBase ? networks[chainId].name : 'Unknown Network'
    });
  }
  
  // Reload page to reset state
  window.location.reload();
}

/**
 * Request switch to Base Network
 * @returns {Promise<boolean>} Success
 */
export async function switchToBase() {
  if (!window.ethereum) return false;
  
  try {
    // Try to switch to Base
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }]
    });
    
    return true;
  } catch (error) {
    // If Base is not added to the wallet, try to add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: 'Base',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
          }]
        });
        
        return true;
      } catch (addError) {
        console.error('Error adding Base Network:', addError);
        return false;
      }
    }
    
    console.error('Error switching to Base Network:', error);
    return false;
  }
}

/**
 * Mint Genesis NFT
 * @param {string} tokenURI IPFS URI for NFT metadata
 * @returns {Promise<{success: boolean, tokenId: number|null, error: string|null}>} Mint result
 */
export async function mintGenesisNFT(tokenURI) {
  if (!walletConnected || !genesisNFTContract) {
    return {
      success: false,
      tokenId: null,
      error: 'Wallet not connected or contract not initialized'
    };
  }
  
  try {
    // Check if user already has an NFT
    const hasCompleted = await genesisNFTContract.userHasCompletedGame(connectedAddress);
    
    if (hasCompleted) {
      return {
        success: false,
        tokenId: null,
        error: 'User has already claimed a Genesis NFT'
      };
    }
    
    // Mint NFT
    const tx = await genesisNFTContract.safeMint(connectedAddress, tokenURI);
    
    // Wait for transaction
    const receipt = await tx.wait();
    
    // Find token ID from events
    const event = receipt.events.find(e => e.event === 'Transfer');
    const tokenId = event ? event.args.tokenId.toNumber() : null;
    
    return {
      success: true,
      tokenId,
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
 * Burn Genesis NFT for $AIKIRA tokens
 * @param {number} tokenId Token ID to burn
 * @returns {Promise<{success: boolean, error: string|null}>} Burn result
 */
export async function burnNFTForTokens(tokenId) {
  if (!walletConnected || !genesisNFTContract) {
    return {
      success: false,
      error: 'Wallet not connected or contract not initialized'
    };
  }
  
  try {
    // Check if user owns the token
    const owner = await genesisNFTContract.ownerOf(tokenId);
    
    if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
      return {
        success: false,
        error: 'You do not own this token'
      };
    }
    
    // Burn NFT
    const tx = await genesisNFTContract.burnForTokens(tokenId);
    
    // Wait for transaction
    await tx.wait();
    
    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error('Error burning NFT for tokens:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Get user's Genesis NFT token IDs
 * @returns {Promise<number[]|null>} Array of token IDs or null if error
 */
export async function getUserNFTs() {
  if (!walletConnected || !genesisNFTContract) return null;
  
  try {
    // Get total token count
    const totalSupply = await genesisNFTContract.getTotalMinted();
    
    // Check each token
    const tokenIds = [];
    
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await genesisNFTContract.ownerOf(i);
        
        if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
          tokenIds.push(i);
        }
      } catch (e) {
        // Token may have been burned
        continue;
      }
    }
    
    return tokenIds;
  } catch (error) {
    console.error('Error getting user NFTs:', error);
    return null;
  }
}

/**
 * Get $AIKIRA token balance
 * @returns {Promise<string|null>} Token balance as string or null if error
 */
export async function getAikiraBalance() {
  if (!walletConnected || !aikiraTokenContract) return null;
  
  try {
    const balance = await aikiraTokenContract.balanceOf(connectedAddress);
    return ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals
  } catch (error) {
    console.error('Error getting $AIKIRA balance:', error);
    return null;
  }
}

/**
 * Get wallet connection status
 * @returns {boolean} True if wallet is connected
 */
export function isWalletConnected() {
  return walletConnected;
}

/**
 * Get connected address
 * @returns {string|null} Connected address or null if not connected
 */
export function getConnectedAddress() {
  return connectedAddress;
}

/**
 * Generate metadata for Genesis NFT
 * @param {object} gameData Game data including completion time, score, etc.
 * @returns {object} NFT metadata
 */
export function generateNFTMetadata(gameData) {
  return {
    name: `AIKIRA Genesis Protocol - DNA Fragment #${Date.now().toString().slice(-6)}`,
    description: "This NFT represents the successful recovery of the dinosaur DNA fragment from the Genesis Protocol. It can be burned to claim $AIKIRA tokens.",
    image: `ipfs://...`, // Will be replaced with actual IPFS hash after upload
    external_url: "https://aikira.io",
    attributes: [
      {
        trait_type: "Completion Date",
        value: new Date().toISOString().split('T')[0]
      },
      {
        trait_type: "Protocol Fragments",
        value: "5/5"
      },
      {
        trait_type: "BYTE Warnings",
        value: gameData.byteInteractions || 0
      },
      {
        trait_type: "Wallet",
        value: connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : "Unknown"
      },
      {
        trait_type: "Redeemable",
        value: `${gameData.tokenReward || 1000} $AIKIRA`
      }
    ]
  };
}

/**
 * Upload NFT metadata to IPFS
 * @param {object} metadata NFT metadata
 * @returns {Promise<string|null>} IPFS URI or null if failed
 */
export async function uploadToIPFS(metadata) {
  try {
    // This would normally use an IPFS service like Pinata or NFT.Storage
    // For now, we'll return a placeholder
    console.log('Would upload metadata to IPFS:', metadata);
    return `ipfs://QmExample.../${Date.now()}.json`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return null;
  }
}