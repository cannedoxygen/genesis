/**
 * AIKIRA: GENESIS PROTOCOL
 * Chapter 2 - Mammoth Shrine Scene
 * 
 * Scene description: Shrine with baby mammoth statues and a glowing egg
 * Puzzle: Memory sequence (match glyph tones)
 * Clue Reward: "Protocol fragment unlocked: EXODUS 2"
 */

class MammothShrineScene extends BaseScene {
    constructor() {
      super('chapter2', 'Mammoth Shrine');
      
      // Memory puzzle instance
      this.memoryPuzzle = new MemorySequence();
      this.puzzleSolved = false;
      
      // Glyph positions for the memory puzzle
      this.glyphPositions = [];
      
      // Mammoth shrine elements
      this.mammothStatues = [];
      this.eggPosition = { x: 0, y: 0 };
      this.eggSize = 0;
      this.eggGlow = 0;
      
      // Visual effects
      this.bgParticles = [];
      
      // Dialogue data
      this.dialogues = [
        {
          id: 'intro',
          character: 'AIKIRA',
          lines: [
            "Mammoth Shrine sequence initialized.",
            "Protocol signal detected from recent memetic disturbance.",
            "Decrypt the memory pattern to access fragment data."
          ],
          onComplete: () => {
            setTimeout(() => this.startDialogue('cliza-intro'), 1000);
          }
        },
        {
          id: 'cliza-intro',
          character: 'CLIZA',
          lines: [
            "Fascinating! The Mammoth revival signals were just a distraction.",
            "What we're seeing are memory fragments from MUCH earlier...",
            "These tones represent an ancient harmonic sequence. We need to repeat the pattern."
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
            "TONE SEQUENCE CHALLENGE INITIATED.",
            "MEMORY FAILURE WILL BE LOGGED."
          ]
        },
        {
          id: 'puzzle-hint',
          character: 'CLIZA',
          lines: [
            "The shrine responds to the correct sequence of tones.",
            "Watch the pattern carefully and then repeat it!",
            "Each glyph has a unique tone and color signature."
          ]
        },
        {
          id: 'success',
          character: 'AIKIRA',
          lines: [
            "Correct sequence detected. Memory pattern validated.",
            "Clue unlocked: 'PROTOCOL FRAGMENT UNLOCKED: EXODUS 2'",
            "Preparing transition to next sequence node..."
          ],
          onComplete: () => {
            // Store the clue in game state
            gameState.cluesCollected.push("PROTOCOL FRAGMENT UNLOCKED: EXODUS 2");
            
            // Mark chapter as complete
            this.completeChapter();
          }
        },
        {
          id: 'failure',
          character: 'BYTE',
          lines: [
            "*frustrated bark*",
            "MEMORY SEQUENCE ERROR. RESETTING PATTERN.",
            "REPEAT SEQUENCE CORRECTLY, AGENT."
          ],
          onComplete: () => {
            // Restart the puzzle
            this.memoryPuzzle.reset();
            setTimeout(() => {
              this.memoryPuzzle.startPuzzle();
            }, 1000);
          }
        }
      ];
    }
    
    // Override asset loading
    loadSceneAssets() {
      this.assetsTotal = 7; // Background + 5 glyphs + egg
      
      // Load background
      this.assets.background = loadImage('assets/images/backgrounds/mammoth-shrine.jpg', this.assetLoaded.bind(this));
      
      // Load glyph images
      this.assets.glyphs = {
        glyph1: loadImage('assets/images/glyphs/mammoth-glyph1.png', this.assetLoaded.bind(this)),
        glyph2: loadImage('assets/images/glyphs/mammoth-glyph2.png', this.assetLoaded.bind(this)),
        glyph3: loadImage('assets/images/glyphs/mammoth-glyph3.png', this.assetLoaded.bind(this)),
        glyph4: loadImage('assets/images/glyphs/mammoth-glyph4.png', this.assetLoaded.bind(this)),
        glyph5: loadImage('assets/images/glyphs/mammoth-glyph5.png', this.assetLoaded.bind(this))
      };
      
      // Load egg image
      this.assets.egg = loadImage('assets/images/props/glowing-egg.png', this.assetLoaded.bind(this));
      
      // Load sound effects (not counted in assetsTotal)
      if (assets.audio) {
        this.assets.sounds = {
          tone1: assets.audio.mammothTone1,
          tone2: assets.audio.mammothTone2,
          tone3: assets.audio.mammothTone3,
          tone4: assets.audio.mammothTone4,
          tone5: assets.audio.mammothTone5,
          success: assets.audio.puzzleSuccess,
          failure: assets.audio.puzzleFailure
        };
      }
    }
    
