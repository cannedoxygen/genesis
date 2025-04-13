/**
 * AIKIRA: GENESIS PROTOCOL
 * Chapter 5 - Genesis Vault Scene
 * 
 * Scene description: High-tech underground vault, glowing dinosaur egg
 * Puzzle: Input collected fragments into a code input system
 * Outcome: Egg unlocks. Cutscene reveals REX-type data fragment
 * Reward: Generate shareable "Genesis NFT"
 */

class GenesisVaultScene extends BaseScene {
    constructor() {
      super('chapter5', 'Genesis Vault');
      
      // Code input puzzle instance
      this.codeInputPuzzle = new CodeInputPuzzle();
      this.puzzleSolved = false;
      
      // Vault environment
      this.vaultElements = {
        egg: {
          x: 0,
          y: 0,
          size: 0,
          rotation: 0,
          glow: 0
        },
        terminals: [],
        dataStreams: [],
        ambientParticles: []
      };
      
      // Animation states
      this.eggUnlocked = false;
      this.revealSequence = false;
      this.revealProgress = 0;
      
      // Dialogue data
      this.dialogues = [
        {
          id: 'intro',
          character: 'AIKIRA',
          lines: [
            "Genesis Vault access granted.",
            "Final protocol layer detected. Security clearance required.",
            "Input DNA fragments to decrypt the Genesis Sequence."
          ],
          onComplete: () => {
            setTimeout(() => this.startDialogue('cliza-intro'), 1000);
          }
        },
        {
          id: 'cliza-intro',
          character: 'CLIZA',
          lines: [
            "This is it! The culmination of all our efforts!",
            "The vault contains the complete dinosaur DNA signature we've been searching for.",
            "Use the clues from each chapter to determine the correct input sequence."
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
            "*intense stare*",
            "FINAL SECURITY BARRIER ACTIVE.",
            "GENESIS EGG WILL RESPOND ONLY TO CORRECT SEQUENCE."
          ]
        },
        {
          id: 'puzzle-hint',
          character: 'CLIZA',
          lines: [
            "Let me help you with this! Remember the clues we've collected:",
            "'They came before the wolves', 'Protocol fragment: EXODUS 2', 'You are not meatbrain', 'DINO. SEQUENCE. LOCATED.'",
            "The code must relate to these somehow... think about what they represent!"
          ]
        },
        {
          id: 'success',
          character: 'AIKIRA',
          lines: [
            "Genesis Sequence unlocked. DNA protocol verified.",
            "REX-type fragment extracted and preserved.",
            "Protocol objective achieved. Well done, Agent."
          ],
          onComplete: () => {
            // Start egg reveal animation
            this.startEggReveal();
          }
        },
        {
          id: 'success-cliza',
          character: 'CLIZA',
          lines: [
            "Incredible! The dinosaur DNA is intact after 65 million years!",
            "This is exactly what we were searching for. The T-Rex genetic signature is complete!",
            "The Genesis Protocol can now be preserved for future generations."
          ],
          onComplete: () => {
            // Continue to BYTE's comments
            setTimeout(() => this.startDialogue('success-byte'), 1000);
          }
        },
        {
          id: 'success-byte',
          character: 'BYTE',
          lines: [
            "*happy bark*",
            "VALIDATION COMPLETE. USER IDENTITY CONFIRMED.",
            "GENESIS PROTOCOL MISSION SUCCESSFUL."
          ],
          onComplete: () => {
            // Complete the chapter
            this.completeChapter();
          }
        },
        {
          id: 'failure',
          character: 'BYTE',
          lines: [
            "*warning bark*",
            "INVALID SEQUENCE DETECTED. ACCESS DENIED.",
            "RETRY WITH CORRECT PROTOCOL FRAGMENTS."
          ]
        },
        {
          id: 'reward',
          character: 'AIKIRA',
          lines: [
            "Your Genesis NFT has been prepared as a record of this achievement.",
            "You may keep it as proof of your success or burn it for $AIKIRA tokens.",
            "Thank you for your service to the Genesis Protocol."
          ],
          onComplete: () => {
            // Transition to NFT reward scene
            setTimeout(() => {
              setScene('nftReward');
            }, 2000);
          }
        }
      ];
    }
    
