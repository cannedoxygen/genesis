/**
 * AIKIRA: GENESIS PROTOCOL
 * Code Input Puzzle for Chapter 5 - Genesis Vault
 * 
 * This module implements the final puzzle where players input collected
 * fragments into a code input system to unlock the dinosaur egg.
 */

class CodeInputPuzzle {
    constructor() {
      // Puzzle configuration
      this.codeLength = 5;
      this.userCode = [];
      this.correctCode = []; // Will be generated based on collected clues
      this.solved = false;
      this.attempts = 0;
      
      // UI properties
      this.consoleText = "";
      this.consoleLines = [];
      this.cursorVisible = true;
      this.cursorBlinkTimer = 0;
      this.isTyping = false;
      this.typeIndex = 0;
      this.typeText = "";
      this.typeCallback = null;
      
      // System design
      this.codeSlots = [];
      this.keyPad = [];
      this.activeSlot = -1;
      
      // Animation properties
      this.glowIntensity = 0;
      this.scanLine = 0;
      this.bootupPhase = 0; // 0 = not started, 1 = booting, 2 = ready
      
      // Event callbacks
      this.onSuccess = null;
      this.onFailure = null;
      this.onCodeEntered = null;
      
      // Sound effects
      this.sounds = {
        type: null,
        select: null,
        error: null,
        success: null,
        bootup: null
      };
    }
    
    /**
     * Initialize the puzzle with the correct code
     * @param {Array} collectedClues Array of clues collected from previous chapters
     */
    initialize(collectedClues) {
      // Reset state
      this.userCode = new Array(this.codeLength).fill(null);
      this.solved = false;
      this.attempts = 0;
      this.activeSlot = -1;
      this.bootupPhase = 0;
      
      // Generate the correct code based on collected clues
      this.generateCode(collectedClues);
      
      // Initialize console
      this.consoleText = "";
      this.consoleLines = [];
      
      // Initialize code slots
      this.initializeCodeSlots();
      
      // Initialize keypad
      this.initializeKeyPad();
      
      console.log('Code input puzzle initialized with code length', this.codeLength);
    }
    
    /**
     * Generate the correct code based on collected clues
     * @param {Array} collectedClues Array of clues collected from previous chapters
     */
    generateCode(collectedClues) {
      // For simplicity and demonstration purposes, we'll use a fixed code
      // In a full implementation, this would analyze the collected clues to derive the code
      
      // Default code if no clues available
      this.correctCode = ['D', 'I', 'N', 'O', '5'];
      
      // If clues are available, use them to generate the code
      if (collectedClues && collectedClues.length > 0) {
        // Example implementation:
        // Each clue might contain a hint to a specific position in the code
        
        // For demonstration, if a clue contains "wolves", it affects position 0
        if (collectedClues.some(clue => clue.includes('wolves'))) {
          this.correctCode[0] = 'D'; // D for DNA
        }
        
        // If a clue mentions "exodus", it affects position 1
        if (collectedClues.some(clue => clue.includes('EXODUS'))) {
          this.correctCode[1] = 'I'; // I for Inception
        }
        
        // If a clue says "meatbrain", it affects position 2
        if (collectedClues.some(clue => clue.includes('meatbrain'))) {
          this.correctCode[2] = 'N'; // N for Neural
        }
        
        // If a clue contains "sequence", it affects position 3
        if (collectedClues.some(clue => clue.includes('SEQUENCE'))) {
          this.correctCode[3] = 'O'; // O for Origin
        }
        
        // If all 3 DNA fragments were collected, it affects position 4
        if (collectedClues.some(clue => clue.includes('fragments'))) {
          this.correctCode[4] = '5'; // 5 fragments
        }
      }
      
      console.log('Generated correct code:', this.correctCode.join(''));
    }
    
