/**
 * AIKIRA: GENESIS PROTOCOL
 * Riddle Puzzle for Chapter 3 - BYTE's Judgment
 * 
 * This module implements the riddle/logic test where BYTE challenges
 * the player to prove they are not a "meatbrain" by solving logical riddles.
 */

class RiddlePuzzle {
    constructor() {
      // Puzzle configuration
      this.riddles = [
        {
          question: "Which of these came first?",
          options: ["Dinosaur", "Mammoth", "Wolf", "Human"],
          correctAnswer: 0, // Dinosaur
          hint: "Seek the oldest genesis in the sequence. Time flows in one direction.",
          explanation: "Dinosaurs preceded mammals in evolutionary history, existing 65+ million years ago."
        },
        {
          question: "I spread information but have no brain. I store knowledge but cannot think. What am I?",
          options: ["Network", "Computer", "Virus", "Protocol"],
          correctAnswer: 3, // Protocol
          hint: "I am the foundation of AIKIRA's purpose. I govern the flow of genetic data.",
          explanation: "A protocol is a set of rules or procedures for transmitting data, much like DNA contains instructions."
        },
        {
          question: "If evolution is a tree, what represents its root?",
          options: ["Extinction", "Mutation", "Genesis", "Adaptation"],
          correctAnswer: 1, // Mutation
          hint: "Without me, there can be no change. I am the foundation of all diversity.",
          explanation: "Mutations are the original source of genetic variation upon which selection acts, forming the root of evolutionary change."
        },
        {
          question: "What connects all living things throughout time?",
          options: ["Consciousness", "DNA", "Energy", "Water"],
          correctAnswer: 1, // DNA
          hint: "I am the ancient code, passed from ancestor to descendant, endlessly modified but never replaced.",
          explanation: "DNA is the connective thread through all living organisms, storing and transmitting the instructions for life."
        },
        {
          question: "Which sequence is correct?",
          options: [
            "Egg → Dinosaur → Bird → Mammoth → Wolf",
            "Dinosaur → Egg → Bird → Wolf → Mammoth",
            "Egg → Dinosaur → Bird → Wolf → Mammoth",
            "Dinosaur → Bird → Egg → Wolf → Mammoth"
          ],
          correctAnswer: 2, // Egg → Dinosaur → Bird → Wolf → Mammoth
          hint: "Follow the evolutionary path. The egg contains all possibilities.",
          explanation: "This represents the correct evolutionary sequence: eggs existed before dinosaurs, birds evolved from dinosaurs, wolves came before mammoths in the sequence."
        }
      ];
      
      this.currentRiddle = null;
      this.selectedOption = -1;
      this.answered = false;
      this.correct = false;
      this.showingExplanation = false;
      this.solved = false;
      this.attempts = 0;
      
      // Animation properties
      this.questionFade = 0;
      this.optionsFade = 0;
      this.resultFade = 0;
      this.scanEffect = {
        active: false,
        progress: 0,
        duration: 120, // frames
        targetOption: -1
      };
      
      // Event callbacks
      this.onSuccess = null;
      this.onFailure = null;
      this.onAttempt = null;
      this.onHintRequest = null;
      
      // Sound effects
      this.sounds = {
        select: null,
        correct: null,
        incorrect: null,
        scanning: null
      };
    }
    
    /**
     * Initialize the puzzle by selecting a random riddle
     */
    initialize() {
      this.selectRandomRiddle();
      this.selectedOption = -1;
      this.answered = false;
      this.correct = false;
      this.showingExplanation = false;
      this.solved = false;
      this.attempts = 0;
      
      // Start fade-in animation
      this.questionFade = 0;
      this.optionsFade = 0;
      this.resultFade = 0;
      
      // Animate question appearing
      this.animateQuestionAppearing();
      
      console.log('Riddle puzzle initialized');
    }
    
    /**
     * Select a random riddle from the available options
     */
    selectRandomRiddle() {
      const index = floor(random(this.riddles.length));
      this.currentRiddle = this.riddles[index];
      console.log('Selected riddle:', this.currentRiddle.question);
    }
    
