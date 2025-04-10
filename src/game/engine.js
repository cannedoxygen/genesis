/**
 * AIKIRA: GENESIS PROTOCOL
 * Game Engine - Core p5.js Implementation
 * 
 * This file serves as the main game engine, handling:
 * - p5.js initialization
 * - Scene management
 * - Game state
 * - Asset loading
 * - Input handling
 */

// Game state management
let gameState = {
    currentChapter: 1,
    cluesCollected: [],
    puzzlesSolved: [false, false, false, false, false],
    playerWallet: null,
    byteInteractions: 0
  };
  
  // Scene management
  let currentScene = null;
  let scenes = {};
  let assets = {
    images: {},
    audio: {},
    fonts: {}
  };
  
  // Character references
  let aikira = null;
  let cliza = null;
  let byte = null;
  
  // p5.js setup function - runs once at initialization
  function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    
    // Initialize assets loader
    loadAssets();
    
    // Initialize characters
    initializeCharacters();
    
    // Initialize scenes
    initializeScenes();
    
    // Set starting scene
    setScene('chapter1');
  }
  
  // p5.js draw function - runs continuously
  function draw() {
    background(0);
    
    // Render current scene if available
    if (currentScene && typeof currentScene.render === 'function') {
      currentScene.render();
    }
    
    // Debug info - remove in production
    if (isDevelopment()) {
      displayDebugInfo();
    }
  }
  
  // Window resize handler
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Notify current scene of resize
    if (currentScene && typeof currentScene.resize === 'function') {
      currentScene.resize();
    }
  }
  
  // Mouse and touch event handlers
  function mousePressed() {
    if (currentScene && typeof currentScene.mousePressed === 'function') {
      currentScene.mousePressed();
    }
  }
  
  function mouseMoved() {
    if (currentScene && typeof currentScene.mouseMoved === 'function') {
      currentScene.mouseMoved();
    }
  }
  
  // Asset loading
  function loadAssets() {
    // Load common assets here
    assets.images.logo = loadImage('assets/images/ui/aikira-logo.png');
    assets.images.byte = loadImage('assets/images/characters/byte.png');
    
    // Will load chapter-specific assets when needed
  }
  
  // Scene initialization
  function initializeScenes() {
    // Import scenes - will be defined in separate files
    scenes.chapter1 = new CrypticWallScene();
    scenes.chapter2 = new MammothShrineScene();
    scenes.chapter3 = new ByteJudgmentScene();
    scenes.chapter4 = new EncryptedForestScene();
    scenes.chapter5 = new GenesisVaultScene();
    
    // Additional utility scenes
    scenes.intro = new IntroScene();
    scenes.loading = new LoadingScene();
    scenes.nftReward = new NFTRewardScene();
  }
  
  // Character initialization
  function initializeCharacters() {
    aikira = new Aikira();
    cliza = new Cliza();
    byte = new Byte();
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
    
    // Enter new scene
    if (typeof currentScene.enter === 'function') {
      currentScene.enter();
    }
  }
  
  // Save game progress
  function saveProgress() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aikira-progress', JSON.stringify(gameState));
    }
  }
  
  // Load game progress
  function loadProgress() {
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem('aikira-progress');
      if (savedState) {
        try {
          gameState = JSON.parse(savedState);
        } catch (e) {
          console.error('Failed to load saved progress', e);
        }
      }
    }
  }
  
  // Debug helpers
  function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
  
  function displayDebugInfo() {
    fill(255);
    textSize(12);
    textAlign(LEFT, TOP);
    text(`Chapter: ${gameState.currentChapter}`, 10, 10);
    text(`Puzzles Solved: ${gameState.puzzlesSolved.filter(Boolean).length}/5`, 10, 30);
    text(`BYTE Interactions: ${gameState.byteInteractions}`, 10, 50);
    textAlign(CENTER, CENTER);
  }
  
  // Connect wallet function - will integrate with blockchain later
  function connectWallet() {
    // This will be implemented with RainbowKit/Ethers.js
    console.log("Wallet connection will be implemented here");
  }
  
  // Export functionality for module use
  if (typeof module !== 'undefined') {
    module.exports = {
      gameState,
      setScene,
      saveProgress,
      loadProgress
    };
  }