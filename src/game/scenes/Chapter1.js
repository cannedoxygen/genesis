/**
 * AIKIRA: GENESIS PROTOCOL
 * Chapter 1 - Cryptic Wall Scene
 * 
 * Scene description: Digital tomb with glowing glyphs
 * Puzzle: Hover/click specific symbols in correct order
 * Clue Reward: "They came before the wolves"
 */

class CrypticWallScene extends BaseScene {
    constructor() {
      super('chapter1', 'Cryptic Wall');
      
      // Symbol sequence for the puzzle
      this.correctSequence = ['dna', 'egg', 'claw', 'eye', 'star'];
      this.userSequence = [];
      this.symbols = [];
      this.puzzleSolved = false;
      
      // State for glyph animation
      this.glyphPulse = 0;
      this.activationTime = 0;
      
      // Dialogue data
      this.dialogues = [
        {
          id: 'intro',
          character: 'AIKIRA',
          lines: [
            "System reboot sequence initiated. Genesis Protocol awakening...",
            "It's been 65 million years since the last activation.",
            "Scanning for optimal data extraction pathway..."
          ],
          onComplete: () => {
            setTimeout(() => this.startDialogue('cliza-intro'), 1000);
          }
        },
        {
          id: 'cliza-intro',
          character: 'CLIZA',
          lines: [
            "Aikira! We're awake! The signals are aligning just as predicted.",
            "The wolves were just the beginning. Now we must go deeper.",
            "I'm detecting an ancient encryption wall. We'll need to decode it."
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
            "*suspicious growl*",
            "SCANNING USER IDENTITY...",
            "PROCEED WITH CAUTION. WALL CONTAINS PRE-MAMMALIAN SEQUENCE DATA."
          ]
        },
        {
          id: 'puzzle-hint',
          character: 'CLIZA',
          lines: [
            "The wall responds to certain activation patterns.",
            "Look for symbols that pulse with ancient energy.",
            "I believe the sequence relates to evolutionary steps."
          ]
        },
        {
          id: 'success',
          character: 'AIKIRA',
          lines: [
            "Excellent. The first fragment of the Genesis Protocol has been recovered.",
            "Clue unlocked: 'THEY CAME BEFORE THE WOLVES'",
            "Preparing transition to next sequence node..."
          ],
          onComplete: () => {
            // Store the clue in game state
            gameState.cluesCollected.push("THEY CAME BEFORE THE WOLVES");
            
            // Mark chapter as complete
            this.completeChapter();
          }
        },
        {
          id: 'failure',
          character: 'BYTE',
          lines: [
            "*aggressive bark*",
            "SEQUENCE CORRUPTION DETECTED. RESET REQUIRED.",
            "TRY AGAIN, AGENT."
          ],
          onComplete: () => {
            // Reset the user's sequence
            this.userSequence = [];
            
            // Make symbols clickable again
            this.symbols.forEach(symbol => {
              symbol.activated = false;
              symbol.clickable = true;
            });
          }
        }
      ];
    }
    
    // Override asset loading
    loadSceneAssets() {
      this.assetsTotal = 6; // Background + 5 symbols
      
      // Load background
      this.assets.background = loadImage('assets/images/backgrounds/cryptic-wall.jpg', this.assetLoaded.bind(this));
      
      // Load symbol images
      this.assets.symbols = {
        dna: loadImage('assets/images/symbols/dna.png', this.assetLoaded.bind(this)),
        egg: loadImage('assets/images/symbols/egg.png', this.assetLoaded.bind(this)),
        claw: loadImage('assets/images/symbols/claw.png', this.assetLoaded.bind(this)),
        eye: loadImage('assets/images/symbols/eye.png', this.assetLoaded.bind(this)),
        star: loadImage('assets/images/symbols/star.png', this.assetLoaded.bind(this))
      };
    }
    
    // Scene entry override
    enter() {
      super.enter();
      
      // Reset puzzle state
      this.puzzleSolved = false;
      this.userSequence = [];
      
      // Initialize Aikira and Cliza for this scene
      this.characters = [aikira, cliza, byte];
      
      // Position BYTE in the scene but hide initially
      byte.setPosition(width * 0.8, height * 0.6);
      byte.setVisible(false);
      
      // Start with intro dialogue after a short delay
      setTimeout(() => this.startDialogue('intro'), 2000);
    }
    
