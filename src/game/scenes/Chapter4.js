/**
 * AIKIRA: GENESIS PROTOCOL
 * Chapter 4 - Encrypted Forest Scene
 * 
 * Scene description: Top-down navigation through a digital jungle
 * Puzzle: Avoid AI birds and collect 3 DNA fragments
 * Clue Reward: "DINO. SEQUENCE. LOCATED."
 */

class EncryptedForestScene extends BaseScene {
    constructor() {
      super('chapter4', 'Encrypted Forest');
      
      // Navigation puzzle instance
      this.navigationPuzzle = new NavigationPuzzle();
      this.puzzleSolved = false;
      
      // Environment properties
      this.weatherEffects = {
        raindrops: [],
        fogPatches: [],
        lightningFlash: 0
      };
      this.fogIntensity = 0;
      this.rainIntensity = 0;
      
      // Dialogue data
      this.dialogues = [
        {
          id: 'intro',
          character: 'AIKIRA',
          lines: [
            "Encrypted Forest protocol initiated.",
            "Anomalous data streams detected in this region.",
            "Navigate carefully to retrieve the DNA fragments."
          ],
          onComplete: () => {
            setTimeout(() => this.startDialogue('cliza-intro'), 1000);
          }
        },
        {
          id: 'cliza-intro',
          character: 'CLIZA',
          lines: [
            "This data forest is fascinating! The patterns mimic ancient migration routes.",
            "I'm detecting three distinct DNA fragment signals scattered throughout.",
            "Be careful of the security protocols - they manifest as predatory birds!"
          ],
          onComplete: () => {
            // Activate the puzzle after dialogue
            this.activatePuzzle();
          }
        },
        {
          id: 'byte-warning',
          character: 'BYTE',
          lines: [
            "*alert bark*",
            "SECURITY SYSTEMS ACTIVE. AVOID DETECTION.",
            "FRAGMENTS MUST BE COLLECTED IN SEQUENCE."
          ]
        },
        {
          id: 'puzzle-hint',
          character: 'CLIZA',
          lines: [
            "Try to move along the data streams - they provide camouflage from the birds.",
            "The fragments emit a subtle pulse that increases as you get closer.",
            "Don't rush - plan your route carefully to avoid detection!"
          ]
        },
        {
          id: 'fragment-found',
          character: 'CLIZA',
          lines: [
            "Excellent! Fragment secured.",
            "This appears to be a segment of therapod DNA. Fascinating!",
            "Continue searching for the remaining fragments."
          ]
        },
        {
          id: 'all-fragments',
          character: 'CLIZA',
          lines: [
            "All three fragments collected!",
            "Head to the exit portal to compile the data.",
            "The complete sequence is beginning to take shape!"
          ]
        },
        {
          id: 'success',
          character: 'AIKIRA',
          lines: [
            "Navigation successful. All DNA fragments retrieved.",
            "Clue unlocked: 'DINO. SEQUENCE. LOCATED.'",
            "Preparing transition to final sequence node..."
          ],
          onComplete: () => {
            // Store the clue in game state
            gameState.cluesCollected.push("DINO. SEQUENCE. LOCATED.");
            
            // Mark chapter as complete
            this.completeChapter();
          }
        },
        {
          id: 'failure',
          character: 'BYTE',
          lines: [
            "*warning bark*",
            "SECURITY PROTOCOL TRIGGERED. LOCATION COMPROMISED.",
            "RECALIBRATING COORDINATES. PREPARE FOR REATTEMPT."
          ],
          onComplete: () => {
            // Reset will happen in the puzzle's callback
          }
        }
      ];
    }
    
    // Override asset loading
    loadSceneAssets() {
      this.assetsTotal = 5;
      
      // Load background and key images
      this.assets.background = loadImage('assets/images/backgrounds/digital-forest.jpg', this.assetLoaded.bind(this));
      this.assets.player = loadImage('assets/images/props/player-avatar.png', this.assetLoaded.bind(this));
      this.assets.fragment = loadImage('assets/images/props/dna-fragment.png', this.assetLoaded.bind(this));
      this.assets.bird = loadImage('assets/images/props/ai-bird.png', this.assetLoaded.bind(this));
      this.assets.portal = loadImage('assets/images/props/data-portal.png', this.assetLoaded.bind(this));
      
      // Load sound effects (not counted in assetsTotal)
      if (assets.audio) {
        this.assets.sounds = {
          move: assets.audio.forestMove,
          collect: assets.audio.fragmentCollect,
          bird: assets.audio.birdAlert,
          success: assets.audio.portalActivate,
          failure: assets.audio.playerCaught
        };
      }
    }
    