    // Override asset loading
    loadSceneAssets() {
      this.assetsTotal = 5;
      
      // Load background and effect images
      this.assets.background = loadImage('assets/images/backgrounds/genesis-vault.jpg', this.assetLoaded.bind(this));
      this.assets.egg = loadImage('assets/images/props/dino-egg.png', this.assetLoaded.bind(this));
      this.assets.terminal = loadImage('assets/images/props/terminal.png', this.assetLoaded.bind(this));
      this.assets.glow = loadImage('assets/images/effects/glow.png', this.assetLoaded.bind(this));
      this.assets.dnaHelix = loadImage('assets/images/props/dna-helix.png', this.assetLoaded.bind(this));
      
      // Load sound effects (not counted in assetsTotal)
      if (assets.audio) {
        this.assets.sounds = {
          type: assets.audio.keyboardType,
          select: assets.audio.menuSelect,
          error: assets.audio.errorBeep,
          success: assets.audio.puzzleSuccess,
          bootup: assets.audio.computerBootup
        };
      }
    }
    
    // Scene entry override
    enter() {
      super.enter();
      
      // Reset puzzle state
      this.puzzleSolved = false;
      this.eggUnlocked = false;
      this.revealSequence = false;
      this.revealProgress = 0;
      
      // Initialize characters
      aikira.setPosition(width * 0.2, height * 0.7);
      aikira.setVisible(true);
      
      cliza.setPosition(width * 0.8, height * 0.7);
      cliza.setVisible(true);
      
      byte.setPosition(width * 0.5, height * 0.8);
      byte.setVisible(true);
      
      // Set character references
      this.characters = [aikira, cliza, byte];
      
      // Initialize vault environment
      this.initializeVaultEnvironment();
      
      // Start with intro dialogue after a short delay
      setTimeout(() => this.startDialogue('intro'), 2000);
    }
    
    // Initialize vault environment
    initializeVaultEnvironment() {
      // Position the dinosaur egg
      this.vaultElements.egg = {
        x: width * 0.5,
        y: height * 0.4,
        size: min(width, height) * 0.25,
        rotation: 0,
        glow: 0
      };
      
      // Create terminals around the egg
      this.vaultElements.terminals = [];
      for (let i = 0; i < 3; i++) {
        const angle = map(i, 0, 3, -PI/3, PI/3) - PI/2;
        const radius = min(width, height) * 0.35;
        
        this.vaultElements.terminals.push({
          x: this.vaultElements.egg.x + cos(angle) * radius,
          y: this.vaultElements.egg.y + sin(angle) * radius * 1.2,
          rotation: angle + PI/2,
          size: min(width, height) * 0.12,
          active: false,
          screenFlicker: 0
        });
      }
      
      // Create data streams
      this.vaultElements.dataStreams = [];
      for (let i = 0; i < 5; i++) {
        this.vaultElements.dataStreams.push({
          points: [],
          color: color(0, 150 + random(100), 150 + random(100), 150),
          speed: random(2, 5),
          thickness: random(1, 3)
        });
        
        // Generate stream path
        const points = floor(random(5, 10));
        let x = random(width);
        let y = random(height);
        for (let j = 0; j < points; j++) {
          this.vaultElements.dataStreams[i].points.push({
            x: x,
            y: y
          });
          
          // Next point
          const angle = random(TWO_PI);
          const dist = random(50, 200);
          x += cos(angle) * dist;
          y += sin(angle) * dist;
        }
      }
      
      // Create ambient particles
      this.vaultElements.ambientParticles = [];
      for (let i = 0; i < 50; i++) {
        this.vaultElements.ambientParticles.push({
          x: random(width),
          y: random(height),
          size: random(2, 6),
          speed: random(0.5, 2),
          angle: random(TWO_PI),
          color: color(0, random(100, 255), random(100, 255), random(50, 150))
        });
      }
    }
    
