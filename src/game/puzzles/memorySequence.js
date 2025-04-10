/**
 * AIKIRA: GENESIS PROTOCOL
 * Memory Sequence Puzzle for Chapter 2 - Mammoth Shrine
 * 
 * This module handles the memory sequence puzzle logic
 * where players need to match glyph tones in correct order.
 */

class MemorySequence {
    constructor() {
      // Puzzle configuration
      this.sequence = [];
      this.sequenceLength = 5;
      this.userSequence = [];
      this.glyphs = [];
      this.solved = false;
      this.attempts = 0;
      this.maxAttempts = 3;
      this.playbackIndex = -1;
      this.isPlayingSequence = false;
      this.playerTurn = false;
      this.difficultyLevel = 1; // 1-3, increases as player progresses
      
      // Animation properties
      this.activationEffect = {
        active: false,
        progress: 0,
        duration: 30, // frames
        glyphIndex: null
      };
      
      // Timing properties
      this.playbackInterval = 700; // ms between tones during playback
      this.playbackTimer = null;
      this.pauseBeforeRepeat = 1500; // ms to pause before repeating sequence
      
      // Event callbacks
      this.onSuccess = null;
      this.onFailure = null;
      this.onGlyphActivated = null;
      this.onSequenceStart = null;
      this.onPlayerTurnStart = null;
      
      // Sound effects
      this.sounds = {
        tones: [], // Array of tone sounds for each glyph
        success: null,
        failure: null
      };
    }
    
    /**
     * Initialize the puzzle with glyph positions and properties
     * @param {Array} positions Array of position objects {id, x, y, size}
     * @param {number} sequenceLength Length of sequence to generate
     */
    initialize(positions, sequenceLength = 5) {
      this.userSequence = [];
      this.solved = false;
      this.attempts = 0;
      this.playbackIndex = -1;
      this.isPlayingSequence = false;
      this.playerTurn = false;
      this.sequenceLength = sequenceLength;
      
      // Create glyph objects
      this.glyphs = positions.map((pos, index) => {
        return {
          id: pos.id || index,
          x: pos.x,
          y: pos.y,
          size: pos.size || 80,
          activated: false,
          color: pos.color || color(0, 150, 200),
          pulseOffset: random(TWO_PI),
          isHovered: false,
          index: index
        };
      });
      
      // Generate random sequence
      this.generateSequence();
      
      console.log('Memory sequence puzzle initialized with', this.glyphs.length, 'glyphs');
    }
    
    /**
     * Generate a random sequence of glyph IDs
     */
    generateSequence() {
      this.sequence = [];
      
      for (let i = 0; i < this.sequenceLength; i++) {
        // Generate random glyph ID (0 to glyphs.length-1)
        const randomID = floor(random(this.glyphs.length));
        this.sequence.push(randomID);
      }
      
      console.log('Generated sequence:', this.sequence);
    }
    
    /**
     * Start the puzzle by playing the sequence for the player
     */
    startPuzzle() {
      this.userSequence = [];
      this.isPlayingSequence = true;
      this.playbackIndex = -1;
      this.playerTurn = false;
      
      // Notify that sequence playback is starting
      if (this.onSequenceStart) {
        this.onSequenceStart();
      }
      
      // Start playing sequence after a short delay
      setTimeout(() => {
        this.playNextTone();
      }, 1000);
    }
    
    /**
     * Play the next tone in the sequence
     */
    playNextTone() {
      this.playbackIndex++;
      
      // Check if we've reached the end of the sequence
      if (this.playbackIndex >= this.sequence.length) {
        this.finishPlayback();
        return;
      }
      
      // Get the current glyph in the sequence
      const glyphId = this.sequence[this.playbackIndex];
      const glyph = this.glyphs.find(g => g.id === glyphId);
      
      if (glyph) {
        // Activate the glyph
        this.activateGlyph(glyph, true);
        
        // Schedule the next tone
        this.playbackTimer = setTimeout(() => {
          this.playNextTone();
        }, this.playbackInterval);
      } else {
        console.error('Invalid glyph ID in sequence:', glyphId);
        this.playNextTone(); // Skip to next
      }
    }
    
    /**
     * Finish playing back the sequence and let the player try
     */
    finishPlayback() {
      this.isPlayingSequence = false;
      this.playbackIndex = -1;
      this.playerTurn = true;
      
      // Notify that it's the player's turn
      if (this.onPlayerTurnStart) {
        this.onPlayerTurnStart();
      }
      
      console.log('Sequence playback complete, waiting for player input');
    }
    
