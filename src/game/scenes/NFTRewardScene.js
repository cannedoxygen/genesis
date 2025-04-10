/**
 * AIKIRA: GENESIS PROTOCOL
 * NFT Reward Scene
 * 
 * This scene is displayed when the player completes all five chapters.
 * It shows the Genesis Protocol NFT and handles the minting and sharing process.
 */

import { mintGenesisNFT, generateNFTMetadata, uploadToIPFS, isWalletConnected, connectWallet } from '../../blockchain/base.js';

class NFTRewardScene extends BaseScene {
  constructor() {
    super('nftReward', 'Genesis Protocol Complete');
    
    this.nftGenerated = false;
    this.nftMetadata = null;
    this.nftIPFSUri = null;
    this.mintingStatus = 'pending'; // pending, minting, success, error
    this.mintingError = null;
    this.tokenId = null;
    this.showingShare = false;
    
    // UI elements
    this.buttons = [];
    
    // Animation properties
    this.eggRotation = 0;
    this.glowIntensity = 0;
    this.particleSystem = [];
    
    // Character dialogue
    this.dialogues = [
      {
        id: 'completion',
        character: 'AIKIRA',
        lines: [
          "Genesis Protocol completion verified.",
          "All dinosaur DNA fragments have been successfully recovered.",
          "Your Genesis NFT is now ready to be claimed."
        ],
        onComplete: () => {
          setTimeout(() => this.startDialogue('cliza-completion'), 1000);
        }
      },
      {
        id: 'cliza-completion',
        character: 'CLIZA',
        lines: [
          "Incredible work, Agent! You've done what seemed impossible.",
          "The ancient data now lives again, thanks to you.",
          "This NFT represents your discovery. It can be burned for $AIKIRA tokens, or kept as proof of your achievement."
        ],
        onComplete: () => {
          setTimeout(() => this.startDialogue('byte-completion'), 1000);
        }
      },
      {
        id: 'byte-completion',
        character: 'BYTE',
        lines: [
          "*happy bark*",
          "USER VERIFIED. GENESIS PROTOCOL TRANSFER AUTHORIZED.",
          "WELCOME TO THE FUTURE, MEATBRAIN."
        ],
        onComplete: () => {
          this.activateNFTGeneration();
        }
      },
      {
        id: 'wallet-needed',
        character: 'AIKIRA',
        lines: [
          "To claim your Genesis NFT, a wallet connection is required.",
          "Please connect your wallet to complete the protocol.",
          "Base Network is recommended for optimal integration."
        ]
      },
      {
        id: 'minting-success',
        character: 'AIKIRA',
        lines: [
          "Genesis NFT successfully minted.",
          "Token ID: " + (this.tokenId || 'Unknown'),
          "You may now share your achievement or return to the main menu."
        ]
      },
      {
        id: 'minting-error',
        character: 'AIKIRA',
        lines: [
          "Error in Genesis NFT minting process.",
          "Please try again or verify your wallet connection.",
          "Error: " + (this.mintingError || 'Unknown error')
        ]
      }
    ];
  }
  
  // Asset loading
  loadSceneAssets() {
    this.assetsTotal = 4;
    
    // Load background and NFT elements
    this.assets.background = loadImage('assets/images/backgrounds/genesis-vault.jpg', this.assetLoaded.bind(this));
    this.assets.egg = loadImage('assets/images/rewards/dino-egg.png', this.assetLoaded.bind(this));
    this.assets.glow = loadImage('assets/images/effects/glow.png', this.assetLoaded.bind(this));
    this.assets.dna = loadImage('assets/images/symbols/dna.png', this.assetLoaded.bind(this));
  }
  
  // Scene entry
  enter() {
    super.enter();
    
    // Reset scene state
    this.nftGenerated = false;
    this.nftMetadata = null;
    this.nftIPFSUri = null;
    this.mintingStatus = 'pending';
    this.mintingError = null;
    this.tokenId = null;
    this.showingShare = false;
    
    // Position characters
    aikira.setPosition(width * 0.15, height * 0.6);
    aikira.setVisible(true);
    
    cliza.setPosition(width * 0.85, height * 0.6);
    cliza.setVisible(true);
    
    byte.setPosition(width * 0.5, height * 0.75);
    byte.setVisible(true);
    
    // Update character references
    this.characters = [aikira, cliza, byte];
    
    // Initialize particle system
    this.initParticles();
    
    // Create buttons
    this.createButtons();
    
    // Start completion dialogue after short delay
    setTimeout(() => this.startDialogue('completion'), 2000);
  }
  
