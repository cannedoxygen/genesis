/**
 * AIKIRA: GENESIS PROTOCOL
 * Symbol Puzzle for Chapter 1 - Cryptic Wall
 * 
 * This module handles the symbol sequence puzzle logic
 * where players need to activate symbols in the correct order.
 */

class SymbolPuzzle {
    constructor() {
      // Puzzle configuration
      this.correctSequence = ['dna', 'egg', 'claw', 'eye', 'star'];
      this.userSequence = [];
      this.symbols = [];
      this.solved = false;
      this.attempts = 0;
      this.maxAttempts = 3; // After this many failures, BYTE will provide a hint
      
      // Animation properties
      this.activationEffect = {
        active: false,
        progress: 0,
        duration: 60, // frames
        symbolIndex: null
      };
      
      // Event callbacks
      this.onSuccess = null;
      this.onFailure = null;
      this.onSymbolActivated = null;
      this.onByteWarning = null;
      
      // Sound effects (will be set externally)
      this.sounds = {
        activate: null,
        success: null,
        failure: null
      };
    }
    
    /**
     * Initialize the puzzle with symbol positions and properties
     * @param {Array} positions Array of position objects {type, x, y, size}
     */
    initialize(positions) {
      this.userSequence = [];
      this.solved = false;
      this.attempts = 0;
      
      // Create symbol objects
      this.symbols = positions.map((pos, index) => {
        return {
          type: pos.type,
          x: pos.x,
          y: pos.y,
          size: pos.size || 50,
          activated: false,
          clickable: true,
          pulseOffset: random(TWO_PI),
          isHovered: false,
          index: index
        };
      });
      
      console.log('Symbol puzzle initialized with', this.symbols.length, 'symbols');
    }
    
    /**
     * Update the puzzle state
     */
    update() {
      // Update activation effect
      if (this.activationEffect.active) {
        this.activationEffect.progress += 1/this.activationEffect.duration;
        
        if (this.activationEffect.progress >= 1) {
          this.activationEffect.active = false;
          this.activationEffect.progress = 0;
        }
      }
    }
    
    /**
     * Render the puzzle
     */
    render() {
      // Render each symbol
      for (const symbol of this.symbols) {
        this.renderSymbol(symbol);
      }
      
      // Render sequence progress if any symbols are activated
      if (this.userSequence.length > 0) {
        this.renderSequenceProgress();
      }
    }
    
    /**
     * Render a single symbol
     * @param {Object} symbol Symbol object to render
     */
    renderSymbol(symbol) {
      push();
      translate(symbol.x, symbol.y);
      
      // Determine if this symbol is being activated
      const isActivating = this.activationEffect.active && 
                          this.activationEffect.symbolIndex === symbol.index;
      
      // Pulse effect for unactivated symbols
      let glowAmount = 0;
      
      if (!symbol.activated) {
        glowAmount = map(sin(frameCount * 0.05 + symbol.pulseOffset), -1, 1, 0.5, 1);
      } else {
        // Activated symbols glow brighter
        glowAmount = 1.2;
      }
      
      // Hover effect
      if (symbol.isHovered && symbol.clickable) {
        glowAmount *= 1.3;
      }
      
      // Activation animation effect
      if (isActivating) {
        const activationProgress = this.activationEffect.progress;
        const expandScale = 1 + sin(activationProgress * PI) * 0.5;
        scale(expandScale);
        
        // Add extra glow during activation
        glowAmount = map(sin(activationProgress * PI * 2), -1, 1, 1.2, 1.8);
      }
      
      // Draw glow effect
      noStroke();
      
      // Determine color based on status and type
      let glowColor;
      
      if (symbol.activated) {
        // Activated color with type variation
        switch(symbol.type) {
          case 'dna':
            glowColor = color(0, 200, 255, 100 * glowAmount);
            break;
          case 'egg':
            glowColor = color(150, 200, 255, 100 * glowAmount);
            break;
          case 'claw':
            glowColor = color(200, 150, 255, 100 * glowAmount);
            break;
          case 'eye':
            glowColor = color(255, 150, 200, 100 * glowAmount);
            break;
          case 'star':
            glowColor = color(255, 200, 150, 100 * glowAmount);
            break;
          default:
            glowColor = color(0, 200, 255, 100 * glowAmount);
        }
      } else {
        // Unactivated, default glow
        glowColor = color(0, 200, 255, 100 * glowAmount);
      }
      
      fill(glowColor);
      ellipse(0, 0, symbol.size * 1.5, symbol.size * 1.5);
      
      // Draw symbol image if available
      if (assets && assets.symbols && assets.symbols[symbol.type]) {
        imageMode(CENTER);
        tint(255, 255 * glowAmount);
        image(assets.symbols[symbol.type], 0, 0, symbol.size, symbol.size);
        noTint();
      } else {
        // Fallback if image not available
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(symbol.size * 0.5);
        text(symbol.type.charAt(0).toUpperCase(), 0, 0);
      }
      
      pop();
    }
    