    /**
     * Repeat the sequence for the player
     */
    repeatSequence() {
      this.isPlayingSequence = true;
      this.playbackIndex = -1;
      this.playerTurn = false;
      
      // Notify that sequence playback is starting
      if (this.onSequenceStart) {
        this.onSequenceStart();
      }
      
      // Start playing sequence after a short delay
      setTimeout(() => {
        this.playNextTone();
      }, 1000);
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
      // Render each glyph
      for (const glyph of this.glyphs) {
        this.renderGlyph(glyph);
      }
      
      // Render sequence progress if player turn
      if (this.playerTurn && this.userSequence.length > 0) {
        this.renderSequenceProgress();
      }
      
      // Render playback indicator if showing sequence
      if (this.isPlayingSequence) {
        this.renderPlaybackIndicator();
      }
    }
    
    /**
     * Render a single glyph
     * @param {Object} glyph Glyph object to render
     */
    renderGlyph(glyph) {
      push();
      translate(glyph.x, glyph.y);
      
      // Determine if this glyph is being activated
      const isActivating = this.activationEffect.active && 
                          this.activationEffect.glyphIndex === glyph.index;
      
      // Pulse effect 
      let glowAmount = map(sin(frameCount * 0.05 + glyph.pulseOffset), -1, 1, 0.5, 1);
      
      // Hover effect
      if (glyph.isHovered && this.playerTurn) {
        glowAmount *= 1.3;
      }
      
      // Activation animation effect
      if (isActivating) {
        const activationProgress = this.activationEffect.progress;
        const expandScale = 1 + sin(activationProgress * PI) * 0.3;
        scale(expandScale);
        
        // Add extra glow during activation
        glowAmount = map(sin(activationProgress * PI * 2), -1, 1, 1.2, 1.8);
      }
      
      // Draw glyph shape
      noStroke();
      
      // Base glyph shape
      fill(glyph.color.levels[0], glyph.color.levels[1], glyph.color.levels[2], 100 * glowAmount);
      ellipse(0, 0, glyph.size * 1.1, glyph.size * 1.1);
      
      // Inner glyph 
      fill(glyph.color.levels[0], glyph.color.levels[1], glyph.color.levels[2], 150 * glowAmount);
      
      // Draw different shapes based on glyph ID for visual distinction
      switch(glyph.id % 5) {
        case 0:
          // Circle with center dot
          ellipse(0, 0, glyph.size * 0.9, glyph.size * 0.9);
          fill(255, 255 * glowAmount);
          ellipse(0, 0, glyph.size * 0.2, glyph.size * 0.2);
          break;
          
        case 1:
          // Diamond
          beginShape();
          vertex(0, -glyph.size * 0.45);
          vertex(glyph.size * 0.45, 0);
          vertex(0, glyph.size * 0.45);
          vertex(-glyph.size * 0.45, 0);
          endShape(CLOSE);
          break;
          
        case 2:
          // Triangle
          beginShape();
          vertex(0, -glyph.size * 0.45);
          vertex(glyph.size * 0.4, glyph.size * 0.3);
          vertex(-glyph.size * 0.4, glyph.size * 0.3);
          endShape(CLOSE);
          break;
          
        case 3:
          // Square
          rectMode(CENTER);
          rect(0, 0, glyph.size * 0.8, glyph.size * 0.8, glyph.size * 0.1);
          break;
          
        case 4:
          // Hexagon
          beginShape();
          for (let i = 0; i < 6; i++) {
            const angle = TWO_PI / 6 * i - PI / 6;
            const x = cos(angle) * glyph.size * 0.45;
            const y = sin(angle) * glyph.size * 0.45;
            vertex(x, y);
          }
          endShape(CLOSE);
          break;
      }
      
      // Draw outer ring to indicate interactive element
      noFill();
      stroke(255, 100 * glowAmount);
      strokeWeight(2);
      ellipse(0, 0, glyph.size * 1.2, glyph.size * 1.2);
      
      pop();
    }
    
