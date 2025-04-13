/**
 * AIKIRA: GENESIS PROTOCOL
 * Chapter 1: Cryptic Wall
 * 
 * First chapter of the Genesis Protocol adventure.
 * Players decode an ancient cryptic wall by selecting
 * the correct sequence of symbols.
 */

// Import the BaseScene class
import BaseScene from './BaseScene';

class CrypticWallScene extends BaseScene {
  constructor() {
    super('Chapter1: Cryptic Wall');
    
    // Chapter-specific properties
    this.symbols = [];
    this.correctSequence = ['dna', 'egg', 'claw', 'eye', 'star'];
    this.selectedSymbols = [];
    this.completed = false;
    this.hintShown = false;
    
    // Game state reference
    this.gameState = typeof window !== 'undefined' && window.gameState ? window.gameState : {
      currentChapter: 1,
      cluesCollected: [],
      puzzlesSolved: [false, false, false, false, false],
    };
  }
  
  // Initialize scene
  enter() {
    super.enter();
    
    // Set background color
    this.backgroundColor = '#050A15';
    
    // Initialize symbols
    this.initSymbols();
    
    // Show Aikira if available
    if (window.gameEngine && window.gameEngine.aikira) {
      window.gameEngine.aikira.show();
      window.gameEngine.aikira.setPosition(this.width * 0.15, this.height * 0.5);
    }
    
    // Play intro dialogue if not already completed
    const isSolved = this.gameState.puzzlesSolved[0];
    if (!isSolved && window.dialogueSystem) {
      window.dialogueSystem.playSequence('chapter1:intro');
    }
    
    console.log('Chapter 1: Cryptic Wall initialized');
  }
  
