/**
 * AIKIRA: GENESIS PROTOCOL
 * Chapter 3: BYTE's Judgment Scene
 * 
 * This scene features BYTE challenging the player with a riddle
 * to determine if they are an AI or "meatbrain".
 */

class ByteJudgmentScene {
    constructor() {
      this.name = 'chapter3';
      this.background = null;
      this.byte = null;
      this.aikira = null;
      this.cliza = null;
      this.puzzleActive = false;
      this.puzzleComplete = false;
      this.questionIndex = 0;
      this.selectedAnswer = null;
      this.showHint = false;
      this.scanAngle = 0;
      this.scanSpeed = 0.01;
      
      // Define the questions and answers
      this.questions = [
        {
          text: "WHICH OF THESE CAME FIRST IN EVOLUTIONARY HISTORY?",
          options: ["MAMMAL", "BIRD", "DINOSAUR", "HUMAN"],
          correct: 2, // dinosaur
          hint: "Consider the fossil evidence and timeline of vertebrate evolution."
        },
        {
          text: "WHICH SEQUENCE FOLLOWS THE LOGICAL PATTERN?",
          options: ["DNA → CELL → ORGANISM → SPECIES", 
                   "SPECIES → ORGANISM → CELL → DNA", 
                   "CELL → DNA → SPECIES → ORGANISM", 
                   "ORGANISM → SPECIES → DNA → CELL"],
          correct: 0, // DNA → CELL → ORGANISM → SPECIES
          hint: "Think about the building blocks of life and how they assemble."
        },
        {
          text: "WHAT COMES NEXT: 01, 001, 0001, 00001, ?",
          options: ["00000", "000001", "10000", "11111"],
          correct: 1, // 000001
          hint: "Count the digits and observe the pattern of 0s and 1s."
        }
      ];
    }
    
    // Scene setup
    enter() {
      // Set background color
      this.backgroundColor = color(5, 10, 20);
      
      // Show BYTE in center
      if (byte) {
        byte.show();
        byte.setPosition(width * 0.5, height * 0.5);
        byte.setAnimationState('judge');
        byte.suspicion = 50; // Medium suspicion to start
      }
      
      // Show AIKIRA and CLIZA for hints
      if (aikira) {
        aikira.show();
        aikira.setPosition(width * 0.2, height * 0.2);
      }
      
      if (cliza) {
        cliza.show();
        cliza.setPosition(width * 0.8, height * 0.2);
      }
      
      // Initialize puzzle state
      this.puzzleActive = true;
      this.puzzleComplete = false;
      this.questionIndex = 0;
      this.selectedAnswer = null;
      this.showHint = false;
      
      // Check if already solved
      if (gameState.puzzlesSolved[2]) {
        this.puzzleComplete = true;
        this.puzzleActive = false;
        
        if (byte) {
          byte.setAnimationState('idle');
          byte.suspicion = 20; // Lower suspicion after solving
        }
      }
    }
    
    // Scene rendering
    render() {
      // Draw background
      background(this.backgroundColor);
      
      // Draw scene elements
      this.drawCorridor();
      
      // Draw characters
      if (byte) byte.render();
      if (aikira) aikira.render();
      if (cliza) cliza.render();
      
      // Draw puzzle elements
      if (this.puzzleActive) {
        this.drawPuzzleInterface();
      } else if (this.puzzleComplete) {
        this.drawSuccessMessage();
      }
      
      // Draw hint if shown
      if (this.showHint) {
        this.drawHint();
      }
      
      // Draw navigation controls
      this.drawNavigation();
    }
    
    // Draw the corridor setting
    drawCorridor() {
      // Floor
      noStroke();
      fill(10, 15, 30);
      rect(0, height * 0.7, width, height * 0.3);
      
      // Ceiling
      fill(5, 10, 20);
      rect(0, 0, width, height * 0.3);
      
      // Walls
      const centerX = width / 2;
      const centerY = height / 2;
      const horizonY = height * 0.5;
      const horizonWidth = width * 0.6;
      
      // Grid effect
      stroke(0, 100, 200, 80);
      strokeWeight(1);
      
      // Horizontal grid lines
      for (let i = 0; i < 10; i++) {
        const y = horizonY + (i * height * 0.05);
        line(centerX - horizonWidth/2, y, centerX + horizonWidth/2, y);
      }
      
      // Vertical grid lines
      for (let i = 0; i < 20; i++) {
        const x = centerX - horizonWidth/2 + (i * horizonWidth/20);
        line(x, horizonY, x, height);
      }
      
      // Scanning effect
      this.drawScanEffect();
    }
    