    /**
     * Initialize the code input slots
     */
    initializeCodeSlots() {
      this.codeSlots = [];
      
      // Create slots for each position in the code
      for (let i = 0; i < this.codeLength; i++) {
        this.codeSlots.push({
          x: 0, // Will be positioned in render based on screen size
          y: 0,
          width: 60,
          height: 80,
          value: null,
          active: false,
          glowAmount: 0,
          validated: false,
          correct: false
        });
      }
    }
    
    /**
     * Initialize the keypad for code input
     */
    initializeKeyPad() {
      this.keyPad = [];
      
      // Available keys
      const keys = [
        ['1', '2', '3', 'A', 'B'],
        ['4', '5', '6', 'C', 'D'],
        ['7', '8', '9', 'E', 'F'],
        ['G', 'H', 'I', 'J', 'K'],
        ['L', 'M', 'N', 'O', 'P'],
        ['Q', 'R', 'S', 'T', 'U'],
        ['V', 'W', 'X', 'Y', 'Z'],
        ['CLR', '', 'DEL', '', 'ENTER']
      ];
      
      // Create key objects
      for (let row = 0; row < keys.length; row++) {
        for (let col = 0; col < keys[row].length; col++) {
          // Skip empty keys
          if (keys[row][col] === '') continue;
          
          this.keyPad.push({
            x: 0, // Will be positioned in render
            y: 0,
            width: 50,
            height: 50,
            value: keys[row][col],
            row: row,
            col: col,
            isHovered: false,
            isPressed: false
          });
        }
      }
    }
    
    /**
     * Start the puzzle with bootup sequence
     */
    start() {
      this.bootupPhase = 1;
      this.typeConsoleText("GENESIS PROTOCOL TERMINAL v65.5\n", () => {
        this.typeConsoleText("INITIALIZING SYSTEM...\n", () => {
          this.typeConsoleText("LOADING DNA SEQUENCER...\n", () => {
            this.typeConsoleText("ACCESSING ENCRYPTED VAULT...\n", () => {
              this.typeConsoleText("SYSTEM READY\n\n", () => {
                this.typeConsoleText("ENTER ACTIVATION CODE TO ACCESS GENESIS VAULT:\n", () => {
                  this.bootupPhase = 2;
                  
                  // Activate first slot
                  this.activeSlot = 0;
                  this.codeSlots[0].active = true;
                });
              });
            });
          });
        });
      });
      
      // Play bootup sound
      if (this.sounds.bootup) {
        this.sounds.bootup.play();
      }
    }
    
    /**
     * Type text to console with animation
     * @param {string} text Text to type
     * @param {Function} callback Callback to call when typing is complete
     */
    typeConsoleText(text, callback) {
      this.isTyping = true;
      this.typeText = text;
      this.typeIndex = 0;
      this.typeCallback = callback;
    }
    
    /**
     * Update the puzzle state
     */
    update() {
      // Update cursor blink
      this.cursorBlinkTimer++;
      if (this.cursorBlinkTimer > 30) {
        this.cursorBlinkTimer = 0;
        this.cursorVisible = !this.cursorVisible;
      }
      
      // Update typing animation
      if (this.isTyping) {
        if (this.typeIndex < this.typeText.length) {
          // Type next character
          this.consoleText += this.typeText.charAt(this.typeIndex);
          this.typeIndex++;
          
          // Play typing sound
          if (this.sounds.type && this.typeText.charAt(this.typeIndex - 1) !== ' ') {
            this.sounds.type.play();
          }
          
          // Handle newlines
          if (this.typeText.charAt(this.typeIndex - 1) === '\n') {
            // Update console lines
            this.consoleLines = this.consoleText.split('\n');
          }
        } else {
          // Typing complete
          this.isTyping = false;
          
          // Call callback if provided
          if (this.typeCallback) {
            setTimeout(this.typeCallback, 200);
          }
        }
      }
      
      // Update glow intensity
      this.glowIntensity = sin(frameCount * 0.05) * 0.5 + 0.5;
      
      // Update scan line
      this.scanLine = (this.scanLine + 2) % height;
      
      // Update active slot glow
      for (let i = 0; i < this.codeSlots.length; i++) {
        const slot = this.codeSlots[i];
        if (slot.active) {
          slot.glowAmount = this.glowIntensity;
        } else {
          slot.glowAmount = max(0, slot.glowAmount - 0.05);
        }
      }
    }
    