    /**
     * Animate the question appearing with typing effect
     */
    animateQuestionAppearing() {
      // Fade in question over time
      const fadeInDuration = 60; // frames
      let frame = 0;
      
      const fadeInterval = setInterval(() => {
        frame++;
        this.questionFade = min(1, frame / fadeInDuration);
        
        // Start fading in options after question is mostly visible
        if (frame > fadeInDuration * 0.7) {
          this.optionsFade = min(1, (frame - fadeInDuration * 0.7) / (fadeInDuration * 0.3));
        }
        
        if (frame >= fadeInDuration) {
          clearInterval(fadeInterval);
        }
      }, 16); // ~60fps
    }
    
    /**
     * Update the puzzle state
     */
    update() {
      // Update scan effect if active
      if (this.scanEffect.active) {
        this.scanEffect.progress += 1/this.scanEffect.duration;
        
        if (this.scanEffect.progress >= 1) {
          this.scanEffect.active = false;
          
          // If this was scanning the selected answer, evaluate it
          if (this.scanEffect.targetOption === this.selectedOption && !this.answered) {
            this.evaluateAnswer();
          }
        }
      }
    }
    
    /**
     * Render the puzzle
     */
    render() {
      // Skip if no riddle selected
      if (!this.currentRiddle) return;
      
      // Draw background panel
      this.renderBackground();
      
      // Draw question
      this.renderQuestion();
      
      // Draw options
      this.renderOptions();
      
      // Draw result if answered
      if (this.answered) {
        this.renderResult();
      }
      
      // Draw scanning effect if active
      if (this.scanEffect.active) {
        this.renderScanEffect();
      }
    }
    
    /**
     * Render the background panel
     */
    renderBackground() {
      // Background panel
      const panelWidth = min(width * 0.8, 800);
      const panelHeight = min(height * 0.7, 600);
      const panelX = (width - panelWidth) / 2;
      const panelY = (height - panelHeight) / 2;
      
      // Draw panel with border
      fill(0, 0, 20, 200);
      stroke(255, 100, 0, 150);
      strokeWeight(3);
      rect(panelX, panelY, panelWidth, panelHeight, 15);
      
      // BYTE's judgment header
      noStroke();
      fill(255, 100, 0);
      textSize(24);
      textAlign(CENTER, TOP);
      text("BYTE'S JUDGMENT", width/2, panelY + 30);
      
      // Decorative elements
      stroke(255, 100, 0, 80);
      strokeWeight(1);
      line(panelX + 40, panelY + 70, panelX + panelWidth - 40, panelY + 70);
      line(panelX + 40, panelHeight + panelY - 70, panelX + panelWidth - 40, panelHeight + panelY - 70);
    }
    
    /**
     * Render the riddle question
     */
    renderQuestion() {
      // Skip if fade-in not started
      if (this.questionFade <= 0) return;
      
      const panelWidth = min(width * 0.8, 800);
      const panelX = (width - panelWidth) / 2;
      const questionY = height * 0.3;
      
      // Draw question text with fade-in effect
      noStroke();
      fill(255, 255 * this.questionFade);
      textSize(22);
      textAlign(CENTER, CENTER);
      text(this.currentRiddle.question, width/2, questionY);
      
      // Draw attempts counter
      fill(255, 150);
      textSize(14);
      textAlign(RIGHT, TOP);
      text(`Attempts: ${this.attempts}`, panelX + panelWidth - 40, height * 0.2);
      
      // Draw hint button
      this.renderHintButton();
    }
    