    // Scene entry override
    enter() {
      super.enter();
      
      // Reset puzzle state
      this.puzzleSolved = false;
      
      // Initialize Aikira, Cliza and BYTE for this scene
      this.characters = [aikira, cliza, byte];
      
      // Position characters
      aikira.setPosition(width * 0.15, height * 0.6);
      aikira.setVisible(true);
      
      cliza.setPosition(width * 0.85, height * 0.6);
      cliza.setVisible(true);
      
      // Position BYTE in the scene but hide initially
      byte.setPosition(width * 0.5, height * 0.75);
      byte.setVisible(false);
      
      // Initialize mammoth statues and egg
      this.initializeSceneElements();
      
      // Initialize particle effects
      this.initializeParticles();
      
      // Start with intro dialogue after a short delay
      setTimeout(() => this.startDialogue('intro'), 2000);
    }
    
    // Initialize scene elements
    initializeSceneElements() {
      // Create mammoth statues in a circle around the egg
      this.mammothStatues = [];
      const statueCount = 5;
      
      for (let i = 0; i < statueCount; i++) {
        const angle = (TWO_PI / statueCount) * i - PI/2;
        const radius = min(width, height) * 0.25;
        
        this.mammothStatues.push({
          x: width * 0.5 + cos(angle) * radius,
          y: height * 0.45 + sin(angle) * radius,
          rotation: angle + PI,
          size: min(width, height) * 0.1,
          pulse: 0,
          active: false,
          index: i
        });
      }
      
      // Position the egg in the center
      this.eggPosition = { x: width * 0.5, y: height * 0.45 };
      this.eggSize = min(width, height) * 0.15;
      this.eggGlow = 0;
      
      // Initialize glyph positions for memory puzzle
      this.glyphPositions = [];
      
      // Position the glyphs on the statues
      for (let i = 0; i < statueCount; i++) {
        const statue = this.mammothStatues[i];
        
        this.glyphPositions.push({
          id: i,
          type: `glyph${i+1}`,
          x: statue.x,
          y: statue.y - statue.size * 0.5,
          size: statue.size * 1.5,
          color: color(
            i === 0 ? 0 : (i === 1 ? 200 : (i === 2 ? 100 : (i === 3 ? 255 : 150))),
            i === 0 ? 200 : (i === 1 ? 0 : (i === 2 ? 255 : (i === 3 ? 150 : 0))),
            i === 0 ? 255 : (i === 1 ? 200 : (i === 2 ? 0 : (i === 3 ? 0 : 255)))
          )
        });
      }
    }
    
    // Initialize particle effects
    initializeParticles() {
      this.bgParticles = [];
      
      // Create ambient particles
      for (let i = 0; i < 50; i++) {
        this.bgParticles.push({
          x: random(width),
          y: random(height),
          size: random(2, 6),
          speed: random(0.5, 2),
          angle: random(TWO_PI),
          color: color(200, 200, 255, random(50, 150))
        });
      }
    }
    
    // Initialize and activate the puzzle
    activatePuzzle() {
      // Initialize the memory sequence puzzle
      this.memoryPuzzle.initialize(this.glyphPositions, 5);
      
      // Set callback handlers
      this.memoryPuzzle.setSuccessCallback(() => {
        this.puzzleSolved = true;
        this.startDialogue('success');
        
        // Animate egg
        this.activateEgg();
      });
      
      this.memoryPuzzle.setFailureCallback((attempts) => {
        // After 2 failed attempts, bring in BYTE to warn the player
        if (attempts >= 2 && !byte.visible) {
          byte.setVisible(true);
          this.startDialogue('byte-warning');
        } else {
          this.startDialogue('failure');
        }
      });
      
      this.memoryPuzzle.setGlyphActivatedCallback((glyphId) => {
        // Activate corresponding mammoth statue
        if (glyphId >= 0 && glyphId < this.mammothStatues.length) {
          this.activateStatue(glyphId);
        }
      });
      
      // Set sound effects
      if (this.assets.sounds) {
        this.memoryPuzzle.setSounds({
          tones: [
            this.assets.sounds.tone1,
            this.assets.sounds.tone2,
            this.assets.sounds.tone3,
            this.assets.sounds.tone4,
            this.assets.sounds.tone5
          ],
          success: this.assets.sounds.success,
          failure: this.assets.sounds.failure
        });
      }
      
      // After a short delay, start the puzzle
      setTimeout(() => {
        this.memoryPuzzle.startPuzzle();
      }, 1500);
      
      // After 10 seconds, provide a hint if player is struggling
      setTimeout(() => {
        if (!this.puzzleSolved && !this.isDialogueActive()) {
          this.startDialogue('puzzle-hint');
        }
      }, 10000);
    }
    
