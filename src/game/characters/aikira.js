/**
 * AIKIRA: GENESIS PROTOCOL
 * Aikira Character Class
 * 
 * Character description: Logical, elegant AI agent running the Genesis Protocol
 * Responsible for guiding the player through the protocol and providing context
 */

class Aikira {
  constructor() {
    this.p5 = null; // Add p5 instance property
    this.name = 'AIKIRA';
    this.visible = false;
    this.position = {
      x: 0,
      y: 0
    };
    this.size = {
      width: 0,
      height: 0
    };
    this.avatar = null;
    this.animation = {
      frame: 0,
      maxFrames: 60,
      direction: 1
    };
    this.speechColor = '#00EAFF'; // Cyan blue for Aikira's text
    this.infoMode = false; // When true, displays additional protocol information
    
    // Personality traits that affect dialogue and appearance
    this.traits = {
      logical: 0.9,  // High logical reasoning
      elegant: 0.8,  // Refined and precise
      focused: 0.85, // Highly task-oriented
      calm: 0.7     // Generally calm demeanor
    };
  }
  
  // Add method to set p5 instance
  setP5(p5Instance) {
    this.p5 = p5Instance;
  }
  
  // Character setup - Fixed typo in method name (removed extra 'i')
  initialize(assets) {
    this.assets = assets; // Store assets reference
    
    // Load avatar if not already loaded
    if (!this.avatar && assets.images.aikira) {
      this.avatar = assets.images.aikira;
      this.size.width = this.avatar.width;
      this.size.height = this.avatar.height;
    }
    
    // Default position (can be overridden by scenes)
    this.setPosition(this.p5.width * 0.15, this.p5.height * 0.5);
  }
  
  // Rendering
  render() {
    if (!this.visible) return;
    
    this.p5.push();
    
    // Apply animation effects
    this.updateAnimation();
    
    // Draw character avatar if available
    if (this.avatar) {
      this.p5.imageMode(this.p5.CENTER);
      
      // Apply subtle hover effect
      const hoverOffset = this.p5.sin(this.p5.frameCount * 0.05) * 5;
      
      // Apply a subtle glow effect
      this.p5.drawingContext.shadowBlur = 15;
      this.p5.drawingContext.shadowColor = this.speechColor;
      
      // Draw avatar with appropriate scaling
      const scale = this.p5.min(this.p5.width, this.p5.height) * 0.001; // Scale based on screen size
      this.p5.image(
        this.avatar, 
        this.position.x, 
        this.position.y + hoverOffset, 
        this.size.width * scale, 
        this.size.height * scale
      );
      
      // Reset shadow
      this.p5.drawingContext.shadowBlur = 0;
    } else {
      // Fallback if avatar not loaded - draw a placeholder
      this.p5.noStroke();
      this.p5.fill(0, 234, 255, 200);
      this.p5.ellipse(this.position.x, this.position.y, 100, 100);
      this.p5.fill(0);
      this.p5.textSize(20);
      this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
      this.p5.text('A', this.position.x, this.position.y);
    }
    
    // Draw name tag if in info mode
    if (this.infoMode) {
      this.drawInfoPanel();
    }
    
    this.p5.pop();
  }
  
  // Update animation state
  updateAnimation() {
    // Simple oscillation for subtle animation
    this.animation.frame += this.animation.direction * 0.5;
    
    if (this.animation.frame >= this.animation.maxFrames) {
      this.animation.direction = -1;
    } else if (this.animation.frame <= 0) {
      this.animation.direction = 1;
    }
  }
  
  // Draw information panel
  drawInfoPanel() {
    const panelWidth = 200;
    const panelHeight = 80;
    const panelX = this.position.x - panelWidth / 2;
    const panelY = this.position.y - 120;
    
    // Panel background
    this.p5.fill(0, 20, 40, 200);
    this.p5.rect(panelX, panelY, panelWidth, panelHeight, 10);
    
    // Name
    this.p5.fill(this.speechColor);
    this.p5.textSize(18);
    this.p5.textAlign(this.p5.CENTER, this.p5.TOP);
    this.p5.text(this.name, panelX + panelWidth / 2, panelY + 10);
    
    // Status
    this.p5.fill(255);
    this.p5.textSize(12);
    this.p5.text('GENESIS PROTOCOL ADMINISTRATOR', panelX + panelWidth / 2, panelY + 35);
    
    // Protocol status
    const gameState = window.gameState; // Access gameState from window
    const protocolStatus = gameState.puzzlesSolved.filter(Boolean).length + '/5 FRAGMENTS';
    this.p5.text(protocolStatus, panelX + panelWidth / 2, panelY + 55);
    
    // Reset text alignment
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
  }
  
  // Show character
  show() {
    this.visible = true;
  }
  
  // Hide character
  hide() {
    this.visible = false;
  }
  
  // Set position
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
  
  // Set visibility
  setVisible(visible) {
    this.visible = visible;
  }
  
  // Toggle info mode
  toggleInfo() {
    this.infoMode = !this.infoMode;
  }
  
  // Generate dialogue based on context and personality
  generateDialogue(context) {
    // This would normally check context and use traits to generate appropriate dialogue
    // For now, we'll return placeholder text
    switch(context) {
      case 'greeting':
        return "Genesis Protocol active. I am AIKIRA, custodian of the ancient data sequence.";
      case 'puzzle_hint':
        return "Analyze the pattern carefully. The sequence follows evolutionary logic.";
      case 'success':
        return "Excellent. Protocol fragment unlocked. Proceeding to next sequence node.";
      case 'failure':
        return "Sequence corruption detected. Please attempt recalibration.";
      default:
        return "Continuing Genesis Protocol operations. Please proceed.";
    }
  }
  
  // Handle interaction if clicked
  onClick() {
    this.toggleInfo();
    return true; // Interaction handled
  }
  
  // Special animations for key moments
  playSpecialAnimation(type) {
    switch(type) {
      case 'protocol_activation':
        // Placeholder for special activation animation
        console.log("Playing protocol activation animation");
        break;
      case 'data_transfer':
        // Placeholder for data transfer animation
        console.log("Playing data transfer animation");
        break;
    }
  }
}

// Export for use in other modules
export default Aikira;