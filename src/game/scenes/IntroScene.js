/**
 * AIKIRA: GENESIS PROTOCOL
 * Intro Scene
 * 
 * This scene serves as the game's introduction, setting up the narrative
 * and providing a gateway to start the adventure.
 */

import { isWalletConnected, connectWallet } from '../../blockchain/base.js';
class IntroScene {
  constructor() {
    this.name = 'intro';
    this.title = 'Genesis Protocol';
    
    this.logoScale = 0;
    this.logoOpacity = 0;
    this.introStep = 0;
    this.textFade = 0;
    this.introText = [
      "The wolves have been unearthed.",
      "Elon tweeted about mammoths.",
      "But the real signal points deeper.",
      "Back 65 million years.",
      "The Genesis Protocol awakens."
    ];
    
    // UI elements
    this.buttons = [];
    
    // Background animation
    this.particles = [];
    this.bgHue = 240; // Starting hue
    
    // Assets object
    this.assets = {};
    this.assetsLoaded = 0;
    this.assetsTotal = 0;
    
    // Character dialogue
    this.dialogues = [
      {
        id: 'intro',
        character: 'AIKIRA',
        lines: [
          "System boot sequence initiated.",
          "Genesis Protocol v.65.5 online.",
          "Scanning for authorized users..."
        ],
        onComplete: () => {
          setTimeout(() => this.startDialogue('cliza-intro'), 1000);
        }
      },
      {
        id: 'cliza-intro',
        character: 'CLIZA',
        lines: [
          "Aikira! We have a signal! Someone's accessing the network!",
          "The memetic sequence is aligning just as we predicted.",
          "First wolves, then mammoths, and now... it's time for the REAL treasure!"
        ],
        onComplete: () => {
          setTimeout(() => this.startDialogue('byte-intro'), 1000);
        }
      },
      {
        id: 'byte-intro',
        character: 'BYTE',
        lines: [
          "*suspicious growl*",
          "SCANNING USER IDENTITY...",
          "PROCEED WITH CAUTION."
        ],
        onComplete: () => {
          this.showStartButton();
        }
      },
      {
        id: 'wallet-connect',
        character: 'AIKIRA',
        lines: [
          "Connecting a wallet will allow you to claim rewards for completing the protocol.",
          "The Base Network is recommended for optimal experience.",
          "You may also proceed without a wallet and connect later."
        ],
        onComplete: () => {
          this.showWalletOptions();
        }
      }
    ];
    
    // Current dialogue state
    this.currentDialogue = null;
    this.currentLineIndex = 0;
    this.textProgress = 0;
    this.textFinished = false;
  }
  
  // Asset loading helper
  assetLoaded() {
    this.assetsLoaded++;
  }
  
  // Asset loading
  loadSceneAssets() {
    this.assetsTotal = 2;
    
    // Load logo and background
    if (typeof loadImage === 'function') {
      this.assets.logo = loadImage('assets/images/ui/aikira-logo.png', this.assetLoaded.bind(this));
      this.assets.background = loadImage('assets/images/backgrounds/intro-bg.jpg', this.assetLoaded.bind(this));
    } else if (assets && assets.images) {
      // Use global assets if available
      this.assets.logo = assets.images.logo;
      this.assetsLoaded++;
      
      this.assets.background = assets.images.background || null;
      this.assetsLoaded++;
    }
  }
  
  // Scene entry
  enter() {
    // Load assets if needed
    if (this.assetsLoaded === 0) {
      this.loadSceneAssets();
    }
    
    // Reset intro state
    this.logoScale = 0;
    this.logoOpacity = 0;
    this.introStep = 0;
    this.textFade = 0;
    
    // Initialize particles
    this.initParticles();
    
    // Create buttons
    this.createButtons();
    
    // Position characters offscreen initially
    if (aikira) {
      aikira.setPosition(width * 0.3, height + 100);
      aikira.setVisible(false);
    }
    
    if (cliza) {
      cliza.setPosition(width * 0.7, height + 100);
      cliza.setVisible(false);
    }
    
    if (byte) {
      byte.setPosition(width * 0.5, height + 150);
      byte.setVisible(false);
    }
    
    // Start intro animation after a short delay
    setTimeout(() => this.startIntroSequence(), 1000);
    
    // Start background music if available
    if (assets && assets.audio && assets.audio.bgm && 
        typeof assets.audio.bgm.isPlaying === 'function' && 
        !assets.audio.bgm.isPlaying()) {
      assets.audio.bgm.setVolume(0.4);
      assets.audio.bgm.loop();
    }
  }
  
