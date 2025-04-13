/**
 * AIKIRA: GENESIS PROTOCOL
 * Connect Wallet Component
 * 
 * This component provides a user interface for wallet connection:
 * - Connect/disconnect wallet buttons
 * - Wallet status display
 * - Network switching
 * - Base Network integration
 */

import React, { useState, useEffect } from 'react';
import { 
  connectWallet, 
  disconnectWallet, 
  isWalletConnected,
  getConnectedAddress,
  isBaseNetwork,
  getConnectedChainId,
  switchToBase,
  getNetworkName
} from '../blockchain/base';

const ConnectWallet = ({ className = '' }) => {
  // Component state
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isBase, setIsBase] = useState(false);
  const [networkName, setNetworkName] = useState('Not Connected');
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Initialize component
  useEffect(() => {
    // Check current wallet connection
    updateConnectionState();

    // Listen for wallet connection changes from other components
    if (window.gameEvents) {
      window.gameEvents.on('walletConnectionChanged', handleConnectionChange);
    }

    return () => {
      // Clean up event listener
      if (window.gameEvents) {
        window.gameEvents.removeListener('walletConnectionChanged', handleConnectionChange);
      }
    };
  }, []);

  // Update connection state from wallet
  const updateConnectionState = () => {
    const walletConnected = isWalletConnected();
    const walletAddress = getConnectedAddress();
    const currentChainId = getConnectedChainId();
    const onBaseNetwork = isBaseNetwork(currentChainId);
    const network = getNetworkName();

    setConnected(walletConnected);
    setAddress(walletAddress);
    setChainId(currentChainId);
    setIsBase(onBaseNetwork);
    setNetworkName(network);

    // Show network warning if connected but not on Base
    setShowNetworkWarning(walletConnected && !onBaseNetwork);
  };

  // Handle wallet connection changes
  const handleConnectionChange = (connectionState) => {
    setConnected(connectionState.isConnected);
    setAddress(connectionState.address);
    setChainId(connectionState.chainId);
    setIsBase(connectionState.isBase);
    setShowNetworkWarning(connectionState.isConnected && !connectionState.isBase);

    // Update network name
    setNetworkName(getNetworkName());
  };

  // Handle connect button click
  const handleConnect = async () => {
    setConnecting(true);

    try {
      const address = await connectWallet();
      
      if (address) {
        // Connection successful, update state
        updateConnectionState();
        
        // Emit event for game to handle
        if (window.gameEvents) {
          window.gameEvents.emit('walletConnected', { address });
        }
      } else {
        // Connection failed
        console.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  // Handle disconnect button click
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      
      // Update connection state
      updateConnectionState();
      
      // Emit event for game to handle
      if (window.gameEvents) {
        window.gameEvents.emit('walletDisconnected');
      }
      
      // Hide dropdown
      setShowDropdown(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Handle switch network button click
  const handleSwitchNetwork = async () => {
    try {
      const success = await switchToBase();
      
      if (success) {
        // Update connection state
        updateConnectionState();
        
        // Hide network warning
        setShowNetworkWarning(false);
      } else {
        console.error('Failed to switch to Base Network');
      }
    } catch (error) {
      console.error('Error switching to Base Network:', error);
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Render not connected state
  if (!connected) {
    return (
      <button
        className={`connect-wallet-button ${className}`}
        onClick={handleConnect}
        disabled={connecting}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  // Render connected state
  return (
    <div className={`wallet-container ${className}`}>
      {/* Network warning */}
      {showNetworkWarning && (
        <div className="network-warning">
          <span>Not connected to Base Network</span>
          <button className="switch-network-button" onClick={handleSwitchNetwork}>
            Switch to Base
          </button>
        </div>
      )}

      {/* Connected wallet info */}
      <div className="wallet-info" onClick={toggleDropdown}>
        <div className="network-indicator">
          <span className={`network-dot ${isBase ? 'base' : 'other'}`}></span>
          <span className="network-name">{networkName}</span>
        </div>
        <div className="address-display">
          {formatAddress(address)}
        </div>
        <div className="dropdown-arrow">▼</div>
      </div>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="wallet-dropdown">
          <div className="dropdown-item">
            <span className="item-label">Address:</span>
            <span className="item-value">{formatAddress(address)}</span>
            <button 
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(address);
                // Show copy feedback here
              }}
            >
              Copy
            </button>
          </div>
          <div className="dropdown-item">
            <span className="item-label">Network:</span>
            <span className="item-value">{networkName}</span>
            {!isBase && (
              <button className="switch-button" onClick={handleSwitchNetwork}>
                Switch to Base
              </button>
            )}
          </div>
          <div className="dropdown-item">
            <button className="disconnect-button" onClick={handleDisconnect}>
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;