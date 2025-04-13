import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

// Import contract ABIs and blockchain functions
import { burnNFTForTokens } from '../blockchain/base';

/**
 * NFTDisplay component for AIKIRA: GENESIS PROTOCOL
 * 
 * This component displays the Genesis NFT that players earn upon completing
 * the game, with options to keep it or burn it for $AIKIRA tokens.
 */
const NFTDisplay = ({ 
  metadata, 
  walletConnected, 
  walletAddress, 
  onClose 
}) => {
  // Component state
  const [burnStatus, setBurnStatus] = useState('ready'); // ready, burning, success, error
  const [burnError, setBurnError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [burnTxHash, setBurnTxHash] = useState(null);
  
  // Get wallet account
  const { address } = useAccount();
  
  // Default metadata if none provided
  const defaultMetadata = {
    name: 'AIKIRA Genesis Protocol - DNA Fragment',
    description: 'This NFT represents the successful recovery of the dinosaur DNA fragment from the Genesis Protocol. It can be burned to claim $AIKIRA tokens.',
    image: '/assets/images/rewards/default-nft.png',
    animation_url: null,
    external_url: 'https://aikira.io',
    attributes: [
      {
        trait_type: 'Completion Date',
        value: new Date().toISOString().split('T')[0]
      },
      {
        trait_type: 'Protocol Fragments',
        value: '5/5'
      },
      {
        trait_type: 'BYTE Warnings',
        value: 0
      },
      {
        trait_type: 'Wallet',
        value: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not Connected'
      },
      {
        trait_type: 'Redeemable',
        value: '5,000 $AIKIRA'
      }
    ]
  };
  
  // Use provided metadata or fallback to default
  const nftData = metadata || defaultMetadata;
  
  // Find the token reward value
  const rewardAttribute = nftData.attributes.find(attr => attr.trait_type === 'Redeemable');
  const rewardValue = rewardAttribute ? rewardAttribute.value : '5,000 $AIKIRA';
  
  // Handle burning NFT for tokens
  const handleBurnNFT = async () => {
    // Require wallet connection
    if (!walletConnected || !address) {
      alert('Please connect your wallet to burn the NFT');
      return;
    }
    
    // Show confirmation first
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    // Set burning status
    setBurnStatus('burning');
    setBurnError(null);
    
    try {
      // Burn the NFT (mock implementation - replace with actual contract call)
      const result = await burnNFTForTokens(metadata.tokenId);
      
      if (result.success) {
        setBurnStatus('success');
        setBurnTxHash(result.txHash);
        
        // Emit event for successful burn
        if (window.gameEvents) {
          window.gameEvents.emit('nftBurned', {
            tokenId: metadata.tokenId,
            reward: rewardValue
          });
        }
      } else {
        setBurnStatus('error');
        setBurnError(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error burning NFT:', error);
      setBurnStatus('error');
      setBurnError(error.message || 'An unexpected error occurred');
    }
  };
  
  // Cancel burn confirmation
  const handleCancelBurn = () => {
    setShowConfirm(false);
  };
  
  // Close the modal
  const handleClose = () => {
    if (onClose) onClose();
  };
  
  // Share NFT on Twitter
  const handleShare = () => {
    const tweetText = encodeURIComponent(
      `Just finished AIKIRA: Genesis Protocol and claimed my Genesis NFT. BYTE didn't bark once. Holding or burning this NFT for ${rewardValue}? #AIKIRA #GenesisProtocol`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };
  
  // Render NFT display modal
  return (
    <div className="modal active">
      <div className="modal-content nft-display">
        {/* NFT title */}
        <h2 className="modal-title">{nftData.name}</h2>
        
        {/* NFT image */}
        <div className="nft-image-container">
          {nftData.animation_url ? (
            <video 
              src={nftData.animation_url} 
              autoPlay 
              loop 
              muted 
              className="nft-media"
            />
          ) : (
            <img 
              src={nftData.image} 
              alt={nftData.name} 
              className="nft-media"
            />
          )}
          
          {/* Overlay glow effect */}
          <div className="nft-glow-effect"></div>
          
          {/* DNA helix animation effect */}
          <div className="dna-animation"></div>
        </div>
        
        {/* NFT description */}
        <div className="nft-description">
          <p>{nftData.description}</p>
        </div>
        
        {/* NFT attributes */}
        <div className="nft-attributes">
          {nftData.attributes.map((attr, index) => (
            <div key={index} className="nft-attribute">
              <span className="attribute-name">{attr.trait_type}:</span>
              <span 
                className={`attribute-value ${attr.trait_type === 'Redeemable' ? 'highlight' : ''}`}
              >
                {attr.value}
              </span>
            </div>
          ))}
        </div>
        
        {/* Burn controls */}
        <div className="nft-controls">
          {burnStatus === 'ready' && !showConfirm && (
            <>
              <button 
                className="modal-button burn"
                onClick={handleBurnNFT}
                disabled={!walletConnected}
              >
                Burn NFT for {rewardValue}
              </button>
              
              <button className="modal-button secondary" onClick={handleClose}>
                Keep NFT
              </button>
            </>
          )}
          
          {burnStatus === 'ready' && showConfirm && (
            <>
              <p className="confirm-text">
                Are you sure you want to burn this NFT? This action cannot be undone.
                You will receive {rewardValue} in exchange.
              </p>
              
              <div className="button-row">
                <button 
                  className="modal-button burn"
                  onClick={handleBurnNFT}
                >
                  Confirm Burn
                </button>
                
                <button 
                  className="modal-button secondary"
                  onClick={handleCancelBurn}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          
          {burnStatus === 'burning' && (
            <div className="burn-status">
              <div className="loading-spinner"></div>
              <p>Burning NFT... Please confirm the transaction in your wallet.</p>
            </div>
          )}
          
          {burnStatus === 'success' && (
            <div className="burn-status success">
              <p>NFT successfully burned! {rewardValue} has been sent to your wallet.</p>
              
              {burnTxHash && (
                <a 
                  href={`https://basescan.org/tx/${burnTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  View transaction
                </a>
              )}
              
              <button className="modal-button" onClick={handleClose}>
                Close
              </button>
            </div>
          )}
          
          {burnStatus === 'error' && (
            <div className="burn-status error">
              <p>Error burning NFT: {burnError}</p>
              <button 
                className="modal-button"
                onClick={() => setBurnStatus('ready')}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        {/* Social sharing */}
        <div className="social-buttons">
          <button className="share-button" onClick={handleShare}>
            Share on Twitter
          </button>
        </div>
        
        {/* Base Network badge */}
        <div className="network-badge">
          <span className="base-badge">Base Network</span>
        </div>
        
        {/* Close button */}
        <button className="close-button" onClick={handleClose}>×</button>
      </div>
    </div>
  );
};

export default NFTDisplay;