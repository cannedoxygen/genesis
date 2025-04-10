import React from 'react';
import { 
  RainbowKitProvider, 
  darkTheme, 
  connectorsForWallets 
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { base, baseGoerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

/**
 * WalletConnectProvider component for AIKIRA: GENESIS PROTOCOL
 * 
 * This component wraps the application with wallet connection providers
 * specifically configured for Base Network.
 */
const WalletConnectProvider = ({ children }) => {
  // Get Base Network configuration from window
  const config = window.AIKIRA_CONFIG || {
    baseChainId: 8453,
    baseTestnetChainId: 84531
  };
  
  // Configure the providers
  const { chains, publicClient } = configureChains(
    [base, baseGoerli],
    [
      alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY }),
      publicProvider()
    ]
  );
  
  // Configure the supported wallets
  const connectors = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet({ chains }),
        coinbaseWallet({ chains, appName: 'AIKIRA: GENESIS PROTOCOL' }),
        rainbowWallet({ chains }),
        walletConnectWallet({ chains }),
        injectedWallet({ chains })
      ],
    },
  ]);
  
  // Create wagmi config
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  });
  
  // Custom theme for RainbowKit that matches AIKIRA's design
  const customTheme = darkTheme({
    accentColor: '#00eaff',
    accentColorForeground: '#000',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small'
  });
  
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains} 
        theme={customTheme}
        appInfo={{
          appName: 'AIKIRA: GENESIS PROTOCOL',
          learnMoreUrl: 'https://aikira.io/about',
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletConnectProvider;