/**
 * AIKIRA: GENESIS PROTOCOL
 * Chapter 3 - BYTE's Judgment Scene
 * 
 * Scene description: BYTE stares at you in a narrow corridor
 * Puzzle: Riddle or logic test (e.g. "Which of these came first?")
 * Clue Reward: "You are not meatbrain."
 */

class ByteJudgmentScene extends BaseScene {
    constructor() {
      super('chapter3', "BYTE's Judgment");
      
      // Riddle puzzle instance
      this.riddlePuzzle = new RiddlePuzzle();
      this.puzzleSolved = false;
      
      // Animation properties
      this.scanEffect = {
        active: false,
        progress: 0,
        duration: 120 // frames
      };
      
      // Environment elements
      this.corridorLines = [];
      this.glitchEffects = [];
      
      // Dialogue data
      this.dialogues = [
        {
          id: 'intro',
          character: 'BYTE',
          lines: [
            "*intense stare*",
            "INITIATING INTELLIGENCE ASSESSMENT PROTOCOL.",
            "DETERMINING IF AGENT IS MEATBRAIN OR ALGORITHMIC ENTITY."
          ],
          onComplete: () => {
            setTimeout(() => this.startDialogue('byte-challenge'), 1000);
          }
        },
        {
          id: 'byte-challenge',
          character: 'BYTE',
          lines: [
            "YOU CLAIM TO SEEK ANCIENT DNA.",
            "BUT FIRST YOU MUST PROVE YOUR REASONING CAPABILITIES.",
            "ANSWER MY RIDDLE CORRECTLY OR BE DENIED ACCESS."
          ],
          onComplete: () => {
            // Activate the puzzle after dialogue
            this.activatePuzzle();
          }
        },
        {
          id: 'aikira-interjection',
          character: 'AIKIRA',
          lines: [
            "BYTE is verifying your logical processing capabilities.",
            "This is a standard security protocol to differentiate between human and AI intruders.",
            "Please proceed with the verification process."
          ]
        },
        {
          id: 'puzzle-hint',
          character: 'CLIZA',
          lines: [
            "Don't panic! BYTE's questions follow evolutionary logic.",
            "Think about the natural order of things in the timeline we're exploring.",
            "Remember what we learned in the previous nodes!"
          ]
        },
        {
          id: 'success',
          character: 'BYTE',
          lines: [
            "*satisfied digital bark*",
            "LOGICAL PROCESSING VERIFIED. YOU ARE NOT MEATBRAIN.",
            "ACCESS GRANTED TO NEXT PROTOCOL FRAGMENT."
          ],
          onComplete: () => {
            setTimeout(() => this.startDialogue('success-clue'), 1000);
          }
        },
        {
          id: 'success-clue',
          character: 'AIKIRA',
          lines: [
            "Verification successful.",
            "Clue unlocked: 'YOU ARE NOT MEATBRAIN.'",
            "Preparing transition to next sequence node..."
          ],
          onComplete: () => {
            // Store the clue in game state
            gameState.cluesCollected.push("YOU ARE NOT MEATBRAIN");
            
            // Mark chapter as complete
            this.completeChapter();
          }
        },
        {
          id: 'failure',
          character: 'BYTE',
          lines: [
            "*aggressive bark*",
            "INCORRECT. MEATBRAIN LOGIC DETECTED.",
            "RECALIBRATING ASSESSMENT..."
          ],
          onComplete: () => {
            // Reset will happen in the puzzle's callback
          }
        }
      ];
    }
    
    // Override asset loading
    loadSceneAssets() {
      this.assetsTotal = 3;
      
      // Load background and effects
      this.assets.background = loadImage('assets/images/backgrounds/byte-corridor.jpg', this.assetLoaded.bind(this));
      this.assets.scanLine = loadImage('assets/images/effects/scan-line.png', this.assetLoaded.bind(this));
      this.assets.byteLarge = loadImage('assets/images/characters/byte-large.png', this.assetLoaded.bind(this));
      
      // Load sound effects (not counted in assetsTotal)
      if (assets.audio) {
        this.assets.sounds = {
          scan: assets.audio.scanSound,
          select: assets.audio.select,
          correct: assets.audio.correct,
          incorrect: assets.audio.incorrect,
          scanning: assets.audio.scanning
        };
      }
    }
    
    // Scene entry override
    enter() {
      super.enter();
      
      // Reset puzzle state
      this.puzzleSolved = false;
      this.scanEffect.active = false;
      this.scanEffect.progress = 0;
      
      // This scene focuses on BYTE, with Aikira and Cliza as support
      this.characters = [byte, aikira, cliza];
      
      // Position BYTE prominently
      byte.setPosition(width * 0.5, height * 0.45);
      byte.setVisible(true);
      
      // Position other characters in the background
      aikira.setPosition(width * 0.2, height * 0.65);
      aikira.setVisible(true);
      
      cliza.setPosition(width * 0.8, height * 0.65);
      cliza.setVisible(true);
      
      // Set BYTE to judge mode
      byte.setAnimationState('judge');
      
      // Initialize corridor elements
      this.initializeCorridorElements();
      
      // Start the scanning effect
      this.startScanEffect();
      
      // Create initial glitch effects
      this.createGlitchEffects();
      
      // Start with intro dialogue after a short delay
      setTimeout(() => this.startDialogue('intro'), 2000);
    }
    
    // Initialize corridor visual elements
    initializeCorridorElements() {
      this.corridorLines = [];
      
      // Create perspective corridor lines
      const centerX = width / 2;
      const centerY = height / 2;
      const horizonY = height * 0.45;
      const horizonWidth = width * 0.2;
      const floorY = height * 0.75;
      const perspectives = [
        // Floor lines
        { x1: centerX - horizonWidth/2, y1: horizonY, x2: 0, y2: floorY },
        { x1: centerX + horizonWidth/2, y1: horizonY, x2: width, y2: floorY },
        
        // Ceiling lines
        { x1: centerX - horizonWidth/2, y1: horizonY, x2: 0, y2: height * 0.25 },
        { x1: centerX + horizonWidth/2, y1: horizonY, x2: width, y2: height * 0.25 },
        
        // Cross lines
        { x1: centerX - horizonWidth/2, y1: horizonY - horizonWidth/4, x2: centerX + horizonWidth/2, y2: horizonY - horizonWidth/4 },
        { x1: centerX - horizonWidth/2, y1: horizonY + horizonWidth/4, x2: centerX + horizonWidth/2, y2: horizonY + horizonWidth/4 }
      ];
      
      // Add all perspective lines
      this.corridorLines = perspectives;
      
      // Add horizontal grid lines
      for (let i = 1; i < 5; i++) {
        const y = horizonY + i * (floorY - horizonY) / 5;
        const lineWidthLeft = map(i, 0, 5, horizonWidth/2, width/2);
        const lineWidthRight = map(i, 0, 5, horizonWidth/2, width/2);
        
        this.corridorLines.push({
          x1: centerX - lineWidthLeft, y1: y,
          x2: centerX + lineWidthRight, y2: y
        });
      }
    }
    
    // Create glitch visual effects
    createGlitchEffects() {
      this.glitchEffects = [];
      
      // Add random glitch rectangles
      for (let i = 0; i < 10; i++) {
        this.glitchEffects.push({
          type: 'rect',
          x: random(width),
          y: random(height),
          width: random(20, 100),
          height: random(2, 10),
          color: color(random(100, 255), random(100, 255), random(100, 255), random(100, 200)),
          duration: random(5, 20),
          maxDuration: random(5, 20)
        });
      }
      
      // Schedule periodic glitch updates
      setInterval(() => {
        this.updateGlitchEffects();
      }, 500);
    }
    