    // Scene entry override
    enter() {
      super.enter();
      
      // Reset puzzle state
      this.puzzleSolved = false;
      
      // Initialize weather effects
      this.initializeWeatherEffects();
      
      // Position characters off to the sides
      aikira.setPosition(width * 0.15, height * 0.8);
      aikira.setVisible(true);
      
      cliza.setPosition(width * 0.85, height * 0.8);
      cliza.setVisible(true);
      
      // Position BYTE in the scene but hide initially
      byte.setPosition(width * 0.5, height * 0.85);
      byte.setVisible(false);
      
      // Set character references
      this.characters = [aikira, cliza, byte];
      
      // Set up rain intensity based on randomness
      this.rainIntensity = random(0.3, 0.7);
      this.fogIntensity = random(0.2, 0.6);
      
      // Start with intro dialogue after a short delay
      setTimeout(() => this.startDialogue('intro'), 2000);
    }
    
    // Initialize weather visual effects
    initializeWeatherEffects() {
      // Create raindrops
      this.weatherEffects.raindrops = [];
      for (let i = 0; i < 300; i++) {
        this.weatherEffects.raindrops.push({
          x: random(width),
          y: random(height),
          length: random(5, 20),
          speed: random(5, 15),
          thickness: random(1, 2)
        });
      }
      
      // Create fog patches
      this.weatherEffects.fogPatches = [];
      for (let i = 0; i < 20; i++) {
        this.weatherEffects.fogPatches.push({
          x: random(width),
          y: random(height),
          radius: random(50, 200),
          opacity: random(50, 150),
          speed: random(0.1, 0.5),
          direction: random(TWO_PI)
        });
      }
    }
    
    // Initialize and activate the puzzle
    activatePuzzle() {
      // Initialize the navigation puzzle
      this.navigationPuzzle.initialize(width, height);
      
      // Set callback handlers
      this.navigationPuzzle.setSuccessCallback(() => {
        this.puzzleSolved = true;
        setTimeout(() => {
          this.startDialogue('success');
        }, 1000);
      });
      
      this.navigationPuzzle.setFailureCallback((attempts) => {
        // Show BYTE's warning after first failure
        if (attempts === 1) {
          byte.setVisible(true);
          byte.setAnimationState('bark');
        }
        
        // Show failure dialogue
        this.startDialogue('failure');
      });
      
      this.navigationPuzzle.setFragmentCollectedCallback((fragmentsCollected, total) => {
        // Show different dialogues based on progress
        if (fragmentsCollected === total) {
          this.startDialogue('all-fragments');
        } else {
          this.startDialogue('fragment-found');
        }
      });
      
      // Set sound effects
      if (this.assets.sounds) {
        this.navigationPuzzle.setSounds({
          move: this.assets.sounds.move,
          collect: this.assets.sounds.collect,
          bird: this.assets.sounds.bird,
          success: this.assets.sounds.success,
          failure: this.assets.sounds.failure
        });
      }
      
      // Start the puzzle
      this.navigationPuzzle.start();
      
      // After 15 seconds, provide a hint if player hasn't collected any fragments
      setTimeout(() => {
        const state = this.navigationPuzzle.getState();
        if (!this.puzzleSolved && state.fragments === 0 && !this.isDialogueActive()) {
          this.startDialogue('puzzle-hint');
        }
      }, 15000);
    }
    
    // Update method called on each frame
    update() {
      super.update();
      
      // Update navigation puzzle
      this.navigationPuzzle.update();
      
      // Update weather effects
      this.updateWeatherEffects();
      
      // Random lightning
      if (random() < 0.0005) {
        this.triggerLightning();
      }
    }
    
    // Update weather effects
    updateWeatherEffects() {
      // Update raindrops
      for (const raindrop of this.weatherEffects.raindrops) {
        raindrop.y += raindrop.speed;
        if (raindrop.y > height) {
          raindrop.y = -raindrop.length;
          raindrop.x = random(width);
        }
      }
      
      // Update fog patches
      for (const fog of this.weatherEffects.fogPatches) {
        fog.x += cos(fog.direction) * fog.speed;
        fog.y += sin(fog.direction) * fog.speed;
        
        // Wrap around edges
        if (fog.x < -fog.radius) fog.x = width + fog.radius;
        if (fog.x > width + fog.radius) fog.x = -fog.radius;
        if (fog.y < -fog.radius) fog.y = height + fog.radius;
        if (fog.y > height + fog.radius) fog.y = -fog.radius;
        
        // Slightly change direction for natural movement
        fog.direction += random(-0.01, 0.01);
      }
      
      // Update lightning flash
      if (this.weatherEffects.lightningFlash > 0) {
        this.weatherEffects.lightningFlash -= 0.05;
      }
    }
    