    /**
     * Render the puzzle
     */
    render() {
      // Draw terminal background
      this.renderTerminalBackground();
      
      // Draw console
      this.renderConsole();
      
      // Only draw input UI if bootup is complete
      if (this.bootupPhase === 2) {
        // Draw code slots
        this.renderCodeSlots();
        
        // Draw keypad
        this.renderKeyPad();
      }
      
      // Draw scan line effect
      this.renderScanLine();
      
      // Draw success/failure overlay if applicable
      if (this.solved) {
        this.renderSuccessOverlay();
      }
    }
    
    /**
     * Render the terminal background
     */
    renderTerminalBackground() {
      // Main terminal background
      fill(10, 15, 30, 220);
      strokeWeight(2);
      stroke(0, 150, 200);
      rect(width * 0.1, height * 0.1, width * 0.8, height * 0.8, 10);
      
      // Inner terminal frame
      strokeWeight(1);
      stroke(0, 100, 150);
      noFill();
      rect(width * 0.12, height * 0.12, width * 0.76, height * 0.76, 5);
      
      // Top status bar
      fill(0, 30, 50);
      noStroke();
      rect(width * 0.12, height * 0.12, width * 0.76, height * 0.05, 5, 5, 0, 0);
      
      // Status indicators
      fill(0, 200, 100);
      noStroke();
      ellipse(width * 0.15, height * 0.145, 10, 10);
      
      fill(255, 200, 0);
      ellipse(width * 0.18, height * 0.145, 10, 10);
      
      // Status text
      fill(200);
      textSize(14);
      textAlign(LEFT, CENTER);
      text("GENESIS PROTOCOL TERMINAL", width * 0.21, height * 0.145);
      
      // Right side status
      textAlign(RIGHT, CENTER);
      text("SECURITY: LEVEL 5", width * 0.85, height * 0.145);
      
      // Decorative elements
      for (let i = 0; i < 5; i++) {
        // Left side circuits
        stroke(0, 100, 150, 100);
        strokeWeight(1);
        line(
          width * 0.05, 
          height * (0.25 + i * 0.1), 
          width * 0.1, 
          height * (0.25 + i * 0.1)
        );
        
        // Circuit nodes
        fill(0, 150, 200, 150);
        noStroke();
        ellipse(width * 0.05, height * (0.25 + i * 0.1), 5, 5);
        
        // Right side circuits
        stroke(0, 100, 150, 100);
        strokeWeight(1);
        line(
          width * 0.9, 
          height * (0.25 + i * 0.1), 
          width * 0.95, 
          height * (0.25 + i * 0.1)
        );
        
        // Circuit nodes
        fill(0, 150, 200, 150);
        noStroke();
        ellipse(width * 0.95, height * (0.25 + i * 0.1), 5, 5);
      }
    }
    
    /**
     * Render the console output
     */
    renderConsole() {
      // Console area
      fill(0, 10, 20, 200);
      stroke(0, 100, 150, 100);
      strokeWeight(1);
      rect(width * 0.15, height * 0.2, width * 0.7, height * 0.2, 5);
      
      // Console text
      fill(0, 255, 0);
      textSize(16);
      textAlign(LEFT, TOP);
      
      // Calculate visible lines
      const maxVisibleLines = floor(height * 0.18 / 20);
      const startLine = max(0, this.consoleLines.length - maxVisibleLines);
      
      // Draw visible lines
      for (let i = 0; i < maxVisibleLines; i++) {
        const lineIndex = startLine + i;
        if (lineIndex < this.consoleLines.length) {
          text(this.consoleLines[lineIndex], width * 0.17, height * 0.22 + i * 20);
        }
      }
      
      // Cursor at the end of text
      if (this.cursorVisible && this.bootupPhase > 0) {
        // Calculate cursor position
        const lastLine = this.consoleLines[this.consoleLines.length - 1] || '';
        const cursorX = width * 0.17 + textWidth(lastLine);
        const cursorY = height * 0.22 + (this.consoleLines.length - startLine - 1) * 20;
        
        fill(0, 255, 0);
        rect(cursorX, cursorY, 10, 18);
      }
    }
    
