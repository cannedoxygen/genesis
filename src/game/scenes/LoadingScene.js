/**
 * AIKIRA: GENESIS PROTOCOL
 * Loading Scene
 * 
 * This scene is displayed while the game is loading assets,
 * connecting to the blockchain, and initializing the game environment.
 */

class LoadingScene extends BaseScene {
  constructor() {
    super('loading', 'Initializing Genesis Protocol');
    
    this.loadingProgress = 0;
    this.targetProgress = 0;
    this.loadingMessages = [
      "Establishing connection to Genesis Protocol...",
      "Scanning for dinosaur DNA fragments...",
      "Initializing AI agents...",
      "Calibrating temporal alignment...",
      "Decrypting ancient data structures...",
      "Establishing Base Network connection...",
      "Preparing puzzle sequences...",
      "Loading visualization matrices..."
    ];
    this.currentMessage = 0;
    this.messageTimer = 0;
    this.glitchIntensity = 0;
    this.initializing = true;
    
    // Particle system for background effects
    this.particles = [];
    this.scanLines = [];
    
    // Grid data for cyber background
    this.grid = {
      size: 30,
      points: [],
      connections: []
    };
  }
  
  // Asset loading
  loadSceneAssets() {
    this.assetsTotal = 2;
    
    // Load logo and any loading-specific assets
    this.assets.logo = loadImage('assets/images/ui/aikira-logo.png', this.assetLoaded.bind(this));
    this.assets.loadingGlow = loadImage('assets/images/effects/loading-glow.png', this.assetLoaded.bind(this));
  }
  
  // Scene entry
  enter() {
    super.enter();
    
    // Reset loading state
    this.loadingProgress = 0;
    this.targetProgress = 0;
    this.currentMessage = 0;
    this.messageTimer = 0;
    this.glitchIntensity = 0;
    this.initializing = true;
    
    // Create particle system
    this.initParticles();
    
    // Create grid points
    this.initGrid();
    
    // Start loading sequence animation
    this.animateLoading();
    
    // Simulate loading progress (in a real scenario, this would come from actual asset loading)
    this.simulateLoading();
  }
  