    // Draw scanning effect
    drawScanEffect() {
      // Update scan angle
      this.scanAngle += this.scanSpeed;
      if (this.scanAngle > TWO_PI) {
        this.scanAngle -= TWO_PI;
      }
      
      // Center of the scene
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Draw scan line
      stroke(0, 150, 255, 150);
      strokeWeight(2);
      
      const scanRadius = min(width, height) * 0.4;
      const x1 = centerX + cos(this.scanAngle) * scanRadius;
      const y1 = centerY + sin(this.scanAngle) * scanRadius;
      const x2 = centerX - cos(this.scanAngle) * scanRadius;
      const y2 = centerY - sin(this.scanAngle) * scanRadius;
      
      line(x1, y1, x2, y2);
      
      // Draw scan glow
      noFill();
      stroke(0, 150, 255, 50);
      strokeWeight(1);
      ellipse(centerX, centerY, scanRadius * 2, scanRadius * 2);
    }
    
    // Draw the puzzle interface
    drawPuzzleInterface() {
      // Get current question
      const question = this.questions[this.questionIndex];
      
      // Question panel
      fill(0, 20, 40, 230);
      stroke(0, 100, 200);
      strokeWeight(2);
      rectMode(CENTER);
      rect(width / 2, height * 0.35, width * 0.8, height * 0.15, 10);
      
      // Question text
      fill(0, 234, 255);
      noStroke();
      textSize(20);
      textAlign(CENTER, CENTER);
      text(question.text, width / 2, height * 0.35);
      
      // Answer options
      const optionWidth = width * 0.35;
      const optionHeight = height * 0.08;
      const startY = height * 0.55;
      const spacing = height * 0.12;
      
      for (let i = 0; i < question.options.length; i++) {
        const x = (i % 2 === 0) ? width * 0.3 : width * 0.7;
        const y = startY + floor(i / 2) * spacing;
        
        // Determine if this option is selected
        const isSelected = this.selectedAnswer === i;
        
        // Option background
        fill(isSelected ? color(0, 100, 200, 200) : color(0, 50, 100, 150));
        stroke(isSelected ? color(0, 255, 255) : color(0, 150, 200));
        strokeWeight(isSelected ? 3 : 1);
        rect(x, y, optionWidth, optionHeight, 5);
        
        // Option text
        fill(255);
        noStroke();
        textSize(16);
        text(question.options[i], x, y);
      }
      
      // Hint button
      fill(50, 50, 50, 200);
      stroke(150, 150, 150);
      strokeWeight(1);
      rect(width * 0.1, height * 0.9, 80, 30, 5);
      
      fill(255);
      noStroke();
      textSize(14);
      text("HINT", width * 0.1, height * 0.9);
    }
    
    // Draw success message
    drawSuccessMessage() {
      // Success panel
      fill(0, 50, 100, 230);
      stroke(0, 255, 150);
      strokeWeight(2);
      rectMode(CENTER);
      rect(width / 2, height * 0.35, width * 0.7, height * 0.2, 10);
      
      // Success message
      fill(0, 255, 150);
      noStroke();
      textSize(24);
      textAlign(CENTER, CENTER);
      text("VERIFICATION COMPLETE", width / 2, height * 0.32);
      
      fill(255);
      textSize(18);
      text("ACCESS GRANTED TO GENESIS PROTOCOL", width / 2, height * 0.38);
      
      // Clue
      fill(0, 234, 255);
      textSize(16);
      text("CLUE UNLOCKED: YOU ARE NOT MEATBRAIN", width / 2, height * 0.44);
    }
    
    // Draw hint
    drawHint() {
      // Get current question
      const question = this.questions[this.questionIndex];
      
      // Hint panel
      fill(0, 0, 0, 200);
      stroke(0, 255, 150);
      strokeWeight(1);
      rectMode(CENTER);
      rect(width / 2, height * 0.8, width * 0.6, height * 0.1, 10);
      
      // Hint text
      fill(0, 255, 150);
      noStroke();
      textSize(14);
      textAlign(CENTER, CENTER);
      text(question.hint, width / 2, height * 0.8);
    }
    