    /**
     * Render the code input slots
     */
    renderCodeSlots() {
      // Position slots
      const totalWidth = this.codeSlots.length * 80;
      const startX = (width - totalWidth) / 2;
      const slotY = height * 0.5;
      
      // Draw code entry label
      fill(200);
      textSize(18);
      textAlign(CENTER, BOTTOM);
      text("ACTIVATION CODE", width / 2, slotY - 30);
      
      // Draw each slot
      for (let i = 0; i < this.codeSlots.length; i++) {
        const slot = this.codeSlots[i];
        
        // Update position
        slot.x = startX + i * 80 + 10;
        slot.y = slotY;
        
        // Slot background
        if (slot.validated) {
          // Validated slots
          if (slot.correct) {
            fill(0, 100, 50);
            stroke(0, 255, 100);
          } else {
            fill(100, 30, 30);
            stroke(255, 50, 50);
          }
        } else {
          // Normal slot
          fill(0, 30, 50);
          
          if (slot.active) {
            stroke(0, 200, 255, 150 + 100 * slot.glowAmount);
            strokeWeight(2 + slot.glowAmount);
          } else {
            stroke(0, 100, 150);
            strokeWeight(1);
          }
        }
        
        rect(slot.x, slot.y, slot.width, slot.height, 5);
        
        // Slot value
        if (slot.value !== null) {
          fill(255);
          textSize(36);
          textAlign(CENTER, CENTER);
          text(slot.value, slot.x + slot.width / 2, slot.y + slot.height / 2);
        }
        
        // Slot index
        fill(150);
        textSize(12);
        textAlign(CENTER, BOTTOM);
        text((i + 1).toString(), slot.x + slot.width / 2, slot.y);
      }
    }
    
    /**
     * Render the keypad
     */
    renderKeyPad() {
      // Position keypad
      const keypadWidth = 5 * 60;
      const keypadHeight = 8 * 60;
      const startX = (width - keypadWidth) / 2;
      const startY = height * 0.6;
      
      // Background
      fill(0, 20, 40, 100);
      stroke(0, 100, 150, 50);
      strokeWeight(1);
      rect(startX - 10, startY - 10, keypadWidth + 20, keypadHeight + 20, 5);
      
      // Draw each key
      for (const key of this.keyPad) {
        // Update position
        key.x = startX + key.col * 60 + 5;
        key.y = startY + key.row * 60 + 5;
        
        // Skip empty keys
        if (key.value === '') continue;
        
        // Key background based on state
        if (key.isPressed) {
          fill(0, 150, 200);
          stroke(0, 255, 255);
          strokeWeight(2);
        } else if (key.isHovered) {
          fill(0, 100, 150);
          stroke(0, 200, 255);
          strokeWeight(2);
        } else {
          // Special keys
          if (key.value === 'ENTER') {
            fill(0, 100, 50);
            stroke(0, 150, 100);
          } else if (key.value === 'CLR' || key.value === 'DEL') {
            fill(100, 50, 30);
            stroke(150, 100, 50);
          } else {
            fill(0, 50, 80);
            stroke(0, 100, 150);
          }
          strokeWeight(1);
        }
        
        // Draw key
        rect(key.x, key.y, key.width, key.height, 5);
        
        // Key label
        fill(255);
        textSize(key.value.length > 1 ? 14 : 24);
        textAlign(CENTER, CENTER);
        text(key.value, key.x + key.width / 2, key.y + key.height / 2);
      }
    }
    