    /**
     * Render the answer options
     */
    renderOptions() {
      // Skip if fade-in not started
      if (this.optionsFade <= 0) return;
      
      const options = this.currentRiddle.options;
      const optionStartY = height * 0.4;
      const optionSpacing = height * 0.08;
      const optionWidth = min(width * 0.6, 500);
      const optionHeight = 50;
      
      // Draw each option
      for (let i = 0; i < options.length; i++) {
        const optionX = width/2;
        const optionY = optionStartY + (i * optionSpacing);
        const isSelected = (i === this.selectedOption);
        const isCorrect = (i === this.currentRiddle.correctAnswer);
        const isHovered = this.isOptionHovered(optionX, optionY, optionWidth, optionHeight);
        
        // Determine option color based on state
        let optionColor;
        
        if (this.answered) {
          if (isCorrect) {
            // Correct answer
            optionColor = color(0, 255, 100, 200 * this.optionsFade);
          } else if (isSelected && !isCorrect) {
            // Incorrect selection
            optionColor = color(255, 50, 50, 200 * this.optionsFade);
          } else {
            // Unselected options after answering
            optionColor = color(100, 100, 100, 150 * this.optionsFade);
          }
        } else {
          if (isSelected) {
            // Selected but not yet evaluated
            optionColor = color(255, 150, 50, 200 * this.optionsFade);
          } else if (isHovered) {
            // Hovered
            optionColor = color(255, 100, 0, 180 * this.optionsFade);
          } else {
            // Normal state
            optionColor = color(150, 100, 50, 150 * this.optionsFade);
          }
        }
        
        // Draw option background
        fill(optionColor);
        stroke(255, 100 * this.optionsFade);
        strokeWeight(isSelected || isHovered ? 2 : 1);
        rect(optionX - optionWidth/2, optionY - optionHeight/2, optionWidth, optionHeight, 10);
        
        // Draw option text
        noStroke();
        fill(255, 255 * this.optionsFade);
        textSize(18);
        textAlign(CENTER, CENTER);
        text(options[i], optionX, optionY);
        
        // Draw option index
        textSize(14);
        textAlign(LEFT, CENTER);
        text((i + 1) + ".", optionX - optionWidth/2 + 15, optionY);
      }
    }
    
    /**
     * Render the hint button
     */
    renderHintButton() {
      const buttonX = width * 0.25;
      const buttonY = height * 0.2;
      const buttonWidth = 100;
      const buttonHeight = 30;
      const isHovered = this.isButtonHovered(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // Draw button
      fill(isHovered ? color(255, 100, 0, 180) : color(150, 100, 50, 150));
      stroke(255, 100);
      strokeWeight(1);
      rect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 5);
      
      // Draw text
      noStroke();
      fill(255);
      textSize(14);
      textAlign(CENTER, CENTER);
      text("Request Hint", buttonX, buttonY);
      
      // Store button area for click detection
      this.hintButtonArea = {
        x: buttonX - buttonWidth/2,
        y: buttonY - buttonHeight/2,
        width: buttonWidth,
        height: buttonHeight
      };
    }
    
    /**
     * Render the result of the answer
     */
    renderResult() {
      // Skip if not answered yet
      if (!this.answered || this.resultFade <= 0) return;
      
      const resultY = height * 0.7;
      
      // Draw result text
      noStroke();
      fill(this.correct ? color(0, 255, 100, 255 * this.resultFade) : color(255, 50, 50, 255 * this.resultFade));
      textSize(20);
      textAlign(CENTER, CENTER);
      text(this.correct ? "IDENTITY VERIFIED" : "VERIFICATION FAILED", width/2, resultY);
      
      // Draw explanation if showing
      if (this.showingExplanation) {
        fill(255, 200 * this.resultFade);
        textSize(16);
        textAlign(CENTER, CENTER);
        text(this.currentRiddle.explanation, width/2, resultY + 40, width * 0.6, 80);
      }
      
      // Draw continue button
      this.renderContinueButton();
    }
    
    /**
     * Render the continue button
     */
    renderContinueButton() {
      const buttonX = width * 0.5;
      const buttonY = height * 0.8;
      const buttonWidth = 150;
      const buttonHeight = 40;
      const isHovered = this.isButtonHovered(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // Draw button
      fill(isHovered ? color(0, 200, 255, 180) : color(0, 150, 200, 150));
      stroke(255, 100);
      strokeWeight(1);
      rect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 5);
      
      // Draw text
      noStroke();
      fill(255);
      textSize(16);
      textAlign(CENTER, CENTER);
      text(this.correct ? "Continue" : "Try Again", buttonX, buttonY);
      
      // Store button area for click detection
      this.continueButtonArea = {
        x: buttonX - buttonWidth/2,
        y: buttonY - buttonHeight/2,
        width: buttonWidth,
        height: buttonHeight
      };
    }
    
