/**
 * AIKIRA: GENESIS PROTOCOL
 * Main Entry Point
 * 
 * This file initializes the game, loads required modules,
 * and bootstraps the entire application on the Base Network.
 */

// Import dependencies
import p5 from 'p5';
import './styles/main.css';
import { initializeBlockchain, isWalletConnected } from './blockchain/base';

// Import game engine
import { 
  gameState, 
  setScene, 
  saveProgress, 
  loadProgress 
} from './game/engine';

// Import scenes
import CrypticWallScene from './game/scenes/Chapter1';

// Import characters - fix case sensitivity in filenames
import Aikira from './game/characters/aikira';
import Cliza from './game/characters/cliza';
import Byte from './game/characters/byte';

// Define placeholder classes for the other scenes
// These will need to be implemented similarly to Chapter1
const MammothShrineScene = function() { return {}; };
const ByteJudgmentScene = function() { return {}; };
const EncryptedForestScene = function() { return {}; };
const GenesisVaultScene = function() { return {}; };
const IntroScene = function() { return {}; };
const LoadingScene = function() { return {}; };
const NFTRewardScene = function() { return {}; };

// Game event system
window.gameEvents = {
  listeners: {},
  
  on: function(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  
  emit: function(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

// Global variables
let aikira, cliza, byte;
let scenes = {};
let currentScene = null;
let assets = {
  images: {},
  audio: {},
  fonts: {}
};

// p5.js instance
const sketch = (p) => {
  // p5.js setup function - runs once at initialization
  p.setup = function() {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.textAlign(p.CENTER, p.CENTER);
    
    // Initialize game state
    initializeGame();
  };
  
  // p5.js draw function - runs continuously
  p.draw = function() {
    p.background(0);
    
    // Render current scene if available
    if (currentScene && typeof currentScene.render === 'function') {
      // Make sure the scene has access to the p5 instance
      if (currentScene.setP5) {
        currentScene.setP5(p);
      }
      currentScene.render();
    }
    
    // Debug info in development mode
    if (isDevelopment()) {
      displayDebugInfo();
    }
  };
  
  // Window resize handler
  p.windowResized = function() {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    
    // Notify current scene of resize
    if (currentScene && typeof currentScene.resize === 'function') {
      currentScene.resize();
    }
  };
  
  // Mouse and touch event handlers
  p.mousePressed = function() {
    if (currentScene && typeof currentScene.mousePressed === 'function') {
      return currentScene.mousePressed();
    }
  };
  
  p.mouseMoved = function() {
    if (currentScene && typeof currentScene.mouseMoved === 'function') {
      currentScene.mouseMoved();
    }
  };
  
  // Asset loading
  function loadAssets() {
    console.log('Loading assets...');
    
    // Load common images
    try {
      assets.images.logo = p.loadImage('assets/images/ui/aikira-logo.png');
      assets.images.aikira = p.loadImage('assets/images/characters/aikira.png');
      assets.images.cliza = p.loadImage('assets/images/characters/cliza.png');
      assets.images.byte = p.loadImage('assets/images/characters/byte.png');
    } catch (e) {
      console.warn('Image loading failed:', e);
    }
    
    // Load common audio (only if p.loadSound is available)
    if (typeof p.loadSound === 'function') {
      try {
        assets.audio.bgm = p.loadSound('assets/audio/aikira-theme.mp3');
        assets.audio.byteBark = p.loadSound('assets/audio/byte-bark.mp3');
      } catch (e) {
        console.warn('Sound loading failed:', e);
        // Initialize empty audio objects to prevent errors
        assets.audio.bgm = { play: () => console.log('BGM would play here') };
        assets.audio.byteBark = { play: () => console.log('Bark sound would play here') };
      }
    } else {
      console.warn('p5.sound library not available, creating mock sound objects');
      // Create mock sound objects with no-op methods
      assets.audio.bgm = { play: () => console.log('BGM would play here') };
      assets.audio.byteBark = { play: () => console.log('Bark sound would play here') };
    }
    
    // Load fonts
    try {
      assets.fonts.main = p.loadFont('assets/fonts/pixeloid-sans.ttf');
    } catch (e) {
      console.warn('Font loading failed:', e);
    }
    
    console.log('Assets loaded successfully');
  }
  
  // Initialize game
  function initializeGame() {
    console.log('Initializing AIKIRA: GENESIS PROTOCOL...');
    
    // Load assets
    loadAssets();
    
    // Initialize blockchain connection
    initializeBlockchain().then(connected => {
      console.log('Blockchain initialized:', connected ? 'Connected' : 'Not connected');
    });
    
    // Initialize characters
aikira = new Aikira();
cliza = new Cliza();
byte = new Byte();

if (aikira.initialize) aikira.initialize(assets);
if (cliza.initialize) cliza.initialize(assets);
if (byte.initialize) byte.initialize(assets);
    
    // Initialize scenes
    scenes = {
      loading: new LoadingScene(),
      intro: new IntroScene(),
      chapter1: new CrypticWallScene(),
      chapter2: new MammothShrineScene(),
      chapter3: new ByteJudgmentScene(),
      chapter4: new EncryptedForestScene(),
      chapter5: new GenesisVaultScene(),
      nftReward: new NFTRewardScene()
    };
    
    // Make sure each scene has the p5 instance
    Object.values(scenes).forEach(scene => {
      if (scene.setP5) scene.setP5(p);
    });
    
    // Load saved progress
    loadProgress();
    
    // Start with loading scene, then transition to intro or last saved chapter
    setScene('loading');
    
    // After loading completes, check if we have saved progress
    setTimeout(() => {
      if (gameState.currentChapter > 1 && gameState.puzzlesSolved.some(Boolean)) {
        // Resume from last chapter
        setScene(`chapter${gameState.currentChapter}`);
      } else {
        // Start fresh
        setScene('intro');
      }
    }, 3000);
    
    // Set up window resize event
    window.addEventListener('resize', handleResize);
    
    console.log('Game initialized successfully');
  }
  
  // Resize handler
  function handleResize() {
    if (currentScene && typeof currentScene.resize === 'function') {
      currentScene.resize();
    }
  }
  
  // Scene transition
  function setScene(sceneName) {
    // Check if scene exists
    if (!scenes[sceneName]) {
      console.error(`Scene '${sceneName}' does not exist`);
      return;
    }
    
    // Exit current scene if exists
    if (currentScene && typeof currentScene.exit === 'function') {
      currentScene.exit();
    }
    
    // Set new scene
    currentScene = scenes[sceneName];
    
    // Make sure the scene has the p5 instance
    if (currentScene.setP5) {
      currentScene.setP5(p);
    }
    
    // Enter new scene
    if (typeof currentScene.enter === 'function') {
      currentScene.enter();
    }
    
    console.log(`Transitioned to scene: ${sceneName}`);
  }
  
  // Debug helpers
  function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
  
  function displayDebugInfo() {
    p.fill(255);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Chapter: ${gameState.currentChapter}`, 10, 10);
    p.text(`Puzzles Solved: ${gameState.puzzlesSolved.filter(Boolean).length}/5`, 10, 30);
    p.text(`BYTE Interactions: ${gameState.byteInteractions}`, 10, 50);
    p.text(`Wallet Connected: ${isWalletConnected() ? 'Yes' : 'No'}`, 10, 70);
    p.textAlign(p.CENTER, p.CENTER);
  }
  
  // Make functions available globally
  window.gameEngine = {
    setScene,
    saveProgress,
    loadProgress,
    aikira,
    cliza,
    byte
  };
};

// Create p5 instance
const app = new p5(sketch);

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('AIKIRA: GENESIS PROTOCOL - DOM Ready');
  
  // Add any DOM event listeners here
  document.getElementById('wallet-connect')?.addEventListener('click', () => {
    window.gameEvents.emit('connectWalletClicked');
  });
});

// Initialize game state for use throughout the app
window.gameState = gameState;

// Export global game reference
export default app;