    /**
     * Render scan line effect
     */
    renderScanLine() {
      // Screen-wide scan line
      noStroke();
      fill(255, 20);
      rect(0, this.scanLine, width, 2);
      
      // Screen glitch effects
      if (this.bootupPhase === 1 && random() < 0.05) {
        noStroke();
        fill(0, 255, 255, 20);
        rect(0, random(height), width, random(1, 5));
      }
    }
    
    /**
     * Render success overlay
     */
    renderSuccessOverlay() {
      // Overlay background
      fill(0, 0, 0, 150);
      noStroke();
      rect(0, 0, width, height);
      
      // Success message
      fill(0, 255, 100);
      textSize(36);
      textAlign(CENTER, CENTER);
      text("ACCESS GRANTED", width / 2, height * 0.4);
      
      // Sub message
      fill(200);
      textSize(18);
      text("GENESIS VAULT UNLOCKED", width / 2, height * 0.5);
      
      // Animated DNA structure
      this.renderDNAHelix(width / 2, height * 0.65, frameCount * 0.02, 100);
    }
    
    /**
     * Render DNA helix
     * @param {number} x Center X position
     * @param {number} y Center Y position
     * @param {number} rotation Rotation angle
     * @param {number} size Size of helix
     */
    renderDNAHelix(x, y, rotation, size) {
      push();
      translate(x, y);
      rotate(rotation);
      
      // Draw helix strands
      for (let i = 0; i < 2; i++) {
        const offset = i * PI;
        
        // Backbone
        stroke(0, 200, 100);
        strokeWeight(3);
        noFill();
        beginShape();
        for (let j = 0; j < 20; j++) {
          const angle = j / 20 * TWO_PI + offset;
          const radius = size * 0.5;
          vertex(cos(angle) * radius, sin(angle) * radius * 0.3);
        }
        endShape();
        
        // Bases
        fill(0, 255, 150);
        noStroke();
        for (let j = 0; j < 10; j++) {
          const angle = j / 10 * TWO_PI + offset + PI/20;
          const radius1 = size * 0.5;
          const radius2 = size * 0.5;
          const x1 = cos(angle) * radius1;
          const y1 = sin(angle) * radius1 * 0.3;
          const x2 = cos(angle + PI) * radius2;
          const y2 = sin(angle + PI) * radius2 * 0.3;
          
          stroke(0, 255, 150);
          strokeWeight(2);
          line(x1, y1, x2, y2);
          
          // Base pair nodes
          fill(0, 255, 150);
          noStroke();
          ellipse(x1, y1, 6, 6);
          ellipse(x2, y2, 6, 6);
        }
      }
      
      pop();
    }
    
    /**
     * Handle key press for keyboard input
     * @param {number} keyCode Key code
     * @returns {boolean} True if key was handled
     */
    handleKeyPress(keyCode) {
      // Skip if bootup not complete or puzzle solved
      if (this.bootupPhase !== 2 || this.solved) return false;
      
      // Handle special keys
      switch (keyCode) {
        case ENTER:
          this.validateCode();
          return true;
          
        case BACKSPACE:
          this.deleteCurrentSlot();
          return true;
          
        case LEFT_ARROW:
          this.moveActiveSlot(-1);
          return true;
          
        case RIGHT_ARROW:
          this.moveActiveSlot(1);
          return true;
      }
      
      // Handle alphanumeric keys
      const key = String.fromCharCode(keyCode);
      if (/[A-Z0-9]/i.test(key)) {
        this.inputKey(key.toUpperCase());
        return true;
      }
      
      return false;
    }
    