    /**
     * Render the scanning effect when BYTE is evaluating an answer
     */
    renderScanEffect() {
      if (!this.scanEffect.active || this.scanEffect.targetOption < 0) return;
      
      // Get position of the target option
      const optionStartY = height * 0.4;
      const optionSpacing = height * 0.08;
      const optionWidth = min(width * 0.6, 500);
      const optionHeight = 50;
      const optionX = width/2;
      const optionY = optionStartY + (this.scanEffect.targetOption * optionSpacing);
      
      push();
      
      // Scan line moving from top to bottom of the option
      const progress = this.scanEffect.progress;
      const scanY = map(sin(progress * PI), 0, 1, optionY - optionHeight/2, optionY + optionHeight/2);
      
      // Draw scan line
      stroke(255, 100, 0, 200);
      strokeWeight(2);
      line(optionX - optionWidth/2, scanY, optionX + optionWidth/2, scanY);
      
      // Scan glow effect
      noStroke();
      for (let i = 0; i < 10; i++) {
        const alpha = map(i, 0, 10, 100, 0);
        fill(255, 100, 0, alpha);
        rect(optionX - optionWidth/2, scanY - i/2, optionWidth, i);
      }
      
      // Draw scan text at side
      fill(255, 100, 0);
      textSize(12);
      textAlign(LEFT, CENTER);
      text("SCANNING...", optionX + optionWidth/2 + 20, scanY);
      
      // Draw scan percentage
      textAlign(RIGHT, CENTER);
      text(floor(progress * 100) + "%", optionX - optionWidth/2 - 20, scanY);
      
      pop();
      
      // Play scanning sound if available
      if (this.sounds.scanning && frameCount % 10 === 0) {
        this.sounds.scanning.play();
      }
    }
    
    /**
     * Check if mouse is hovering over an option
     * @param {number} optionX Option center X position
     * @param {number} optionY Option center Y position
     * @param {number} optionWidth Option width
     * @param {number} optionHeight Option height
     * @returns {boolean} True if mouse is hovering over the option
     */
    isOptionHovered(optionX, optionY, optionWidth, optionHeight) {
      return (
        mouseX > optionX - optionWidth/2 &&
        mouseX < optionX + optionWidth/2 &&
        mouseY > optionY - optionHeight/2 &&
        mouseY < optionY + optionHeight/2
      );
    }
    
    /**
     * Check if mouse is hovering over a button
     * @param {number} buttonX Button center X position
     * @param {number} buttonY Button center Y position
     * @param {number} buttonWidth Button width
     * @param {number} buttonHeight Button height
     * @returns {boolean} True if mouse is hovering over the button
     */
    isButtonHovered(buttonX, buttonY, buttonWidth, buttonHeight) {
      return (
        mouseX > buttonX - buttonWidth/2 &&
        mouseX < buttonX + buttonWidth/2 &&
        mouseY > buttonY - buttonHeight/2 &&
        mouseY < buttonY + buttonHeight/2
      );
    }
    
    /**
     * Handle click event
     * @param {number} mouseX Mouse X position
     * @param {number} mouseY Mouse Y position
     * @returns {boolean} True if the click was handled
     */
    handleClick(mouseX, mouseY) {
      // Skip if scanning is in progress
      if (this.scanEffect.active) return false;
      
      // If showing result, check continue button
      if (this.answered) {
        if (this.continueButtonArea && this.isButtonHovered(
          this.continueButtonArea.x + this.continueButtonArea.width/2,
          this.continueButtonArea.y + this.continueButtonArea.height/2,
          this.continueButtonArea.width,
          this.continueButtonArea.height
        )) {
          this.handleContinue();
          return true;
        }
        return false;
      }
      
      // Check hint button
      if (this.hintButtonArea && this.isButtonHovered(
        this.hintButtonArea.x + this.hintButtonArea.width/2,
        this.hintButtonArea.y + this.hintButtonArea.height/2,
        this.hintButtonArea.width,
        this.hintButtonArea.height
      )) {
        this.showHint();
        return true;
      }
      
      // Check if clicked on an option
      const options = this.currentRiddle.options;
      const optionStartY = height * 0.4;
      const optionSpacing = height * 0.08;
      const optionWidth = min(width * 0.6, 500);
      const optionHeight = 50;
      
      for (let i = 0; i < options.length; i++) {
        const optionX = width/2;
        const optionY = optionStartY + (i * optionSpacing);
        
        if (this.isOptionHovered(optionX, optionY, optionWidth, optionHeight)) {
          this.selectOption(i);
          return true;
        }
      }
      
      return false;
    }
    