  // Create and place symbols on the wall
  initSymbols() {
    // Clear existing symbols
    this.symbols = [];
    this.selectedSymbols = [];
    
    // Define possible symbols
    const symbolTypes = ['dna', 'egg', 'claw', 'eye', 'star', 'wolf', 'mammoth', 'human'];
    
    // Create a grid of symbols
    const gridSize = this.min(this.width, this.height) * 0.7;
    const cols = 4;
    const rows = 2;
    const symbolSize = gridSize / this.max(cols, rows) * 0.7;
    
    // Calculate starting position
    const startX = (this.width - gridSize) / 2 + symbolSize;
    const startY = (this.height - gridSize) / 2 + symbolSize * 1.5;
    
    // Shuffle symbols for randomized placement
    const shuffledSymbols = this.shuffleArray([...symbolTypes]);
    
    // Create symbol objects
    let index = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (index < symbolTypes.length) {
          const scene = this; // Store reference to the scene for use in methods
          
          const symbol = {
            type: shuffledSymbols[index],
            x: startX + x * (gridSize / cols),
            y: startY + y * (gridSize / rows),
            size: symbolSize,
            active: false,
            hovered: false,
            selected: false,
            render: function() {
              this.draw();
            },
            draw: function() {
              scene.push();
              
              // Determine symbol appearance based on state
              const thisSymbolColor = this.getSymbolColor();
              let glowAmount = 0;
              let scale = 1.0;
              
              if (this.hovered) {
                glowAmount = 10;
                scale = 1.1;
              }
              
              if (this.active) {
                glowAmount = 20;
                scale = 1.2;
              }
              
              if (this.selected) {
                glowAmount = 15;
                scale = 1.2;
              }
              
              // Apply glow effect
              if (glowAmount > 0 && scene.p5 && scene.p5.drawingContext) {
                scene.p5.drawingContext.shadowBlur = glowAmount;
                scene.p5.drawingContext.shadowColor = thisSymbolColor;
              }
              
              // Draw base circle
              scene.fill(10, 20, 30, 200);
              scene.noStroke();
              scene.ellipse(this.x, this.y, this.size * 1.1, this.size * 1.1);
              
              // Draw symbol
              scene.fill(thisSymbolColor);
              scene.noStroke();
              
              // Scale for hover/active effect
              scene.translate(this.x, this.y);
              scene.scale(scale);
              
              // Draw specific symbol based on type
              switch(this.type) {
                case 'dna':
                  this.drawDNA(0, 0, this.size * 0.4);
                  break;
                case 'egg':
                  this.drawEgg(0, 0, this.size * 0.4);
                  break;
                case 'claw':
                  this.drawClaw(0, 0, this.size * 0.4);
                  break;
                case 'eye':
                  this.drawEye(0, 0, this.size * 0.4);
                  break;
                case 'star':
                  this.drawStar(0, 0, this.size * 0.4, 5);
                  break;
                case 'wolf':
                  this.drawWolf(0, 0, this.size * 0.4);
                  break;
                case 'mammoth':
                  this.drawMammoth(0, 0, this.size * 0.4);
                  break;
                case 'human':
                  this.drawHuman(0, 0, this.size * 0.4);
                  break;
                default:
                  scene.ellipse(0, 0, this.size * 0.5, this.size * 0.5);
              }
              
              // Reset shadow
              if (scene.p5 && scene.p5.drawingContext) {
                scene.p5.drawingContext.shadowBlur = 0;
              }
              
              scene.pop();
            },
            // Get the color based on the symbol's state
            getSymbolColor: function() {
              if (this.selected) {
                return scene.color(0, 255, 150, 255);
              } else if (this.active) {
                return scene.color(0, 234, 255, 255);
              } else if (this.hovered) {
                return scene.color(200, 200, 255, 200);
              } else {
                return scene.color(200, 200, 200, 150);
              }
            },
            drawDNA: function(x, y, size) {
              const thisSymbolColor = this.getSymbolColor();
              // Double helix
              scene.stroke(thisSymbolColor);
              scene.noFill();
              scene.strokeWeight(size * 0.15);
              
              // First strand
              scene.beginShape();
              for (let i = -3; i <= 3; i++) {
                scene.curveVertex(
                  x + scene.cos(i * 0.5) * size * 0.5,
                  y + i * size * 0.2
                );
              }
              scene.endShape();
              
              // Second strand
              scene.beginShape();
              for (let i = -3; i <= 3; i++) {
                scene.curveVertex(
                  x - scene.cos(i * 0.5) * size * 0.5,
                  y + i * size * 0.2
                );
              }
              scene.endShape();
              
              // Connecting lines
              scene.strokeWeight(size * 0.1);
              for (let i = -2; i <= 2; i++) {
                scene.line(
                  x - scene.cos(i * 0.5) * size * 0.5,
                  y + i * size * 0.2,
                  x + scene.cos(i * 0.5) * size * 0.5,
                  y + i * size * 0.2
                );
              }
            },
            drawEgg: function(x, y, size) {
              const thisSymbolColor = this.getSymbolColor();
              // Egg shape
              scene.noStroke();
              scene.fill(thisSymbolColor);
              
              scene.ellipseMode(scene.CENTER);
              scene.ellipse(x, y + size * 0.1, size * 0.8, size);
              
              // Glow
              scene.fill(255, 255, 255, 100);
              scene.ellipse(x - size * 0.2, y - size * 0.1, size * 0.2, size * 0.1);
            },
            drawClaw: function(x, y, size) {
              const thisSymbolColor = this.getSymbolColor();
              // Three claws
              scene.stroke(thisSymbolColor);
              scene.strokeWeight(size * 0.15);
              scene.noFill();
              
              // Middle claw
              scene.beginShape();
              scene.vertex(x, y + size * 0.5);
              scene.bezierVertex(
                x, y, 
                x, y - size * 0.5, 
                x, y - size * 0.8
              );
              scene.endShape();
              
              // Left claw
              scene.beginShape();
              scene.vertex(x, y + size * 0.5);
              scene.bezierVertex(
                x - size * 0.3, y, 
                x - size * 0.5, y - size * 0.3, 
                x - size * 0.6, y - size * 0.6
              );
              scene.endShape();
              
              // Right claw
              scene.beginShape();
              scene.vertex(x, y + size * 0.5);
              scene.bezierVertex(
                x + size * 0.3, y, 
                x + size * 0.5, y - size * 0.3, 
                x + size * 0.6, y - size * 0.6
              );
              scene.endShape();
            },
            drawEye: function(x, y, size) {
              const thisSymbolColor = this.getSymbolColor();
              // Eye shape
              scene.noStroke();
              scene.fill(thisSymbolColor);
              
              // Eye outline
              scene.ellipse(x, y, size, size * 0.6);
              
              // Pupil
              scene.fill(10, 20, 30);
              scene.ellipse(x, y, size * 0.4, size * 0.4);
              
              // Highlight
              scene.fill(255, 255, 255, 150);
              scene.ellipse(x + size * 0.1, y - size * 0.1, size * 0.15, size * 0.15);
            },
            drawStar: function(x, y, size, points) {
              const thisSymbolColor = this.getSymbolColor();
              // Star shape
              scene.noStroke();
              scene.fill(thisSymbolColor);
              
              const outerRadius = size;
              const innerRadius = size * 0.4;
              const angleStep = scene.TWO_PI / points / 2;
              
              scene.beginShape();
              for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = x + scene.cos(i * angleStep - scene.HALF_PI) * radius;
                const py = y + scene.sin(i * angleStep - scene.HALF_PI) * radius;
                scene.vertex(px, py);
              }
              scene.endShape(scene.CLOSE);
            },
            drawWolf: function(x, y, size) {
              const thisSymbolColor = this.getSymbolColor();
              // Wolf silhouette
              scene.noStroke();
              scene.fill(thisSymbolColor);
              
              // Wolf head
              scene.beginShape();
              scene.vertex(x, y - size * 0.6); // Top of head
              scene.vertex(x - size * 0.3, y - size * 0.3); // Left ear
              scene.vertex(x - size * 0.2, y - size * 0.4); // Left ear inner
              scene.vertex(x, y - size * 0.2); // Top of snout
              scene.vertex(x + size * 0.2, y - size * 0.4); // Right ear inner
              scene.vertex(x + size * 0.3, y - size * 0.3); // Right ear
              scene.vertex(x, y - size * 0.6); // Back to top
              scene.endShape();
              
              // Snout
              scene.beginShape();
              scene.vertex(x - size * 0.15, y - size * 0.2);
              scene.vertex(x, y + size * 0.1);
              scene.vertex(x + size * 0.15, y - size * 0.2);
              scene.endShape(scene.CLOSE);
            },
            drawMammoth: function(x, y, size) {
              const thisSymbolColor = this.getSymbolColor();
              // Mammoth silhouette
              scene.noStroke();
              scene.fill(thisSymbolColor);
              
              // Body
              scene.ellipse(x, y, size * 0.8, size * 0.6);
              
              // Head
              scene.ellipse(x + size * 0.5, y - size * 0.2, size * 0.4, size * 0.3);
              
              // Trunk
              scene.beginShape();
              scene.vertex(x + size * 0.7, y - size * 0.2);
              scene.bezierVertex(
                x + size * 0.8, y + size * 0.2,
                x + size * 0.7, y + size * 0.4,
                x + size * 0.6, y + size * 0.5
              );
              scene.endShape();
              
              // Tusks
              scene.stroke(thisSymbolColor);
              scene.strokeWeight(size * 0.08);
              scene.noFill();
              scene.beginShape();
              scene.vertex(x + size * 0.6, y - size * 0.1);
              scene.bezierVertex(
                x + size * 0.7, y + size * 0.1,
                x + size * 0.8, y + size * 0.2,
                x + size * 0.9, y + size * 0.1
              );
              scene.endShape();
              
              scene.beginShape();
              scene.vertex(x + size * 0.6, y - size * 0.15);
              scene.bezierVertex(
                x + size * 0.7, y + size * 0.05,
                x + size * 0.8, y + size * 0.15,
                x + size * 0.9, y + size * 0.05
              );
              scene.endShape();
            },
            drawHuman: function(x, y, size) {
              const thisSymbolColor = this.getSymbolColor();
              // Human silhouette
              scene.noStroke();
              scene.fill(thisSymbolColor);
              
              // Head
              scene.ellipse(x, y - size * 0.5, size * 0.3, size * 0.3);
              
              // Body
              scene.beginShape();
              scene.vertex(x, y - size * 0.3); // Neck
              scene.vertex(x - size * 0.4, y); // Left arm
              scene.vertex(x - size * 0.2, y); // Left torso
              scene.vertex(x - size * 0.15, y + size * 0.5); // Left leg
              scene.vertex(x + size * 0.15, y + size * 0.5); // Right leg
              scene.vertex(x + size * 0.2, y); // Right torso
              scene.vertex(x + size * 0.4, y); // Right arm
              scene.vertex(x, y - size * 0.3); // Back to neck
              scene.endShape(scene.CLOSE);
            },
            contains: function(px, py) {
              // Check if point is inside the symbol's hit area
              const d = scene.dist(px, py, this.x, this.y);
              return d < this.size * 0.6;
            },
            activate: function() {
              this.active = true;
              
              // Pulse animation could be added here
              
              // Play sound effect if available
              if (window.gameEngine && window.gameEngine.sfx && window.gameEngine.sfx.symbolActivate) {
                window.gameEngine.sfx.symbolActivate.play();
              }
            },
            deactivate: function() {
              this.active = false;
            }
          };
          
          this.symbols.push(symbol);
          index++;
        }
      }
    }
  }
  
  // Shuffle array (Fisher-Yates algorithm)
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Render scene
  render() {
    // Call parent render first
    super.render();
    
    // Draw title
    this.fill(0, 234, 255);
    this.textSize(32);
    this.textAlign(this.CENTER, this.TOP);
    this.text("THE CRYPTIC WALL", this.width / 2, this.height * 0.1);
    
    // Draw instructions
    if (!this.completed) {
      this.fill(200, 200, 200);
      this.textSize(16);
      this.text("Select the symbols in the correct evolutionary sequence", this.width / 2, this.height * 0.16);
    }
    
    // Draw wall background
    this.drawWall();
    
    // Draw symbols
    for (const symbol of this.symbols) {
      symbol.render();
    }
    
    // Draw selection indicator
    this.drawSelectionIndicator();
    
    // Draw hint button
    this.drawHintButton();
    
    // Draw success message if completed
    if (this.completed) {
      this.drawSuccessMessage();
    }
    
    // Reset text alignment
    this.textAlign(this.CENTER, this.CENTER);
  }
  
  // Draw ancient wall background
  drawWall() {
    this.push();
    
    // Wall background
    this.noStroke();
    this.fill(20, 30, 40, 200);
    this.rectMode(this.CENTER);
    
    const wallWidth = this.width * 0.7;
    const wallHeight = this.height * 0.7;
    this.rect(this.width / 2, this.height / 2, wallWidth, wallHeight, 10);
    
    // Wall texture/pattern
    this.stroke(30, 40, 50, 100);
    this.strokeWeight(1);
    
    // Horizontal lines
    for (let y = this.height / 2 - wallHeight / 2; y <= this.height / 2 + wallHeight / 2; y += 20) {
      this.line(
        this.width / 2 - wallWidth / 2 + 10,
        y,
        this.width / 2 + wallWidth / 2 - 10,
        y
      );
    }
    
    // Vertical lines
    for (let x = this.width / 2 - wallWidth / 2; x <= this.width / 2 + wallWidth / 2; x += 20) {
      this.line(
        x,
        this.height / 2 - wallHeight / 2 + 10,
        x,
        this.height / 2 + wallHeight / 2 - 10
      );
    }
    
    this.pop();
  }
  
  // Draw UI showing currently selected symbols
  drawSelectionIndicator() {
    if (this.selectedSymbols.length === 0) return;
    
    const indicatorWidth = this.width * 0.6;
    const indicatorHeight = 60;
    const indicatorX = this.width / 2;
    const indicatorY = this.height * 0.8;
    
    // Draw background
    this.push();
    this.fill(0, 10, 20, 200);
    this.stroke(0, 234, 255, 100);
    this.strokeWeight(2);
    this.rectMode(this.CENTER);
    this.rect(indicatorX, indicatorY, indicatorWidth, indicatorHeight, 10);
    
    // Draw title
    this.noStroke();
    this.fill(0, 234, 255);
    this.textSize(14);
    this.textAlign(this.CENTER, this.TOP);
    this.text("SELECTED SEQUENCE", indicatorX, indicatorY - indicatorHeight / 2 + 5);
    
    // Draw symbol slots
    const slotSize = 40;
    const totalSlotsWidth = this.correctSequence.length * slotSize * 1.2;
    const startX = indicatorX - totalSlotsWidth / 2 + slotSize / 2;
    
    for (let i = 0; i < this.correctSequence.length; i++) {
      const slotX = startX + i * slotSize * 1.2;
      const slotY = indicatorY + 10;
      
      // Draw slot background
      this.noFill();
      this.stroke(100, 100, 100, 150);
      this.strokeWeight(1);
      this.ellipse(slotX, slotY, slotSize, slotSize);
      
      // Draw selected symbol if exists
      if (i < this.selectedSymbols.length) {
        const symbolType = this.selectedSymbols[i];
        const symbol = this.symbols.find(s => s.type === symbolType);
        
        if (symbol) {
          // Draw symbol in slot
          this.push();
          this.translate(slotX, slotY);
          this.scale(0.5);
          
          const slotColor = this.color(0, 255, 150);
          this.fill(slotColor);
          this.noStroke();
          
          // Create a temporary symbol with just enough for drawing
          const tempSymbol = {
            type: symbol.type,
            getSymbolColor: function() { return slotColor; },
            drawDNA: symbol.drawDNA,
            drawEgg: symbol.drawEgg,
            drawClaw: symbol.drawClaw,
            drawEye: symbol.drawEye,
            drawStar: symbol.drawStar,
            drawWolf: symbol.drawWolf,
            drawMammoth: symbol.drawMammoth,
            drawHuman: symbol.drawHuman
          };
          
          // Draw symbol
          switch(symbolType) {
            case 'dna':
              tempSymbol.drawDNA(0, 0, slotSize * 0.8);
              break;
            case 'egg':
              tempSymbol.drawEgg(0, 0, slotSize * 0.8);
              break;
            case 'claw':
              tempSymbol.drawClaw(0, 0, slotSize * 0.8);
              break;
            case 'eye':
              tempSymbol.drawEye(0, 0, slotSize * 0.8);
              break;
            case 'star':
              tempSymbol.drawStar(0, 0, slotSize * 0.8, 5);
              break;
            case 'wolf':
              tempSymbol.drawWolf(0, 0, slotSize * 0.8);
              break;
            case 'mammoth':
              tempSymbol.drawMammoth(0, 0, slotSize * 0.8);
              break;
            case 'human':
              tempSymbol.drawHuman(0, 0, slotSize * 0.8);
              break;
          }
          
          this.pop();
        }
      }
    }
    
    // Draw reset button
    const resetX = indicatorX + indicatorWidth / 2 - 50;
    const resetY = indicatorY;
    
    this.fill(150, 50, 50, 200);
    this.noStroke();
    this.rectMode(this.CENTER);
    this.rect(resetX, resetY, 60, 30, 5);
    
    this.fill(255);
    this.textSize(12);
    this.textAlign(this.CENTER, this.CENTER);
    this.text("RESET", resetX, resetY);
    
    // Store reset button bounds for click detection
    this.resetButton = {
      x: resetX - 30,
      y: resetY - 15,
      width: 60,
      height: 30
    };
    
    this.pop();
  }
  
  // Draw hint button
  drawHintButton() {
    this.push();
    
    const hintX = this.width * 0.1;
    const hintY = this.height * 0.1;
    
    // Draw button
    this.fill(0, 50, 100, 200);
    this.stroke(0, 200, 255, 150);
    this.strokeWeight(1);
    this.rectMode(this.CENTER);
    this.rect(hintX, hintY, 80, 30, 5);
    
    // Draw text
    this.fill(255);
    this.noStroke();
    this.textSize(14);
    this.textAlign(this.CENTER, this.CENTER);
    this.text("HINT", hintX, hintY);
    
    // Store button bounds for click detection
    this.hintButton = {
      x: hintX - 40,
      y: hintY - 15,
      width: 80,
      height: 30
    };
    
    // Draw hint text if shown
    if (this.hintShown) {
      this.fill(0, 10, 20, 200);
      this.stroke(0, 200, 255, 150);
      this.strokeWeight(1);
      this.rectMode(this.CENTER);
      this.rect(this.width / 2, this.height * 0.25, this.width * 0.6, 60, 10);
      
      this.fill(0, 200, 255);
      this.noStroke();
      this.textSize(14);
      this.textAlign(this.CENTER, this.CENTER);
      this.text("The symbols follow evolutionary order:\nDNA came first, then egg, then physical features.", this.width / 2, this.height * 0.25);
    }
    
    this.pop();
  }
  
  // Draw success message when puzzle is solved
  drawSuccessMessage() {
    this.push();
    
    // Background overlay
    this.fill(0, 0, 0, 150);
    this.rectMode(this.CORNER);
    this.rect(0, 0, this.width, this.height);
    
    // Success panel
    this.fill(0, 30, 60, 230);
    this.stroke(0, 234, 255);
    this.strokeWeight(3);
    this.rectMode(this.CENTER);
    this.rect(this.width / 2, this.height / 2, this.width * 0.6, this.height * 0.4, 20);
    
    // Success text
    this.fill(0, 234, 255);
    this.noStroke();
    this.textSize(32);
    this.textAlign(this.CENTER, this.CENTER);
    this.text("SEQUENCE DECODED", this.width / 2, this.height / 2 - 70);
    
    // Clue text
    this.fill(255);
    this.textSize(20);
    this.text("Fragment Unlocked: THEY CAME BEFORE THE WOLVES", this.width / 2, this.height / 2);
    
    // Continue button
    this.fill(0, 100, 150);
    this.stroke(0, 234, 255);
    this.strokeWeight(2);
    this.rectMode(this.CENTER);
    this.rect(this.width / 2, this.height / 2 + 70, 150, 40, 10);
    
    this.fill(255);
    this.noStroke();
    this.textSize(16);
    this.text("CONTINUE", this.width / 2, this.height / 2 + 70);
    
    // Store continue button bounds for click detection
    this.continueButton = {
      x: this.width / 2 - 75,
      y: this.height / 2 + 70 - 20,
      width: 150,
      height: 40
    };
    
    this.pop();
  }
  
  // Mouse pressed handler
  mousePressed() {
    // Call parent handler first
    if (super.mousePressed()) {
      return true;
    }
    
    // Skip interaction if completed
    if (this.completed) {
      // Check if continue button is clicked
      if (this.continueButton && 
          this.mouseX >= this.continueButton.x && 
          this.mouseX <= this.continueButton.x + this.continueButton.width &&
          this.mouseY >= this.continueButton.y && 
          this.mouseY <= this.continueButton.y + this.continueButton.height) {
        this.proceedToNextChapter();
        return true;
      }
      
      return false;
    }
    
    // Check for hint button click
    if (this.hintButton && 
        this.mouseX >= this.hintButton.x && 
        this.mouseX <= this.hintButton.x + this.hintButton.width &&
        this.mouseY >= this.hintButton.y && 
        this.mouseY <= this.hintButton.y + this.hintButton.height) {
      this.toggleHint();
      return true;
    }
    
    // Check for reset button click
    if (this.resetButton && 
        this.mouseX >= this.resetButton.x && 
        this.mouseX <= this.resetButton.x + this.resetButton.width &&
        this.mouseY >= this.resetButton.y && 
        this.mouseY <= this.resetButton.y + this.resetButton.height) {
      this.resetSelection();
      return true;
    }
    
    // Check symbol clicks
    for (const symbol of this.symbols) {
      if (symbol.contains(this.mouseX, this.mouseY)) {
        this.selectSymbol(symbol);
        return true;
      }
    }
    
    return false;
  }
  
  // Mouse moved handler
  mouseMoved() {
    // Call parent handler
    super.mouseMoved();
    
    // Update symbol hover states
    for (const symbol of this.symbols) {
      symbol.hovered = symbol.contains(this.mouseX, this.mouseY);
    }
  }
  
  // Select a symbol
  selectSymbol(symbol) {
    // Skip if symbol is already selected
    if (symbol.selected) return;
    
    // Add to selection if not full
    if (this.selectedSymbols.length < this.correctSequence.length) {
      // Set as selected
      symbol.selected = true;
      
      // Add to selection array
      this.selectedSymbols.push(symbol.type);
      
      // Play sound effect if available
      if (window.gameEngine && window.gameEngine.sfx && window.gameEngine.sfx.symbolSelect) {
        window.gameEngine.sfx.symbolSelect.play();
      }
      
      // Activate symbol
      symbol.activate();
      
      // Check if sequence is complete
      if (this.selectedSymbols.length === this.correctSequence.length) {
        this.checkSequence();
      }
    }
  }
  
  // Reset symbol selection
  resetSelection() {
    // Clear selected symbols
    this.selectedSymbols = [];
    
    // Reset symbol states
    for (const symbol of this.symbols) {
      symbol.selected = false;
      symbol.deactivate();
    }
    
    // Play sound effect if available
    if (window.gameEngine && window.gameEngine.sfx && window.gameEngine.sfx.reset) {
      window.gameEngine.sfx.reset.play();
    }
  }
  
  // Toggle hint display
  toggleHint() {
    this.hintShown = !this.hintShown;
    
    // Play sound effect if available
    if (window.gameEngine && window.gameEngine.sfx) {
      if (this.hintShown && window.gameEngine.sfx.hintShow) {
        window.gameEngine.sfx.hintShow.play();
      } else if (!this.hintShown && window.gameEngine.sfx.hintHide) {
        window.gameEngine.sfx.hintHide.play();
      }
    }
    
    // If Cliza is available, have her provide a hint
    if (window.gameEngine && window.gameEngine.cliza && this.hintShown) {
      window.gameEngine.cliza.provideHint('chapter1');
    }
  }
  
  // Check if selected sequence is correct
  checkSequence() {
    // Compare selected sequence with correct sequence
    let correct = true;
    for (let i = 0; i < this.correctSequence.length; i++) {
      if (this.selectedSymbols[i] !== this.correctSequence[i]) {
        correct = false;
        break;
      }
    }
    
    // Handle result
    if (correct) {
      this.puzzleSolved();
    } else {
      this.puzzleFailed();
    }
  }
  
  // Handle successful puzzle completion
  puzzleSolved() {
    console.log('Puzzle solved!');
    this.completed = true;
    
    // Update game state
    if (this.gameState) {
      this.gameState.puzzlesSolved[0] = true;
      this.gameState.currentChapter = 2;
      
      // Add clue to collection
      if (!this.gameState.cluesCollected.includes('they_came_before_wolves')) {
        this.gameState.cluesCollected.push('they_came_before_wolves');
      }
      
      // Save progress
      if (window.gameEngine && window.gameEngine.saveProgress) {
        window.gameEngine.saveProgress();
      }
    }
    
    // Play success dialogue if dialogue system is available
    if (window.dialogueSystem) {
      window.dialogueSystem.playSequence('chapter1:success');
    }
    
    // Play success sound if available
    if (window.gameEngine && window.gameEngine.sfx && window.gameEngine.sfx.puzzleSolved) {
      window.gameEngine.sfx.puzzleSolved.play();
    }
    
    // Success animation
    for (const symbol of this.symbols) {
      if (this.correctSequence.includes(symbol.type)) {
        // Highlight correct symbols
        symbol.active = true;
      }
    }
    
    // If Aikira is available, have her react
    if (window.gameEngine && window.gameEngine.aikira) {
      window.gameEngine.aikira.setThought({
        text: "Excellent. The first fragment of the Genesis Protocol has been recovered.",
        theme: 'protocol',
        duration: 180
      });
    }
    
    // Emit event
    if (window.gameEvents) {
      window.gameEvents.emit('chapterCompleted', 1);
    }
  }
  
  // Handle failed attempt
  puzzleFailed() {
    console.log('Incorrect sequence!');
    
    // Play failure dialogue if dialogue system is available
    if (window.dialogueSystem) {
      window.dialogueSystem.playSequence('chapter1:failure');
    }
    
    // Play failure sound if available
    if (window.gameEngine && window.gameEngine.sfx && window.gameEngine.sfx.puzzleFailed) {
      window.gameEngine.sfx.puzzleFailed.play();
    }
    
    // If BYTE is available, have him bark
    if (window.gameEngine && window.gameEngine.byte) {
      window.gameEngine.byte.increaseSuspicion(15);
      window.gameEngine.byte.bark();
    }
    
    // Reset selection after a delay
    setTimeout(() => {
      this.resetSelection();
    }, 1500);
  }
  
  // Proceed to next chapter
  proceedToNextChapter() {
    console.log('Proceeding to next chapter');
    
    // Transition to next chapter if engine is available
    if (window.gameEngine) {
      window.gameEngine.setScene('chapter2');
    }
  }
  
  // Handle resize
  resize() {
    super.resize();
    
    // Reinitialize symbols with new positions
    this.initSymbols();
  }
  
  // Exit scene
  exit() {
    super.exit();
    
    // Hide characters if available
    if (window.gameEngine) {
      if (window.gameEngine.aikira) window.gameEngine.aikira.hide();
      if (window.gameEngine.cliza) window.gameEngine.cliza.hide();
      if (window.gameEngine.byte) window.gameEngine.byte.hide();
    }
  }
}

// Export for use in other modules
export default CrypticWallScene;