    // Initialize and activate the puzzle
    activatePuzzle() {
      // Initialize the code input puzzle
      this.codeInputPuzzle.initialize(gameState.cluesCollected);
      
      // Set callback handlers
      this.codeInputPuzzle.setSuccessCallback(() => {
        this.puzzleSolved = true;
        this.startDialogue('success');
      });
      
      this.codeInputPuzzle.setFailureCallback((attempts) => {
        // Show failure dialogue
        this.startDialogue('failure');
      });
      
      this.codeInputPuzzle.setCodeEnteredCallback((code, correct) => {
        // Log code attempt
        console.log(`Code entered: ${code}, correct: ${correct}`);
      });
      
      // Set sound effects
      if (this.assets.sounds) {
        this.codeInputPuzzle.setSounds({
          type: this.assets.sounds.type,
          select: this.assets.sounds.select,
          error: this.assets.sounds.error,
          success: this.assets.sounds.success,
          bootup: this.assets.sounds.bootup
        });
      }
      
      // Start puzzle after a brief delay
      setTimeout(() => {
        this.codeInputPuzzle.start();
        
        // Activate terminals
        for (const terminal of this.vaultElements.terminals) {
          terminal.active = true;
        }
      }, 1000);
      
      // Show BYTE's warning about security
      setTimeout(() => {
        if (!this.puzzleSolved && !this.isDialogueActive()) {
          this.startDialogue('byte-warning');
        }
      }, 8000);
      
      // Show hint if player is struggling after a while
      setTimeout(() => {
        if (!this.puzzleSolved && !this.isDialogueActive()) {
          this.startDialogue('puzzle-hint');
        }
      }, 20000);
    }
    
    // Start egg reveal animation
    startEggReveal() {
      this.eggUnlocked = true;
      
      // Start reveal sequence after a delay
      setTimeout(() => {
        this.revealSequence = true;
        
        // Add reveal animation
        const revealAnimation = setInterval(() => {
          this.revealProgress += 0.01;
          
          if (this.revealProgress >= 1) {
            clearInterval(revealAnimation);
            
            // Show final dialogue and completion
            setTimeout(() => {
              this.startDialogue('success-cliza');
            }, 1000);
          }
        }, 50);
      }, 2000);
    }
    
    // Complete the chapter and prepare for NFT reward
    completeChapter() {
      // Mark the chapter as complete
      gameState.puzzlesSolved[4] = true;
      gameState.currentChapter = 6; // Special "completed" state
      
      // Save progress
      saveProgress();
      
      // Show reward dialogue
      setTimeout(() => {
        this.startDialogue('reward');
      }, 2000);
    }
    
    // Update method called on each frame
    update() {
      super.update();
      
      // Update code input puzzle
      this.codeInputPuzzle.update();
      
      // Update egg animation
      if (this.eggUnlocked) {
        this.vaultElements.egg.glow = min(1, this.vaultElements.egg.glow + 0.02);
        this.vaultElements.egg.rotation += 0.005;
      }
      
      // Update terminals
      for (const terminal of this.vaultElements.terminals) {
        if (terminal.active) {
          terminal.screenFlicker = noise(frameCount * 0.1, terminal.x) * 0.5 + 0.5;
        }
      }
      
      // Update data streams
      for (const stream of this.vaultElements.dataStreams) {
        stream.phase = (stream.phase || 0) + stream.speed * 0.01;
        if (stream.phase > 1) stream.phase -= 1;
      }
      
      // Update ambient particles
      for (const particle of this.vaultElements.ambientParticles) {
        // Move particle
        particle.x += cos(particle.angle) * particle.speed;
        particle.y += sin(particle.angle) * particle.speed;
        
        // Slightly change angle for natural movement
        particle.angle += random(-0.1, 0.1);
        
        // Wrap around edges
        if (particle.x < 0) particle.x += width;
        if (particle.x > width) particle.x -= width;
        if (particle.y < 0) particle.y += height;
        if (particle.y > height) particle.y -= height;
      }
    }
    
    // Override render methods
    
    renderBackground() {
      // Draw the vault background
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
        
        // Add overlay for depth
        fill(0, 20, 40, 100);
        rect(0, 0, width, height);
      } else {
        // Fallback
        background(10, 20, 30);
      }
      
      // Draw ambient particles
      this.renderParticles();
      