    /**
     * Render the sequence progress indicator
     */
    renderSequenceProgress() {
      // Draw sequence progress indicator at top of screen
      const barWidth = width * 0.6;
      const barHeight = 20;
      const startX = (width - barWidth) / 2;
      const y = height * 0.05;
      
      // Background bar
      fill(0, 20, 40, 200);
      rect(startX, y, barWidth, barHeight, barHeight / 2);
      
      // Calculate the step width
      const stepWidth = barWidth / this.sequence.length;
      
      // Draw filled steps for each correct entry in user sequence
      for (let i = 0; i < this.userSequence.length; i++) {
        const stepX = startX + i * stepWidth;
        
        // Get glyph color for this step
        const glyphId = this.sequence[i];
        const glyph = this.glyphs.find(g => g.id === glyphId);
        
        if (glyph) {
          fill(glyph.color.levels[0], glyph.color.levels[1], glyph.color.levels[2], 200);
        } else {
          fill(0, 200, 255, 200);
        }
        
        // First step has rounded left edge, last step has rounded right edge
        if (i === 0 && i === this.sequence.length - 1) {
          rect(stepX, y, stepWidth, barHeight, barHeight / 2);
        } else if (i === 0) {
          rect(stepX, y, stepWidth, barHeight, barHeight / 2, 0, 0, barHeight / 2);
        } else if (i === this.sequence.length - 1) {
          rect(stepX, y, stepWidth, barHeight, 0, barHeight / 2, barHeight / 2, 0);
        } else {
          rect(stepX, y, stepWidth, barHeight);
        }
      }
      
      // Draw separators between steps
      stroke(0, 0, 20);
      strokeWeight(1);
      for (let i = 1; i < this.sequence.length; i++) {
        const lineX = startX + i * stepWidth;
        line(lineX, y, lineX, y + barHeight);
      }
      
      // Draw indicator text
      noStroke();
      fill(255);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(`${this.userSequence.length} / ${this.sequence.length}`, width / 2, y + 40);
    }
    
    /**
     * Render playback indicator
     */
    renderPlaybackIndicator() {
      // Draw "Memorize Sequence" text
      fill(255);
      textSize(20);
      textAlign(CENTER, TOP);
      text("MEMORIZE SEQUENCE", width / 2, height * 0.05);
      
      // Draw current playback position
      const indicatorY = height * 0.1;
      const totalWidth = 200;
      const startX = (width - totalWidth) / 2;
      
      for (let i = 0; i < this.sequence.length; i++) {
        const x = startX + (i * (totalWidth / this.sequence.length));
        const size = 12;
        
        if (i <= this.playbackIndex) {
          fill(0, 255, 150); // Played tones
        } else {
          fill(100); // Upcoming tones
        }
        
        ellipse(x, indicatorY, size, size);
      }
    }
    
    /**
     * Check if mouse is hovering over any glyph
     * @param {number} mouseX Mouse X position
     * @param {number} mouseY Mouse Y position
     */
    checkHover(mouseX, mouseY) {
      let hoveredGlyph = null;
      
      for (const glyph of this.glyphs) {
        // Calculate distance to glyph center
        const d = dist(mouseX, mouseY, glyph.x, glyph.y);
        
        // Check if within glyph radius
        if (d < glyph.size / 2) {
          glyph.isHovered = true;
          hoveredGlyph = glyph;
        } else {
          glyph.isHovered = false;
        }
      }
      
      return hoveredGlyph;
    }
    
    /**
     * Handle click on a glyph
     * @param {number} mouseX Mouse X position
     * @param {number} mouseY Mouse Y position
     * @returns {boolean} True if a glyph was clicked
     */
    handleClick(mouseX, mouseY) {
      // Only process clicks during player turn
      if (!this.playerTurn) return false;
      
      // Find clicked glyph
      for (const glyph of this.glyphs) {
        // Calculate distance to glyph center
        const d = dist(mouseX, mouseY, glyph.x, glyph.y);
        
        // Check if within glyph radius
        if (d < glyph.size / 2) {
          this.playerSelectGlyph(glyph);
          return true;
        }
      }
      
      return false;
    }
    
    /**
     * Handle player selecting a glyph
     * @param {Object} glyph Selected glyph
     */
    playerSelectGlyph(glyph) {
      // Activate the glyph with visual and sound effects
      this.activateGlyph(glyph, false);
      
      // Add to user sequence
      this.userSequence.push(glyph.id);
      
      // Check if the selection is correct for current position in sequence
      const currentPosition = this.userSequence.length - 1;
      
      if (this.userSequence[currentPosition] !== this.sequence[currentPosition]) {
        // Incorrect selection
        this.handleFailure();
        return;
      }
      
      // If we've completed the full sequence and it's correct
      if (this.userSequence.length === this.sequence.length) {
        this.handleSuccess();
      }
    }
    