    /**
     * Handle mouse press for button clicks
     * @param {number} mouseX Mouse X position
     * @param {number} mouseY Mouse Y position
     * @returns {boolean} True if click was handled
     */
    handleClick(mouseX, mouseY) {
      // Skip if bootup not complete or puzzle solved
      if (this.bootupPhase !== 2 || this.solved) return false;
      
      // Check for keypad clicks
      for (const key of this.keyPad) {
        if (mouseX >= key.x && mouseX < key.x + key.width &&
            mouseY >= key.y && mouseY < key.y + key.height) {
          // Animate key press
          key.isPressed = true;
          setTimeout(() => { key.isPressed = false; }, 200);
          
          // Handle key press
          if (key.value === 'ENTER') {
            this.validateCode();
          } else if (key.value === 'CLR') {
            this.clearAllSlots();
          } else if (key.value === 'DEL') {
            this.deleteCurrentSlot();
          } else {
            this.inputKey(key.value);
          }
          
          // Play key sound
          if (this.sounds.select) {
            this.sounds.select.play();
          }
          
          return true;
        }
      }
      
      // Check for slot clicks
      for (let i = 0; i < this.codeSlots.length; i++) {
        const slot = this.codeSlots[i];
        if (mouseX >= slot.x && mouseX < slot.x + slot.width &&
            mouseY >= slot.y && mouseY < slot.y + slot.height) {
          // Activate slot
          this.setActiveSlot(i);
          return true;
        }
      }
      
      return false;
    }
    
    /**
     * Handle mouse movement for hover effects
     * @param {number} mouseX Mouse X position
     * @param {number} mouseY Mouse Y position
     */
    handleMouseMove(mouseX, mouseY) {
      // Skip if bootup not complete
      if (this.bootupPhase !== 2) return;
      
      // Check for keypad hovers
      for (const key of this.keyPad) {
        key.isHovered = (mouseX >= key.x && mouseX < key.x + key.width &&
                          mouseY >= key.y && mouseY < key.y + key.height);
      }
    }
    
    /**
     * Set the active input slot
     * @param {number} index Slot index
     */
    setActiveSlot(index) {
      // Skip if index out of bounds or puzzle solved
      if (index < 0 || index >= this.codeSlots.length || this.solved) return;
      
      // Deactivate current slot
      if (this.activeSlot >= 0) {
        this.codeSlots[this.activeSlot].active = false;
      }
      
      // Activate new slot
      this.activeSlot = index;
      this.codeSlots[this.activeSlot].active = true;
    }
    
    /**
     * Move the active slot
     * @param {number} direction Movement direction (-1 for left, 1 for right)
     */
    moveActiveSlot(direction) {
      // Determine new slot index
      let newIndex = this.activeSlot + direction;
      
      // Wrap around if needed
      if (newIndex < 0) newIndex = this.codeSlots.length - 1;
      if (newIndex >= this.codeSlots.length) newIndex = 0;
      
      // Set active slot
      this.setActiveSlot(newIndex);
      
      // Play select sound
      if (this.sounds.select) {
        this.sounds.select.play();
      }
    }
    
    /**
     * Input a key value to the active slot
     * @param {string} value Key value
     */
    inputKey(value) {
      // Skip if no active slot or puzzle solved
      if (this.activeSlot < 0 || this.solved) return;
      
      // Set slot value
      this.codeSlots[this.activeSlot].value = value;
      this.userCode[this.activeSlot] = value;
      
      // Move to next empty slot if available
      for (let i = 1; i < this.codeSlots.length; i++) {
        const nextIndex = (this.activeSlot + i) % this.codeSlots.length;
        if (this.codeSlots[nextIndex].value === null) {
          this.setActiveSlot(nextIndex);
          break;
        }
      }
    }
    
    /**
     * Delete the value in the current slot
     */
    deleteCurrentSlot() {
      // Skip if no active slot or puzzle solved
      if (this.activeSlot < 0 || this.solved) return;
      
      // Clear slot value
      this.codeSlots[this.activeSlot].value = null;
      this.userCode[this.activeSlot] = null;
      
      // Reset validation state
      this.codeSlots[this.activeSlot].validated = false;
      
      // Play error sound
      if (this.sounds.error) {
        this.sounds.error.play();
      }
    }
    