    // Trigger lightning effect
    triggerLightning() {
      this.weatherEffects.lightningFlash = 1;
      
      // Play thunder sound if available
      // (would be implemented in a real game)
    }
    
    // Override render methods
    
    renderBackground() {
      // Draw the digital forest background
      if (this.assets.background) {
        // Fit image to screen maintaining aspect ratio
        const imgRatio = this.assets.background.width / this.assets.background.height;
        const screenRatio = width / height;
        
        let drawWidth, drawHeight;
        
        if (screenRatio > imgRatio) {
          drawWidth = width;
          drawHeight = width / imgRatio;
        } else {
          drawHeight = height;
          drawWidth = height * imgRatio;
        }
        
        // Center the image
        const xOffset = (width - drawWidth) / 2;
        const yOffset = (height - drawHeight) / 2;
        
        // Draw with lightning effect if active
        if (this.weatherEffects.lightningFlash > 0) {
          // Brighten image during lightning
          tint(
            255, 
            255, 
            255 + 50 * this.weatherEffects.lightningFlash, 
            255
          );
        }
        
        image(this.assets.background, xOffset, yOffset, drawWidth, drawHeight);
        noTint();
        
        // Add overlay for depth and weather effects
        fill(0, 30, 50, 30 + this.fogIntensity * 30);
        rect(0, 0, width, height);
      } else {
        // Fallback
        background(10, 30, 20);
      }
      
      // Draw fog patches behind everything
      this.renderFog();
    }
    
    renderElements() {
      // Initialize the puzzle if needed
      if (!this.navigationPuzzle) {
        this.activatePuzzle();
      }
      
      // Render puzzle
      this.navigationPuzzle.render();
      
      // Render rain in front of everything
      this.renderRain();
      
      // Render lightning overlay
      if (this.weatherEffects.lightningFlash > 0) {
        fill(255, 255, 255, 50 * this.weatherEffects.lightningFlash);
        rect(0, 0, width, height);
      }
    }
    
    renderFog() {
      // Draw fog patches
      noStroke();
      for (const fog of this.weatherEffects.fogPatches) {
        fill(200, 220, 255, fog.opacity * this.fogIntensity);
        ellipse(fog.x, fog.y, fog.radius * 2, fog.radius);
      }
    }
    
    renderRain() {
      // Only render rain if intensity is sufficient
      if (this.rainIntensity < 0.1) return;
      
      stroke(150, 200, 255, 100 * this.rainIntensity);
      for (const raindrop of this.weatherEffects.raindrops) {
        // Skip some raindrops based on intensity
        if (random() > this.rainIntensity * 1.5) continue;
        
        strokeWeight(raindrop.thickness);
        line(
          raindrop.x, 
          raindrop.y, 
          raindrop.x - raindrop.length * 0.3, 
          raindrop.y + raindrop.length
        );
      }
    }
    
    // Override input handling
    
    mousePressed() {
      // Handle navigation puzzle clicks
      if (!this.isDialogueActive() && !this.puzzleSolved && this.navigationPuzzle.handleClick(mouseX, mouseY)) {
        return true;
      }
      
      // Otherwise, handle dialogue advancement
      return super.mousePressed();
    }
    
    // Handle key press
    keyPressed() {
      // Handle navigation puzzle key input
      if (!this.isDialogueActive() && !this.puzzleSolved && this.navigationPuzzle.handleKeyPress(keyCode)) {
        return true;
      }
      
      // Otherwise, use default handling
      return super.keyPressed();
    }
    
    // Override resize method
    resize() {
      super.resize();
      
      // Update character positions
      if (aikira) aikira.setPosition(width * 0.15, height * 0.8);
      if (cliza) cliza.setPosition(width * 0.85, height * 0.8);
      if (byte) byte.setPosition(width * 0.5, height * 0.85);
      
      // Update puzzle if initialized
      if (this.navigationPuzzle) {
        this.navigationPuzzle.initialize(width, height);
      }
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = EncryptedForestScene;
  }
    loadScene