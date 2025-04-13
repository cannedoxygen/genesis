import React from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

/**
 * WalletButton component for AIKIRA: GENESIS PROTOCOL
 * 
 * This component provides wallet connection functionality using RainbowKit.
 * It displays different states based on connection status and integrates
 * with Base Network.
 */
const WalletButton = () => {
  // RainbowKit and wagmi hooks
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Handle connect button click
  const handleConnect = () => {
    if (openConnectModal) {
      openConnectModal();
    } else {
      // Emit event for the game to handle if RainbowKit isn't ready
      if (window.gameEvents) {
        window.gameEvents.emit('connectWalletClicked');
      }
    }
  };
  
  // Handle disconnect button click
  const handleDisconnect = () => {
    disconnect();
  };
  
  // Render connect button if not connected
  if (!isConnected) {
    return (
      <button
        id="wallet-connect"
        onClick={handleConnect}
        className="tooltip"
      >
        Connect Wallet
        <span className="tooltip-text">Connect to claim $AIKIRA rewards</span>
      </button>
    );
  }
  
  // Render disconnect button if connected
  return (
    <button
      id="wallet-connect"
      onClick={handleDisconnect}
      className="connected tooltip"
    >
      <span className="base-badge">Base</span> Connected
      <span className="tooltip-text">Click to disconnect wallet</span>
    </button>
  );
};

export default WalletButton;