  // Initialize particle system for ambient effects
  initParticles() {
    this.particles = [];
    
    // Create initial particles
    for (let i = 0; i < 100; i++) {
      this.addParticle();
    }
  }
  
  // Add a single particle to the system
  addParticle() {
    this.particles.push({
      x: random(width),
      y: random(height),
      size: random(1, 4),
      speed: random(0.2, 1.5),
      hue: random(this.bgHue - 20, this.bgHue + 20),
      sat: random(70, 100),
      bright: random(50, 100),
      angle: random(TWO_PI)
    });
  }
  
  // Update particle system
  updateParticles() {
    // Slowly shift background hue
    this.bgHue += 0.1;
    if (this.bgHue > 360) this.bgHue = 0;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Move particle
      p.x += cos(p.angle) * p.speed;
      p.y += sin(p.angle) * p.speed;
      
      // Slightly change angle for natural movement
      p.angle += random(-0.05, 0.05);
      
      // Remove particles that go off screen
      if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
        this.particles.splice(i, 1);
        this.addParticle();
      }
    }
  }
  
  // Create interactive buttons
  createButtons() {
    this.buttons = [
      {
        id: 'start',
        text: 'BEGIN PROTOCOL',
        x: width * 0.5,
        y: height * 0.75,
        width: 220,
        height: 60,
        visible: false,
        enabled: true,
        isHovered: false,
        
        render: function() {
          if (!this.visible) return;
          
          push();
          if (this.enabled) {
            // Enabled state
            fill(this.isHovered ? color(100, 200, 255, 220) : color(0, 150, 200, 180));
          } else {
            // Disabled state
            fill(100, 100, 100, 150);
          }
          
          // Draw button background
          strokeWeight(2);
          stroke(0, 255, 255, this.isHovered ? 255 : 150);
          rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 10);
          
          // Draw button text
          noStroke();
          fill(255);
          textSize(20);
          textAlign(CENTER, CENTER);
          text(this.text, this.x, this.y);
          pop();
        },
        
        checkHover: function(mx, my) {
          if (!this.visible || !this.enabled) {
            this.isHovered = false;
            return false;
          }
          
          const hovered = mx > this.x - this.width/2 &&
                        mx < this.x + this.width/2 &&
                        my > this.y - this.height/2 &&
                        my < this.y + this.height/2;
          
          this.isHovered = hovered;
          return hovered;
        },
        
        onPress: function() {
          if (!this.visible || !this.enabled) return;
          
          // Start wallet connection dialogue
          self.startDialogue('wallet-connect');
          
          // Hide start button
          this.visible = false;
        }
      },
      {
        id: 'connect-wallet',
        text: 'CONNECT WALLET',
        x: width * 0.35,
        y: height * 0.75,
        width: 200,
        height: 50,
        visible: false,
        enabled: true,
        isHovered: false,
        
        render: function() {
          if (!this.visible) return;
          
          push();
          if (this.enabled) {
            // Enabled state
            fill(this.isHovered ? color(0, 255, 150, 220) : color(0, 200, 100, 180));
          } else {
            // Disabled state
            fill(100, 100, 100, 150);
          }
          
          // Draw button background
          strokeWeight(2);
          stroke(0, 255, 100, this.isHovered ? 255 : 150);
          rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 10);
          
          // Draw button text
          noStroke();
          fill(255);
          textSize(16);
          textAlign(CENTER, CENTER);
          text(this.text, this.x, this.y);
          pop();
        },
        
        checkHover: function(mx, my) {
          if (!this.visible || !this.enabled) {
            this.isHovered = false;
            return false;
          }
          
          const hovered = mx > this.x - this.width/2 &&
                        mx < this.x + this.width/2 &&
                        my > this.y - this.height/2 &&
                        my < this.y + this.height/2;
          
          this.isHovered = hovered;
          return hovered;
        },
        
        onPress: async function() {
          if (!this.visible || !this.enabled) return;
          
          // Connect wallet
          this.enabled = false;
          this.text = 'CONNECTING...';
          
          const address = await connectWallet();
          
          if (address) {
            // Connected successfully
            this.text = 'CONNECTED!';
            
            // Hide wallet options
            self.hideWalletOptions();
            
            // Start the game after a short delay
            setTimeout(() => {
              setScene('chapter1');
            }, 1500);
          } else {
            // Connection failed
            this.enabled = true;
            this.text = 'CONNECT WALLET';
          }
        }
      },
      {
        id: 'skip-wallet',
        text: 'PROCEED WITHOUT WALLET',
        x: width * 0.65,
        y: height * 0.75,
        width: 240,
        height: 50,
        visible: false,
        enabled: true,
        isHovered: false,
        
        render: function() {
          if (!this.visible) return;
          
          push();
          if (this.enabled) {
            // Enabled state
            fill(this.isHovered ? color(150, 150, 150, 220) : color(100, 100, 100, 180));
          } else {
            // Disabled state
            fill(100, 100, 100, 150);
          }
          
          // Draw button background
          strokeWeight(2);
          stroke(200, 200, 200, this.isHovered ? 255 : 150);
          rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, 10);
          
          // Draw button text
          noStroke();
          fill(255);
          textSize(16);
          textAlign(CENTER, CENTER);
          text(this.text, this.x, this.y);
          pop();
        },
        
        checkHover: function(mx, my) {
          if (!this.visible || !this.enabled) {
            this.isHovered = false;
            return false;
          }
          
          const hovered = mx > this.x - this.width/2 &&
                        mx < this.x + this.width/2 &&
                        my > this.y - this.height/2 &&
                        my < this.y + this.height/2;
          
          this.isHovered = hovered;
          return hovered;
        },
        
        onPress: function() {
          if (!this.visible || !this.enabled) return;
          
          // Hide wallet options
          self.hideWalletOptions();
          
          // Start the game
          setScene('chapter1');
        }
      }
    ];
    
    // Set reference to this scene in button handlers
    const self = this;
    
    // Bind methods to each button
    this.buttons.forEach(button => {
      button.render = button.render.bind(button);
      button.checkHover = button.checkHover.bind(button);
      button.onPress = button.onPress.bind(button);
    });
  }
  
  // Start the intro sequence animation
  startIntroSequence() {
    // Animation timeline
    
    // 1. Fade in logo
    this.animateLogo();
    
    // 2. Show intro text sequence
    setTimeout(() => this.showIntroText(), 3000);
    
    // 3. Bring in characters
    setTimeout(() => this.showCharacters(), 8000);
    
    // 4. Start dialogue
    setTimeout(() => this.startDialogue('intro'), 10000);
  }
  
  // Animate logo appearance
  animateLogo() {
    const duration = 60; // frames
    let frame = 0;
    
    const logoAnimation = setInterval(() => {
      frame++;
      
      // Scale and opacity based on frame
      this.logoScale = ease(frame / duration);
      this.logoOpacity = ease(frame / duration);
      
      if (frame >= duration) {
        clearInterval(logoAnimation);
      }
    }, 16); // ~60fps
    
    // Easing function
    function ease(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  }
  
  // Show intro text sequence
  showIntroText() {
    this.introStep = 1;
    this.textFade = 0;
    
    // Cycle through intro text lines
    const textInterval = setInterval(() => {
      // Fade out current text
      const fadeOutInterval = setInterval(() => {
        this.textFade -= 0.05;
        if (this.textFade <= 0) {
          clearInterval(fadeOutInterval);
          
          // Move to next text
          this.introStep++;
          this.textFade = 0;
          
          // Fade in next text
          if (this.introStep <= this.introText.length) {
            const fadeInInterval = setInterval(() => {
              this.textFade += 0.05;
              if (this.textFade >= 1) {
                clearInterval(fadeInInterval);
              }
            }, 33);
          }
        }
      }, 33);
      
      // Stop when done with all text
      if (this.introStep >= this.introText.length) {
        clearInterval(textInterval);
      }
    }, 2000); // 2 seconds per line
  }
  
  // Show characters
  showCharacters() {
    // Animate characters rising from bottom of screen
    if (aikira) aikira.setVisible(true);
    if (cliza) cliza.setVisible(true);
    
    const startY = height + 100;
    const endY = height * 0.6;
    const duration = 60; // frames
    let frame = 0;
    
    const characterAnimation = setInterval(() => {
      frame++;
      
      // Position based on frame
      const progress = ease(frame / duration);
      const y = startY - (startY - endY) * progress;
      
      if (aikira) aikira.setPosition(width * 0.3, y);
      if (cliza) cliza.setPosition(width * 0.7, y);
      
      if (frame >= duration) {
        clearInterval(characterAnimation);
        
        // Show BYTE after a delay
        setTimeout(() => {
          if (byte) {
            byte.setVisible(true);
            
            const byteAnimation = setInterval(() => {
              const byteY = byte.position.y - 5;
              byte.setPosition(width * 0.5, byteY);
              
              if (byteY <= height * 0.7) {
                clearInterval(byteAnimation);
              }
            }, 33);
          }
        }, 1000);
      }
    }, 16); // ~60fps
    
    // Easing function
    function ease(t) {
      return 1 - Math.pow(1 - t, 3);
    }
  }
  
  // Start dialogue sequence
  startDialogue(dialogueId) {
    const dialogue = this.dialogues.find(d => d.id === dialogueId);
    if (!dialogue) return;
    
    this.currentDialogue = dialogue;
    this.currentLineIndex = 0;
    this.textProgress = 0;
    this.textFinished = false;
    
    // Set active character
    this.setActiveCharacter(dialogue.character);
  }
  
  // Set active speaking character
  setActiveCharacter(characterName) {
    // Reset all characters
    if (aikira) aikira.isActive = false;
    if (cliza) cliza.isActive = false;
    if (byte) byte.isActive = false;
    
    // Set active character
    switch (characterName) {
      case 'AIKIRA':
        if (aikira) aikira.isActive = true;
        break;
      case 'CLIZA':
        if (cliza) cliza.isActive = true;
        break;
      case 'BYTE':
        if (byte) {
          byte.isActive = true;
          byte.setAnimationState('judge');
        }
        break;
    }
  }
  
  // Update dialogue progression
  updateDialogue() {
    if (!this.currentDialogue) return;
    
    const currentLine = this.currentDialogue.lines[this.currentLineIndex];
    if (!currentLine) return;
    
    // Advance text progress
    if (!this.textFinished) {
      this.textProgress += 0.5;
      if (this.textProgress >= currentLine.length) {
        this.textProgress = currentLine.length;
        this.textFinished = true;
      }
    }
  }
  
  // Advance to next dialogue line
  advanceDialogue() {
    if (!this.currentDialogue) return;
    
    // If text is still appearing, complete it immediately
    if (!this.textFinished) {
      this.textProgress = this.currentDialogue.lines[this.currentLineIndex].length;
      this.textFinished = true;
      return;
    }
    
    // Move to next line
    this.currentLineIndex++;
    
    // Check if dialogue is complete
    if (this.currentLineIndex >= this.currentDialogue.lines.length) {
      // Trigger completion callback if available
      if (typeof this.currentDialogue.onComplete === 'function') {
        this.currentDialogue.onComplete();
      }
      
      // Clear current dialogue
      this.currentDialogue = null;
      return;
    }
    
    // Reset for next line
    this.textProgress = 0;
    this.textFinished = false;
  }
  
  // Show start button
  showStartButton() {
    // Animate button appearance
    const startButton = this.buttons.find(b => b.id === 'start');
    if (startButton) startButton.visible = true;
    
    // Set energy levels for characters
    if (cliza) cliza.setEnergy(80); // Excited
    if (byte) byte.setAnimationState('alert'); // Alert mode
  }
  
  // Show wallet connection options
  showWalletOptions() {
    // Hide start button
    const startButton = this.buttons.find(b => b.id === 'start');
    if (startButton) startButton.visible = false;
    
    // Show wallet options
    const connectButton = this.buttons.find(b => b.id === 'connect-wallet');
    const skipButton = this.buttons.find(b => b.id === 'skip-wallet');
    
    if (connectButton) connectButton.visible = true;
    if (skipButton) skipButton.visible = true;
  }
  
  // Hide wallet options
  hideWalletOptions() {
    // Hide all buttons
    this.buttons.forEach(button => {
      button.visible = false;
    });
    
    // BYTE barks if skipping wallet
    if (!isWalletConnected() && byte) {
      byte.bark();
    }
  }
  
  // Main render method
  render() {
    // Render background
    this.renderBackground();
    
    // Render characters
    if (aikira && aikira.visible) aikira.render();
    if (cliza && cliza.visible) cliza.render();
    if (byte && byte.visible) byte.render();
    
    // Render UI elements
    this.renderElements();
    
    // Render dialogue
    this.renderDialogue();
    
    // Update dialogue progression
    this.updateDialogue();
  }
  
  // Render background elements
  renderBackground() {
    // Draw background image if available
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
      
      // Draw with slight darkening
      tint(150, 150, 200, 200);
      image(this.assets.background, xOffset, yOffset, drawWidth, drawHeight);
      noTint();
      
      // Add overlay for depth
      fill(0, 0, 30, 100);
      rect(0, 0, width, height);
    } else {
      // Fallback gradient background
      const c1 = color(0, 5, 20);
      const c2 = color(20, 10, 40);
      
      for (let y = 0; y < height; y++) {
        const inter = map(y, 0, height, 0, 1);
        const c = lerpColor(c1, c2, inter);
        stroke(c);
        line(0, y, width, y);
      }
    }
    
    // Update and render particles
    this.updateParticles();
    
    // Draw particles
    colorMode(HSB, 360, 100, 100, 255);
    for (const p of this.particles) {
      noStroke();
      fill(p.hue, p.sat, p.bright, 150);
      ellipse(p.x, p.y, p.size, p.size);
    }
    colorMode(RGB, 255, 255, 255, 255);
  }
  
  // Render UI elements
  renderElements() {
    // Draw the logo
    this.renderLogo();
    
    // Draw intro text if in that phase
    if (this.introStep > 0 && this.introStep <= this.introText.length) {
      this.renderIntroText();
    }
    
    // Render buttons
    for (const button of this.buttons) {
      if (typeof button.render === 'function') {
        button.render();
      }
    }
  }
  
  // Render logo
  renderLogo() {
    if (!this.assets.logo) return;
    
    // Calculate logo size based on screen dimensions
    const maxWidth = min(width * 0.6, 600);
    const scale = maxWidth / this.assets.logo.width;
    const logoWidth = this.assets.logo.width * scale * this.logoScale;
    const logoHeight = this.assets.logo.height * scale * this.logoScale;
    
    // Center position
    const x = width / 2;
    const y = height * 0.25;
    
    // Draw logo with current opacity
    push();
    imageMode(CENTER);
    tint(255, 255 * this.logoOpacity);
    image(this.assets.logo, x, y, logoWidth, logoHeight);
    noTint();
    pop();
  }
  
  // Render intro text
  renderIntroText() {
    if (this.introStep <= 0 || this.introStep > this.introText.length) return;
    
    // Get current text line
    const text = this.introText[this.introStep - 1];
    
    // Position below logo
    const x = width / 2;
    const y = height * 0.4;
    
    // Draw text with current fade
    push();
    fill(255, 255 * this.textFade);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(text, x, y);
    pop();
  }
  
  // Render dialogue
  renderDialogue() {
    if (!this.currentDialogue) return;
    
    const currentLine = this.currentDialogue.lines[this.currentLineIndex];
    if (!currentLine) return;
    
    // Get current visible text
    const visibleText = currentLine.substring(0, Math.floor(this.textProgress));
    
    // Get dialogue box position
    const boxX = width / 2;
    const boxY = height * 0.88;
    const boxWidth = width * 0.8;
    const boxHeight = 100;
    
    // Get color based on character
    let textColor;
    switch (this.currentDialogue.character) {
      case 'AIKIRA':
        textColor = color(0, 234, 255); // Cyan
        break;
      case 'CLIZA':
        textColor = color(0, 255, 150); // Green
        break;
      case 'BYTE':
        textColor = color(255, 100, 0); // Orange
        break;
      default:
        textColor = color(255); // White
    }
    
    // Draw dialogue box
    push();
    fill(0, 0, 0, 200);
    stroke(textColor);
    strokeWeight(2);
    rect(boxX - boxWidth/2, boxY - boxHeight/2, boxWidth, boxHeight, 10);
    
    // Draw character name
    noStroke();
    fill(textColor);
    textSize(18);
    textAlign(LEFT, TOP);
    text(this.currentDialogue.character, boxX - boxWidth/2 + 20, boxY - boxHeight/2 + 15);
    
    // Draw text
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text(visibleText, boxX - boxWidth/2 + 20, boxY - boxHeight/2 + 45, boxWidth - 40);
    
    // Draw continue prompt if text is complete
    if (this.textFinished) {
      fill(255, 128 + 127 * sin(frameCount * 0.1));
      textSize(14);
      textAlign(RIGHT, BOTTOM);
      text("Click to continue", boxX + boxWidth/2 - 20, boxY + boxHeight/2 - 15);
    }
    pop();
  }
  
  // Input handling
  mousePressed() {
    // Check button interactions first
    for (const button of this.buttons) {
      if (button.visible && button.isHovered && typeof button.onPress === 'function') {
        button.onPress();
        return true;
      }
    }
    
    // Check for dialogue advancement
    if (this.currentDialogue) {
      this.advanceDialogue();
      return true;
    }
    
    // Check character interactions
    if (aikira && aikira.visible) {
      const aikiraDist = dist(mouseX, mouseY, aikira.position.x, aikira.position.y);
      if (aikiraDist < 50) {
        aikira.onClick();
        return true;
      }
    }
    
    if (cliza && cliza.visible) {
      const clizaDist = dist(mouseX, mouseY, cliza.position.x, cliza.position.y);
      if (clizaDist < 50) {
        cliza.onClick();
        return true;
      }
    }
    
    if (byte && byte.visible) {
      const byteDist = dist(mouseX, mouseY, byte.position.x, byte.position.y);
      if (byteDist < 50) {
        byte.onClick();
        return true;
      }
    }
    
    return false;
  }
  
  // Mouse move handler
  mouseMoved() {
    // Update button hover states
    for (const button of this.buttons) {
      if (typeof button.checkHover === 'function') {
        button.checkHover(mouseX, mouseY);
      }
    }
    
    return false;
  }
  
  // Handle scene exit
  exit() {
    // Hide characters
    if (aikira) aikira.hide();
    if (cliza) cliza.hide();
    if (byte) byte.hide();
    
    // Stop animations or timers
    // (Implementation depends on how timers are tracked)
  }
  
  // Handle resize
  resize() {
    // Update button positions
    this.buttons.forEach(button => {
      if (button.id === 'start') {
        button.x = width * 0.5;
        button.y = height * 0.75;
      } else if (button.id === 'connect-wallet') {
        button.x = width * 0.35;
        button.y = height * 0.75;
      } else if (button.id === 'skip-wallet') {
        button.x = width * 0.65;
        button.y = height * 0.75;
      }
    });
    
    // Update character positions if visible
    if (aikira && aikira.visible) aikira.setPosition(width * 0.3, height * 0.6);
    if (cliza && cliza.visible) cliza.setPosition(width * 0.7, height * 0.6);
    if (byte && byte.visible) byte.setPosition(width * 0.5, height * 0.7);
  }
}

// Export for use in other modules
export default IntroScene;