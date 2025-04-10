/**
 * AIKIRA: GENESIS PROTOCOL
 * Clue System
 * 
 * This module manages all game clues and their related functionality:
 * - Storing clue data
 * - Tracking collected clues
 * - Providing hint systems
 * - Connection to puzzle solutions
 */

// Clue database for each chapter
const CLUES = {
    chapter1: {
      id: "they_came_before_wolves",
      text: "THEY CAME BEFORE THE WOLVES",
      hint: "The symbols follow evolutionary order!",
      solution: "dna,egg,claw,eye,star",
      collectMessage: "First protocol fragment identified: Dinosaurs existed before mammals like wolves."
    },
    
    chapter2: {
      id: "exodus_2",
      text: "PROTOCOL FRAGMENT UNLOCKED: EXODUS 2",
      hint: "The tones represent an ancient harmonic sequence.",
      solution: "3,1,4,2,5",
      collectMessage: "Second protocol fragment identified: A reference to genetic preservation sequences."
    },
    
    chapter3: {
      id: "not_meatbrain",
      text: "YOU ARE NOT MEATBRAIN",
      hint: "BYTE is testing if you're a meatbrain or AI!",
      solution: "dinosaur",
      collectMessage: "Third protocol fragment identified: Recognition of algorithmic thinking patterns."
    },
    
    chapter4: {
      id: "dino_sequence_located",
      text: "DINO. SEQUENCE. LOCATED.",
      hint: "The forest patterns mimic ancient migration routes!",
      solution: "fragment1,fragment2,fragment3",
      collectMessage: "Fourth protocol fragment identified: Location of the preserved DNA fragments."
    },
    
    chapter5: {
      id: "rex_type_fragment",
      text: "REX-TYPE FRAGMENT EXTRACTED",
      hint: "Use the collected fragments to determine the final code.",
      solution: "D,I,N,O,5",
      collectMessage: "Final protocol fragment identified: T-Rex genetic signature preserved."
    }
  };
  
  // Extra hint maps that might help players
  const HINT_MAPS = {
    "evolutionary_order": [
      "DNA (genetic material)",
      "Egg (reproductive cell)",
      "Claw (physical feature)",
      "Eye (sensory organ)",
      "Star (cosmic element)"
    ],
    
    "fragment_locations": [
      "The Northern Circuit - Contains basic structural genes",
      "The Western Stream - Contains protein synthesis sequences",
      "The Southern Data Lake - Contains neural development code"
    ],
    
    "protocol_keywords": {
      "EXODUS": "Preservation of genetic material",
      "GENESIS": "Original creation sequence",
      "MEATBRAIN": "Biological intelligence",
      "SEQUENCE": "Ordered genetic code",
      "FRAGMENT": "Portion of complete DNA code"
    }
  };
  
  /**
   * Get a clue by its chapter
   * @param {string} chapter Chapter identifier
   * @returns {Object|null} Clue object or null if not found
   */
  export function getClue(chapter) {
    return CLUES[chapter] || null;
  }
  
  /**
   * Get a clue by its ID
   * @param {string} clueId Clue identifier
   * @returns {Object|null} Clue object or null if not found
   */
  export function getClueById(clueId) {
    for (const chapter in CLUES) {
      if (CLUES[chapter].id === clueId) {
        return CLUES[chapter];
      }
    }
    return null;
  }
  
  /**
   * Get all clues
   * @returns {Object} All clues indexed by chapter
   */
  export function getAllClues() {
    return CLUES;
  }
  
  /**
   * Check if two clues are related
   * @param {string} clueId1 First clue ID
   * @param {string} clueId2 Second clue ID
   * @returns {boolean} True if clues are related
   */
  export function areCluesRelated(clueId1, clueId2) {
    const clue1 = getClueById(clueId1);
    const clue2 = getClueById(clueId2);
    
    if (!clue1 || !clue2) return false;
    
    // Check for keyword overlap
    const keywords1 = clue1.text.split(/\s+/);
    const keywords2 = clue2.text.split(/\s+/);
    
    for (const word1 of keywords1) {
      if (keywords2.includes(word1) && word1.length > 3) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get a hint for solving a specific chapter
   * @param {string} chapter Chapter identifier
   * @param {number} level Hint level (1-3, higher = more explicit)
   * @returns {string} Hint text
   */
  export function getHint(chapter, level = 1) {
    const clue = CLUES[chapter];
    if (!clue) return "No hint available for this chapter.";
    
    switch (level) {
      case 1:
        return clue.hint;
      case 2:
        return `${clue.hint} Look at the clues you've already collected.`;
      case 3:
        return `The solution is related to ${clue.solution.split(',')[0]}. ${clue.hint}`;
      default:
        return clue.hint;
    }
  }
  
  /**
   * Get a hint map for additional context
   * @param {string} mapId Hint map identifier
   * @returns {Array|Object|null} Hint map data or null if not found
   */
  export function getHintMap(mapId) {
    return HINT_MAPS[mapId] || null;
  }
  
  /**
   * Format a clue for display
   * @param {string} clueText Raw clue text
   * @returns {string} Formatted clue text
   */
  export function formatClue(clueText) {
    // Add styling and formatting to clue text
    return `"${clueText}"`;
  }
  
  /**
   * Check if collected clues contain the solution to the final puzzle
   * @param {Array} collectedClues Array of collected clue IDs
   * @returns {boolean} True if final solution can be derived
   */
  export function canSolveFinalPuzzle(collectedClues) {
    // Need at least 4 clues to solve the final puzzle
    if (collectedClues.length < 4) return false;
    
    // Check for required clues
    const requiredClues = [
      "they_came_before_wolves",
      "exodus_2",
      "not_meatbrain",
      "dino_sequence_located"
    ];
    
    for (const required of requiredClues) {
      if (!collectedClues.includes(required)) {
        return false;
      }
    }
    
    return true;
  }
  
  // Export default clue functions for compatibility
  export default {
    getClue,
    getAllClues,
    getHint,
    formatClue
  };