    /**
     * Activate a glyph with visual and sound effects
     * @param {Object} glyph Glyph to activate
     * @param {boolean} isPlayback Whether this is during sequence playback
     */
    activateGlyph(glyph, isPlayback) {
      // Start activation effect
      this.activationEffect.active = true;
      this.activationEffect.progress = 0;
      this.activationEffect.glyphIndex = glyph.index;
      
      // Play tone sound if available
      if (this.sounds.tones && this.sounds.tones[glyph.id]) {
        this.sounds.tones[glyph.id].play();
      }
      
      // Temporarily mark as activated
      glyph.activated = true;
      
      // Reset after animation
      setTimeout(() => {
        glyph.activated = false;
      }, 500);
      
      // Trigger callback
      if (this.onGlyphActivated && !isPlayback) {
        this.onGlyphActivated(glyph.id, this.userSequence.length);
      }
    }
    
    /**
     * Handle successful puzzle completion
     */
    handleSuccess() {
      this.solved = true;
      this.playerTurn = false;
      
      // Play success sound if available
      if (this.sounds.success) {
        this.sounds.success.play();
      }
      
      // Trigger callback
      if (this.onSuccess) {
        setTimeout(() => {
          this.onSuccess();
        }, 1000); // Delay to allow success animation to play
      }
      
      console.log('Memory sequence puzzle solved successfully!');
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
      
      // Reset user sequence
      this.userSequence = [];
      this.playerTurn = false;
      
      // Trigger callback
      if (this.onFailure) {
        this.onFailure(this.attempts);
      }
      
      console.log('Memory sequence attempt failed. Attempts:', this.attempts);
      
      // Repeat the sequence after a delay
      setTimeout(() => {
        this.repeatSequence();
      }, this.pauseBeforeRepeat);
    }
    
    /**
     * Reset the puzzle
     */
    reset() {
      // Clear any pending timers
      if (this.playbackTimer) {
        clearTimeout(this.playbackTimer);
        this.playbackTimer = null;
      }
      
      this.userSequence = [];
      this.solved = false;
      this.attempts = 0;
      this.playbackIndex = -1;
      this.isPlayingSequence = false;
      this.playerTurn = false;
      
      // Generate a new sequence
      this.generateSequence();
      
      // Reset activation effect
      this.activationEffect.active = false;
      this.activationEffect.progress = 0;
      this.activationEffect.glyphIndex = null;
      
      console.log('Memory sequence puzzle reset');
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
     * Set a callback function for when a glyph is activated
     * @param {Function} callback Callback function
     */
    setGlyphActivatedCallback(callback) {
      this.onGlyphActivated = callback;
    }
    
    /**
     * Set a callback function for when sequence playback starts
     * @param {Function} callback Callback function
     */
    setSequenceStartCallback(callback) {
      this.onSequenceStart = callback;
    }
    
    /**
     * Set a callback function for when player's turn starts
     * @param {Function} callback Callback function
     */
    setPlayerTurnStartCallback(callback) {
      this.onPlayerTurnStart = callback;
    }
    
    /**
     * Set sound effects for the puzzle
     * @param {Object} sounds Object containing sound files
     */
    setSounds(sounds) {
      this.sounds = sounds;
    }
    
    /**
     * Set difficulty level (affects sequence length and playback speed)
     * @param {number} level Difficulty level (1-3)
     */
    setDifficulty(level) {
      this.difficultyLevel = constrain(level, 1, 3);
      
      // Adjust sequence length based on difficulty
      this.sequenceLength = 3 + this.difficultyLevel;
      
      // Adjust playback speed based on difficulty
      this.playbackInterval = 1000 - (this.difficultyLevel * 100);
      
      // Regenerate sequence
      this.generateSequence();
    }
    
    /**
     * Get the current state of the puzzle
     * @returns {Object} Puzzle state
     */
    getState() {
      return {
        solved: this.solved,
        attempts: this.attempts,
        sequenceLength: this.sequence.length,
        userProgress: this.userSequence.length,
        isPlayingSequence: this.isPlayingSequence,
        playerTurn: this.playerTurn
      };
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = MemorySequence;
  }