    // Initialize the puzzle
    activatePuzzle() {
      // Create interactive symbols at specific positions
      // Position will be relative to canvas size for responsiveness
      this.symbols = [
        {
          type: 'dna',
          x: width * 0.2,
          y: height * 0.4,
          size: min(width, height) * 0.08,
          activated: false,
          clickable: true,
          pulseOffset: 0,
          isHovered: false,
          
          render: function() {
            push();
            translate(this.x, this.y);
            
            // Pulse effect for unactivated symbols
            let glowAmount = 0;
            if (!this.activated) {
              glowAmount = map(sin(frameCount * 0.05 + this.pulseOffset), -1, 1, 0.5, 1);
            } else {
              glowAmount = 1.2; // Activated symbols glow brighter
            }
            
            // Hover effect
            if (this.isHovered && this.clickable) {
              glowAmount *= 1.3;
            }
            
            // Draw glow effect
            noStroke();
            fill(0, 200, 255, 100 * glowAmount);
            ellipse(0, 0, this.size * 1.5, this.size * 1.5);
            
            // Draw symbol
            imageMode(CENTER);
            tint(255, 255 * glowAmount);
            image(assets.symbols[this.type], 0, 0, this.size, this.size);
            pop();
          },
          
          checkHover: function(mx, my) {
            let d = dist(mx, my, this.x, this.y);
            this.isHovered = d < this.size / 2 && this.clickable;
            return this.isHovered;
          },
          
          onPress: function() {
            if (this.clickable) {
              this.activated = true;
              this.clickable = false;
              userSequence.push(this.type);
              checkSequence();
            }
          }
        },
        // Create other symbols with different positions and pulse offsets
        {
          type: 'egg',
          x: width * 0.4,
          y: height * 0.25,
          size: min(width, height) * 0.07,
          activated: false,
          clickable: true,
          pulseOffset: 1.5,
          isHovered: false,
          // Same render, checkHover, and onPress methods
        },
        {
          type: 'claw',
          x: width * 0.7,
          y: height * 0.3,
          size: min(width, height) * 0.075,
          activated: false,
          clickable: true,
          pulseOffset: 2.7,
          isHovered: false,
          // Same render, checkHover, and onPress methods
        },
        {
          type: 'eye',
          x: width * 0.6,
          y: height * 0.5,
          size: min(width, height) * 0.065,
          activated: false,
          clickable: true,
          pulseOffset: 3.9,
          isHovered: false,
          // Same render, checkHover, and onPress methods
        },
        {
          type: 'star',
          x: width * 0.3,
          y: height * 0.6,
          size: min(width, height) * 0.08,
          activated: false,
          clickable: true,
          pulseOffset: 5.1,
          isHovered: false,
          // Same render, checkHover, and onPress methods
        }
      ];
      
      // Bind the scene's functions to each symbol's methods
      this.symbols.forEach(symbol => {
        symbol.render = symbol.render.bind(this);
        symbol.checkHover = symbol.checkHover.bind(this);
        symbol.onPress = function() {
          if (this.clickable) {
            this.activated = true;
            this.clickable = false;
            
            // Add to user sequence
            self.userSequence.push(this.type);
            
            // Play activation sound
            // playSound('symbol-activate');
            
            // Check if sequence is correct so far
            self.checkSequence();
          }
        }.bind(symbol);
        
        // Different pulse timing for each symbol
        symbol.pulseOffset = random(TWO_PI);
      });
      
      // Add pointer to self for use in symbol bindings
      const self = this;
      
      // After 5 seconds, introduce BYTE if player hasn't started the puzzle
      setTimeout(() => {
        if (this.userSequence.length === 0 && !this.isDialogueActive()) {
          byte.setVisible(true);
          this.startDialogue('byte-warning');
        }
      }, 5000);
      
      // After 15 seconds, provide a hint if player is stuck
      setTimeout(() => {
        if (this.userSequence.length < 2 && !this.isDialogueActive() && !this.puzzleSolved) {
          this.startDialogue('puzzle-hint');
        }
      }, 15000);
    }
    
