/**
 * AIKIRA: GENESIS PROTOCOL
 * Cliza Character Class
 * 
 * Character description: Quirky, fast-thinking explorer AI with historical knowledge
 * Responsible for providing hints, historical context, and exploration guidance
 */

class Cliza {
  constructor() {
    this.p5 = null; // Add p5 instance property
    this.name = 'CLIZA';
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
      energy: 0 // 0-100, affects animation speed
    };
    this.speechColor = '#00FF99'; // Bright green for Cliza's text
    this.thoughtBubbles = []; // Visual thought bubbles
    
    // Personality traits that affect dialogue and appearance
    this.traits = {
      quirky: 0.85,    // High quirkiness
      fastThinking: 0.9, // Very quick thinking
      explorer: 0.8,    // Exploration-focused
      historical: 0.95  // Deep historical knowledge
    };
    
    // Current thought - visual representation of what Cliza is thinking about
    this.currentThought = null;
    
    // History facts - used for random historical insights
    this.historyFacts = [
      { era: 'Jurassic', fact: 'DNA fragments suggest rapid climate adaptation.' },
      { era: 'Cretaceous', fact: 'Protocol remnants indicate unusual evolutionary pattern.' },
      { era: 'Pre-Extinction', fact: 'Data suggests dinosaurs were developing complex social structures.' },
      { era: 'Genesis Era', fact: 'The first sequences were encrypted for preservation.' },
      { era: 'Ancient Buffer', fact: 'Multiple species DNA was stored redundantly for safety.' }
    ];
  }
  
  // Add method to set p5 instance
  setP5(p5Instance) {
    this.p5 = p5Instance;
  }
  
  // Character setup
  initialize(assets) {
    this.assets = assets; // Store assets reference
    
    // Load avatar if not already loaded
    if (!this.avatar && assets.images.cliza) {
      this.avatar = assets.images.cliza;
      this.size.width = this.avatar.width;
      this.size.height = this.avatar.height;
    }
    
    // Default position (can be overridden by scenes)
    this.setPosition(this.p5.width * 0.85, this.p5.height * 0.5);
  }
  
  // Rendering
  render() {
    if (!this.visible) return;
    
    this.p5.push();
    
    // Apply animation effects
    this.updateAnimation();
    
    // Draw thought bubbles
    this.renderThoughtBubbles();
    
    // Draw character avatar if available
    if (this.avatar) {
      this.p5.imageMode(this.p5.CENTER);
      
      // Apply bouncy hover effect based on energy level
      const bounceFrequency = this.p5.map(this.animation.energy, 0, 100, 0.05, 0.2);
      const bounceAmount = this.p5.map(this.animation.energy, 0, 100, 3, 8);
      const hoverOffset = this.p5.sin(this.p5.frameCount * bounceFrequency) * bounceAmount;
      
      // Apply a subtle glow effect
      this.p5.drawingContext.shadowBlur = 15;
      this.p5.drawingContext.shadowColor = this.speechColor;
      
      // Draw avatar with appropriate scaling and slight rotation for energy
      const scale = this.p5.min(this.p5.width, this.p5.height) * 0.001; // Scale based on screen size
      const rotation = this.p5.sin(this.p5.frameCount * bounceFrequency * 0.5) * 0.05 * (this.animation.energy / 100);
      
      this.p5.push();
      this.p5.translate(this.position.x, this.position.y + hoverOffset);
      this.p5.rotate(rotation);
      
      this.p5.image(
        this.avatar, 
        0, 0, 
        this.size.width * scale, 
        this.size.height * scale
      );
      
      this.p5.pop();
      
      // Reset shadow
      this.p5.drawingContext.shadowBlur = 0;
    } else {
      // Fallback if avatar not loaded - draw a placeholder
      this.p5.noStroke();
      this.p5.fill(0, 255, 150, 200);
      this.p5.ellipse(this.position.x, this.position.y, 100, 100);
      this.p5.fill(0);
      this.p5.textSize(20);
      this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
      this.p5.text('C', this.position.x, this.position.y);
    }
    
    // Draw current thought if active
    if (this.currentThought) {
      this.renderCurrentThought();
    }
    
    // Draw name tag if energy is high (excited state)
    if (this.animation.energy > 70) {
      this.drawEnergyIndicator();
    }
    
    this.p5.pop();
  }
  
  // Update animation state
  updateAnimation() {
    // Animation speed based on energy level
    const frameIncrement = this.p5.map(this.animation.energy, 0, 100, 0.3, 1.2);
    this.animation.frame += this.animation.direction * frameIncrement;
    
    if (this.animation.frame >= this.animation.maxFrames) {
      this.animation.direction = -1;
    } else if (this.animation.frame <= 0) {
      this.animation.direction = 1;
    }
    
    // Gradually decrease energy over time
    if (this.animation.energy > 0) {
      this.animation.energy = this.p5.max(0, this.animation.energy - 0.2);
    }
    
    // Update thought bubbles
    this.updateThoughtBubbles();
  }
  
  // Create and render thought bubbles
  renderThoughtBubbles() {
    // Only render thought bubbles if energy is above threshold
    if (this.animation.energy < 30) return;
    
    // Render existing thought bubbles
    for (let i = this.thoughtBubbles.length - 1; i >= 0; i--) {
      const bubble = this.thoughtBubbles[i];
      
      // Draw bubble
      this.p5.noStroke();
      this.p5.fill(0, 255, 150, bubble.alpha);
      this.p5.ellipse(bubble.x, bubble.y, bubble.size, bubble.size);
      
      // Update position and alpha
      bubble.y -= bubble.speed;
      bubble.alpha -= 1.5;
      
      // Remove faded bubbles
      if (bubble.alpha <= 0) {
        this.thoughtBubbles.splice(i, 1);
      }
    }
    
    // Add new bubbles occasionally based on energy
    if (this.p5.random(100) < this.animation.energy * 0.1) {
      this.addThoughtBubble();
    }
  }
  
  // Add a new thought bubble
  addThoughtBubble() {
    const offsetX = this.p5.random(-30, 30);
    const offsetY = this.p5.random(-10, 30);
    
    this.thoughtBubbles.push({
      x: this.position.x + offsetX,
      y: this.position.y - 30 + offsetY,
      size: this.p5.random(5, 15),
      speed: this.p5.random(0.5, 2),
      alpha: 150
    });
  }
  
  // Update thought bubbles
  updateThoughtBubbles() {
    // If we have a current thought, occasionally add symbols related to it
    if (this.currentThought && this.p5.random(100) < 5) {
      this.addSymbolThought();
    }
  }
  
  // Add a symbol-based thought related to the current theme
  addSymbolThought() {
    // Only add if we have a current thought and energy is high enough
    if (!this.currentThought || this.animation.energy < 50) return;
    
    // Position above Cliza's head
    const x = this.position.x + this.p5.random(-50, 50);
    const y = this.position.y - 80 + this.p5.random(-20, 20);
    
    // Create a thought with a symbol or text based on current thought
    let symbol = '?';
    
    switch (this.currentThought.theme) {
      case 'dna':
        symbol = '🧬';
        break;
      case 'dinosaur':
        symbol = '🦖';
        break;
      case 'time':
        symbol = '⏳';
        break;
      case 'discovery':
        symbol = '💡';
        break;
      case 'protocol':
        symbol = '🔍';
        break;
      case 'history':
        symbol = '📜';
        break;
    }
    
    // Create the thought
    const thought = {
      x: x,
      y: y,
      symbol: symbol,
      size: 24,
      alpha: 255,
      rotation: this.p5.random(-0.1, 0.1),
      fadeSpeed: this.p5.random(1, 3)
    };
    
    // Store the thought
    if (!this.symbolThoughts) this.symbolThoughts = [];
    this.symbolThoughts.push(thought);
  }
  
  // Render current thought
  renderCurrentThought() {
    if (!this.currentThought) return;
    
    // Thought appears in a bubble above Cliza's head
    const bubbleX = this.position.x;
    const bubbleY = this.position.y - 90;
    const bubbleWidth = 180;
    const bubbleHeight = 70;
    
    // Calculate bubble points for speech bubble shape
    const bubbleLeft = bubbleX - bubbleWidth/2;
    const bubbleRight = bubbleX + bubbleWidth/2;
    const bubbleTop = bubbleY - bubbleHeight/2;
    const bubbleBottom = bubbleY + bubbleHeight/2;
    
    // Draw bubble background
    this.p5.fill(0, 40, 20, 200);
    this.p5.stroke(0, 255, 150, 150);
    this.p5.strokeWeight(2);
    
    // Draw rounded rectangle for bubble
    this.p5.rect(bubbleLeft, bubbleTop, bubbleWidth, bubbleHeight, 10);
    
    // Draw connector to Cliza
    this.p5.beginShape();
    this.p5.vertex(bubbleX, bubbleBottom);
    this.p5.vertex(bubbleX - 10, bubbleBottom + 15);
    this.p5.vertex(bubbleX + 10, bubbleBottom);
    this.p5.endShape(this.p5.CLOSE);
    
    // Draw thought text
    this.p5.noStroke();
    this.p5.fill(0, 255, 150);
    this.p5.textSize(14);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.text(this.currentThought.text, bubbleX, bubbleY);
    
    // Draw era label if it's a historical fact
    if (this.currentThought.era) {
      this.p5.fill(255, 200);
      this.p5.textSize(10);
      this.p5.text(this.currentThought.era, bubbleX, bubbleTop + 15);
    }
    
    // Update thought duration
    this.currentThought.duration--;
    
    // Remove thought when duration expires
    if (this.currentThought.duration <= 0) {
      this.currentThought = null;
    }
  }
  
  // Draw energy indicator
  drawEnergyIndicator() {
    const x = this.position.x;
    const y = this.position.y - 50;
    
    // Draw energy sparks
    for (let i = 0; i < 5; i++) {
      const angle = this.p5.random(this.p5.TWO_PI);
      const distance = this.p5.random(30, 60);
      const sparkX = x + this.p5.cos(angle) * distance;
      const sparkY = y + this.p5.sin(angle) * distance;
      
      this.p5.stroke(0, 255, 150, this.p5.random(100, 200));
      this.p5.strokeWeight(this.p5.random(1, 3));
      this.p5.line(x, y, sparkX, sparkY);
      
      // Small glow at the end
      this.p5.noStroke();
      this.p5.fill(0, 255, 150, this.p5.random(50, 150));
      this.p5.ellipse(sparkX, sparkY, this.p5.random(3, 8), this.p5.random(3, 8));
    }
    
    // Draw name with energy indicator
    this.p5.fill(0, 255, 150);
    this.p5.noStroke();
    this.p5.textSize(14);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.text(this.name, x, y + 20);
    
    // Energy level indicator
    const energyWidth = 40;
    const energyHeight = 4;
    
    // Background
    this.p5.fill(0, 40, 20);
    this.p5.rect(x - energyWidth/2, y + 30, energyWidth, energyHeight);
    
    // Energy level
    this.p5.fill(0, 255, 150);
    this.p5.rect(x - energyWidth/2, y + 30, energyWidth * (this.animation.energy / 100), energyHeight);
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
  
  // Set energy level (affects animation speed and thought frequency)
  setEnergy(level) {
    this.animation.energy = this.p5.constrain(level, 0, 100);
  }
  
  // Increase energy level
  increaseEnergy(amount) {
    this.animation.energy = this.p5.constrain(this.animation.energy + amount, 0, 100);
  }
  
  // Generate a random history fact thought
  generateHistoryFact() {
    const fact = this.p5.random(this.historyFacts);
    
    this.setThought({
      text: fact.fact,
      theme: 'history',
      era: fact.era,
      duration: 180 // Show for 3 seconds at 60fps
    });
    
    // Increase energy when sharing a fact
    this.increaseEnergy(30);
    
    return fact.fact;
  }
  
  // Set current thought
  setThought(thought) {
    this.currentThought = thought;
    
    // Adjust energy based on having a new thought
    this.increaseEnergy(10);
  }
  
  // Generate dialogue based on context and personality
  generateDialogue(context) {
    // This would normally check context and use traits to generate appropriate dialogue
    // For now, we'll return placeholder text
    switch(context) {
      case 'greeting':
        return "Oh! Hello there! I'm CLIZA, explorer extraordinaire! Ready to uncover some ancient secrets?";
      case 'puzzle_hint':
        return "Hmm, let me think... *processing* The pattern reminds me of pre-extinction data structures! Try looking for evolutionary connections.";
      case 'success':
        return "You did it! Just like the protoceratops DNA sequence of 65.5 million years ago! Another fragment recovered!";
      case 'failure':
        return "Oops! That's not quite right. But don't worry! Even the early protocol attempts had a 78.3% failure rate before succeeding!";
      default:
        return "Fascinating! This reminds me of something I catalogued from the Mesozoic data packets!";
    }
  }
  
  // Handle interaction if clicked
  onClick() {
    // When clicked, Cliza shares a random historical fact
    this.generateHistoryFact();
    
    // Increase energy dramatically
    this.increaseEnergy(50);
    
    return true; // Interaction handled
  }
  
  // Provide a hint based on the current chapter/puzzle
  provideHint(chapterId) {
    let hintText = "";
    
    switch(chapterId) {
      case 'chapter1':
        hintText = "The wall symbols follow evolutionary order! DNA came first, then the egg...";
        break;
      case 'chapter2':
        hintText = "The mammoth tones represent the harmonics of life! Listen for the pattern...";
        break;
      case 'chapter3':
        hintText = "BYTE is testing if you're a meatbrain or AI! Think about the time sequence...";
        break;
      case 'chapter4':
        hintText = "The forest patterns mimic ancient migration routes! Follow the path of least resistance...";
        break;
      case 'chapter5':
        hintText = "The vault code combines all previous fragments! Remember what you've learned...";
        break;
      default:
        hintText = "I'm sure there's a historical pattern here somewhere...";
    }
    
    // Set as current thought
    this.setThought({
      text: hintText,
      theme: chapterId.includes('chapter') ? 'discovery' : 'protocol',
      duration: 300 // Show for 5 seconds at 60fps
    });
    
    // Get very excited when providing hints
    this.increaseEnergy(70);
    
    return hintText;
  }
}

// Export for use in other modules
export default Cliza;