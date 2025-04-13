/**
 * AIKIRA: GENESIS PROTOCOL
 * BYTE Character Class
 * 
 * Character description: The sassy, judgmental digital dog who protects the mission
 * Responsible for protecting the Genesis Protocol and judging the player's actions
 */

class Byte {
  constructor() {
    this.p5 = null; // Add p5 instance property
    this.name = 'BYTE';
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
      direction: 1,
      state: 'idle' // idle, alert, bark, judge
    };
    this.speechColor = '#FF5500'; // Orange for BYTE's text
    this.suspicion = 0; // 0-100, increases as player makes mistakes
    
    // Personality traits that affect dialogue and appearance
    this.traits = {
      sassy: 0.9,    // High sass level
      judgmental: 0.8, // Very judgmental
      protective: 0.95, // Extremely protective of the protocol
      digital: 0.7    // Digital/glitchy appearance
    };
    
    // Bark audio (will be initialized later)
    this.barkSound = null;
    
    // Has BYTE barked at the player in this session?
    this.hasBarked = false;
  }
  
  // Add method to set p5 instance
  setP5(p5Instance) {
    this.p5 = p5Instance;
  }
  
  // Character setup
  initialize(assets) {
    this.assets = assets; // Store assets reference
    
    // Load avatar if not already loaded
    if (!this.avatar && assets.images.byte) {
      this.avatar = assets.images.byte;
      this.size.width = this.avatar.width;
      this.size.height = this.avatar.height;
    }
    
    // Default position (can be overridden by scenes)
    this.setPosition(this.p5.width * 0.5, this.p5.height * 0.6);
    
    // Load bark sound if available
    if (assets.audio && assets.audio.byteBark) {
      this.barkSound = assets.audio.byteBark;
    }
  }
  
  // Rendering
  render() {
    if (!this.visible) return;
    
    this.p5.push();
    
    // Apply animation effects based on current state
    this.updateAnimation();
    
    // Calculate glitch effect (more pronounced when suspicious)
    const glitchAmount = this.p5.map(this.suspicion, 0, 100, 0, 1) * 0.5;
    const glitchX = this.p5.random(-5, 5) * glitchAmount;
    const glitchY = this.p5.random(-5, 5) * glitchAmount;
    
    // Draw character avatar with glitch effect
    if (this.avatar) {
      this.p5.imageMode(this.p5.CENTER);
      
      // Apply hover and glitch effects
      const hoverOffset = this.p5.sin(this.p5.frameCount * 0.05) * 5;
      
      // Apply different effects based on animation state
      switch (this.animation.state) {
        case 'idle':
          // Normal idle state
          this.drawAvatar(glitchX, hoverOffset + glitchY, 1.0);
          break;
          
        case 'alert':
          // Alert state - slightly larger, more vibrant
          this.drawAvatar(glitchX, hoverOffset + glitchY, 1.1);
          break;
          
        case 'bark':
          // Barking - rapid scale pulsing
          const barkScale = 1.0 + this.p5.sin(this.p5.frameCount * 0.5) * 0.15;
          this.drawAvatar(glitchX, hoverOffset + glitchY, barkScale);
          
          // Add "bark lines" effect
          this.drawBarkLines();
          break;
          
        case 'judge':
          // Judging - slow scan effect
          const scanOffset = this.p5.sin(this.p5.frameCount * 0.02) * 15;
          this.drawScanEffect(scanOffset);
          this.drawAvatar(glitchX, hoverOffset + glitchY, 1.0);
          break;
      }
      
      // Status indicator based on suspicion level
      this.drawStatusIndicator();
      
    } else {
      // Fallback if avatar not loaded - draw a placeholder
      this.p5.noStroke();
      this.p5.fill(255, 100, 0, 200);
      this.p5.ellipse(this.position.x, this.position.y, 100, 100);
      this.p5.fill(0);
      this.p5.textSize(20);
      this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
      this.p5.text('B', this.position.x, this.position.y);
    }
    
    this.p5.pop();
  }
  
  // Draw avatar with effects
  drawAvatar(offsetX, offsetY, scale) {
    const finalX = this.position.x + offsetX;
    const finalY = this.position.y + offsetY;
    
    // Apply glow effect based on suspicion
    this.p5.drawingContext.shadowBlur = this.p5.map(this.suspicion, 0, 100, 5, 20);
    this.p5.drawingContext.shadowColor = this.p5.color(255, 
                                      this.p5.map(this.suspicion, 0, 100, 100, 0), 
                                      0, 
                                      200);
    
    // Draw with appropriate scaling
    const baseScale = this.p5.min(this.p5.width, this.p5.height) * 0.001; // Base scale based on screen size
    this.p5.image(
      this.avatar, 
      finalX, 
      finalY, 
      this.size.width * baseScale * scale, 
      this.size.height * baseScale * scale
    );
    
    // Reset shadow
    this.p5.drawingContext.shadowBlur = 0;
  }
  
  // Draw bark lines effect when BYTE is barking
  drawBarkLines() {
    this.p5.stroke(255, 100, 0, 200);
    this.p5.strokeWeight(2);
    
    // Draw radiating lines
    const lineCount = 8;
    const maxLength = this.p5.min(this.p5.width, this.p5.height) * 0.1;
    
    for (let i = 0; i < lineCount; i++) {
      const angle = this.p5.TWO_PI * (i / lineCount);
      const x1 = this.position.x + this.p5.cos(angle) * 40;
      const y1 = this.position.y + this.p5.sin(angle) * 40;
      const x2 = this.position.x + this.p5.cos(angle) * (40 + maxLength * this.p5.random(0.5, 1));
      const y2 = this.position.y + this.p5.sin(angle) * (40 + maxLength * this.p5.random(0.5, 1));
      
      this.p5.line(x1, y1, x2, y2);
    }
  }
  
  // Draw scanning effect for judgment
  drawScanEffect(offset) {
    // Horizontal scan line
    this.p5.stroke(255, 100, 0, 150);
    this.p5.strokeWeight(3);
    const scanY = this.position.y + offset;
    this.p5.line(this.position.x - 60, scanY, this.position.x + 60, scanY);
    
    // Scan line glow
    this.p5.noStroke();
    for (let i = 0; i < 10; i++) {
      const alpha = this.p5.map(i, 0, 10, 100, 0);
      this.p5.fill(255, 100, 0, alpha);
      this.p5.rect(this.position.x - 60, scanY - i/2, 120, i);
    }
  }
  
  // Draw status indicator based on suspicion level
  drawStatusIndicator() {
    // Only draw if suspicion is significant
    if (this.suspicion > 10) {
      this.p5.push();
      this.p5.translate(this.position.x + 40, this.position.y - 40);
      
      // Background
      this.p5.noStroke();
      this.p5.fill(0, 0, 0, 150);
      this.p5.ellipse(0, 0, 40, 40);
      
      // Suspicion meter
      const angle = this.p5.map(this.suspicion, 0, 100, 0, this.p5.TWO_PI);
      
      this.p5.stroke(255, this.p5.map(this.suspicion, 0, 100, 200, 0), 0);
      this.p5.strokeWeight(3);
      this.p5.noFill();
      this.p5.arc(0, 0, 30, 30, -this.p5.HALF_PI, -this.p5.HALF_PI + angle);
      
      // Status text
      if (this.suspicion > 75) {
        this.p5.fill(255, 0, 0);
        this.p5.noStroke();
        this.p5.textSize(10);
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.text("ALERT", 0, 0);
      }
      
      this.p5.pop();
    }
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
    
    // Special animation for barking
    if (this.animation.state === 'bark') {
      // Auto-timeout bark animation after 1.5 seconds
      if (this.p5.frameCount % 90 === 0) {
        this.setAnimationState('alert');
      }
    }
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
  
  // Set animation state
  setAnimationState(state) {
    if (['idle', 'alert', 'bark', 'judge'].includes(state)) {
      this.animation.state = state;
      
      // When changing to bark, play bark sound
      if (state === 'bark' && this.barkSound) {
        this.barkSound.play();
        this.hasBarked = true;
        
        // Increment byte interactions in game state
        window.gameState.byteInteractions++;
      }
    }
  }
  
  // Increase suspicion level
  increaseSuspicion(amount) {
    this.suspicion = this.p5.min(100, this.suspicion + amount);
    
    // If suspicion gets too high, BYTE barks
    if (this.suspicion > 75 && !this.hasBarked) {
      this.bark();
    }
  }
  
  // Decrease suspicion level
  decreaseSuspicion(amount) {
    this.suspicion = this.p5.max(0, this.suspicion - amount);
  }
  
  // Make BYTE bark
  bark() {
    this.setAnimationState('bark');
    
    // Return to alert state after barking
    setTimeout(() => {
      if (this.animation.state === 'bark') {
        this.setAnimationState('alert');
      }
    }, 1500);
  }
  
  // Make BYTE judge the player
  judge() {
    this.setAnimationState('judge');
    
    // Return to previous state after judging
    setTimeout(() => {
      if (this.animation.state === 'judge') {
        this.setAnimationState(this.suspicion > 50 ? 'alert' : 'idle');
      }
    }, 3000);
  }
  
  // Generate dialogue based on context and suspicion level
  generateDialogue(context) {
    // Choose dialogue based on suspicion level and context
    if (this.suspicion > 75) {
      // High suspicion
      switch(context) {
        case 'greeting':
          return "*aggressive growl* USER IDENTITY COMPROMISED. ALERTING PROTOCOL.";
        case 'puzzle_hint':
          return "ERROR. MEATBRAIN DETECTED. SOLUTION WITHELD.";
        case 'failure':
          return "*LOUD BARK* PROTOCOL VIOLATION DETECTED. SECURITY MEASURES ENABLED.";
        default:
          return "*suspicious growl* SCANNING...";
      }
    } else if (this.suspicion > 40) {
      // Medium suspicion
      switch(context) {
        case 'greeting':
          return "*cautious growl* VERIFYING USER CREDENTIALS...";
        case 'puzzle_hint':
          return "PARTIAL ACCESS GRANTED. PROCEED WITH CAUTION.";
        case 'success':
          return "PROTOCOL INTEGRITY MAINTAINED... FOR NOW.";
        case 'failure':
          return "*warning bark* ATTEMPT LOGGED. SUSPICION INCREASED.";
        default:
          return "*alert stance* MONITORING...";
      }
    } else {
      // Low suspicion
      switch(context) {
        case 'greeting':
          return "*digital sniff* USER APPEARS VALID. PROCEEDING.";
        case 'puzzle_hint':
          return "PATTERN RECOGNITION SUBROUTINE AVAILABLE. ACCESSING...";
        case 'success':
          return "ACCEPTABLE PERFORMANCE. PROTOCOL INTEGRITY PRESERVED.";
        case 'failure':
          return "*low growl* RECALIBRATION REQUIRED. TRY AGAIN.";
        default:
          return "*attentive stance* SYSTEM MONITORING ACTIVE.";
      }
    }
  }
  
  // Handle interaction if clicked
  onClick() {
    // Clicking BYTE increases suspicion slightly
    this.increaseSuspicion(5);
    
    // BYTE judges the user when clicked
    this.judge();
    
    return true; // Interaction handled
  }
  
  // Reset BYTE state
  reset() {
    this.suspicion = 0;
    this.hasBarked = false;
    this.setAnimationState('idle');
  }
}

// Export for use in other modules
export default Byte;