    // Activate a mammoth statue
    activateStatue(index) {
      if (index >= 0 && index < this.mammothStatues.length) {
        const statue = this.mammothStatues[index];
        statue.active = true;
        statue.pulse = 1;
        
        // Reset after a delay
        setTimeout(() => {
          statue.active = false;
        }, 800);
      }
    }
    
    // Activate the egg when puzzle is solved
    activateEgg() {
      // Animate egg glow
      const eggAnimation = setInterval(() => {
        this.eggGlow += 0.05;
        
        if (this.eggGlow >= 1) {
          clearInterval(eggAnimation);
          
          // Create bright flash
          this.createFlashEffect();
        }
      }, 50);
      
      // Activate all mammoth statues
      for (let i = 0; i < this.mammothStatues.length; i++) {
        this.activateStatue(i);
      }
    }
    
    // Create flash effect when egg activates
    createFlashEffect() {
      // Create bright flash particles around egg
      for (let i = 0; i < 30; i++) {
        const angle = random(TWO_PI);
        const speed = random(2, 10);
        
        this.bgParticles.push({
          x: this.eggPosition.x,
          y: this.eggPosition.y,
          size: random(5, 15),
          speed: speed,
          angle: angle,
          color: color(200, 255, 255, 200),
          life: 60, // frames
          maxLife: 60
        });
      }
    }
    
    // Update method called on each frame
    update() {
      super.update();
      
      // Update memory puzzle
      this.memoryPuzzle.update();
      
      // Update statue pulses
      for (const statue of this.mammothStatues) {
        if (statue.active) {
          statue.pulse = min(1, statue.pulse + 0.1);
        } else {
          statue.pulse = max(0, statue.pulse - 0.05);
        }
      }
      
      // Update egg glow animation if solved
      if (this.puzzleSolved) {
        this.eggGlow = min(1, this.eggGlow + 0.002);
      }
      
      // Update particles
      this.updateParticles();
    }
    
    // Update particle effects
    updateParticles() {
      for (let i = this.bgParticles.length - 1; i >= 0; i--) {
        const p = this.bgParticles[i];
        
        // Move particle
        p.x += cos(p.angle) * p.speed;
        p.y += sin(p.angle) * p.speed;
        
        // Update life if present
        if (p.life !== undefined) {
          p.life--;
          
          // Remove dead particles
          if (p.life <= 0) {
            this.bgParticles.splice(i, 1);
            continue;
          }
        }
        
        // Wrap around edges for ambient particles
        if (p.life === undefined) {
          if (p.x < 0) p.x += width;
          if (p.x > width) p.x -= width;
          if (p.y < 0) p.y += height;
          if (p.y > height) p.y -= height;
        }
      }
    }
    
    // Override render methods
    
    renderBackground() {
      // Draw the mammoth shrine background
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
        fill(20, 20, 50, 30);
        rect(0, 0, width, height);
      } else {
        // Fallback
        background(20, 15, 40);
      }
      