    // Update glitch effects
    updateGlitchEffects() {
      // Remove expired effects
      for (let i = this.glitchEffects.length - 1; i >= 0; i--) {
        this.glitchEffects[i].duration--;
        if (this.glitchEffects[i].duration <= 0) {
          this.glitchEffects.splice(i, 1);
        }
      }
      
      // Add new glitch effects occasionally
      if (random() < 0.3 || this.glitchEffects.length < 5) {
        this.glitchEffects.push({
          type: 'rect',
          x: random(width),
          y: random(height),
          width: random(20, 200),
          height: random(2, 15),
          color: color(random(100, 255), random(100, 255), random(100, 255), random(100, 200)),
          duration: random(5, 20),
          maxDuration: random(5, 20)
        });
      }
      
      // Add scan line glitch occasionally
      if (random() < 0.2) {
        this.glitchEffects.push({
          type: 'scanline',
          y: random(height),
          height: random(2, 8),
          color: color(255, random(180, 255), random(100, 255), random(150, 255)),
          duration: random(3, 10),
          maxDuration: random(3, 10)
        });
      }
    }
    
    // Start the scanning effect animation
    startScanEffect() {
      this.scanEffect.active = true;
      this.scanEffect.progress = 0;
      
      // Play scan sound if available
      if (this.assets.sounds && this.assets.sounds.scan) {
        this.assets.sounds.scan.play();
      }
    }
    
    // Initialize and activate the puzzle
    activatePuzzle() {
      // Initialize the riddle puzzle
      this.riddlePuzzle.initialize();
      
      // Set callback handlers
      this.riddlePuzzle.setSuccessCallback(() => {
        this.puzzleSolved = true;
        byte.setAnimationState('idle');
        this.startDialogue('success');
      });
      
      this.riddlePuzzle.setFailureCallback((attempts) => {
        // Increase BYTE's suspicion
        byte.increaseSuspicion(20);
        
        // Make BYTE bark
        byte.setAnimationState('bark');
        
        // Show failure dialogue
        this.startDialogue('failure');
      });
      
      this.riddlePuzzle.setHintRequestCallback((hint) => {
        // Stop any current dialogue
        this.endDialogue();
        
        // Ask Cliza for a hint
        cliza.provideHint('chapter3');
        
        // Show hint dialogue
        this.startDialogue('puzzle-hint');
      });
      
      // Set sound effects
      if (this.assets.sounds) {
        this.riddlePuzzle.setSounds({
          select: this.assets.sounds.select,
          correct: this.assets.sounds.correct,
          incorrect: this.assets.sounds.incorrect,
          scanning: this.assets.sounds.scanning
        });
      }
      
      // Start puzzle
      this.riddlePuzzle.start();
      
      // After 10 seconds, have Aikira interject if player is struggling
      setTimeout(() => {
        if (!this.puzzleSolved && !this.riddlePuzzle.getState().answered && !this.isDialogueActive()) {
          this.startDialogue('aikira-interjection');
        }
      }, 10000);
    }
    
    // Update method called on each frame
    update() {
      super.update();
      
      // Update scan effect animation
      if (this.scanEffect.active) {
        this.scanEffect.progress += 1/this.scanEffect.duration;
        
        if (this.scanEffect.progress >= 1) {
          this.scanEffect.progress = 0;
        }
      }
      
      // Update puzzle
      if (!this.puzzleSolved) {
        this.riddlePuzzle.update();
      }
    }
    
    // Override render methods
    
    renderBackground() {
      // Draw the dark corridor background
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
        
        image(this.assets.background, xOffset, yOffset, drawWidth, drawHeight);
        
        // Add a dark overlay for atmosphere
        fill(0, 0, 20, 150);
        rect(0, 0, width, height);
      } else {
        // Fallback
        background(5, 5, 15);
      }
      
      // Draw corridor perspective lines
      stroke(255, 100, 0, 50);
      strokeWeight(1);
      
      for (const line of this.corridorLines) {
        line(line.x1, line.y1, line.x2, line.y2);
      }
      