      // Draw data streams
      this.renderDataStreams();
    }
    
    renderElements() {
      // Draw terminals
      this.renderTerminals();
      
      // Draw the egg
      this.renderEgg();
      
      // Render code input puzzle
      if (!this.puzzleSolved) {
        this.codeInputPuzzle.render();
      }
      
      // Render DNA reveal sequence
      if (this.revealSequence) {
        this.renderDNAReveal();
      }
    }
    
    renderParticles() {
      // Draw ambient particles
      noStroke();
      for (const particle of this.vaultElements.ambientParticles) {
        fill(particle.color);
        ellipse(particle.x, particle.y, particle.size, particle.size);
      }
    }
    
    renderDataStreams() {
      // Draw data flow streams
      for (const stream of this.vaultElements.dataStreams) {
        if (stream.points.length < 2) continue;
        
        // Draw stream path
        noFill();
        stroke(stream.color);
        strokeWeight(stream.thickness);
        
        beginShape();
        for (let i = 0; i < stream.points.length; i++) {
          vertex(stream.points[i].x, stream.points[i].y);
        }
        endShape();
        
        // Add flowing data packets
        const phase = stream.phase || 0;
        for (let i = 0; i < 3; i++) {
          const packetPhase = (phase + i/3) % 1;
          
          // Get position along the path
          const index = floor(packetPhase * (stream.points.length - 1));
          const t = (packetPhase * (stream.points.length - 1)) % 1;
          
          if (index >= stream.points.length - 1) continue;
          
          const x1 = stream.points[index].x;
          const y1 = stream.points[index].y;
          const x2 = stream.points[index + 1].x;
          const y2 = stream.points[index + 1].y;
          
          const x = lerp(x1, x2, t);
          const y = lerp(y1, y2, t);
          
          // Draw data packet
          fill(red(stream.color), green(stream.color), blue(stream.color), 200);
          noStroke();
          ellipse(x, y, 8, 8);
        }
      }
    }
    
    renderTerminals() {
      // Draw each terminal
      for (const terminal of this.vaultElements.terminals) {
        push();
        translate(terminal.x, terminal.y);
        rotate(terminal.rotation);
        
        // Draw terminal base
        if (this.assets.terminal) {
          imageMode(CENTER);
          image(this.assets.terminal, 0, 0, terminal.size, terminal.size);
        } else {
          // Fallback shape
          fill(50, 60, 70);
          noStroke();
          rect(-terminal.size/2, -terminal.size/2, terminal.size, terminal.size, 5);
        }
        
        // Draw screen
        if (terminal.active) {
          fill(0, 150, 200, 150 + terminal.screenFlicker * 100);
          rect(-terminal.size * 0.4, -terminal.size * 0.3, terminal.size * 0.8, terminal.size * 0.6, 3);
          
          // Add screen content
          fill(0, 255, 255, 200);
          textSize(terminal.size * 0.1);
          textAlign(CENTER, CENTER);
          text("GENESIS PROTOCOL", 0, -terminal.size * 0.2);
          text("SEQUENCE ACTIVE", 0, -terminal.size * 0.1);
          
          // Add random data readouts
          textSize(terminal.size * 0.06);
          textAlign(LEFT, CENTER);
          for (let i = 0; i < 3; i++) {
            const y = terminal.size * (0.05 + i * 0.1);
            text(`DATA_${i}: ${floor(random(999))}`, -terminal.size * 0.35, y);
          }
        } else {
          fill(20, 30, 40);
          rect(-terminal.size * 0.4, -terminal.size * 0.3, terminal.size * 0.8, terminal.size * 0.6, 3);
        }
        
        pop();
      }
    }
    
    renderEgg() {
      // Draw the dinosaur egg
      push();
      translate(this.vaultElements.egg.x, this.vaultElements.egg.y);
      rotate(this.vaultElements.egg.rotation);
      
      // Draw egg glow if unlocked
      if (this.eggUnlocked && this.vaultElements.egg.glow > 0) {
        if (this.assets.glow) {
          const glowSize = this.vaultElements.egg.size * (1.5 + sin(frameCount * 0.05) * 0.2) * this.vaultElements.egg.glow;
          
          // Glow colors based on progress
          if (this.revealSequence) {
            // Shift hue based on reveal progress
            const hue = map(this.revealProgress, 0, 1, 180, 120);
            tint(hue, 255, 255, 150 * this.vaultElements.egg.glow);
          } else {
            tint(0, 200, 255, 150 * this.vaultElements.egg.glow);
          }
          
          imageMode(CENTER);
          image(this.assets.glow, 0, 0, glowSize, glowSize);
          noTint();
        } else {
          // Fallback glow
          noStroke();
          fill(0, 200, 255, 100 * this.vaultElements.egg.glow);
          ellipse(0, 0, this.vaultElements.egg.size * 1.5, this.vaultElements.egg.size * 1.5);
        }
      }
      
      // Draw egg image
      if (this.assets.egg) {
        imageMode(CENTER);
        image(this.assets.egg, 0, 0, this.vaultElements.egg.size, this.vaultElements.egg.size * 1.2);
      } else {
        // Fallback egg shape
        fill(220, 210, 180);
        noStroke();
        ellipse(0, 0, this.vaultElements.egg.size * 0.7, this.vaultElements.egg.size);
      }
      
      pop();
    }
    
    renderDNAReveal() {
      // Render the DNA helix reveal effect
      push();
      translate(this.vaultElements.egg.x, this.vaultElements.egg.y);
      
      // Scale based on reveal progress
      const scale = this.revealProgress * 1.2;
      
      // DNA helix animation
      const helixHeight = this.vaultElements.egg.size * 2 * scale;
      const helixWidth = this.vaultElements.egg.size * 0.5 * scale;
      const rotationSpeed = 0.02;
      
      // Use DNA helix image if available
      if (this.assets.dnaHelix) {
        imageMode(CENTER);
        
        // Draw with rotation and pulsating effect
        const pulseScale = 1 + sin(frameCount * 0.1) * 0.1;
        
        push();
        rotate(frameCount * rotationSpeed);
        scale(pulseScale * scale);
        image(this.assets.dnaHelix, 0, 0, helixWidth * 2, helixHeight);
        pop();
      } else {
        // Fallback DNA helix with strands and base pairs
        const strands = 2;
        const pairs = 10;
        
        for (let i = 0; i < strands; i++) {
          // Each strand
          const strandOffset = i * PI;
          
          // Draw backbone
          stroke(0, 200, 100);
          strokeWeight(3 * scale);
          noFill();
          
          beginShape();
          for (let j = 0; j <= pairs; j++) {
            const angle = strandOffset + (j / pairs) * TWO_PI + frameCount * rotationSpeed;
            const y = map(j, 0, pairs, -helixHeight/2, helixHeight/2);
            const x = cos(angle) * helixWidth;
            
            vertex(x, y);
          }
          endShape();
          
          // Draw base pairs
          for (let j = 0; j < pairs; j++) {
            const angle = strandOffset + (j / pairs) * TWO_PI + frameCount * rotationSpeed;
            const y = map(j, 0, pairs, -helixHeight/2, helixHeight/2);
            const x1 = cos(angle) * helixWidth;
            const x2 = cos(angle + PI) * helixWidth;
            
            // Connect the strands with base pairs
            stroke(0, 255, 150);
            strokeWeight(2 * scale);
            line(x1, y, x2, y);
            
            // Add connection points
            fill(0, 255, 150);
            noStroke();
            ellipse(x1, y, 6 * scale, 6 * scale);
            ellipse(x2, y, 6 * scale, 6 * scale);
          }
        }
      }
      
      // DNA sequence codes appearing
      if (this.revealProgress > 0.5) {
        const alpha = map(this.revealProgress, 0.5, 1, 0, 255);
        fill(0, 255, 150, alpha);
        textSize(16 * scale);
        textAlign(CENTER, CENTER);
        
        // Draw REX sequence
        text("T-REX DNA SEQUENCE IDENTIFIED", 0, helixHeight * 0.6);
        text("PRESERVATION PROTOCOL COMPLETE", 0, helixHeight * 0.6 + 25 * scale);
      }
      
      pop();
    }
    
    // Override input handling
    
    mousePressed() {
      // Handle code input puzzle interaction
      if (!this.isDialogueActive() && !this.puzzleSolved && this.codeInputPuzzle.handleClick(mouseX, mouseY)) {
        return true;
      }
      
      // Otherwise, handle dialogue advancement
      return super.mousePressed();
    }
    
    mouseMoved() {
      // Update code input puzzle hover state
      if (!this.puzzleSolved) {
        this.codeInputPuzzle.handleMouseMove(mouseX, mouseY);
      }
      
      // Call parent method
      super.mouseMoved();
    }
    
    // Handle key press
    keyPressed() {
      // Handle code input puzzle key input
      if (!this.isDialogueActive() && !this.puzzleSolved && this.codeInputPuzzle.handleKeyPress(keyCode)) {
        return true;
      }
      
      // Otherwise, use default handling
      return super.keyPressed();
    }
    
    // Override resize method
    resize() {
      super.resize();
      
      // Update vault environment
      this.initializeVaultEnvironment();
      
      // Update character positions
      if (aikira) aikira.setPosition(width * 0.2, height * 0.7);
      if (cliza) cliza.setPosition(width * 0.8, height * 0.7);
      if (byte) byte.setPosition(width * 0.5, height * 0.8);
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = GenesisVaultScene;
  }