/**
 * AIKIRA: GENESIS PROTOCOL
 * Base Scene Class
 * 
 * This is the foundation class that all game scenes extend.
 * It provides common functionality and structure for scenes.
 */

class BaseScene {
  constructor(name) {
    this.name = name || 'BaseScene';
    this.active = false;
    this.elements = [];
    this.width = typeof window !== 'undefined' ? window.innerWidth : 800;
    this.height = typeof window !== 'undefined' ? window.innerHeight : 600;
    this.backgroundColor = '#000000';
    
    // Store the p5 instance for use throughout the scene
    this.p5 = null;
  }
  
  // Set the p5 instance
  setP5(p5Instance) {
    this.p5 = p5Instance;
    
    // Update dimensions
    if (this.p5) {
      this.width = this.p5.width;
      this.height = this.p5.height;
    }
  }

  // Called when entering the scene
  enter() {
    this.active = true;
    console.log(`Entering scene: ${this.name}`);
    this.resize();
  }

  // Called when leaving the scene
  exit() {
    this.active = false;
    console.log(`Exiting scene: ${this.name}`);
  }

  // Render the scene
  render() {
    if (!this.active || !this.p5) return;

    // Draw background
    this.p5.background(this.backgroundColor);

    // Render scene elements
    for (const element of this.elements) {
      if (element && typeof element.render === 'function') {
        element.render();
      }
    }
  }

  // Handle window resize
  resize() {
    if (this.p5) {
      this.width = this.p5.width;
      this.height = this.p5.height;
    } else if (typeof window !== 'undefined') {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
    
    console.log(`Scene resized: ${this.width}x${this.height}`);

    // Notify elements of resize
    for (const element of this.elements) {
      if (element && typeof element.resize === 'function') {
        element.resize(this.width, this.height);
      }
    }
  }

  // Handle mouse press
  mousePressed() {
    if (!this.active || !this.p5) return false;

    // Process elements in reverse order (top to bottom)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i];
      if (element && typeof element.mousePressed === 'function') {
        if (element.mousePressed()) {
          return true; // Event handled
        }
      }
    }

    return false; // Event not handled
  }

  // Handle mouse movement
  mouseMoved() {
    if (!this.active || !this.p5) return;

    for (const element of this.elements) {
      if (element && typeof element.mouseMoved === 'function') {
        element.mouseMoved();
      }
    }
  }

  // Add an element to the scene
  addElement(element) {
    this.elements.push(element);
    return element;
  }

  // Remove an element from the scene
  removeElement(element) {
    const index = this.elements.indexOf(element);
    if (index !== -1) {
      this.elements.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // Helper method to get mouse X position
  get mouseX() {
    return this.p5 ? this.p5.mouseX : 0;
  }
  
  // Helper method to get mouse Y position
  get mouseY() {
    return this.p5 ? this.p5.mouseY : 0;
  }
  
  // Proxy common p5 functions
  background(...args) {
    if (this.p5) this.p5.background(...args);
  }
  
  fill(...args) {
    if (this.p5) this.p5.fill(...args);
  }
  
  stroke(...args) {
    if (this.p5) this.p5.stroke(...args);
  }
  
  noStroke() {
    if (this.p5) this.p5.noStroke();
  }
  
  noFill() {
    if (this.p5) this.p5.noFill();
  }
  
  rect(...args) {
    if (this.p5) this.p5.rect(...args);
  }
  
  ellipse(...args) {
    if (this.p5) this.p5.ellipse(...args);
  }
  
  text(...args) {
    if (this.p5) this.p5.text(...args);
  }
  
  textAlign(...args) {
    if (this.p5) this.p5.textAlign(...args);
  }
  
  textSize(size) {
    if (this.p5) this.p5.textSize(size);
  }
  
  push() {
    if (this.p5) this.p5.push();
  }
  
  pop() {
    if (this.p5) this.p5.pop();
  }
  
  translate(...args) {
    if (this.p5) this.p5.translate(...args);
  }
  
  rotate(angle) {
    if (this.p5) this.p5.rotate(angle);
  }
  
  scale(...args) {
    if (this.p5) this.p5.scale(...args);
  }
  
  strokeWeight(weight) {
    if (this.p5) this.p5.strokeWeight(weight);
  }
  
  color(...args) {
    return this.p5 ? this.p5.color(...args) : null;
  }
  
  dist(...args) {
    return this.p5 ? this.p5.dist(...args) : 0;
  }
  
  random(...args) {
    return this.p5 ? this.p5.random(...args) : Math.random();
  }
  
  cos(angle) {
    return this.p5 ? this.p5.cos(angle) : Math.cos(angle);
  }
  
  sin(angle) {
    return this.p5 ? this.p5.sin(angle) : Math.sin(angle);
  }
  
  min(...args) {
    return this.p5 ? this.p5.min(...args) : Math.min(...args);
  }
  
  max(...args) {
    return this.p5 ? this.p5.max(...args) : Math.max(...args);
  }
  
  map(...args) {
    return this.p5 ? this.p5.map(...args) : 0;
  }
  
  constrain(...args) {
    return this.p5 ? this.p5.constrain(...args) : 0;
  }
  
  beginShape() {
    if (this.p5) this.p5.beginShape();
  }
  
  endShape(mode) {
    if (this.p5) this.p5.endShape(mode);
  }
  
  vertex(...args) {
    if (this.p5) this.p5.vertex(...args);
  }
  
  curveVertex(...args) {
    if (this.p5) this.p5.curveVertex(...args);
  }
  
  bezierVertex(...args) {
    if (this.p5) this.p5.bezierVertex(...args);
  }
  
  line(...args) {
    if (this.p5) this.p5.line(...args);
  }
  
  rectMode(mode) {
    if (this.p5) this.p5.rectMode(mode);
  }
  
  ellipseMode(mode) {
    if (this.p5) this.p5.ellipseMode(mode);
  }
  
  // p5 constants
  get CENTER() {
    return this.p5 ? this.p5.CENTER : "center";
  }
  
  get CORNER() {
    return this.p5 ? this.p5.CORNER : "corner";
  }
  
  get CORNERS() {
    return this.p5 ? this.p5.CORNERS : "corners";
  }
  
  get RADIUS() {
    return this.p5 ? this.p5.RADIUS : "radius";
  }
  
  get TOP() {
    return this.p5 ? this.p5.TOP : "top";
  }
  
  get BOTTOM() {
    return this.p5 ? this.p5.BOTTOM : "bottom";
  }
  
  get LEFT() {
    return this.p5 ? this.p5.LEFT : "left";
  }
  
  get RIGHT() {
    return this.p5 ? this.p5.RIGHT : "right";
  }
  
  get PI() {
    return Math.PI;
  }
  
  get TWO_PI() {
    return Math.PI * 2;
  }
  
  get HALF_PI() {
    return Math.PI / 2;
  }
  
  get QUARTER_PI() {
    return Math.PI / 4;
  }
  
  get CLOSE() {
    return this.p5 ? this.p5.CLOSE : "close";
  }
}

// Export for use in other modules
export default BaseScene;