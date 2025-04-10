/**
 * AIKIRA: GENESIS PROTOCOL
 * Navigation Puzzle for Chapter 4 - Encrypted Forest
 * 
 * This module implements the top-down navigation puzzle where the player
 * must navigate through a digital jungle, avoiding AI birds and collecting
 * DNA fragments.
 */

class NavigationPuzzle {
    constructor() {
      // Puzzle configuration
      this.grid = [];
      this.gridSize = 16; // 16x16 grid
      this.cellSize = 0; // Will be calculated based on screen size
      this.player = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        moving: false,
        speed: 0.1, // Movement speed (0-1)
        rotation: 0,
        fragments: 0,
        collectedFragments: []
      };
      this.fragments = []; // DNA fragment positions
      this.obstacles = []; // Obstacle positions (trees, rocks)
      this.birds = [];     // AI birds that patrol and must be avoided
      this.exit = {        // Exit portal position
        x: 0,
        y: 0,
        active: false
      };
      
      // Gameplay state
      this.started = false;
      this.solved = false;
      this.failed = false;
      this.pauseMovement = false;
      this.totalFragments = 3;
      this.attempts = 0;
      
      // Visual properties
      this.cameraOffset = {
        x: 0,
        y: 0
      };
      this.gridEffects = [];
      this.collectionEffects = [];
      
      // Event callbacks
      this.onSuccess = null;
      this.onFailure = null;
      this.onFragmentCollected = null;
      