  // Initialize particle system for ambient effects
  initParticles() {
    this.particleSystem = [];
    
    // Create initial particles
    for (let i = 0; i < 50; i++) {
      this.addParticle();
    }
  }
  
  // Add a single particle to the system
  addParticle() {
    this.particleSystem.push({
      x: random(width),
      y: random(height),
      size: random(2, 8),
      speed: random(0.2, 2),
      color: color(random(100, 200), random(200, 255), random(200, 255), random(100, 200)),
      angle: random(TWO_PI)
    });
  }
  
  // Update particle system
  updateParticles() {
    for (let i = this.particleSystem.length - 1; i >= 0; i--) {
      const p = this.particleSystem[i];
      
      // Move particle
      p.x += cos(p.angle) * p.speed;
      p.y += sin(p.angle) * p.speed;
      
      // Slightly change angle for natural movement
      p.angle += random(-0.05, 0.05);
      
      // Remove particles that go off screen
      if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
        this.particleSystem.splice(i, 1);
        this.addParticle();
      }
    }
  }
  
  // Create interactive buttons
  createButtons() {
    this.buttons = [
      {
        text: 'Connect Wallet',
        x: width * 0.5,
        y: height * 0.82,
        width: 200,
        height: 50,
        visible: !isWalletConnected(),
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
          this.text = 'Connecting...';
          
          const address = await connectWallet();
          
          if (address) {
            // Connected successfully
            this.visible = false;
            
            // Update other buttons
            self.buttons.find(b => b.id === 'mint').visible = true;
          } else {
            // Connection failed
            this.enabled = true;
            this.text = 'Connect Wallet';
          }
        }
      },
      {
        id: 'mint',
        text: 'Mint Genesis NFT',
        x: width * 0.5,
        y: height * 0.82,
        width: 200,
        height: 50,
        visible: isWalletConnected() && !this.nftGenerated,
        enabled: true,
        isHovered: false,
        
        render: function() {
          if (!this.visible) return;
          
          push();
          if (this.enabled) {
            // Enabled state
            fill(this.isHovered ? color(100, 255, 150, 220) : color(0, 200, 100, 180));
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
          
          // Start minting process
          self.mintNFT();
        }
      },
      {
        id: 'share',
        text: 'Share on Twitter',
        x: width * 0.35,
        y: height * 0.82,
        width: 180,
        height: 50,
        visible: this.mintingStatus === 'success',
        enabled: true,
        isHovered: false,
        
        render: function() {
          if (!this.visible) return;
          
          push();
          if (this.enabled) {
            // Enabled state
            fill(this.isHovered ? color(100, 150, 255, 220) : color(0, 100, 200, 180));
          } else {
            // Disabled state
            fill(100, 100, 100, 150);
          }
          
          // Draw button background
          strokeWeight(2);
          stroke(0, 100, 255, this.isHovered ? 255 : 150);
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
          
          // Share on Twitter
          const tweetText = encodeURIComponent(
            "Just finished Genesis Protocol. BYTE didn't bark once. Holding or burning this NFT for $AIKIRA? #AIKIRA #GenesisProtocol"
          );
          
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
        }
      },
      {
        id: 'menu',
        text: 'Return to Menu',
        x: width * 0.65,
        y: height * 0.82,
        width: 180,
        height: 50,
        visible: this.mintingStatus === 'success',
        enabled: true,
        isHovered: false,
        
        render: function() {
          if (!this.visible) return;
          
          push();
          if (this.enabled) {
            // Enabled state
            fill(this.isHovered ? color(255, 150, 100, 220) : color(200, 100, 0, 180));
          } else {
            // Disabled state
            fill(100, 100, 100, 150);
          }
          
          // Draw button background
          strokeWeight(2);
          stroke(255, 100, 0, this.isHovered ? 255 : 150);
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
          
          // Return to menu
          setScene('intro');
        }
      },
      {
        id: 'retry',
        text: 'Retry Minting',
        x: width * 0.5,
        y: height * 0.82,
        width: 180,
        height: 50,
        visible: this.mintingStatus === 'error',
        enabled: true,
        isHovered: false,
        
        render: function() {
          if (!this.visible) return;
          
          push();
          if (this.enabled) {
            // Enabled state
            fill(this.isHovered ? color(255, 100, 100, 220) : color(200, 50, 50, 180));
          } else {
            // Disabled state
            fill(100, 100, 100, 150);
          }
          
          // Draw button background
          strokeWeight(2);
          stroke(255, 50, 50, this.isHovered ? 255 : 150);
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
          
          // Reset minting state
          self.mintingStatus = 'pending';
          self.mintingError = null;
          
          // Hide retry button
          this.visible = false;
          
          // Show mint button
          self.buttons.find(b => b.id === 'mint').visible = true;
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
  
  // NFT generation
  activateNFTGeneration() {
    // Generate NFT preview
    this.nftGenerated = true;
    
    // Generate metadata
    this.nftMetadata = generateNFTMetadata({
      byteInteractions: gameState.byteInteractions,
      tokenReward: 1000 // Default reward amount
    });
    
    // Check wallet connection
    if (!isWalletConnected()) {
      // Show wallet connection dialogue
      this.startDialogue('wallet-needed');
    }
  }
  
  // Mint NFT
  async mintNFT() {
    // Update button state
    const mintButton = this.buttons.find(b => b.id === 'mint');
    mintButton.enabled = false;
    mintButton.text = 'Minting...';
    
    // Update status
    this.mintingStatus = 'minting';
    
    try {
      // Upload metadata to IPFS
      this.nftIPFSUri = await uploadToIPFS(this.nftMetadata);
      
      if (!this.nftIPFSUri) {
        throw new Error('Failed to upload metadata to IPFS');
      }
      
      // Mint NFT
      const result = await mintGenesisNFT(this.nftIPFSUri);
      
      if (result.success) {
        // Minting successful
        this.mintingStatus = 'success';
        this.tokenId = result.tokenId;
        
        // Update dialogue with token ID
        this.dialogues.find(d => d.id === 'minting-success').lines[1] = `Token ID: ${this.tokenId || 'Unknown'}`;
        
        // Show success dialogue
        this.startDialogue('minting-success');
        
        // Hide mint button
        mintButton.visible = false;
        
        // Show share and menu buttons
        this.buttons.find(b => b.id === 'share').visible = true;
        this.buttons.find(b => b.id === 'menu').visible = true;
      } else {
        // Minting failed
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      // Handle error
      this.mintingStatus = 'error';
      this.mintingError = error.message || 'Unknown error';
      
      // Update error dialogue
      this.dialogues.find(d => d.id === 'minting-error').lines[2] = `Error: ${this.mintingError}`;
      
      // Show error dialogue
      this.startDialogue('minting-error');
      
      // Hide mint button
      mintButton.visible = false;
      
      // Show retry button
      this.buttons.find(b => b.id === 'retry').visible = true;
    }
  }
  
  // Render methods
  
  renderBackground() {
    // Draw background
    if (this.assets.background) {
      // Fit to screen with slight parallax
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
      
      // Center with slight parallax based on mouse
      const parallaxX = map(mouseX, 0, width, -10, 10);
      const parallaxY = map(mouseY, 0, height, -10, 10);
      
      const xOffset = (width - drawWidth) / 2;
      const yOffset = (height - drawHeight) / 2;
      
      image(this.assets.background, xOffset + parallaxX, yOffset + parallaxY, drawWidth, drawHeight);
      
      // Add overlay
      fill(0, 0, 20, 100);
      rect(0, 0, width, height);
    } else {
      // Fallback
      background(10, 5, 30);
    }
    
    // Update and render particles
    this.updateParticles();
    
    // Draw particles
    for (const p of this.particleSystem) {
      noStroke();
      fill(p.color);
      ellipse(p.x, p.y, p.size, p.size);
    }
  }
  
  renderElements() {
    // Draw the NFT reward in the center
    this.renderNFT();
    
    // Render buttons
    for (const button of this.buttons) {
      if (typeof button.render === 'function') {
        button.render();
      }
    }
  }
  
  renderNFT() {
    // Center position
    const x = width * 0.5;
    const y = height * 0.45;
    
    // Update animation values
    this.eggRotation += 0.005;
    this.glowIntensity = map(sin(frameCount * 0.05), -1, 1, 0.5, 1);
    
    push();
    translate(x, y);
    
    // Draw glowing effect
    if (this.assets.glow) {
      // Pulsating glow
      const glowSize = min(width, height) * 0.4 * this.glowIntensity;
      
      tint(0, 200, 255, 150 * this.glowIntensity);
      imageMode(CENTER);
      image(this.assets.glow, 0, 0, glowSize, glowSize);
      noTint();
    }
    
    // Draw orbiting DNA strands
    if (this.assets.dna) {
      for (let i = 0; i < 5; i++) {
        const angle = this.eggRotation + (TWO_PI / 5) * i;
        const orbitRadius = min(width, height) * 0.15;
        const x = cos(angle) * orbitRadius;
        const y = sin(angle) * orbitRadius;
        
        // DNA size
        const dnaSize = min(width, height) * 0.06;
        
        push();
        translate(x, y);
        rotate(angle + PI/2);
        
        // Scale and alpha based on z-position for pseudo-3D effect
        const scaleAmount = map(sin(angle), -1, 1, 0.7, 1.3);
        const alphaAmount = map(sin(angle), -1, 1, 150, 255);
        
        tint(255, alphaAmount);
        scale(scaleAmount);
        
        imageMode(CENTER);
        image(this.assets.dna, 0, 0, dnaSize, dnaSize);
        noTint();
        
        pop();
      }
    }
    
    // Draw the egg (slightly rotating)
    if (this.assets.egg) {
      push();
      rotate(sin(this.eggRotation) * 0.1);
      
      const eggSize = min(width, height) * 0.25;
      imageMode(CENTER);
      image(this.assets.egg, 0, 0, eggSize, eggSize);
      pop();
    }
    
    // Draw NFT frame
    stroke(0, 200, 255, 200);
    strokeWeight(3);
    noFill();
    rect(-min(width, height) * 0.3, -min(width, height) * 0.3, min(width, height) * 0.6, min(width, height) * 0.6, 10);
    
    // If NFT is generated, draw metadata preview
    if (this.nftGenerated && this.nftMetadata) {
      this.renderNFTMetadata();
    }
    
    pop();
  }
  
  renderNFTMetadata() {
    // Only draw if we have metadata
    if (!this.nftMetadata) return;
    
    const frameSize = min(width, height) * 0.6;
    const frameX = -frameSize / 2;
    const frameY = frameSize / 2 + 10;
    
    push();
    fill(0, 30, 60, 200);
    noStroke();
    rect(frameX, frameY, frameSize, 70, 5);
    
    // Draw metadata text
    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    
    // NFT Name
    text(this.nftMetadata.name, frameX + 10, frameY + 10);
    
    // Status line based on minting state
    textSize(12);
    switch (this.mintingStatus) {
      case 'pending':
        fill(200, 200, 0);
        text('Ready to mint', frameX + 10, frameY + 35);
        break;
      case 'minting':
        fill(0, 200, 255);
        text('Minting in progress...', frameX + 10, frameY + 35);
        break;
      case 'success':
        fill(0, 255, 100);
        text(`Successfully minted! Token ID: ${this.tokenId || 'Unknown'}`, frameX + 10, frameY + 35);
        break;
      case 'error':
        fill(255, 50, 50);
        text(`Error: ${this.mintingError || 'Unknown error'}`, frameX + 10, frameY + 35);
        break;
    }
    
    // Token reward
    fill(255, 200, 0);
    text(`Redeemable for ${this.nftMetadata.attributes.find(a => a.trait_type === 'Redeemable')?.value || '1000 $AIKIRA'}`, frameX + 10, frameY + 55);
    
    pop();
  }
  
  renderUI() {
    super.renderUI();
    
    // Draw completion header
    fill(0, 200, 255);
    textSize(28);
    textAlign(CENTER, TOP);
    text('GENESIS PROTOCOL COMPLETE', width / 2, 30);
    
    // Draw subtitle
    fill(255);
    textSize(16);
    text('All dinosaur DNA fragments recovered', width / 2, 70);
    
    // Reset text alignment
    textAlign(CENTER, CENTER);
  }
  
  // Input handling
  mousePressed() {
    // Check button interactions first
    for (const button of this.buttons) {
      if (button.isHovered && typeof button.onPress === 'function') {
        button.onPress();
        return true;
      }
    }
    
    // Otherwise, check for dialogue advancement
    return super.mousePressed();
  }
  
  mouseMoved() {
    // Update button hover states
    for (const button of this.buttons) {
      if (typeof button.checkHover === 'function') {
        button.checkHover(mouseX, mouseY);
      }
    }
    
    // Call parent method
    super.mouseMoved();
  }
  
  // Handle resize
  resize() {
    super.resize();
    
    // Update button positions
    this.buttons.forEach(button => {
      if (button.id === 'mint' || button.id === 'connect' || button.id === 'retry') {
        button.x = width * 0.5;
        button.y = height * 0.82;
      } else if (button.id === 'share') {
        button.x = width * 0.35;
        button.y = height * 0.82;
      } else if (button.id === 'menu') {
        button.x = width * 0.65;
        button.y = height * 0.82;
      }
    });
    
    // Update character positions
    if (aikira) aikira.setPosition(width * 0.15, height * 0.6);
    if (cliza) cliza.setPosition(width * 0.85, height * 0.6);
    if (byte) byte.setPosition(width * 0.5, height * 0.75);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = NFTRewardScene;
}