      // Draw particles behind scene elements
      this.renderParticles();
    }
    
    renderElements() {
      // Draw scene elements in order
      this.renderMammothStatues();
      this.renderEgg();
      
      // Render memory puzzle
      this.memoryPuzzle.render();
    }
    
    renderParticles() {
      // Render background particles
      for (const p of this.bgParticles) {
        // Calculate alpha based on life if present
        let alpha = 255;
        if (p.life !== undefined && p.maxLife !== undefined) {
          alpha = map(p.life, 0, p.maxLife, 0, 255);
        }
        
        noStroke();
        fill(red(p.color), green(p.color), blue(p.color), alpha);
        ellipse(p.x, p.y, p.size, p.size);
      }
    }
    
    renderMammothStatues() {
      // Draw each mammoth statue
      for (const statue of this.mammothStatues) {
        push();
        translate(statue.x, statue.y);
        rotate(statue.rotation);
        
        // Draw statue base
        fill(60, 50, 40);
        noStroke();
        rect(-statue.size * 0.3, 0, statue.size * 0.6, statue.size * 0.3, 5);
        
        // Draw mammoth shape
        if (statue.active || statue.pulse > 0) {
          // Active statue glows
          const pulseAmount = statue.pulse;
          fill(200 + 55 * pulseAmount, 180 + 75 * pulseAmount, 50 + 150 * pulseAmount);
          
          // Add glow effect
          drawingContext.shadowBlur = 20 * pulseAmount;
          drawingContext.shadowColor = color(255, 200, 100, 200 * pulseAmount);
        } else {
          // Inactive statue
          fill(120, 100, 80);
        }
        
        // Draw mammoth body
        ellipse(0, -statue.size * 0.2, statue.size * 0.5, statue.size * 0.4);
        
        // Draw head
        ellipse(statue.size * 0.2, -statue.size * 0.4, statue.size * 0.3, statue.size * 0.25);
        
        // Draw trunk
        noFill();
        stroke(statue.active ? color(255, 220, 150) : color(100, 80, 60));
        strokeWeight(statue.size * 0.08);
        bezier(
          statue.size * 0.3, -statue.size * 0.4,
          statue.size * 0.5, -statue.size * 0.5,
          statue.size * 0.5, -statue.size * 0.2,
          statue.size * 0.4, -statue.size * 0.1
        );
        
        // Draw tusks
        stroke(statue.active ? color(255, 255, 200) : color(220, 210, 180));
        strokeWeight(statue.size * 0.06);
        line(
          statue.size * 0.25, -statue.size * 0.35,
          statue.size * 0.4, -statue.size * 0.2
        );
        
        // Reset shadow
        drawingContext.shadowBlur = 0;
        
        pop();
      }
    }
    
    renderEgg() {
      // Draw the glowing egg in the center
      push();
      translate(this.eggPosition.x, this.eggPosition.y);
      
      // Draw egg glow
      if (this.eggGlow > 0) {
        const glowSize = this.eggSize * (1 + this.eggGlow);
        const glowIntensity = this.eggGlow * 255;
        
        // Egg glow
        drawingContext.shadowBlur = 30 * this.eggGlow;
        drawingContext.shadowColor = color(200, 255, 255, 200 * this.eggGlow);
        
        noStroke();
        fill(200, 255, 255, 100 * this.eggGlow);
        ellipse(0, 0, glowSize, glowSize);
      }
      
      // Draw egg image if available
      if (this.assets.egg) {
        imageMode(CENTER);
        image(this.assets.egg, 0, 0, this.eggSize, this.eggSize * 1.2);
      } else {
        // Fallback egg shape
        fill(220, 210, 180);
        noStroke();
        ellipse(0, 0, this.eggSize * 0.7, this.eggSize);
      }
      
      // Reset shadow
      drawingContext.shadowBlur = 0;
      
      pop();
    }
    
    // Override input handling
    
    mousePressed() {
      // Handle memory puzzle interaction
      if (!this.isDialogueActive() && !this.puzzleSolved && this.memoryPuzzle.handleClick(mouseX, mouseY)) {
        return true;
      }
      
      // Otherwise, handle dialogue advancement
      return super.mousePressed();
    }
    
    mouseMoved() {
      // Update memory puzzle hover state
      if (!this.puzzleSolved) {
        this.memoryPuzzle.checkHover(mouseX, mouseY);
      }
      
      // Call parent method
      super.mouseMoved();
    }
    
    // Override resize method
    resize() {
      super.resize();
      
      // Update positions based on new screen size
      this.initializeSceneElements();
      
      // Update character positions
      if (aikira) aikira.setPosition(width * 0.15, height * 0.6);
      if (cliza) cliza.setPosition(width * 0.85, height * 0.6);
      if (byte) byte.setPosition(width * 0.5, height * 0.75);
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = MammothShrineScene;
  }