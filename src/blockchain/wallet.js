/**
 * AIKIRA: GENESIS PROTOCOL
 * Wallet Connection Logic
 * 
 * This module handles all wallet connection functionality:
 * - Connecting to MetaMask and other Web3 wallets
 * - Managing connection state
 * - Switching networks to Base
 * - Providing access to provider and signer objects
 */

import { ethers } from 'ethers';

// Base Network configuration
const BASE_CHAIN_ID = 8453; // Base Mainnet
const BASE_TESTNET_CHAIN_ID = 84531; // Base Goerli Testnet
const CHAIN_ID = process.env.REACT_APP_USE_TESTNET === 'true' 
  ? BASE_TESTNET_CHAIN_ID 
  : BASE_CHAIN_ID;

// Chain metadata for adding to wallet
const BASE_CHAIN_METADATA = {
  mainnet: {
    chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org']
  },
  testnet: {
    chainId: `0x${BASE_TESTNET_CHAIN_ID.toString(16)}`,
    chainName: 'Base Goerli Testnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://goerli.base.org'],
    blockExplorerUrls: ['https://goerli.basescan.org']
  }
};

// State management
let provider = null;
let signer = null;
let connectedAddress = null;
let connectedChainId = null;
let isConnected = false;

// Event listeners
const connectionListeners = [];

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
      
      // Check if already connected
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        // User already connected
        connectedAddress = accounts[0];
        signer = provider.getSigner();
        
        // Get connected chain ID
        const network = await provider.getNetwork();
        connectedChainId = network.chainId;
        
        isConnected = true;
        
        // Notify listeners
        notifyConnectionListeners();
      }
      
      console.log('Blockchain initialized:', isConnected ? 'Connected' : 'Ready to connect');
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
    // Check if provider exists, initialize if not
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
      const network = await provider.getNetwork();
      connectedChainId = network.chainId;
      
      isConnected = true;
      
      // Check if connected to Base
      if (!isBaseNetwork(connectedChainId)) {
        console.warn('Not connected to Base Network. Will prompt to switch.');
        // Prompt to switch to Base
        const switched = await switchToBase();
        if (!switched) {
          console.warn('User declined to switch to Base Network.');
        }
      }
      
      // Notify listeners
      notifyConnectionListeners();
      
      console.log('Wallet connected:', connectedAddress);
      return connectedAddress;
    }
    
    return null;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
}

/**
 * Disconnect wallet
 * @returns {Promise<boolean>} Disconnect success
 */
export async function disconnectWallet() {
  // Note: There's no standard way to disconnect in MetaMask
  // We can only reset our state
  connectedAddress = null;
  signer = null;
  isConnected = false;
  
  // Notify listeners
  notifyConnectionListeners();
  
  console.log('Wallet disconnected');
  return true;
}

/**
 * Check if connected to Base Network
 * @param {number} chainId Chain ID to check
 * @returns {boolean} True if connected to Base Network
 */
export function isBaseNetwork(chainId) {
  return chainId === BASE_CHAIN_ID || chainId === BASE_TESTNET_CHAIN_ID;
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
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }]
    });
    
    return true;
  } catch (error) {
    // If Base is not added to the wallet, try to add it
    if (error.code === 4902) {
      try {
        // Add Base to wallet
        const chainMetadata = process.env.REACT_APP_USE_TESTNET === 'true'
          ? BASE_CHAIN_METADATA.testnet
          : BASE_CHAIN_METADATA.mainnet;
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainMetadata]
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
 * Get provider instance
 * @returns {ethers.providers.Web3Provider|null} Web3 provider or null if not available
 */
export function getProvider() {
  return provider;
}

/**
 * Get signer instance
 * @returns {ethers.Signer|null} Signer or null if not available
 */
export function getSigner() {
  return signer;
}

/**
 * Get connected address
 * @returns {string|null} Connected address or null if not connected
 */
export function getConnectedAddress() {
  return connectedAddress;
}

/**
 * Check if wallet is connected
 * @returns {boolean} True if wallet is connected
 */
export function isWalletConnected() {
  return isConnected;
}

/**
 * Get connected chain ID
 * @returns {number|null} Chain ID or null if not connected
 */
export function getConnectedChainId() {
  return connectedChainId;
}

/**
 * Add connection listener
 * @param {Function} listener Listener function
 */
export function addConnectionListener(listener) {
  if (typeof listener === 'function') {
    connectionListeners.push(listener);
  }
}

/**
 * Remove connection listener
 * @param {Function} listener Listener function to remove
 */
export function removeConnectionListener(listener) {
  const index = connectionListeners.indexOf(listener);
  if (index !== -1) {
    connectionListeners.splice(index, 1);
  }
}

/**
 * Notify all connection listeners
 */
function notifyConnectionListeners() {
  // Create connection state object
  const connectionState = {
    address: connectedAddress,
    chainId: connectedChainId,
    isConnected,
    isBase: isBaseNetwork(connectedChainId)
  };
  
  // Notify all listeners
  for (const listener of connectionListeners) {
    try {
      listener(connectionState);
    } catch (error) {
      console.error('Error in connection listener:', error);
    }
  }
  
  // Also emit event for global event system
  if (window.gameEvents) {
    window.gameEvents.emit('walletConnectionChanged', connectionState);
  }
}

/**
 * Handle account changes from wallet
 * @param {string[]} accounts New accounts
 */
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    connectedAddress = null;
    signer = null;
    isConnected = false;
    
    console.log('Wallet disconnected');
  } else if (accounts[0] !== connectedAddress) {
    // Account changed
    connectedAddress = accounts[0];
    
    if (provider) {
      signer = provider.getSigner();
    }
    
    isConnected = true;
    
    console.log('Wallet account changed:', connectedAddress);
  }
  
  // Notify listeners
  notifyConnectionListeners();
}

/**
 * Handle chain changes from wallet
 * @param {string} chainIdHex New chain ID (hex string)
 */
function handleChainChanged(chainIdHex) {
  // Parse chain ID as integer
  const chainId = parseInt(chainIdHex, 16);
  
  connectedChainId = chainId;
  
  console.log('Network changed:', chainId);
  
  // Notify listeners
  notifyConnectionListeners();
}

/**
 * Get balance of the connected wallet
 * @returns {Promise<string|null>} Balance in ETH or null if not connected
 */
export async function getWalletBalance() {
  try {
    if (!isConnected || !provider || !connectedAddress) return null;
    
    const balance = await provider.getBalance(connectedAddress);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return null;
  }
}

/**
 * Get network name for the current connection
 * @returns {string} Network name or 'Unknown Network' if not recognized
 */
export function getNetworkName() {
  if (!connectedChainId) return 'Not Connected';
  
  switch (connectedChainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 8453:
      return 'Base Mainnet';
    case 84531:
      return 'Base Goerli Testnet';
    case 5:
      return 'Goerli Testnet';
    default:
      return 'Unknown Network';
  }
}

// Initialize blockchain on module load
initializeBlockchain();