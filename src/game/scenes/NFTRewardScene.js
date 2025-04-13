/**
 * AIKIRA: GENESIS PROTOCOL
 * NFT Reward Scene
 * 
 * This scene shows the NFT reward after completing the game.
 */

class NFTRewardScene {
  constructor() {
    this.name = 'nftReward';
    this.background = null;
    this.nftImage = null;
    this.nftMinted = false;
    this.nftData = null;
    this.mintingStatus = 'ready'; // ready, minting, success, error
    this.mintingError = null;
    this.transactionHash = null;
  }

  // Scene setup
  enter() {
    // Show AIKIRA character
    if (aikira) {
      aikira.show();
      aikira.setPosition(width * 0.15, height * 0.6);
    }
    
    // Show CLIZA character
    if (cliza) {
      cliza.show();
      cliza.setPosition(width * 0.85, height * 0.6);
    }
    
    // Show BYTE character
    if (byte) {
      byte.show();
      byte.setPosition(width * 0.5, height * 0.7);
      byte.setAnimationState('idle');
    }
    
    // Reset minting status
    this.mintingStatus = 'ready';
    this.mintingError = null;
    this.nftMinted = false;
    this.nftData = null;
    
    // Check if wallet is connected
    this.walletConnected = isWalletConnected();
    this.walletAddress = getConnectedAddress();
    
    // Emit event for wallet connection if needed
    if (window.gameEvents) {
      window.gameEvents.emit('nftRewardReached');
    }
  }

  // Scene rendering
  render() {
    // Draw background
    background(10, 15, 30);
    
    // Draw title
    fill(0, 234, 255);
    textSize(32);
    textAlign(CENTER, TOP);
    text("GENESIS PROTOCOL COMPLETE", width/2, 50);
    
    // Draw subtitle
    fill(255);
    textSize(18);
    text("DNA Fragment Recovered Successfully", width/2, 100);
    
    // Render characters
    if (aikira) aikira.render();
    if (cliza) cliza.render();
    if (byte) byte.render();
    
    // Render NFT preview or minting interface
    this.renderNFTInterface();
  }

  // Render NFT interface
  renderNFTInterface() {
    // NFT Container
    fill(0, 40, 80, 200);
    stroke(0, 234, 255);
    strokeWeight(2);
    rectMode(CENTER);
    rect(width / 2, height / 2, 400, 300, 10);
    
    // Different states based on minting status
    switch (this.mintingStatus) {
      case 'ready':
        this.renderReadyState();
        break;
      case 'minting':
        this.renderMintingState();
        break;
      case 'success':
        this.renderSuccessState();
        break;
      case 'error':
        this.renderErrorState();
        break;
    }
  }

  // Render ready state - before minting
  renderReadyState() {
    textAlign(CENTER, CENTER);
    
    // NFT Preview title
    fill(255);
    textSize(18);
    text("GENESIS NFT REWARD", width / 2, height / 2 - 120);
    
    // NFT Preview image
    fill(0, 100, 150);
    stroke(0, 234, 255);
    strokeWeight(1);
    rect(width / 2, height / 2 - 50, 200, 150);
    
    // NFT Description
    fill(255);
    textSize(14);
    text("Complete the final step to claim your Genesis NFT.", width / 2, height / 2 + 50);
    text("This NFT can be kept or burned for 5,000 $AIKIRA tokens.", width / 2, height / 2 + 70);
    
    // Mint button
    fill(0, 100, 150);
    stroke(0, 234, 255);
    strokeWeight(2);
    rect(width / 2, height / 2 + 120, 200, 40, 5);
    
    fill(255);
    noStroke();
    textSize(16);
    
    // Different button text based on wallet connection
    if (this.walletConnected) {
      text("MINT GENESIS NFT", width / 2, height / 2 + 120);
    } else {
      text("CONNECT WALLET", width / 2, height / 2 + 120);
    }
  }

  // Render minting state - during minting process
  renderMintingState() {
    textAlign(CENTER, CENTER);
    
    // Minting title
    fill(255);
    textSize(18);
    text("MINTING YOUR NFT...", width / 2, height / 2 - 70);
    
    // Loading spinner
    noFill();
    stroke(0, 234, 255);
    strokeWeight(3);
    
    push();
    translate(width / 2, height / 2);
    rotate(frameCount * 0.05);
    ellipse(0, 0, 80, 80);
    line(0, -40, 0, -30);
    pop();
    
    // Minting message
    fill(255);
    textSize(14);
    text("Please wait while your NFT is being minted.", width / 2, height / 2 + 50);
    text("This process may take a moment to complete.", width / 2, height / 2 + 70);
  }

  // Render success state - after successful minting
  renderSuccessState() {
    textAlign(CENTER, CENTER);
    
    // Success title
    fill(0, 255, 100);
    textSize(18);
    text("GENESIS NFT MINTED!", width / 2, height / 2 - 120);
    
    // NFT Image
    if (this.nftImage) {
      image(this.nftImage, width / 2, height / 2 - 50, 200, 150);
    } else {
      // Placeholder
      fill(0, 100, 150);
      stroke(0, 234, 255);
      strokeWeight(1);
      rect(width / 2, height / 2 - 50, 200, 150);
      
      fill(255);
      noStroke();
      textSize(14);
      text("DNA FRAGMENT", width / 2, height / 2 - 50);
    }
    
    // NFT Details
    fill(255);
    textSize(14);
    text("Congratulations! Your Genesis NFT has been minted.", width / 2, height / 2 + 50);
    
    // Transaction hash if available
    if (this.transactionHash) {
      fill(200);
      textSize(12);
      text("Transaction: " + this.transactionHash.substring(0, 10) + "...", width / 2, height / 2 + 70);
    }
    
    // View NFT button
    fill(0, 100, 150);
    stroke(0, 234, 255);
    strokeWeight(2);
    rect(width / 2, height / 2 + 110, 200, 40, 5);
    
    fill(255);
    noStroke();
    textSize(16);
    text("VIEW NFT DETAILS", width / 2, height / 2 + 110);
  }

