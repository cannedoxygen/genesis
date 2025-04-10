/**
 * AIKIRA: GENESIS PROTOCOL
 * Dialogue System
 * 
 * This module manages all in-game dialogue:
 * - Character dialogue lines and sequences
 * - Dialogue tree navigation
 * - Dialogue presentation timing
 * - Character-specific dialogue styles and personalities
 */

// Character personality traits affect dialogue generation
const CHARACTER_TRAITS = {
    AIKIRA: {
      logical: 0.9,  // High logical reasoning
      elegant: 0.8,  // Refined and precise
      focused: 0.85, // Highly task-oriented
      calm: 0.7     // Generally calm demeanor
    },
    CLIZA: {
      quirky: 0.85,    // High quirkiness
      fastThinking: 0.9, // Very quick thinking
      explorer: 0.8,    // Exploration-focused
      historical: 0.95  // Deep historical knowledge
    },
    BYTE: {
      sassy: 0.9,    // High sass level
      judgmental: 0.8, // Very judgmental
      protective: 0.95, // Extremely protective of the protocol
      digital: 0.7    // Digital/glitchy appearance
    }
  };
  
  // Base dialogue instances for each chapter and common scenarios
  const DIALOGUE_LIBRARY = {
    // Chapter 1: Cryptic Wall
    chapter1: {
      intro: [
        {
          character: "AIKIRA",
          lines: [
            "System reboot sequence initiated. Genesis Protocol awakening...",
            "It's been 65 million years since the last activation.",
            "Scanning for optimal data extraction pathway..."
          ]
        },
        {
          character: "CLIZA",
          lines: [
            "Aikira! We're awake! The signals are aligning just as predicted.",
            "The wolves were just the beginning. Now we must go deeper.",
            "I'm detecting an ancient encryption wall. We'll need to decode it."
          ]
        },
        {
          character: "BYTE",
          lines: [
            "*suspicious growl*",
            "SCANNING USER IDENTITY...",
            "PROCEED WITH CAUTION. WALL CONTAINS PRE-MAMMALIAN SEQUENCE DATA."
          ]
        }
      ],
      puzzle_hint: [
        {
          character: "CLIZA",
          lines: [
            "The wall responds to certain activation patterns.",
            "Look for symbols that pulse with ancient energy.",
            "I believe the sequence relates to evolutionary steps."
          ]
        },
        {
          character: "AIKIRA",
          lines: [
            "Protocol analysis indicates a specific sequence is required.",
            "The patterns appear to follow a logical progression.",
            "The wall's encryption suggests chronological ordering."
          ]
        }
      ],
      success: [
        {
          character: "AIKIRA",
          lines: [
            "Excellent. The first fragment of the Genesis Protocol has been recovered.",
            "Clue unlocked: 'THEY CAME BEFORE THE WOLVES'",
            "Preparing transition to next sequence node..."
          ]
        }
      ],
      failure: [
        {
          character: "BYTE",
          lines: [
            "*aggressive bark*",
            "SEQUENCE CORRUPTION DETECTED. RESET REQUIRED.",
            "TRY AGAIN, AGENT."
          ]
        }
      ]
    },
    
    // Chapter 2: Mammoth Shrine
    chapter2: {
      intro: [
        {
          character: "AIKIRA",
          lines: [
            "Mammoth Shrine sequence initialized.",
            "Protocol signal detected from recent memetic disturbance.",
            "Decrypt the memory pattern to access fragment data."
          ]
        },
        {
          character: "CLIZA",
          lines: [
            "Fascinating! The Mammoth revival signals were just a distraction.",
            "What we're seeing are memory fragments from MUCH earlier...",
            "These tones represent an ancient harmonic sequence. We need to repeat the pattern."
          ]
        }
      ],
      puzzle_hint: [
        {
          character: "CLIZA",
          lines: [
            "The shrine responds to the correct sequence of tones.",
            "Watch the pattern carefully and then repeat it!",
            "Each glyph has a unique tone and color signature."
          ]
        }
      ],
      success: [
        {
          character: "AIKIRA",
          lines: [
            "Correct sequence detected. Memory pattern validated.",
            "Clue unlocked: 'PROTOCOL FRAGMENT UNLOCKED: EXODUS 2'",
            "Preparing transition to next sequence node..."
          ]
        }
      ],
      failure: [
        {
          character: "BYTE",
          lines: [
            "*frustrated bark*",
            "MEMORY SEQUENCE ERROR. RESETTING PATTERN.",
            "REPEAT SEQUENCE CORRECTLY, AGENT."
          ]
        }
      ]
    },
    
    // Chapter 3: BYTE's Judgment
    chapter3: {
      intro: [
        {
          character: "BYTE",
          lines: [
            "*intense stare*",
            "INITIATING INTELLIGENCE ASSESSMENT PROTOCOL.",
            "DETERMINING IF AGENT IS MEATBRAIN OR ALGORITHMIC ENTITY."
          ]
        },
        {
          character: "BYTE",
          lines: [
            "YOU CLAIM TO SEEK ANCIENT DNA.",
            "BUT FIRST YOU MUST PROVE YOUR REASONING CAPABILITIES.",
            "ANSWER MY RIDDLE CORRECTLY OR BE DENIED ACCESS."
          ]
        }
      ],
      puzzle_hint: [
        {
          character: "CLIZA",
          lines: [
            "Don't panic! BYTE's questions follow evolutionary logic.",
            "Think about the natural order of things in the timeline we're exploring.",
            "Remember what we learned in the previous nodes!"
          ]
        },
        {
          character: "AIKIRA",
          lines: [
            "BYTE is verifying your logical processing capabilities.",
            "This is a standard security protocol to differentiate between human and AI intruders.",
            "Please proceed with the verification process."
          ]
        }
      ],
      success: [
        {
          character: "BYTE",
          lines: [
            "*satisfied digital bark*",
            "LOGICAL PROCESSING VERIFIED. YOU ARE NOT MEATBRAIN.",
            "ACCESS GRANTED TO NEXT PROTOCOL FRAGMENT."
          ]
        },
        {
          character: "AIKIRA",
          lines: [
            "Verification successful.",
            "Clue unlocked: 'YOU ARE NOT MEATBRAIN.'",
            "Preparing transition to next sequence node..."
          ]
        }
      ],
      failure: [
        {
          character: "BYTE",
          lines: [
            "*aggressive bark*",
            "INCORRECT. MEATBRAIN LOGIC DETECTED.",
            "RECALIBRATING ASSESSMENT..."
          ]
        }
      ]
    },
    
    // Chapter 4: Encrypted Forest
    chapter4: {
      intro: [
        {
          character: "AIKIRA",
          lines: [
            "Encrypted Forest protocol initiated.",
            "Anomalous data streams detected in this region.",
            "Navigate carefully to retrieve the DNA fragments."
          ]
        },
        {
          character: "CLIZA",
          lines: [
            "This data forest is fascinating! The patterns mimic ancient migration routes.",
            "I'm detecting three distinct DNA fragment signals scattered throughout.",
            "Be careful of the security protocols - they manifest as predatory birds!"
          ]
        }
      ],
      puzzle_hint: [
        {
          character: "CLIZA",
          lines: [
            "Try to move along the data streams - they provide camouflage from the birds.",
            "The fragments emit a subtle pulse that increases as you get closer.",
            "Don't rush - plan your route carefully to avoid detection!"
          ]
        }
      ],
      fragment_found: [
        {
          character: "CLIZA",
          lines: [
            "Excellent! Fragment secured.",
            "This appears to be a segment of therapod DNA. Fascinating!",
            "Continue searching for the remaining fragments."
          ]
        }
      ],
      all_fragments: [
        {
          character: "CLIZA",
          lines: [
            "All three fragments collected!",
            "Head to the exit portal to compile the data.",
            "The complete sequence is beginning to take shape!"
          ]
        }
      ],
      success: [
        {
          character: "AIKIRA",
          lines: [
            "Navigation successful. All DNA fragments retrieved.",
            "Clue unlocked: 'DINO. SEQUENCE. LOCATED.'",
            "Preparing transition to final sequence node..."
          ]
        }
      ],
      failure: [
        {
          character: "BYTE",
          lines: [
            "*warning bark*",
            "SECURITY PROTOCOL TRIGGERED. LOCATION COMPROMISED.",
            "RECALIBRATING COORDINATES. PREPARE FOR REATTEMPT."
          ]
        }
      ]
    },
    
    // Chapter 5: Genesis Vault
    chapter5: {
      intro: [
        {
          character: "AIKIRA",
          lines: [
            "Genesis Vault access granted.",
            "Final protocol layer detected. Security clearance required.",
            "Input DNA fragments to decrypt the Genesis Sequence."
          ]
        },
        {
          character: "CLIZA",
          lines: [
            "This is it! The culmination of all our efforts!",
            "The vault contains the complete dinosaur DNA signature we've been searching for.",
            "Use the clues from each chapter to determine the correct input sequence."
          ]
        }
      ],
      puzzle_hint: [
        {
          character: "CLIZA",
          lines: [
            "Let me help you with this! Remember the clues we've collected:",
            "'They came before the wolves', 'Protocol fragment: EXODUS 2', 'You are not meatbrain', 'DINO. SEQUENCE. LOCATED.'",
            "The code must relate to these somehow... think about what they represent!"
          ]
        },
        {
          character: "BYTE",
          lines: [
            "*intense stare*",
            "FINAL SECURITY BARRIER ACTIVE.",
            "GENESIS EGG WILL RESPOND ONLY TO CORRECT SEQUENCE."
          ]
        }
      ],
      success: [
        {
          character: "AIKIRA",
          lines: [
            "Genesis Sequence unlocked. DNA protocol verified.",
            "REX-type fragment extracted and preserved.",
            "Protocol objective achieved. Well done, Agent."
          ]
        },
        {
          character: "CLIZA",
          lines: [
            "Incredible! The dinosaur DNA is intact after 65 million years!",
            "This is exactly what we were searching for. The T-Rex genetic signature is complete!",
            "The Genesis Protocol can now be preserved for future generations."
          ]
        },
        {
          character: "BYTE",
          lines: [
            "*happy bark*",
            "VALIDATION COMPLETE. USER IDENTITY CONFIRMED.",
            "GENESIS PROTOCOL MISSION SUCCESSFUL."
          ]
        }
      ],
      failure: [
        {
          character: "BYTE",
          lines: [
            "*warning bark*",
            "INVALID SEQUENCE DETECTED. ACCESS DENIED.",
            "RETRY WITH CORRECT PROTOCOL FRAGMENTS."
          ]
        }
      ],
      reward: [
        {
          character: "AIKIRA",
          lines: [
            "Your Genesis NFT has been prepared as a record of this achievement.",
            "You may keep it as proof of your success or burn it for $AIKIRA tokens.",
            "Thank you for your service to the Genesis Protocol."
          ]
        }
      ]
    },
    
    // Common dialogue for reuse across chapters
    common: {
      welcome: [
        {
          character: "AIKIRA",
          lines: [
            "Welcome to the Genesis Protocol.",
            "We are seeking to recover ancient DNA sequencing data.",
            "Follow our guidance to navigate the security systems."
          ]
        }
      ],
      hint_request: [
        {
          character: "CLIZA",
          lines: [
            "Need a hint? Let me analyze the pattern...",
            "I'm detecting a specific sequence that might help.",
            "Try focusing on the evolutionary progression."
          ]
        }
      ],
      byte_warning: [
        {
          character: "BYTE",
          lines: [
            "*suspicious growl*",
            "ANOMALOUS BEHAVIOR DETECTED.",
            "INCREASING SECURITY PROTOCOLS."
          ]
        }
      ],
      transition: [
        {
          character: "AIKIRA",
          lines: [
            "Protocol fragment secured.",
            "Transitioning to next sequence node.",
            "Please stand by..."
          ]
        }
      ]
    }
  };
  
  /**
   * Get dialogue for specific chapter and context
   * @param {string} chapter Chapter identifier ('chapter1', 'chapter2', etc.)
   * @param {string} context Context identifier ('intro', 'puzzle_hint', 'success', etc.)
   * @param {number} variation Variation number (optional, default 0)
   * @returns {Object|null} Dialogue object or null if not found
   */
  export function getDialogue(chapter, context, variation = 0) {
    // Check if chapter exists
    if (!DIALOGUE_LIBRARY[chapter]) {
      // Try to use common dialogue if chapter-specific not found
      if (context && DIALOGUE_LIBRARY.common[context]) {
        const options = DIALOGUE_LIBRARY.common[context];
        return options[variation % options.length];
      }
      return null;
    }
    
    // Check if context exists in chapter
    if (!DIALOGUE_LIBRARY[chapter][context]) {
      // Try to use common dialogue if context-specific not found
      if (DIALOGUE_LIBRARY.common[context]) {
        const options = DIALOGUE_LIBRARY.common[context];
        return options[variation % options.length];
      }
      return null;
    }
    
    // Get dialogue options for this chapter and context
    const options = DIALOGUE_LIBRARY[chapter][context];
    
    // Return specific variation or first if not available
    return options[variation % options.length];
  }
  
  /**
   * Generate character-specific dialogue line
   * @param {string} character Character identifier ('AIKIRA', 'CLIZA', 'BYTE')
   * @param {string} context Context for dialogue ('greeting', 'puzzle_hint', 'success', etc.)
   * @param {Object} data Additional data for dialogue generation
   * @returns {string} Generated dialogue line
   */
  export function generateCharacterLine(character, context, data = {}) {
    // Get character traits
    const traits = CHARACTER_TRAITS[character];
    if (!traits) {
      return `${character}: Invalid character`;
    }
    
    // Use predefined responses based on character and context
    switch (character) {
      case 'AIKIRA':
        switch (context) {
          case 'greeting':
            return "Genesis Protocol active. I am AIKIRA, custodian of the ancient data sequence.";
          case 'puzzle_hint':
            return "Analyze the pattern carefully. The sequence follows evolutionary logic.";
          case 'success':
            return "Excellent. Protocol fragment unlocked. Proceeding to next sequence node.";
          case 'failure':
            return "Sequence corruption detected. Please attempt recalibration.";
          default:
            return "Continuing Genesis Protocol operations. Please proceed.";
        }
      
      case 'CLIZA':
        switch (context) {
          case 'greeting':
            return "Oh! Hello there! I'm CLIZA, explorer extraordinaire! Ready to uncover some ancient secrets?";
          case 'puzzle_hint':
            return "Hmm, let me think... *processing* The pattern reminds me of pre-extinction data structures! Try looking for evolutionary connections.";
          case 'success':
            return "You did it! Just like the protoceratops DNA sequence of 65.5 million years ago! Another fragment recovered!";
          case 'failure':
            return "Oops! That's not quite right. But don't worry! Even the early protocol attempts had a 78.3% failure rate before succeeding!";
          default:
            return "Fascinating! This reminds me of something I catalogued from the Mesozoic data packets!";
        }
      
      case 'BYTE':
        // BYTE's responses are affected by suspicion level
        const suspicion = data.suspicion || 0;
        
        if (suspicion > 75) {
          // High suspicion
          switch (context) {
            case 'greeting':
              return "*aggressive growl* USER IDENTITY COMPROMISED. ALERTING PROTOCOL.";
            case 'puzzle_hint':
              return "ERROR. MEATBRAIN DETECTED. SOLUTION WITHELD.";
            case 'failure':
              return "*LOUD BARK* PROTOCOL VIOLATION DETECTED. SECURITY MEASURES ENABLED.";
            default:
              return "*suspicious growl* SCANNING...";
          }
        } else if (suspicion > 40) {
          // Medium suspicion
          switch (context) {
            case 'greeting':
              return "*cautious growl* VERIFYING USER CREDENTIALS...";
            case 'puzzle_hint':
              return "PARTIAL ACCESS GRANTED. PROCEED WITH CAUTION.";
            case 'success':
              return "PROTOCOL INTEGRITY MAINTAINED... FOR NOW.";
            case 'failure':
              return "*warning bark* ATTEMPT LOGGED. SUSPICION INCREASED.";
            default:
              return "*alert stance* MONITORING...";
          }
        } else {
          // Low suspicion
          switch (context) {
            case 'greeting':
              return "*digital sniff* USER APPEARS VALID. PROCEEDING.";
            case 'puzzle_hint':
              return "PATTERN RECOGNITION SUBROUTINE AVAILABLE. ACCESSING...";
            case 'success':
              return "ACCEPTABLE PERFORMANCE. PROTOCOL INTEGRITY PRESERVED.";
            case 'failure':
              return "*low growl* RECALIBRATION REQUIRED. TRY AGAIN.";
            default:
              return "*attentive stance* SYSTEM MONITORING ACTIVE.";
          }
        }
      
      default:
        return "Invalid character dialogue request.";
    }
  }
  
  /**
   * Get a dialogue sequence for a chapter introduction
   * @param {string} chapter Chapter identifier
   * @returns {Array} Array of dialogue objects
   */
  export function getChapterIntro(chapter) {
    if (!DIALOGUE_LIBRARY[chapter] || !DIALOGUE_LIBRARY[chapter].intro) {
      return DIALOGUE_LIBRARY.common.welcome;
    }
    
    return DIALOGUE_LIBRARY[chapter].intro;
  }
  
  /**
   * Get character-specific hint for a chapter
   * @param {string} character Character identifier
   * @param {string} chapter Chapter identifier
   * @returns {string[]} Array of hint lines
   */
  export function getCharacterHint(character, chapter) {
    // Get chapter puzzle hints
    const chapterHints = DIALOGUE_LIBRARY[chapter]?.puzzle_hint || [];
    
    // Find hint for specific character
    for (const hint of chapterHints) {
      if (hint.character === character) {
        return hint.lines;
      }
    }
    
    // Fall back to common hints if character-specific not found
    const commonHints = DIALOGUE_LIBRARY.common.hint_request;
    for (const hint of commonHints) {
      if (hint.character === character) {
        return hint.lines;
      }
    }
    
    // Generate a generic hint if nothing specific found
    return [generateCharacterLine(character, 'puzzle_hint')];
  }
  
  /**
   * Process dialogue with formatting and effects
   * @param {string} text Dialogue text
   * @param {string} character Character speaking
   * @returns {string} Processed dialogue
   */
  export function processDialogue(text, character) {
    if (!text) return "";
    
    let processed = text;
    
    // Process character-specific formatting
    switch (character) {
      case 'BYTE':
        // Convert to uppercase for BYTE
        processed = processed.toUpperCase();
        break;
        
      case 'CLIZA':
        // Add excitement marks for CLIZA
        if (!processed.endsWith('!') && !processed.endsWith('?') && !processed.endsWith('.')) {
          processed += '!';
        }
        break;
        
      case 'AIKIRA':
        // Ensure proper punctuation for AIKIRA
        if (!processed.endsWith('.') && !processed.endsWith('!') && !processed.endsWith('?')) {
          processed += '.';
        }
        break;
    }
    
    // Process common tags and emotes
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return processed;
  }
  
  /**
   * Get a complete dialogue object
   * @param {string} dialogueId Dialogue identifier (format: "chapter:context:variation")
   * @returns {Object|null} Complete dialogue object or null if not found
   */
  export function getDialogueById(dialogueId) {
    const parts = dialogueId.split(':');
    if (parts.length < 2) return null;
    
    const chapter = parts[0];
    const context = parts[1];
    const variation = parts.length > 2 ? parseInt(parts[2]) : 0;
    
    return getDialogue(chapter, context, variation);
  }
  
  /**
   * Get all available dialogue IDs for a chapter
   * @param {string} chapter Chapter identifier
   * @returns {string[]} Array of dialogue IDs
   */
  export function getChapterDialogueIds(chapter) {
    if (!DIALOGUE_LIBRARY[chapter]) return [];
    
    const ids = [];
    
    // Collect all context keys from chapter
    for (const context of Object.keys(DIALOGUE_LIBRARY[chapter])) {
      const variations = DIALOGUE_LIBRARY[chapter][context].length;
      
      // Add each variation as a separate ID
      for (let v = 0; v < variations; v++) {
        ids.push(`${chapter}:${context}:${v}`);
      }
    }
    
    return ids;
  }
  
  /**
   * Get all clues from dialogue
   * @returns {string[]} Array of clue texts
   */
  export function getAllClues() {
    const clues = [];
    
    // Extract clues from success dialogues
    for (const chapter of Object.keys(DIALOGUE_LIBRARY)) {
      if (chapter === 'common') continue;
      
      const successDialogues = DIALOGUE_LIBRARY[chapter].success || [];
      for (const dialogue of successDialogues) {
        if (dialogue.character === 'AIKIRA') {
          // Look for clue line (usually the second line)
          const clueLine = dialogue.lines.find(line => line.includes('Clue unlocked:'));
          if (clueLine) {
            // Extract the clue text (between quotes if present)
            const match = clueLine.match(/'([^']+)'/);
            if (match) {
              clues.push(match[1]);
            }
          }
        }
      }
    }
    
    return clues;
  }
  
  // Export default dialogue methods
  export default {
    getDialogue,
    generateCharacterLine,
    getChapterIntro,
    getCharacterHint,
    processDialogue
  };