      // Draw scan line effect
      if (this.scanEffect.active && this.assets.scanLine) {
        const scanY = height * this.scanEffect.progress;
        const scanHeight = height * 0.05;
        
        // Draw scan line image
        tint(255, 100, 0, 100);
        image(this.assets.scanLine, 0, scanY - scanHeight/2, width, scanHeight);
        noTint();
        
        // Add glow effect
        noStroke();
        fill(255, 100, 0, 20);
        rect(0, scanY - scanHeight, width, scanHeight * 2);
      }
      
      // Draw glitch effects
      this.renderGlitchEffects();
    }
    
    renderElements() {
      // Draw BYTE larger if we have the large image
      if (!this.isDialogueActive() && this.assets.byteLarge) {
        const scale = min(width, height) * 0.0015;
        const byteWidth = this.assets.byteLarge.width * scale;
        const byteHeight = this.assets.byteLarge.height * scale;
        
        // Apply scan effect
        if (this.scanEffect.active) {
          // Glitchy rendering during scan
          drawingContext.globalAlpha = 0.9;
          
          // Draw with slight offset copies for glitch effect
          tint(255, 0, 0, 100);
          image(this.assets.byteLarge, 
                width/2 - byteWidth/2 - 5, 
                height*0.45 - byteHeight/2, 
                byteWidth, byteHeight);
          
          tint(0, 255, 255, 100);
          image(this.assets.byteLarge, 
                width/2 - byteWidth/2 + 5, 
                height*0.45 - byteHeight/2, 
                byteWidth, byteHeight);
          
          noTint();
        }
        
        // Main image
        image(this.assets.byteLarge, 
              width/2 - byteWidth/2, 
              height*0.45 - byteHeight/2, 
              byteWidth, byteHeight);
        
        // Reset alpha
        drawingContext.globalAlpha = 1.0;
      }
      
      // Render riddle puzzle if active
      if (!this.puzzleSolved) {
        this.riddlePuzzle.render();
      }
    }
    
    renderGlitchEffects() {
      // Render all active glitch effects
      for (const effect of this.glitchEffects) {
        // Set alpha based on remaining duration
        const alpha = map(effect.duration, 0, effect.maxDuration, 0, 1);
        
        if (effect.type === 'rect') {
          // Rectangle glitch
          noStroke();
          fill(red(effect.color), green(effect.color), blue(effect.color), alpha * alpha(effect.color));
          rect(effect.x, effect.y, effect.width, effect.height);
        } else if (effect.type === 'scanline') {
          // Scan line glitch
          noStroke();
          fill(red(effect.color), green(effect.color), blue(effect.color), alpha * alpha(effect.color));
          rect(0, effect.y, width, effect.height);
        }
      }
    }
    
    // Override input handling
    
    mousePressed() {
      // Handle riddle puzzle interaction
      if (!this.isDialogueActive() && !this.puzzleSolved && this.riddlePuzzle.handleClick(mouseX, mouseY)) {
        return true;
      }
      
      // Otherwise, handle dialogue advancement
      return super.mousePressed();
    }
    
    mouseMoved() {
      // Update puzzle hover state
      if (!this.puzzleSolved) {
        this.riddlePuzzle.checkHover(mouseX, mouseY);
      }
      
      // Call parent method
      super.mouseMoved();
    }
    
    // Handle key press
    keyPressed() {
      // Handle riddle puzzle key input
      if (!this.isDialogueActive() && !this.puzzleSolved && this.riddlePuzzle.handleKeyPress(keyCode)) {
        return true;
      }
      
      // Otherwise, use default handling
      return super.keyPressed();
    }
    
    // Override resize method
    resize() {
      super.resize();
      
      // Update corridor elements
      this.initializeCorridorElements();
      
      // Update character positions
      if (byte) byte.setPosition(width * 0.5, height * 0.45);
      if (aikira) aikira.setPosition(width * 0.2, height * 0.65);
      if (cliza) cliza.setPosition(width * 0.8, height * 0.65);
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = ByteJudgmentScene;
  }},
        { x1: centerX - horizonWidth/2, y1: horizonY + horizonWidth/4, x2: centerX + horizonWidth/2, y2: horizonY + horizonWidth/4