      // Sound effects
      this.sounds = {
        move: null,
        collect: null,
        bird: null,
        success: null,
        failure: null
      };
    }
    
    /**
     * Initialize the puzzle with grid dimensions
     * @param {number} canvasWidth Canvas width
     * @param {number} canvasHeight Canvas height
     */
    initialize(canvasWidth, canvasHeight) {
      // Calculate cell size based on screen dimensions and grid size
      this.cellSize = min(
        floor(canvasWidth * 0.8 / this.gridSize), 
        floor(canvasHeight * 0.8 / this.gridSize)
      );
      
      // Reset game state
      this.started = false;
      this.solved = false;
      this.failed = false;
      this.pauseMovement = false;
      this.player.fragments = 0;
      this.player.collectedFragments = [];
      
      // Generate the forest grid
      this.generateGrid();
      
      // Place player, fragments, obstacles, and exit
      this.placeElements();
      
      // Generate AI birds
      this.generateBirds();
      
      // Initialize grid effects
      this.initializeEffects();
      
      console.log('Navigation puzzle initialized with grid size', this.gridSize);
    }
    
    /**
     * Generate the forest grid
     */
    generateGrid() {
      this.grid = [];
      
      // Create a 2D grid
      for (let y = 0; y < this.gridSize; y++) {
        const row = [];
        for (let x = 0; x < this.gridSize; x++) {
          row.push({
            type: 'empty',
            variation: floor(random(3)), // Visual variation
            effect: random() < 0.3 ? 'glow' : null, // 30% chance of glow effect
            effectPhase: random(TWO_PI)
          });
        }
        this.grid.push(row);
      }
      
      // Add forest patterns using noise
      const noiseScale = 0.1;
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const noiseValue = noise(x * noiseScale, y * noiseScale);
          
          // Dense forest areas
          if (noiseValue > 0.65) {
            this.grid[y][x].type = 'forest';
            this.grid[y][x].density = map(noiseValue, 0.65, 1, 0, 1);
          }
          
          // Water/data streams
          if (noiseValue < 0.3) {
            this.grid[y][x].type = 'stream';
            this.grid[y][x].flowRate = map(noiseValue, 0, 0.3, 1, 0.2);
          }
        }
      }
      
      // Ensure edge cells are navigable
      for (let y = 0; y < this.gridSize; y++) {
        this.grid[y][0].type = 'empty';
        this.grid[y][this.gridSize - 1].type = 'empty';
      }
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[0][x].type = 'empty';
        this.grid[this.gridSize - 1][x].type = 'empty';
      }
      
      // Add digital circuit patterns
      this.addCircuitPatterns();
      
      console.log('Forest grid generated');
    }
    
    /**
     * Add circuit-like patterns to the grid
     */
    addCircuitPatterns() {
      // Create 2-4 circuit paths
      const numPaths = floor(random(2, 5));
      
      for (let i = 0; i < numPaths; i++) {
        // Start point
        let x = floor(random(this.gridSize));
        let y = floor(random(this.gridSize));
        
        // Direction (0 = right, 1 = down, 2 = left, 3 = up)
        let direction = floor(random(4));
        
        // Circuit length
        const length = floor(random(5, 15));
        
        // Create path
        for (let j = 0; j < length; j++) {
          // Mark cell as circuit if in bounds
          if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x].type = 'circuit';
            this.grid[y][x].circuitType = floor(random(3)); // Visual variation
          }
          
          // Move in current direction
          switch (direction) {
            case 0: x++; break; // Right
            case 1: y++; break; // Down
            case 2: x--; break; // Left
            case 3: y--; break; // Up
          }
          
          // Randomly change direction
          if (random() < 0.3) {
            direction = (direction + floor(random(1, 4))) % 4;
          }
          
          // Add branches occasionally
          if (random() < 0.2) {
            this.addCircuitBranch(x, y, (direction + 1) % 4, floor(random(3, 7)));
          }
        }
      }
    }
    
    /**
     * Add a branch to a circuit path
     * @param {number} startX Starting X position
     * @param {number} startY Starting Y position
     * @param {number} direction Direction (0-3)
     * @param {number} length Branch length
     */
    addCircuitBranch(startX, startY, direction, length) {
      let x = startX;
      let y = startY;
      
      for (let i = 0; i < length; i++) {
        // Move in current direction
        switch (direction) {
          case 0: x++; break; // Right
          case 1: y++; break; // Down
          case 2: x--; break; // Left
          case 3: y--; break; // Up
        }
        
        // Mark cell as circuit if in bounds
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
          this.grid[y][x].type = 'circuit';
          this.grid[y][x].circuitType = floor(random(3)); // Visual variation
        }
        
        // Randomly change direction
        if (random() < 0.3) {
          direction = (direction + floor(random(1, 4))) % 4;
        }
      }
    }
    
    /**
     * Place player, fragments, obstacles, and exit on the grid
     */
    placeElements() {
      // Clear existing elements
      this.fragments = [];
      this.obstacles = [];
      
      // Place player near the top edge
      this.player.x = floor(this.gridSize / 2);
      this.player.y = 1;
      this.player.targetX = this.player.x;
      this.player.targetY = this.player.y;
      this.player.rotation = PI/2; // Facing down
      
      // Place exit near the bottom edge
      this.exit.x = floor(this.gridSize / 2);
      this.exit.y = this.gridSize - 2;
      this.exit.active = false;
      
      // Mark player and exit cells as empty
      this.grid[this.player.y][this.player.x].type = 'empty';
      this.grid[this.exit.y][this.exit.x].type = 'empty';
      
      // Add special effect to exit cell
      this.grid[this.exit.y][this.exit.x].effect = 'portal';
      this.grid[this.exit.y][this.exit.x].effectPhase = 0;
      
      // Place DNA fragments
      for (let i = 0; i < this.totalFragments; i++) {
        let x, y;
        let valid = false;
        
        // Keep trying until we find a valid position
        while (!valid) {
          // Divide the grid into sections for even distribution
          const section = i / this.totalFragments;
          const sectionSize = this.gridSize / this.totalFragments;
          
          // Place in middle section of grid
          y = floor(map(section, 0, 1, 3, this.gridSize - 3) + random(-sectionSize/2, sectionSize/2));
          
          // Random x position in middle area
          x = floor(random(3, this.gridSize - 3));
          
          // Check if position is valid (empty cell, not too close to player or other fragments)
          valid = this.grid[y][x].type === 'empty' && 
                  this.distanceTo(x, y, this.player.x, this.player.y) > 5 &&
                  this.fragments.every(f => this.distanceTo(x, y, f.x, f.y) > 3);
        }
        
        // Add fragment
        this.fragments.push({
          x: x,
          y: y,
          index: i,
          collected: false,
          pulsePhase: random(TWO_PI)
        });
        
        // Mark cell as special
        this.grid[y][x].effect = 'fragment';
        this.grid[y][x].effectPhase = random(TWO_PI);
      }
      
      // Add obstacles (rocks and data nodes)
      const numObstacles = floor(random(10, 20));
      
      for (let i = 0; i < numObstacles; i++) {
        let x, y;
        let valid = false;
        
        // Keep trying until we find a valid position
        while (!valid) {
          x = floor(random(1, this.gridSize - 1));
          y = floor(random(1, this.gridSize - 1));
          
          // Check if position is valid (empty cell, not blocking path)
          valid = this.grid[y][x].type === 'empty' && 
                  this.distanceTo(x, y, this.player.x, this.player.y) > 3 &&
                  this.distanceTo(x, y, this.exit.x, this.exit.y) > 3 &&
                  this.fragments.every(f => this.distanceTo(x, y, f.x, f.y) > 2);
        }
        
        // Add obstacle
        this.obstacles.push({
          x: x,
          y: y,
          type: random() < 0.7 ? 'rock' : 'dataNode', // 70% rocks, 30% data nodes
          rotation: random(TWO_PI),
          scale: random(0.8, 1.2)
        });
        
        // Mark cell as obstacle
        this.grid[y][x].type = 'obstacle';
      }
      
      console.log('Elements placed on grid');
    }
    
    /**
     * Generate AI birds that patrol the forest
     */
    generateBirds() {
      this.birds = [];
      
      // Create 3-5 birds
      const numBirds = floor(random(3, 6));
      
      for (let i = 0; i < numBirds; i++) {
        // Create bird with random patrol pattern
        const patrolType = random(['linear', 'circular', 'zigzag']);
        
        // Position away from player
        let x, y;
        let valid = false;
        
        while (!valid) {
          x = floor(random(1, this.gridSize - 1));
          y = floor(random(1, this.gridSize - 1));
          
          valid = this.distanceTo(x, y, this.player.x, this.player.y) > 6;
        }
        
        // Create bird object
        const bird = {
          x: x,
          y: y,
          displayX: x, // Smooth position for rendering
          displayY: y,
          speed: random(0.02, 0.05),
          rotation: random(TWO_PI),
          patrolType: patrolType,
          patrolProgress: random(TWO_PI),
          patrolRadius: floor(random(2, 5)),
          patrolCenter: { x: x, y: y },
          detectRadius: 3,
          state: 'patrol', // patrol, chase, return
          wingPhase: random(TWO_PI)
        };
        
        // Add to birds array
        this.birds.push(bird);
      }
      
      console.log('Generated', numBirds, 'AI birds');
    }
    
    /**
     * Initialize visual effects for the grid
     */
    initializeEffects() {
      this.gridEffects = [];
      
      // Add ambient data particles
      for (let i = 0; i < 50; i++) {
        this.gridEffects.push({
          type: 'particle',
          x: random(this.gridSize * this.cellSize),
          y: random(this.gridSize * this.cellSize),
          size: random(1, 3),
          speed: random(0.5, 2),
          angle: random(TWO_PI),
          color: color(0, random(150, 255), random(150, 255), random(100, 200))
        });
      }
      
      // Add circuit pulse effects along circuit paths
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (this.grid[y][x].type === 'circuit' && random() < 0.2) {
            this.gridEffects.push({
              type: 'pulse',
              x: x,
              y: y,
              progress: 0,
              speed: random(0.005, 0.02),
              size: random(0.5, 1),
              direction: floor(random(4)),
              color: color(0, random(150, 255), random(150, 255))
            });
          }
        }
      }
      
      // Clear collection effects
      this.collectionEffects = [];
    }
    
    /**
     * Start the puzzle
     */
    start() {
      this.started = true;
      this.failed = false;
      
      console.log('Navigation puzzle started');
    }
    
    /**
     * Update the puzzle state
     */
    update() {
      if (!this.started || this.solved || this.failed) return;
      
      // Update player movement
      this.updatePlayerMovement();
      
      // Update birds
      this.updateBirds();
      
      // Check for fragment collection
      this.checkFragmentCollection();
      
      // Check for exit reached
      this.checkExitReached();
      
      // Update visual effects
      this.updateEffects();
    }
    
    /**
     * Update player movement
     */
    updatePlayerMovement() {
      if (this.pauseMovement) return;
      
      // Check if player is moving
      if (this.player.moving) {
        // Calculate movement progress
        const dx = this.player.targetX - this.player.x;
        const dy = this.player.targetY - this.player.y;
        
        // Move toward target
        if (abs(dx) > 0.05 || abs(dy) > 0.05) {
          this.player.x += dx * this.player.speed;
          this.player.y += dy * this.player.speed;
          
          // Update rotation based on movement direction
          const targetRotation = atan2(dy, dx);
          
          // Smooth rotation change
          const rotDiff = targetRotation - this.player.rotation;
          
          // Handle crossing from -PI to PI
          if (rotDiff > PI) {
            this.player.rotation += (rotDiff - TWO_PI) * 0.1;
          } else if (rotDiff < -PI) {
            this.player.rotation += (rotDiff + TWO_PI) * 0.1;
          } else {
            this.player.rotation += rotDiff * 0.1;
          }
        } else {
          // Arrived at target
          this.player.x = this.player.targetX;
          this.player.y = this.player.targetY;
          this.player.moving = false;
        }
      }
      
      // Update camera offset
      this.updateCamera();
    }
    
    /**
     * Update camera position to follow player
     */
    updateCamera() {
      // Calculate target camera position (centered on player)
      const targetX = width/2 - this.player.x * this.cellSize;
      const targetY = height/2 - this.player.y * this.cellSize;
      
      // Smoothly move camera toward target
      this.cameraOffset.x += (targetX - this.cameraOffset.x) * 0.1;
      this.cameraOffset.y += (targetY - this.cameraOffset.y) * 0.1;
    }
    
    /**
     * Update AI birds
     */
    updateBirds() {
      for (const bird of this.birds) {
        // Calculate distance to player
        const distance = this.distanceTo(bird.x, bird.y, this.player.x, this.player.y);
        
        // Update state based on distance to player
        if (bird.state === 'patrol' && distance < bird.detectRadius) {
          // Player detected, start chasing
          bird.state = 'chase';
        } else if (bird.state === 'chase' && distance > bird.detectRadius * 2) {
          // Player escaped, return to patrol
          bird.state = 'return';
        } else if (bird.state === 'return') {
          // Check if bird is back to patrol center
          const distToCenter = this.distanceTo(bird.x, bird.y, bird.patrolCenter.x, bird.patrolCenter.y);
          if (distToCenter < 0.5) {
            bird.state = 'patrol';
          }
        }
        
        // Move bird based on current state
        switch (bird.state) {
          case 'patrol':
            this.updateBirdPatrol(bird);
            break;
          case 'chase':
            this.updateBirdChase(bird);
            break;
          case 'return':
            this.updateBirdReturn(bird);
            break;
        }
        
        // Smoothly update display position
        bird.displayX += (bird.x - bird.displayX) * 0.2;
        bird.displayY += (bird.y - bird.displayY) * 0.2;
        
        // Update wing animation
        bird.wingPhase += 0.1;
        
        // Check for collision with player
        if (this.distanceTo(bird.x, bird.y, this.player.x, this.player.y) < 0.5) {
          this.handleBirdCollision();
        }
      }
    }
    
    /**
     * Update bird movement in patrol state
     * @param {Object} bird Bird object to update
     */
    updateBirdPatrol(bird) {
      bird.patrolProgress += bird.speed;
      
      // Different patrol patterns
      switch (bird.patrolType) {
        case 'linear':
          // Back-and-forth motion
          const offset = sin(bird.patrolProgress) * bird.patrolRadius;
          bird.x = bird.patrolCenter.x + cos(bird.rotation) * offset;
          bird.y = bird.patrolCenter.y + sin(bird.rotation) * offset;
          break;
          
        case 'circular':
          // Circular motion
          bird.x = bird.patrolCenter.x + cos(bird.patrolProgress) * bird.patrolRadius;
          bird.y = bird.patrolCenter.y + sin(bird.patrolProgress) * bird.patrolRadius;
          // Update rotation to face direction of movement
          bird.rotation = bird.patrolProgress + PI/2;
          break;
          
        case 'zigzag':
          // Zigzag motion
          const xOffset = ((bird.patrolProgress * 2) % TWO_PI > PI ? 1 : -1) * bird.patrolRadius;
          const yOffset = (bird.patrolProgress % TWO_PI) / PI * bird.patrolRadius;
          bird.x = bird.patrolCenter.x + xOffset;
          bird.y = bird.patrolCenter.y + yOffset - bird.patrolRadius/2;
          break;
      }
    }
    
    /**
     * Update bird movement in chase state
     * @param {Object} bird Bird object to update
     */
    updateBirdChase(bird) {
      // Move toward player
      const dx = this.player.x - bird.x;
      const dy = this.player.y - bird.y;
      const dist = sqrt(dx*dx + dy*dy);
      
      if (dist > 0.1) {
        bird.x += dx / dist * bird.speed * 2; // Faster when chasing
        bird.y += dy / dist * bird.speed * 2;
        
        // Update rotation to face player
        bird.rotation = atan2(dy, dx);
      }
      
      // Play bird sound occasionally
      if (this.sounds.bird && random() < 0.02) {
        this.sounds.bird.play();
      }
    }
    
    /**
     * Update bird movement in return state
     * @param {Object} bird Bird object to update
     */
    updateBirdReturn(bird) {
      // Move toward patrol center
      const dx = bird.patrolCenter.x - bird.x;
      const dy = bird.patrolCenter.y - bird.y;
      const dist = sqrt(dx*dx + dy*dy);
      
      if (dist > 0.1) {
        bird.x += dx / dist * bird.speed * 1.5; // Slightly faster than patrol
        bird.y += dy / dist * bird.speed * 1.5;
        
        // Update rotation to face direction
        bird.rotation = atan2(dy, dx);
      }
    }
    
    /**
     * Handle collision with a bird
     */
    handleBirdCollision() {
      // Only process if puzzle is active
      if (!this.started || this.solved || this.failed || this.pauseMovement) return;
      
      // Mark as failed
      this.failed = true;
      this.pauseMovement = true;
      
      // Play failure sound
      if (this.sounds.failure) {
        this.sounds.failure.play();
      }
      
      // Create failure effect
      for (let i = 0; i < 20; i++) {
        this.collectionEffects.push({
          type: 'particle',
          x: this.player.x,
          y: this.player.y,
          vx: random(-2, 2),
          vy: random(-2, 2),
          life: 60,
          size: random(3, 8),
          color: color(255, 50, 50, 200)
        });
      }
      
      // Increment attempts
      this.attempts++;
      
      // Trigger failure callback
      if (this.onFailure) {
        setTimeout(() => {
          this.onFailure(this.attempts);
        }, 1500);
      }
      
      console.log('Bird collision - puzzle failed');
    }
    
    /**
     * Check for fragment collection
     */
    checkFragmentCollection() {
      // Skip if not moving
      if (!this.player.moving) return;
      
      // Check each fragment
      for (const fragment of this.fragments) {
        // Skip if already collected
        if (fragment.collected) continue;
        
        // Check if player is on fragment
        if (this.distanceTo(this.player.x, this.player.y, fragment.x, fragment.y) < 0.5) {
          // Collect fragment
          fragment.collected = true;
          this.player.fragments++;
          this.player.collectedFragments.push(fragment.index);
          
          // Play collect sound
          if (this.sounds.collect) {
            this.sounds.collect.play();
          }
          
          // Create collection effect
          for (let i = 0; i < 15; i++) {
            this.collectionEffects.push({
              type: 'particle',
              x: fragment.x,
              y: fragment.y,
              vx: random(-1, 1),
              vy: random(-1, 1),
              life: 60,
              size: random(2, 6),
              color: color(0, 255, 150, 200)
            });
          }
          
          // Add DNA spiral effect
          this.collectionEffects.push({
            type: 'dnaSpiral',
            x: fragment.x,
            y: fragment.y,
            life: 120,
            size: 1,
            rotation: 0
          });
          
          // Check if all fragments collected
          if (this.player.fragments >= this.totalFragments) {
            // Activate exit
            this.exit.active = true;
            
            // Create exit activation effect
            for (let i = 0; i < 20; i++) {
              this.collectionEffects.push({
                type: 'particle',
                x: this.exit.x,
                y: this.exit.y,
                vx: random(-1, 1) * 0.5,
                vy: random(-1, 1) * 0.5,
                life: 120,
                size: random(3, 8),
                color: color(0, 200, 255, 200)
              });
            }
            
            // Update grid effect for exit
            this.grid[this.exit.y][this.exit.x].effect = 'activePortal';
          }
          
          // Trigger callback
          if (this.onFragmentCollected) {
            this.onFragmentCollected(this.player.fragments, this.totalFragments);
          }
          
          console.log('Fragment collected -', this.player.fragments, '/', this.totalFragments);
        }
      }
    }
    
    /**
     * Check if player has reached the exit
     */
    checkExitReached() {
      // Skip if exit not active or player not moving
      if (!this.exit.active || !this.player.moving) return;
      
      // Check if player is on exit
      if (this.distanceTo(this.player.x, this.player.y, this.exit.x, this.exit.y) < 0.5) {
        // Mark as solved
        this.solved = true;
        this.pauseMovement = true;
        
        // Play success sound
        if (this.sounds.success) {
          this.sounds.success.play();
        }
        
        // Create success effect
        for (let i = 0; i < 30; i++) {
          this.collectionEffects.push({
            type: 'particle',
            x: this.exit.x,
            y: this.exit.y,
            vx: cos(i / 30 * TWO_PI) * random(0.5, 1.5),
            vy: sin(i / 30 * TWO_PI) * random(0.5, 1.5),
            life: 120,
            size: random(3, 8),
            color: color(0, 255, 200, 200)
          });
        }
        
        // Add portal effect
        this.collectionEffects.push({
          type: 'portal',
          x: this.exit.x,
          y: this.exit.y,
          life: 180,
          size: 0,
          rotation: 0
        });
        
        // Trigger success callback
        if (this.onSuccess) {
          setTimeout(() => {
            this.onSuccess();
          }, 2000);
        }
        
        console.log('Exit reached - puzzle solved');
      }
    }
    
    /**
     * Update visual effects
     */
    updateEffects() {
      // Update grid particles
      for (let i = this.gridEffects.length - 1; i >= 0; i--) {
        const effect = this.gridEffects[i];
        
        switch (effect.type) {
          case 'particle':
            // Move particle
            effect.x += cos(effect.angle) * effect.speed;
            effect.y += sin(effect.angle) * effect.speed;
            
            // Slightly change angle for natural movement
            effect.angle += random(-0.1, 0.1);
            
            // Wrap around edges
            if (effect.x < 0) effect.x += this.gridSize * this.cellSize;
            if (effect.x > this.gridSize * this.cellSize) effect.x -= this.gridSize * this.cellSize;
            if (effect.y < 0) effect.y += this.gridSize * this.cellSize;
            if (effect.y > this.gridSize * this.cellSize) effect.y -= this.gridSize * this.cellSize;
            break;
            
          case 'pulse':
            // Move pulse along circuit
            effect.progress += effect.speed;
            
            // Remove if complete
            if (effect.progress >= 1) {
              // Create new pulse at a random circuit cell
              let newX, newY;
              let found = false;
              let attempts = 0;
              
              while (!found && attempts < 10) {
                attempts++;
                newX = floor(random(this.gridSize));
                newY = floor(random(this.gridSize));
                
                if (this.grid[newY][newX].type === 'circuit') {
                  found = true;
                }
              }
              
              if (found) {
                effect.x = newX;
                effect.y = newY;
                effect.progress = 0;
                effect.direction = floor(random(4));
              } else {
                this.gridEffects.splice(i, 1);
              }
            } else {
              this.gridEffects.splice(i, 1);
            }
          }
          break;
      }
    }
    
    // Update collection effects
    for (let i = this.collectionEffects.length - 1; i >= 0; i--) {
      const effect = this.collectionEffects[i];
      
      // Update based on effect type
      switch (effect.type) {
        case 'particle':
          // Move particle
          effect.x += effect.vx;
          effect.y += effect.vy;
          
          // Reduce life
          effect.life--;
          
          // Remove if expired
          if (effect.life <= 0) {
            this.collectionEffects.splice(i, 1);
          }
          break;
          
        case 'dnaSpiral':
          // Grow and rotate
          effect.size += 0.05;
          effect.rotation += 0.1;
          
          // Reduce life
          effect.life--;
          
          // Remove if expired
          if (effect.life <= 0) {
            this.collectionEffects.splice(i, 1);
          }
          break;
          
        case 'portal':
          // Expand and rotate
          effect.size += 0.03;
          effect.rotation += 0.05;
          
          // Reduce life
          effect.life--;
          
          // Remove if expired
          if (effect.life <= 0) {
            this.collectionEffects.splice(i, 1);
          }
          break;
      }
    }
  }
  
  /**
   * Render the puzzle
   */
  render() {
    push();
    
    // Apply camera offset
    translate(this.cameraOffset.x, this.cameraOffset.y);
    
    // Render grid
    this.renderGrid();
    
    // Render fragments
    this.renderFragments();
    
    // Render exit
    this.renderExit();
    
    // Render player
    this.renderPlayer();
    
    // Render birds
    this.renderBirds();
    
    // Render visual effects
    this.renderEffects();
    
    // Render UI overlay
    this.renderUI();
    
    pop();
  }
  
  /**
   * Render the forest grid
   */
  renderGrid() {
    // Determine visible range based on screen size
    const startX = floor((this.player.x * this.cellSize - width/2) / this.cellSize) - 2;
    const endX = ceil((this.player.x * this.cellSize + width/2) / this.cellSize) + 2;
    const startY = floor((this.player.y * this.cellSize - height/2) / this.cellSize) - 2;
    const endY = ceil((this.player.y * this.cellSize + height/2) / this.cellSize) + 2;
    
    // Clamp to grid bounds
    const visibleStartX = max(0, startX);
    const visibleEndX = min(this.gridSize - 1, endX);
    const visibleStartY = max(0, startY);
    const visibleEndY = min(this.gridSize - 1, endY);
    
    // Render visible cells
    for (let y = visibleStartY; y <= visibleEndY; y++) {
      for (let x = visibleStartX; x <= visibleEndX; x++) {
        const cell = this.grid[y][x];
        const cellX = x * this.cellSize;
        const cellY = y * this.cellSize;
        
        // Draw cell based on type
        switch (cell.type) {
          case 'empty':
            // Draw base cell
            fill(10, 15, 25);
            noStroke();
            rect(cellX, cellY, this.cellSize, this.cellSize);
            
            // Add subtle grid lines
            stroke(30, 40, 60, 100);
            strokeWeight(1);
            line(cellX, cellY, cellX + this.cellSize, cellY);
            line(cellX, cellY, cellX, cellY + this.cellSize);
            break;
            
          case 'forest':
            // Draw forest cell
            fill(20, 40, 30);
            noStroke();
            rect(cellX, cellY, this.cellSize, this.cellSize);
            
            // Add forest density visualization
            const treeCount = floor(cell.density * 5) + 1;
            
            for (let i = 0; i < treeCount; i++) {
              // Use noise for stable random positions
              const nx = noise(x * 10 + i, y * 10, 0) * this.cellSize;
              const ny = noise(x * 10, y * 10 + i, 0) * this.cellSize;
              
              // Draw tree
              fill(0, 100 + cell.density * 100, 50 + cell.density * 50);
              noStroke();
              ellipse(cellX + nx, cellY + ny, 8, 8);
              
              // Tree canopy
              fill(0, 150 + cell.density * 50, 100);
              ellipse(cellX + nx, cellY + ny - 4, 12, 12);
            }
            break;
            
          case 'stream':
            // Draw stream cell
            fill(0, 30, 50);
            noStroke();
            rect(cellX, cellY, this.cellSize, this.cellSize);
            
            // Add flowing data effect
            const flowOffset = (frameCount * cell.flowRate) % 20;
            
            for (let i = 0; i < 3; i++) {
              stroke(0, 100, 200, 150);
              strokeWeight(2);
              
              // Wavy line
              beginShape();
              for (let j = 0; j < this.cellSize; j += 5) {
                const waveX = cellX + j;
                const waveY = cellY + sin((j + flowOffset + i * 10) * 0.1) * 5 + this.cellSize/2 + i * 8 - 8;
                vertex(waveX, waveY);
              }
              endShape();
            }
            break;
            
          case 'circuit':
            // Draw circuit cell
            fill(0, 20, 30);
            noStroke();
            rect(cellX, cellY, this.cellSize, this.cellSize);
            
            // Draw circuit pattern based on variation
            stroke(0, 150, 200, 150);
            strokeWeight(2);
            
            switch (cell.circuitType) {
              case 0: // Horizontal line
                line(cellX, cellY + this.cellSize/2, cellX + this.cellSize, cellY + this.cellSize/2);
                break;
                
              case 1: // Vertical line
                line(cellX + this.cellSize/2, cellY, cellX + this.cellSize/2, cellY + this.cellSize);
                break;
                
              case 2: // Corner
                line(cellX + this.cellSize/2, cellY + this.cellSize/2, cellX + this.cellSize, cellY + this.cellSize/2);
                line(cellX + this.cellSize/2, cellY + this.cellSize/2, cellX + this.cellSize/2, cellY + this.cellSize);
                break;
            }
            
            // Add circuit node
            fill(0, 150, 200, 150);
            noStroke();
            ellipse(cellX + this.cellSize/2, cellY + this.cellSize/2, 6, 6);
            break;
            
          case 'obstacle':
            // Draw base cell
            fill(10, 15, 25);
            noStroke();
            rect(cellX, cellY, this.cellSize, this.cellSize);
            
            // Obstacle is drawn separately
            break;
        }
        
        // Add cell effects
        if (cell.effect) {
          this.renderCellEffect(cell, cellX, cellY);
        }
      }
    }
    
    // Render obstacles
    for (const obstacle of this.obstacles) {
      // Skip if not in visible range
      if (obstacle.x < visibleStartX || obstacle.x > visibleEndX || 
          obstacle.y < visibleStartY || obstacle.y > visibleEndY) {
        continue;
      }
      
      const obsX = obstacle.x * this.cellSize + this.cellSize/2;
      const obsY = obstacle.y * this.cellSize + this.cellSize/2;
      
      push();
      translate(obsX, obsY);
      rotate(obstacle.rotation);
      scale(obstacle.scale);
      
      if (obstacle.type === 'rock') {
        // Draw rock
        fill(40, 40, 60);
        noStroke();
        beginShape();
        for (let i = 0; i < 6; i++) {
          const angle = i / 6 * TWO_PI;
          const radius = 15 + noise(obstacle.x, obstacle.y, i) * 5;
          vertex(cos(angle) * radius, sin(angle) * radius);
        }
        endShape(CLOSE);
        
        // Add highlights
        fill(60, 60, 80);
        ellipse(-5, -5, 8, 8);
      } else {
        // Draw data node
        fill(0, 50, 80);
        strokeWeight(2);
        stroke(0, 100, 150);
        ellipse(0, 0, 20, 20);
        
        // Add inner structure
        fill(0, 100, 150);
        noStroke();
        ellipse(0, 0, 8, 8);
        
        // Add glow
        const glowSize = 25 + sin(frameCount * 0.1) * 5;
        noFill();
        stroke(0, 150, 200, 50);
        ellipse(0, 0, glowSize, glowSize);
      }
      
      pop();
    }
  }
  
  /**
   * Render special cell effects
   * @param {Object} cell Cell object
   * @param {number} x Cell X position
   * @param {number} y Cell Y position
   */
  renderCellEffect(cell, x, y) {
    const centerX = x + this.cellSize/2;
    const centerY = y + this.cellSize/2;
    
    switch (cell.effect) {
      case 'glow':
        // Subtle ambient glow
        const glowSize = 15 + sin(frameCount * 0.05 + cell.effectPhase) * 5;
        noFill();
        stroke(0, 150, 200, 30);
        ellipse(centerX, centerY, glowSize, glowSize);
        break;
        
      case 'fragment':
        // Fragment glow effect
        const fragGlowSize = 25 + sin(frameCount * 0.1 + cell.effectPhase) * 8;
        noFill();
        stroke(0, 255, 150, 50);
        ellipse(centerX, centerY, fragGlowSize, fragGlowSize);
        
        // Additional inner glow
        stroke(0, 255, 150, 30);
        ellipse(centerX, centerY, fragGlowSize * 1.5, fragGlowSize * 1.5);
        break;
        
      case 'portal':
        // Inactive exit portal
        const portalPulse = sin(frameCount * 0.03) * 0.2 + 0.8;
        
        // Outer ring
        noFill();
        stroke(100, 100, 150, 100 * portalPulse);
        strokeWeight(2);
        ellipse(centerX, centerY, this.cellSize * 0.8, this.cellSize * 0.8);
        
        // Inner pattern
        for (let i = 0; i < 3; i++) {
          const ringSize = (this.cellSize * 0.6) * (1 - i * 0.25);
          stroke(100, 100, 150, 100 * portalPulse * (1 - i * 0.25));
          ellipse(centerX, centerY, ringSize, ringSize);
        }
        break;
        
      case 'activePortal':
        // Active exit portal
        const activePulse = (sin(frameCount * 0.1) * 0.2 + 0.8) * 1.2;
        
        // Outer ring
        noFill();
        stroke(0, 200, 255, 150 * activePulse);
        strokeWeight(3);
        ellipse(centerX, centerY, this.cellSize * 0.8 * activePulse, this.cellSize * 0.8 * activePulse);
        
        // Inner rings
        for (let i = 0; i < 4; i++) {
          const angle = frameCount * 0.05 + i * PI/2;
          const ringX = centerX + cos(angle) * 5 * activePulse;
          const ringY = centerY + sin(angle) * 5 * activePulse;
          const ringSize = (this.cellSize * 0.6) * (1 - i * 0.2) * activePulse;
          
          stroke(0, 200, 255, 150 * activePulse * (1 - i * 0.25));
          ellipse(ringX, ringY, ringSize, ringSize);
        }
        
        // Center point
        fill(0, 200, 255, 200 * activePulse);
        noStroke();
        ellipse(centerX, centerY, 10 * activePulse, 10 * activePulse);
        break;
    }
  }
  
  /**
   * Render DNA fragments
   */
  renderFragments() {
    for (const fragment of this.fragments) {
      // Skip if already collected
      if (fragment.collected) continue;
      
      const fragX = fragment.x * this.cellSize + this.cellSize/2;
      const fragY = fragment.y * this.cellSize + this.cellSize/2;
      
      // DNA helix representation
      push();
      translate(fragX, fragY);
      
      // Pulsating effect
      const pulseSize = sin(frameCount * 0.1 + fragment.pulsePhase) * 0.2 + 1;
      scale(pulseSize);
      
      // Rotation
      rotate(frameCount * 0.02);
      
      // Draw double helix
      strokeWeight(3);
      for (let i = 0; i < 2; i++) {
        const offset = i * PI;
        
        // Backbone
        stroke(0, 200, 100);
        noFill();
        beginShape();
        for (let j = 0; j < 8; j++) {
          const angle = j / 8 * TWO_PI + offset;
          const radius = 12;
          vertex(cos(angle) * radius, sin(angle) * radius);
        }
        endShape();
        
        // Bases
        fill(0, 255, 150);
        noStroke();
        for (let j = 0; j < 4; j++) {
          const angle = j / 4 * TWO_PI + offset + PI/8;
          const radius = 8;
          ellipse(cos(angle) * radius, sin(angle) * radius, 4, 4);
        }
      }
      
      // Center glow
      fill(0, 255, 150, 150);
      noStroke();
      ellipse(0, 0, 8, 8);
      
      pop();
    }
  }
  
  /**
   * Render exit portal
   */
  renderExit() {
    const exitX = this.exit.x * this.cellSize + this.cellSize/2;
    const exitY = this.exit.y * this.cellSize + this.cellSize/2;
    
    // Portal is drawn as a cell effect
  }
  
  /**
   * Render player
   */
  renderPlayer() {
    const playerX = this.player.x * this.cellSize;
    const playerY = this.player.y * this.cellSize;
    
    push();
    translate(playerX + this.cellSize/2, playerY + this.cellSize/2);
    rotate(this.player.rotation);
    
    // Player avatar (digital explorer)
    fill(0, 200, 255);
    noStroke();
    
    // Body
    ellipse(0, 0, this.cellSize * 0.6, this.cellSize * 0.6);
    
    // Direction indicator
    fill(0, 255, 255);
    triangle(
      this.cellSize * 0.3, 0,
      this.cellSize * 0.15, -this.cellSize * 0.15,
      this.cellSize * 0.15, this.cellSize * 0.15
    );
    
    // Center core
    fill(255);
    ellipse(0, 0, this.cellSize * 0.2, this.cellSize * 0.2);
    
    // Fragment indicators
    for (let i = 0; i < this.player.fragments; i++) {
      const angle = i / this.totalFragments * TWO_PI;
      fill(0, 255, 150);
      ellipse(
        cos(angle) * this.cellSize * 0.25,
        sin(angle) * this.cellSize * 0.25,
        this.cellSize * 0.1,
        this.cellSize * 0.1
      );
    }
    
    // Trailing glow
    if (this.player.moving) {
      // Trail particles
      for (let i = 0; i < 3; i++) {
        const trailX = -cos(this.player.rotation) * this.cellSize * 0.3;
        const trailY = -sin(this.player.rotation) * this.cellSize * 0.3;
        const offsetX = random(-5, 5);
        const offsetY = random(-5, 5);
        
        fill(0, 200, 255, random(50, 150));
        ellipse(trailX + offsetX, trailY + offsetY, random(3, 8), random(3, 8));
      }
    }
    
    pop();
  }
  
  /**
   * Render AI birds
   */
  renderBirds() {
    for (const bird of this.birds) {
      const birdX = bird.displayX * this.cellSize + this.cellSize/2;
      const birdY = bird.displayY * this.cellSize + this.cellSize/2;
      
      push();
      translate(birdX, birdY);
      rotate(bird.rotation);
      
      // Different appearance based on state
      if (bird.state === 'chase') {
        // Red threatening appearance
        fill(255, 50, 50);
      } else if (bird.state === 'return') {
        // Yellow cautious appearance
        fill(255, 200, 50);
      } else {
        // Normal patrol appearance
        fill(255, 100, 50);
      }
      
      // Draw bird body
      noStroke();
      ellipse(0, 0, this.cellSize * 0.5, this.cellSize * 0.3);
      
      // Draw head
      ellipse(this.cellSize * 0.2, 0, this.cellSize * 0.2, this.cellSize * 0.2);
      
      // Eyes
      fill(255);
      ellipse(this.cellSize * 0.25, -this.cellSize * 0.05, this.cellSize * 0.08, this.cellSize * 0.08);
      
      // Pupil
      fill(0);
      ellipse(this.cellSize * 0.27, -this.cellSize * 0.05, this.cellSize * 0.04, this.cellSize * 0.04);
      
      // Beak
      fill(255, 150, 0);
      triangle(
        this.cellSize * 0.3, 0,
        this.cellSize * 0.45, -this.cellSize * 0.05,
        this.cellSize * 0.45, this.cellSize * 0.05
      );
      
      // Wings
      const wingAngle = sin(bird.wingPhase) * 0.5;
      
      // Left wing
      push();
      translate(0, -this.cellSize * 0.1);
      rotate(-PI/4 + wingAngle);
      fill(255, 150, 100);
      ellipse(0, -this.cellSize * 0.15, this.cellSize * 0.4, this.cellSize * 0.1);
      pop();
      
      // Right wing
      push();
      translate(0, this.cellSize * 0.1);
      rotate(PI/4 - wingAngle);
      fill(255, 150, 100);
      ellipse(0, this.cellSize * 0.15, this.cellSize * 0.4, this.cellSize * 0.1);
      pop();
      
      // Detection radius visualization (only when debugging)
      if (isDevelopment()) {
        noFill();
        stroke(255, 100, 50, 100);
        strokeWeight(1);
        ellipse(0, 0, this.cellSize * bird.detectRadius * 2, this.cellSize * bird.detectRadius * 2);
      }
      
      pop();
    }
  }
  
  /**
   * Render visual effects
   */
  renderEffects() {
    // Render grid effects
    for (const effect of this.gridEffects) {
      switch (effect.type) {
        case 'particle':
          fill(effect.color);
          noStroke();
          ellipse(effect.x, effect.y, effect.size, effect.size);
          break;
          
        case 'pulse':
          // Draw pulse effect along circuit
          const pulseX = (effect.x + 0.5) * this.cellSize;
          const pulseY = (effect.y + 0.5) * this.cellSize;
          
          fill(effect.color);
          noStroke();
          ellipse(pulseX, pulseY, effect.size * 10, effect.size * 10);
          
          // Additional glow
          noFill();
          stroke(effect.color);
          ellipse(pulseX, pulseY, effect.size * 15, effect.size * 15);
          break;
      }
    }
    
    // Render collection effects
    for (const effect of this.collectionEffects) {
      switch (effect.type) {
        case 'particle':
          // Fade out as life decreases
          const alpha = map(effect.life, 0, 60, 0, 255);
          fill(red(effect.color), green(effect.color), blue(effect.color), alpha);
          noStroke();
          ellipse(effect.x * this.cellSize + this.cellSize/2, 
                  effect.y * this.cellSize + this.cellSize/2, 
                  effect.size, effect.size);
          break;
          
        case 'dnaSpiral':
          // DNA spiral collection effect
          push();
          translate(effect.x * this.cellSize + this.cellSize/2, 
                    effect.y * this.cellSize + this.cellSize/2);
          rotate(effect.rotation);
          
          // Fade out as life decreases
          const dnaAlpha = map(effect.life, 0, 120, 0, 255);
          
          // Draw double helix
          strokeWeight(3);
          for (let i = 0; i < 2; i++) {
            const offset = i * PI;
            
            // Backbone
            stroke(0, 200, 100, dnaAlpha);
            noFill();
            beginShape();
            for (let j = 0; j < 8; j++) {
              const angle = j / 8 * TWO_PI + offset;
              const radius = 12 * effect.size;
              vertex(cos(angle) * radius, sin(angle) * radius);
            }
            endShape();
            
            // Bases
            fill(0, 255, 150, dnaAlpha);
            noStroke();
            for (let j = 0; j < 4; j++) {
              const angle = j / 4 * TWO_PI + offset + PI/8;
              const radius = 8 * effect.size;
              ellipse(cos(angle) * radius, sin(angle) * radius, 4 * effect.size, 4 * effect.size);
            }
          }
          
          pop();
          break;
          
        case 'portal':
          // Portal effect
          push();
          translate(effect.x * this.cellSize + this.cellSize/2, 
                    effect.y * this.cellSize + this.cellSize/2);
          rotate(effect.rotation);
          
          // Fade out as life decreases
          const portalAlpha = map(effect.life, 0, 180, 0, 255);
          const portalSize = this.cellSize * effect.size;
          
          // Outer ring
          noFill();
          stroke(0, 200, 255, portalAlpha);
          strokeWeight(3);
          ellipse(0, 0, portalSize, portalSize);
          
          // Inner spirals
          for (let i = 0; i < 3; i++) {
            const spiralOffset = i * TWO_PI / 3;
            strokeWeight(2);
            
            beginShape();
            for (let j = 0; j < 12; j++) {
              const angle = j / 12 * TWO_PI + spiralOffset;
              const radius = map(j, 0, 12, portalSize * 0.5, 0);
              vertex(cos(angle) * radius, sin(angle) * radius);
            }
            endShape();
          }
          
          pop();
          break;
      }
    }
  }
  
  /**
   * Render UI overlay
   */
  renderUI() {
    // Reset transform for UI elements
    resetMatrix();
    
    // Fragment counter
    const fragmentText = `DNA Fragments: ${this.player.fragments}/${this.totalFragments}`;
    fill(0, 255, 150);
    noStroke();
    textSize(20);
    textAlign(LEFT, TOP);
    text(fragmentText, 20, 20);
    
    // Draw fragment icons
    for (let i = 0; i < this.totalFragments; i++) {
      const iconX = 40 + i * 30;
      const iconY = 60;
      const collected = this.player.collectedFragments.includes(i);
      
      if (collected) {
        // Collected fragment
        fill(0, 255, 150);
      } else {
        // Uncollected fragment
        fill(100, 100, 100);
      }
      
      // Draw DNA icon
      ellipse(iconX, iconY, 20, 20);
      
      if (collected) {
        // Inner detail for collected
        fill(0, 100, 50);
        ellipse(iconX, iconY, 10, 10);
      }
    }
    
    // Status message
    let statusText = "";
    
    if (this.exit.active) {
      statusText = "Exit portal activated! Find the portal to complete the mission.";
    } else if (this.player.fragments > 0) {
      statusText = "DNA fragment secured. Locate remaining fragments.";
    } else {
      statusText = "Mission: Collect all DNA fragments while avoiding AI birds.";
    }
    
    fill(255);
    textSize(16);
    textAlign(CENTER, BOTTOM);
    text(statusText, width/2, height - 20);
    
    // Reapply transform for rendering
    translate(this.cameraOffset.x, this.cameraOffset.y);
  }
  
  /**
   * Handle key press for player movement
   * @param {number} keyCode Key code
   * @returns {boolean} True if key was handled
   */
  handleKeyPress(keyCode) {
    // Skip if not started, solved, failed, or already moving
    if (!this.started || this.solved || this.failed || this.player.moving || this.pauseMovement) {
      return false;
    }
    
    // Calculate target position based on key
    let targetX = this.player.x;
    let targetY = this.player.y;
    
    switch (keyCode) {
      case LEFT_ARROW:
      case 65: // A
        targetX -= 1;
        break;
        
      case RIGHT_ARROW:
      case 68: // D
        targetX += 1;
        break;
        
      case UP_ARROW:
      case 87: // W
        targetY -= 1;
        break;
        
      case DOWN_ARROW:
      case 83: // S
        targetY += 1;
        break;
        
      default:
        // Not a movement key
        return false;
    }
    
    // Check if valid move
    if (this.isValidMove(targetX, targetY)) {
      // Set target and start moving
      this.player.targetX = targetX;
      this.player.targetY = targetY;
      this.player.moving = true;
      
      // Play move sound
      if (this.sounds.move) {
        this.sounds.move.play();
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Handle mouse click for player movement
   * @param {number} mouseX Mouse X position
   * @param {number} mouseY Mouse Y position
   * @returns {boolean} True if click was handled
   */
  handleClick(mouseX, mouseY) {
    // Skip if not started, solved, failed, or already moving
    if (!this.started || this.solved || this.failed || this.player.moving || this.pauseMovement) {
      return false;
    }
    
    // Convert screen position to grid position
    const gridX = floor((mouseX - this.cameraOffset.x) / this.cellSize);
    const gridY = floor((mouseY - this.cameraOffset.y) / this.cellSize);
    
    // Check if clicked position is adjacent to player
    const dx = abs(gridX - this.player.x);
    const dy = abs(gridY - this.player.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // Check if valid move
      if (this.isValidMove(gridX, gridY)) {
        // Set target and start moving
        this.player.targetX = gridX;
        this.player.targetY = gridY;
        this.player.moving = true;
        
// Play move sound
if (this.sounds.move) {
    this.sounds.move.play();
  }
  
  return true;
}
}

return false;
}

/**
* Check if a move to the given position is valid
* @param {number} x Target X position
* @param {number} y Target Y position
* @returns {boolean} True if the move is valid
*/
isValidMove(x, y) {
// Check if position is within grid bounds
if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
return false;
}

// Check cell type
const cell = this.grid[y][x];

// Cannot move into forest or obstacle cells
if (cell.type === 'forest' || cell.type === 'obstacle') {
return false;
}

// Stream cells slow down movement but are traversable
if (cell.type === 'stream') {
this.player.speed = 0.05; // Half speed in streams
} else {
this.player.speed = 0.1; // Normal speed
}

return true;
}

/**
* Calculate distance between two points
* @param {number} x1 First point X
* @param {number} y1 First point Y
* @param {number} x2 Second point X
* @param {number} y2 Second point Y
* @returns {number} Distance between points
*/
distanceTo(x1, y1, x2, y2) {
const dx = x2 - x1;
const dy = y2 - y1;
return sqrt(dx*dx + dy*dy);
}

/**
* Reset the puzzle
*/
reset() {
// Reset game state
this.started = false;
this.solved = false;
this.failed = false;
this.pauseMovement = false;

// Regenerate the grid and place elements
this.generateGrid();
this.placeElements();
this.generateBirds();
this.initializeEffects();

console.log('Navigation puzzle reset');
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
* Set a callback function for when a fragment is collected
* @param {Function} callback Callback function
*/
setFragmentCollectedCallback(callback) {
this.onFragmentCollected = callback;
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
started: this.started,
solved: this.solved,
failed: this.failed,
fragments: this.player.fragments,
totalFragments: this.totalFragments,
exitActive: this.exit.active,
attempts: this.attempts
};
}
}

// Export for use in other modules
if (typeof module !== 'undefined') {
module.exports = NavigationPuzzle;
}