  // Render error state - when minting fails
  renderErrorState() {
    textAlign(CENTER, CENTER);
    
    // Error title
    fill(255, 0, 50);
    textSize(18);
    text("MINTING ERROR", width / 2, height / 2 - 70);
    
    // Error icon
    noFill();
    stroke(255, 0, 50);
    strokeWeight(3);
    ellipse(width / 2, height / 2, 80, 80);
    line(width / 2 - 20, height / 2 - 20, width / 2 + 20, height / 2 + 20);
    line(width / 2 + 20, height / 2 - 20, width / 2 - 20, height / 2 + 20);
    
    // Error message
    fill(255);
    textSize(14);
    text("There was an error minting your NFT:", width / 2, height / 2 + 50);
    
    fill(255, 200, 200);
    text(this.mintingError || "Unknown error", width / 2, height / 2 + 70);
    
    // Try again button
    fill(0, 100, 150);
    stroke(0, 234, 255);
    strokeWeight(2);
    rect(width / 2, height / 2 + 120, 200, 40, 5);
    
    fill(255);
    noStroke();
    textSize(16);
    text("TRY AGAIN", width / 2, height / 2 + 120);
  }

  // Mouse pressed handler
  mousePressed() {
    // Get button position
    const buttonX = width / 2;
    const buttonY = height / 2 + 120;
    const buttonWidth = 200;
    const buttonHeight = 40;
    
    // Check if button was clicked
    if (
      mouseX > buttonX - buttonWidth / 2 &&
      mouseX < buttonX + buttonWidth / 2 &&
      mouseY > buttonY - buttonHeight / 2 &&
      mouseY < buttonY + buttonHeight / 2
    ) {
      switch (this.mintingStatus) {
        case 'ready':
          // If wallet not connected, prompt connection
          if (!this.walletConnected) {
            if (window.gameEvents) {
              window.gameEvents.emit('connectWalletClicked');
            }
          } else {
            // Start minting process
            this.mintNFT();
          }
          break;
        
        case 'error':
          // Reset to ready state to try again
          this.mintingStatus = 'ready';
          this.mintingError = null;
          break;
          
        case 'success':
          // Show NFT details
          if (window.gameEvents) {
            window.gameEvents.emit('showNFTDetails', this.nftData);
          }
          break;
      }
      
      return true;
    }
    
    return false;
  }

  // Mint NFT function
  async mintNFT() {
    // Set minting status
    this.mintingStatus = 'minting';
    
    try {
      // Generate game completion data
      const gameData = {
        walletAddress: this.walletAddress,
        byteInteractions: gameState.byteInteractions,
        puzzlesSolved: gameState.puzzlesSolved.filter(Boolean).length,
        completionDate: new Date().toISOString().split('T')[0],
        tokenReward: '5,000'
      };
      
      // Create a placeholder function for minting
      // In a real implementation, this would call the blockchain functions:
      // import { generateNFTMetadata, uploadToIPFS, mintGenesisNFT } from '../../blockchain/nft';
      
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful minting
      this.nftMinted = true;
      this.transactionHash = '0x' + Math.random().toString(16).substring(2, 42);
      this.nftData = {
        tokenId: Math.floor(Math.random() * 1000),
        name: "AIKIRA Genesis Protocol - DNA Fragment",
        description: "This NFT represents the successful recovery of the dinosaur DNA fragment from the Genesis Protocol. It can be burned to claim $AIKIRA tokens.",
        image: "/assets/images/rewards/genesis-nft.png",
        attributes: [
          {
            trait_type: "Completion Date",
            value: gameData.completionDate
          },
          {
            trait_type: "Protocol Fragments",
            value: "5/5"
          },
          {
            trait_type: "BYTE Warnings",
            value: gameData.byteInteractions
          },
          {
            trait_type: "Wallet",
            value: this.walletAddress ? 
              `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}` : 
              'Not Connected'
          },
          {
            trait_type: "Redeemable",
            value: `${gameData.tokenReward} $AIKIRA`
          }
        ]
      };
      
      // Set minting status to success
      this.mintingStatus = 'success';
      
      // Emit event for NFT minted
      if (window.gameEvents) {
        window.gameEvents.emit('nftMinted', this.nftData);
      }
      
    } catch (error) {
      console.error('Error minting NFT:', error);
      
      // Set minting status to error
      this.mintingStatus = 'error';
      this.mintingError = error.message || 'Failed to mint NFT';
    }
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
    if (aikira) aikira.setPosition(width * 0.15, height * 0.6);
    if (cliza) cliza.setPosition(width * 0.85, height * 0.6);
    if (byte) byte.setPosition(width * 0.5, height * 0.7);
  }
}

// Export scene class
export default NFTRewardScene;