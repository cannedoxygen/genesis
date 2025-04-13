import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

/**
 * GameCanvas component for AIKIRA: GENESIS PROTOCOL
 * 
 * This component creates and manages the p5.js canvas where the game runs.
 * It handles canvas initialization, resizing, and cleanup, while passing
 * game state between React and p5.js.
 */
const GameCanvas = ({
  activeScene,
  completedChapters,
  collectedClues,
  walletConnected,
  walletAddress,
  audioEnabled
}) => {
  // Reference to the container div
  const canvasContainerRef = useRef(null);
  // Reference to the p5 instance
  const canvasRef = useRef(null);
  
  // Effect for initializing and cleaning up p5
  useEffect(() => {
    // Skip if container ref is not available
    if (!canvasContainerRef.current) return;
    
    // Initialize p5 sketch
    const sketch = (p) => {
      // Setup function - runs once at initialization
      p.setup = () => {
        // Create canvas that fills the container
        const canvas = p.createCanvas(
          canvasContainerRef.current.offsetWidth,
          canvasContainerRef.current.offsetHeight
        );
        
        // Add the canvas to our container
        canvas.parent(canvasContainerRef.current);
        
        // Make p5 instance available to the game engine
        if (window.gameEngine && window.gameEngine.setP5Instance) {
          window.gameEngine.setP5Instance(p);
        }
        
        // Initialize game assets if needed
        if (window.gameEngine && window.gameEngine.initializeAssets) {
          window.gameEngine.initializeAssets();
        }
        
        // Set audio state
        if (window.gameEngine && window.gameEngine.setAudioEnabled) {
          window.gameEngine.setAudioEnabled(audioEnabled);
        }
      };
      
      // Draw function - runs continuously
      p.draw = () => {
        // Let the game engine handle the rendering
        if (window.gameEngine && window.gameEngine.render) {
          window.gameEngine.render();
        } else {
          // Default background if engine not loaded
          p.background(10, 15, 30);
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(18);
          p.text('AIKIRA: GENESIS PROTOCOL', p.width/2, p.height/2 - 20);
          p.textSize(14);
          p.text('Loading game engine...', p.width/2, p.height/2 + 20);
        }
      };
      
      // Window resize handler
      p.windowResized = () => {
        // Resize canvas to fill container
        if (canvasContainerRef.current) {
          p.resizeCanvas(
            canvasContainerRef.current.offsetWidth,
            canvasContainerRef.current.offsetHeight
          );
        }
        
        // Notify game engine of resize
        if (window.gameEngine && window.gameEngine.handleResize) {
          window.gameEngine.handleResize(p.width, p.height);
        }
      };
      
      // Mouse pressed handler
      p.mousePressed = () => {
        if (window.gameEngine && window.gameEngine.handleMousePress) {
          return window.gameEngine.handleMousePress(p.mouseX, p.mouseY);
        }
        return false;
      };
      
      // Mouse moved handler
      p.mouseMoved = () => {
        if (window.gameEngine && window.gameEngine.handleMouseMove) {
          window.gameEngine.handleMouseMove(p.mouseX, p.mouseY);
        }
      };
      
      // Key pressed handler
      p.keyPressed = () => {
        if (window.gameEngine && window.gameEngine.handleKeyPress) {
          return window.gameEngine.handleKeyPress(p.keyCode);
        }
        return false;
      };
    };
    
    // Create new p5 instance
    canvasRef.current = new p5(sketch);
    
    // Cleanup function
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, []);
  
  // Effect for updating game state
  useEffect(() => {
    // Update active scene
    if (window.gameEngine && window.gameEngine.setScene && activeScene) {
      window.gameEngine.setScene(activeScene);
    }
  }, [activeScene]);
  
  // Effect for audio settings
  useEffect(() => {
    if (window.gameEngine && window.gameEngine.setAudioEnabled) {
      window.gameEngine.setAudioEnabled(audioEnabled);
    }
  }, [audioEnabled]);
  
  // Effect for wallet connection
  useEffect(() => {
    if (window.gameEngine && window.gameEngine.updateWalletStatus) {
      window.gameEngine.updateWalletStatus(walletConnected, walletAddress);
    }
  }, [walletConnected, walletAddress]);
  
  // Effect for game progress
  useEffect(() => {
    if (window.gameEngine && window.gameEngine.updateGameProgress) {
      window.gameEngine.updateGameProgress({
        completedChapters,
        collectedClues
      });
    }
  }, [completedChapters, collectedClues]);
  
  return (
    <div 
      ref={canvasContainerRef} 
      className="game-canvas-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    />
  );
};

export default GameCanvas;