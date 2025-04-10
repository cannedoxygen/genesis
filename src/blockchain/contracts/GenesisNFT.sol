// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GenesisNFT
 * @dev NFT contract for AIKIRA: GENESIS PROTOCOL
 * - Players earn NFTs upon completing the game
 * - NFTs can be burned to claim $AIKIRA tokens
 * - Deployed on Base Network
 * - Works with existing $AIKIRA token at 0xa884C16a93792D1E0156fF4C8A3B2C59b8d04C9A
 */
contract GenesisNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    // $AIKIRA token contract
    IERC20 public aikinaToken;
    
    // Base URI for IPFS
    string private _baseTokenURI;
    
    // Amount of $AIKIRA tokens to mint per NFT burn (5,000 tokens)
    uint256 public tokenRewardAmount = 5000 * 10**18; // Assuming 18 decimals
    
    // Token rewards wallet (needs to be funded with $AIKIRA tokens)
    address public rewardsWallet;
    
    // Mapping to track burned tokens
    mapping(uint256 => bool) public tokenBurned;
    
    // Emit when NFT is burned for $AIKIRA tokens
    event NFTBurnedForTokens(address indexed owner, uint256 tokenId, uint256 tokenAmount);
    
    // Game completion record
    mapping(address => bool) public hasCompletedGame;
    
    // Base Network specific
    address public constant AIKIRA_TOKEN_ADDRESS = 0xa884C16a93792D1E0156fF4C8A3B2C59b8d04C9A;
    
    /**
     * @dev Constructor
     * @param name NFT collection name
     * @param symbol NFT symbol
     * @param baseURI Base URI for token metadata
     * @param _rewardsWallet Address of wallet containing $AIKIRA tokens for rewards
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address _rewardsWallet
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
        aikinaToken = IERC20(AIKIRA_TOKEN_ADDRESS);
        rewardsWallet = _rewardsWallet;
        
        // Validate rewards wallet
        require(_rewardsWallet != address(0), "Rewards wallet cannot be zero address");
    }
    
    /**
     * @dev Sets the base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Returns the base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Sets the token reward amount per NFT
     * @param rewardAmount New reward amount
     */
    function setTokenRewardAmount(uint256 rewardAmount) external onlyOwner {
        tokenRewardAmount = rewardAmount;
    }
    
    /**
     * @dev Sets the rewards wallet address
     * @param _rewardsWallet New rewards wallet address
     */
    function setRewardsWallet(address _rewardsWallet) external onlyOwner {
        require(_rewardsWallet != address(0), "Rewards wallet cannot be zero address");
        rewardsWallet = _rewardsWallet;
    }
    
    /**
     * @dev Mints a new Genesis NFT
     * @param to Address to mint the NFT to
     * @param uri Token URI for metadata
     * @return tokenId The ID of the minted NFT
     */
    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        // Check if user has already completed the game
        require(!hasCompletedGame[to], "User has already claimed a Genesis NFT");
        
        // Increment token counter
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Mark user as having completed the game
        hasCompletedGame[to] = true;
        
        return tokenId;
    }
    
    /**
     * @dev Burns an NFT to claim $AIKIRA tokens
     * @param tokenId ID of the NFT to burn
     */
    function burnForTokens(uint256 tokenId) external nonReentrant {
        // Check if sender owns the token
        require(ownerOf(tokenId) == msg.sender, "Caller is not the token owner");
        
        // Check if token has not been burned before
        require(!tokenBurned[tokenId], "Token has already been burned");
        
        // Check if rewards wallet has sufficient tokens
        require(
            aikinaToken.balanceOf(rewardsWallet) >= tokenRewardAmount,
            "Insufficient tokens in rewards wallet"
        );
        
        // Check if contract has allowance to transfer tokens
        require(
            aikinaToken.allowance(rewardsWallet, address(this)) >= tokenRewardAmount,
            "Insufficient allowance for rewards"
        );
        
        // Mark token as burned
        tokenBurned[tokenId] = true;
        
        // Burn the NFT
        _burn(tokenId);
        
        // Transfer $AIKIRA tokens from rewards wallet to caller
        require(
            aikinaToken.transferFrom(rewardsWallet, msg.sender, tokenRewardAmount),
            "Token transfer failed"
        );
        
        // Emit event
        emit NFTBurnedForTokens(msg.sender, tokenId, tokenRewardAmount);
    }
    
    /**
     * @dev Alternative claim method if rewards wallet approval isn't possible
     * Only contract owner can execute this function
     * @param tokenId ID of the NFT to burn
     * @param to Address to send tokens to (must be token owner)
     */
    function adminProcessBurn(uint256 tokenId, address to) external onlyOwner {
        // Check if recipient owns the token
        require(ownerOf(tokenId) == to, "Recipient is not the token owner");
        
        // Check if token has not been burned before
        require(!tokenBurned[tokenId], "Token has already been burned");
        
        // Mark token as burned
        tokenBurned[tokenId] = true;
        
        // Burn the NFT
        _burn(tokenId);
        
        // Emit event
        emit NFTBurnedForTokens(to, tokenId, tokenRewardAmount);
    }
    
    /**
     * @dev Allows admin to mint NFTs to multiple addresses (for special events or airdrops)
     * @param addresses Array of addresses to mint NFTs to
     * @param uris Array of token URIs for metadata
     */
    function batchMint(address[] calldata addresses, string[] calldata uris) external onlyOwner {
        require(addresses.length == uris.length, "Array lengths must match");
        
        for (uint256 i = 0; i < addresses.length; i++) {
            // Skip addresses that have already completed the game
            if (!hasCompletedGame[addresses[i]]) {
                safeMint(addresses[i], uris[i]);
            }
        }
    }
    
    /**
     * @dev Returns whether a user has completed the game
     * @param user Address of the user
     * @return hasCompleted Whether the user has completed the game
     */
    function userHasCompletedGame(address user) external view returns (bool) {
        return hasCompletedGame[user];
    }
    
    /**
     * @dev Returns the total number of minted tokens
     * @return count Total token count
     */
    function getTotalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Emergency function to recover any ERC20 tokens sent to this contract
     * @param tokenAddress Address of the token contract
     * @param to Address to send the tokens to
     * @param amount Amount of tokens to send
     */
    function recoverERC20(address tokenAddress, address to, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).transfer(to, amount);
    }
    
    /**
     * @dev Check if the rewards wallet has sufficient tokens and allowance
     * @return hasBalance Whether the wallet has sufficient balance
     * @return hasAllowance Whether the wallet has granted sufficient allowance
     * @return balance The current balance of the rewards wallet
     * @return allowance The current allowance granted to this contract
     */
    function checkRewardsStatus() external view returns (
        bool hasBalance,
        bool hasAllowance,
        uint256 balance,
        uint256 allowance
    ) {
        balance = aikinaToken.balanceOf(rewardsWallet);
        allowance = aikinaToken.allowance(rewardsWallet, address(this));
        
        hasBalance = balance >= tokenRewardAmount;
        hasAllowance = allowance >= tokenRewardAmount;
    }
}