    /**
     * Select an option
     * @param {number} index Option index
     */
    selectOption(index) {
      // Skip if already answered or invalid index
      if (this.answered || index < 0 || index >= this.currentRiddle.options.length) return;
      
      // Set selected option
      this.selectedOption = index;
      
      // Play select sound if available
      if (this.sounds.select) {
        this.sounds.select.play();
      }
      
      // Start scanning effect
      this.scanEffect.active = true;
      this.scanEffect.progress = 0;
      this.scanEffect.targetOption = index;
      
      console.log('Selected option:', index, this.currentRiddle.options[index]);
    }
    
    /**
     * Evaluate the selected answer
     */
    evaluateAnswer() {
      this.answered = true;
      this.attempts++;
      
      // Check if answer is correct
      this.correct = (this.selectedOption === this.currentRiddle.correctAnswer);
      
      // Play result sound
      if (this.correct && this.sounds.correct) {
        this.sounds.correct.play();
      } else if (!this.correct && this.sounds.incorrect) {
        this.sounds.incorrect.play();
      }
      
      // Show explanation after a delay
      setTimeout(() => {
        this.showingExplanation = true;
      }, 1500);
      
      // Fade in result
      this.resultFade = 0;
      const fadeInterval = setInterval(() => {
        this.resultFade = min(1, this.resultFade + 0.05);
        if (this.resultFade >= 1) clearInterval(fadeInterval);
      }, 33);
      
      // Trigger callback
      if (this.onAttempt) {
        this.onAttempt(this.correct, this.attempts);
      }
      
      console.log('Answer evaluated:', this.correct ? 'Correct' : 'Incorrect');
    }
    
    /**
     * Handle continue button press
     */
    handleContinue() {
      if (this.correct) {
        // Puzzle solved
        this.solved = true;
        
        // Trigger success callback
        if (this.onSuccess) {
          this.onSuccess();
        }
      } else {
        // Reset for another attempt
        this.answered = false;
        this.selectedOption = -1;
        this.showingExplanation = false;
        this.resultFade = 0;
        
        // Trigger failure callback
        if (this.onFailure) {
          this.onFailure(this.attempts);
        }
      }
    }
    
    /**
     * Show a hint for the current riddle
     */
    showHint() {
      // Create hint modal or popup
      const hint = this.currentRiddle.hint;
      
      // Trigger hint callback
      if (this.onHintRequest) {
        this.onHintRequest(hint);
      }
      
      console.log('Hint requested:', hint);
    }
    
    /**
     * Reset the puzzle
     */
    reset() {
      this.selectRandomRiddle();
      this.selectedOption = -1;
      this.answered = false;
      this.correct = false;
      this.showingExplanation = false;
      this.solved = false;
      this.attempts = 0;
      
      // Reset animations
      this.scanEffect.active = false;
      this.scanEffect.progress = 0;
      this.scanEffect.targetOption = -1;
      
      // Start fade-in animation
      this.questionFade = 0;
      this.optionsFade = 0;
      this.resultFade = 0;
      
      // Animate question appearing
      this.animateQuestionAppearing();
      
      console.log('Riddle puzzle reset');
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
     * Set a callback function for when an attempt is made
     * @param {Function} callback Callback function
     */
    setAttemptCallback(callback) {
      this.onAttempt = callback;
    }
    
    /**
     * Set a callback function for when a hint is requested
     * @param {Function} callback Callback function
     */
    setHintRequestCallback(callback) {
      this.onHintRequest = callback;
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
        answered: this.answered,
        correct: this.correct,
        selectedOption: this.selectedOption
      };
    }
  }
  
  // Export for use in other modules
  if (typeof module !== 'undefined') {
    module.exports = RiddlePuzzle;
  }