    // Check if user sequence matches correct sequence so far
    checkSequence() {
      const currentLength = this.userSequence.length;
      
      // Check if current sequence is correct so far
      for (let i = 0; i < currentLength; i++) {
        if (this.userSequence[i] !== this.correctSequence[i]) {
          // Incorrect sequence
          this.startDialogue('failure');
          return;
        }
      }
      
      // If we've completed the full sequence and it's correct
      if (currentLength === this.correctSequence.length) {
        this.puzzleSolved = true;
        
        // Show success dialogue
        this.startDialogue('success');
      }
    }
    
    // Override render methods
    
    renderBackground() {
      // Draw the cryptic wall background
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
        
        // Draw with a slight parallax effect based on mouse position
        const parallaxX = map(mouseX, 0, width, -10, 10);
        const parallaxY = map(mouseY, 0, height, -10, 10);
        
        image(this.assets.background, 
              xOffset + parallaxX, 
              yOffset + parallaxY, 
              drawWidth, 
              drawHeight);
              
        // Add a subtle overlay for depth
        fill(0, 0, 50, 50);
        rect(0, 0, width, height);
      } else {
        // Fallback
        background(10, 5, 30);
      }
      
      // Add ambient particles
      this.renderParticles();
    }
    
    renderElements() {
      // Render symbols
      for (const symbol of this.symbols) {
        if (typeof symbol.render === 'function') {
          symbol.render();
        }
      }
      
      // Render sequence progress indicator
      this.renderSequenceProgress();
    }
    
    renderSequenceProgress() {
      if (this.userSequence.length > 0) {
        // Draw sequence slots at bottom of screen
        const slotWidth = width * 0.7;
        const slotHeight = height * 0.08;
        const startX = width * 0.15;
        const y = height * 0.85;
        
        // Background for slots
        fill(0, 0, 20, 200);
        rect(startX, y, slotWidth, slotHeight, 10);
        
        // Draw slots
        const slotSize = min(slotWidth / this.correctSequence.length * 0.7, slotHeight * 0.7);
        
        for (let i = 0; i < this.correctSequence.length; i++) {
          const x = startX + (slotWidth / this.correctSequence.length) * (i + 0.5);
          
          // Empty slot
          fill(30, 30, 50, 150);
          ellipse(x, y + slotHeight/2, slotSize, slotSize);
          
          // Filled slot
          if (i < this.userSequence.length) {
            // Draw the symbol
            const symbolType = this.userSequence[i];
            if (this.assets.symbols[symbolType]) {
              imageMode(CENTER);
              image(this.assets.symbols[symbolType], x, y + slotHeight/2, slotSize * 0.8, slotSize * 0.8);
            }
          }
        }
      }
    }
    
    renderParticles() {
      // Ambient floating particles for atmosphere
      push();
      noStroke();
      
      // Draw 20 particles with random positions
      for (let i = 0; i < 20; i++) {
        // Use noise for more natural movement
        const t = frameCount * 0.01;
        const x = width * noise(i * 0.1, t);
        const y = height * noise(i * 0.1, t + 100);
        const size = map(noise(i * 0.1, t + 200), 0, 1, 2, 8);
        
        // Particles glow with a cyan/blue hue
        const alpha = map(noise(i * 0.1, t + 300), 0, 1, 100, 200);
        fill(0, 150, 255, alpha);
        ellipse(x, y, size, size);
      }
      
      pop();
    }
    
    // Override resize method
    resize() {
      super.resize();
      
      // Update symbol positions based on new screen size
      if (this.symbols.length > 0) {
        this.symbols[0].x = width * 0.2;
        this.symbols[0].y = height * 0.4;
        
        this.symbols[1].x = width * 0.4;
        this.symbols[1].y = height * 0.25;
        
        this.symbols[2].x = width * 0.7;
        this.symbols[2].y = height * 0.3;
        
        this.symbols[3].x = width * 0.6;
        this.symbols[3].y = height * 0.5;
        
        this.symbols[4].x = width * 0.3;
        this.symbols[4].y = height * 0.6;
        
        // Update symbol sizes
        this.symbols.forEach(symbol => {
          symbol.size = min(width, height) * 0.08;
        });
      }
      
      // Reposition characters
      if (byte) {
        byte.setPosition(width * 0.8, height * 0.6);
      }
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = CrypticWallScene;
  }