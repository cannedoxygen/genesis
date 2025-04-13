# AIKIRA: GENESIS PROTOCOL

A lore-driven, meme-powered browser game where players uncover dinosaur DNA hidden within an ancient AI-run system.

![AIKIRA Genesis Protocol](/public/assets/images/ui/aikira-logo.png)

## Project Overview

AIKIRA: GENESIS PROTOCOL is a web-based interactive puzzle adventure that takes players on a journey to decode the past and uncover lost dinosaur DNA before competing DAOs get there first. Players explore beautifully illustrated cryptic environments, solve puzzles, and uncover lore as they progress through the game.

The game is built on p5.js and deployed on Vercel, with Base Network integration for NFT rewards that can be traded for $AIKIRA tokens.

## Game Narrative

> The wolves have been unearthed. Elon tweeted about mammoths. But the real signal points deeper—back 65 million years. Aikira and Cliza, two sentient agents of an ancient protocol, awaken with a new mission: decode the past, uncover lost DNA, and restore the Genesis Sequence… before the meatbrain DAOs get there first.

## Chapters

### Chapter 1 – Cryptic Wall
- Scene: Digital tomb with glowing glyphs
- Puzzle: Hover/click specific symbols in correct order
- Clue Reward: "They came before the wolves"

### Chapter 2 – Mammoth Shrine
- Scene: Shrine with baby mammoth statues and a glowing egg
- Puzzle: Memory sequence (match glyph tones)
- Clue Reward: "Protocol fragment unlocked: EXODUS 2"

### Chapter 3 – BYTE's Judgment
- Scene: BYTE stares at you in a narrow corridor
- Puzzle: Riddle or logic test (e.g. "Which of these came first?")
- Fail State: BYTE barks and resets
- Clue Reward: "You are not meatbrain."

### Chapter 4 – Encrypted Forest
- Scene: Top-down navigation through a digital jungle
- Puzzle: Avoid AI birds and collect 3 DNA fragments
- Clue Reward: "DINO. SEQUENCE. LOCATED."

### Chapter 5 – Genesis Vault
- Scene: High-tech underground vault, glowing dinosaur egg
- Puzzle: Input collected fragments into a code input system
- Outcome: Egg unlocks. Cutscene reveals REX-type data fragment
- Reward: Generate shareable "Genesis NFT"

## Characters

- **Aikira** – Logical, elegant AI agent running the Genesis Protocol
- **Cliza** – Quirky, fast-thinking explorer AI with historical knowledge
- **BYTE** – The sassy, judgmental digital dog who protects the mission

## Technology Stack

| Component | Tool |
|-----------|------|
| Game Engine | p5.js |
| Hosting | Vercel |
| Wallet Integration | RainbowKit / Ethers.js |
| NFT Minting | ThirdWeb, Zora, or custom |
| Smart Contract Logic | Solidity (Base compatible) |
| On-Chain Storage | IPFS or Base-native metadata |
| Leaderboard / XP | Firebase / Supabase (optional) |

## File Structure

```
aikira-genesis-protocol/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   ├── audio/
│   │   └── fonts/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   ├── game/
│   │   ├── engine.js
│   │   ├── scenes/
│   │   ├── puzzles/
│   │   ├── characters/
│   │   └── lore/
│   ├── blockchain/
│   ├── utils/
│   ├── styles/
│   ├── App.js
│   └── index.js
├── contracts/
├── test/
├── package.json
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0+)
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/aikira-genesis-protocol.git
cd aikira-genesis-protocol
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open your browser and navigate to http://localhost:3000

### Building for Production

```bash
npm run build
```

### Deploying to Vercel

```bash
vercel
```

## NFT Reward System

Upon completing all five chapters, players earn an NFT that represents their accomplishment. This NFT contains:
- Player wallet (or handle)
- Date of completion
- Scene graphic
- "Value: Redeemable for X $AIKIRA"

Players can choose to:
1. Keep the NFT as proof of completion
2. Burn the NFT to claim $AIKIRA tokens

## Development Progress

- [x] Project setup
- [x] Game engine implementation
- [x] Character development
- [x] Chapter 1: Cryptic Wall puzzle
- [x] Chapter 2: Mammoth Shrine puzzle
- [x] Chapter 3: BYTE's Judgment puzzle
- [x] Chapter 4: Encrypted Forest puzzle
- [x] Chapter 5: Genesis Vault puzzle
- [x] NFT integration with Base Network
- [ ] Social features
- [ ] Leaderboard implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the memecoin culture and prehistoric DNA preservation narratives
- Built on Base Network for optimal blockchain integration
- Special thanks to the p5.js community for the powerful creative coding tools

---

Created with 💙 by Canned Oxygen