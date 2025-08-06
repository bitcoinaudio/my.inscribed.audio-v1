import { useState, useEffect, createContext, useContext } from 'react';
import { MAINNET, TESTNET4, TESTNET, REGTEST, SIGNET } from '@omnisat/lasereyes-core';

const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

// Network configuration mapping
const NETWORK_CONFIG = {
  mainnet: {
    name: 'mainnet',
    display: 'Bitcoin Mainnet',
    laserEyesNetwork: MAINNET,
    rpcPort: 8332,
    isTestnet: false,
  },
  testnet4: {
    name: 'testnet4',
    display: 'Bitcoin Testnet4',
    laserEyesNetwork: TESTNET4,
    rpcPort: 48332,
    isTestnet: true,
  },
  testnet: {
    name: 'testnet',
    display: 'Bitcoin Testnet',
    laserEyesNetwork: TESTNET,
    rpcPort: 18332,
    isTestnet: true,
  },
  regtest: {
    name: 'regtest',
    display: 'Bitcoin Regtest',
    laserEyesNetwork: REGTEST,
    rpcPort: 18443,
    isTestnet: true,
  },
  signet: {
    name: 'signet',
    display: 'Bitcoin Signet',
    laserEyesNetwork: SIGNET,
    rpcPort: 38332,
    isTestnet: true,
  },
};

export const NetworkProvider = ({ children }) => {
  // Get initial network from environment variable or default to testnet4
  const getInitialNetwork = () => {
    const envNetwork = import.meta.env.VITE_BITCOIN_NETWORK?.toLowerCase();
    return envNetwork && NETWORK_CONFIG[envNetwork] ? envNetwork : 'testnet4';
  };

  const [currentNetwork, setCurrentNetwork] = useState(getInitialNetwork);
  const [backendNetwork, setBackendNetwork] = useState(null);

  // Check backend network on startup
  useEffect(() => {
    const checkBackendNetwork = async () => {
      try {
        const response = await fetch('/api/network');
        if (response.ok) {
          const data = await response.json();
          setBackendNetwork(data);
          console.log('🌐 Backend network:', data.network);
          
          // Warn if frontend and backend networks don't match
          if (data.network !== currentNetwork) {
            console.warn(`⚠️ Network mismatch: Frontend (${currentNetwork}) vs Backend (${data.network})`);
          }
        }
      } catch (error) {
        console.error('Failed to check backend network:', error);
      }
    };

    checkBackendNetwork();
  }, [currentNetwork]);

  const switchNetwork = (networkName) => {
    if (NETWORK_CONFIG[networkName]) {
      setCurrentNetwork(networkName);
      localStorage.setItem('bitcoin_network', networkName);
      
      // Show warning for network switches
      if (networkName === 'mainnet') {
        console.warn('🚨 Switched to MAINNET - Real Bitcoin transactions!');
      } else {
        console.log(`🔄 Switched to ${NETWORK_CONFIG[networkName].display}`);
      }
    }
  };

  const config = NETWORK_CONFIG[currentNetwork];

  const value = {
    currentNetwork,
    config,
    backendNetwork,
    switchNetwork,
    availableNetworks: Object.keys(NETWORK_CONFIG),
    isMainnet: currentNetwork === 'mainnet',
    isTestnet: config.isTestnet,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

// Helper hook for LaserEyes configuration
export const useLaserEyesConfig = () => {
  const { config } = useNetwork();
  return {
    network: config.laserEyesNetwork,
  };
};