    /**
     * Clear all slots
     */
    clearAllSlots() {
      // Skip if puzzle solved
      if (this.solved) return;
      
      // Clear all slot values
      for (let i = 0; i < this.codeSlots.length; i++) {
        this.codeSlots[i].value = null;
        this.userCode[i] = null;
        this.codeSlots[i].validated = false;
      }
      
      // Activate first slot
      this.setActiveSlot(0);
      
      // Play error sound
      if (this.sounds.error) {
        this.sounds.error.play();
      }
    }
    
    /**
     * Validate the entered code
     */
    validateCode() {
      // Skip if puzzle solved or code incomplete
      if (this.solved || this.userCode.includes(null)) {
        // Play error sound for incomplete code
        if (this.userCode.includes(null) && this.sounds.error) {
          this.sounds.error.play();
        }
        return;
      }
      
      // Increment attempt counter
      this.attempts++;
      
      // Check if code is correct
      let correct = true;
      
      for (let i = 0; i < this.codeLength; i++) {
        // Mark slot as validated
        this.codeSlots[i].validated = true;
        
        // Check if value matches correct code
        this.codeSlots[i].correct = (this.userCode[i] === this.correctCode[i]);
        
// Update overall correctness
if (!this.codeSlots[i].correct) {
    correct = false;
  }
}

// Update console with result
if (correct) {
  // Correct code
  this.typeConsoleText("\n>>> CODE ACCEPTED\n", () => {
    this.typeConsoleText(">>> GENESIS VAULT UNLOCKED\n", () => {
      this.typeConsoleText(">>> INITIATING DNA SEQUENCE RETRIEVAL\n", () => {
        this.solved = true;
        
        // Trigger success callback
        if (this.onSuccess) {
          setTimeout(() => {
            this.onSuccess();
          }, 2000);
        }
      });
    });
  });
  
  // Play success sound
  if (this.sounds.success) {
    this.sounds.success.play();
  }
} else {
  // Incorrect code
  this.typeConsoleText(`\n>>> CODE INVALID (Attempt ${this.attempts}/${5})\n`, () => {
    this.typeConsoleText(">>> ACCESS DENIED\n", () => {
      // Check if max attempts reached
      if (this.attempts >= 5) {
        this.typeConsoleText(">>> SECURITY LOCKDOWN INITIATED\n", () => {
          // Trigger failure callback
          if (this.onFailure) {
            setTimeout(() => {
              this.onFailure(this.attempts);
            }, 1000);
          }
        });
      } else {
        this.typeConsoleText(">>> PLEASE TRY AGAIN\n", () => {
          // Clear slots after delay
          setTimeout(() => {
            this.clearAllSlots();
          }, 1000);
        });
      }
    });
  });
  
  // Play error sound
  if (this.sounds.error) {
    this.sounds.error.play();
  }
}

// Trigger code entered callback
if (this.onCodeEntered) {
  this.onCodeEntered(this.userCode.join(''), correct);
}
}

/**
* Reset the puzzle
*/
reset() {
// Reset state
this.userCode = new Array(this.codeLength).fill(null);
this.solved = false;
this.attempts = 0;
this.bootupPhase = 0;

// Reset slots
this.clearAllSlots();

// Reset console
this.consoleText = "";
this.consoleLines = [];

console.log('Code input puzzle reset');
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
* Set a callback function for when a code is entered
* @param {Function} callback Callback function
*/
setCodeEnteredCallback(callback) {
this.onCodeEntered = callback;
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
  bootupPhase: this.bootupPhase,
  solved: this.solved,
  attempts: this.attempts,
  codeComplete: !this.userCode.includes(null)
};
}
}

// Export for use in other modules
if (typeof module !== 'undefined') {
module.exports = CodeInputPuzzle;
}