    /**
     * Render the sequence progress indicator
     */
    renderSequenceProgress() {
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
          if (assets && assets.symbols && assets.symbols[symbolType]) {
            imageMode(CENTER);
            image(assets.symbols[symbolType], x, y + slotHeight/2, slotSize * 0.8, slotSize * 0.8);
          } else {
            // Fallback
            fill(0, 200, 255);
            textAlign(CENTER, CENTER);
            textSize(slotSize * 0.5);
            text(symbolType.charAt(0).toUpperCase(), x, y + slotHeight/2);
          }
        }
      }
    }
    
    /**
     * Check if mouse is hovering over any symbol
     * @param {number} mouseX Mouse X position
     * @param {number} mouseY Mouse Y position
     */
    checkHover(mouseX, mouseY) {
      let hoveredSymbol = null;
      
      for (const symbol of this.symbols) {
        // Skip if not clickable
        if (!symbol.clickable) {
          symbol.isHovered = false;
          continue;
        }
        
        // Calculate distance to symbol center
        const d = dist(mouseX, mouseY, symbol.x, symbol.y);
        
        // Check if within symbol radius
        if (d < symbol.size / 2) {
          symbol.isHovered = true;
          hoveredSymbol = symbol;
        } else {
          symbol.isHovered = false;
        }
      }
      
      return hoveredSymbol;
    }
    
    /**
     * Handle click on a symbol
     * @param {number} mouseX Mouse X position
     * @param {number} mouseY Mouse Y position
     * @returns {boolean} True if a symbol was clicked
     */
    handleClick(mouseX, mouseY) {
      // Find clicked symbol
      for (const symbol of this.symbols) {
        // Skip if not clickable
        if (!symbol.clickable) continue;
        
        // Calculate distance to symbol center
        const d = dist(mouseX, mouseY, symbol.x, symbol.y);
        
        // Check if within symbol radius
        if (d < symbol.size / 2) {
          this.activateSymbol(symbol);
          return true;
        }
      }
      
      return false;
    }
    
    /**
     * Activate a symbol and add to user sequence
     * @param {Object} symbol Symbol to activate
     */
    activateSymbol(symbol) {
      // Skip if already activated
      if (symbol.activated) return;
      
      // Mark as activated and not clickable
      symbol.activated = true;
      symbol.clickable = false;
      
      // Add to user sequence
      this.userSequence.push(symbol.type);
      
      // Play activation sound if available
      if (this.sounds.activate) {
        this.sounds.activate.play();
      }
      
      // Start activation effect
      this.activationEffect.active = true;
      this.activationEffect.progress = 0;
      this.activationEffect.symbolIndex = symbol.index;
      
      // Trigger callback
      if (this.onSymbolActivated) {
        this.onSymbolActivated(symbol.type, this.userSequence.length);
      }
      
      // Check if sequence is correct so far
      this.checkSequence();
    }
    
    /**
     * Check if the user's sequence matches the correct sequence so far
     */
    checkSequence() {
      const currentLength = this.userSequence.length;
      
      // Check if current sequence is correct so far
      for (let i = 0; i < currentLength; i++) {
        if (this.userSequence[i] !== this.correctSequence[i]) {
          // Incorrect sequence - reset
          this.handleFailure();
          return;
        }
      }
      
      // If we've completed the full sequence and it's correct
      if (currentLength === this.correctSequence.length) {
        this.handleSuccess();
      }
    }
    
    /**
     * Handle successful puzzle completion
     */
    handleSuccess() {
      this.solved = true;
      
      // Play success sound if available
      if (this.sounds.success) {
        this.sounds.success.play();
      }
      
      // Trigger callback
      if (this.onSuccess) {
        this.onSuccess();
      }
      
      console.log('Symbol puzzle solved successfully!');
    }
    
    /**
     * Handle incorrect sequence
     */
    handleFailure() {
      // Play failure sound if available
      if (this.sounds.failure) {
        this.sounds.failure.play();
      }
      
      // Increment attempts
      this.attempts++;
      
      // Check if we should trigger BYTE warning
      if (this.attempts >= this.maxAttempts && this.onByteWarning) {
        this.onByteWarning();
      }
      
      // Reset user sequence
      this.userSequence = [];
      
      // Make all symbols clickable again
      for (const symbol of this.symbols) {
        symbol.activated = false;
        symbol.clickable = true;
      }
      
      // Trigger callback
      if (this.onFailure) {
        this.onFailure(this.attempts);
      }
      
      console.log('Symbol puzzle attempt failed. Attempts:', this.attempts);
    }
    
    /**
     * Reset the puzzle
     */
    reset() {
      this.userSequence = [];
      this.solved = false;
      this.attempts = 0;
      
      // Reset all symbols
      for (const symbol of this.symbols) {
        symbol.activated = false;
        symbol.clickable = true;
        symbol.isHovered = false;
      }
      
      // Reset activation effect
      this.activationEffect.active = false;
      this.activationEffect.progress = 0;
      this.activationEffect.symbolIndex = null;
      
      console.log('Symbol puzzle reset');
    }
    
    /**
     * Set a callback function for when the puzzle is solved
     * @param {Function} callback Callback function
     */
    setSuccessCallback(callback) {
      this.onSuccess = callback;
    }
    
    /**
     * Set a callback function for when the puzzle attempt fails
     * @param {Function} callback Callback function
     */
    setFailureCallback(callback) {
      this.onFailure = callback;
    }
    
    /**
     * Set a callback function for when a symbol is activated
     * @param {Function} callback Callback function
     */
    setSymbolActivatedCallback(callback) {
      this.onSymbolActivated = callback;
    }
    
    /**
     * Set a callback function for when BYTE should give a warning
     * @param {Function} callback Callback function
     */
    setByteWarningCallback(callback) {
      this.onByteWarning = callback;
    }
    
    /**
     * Set sound effects for the puzzle
     * @param {Object} sounds Object containing sound files
     */
    setSounds(sounds) {
      this.sounds = sounds;
    }
    
    /**
     * Get the current state of the puzzle
     * @returns {Object} Puzzle state
     */
    getState() {
      return {
        solved: this.solved,
        attempts: this.attempts,
        sequenceLength: this.userSequence.length,
        totalSymbols: this.correctSequence.length
      };
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = SymbolPuzzle;
  }