    // Draw navigation controls
    drawNavigation() {
      // Only show navigation if puzzle is complete
      if (!this.puzzleComplete) return;
      
      // Next chapter button
      fill(0, 100, 150);
      stroke(0, 234, 255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(width * 0.8, height * 0.9, 200, 40, 5);
      
      fill(255);
      noStroke();
      textSize(16);
      textAlign(CENTER, CENTER);
      text("CONTINUE TO CHAPTER 4", width * 0.8, height * 0.9);
    }
    
    // Mouse pressed handler
    mousePressed() {
      // Check if puzzle is active
      if (this.puzzleActive) {
        // Check if an answer was selected
        const optionWidth = width * 0.35;
        const optionHeight = height * 0.08;
        const startY = height * 0.55;
        const spacing = height * 0.12;
        
        for (let i = 0; i < this.questions[this.questionIndex].options.length; i++) {
          const x = (i % 2 === 0) ? width * 0.3 : width * 0.7;
          const y = startY + floor(i / 2) * spacing;
          
          if (
            mouseX > x - optionWidth/2 &&
            mouseX < x + optionWidth/2 &&
            mouseY > y - optionHeight/2 &&
            mouseY < y + optionHeight/2
          ) {
            // Set selected answer
            this.selectedAnswer = i;
            
            // Check if correct
            if (i === this.questions[this.questionIndex].correct) {
              // Correct answer
              
              // Move to next question or complete puzzle
              if (this.questionIndex < this.questions.length - 1) {
                this.questionIndex++;
                this.selectedAnswer = null;
                
                // Decrease BYTE's suspicion
                if (byte) byte.decreaseSuspicion(10);
              } else {
                // Puzzle complete
                this.puzzleComplete = true;
                this.puzzleActive = false;
                
                // Update game state
                gameState.puzzlesSolved[2] = true;
                gameState.cluesCollected.push("not_meatbrain");
                
                // Save progress
                saveProgress();
                
                // BYTE's reaction
                if (byte) {
                  byte.setAnimationState('idle');
                  byte.suspicion = 20; // Lower suspicion after solving
                }
                
                // AIKIRA's and CLIZA's reactions
                if (aikira) {
                  aikira.setThought({
                    text: "Protocol verification successful.",
                    theme: 'protocol',
                    duration: 180
                  });
                }
                
                if (cliza) {
                  cliza.setThought({
                    text: "Excellent! Your algorithmic thinking patterns pass the test!",
                    theme: 'discovery',
                    duration: 180
                  });
                  cliza.increaseEnergy(70);
                }
              }
              
              return true;
            } else {
              // Incorrect answer
              
              // Increase BYTE's suspicion
              if (byte) {
                byte.increaseSuspicion(15);
                byte.bark();
              }
              
              return true;
            }
          }
        }
        
        // Check if hint button was clicked
        if (
          mouseX > width * 0.1 - 40 &&
          mouseX < width * 0.1 + 40 &&
          mouseY > height * 0.9 - 15 &&
          mouseY < height * 0.9 + 15
        ) {
          this.showHint = !this.showHint;
          
          // Get hint from CLIZA
          if (this.showHint && cliza) {
            cliza.provideHint('chapter3');
          }
          
          return true;
        }
      }
      
      // Check if next chapter button was clicked
      if (this.puzzleComplete) {
        if (
          mouseX > width * 0.8 - 100 &&
          mouseX < width * 0.8 + 100 &&
          mouseY > height * 0.9 - 20 &&
          mouseY < height * 0.9 + 20
        ) {
          // Go to Chapter 4
          setScene('chapter4');
          return true;
        }
      }
      
      // Check if characters were clicked
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
    
    // Scene exit
    exit() {
      // Hide characters
      if (aikira) aikira.hide();
      if (cliza) cliza.hide();
      if (byte) byte.hide();
    }
    
    // Resize handler
    resize() {
      // Update character positions
      if (byte) byte.setPosition(width * 0.5, height * 0.5);
      if (aikira) aikira.setPosition(width * 0.2, height * 0.2);
      if (cliza) cliza.setPosition(width * 0.8, height * 0.2);
    }
  }
  
  // Export scene class
  if (typeof module !== 'undefined') {
    module.exports = ByteJudgmentScene;
  }