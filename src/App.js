import React, { useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import './styles/main.css';

// Game canvas component
import GameCanvas from './components/GameCanvas';

// Web3 components
import WalletButton from './components/WalletButton';
import NFTDisplay from './components/NFTDisplay';

// Game state management
import { init as initGameEngine } from './game/engine';

function App() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeScene, setActiveScene] = useState('loading');
  const [completedChapters, setCompletedChapters] = useState([]);
  const [collectedClues, setCollectedClues] = useState([]);
  const [showNFT, setShowNFT] = useState(false);
  const [nftMetadata, setNftMetadata] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Web3 hooks
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  
  // Handle game events
  useEffect(() => {
    if (window.gameEvents) {
      // Listen for scene changes
      window.gameEvents.on('sceneChanged', (sceneName) => {
        setActiveScene(sceneName);
        
        // Show NFT display when reaching nftReward scene
        if (sceneName === 'nftReward') {
          setShowNFT(true);
        } else {
          setShowNFT(false);
        }
      });
      
      // Listen for chapter completion
      window.gameEvents.on('chapterCompleted', (chapterIndex) => {
        setCompletedChapters(prev => {
          if (!prev.includes(chapterIndex)) {
            return [...prev, chapterIndex];
          }
          return prev;
        });
      });
      
      // Listen for clue collection
      window.gameEvents.on('clueCollected', (clue) => {
        setCollectedClues(prev => {
          if (!prev.includes(clue)) {
            return [...prev, clue];
          }
          return prev;
        });
      });
      
      // Listen for NFT minted
      window.gameEvents.on('nftMinted', (metadata) => {
        setNftMetadata(metadata);
      });
      
      // Listen for wallet connection requests
      window.gameEvents.on('connectWalletClicked', () => {
        if (openConnectModal) {
          openConnectModal();
        }
      });
    }
    
    // Initialize game engine
    const gameLoaded = initGameEngine();
    
    // Set loading state based on game initialization
    if (gameLoaded) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Give a bit of time for assets to load
    }
    
    // Clean up event listeners
    return () => {
      if (window.gameEvents) {
        window.gameEvents.listeners = {};
      }
    };
  }, [openConnectModal]);
  
  // Start the game
  const handleStartGame = () => {
    setGameStarted(true);
    
    // Set initial scene
    if (window.gameEngine) {
      window.gameEngine.setScene('intro');
    }
  };
  
  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    
    // Update game audio state
    if (window.gameEngine) {
      window.gameEngine.setAudioEnabled(!audioEnabled);
    }
  };
  
  // Render loading screen during initial load
  if (isLoading) {
    return (
      <div id="p5_loading">
        <img src="/assets/images/ui/aikira-logo.png" alt="AIKIRA: Genesis Protocol" />
        <div className="loading-bar">
          <div 
            className="loading-progress" 
            style={{ width: `${Math.floor(Math.random() * 100)}%` }}
          ></div>
        </div>
        <div className="loading-text">INITIALIZING GENESIS PROTOCOL</div>
      </div>
    );
  }
  
  // Render start screen if game not started
  if (!gameStarted) {
    return (
      <div className="start-screen">
        <div className="logo-container">
          <img src="/assets/images/ui/aikira-logo.png" alt="AIKIRA: Genesis Protocol" />
        </div>
        
        <div className="tagline">
          Decode the past. Uncover the DNA. Restore the Genesis Sequence.
        </div>
        
        <button className="start-button" onClick={handleStartGame}>
          ACTIVATE PROTOCOL
        </button>
        
        {/* Wallet connection optional at start */}
        <div className="wallet-connect-container">
          <WalletButton />
          <p className="wallet-note">
            Wallet connection optional. Connect now or later to claim rewards.
          </p>
        </div>
        
        {/* Credit footer */}
        <div className="footer">
          <p>Built on Base Network • p5.js • #GenesisProtocol</p>
        </div>
      </div>
    );
  }
  
  // Main game view
  return (
    <div className="game-container">
      {/* Main game canvas */}
      <GameCanvas 
        activeScene={activeScene}
        completedChapters={completedChapters}
        collectedClues={collectedClues}
        walletConnected={isConnected}
        walletAddress={address}
        audioEnabled={audioEnabled}
      />
      
      {/* Wallet UI */}
      <div id="wallet-ui">
        <WalletButton />
        {isConnected && (
          <div id="wallet-address">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </div>
        )}
      </div>
      
      {/* NFT display modal */}
      {showNFT && (
        <NFTDisplay 
          metadata={nftMetadata} 
          walletConnected={isConnected}
          walletAddress={address}
          onClose={() => setShowNFT(false)}
        />
      )}
      
      {/* Audio controls */}
      <div id="audio-controls">
        <button 
          id="audio-toggle" 
          className={audioEnabled ? '' : 'muted'}
          onClick={toggleAudio}
        >
          <span className="unmuted-icon">🔊</span>
          <span className="muted-icon">🔇</span>
        </button>
      </div>
      
      {/* Social share */}
      {activeScene === 'nftReward' && (
        <div id="social-share" className="active">
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              "Just finished Genesis Protocol. BYTE didn't bark once. Holding or burning this NFT for $AIKIRA? #AIKIRA #GenesisProtocol"
            )}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="share-button twitter"
          >
            <span>Share on Twitter</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;