  // Initialize particle system
  initParticles() {
    this.particles = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        speed: random(0.5, 2),
        color: color(0, random(150, 255), random(150, 255), random(50, 150)),
        angle: random(TWO_PI)
      });
    }
    
    // Create scan lines
    this.scanLines = [];
    for (let i = 0; i < height; i += 4) {
      this.scanLines.push({
        y: i,
        alpha: random(5, 20),
        width: width
      });
    }
  }
  
  // Initialize background grid
  initGrid() {
    this.grid.points = [];
    this.grid.connections = [];
    
    // Create grid points
    const cols = ceil(width / this.grid.size) + 1;
    const rows = ceil(height / this.grid.size) + 1;
    
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        this.grid.points.push({
          x: i * this.grid.size,
          y: j * this.grid.size,
          active: random() < 0.2, // 20% chance to be active initially
          size: random(1, 3),
          pulsePhase: random(TWO_PI)
        });
      }
    }
    
    // Create grid connections
    for (let i = 0; i < this.grid.points.length; i++) {
      // Only connect active points
      if (this.grid.points[i].active) {
        for (let j = i + 1; j < this.grid.points.length; j++) {
          if (this.grid.points[j].active) {
            // Connect only to nearby points
            const dx = this.grid.points[i].x - this.grid.points[j].x;
            const dy = this.grid.points[i].y - this.grid.points[j].y;
            const dist = sqrt(dx * dx + dy * dy);
            
            if (dist < this.grid.size * 2.5) {
              this.grid.connections.push({
                a: i,
                b: j,
                highlight: random() < 0.1 // 10% chance to be highlighted
              });
            }
          }
        }
      }
    }
  }
  
  // Simulate loading process
  simulateLoading() {
    // Simulate different loading stages
    setTimeout(() => { this.targetProgress = 0.15; }, 1000);
    setTimeout(() => { this.targetProgress = 0.35; }, 3000);
    setTimeout(() => { this.targetProgress = 0.65; }, 5000);
    setTimeout(() => { this.targetProgress = 0.85; }, 7000);
    setTimeout(() => { this.targetProgress = 1.0; }, 9000);
    setTimeout(() => { this.finishLoading(); }, 10000);
  }
  
  // Loading animation
  animateLoading() {
    // Update loading message every 1.5 seconds
    setInterval(() => {
      this.currentMessage = (this.currentMessage + 1) % this.loadingMessages.length;
      
      // Increase glitch intensity briefly
      this.glitchIntensity = 1;
      setTimeout(() => {
        this.glitchIntensity = 0;
      }, 200);
    }, 1500);
  }
  
  // Complete loading and transition to next scene
  finishLoading() {
    this.initializing = false;
    
    // After brief pause, go to intro scene
    setTimeout(() => {
      setScene('intro');
    }, 1000);
  }
  
  // Update method called on each frame
  update() {
    // Gradually approach target progress
    if (this.loadingProgress < this.targetProgress) {
      this.loadingProgress += (this.targetProgress - this.loadingProgress) * 0.05;
    }
    
    // Update message timer
    this.messageTimer += 1/60; // assuming 60fps
    
    // Update particles
    this.updateParticles();
    
    // Update grid points activation status
    this.updateGrid();
  }
  
  // Update particles
  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Move particle
      p.x += cos(p.angle) * p.speed;
      p.y += sin(p.angle) * p.speed;
      
      // Slightly change angle for natural movement
      p.angle += random(-0.1, 0.1);
      
      // Reset particles that go offscreen
      if (p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
        p.x = random(width);
        p.y = random(height);
        p.angle = random(TWO_PI);
      }
    }
  }
  
  // Update grid points
  updateGrid() {
    // Occasionally activate new points
    if (random() < 0.02) {
      const randomPoint = floor(random(this.grid.points.length));
      this.grid.points[randomPoint].active = true;
    }
    
    // Update connections based on active points
    if (random() < 0.05) {
      const activePoints = this.grid.points.filter(p => p.active);
      
      if (activePoints.length >= 2) {
        const a = floor(random(activePoints.length));
        let b = floor(random(activePoints.length));
        
        // Make sure b is different from a
        while (b === a) {
          b = floor(random(activePoints.length));
        }
        
        // Find indices in original array
        const indexA = this.grid.points.indexOf(activePoints[a]);
        const indexB = this.grid.points.indexOf(activePoints[b]);
        
        // Check if connection already exists
        const connectionExists = this.grid.connections.some(c => 
          (c.a === indexA && c.b === indexB) || (c.a === indexB && c.b === indexA)
        );
        
        // Add new connection if it doesn't exist
        if (!connectionExists) {
          this.grid.connections.push({
            a: indexA,
            b: indexB,
            highlight: true // New connections are highlighted
          });
        }
      }
    }
  }
  
  // Main render method
  render() {
    // Update before rendering
    this.update();
    
    // Draw background
    this.renderBackground();
    
    // Draw loading elements
    this.renderLoadingElements();
    
    // Draw scan line effect
    this.renderScanLines();
  }
  
  // Render the background
  renderBackground() {
    // Dark background
    background(5, 10, 20);
    
    // Draw grid connections
    stroke(0, 50, 80, 50);
    strokeWeight(1);
    
    for (const conn of this.grid.connections) {
      const a = this.grid.points[conn.a];
      const b = this.grid.points[conn.b];
      
      if (conn.highlight) {
        // Highlighted connections
        const pulse = (sin(frameCount * 0.05) + 1) * 0.5;
        stroke(0, 150 + 100 * pulse, 200 + 55 * pulse, 100);
        strokeWeight(1.5);
      } else {
        stroke(0, 50, 80, 50);
        strokeWeight(1);
      }
      
      line(a.x, a.y, b.x, b.y);
    }
    
    // Draw grid points
    noStroke();
    
    for (const point of this.grid.points) {
      if (point.active) {
        const pulse = (sin(frameCount * 0.05 + point.pulsePhase) + 1) * 0.5;
        fill(0, 150 + 100 * pulse, 200 + 55 * pulse, 150);
        ellipse(point.x, point.y, point.size * (1 + pulse * 0.5), point.size * (1 + pulse * 0.5));
      } else {
        fill(30, 40, 60, 100);
        ellipse(point.x, point.y, point.size, point.size);
      }
    }
    
    // Draw particles
    for (const p of this.particles) {
      fill(p.color);
      ellipse(p.x, p.y, p.size, p.size);
    }
  }
  
  // Render loading UI elements
  renderLoadingElements() {
    push();
    
    // Center everything
    translate(width / 2, height / 2);
    
    // Apply glitch effect
    if (this.glitchIntensity > 0) {
      translate(random(-5, 5) * this.glitchIntensity, random(-5, 5) * this.glitchIntensity);
    }
    
    // Draw logo if loaded
    if (this.assets.logo) {
      imageMode(CENTER);
      
      // Scale logo to reasonable size
      const logoScale = min(width, height) * 0.0005;
      const logoWidth = this.assets.logo.width * logoScale;
      const logoHeight = this.assets.logo.height * logoScale;
      
      // Position above center
      image(this.assets.logo, 0, -height * 0.15, logoWidth, logoHeight);
    }
    
    // Draw loading bar
    const barWidth = min(width * 0.6, 400);
    const barHeight = 10;
    const barX = -barWidth / 2;
    const barY = height * 0.1;
    
    // Bar background
    fill(0, 20, 40);
    noStroke();
    rect(barX, barY, barWidth, barHeight, barHeight / 2);
    
    // Progress fill
    fill(0, 200, 255);
    rect(barX, barY, barWidth * this.loadingProgress, barHeight, barHeight / 2);
    
    // Glow effect for loading bar
    if (this.assets.loadingGlow) {
      tint(0, 200, 255, 150);
      image(
        this.assets.loadingGlow, 
        barX + (barWidth * this.loadingProgress) / 2, 
        barY + barHeight / 2, 
        barWidth * this.loadingProgress, 
        barHeight * 5
      );
      noTint();
    }
    
    // Loading message
    fill(0, 200, 255);
    textSize(16);
    textAlign(CENTER, CENTER);
    
    // Apply text glitch effect
    if (this.glitchIntensity > 0 && random() < 0.5) {
      fill(255, 100, 100);
      text(this.loadingMessages[this.currentMessage].replace(/[aeiou]/g, 'x'), 
           random(-3, 3), barY + 40 + random(-3, 3));
      fill(0, 200, 255);
    }
    
    text(this.loadingMessages[this.currentMessage], 0, barY + 40);
    
    // Loading percentage
    textSize(14);
    text(`${floor(this.loadingProgress * 100)}%`, 0, barY + 70);
    
    // System status
    if (!this.initializing) {
      fill(0, 255, 100);
      textSize(20);
      text("GENESIS PROTOCOL INITIALIZED", 0, barY + 110);
      
      // Press any key prompt with blink effect
      if (sin(frameCount * 0.1) > 0) {
        fill(255);
        textSize(14);
        text("CLICK TO CONTINUE", 0, barY + 150);
      }
    }
    
    pop();
  }
  
  // Render scan lines effect
  renderScanLines() {
    noStroke();
    
    // Draw horizontal scan lines
    for (const line of this.scanLines) {
      fill(255, line.alpha);
      rect(0, line.y, line.width, 1);
    }
    
    // Draw a moving scan line
    const scanPosition = (frameCount % height);
    fill(0, 200, 255, 30);
    rect(0, scanPosition, width, 2);
    
    // CRT vignette effect
    drawingContext.fillStyle = 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)';
    drawingContext.fillRect(0, 0, width, height);
  }
  
  // Handle mouse click
  mousePressed() {
    // Skip to next scene if loading is complete
    if (!this.initializing) {
      setScene('intro');
      return true;
    }
    
    return false;
  }
  
  // Handle resize
  resize() {
    super.resize();
    
    // Reinitialize grid and particles for new size
    this.initGrid();
    this.initParticles();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = LoadingScene;
}