import React, { createContext, useState, useContext } from 'react';
 
const WalletContext = createContext({
    isWalletConnected: false,
    connectWallet: () => {},
    disconnectWallet: () => {}
  });

export const WalletProvider = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const connectWallet = () => setIsWalletConnected(true);
  const disconnectWallet = () => setIsWalletConnected(false);
    

  return (
    <WalletContext.Provider value={{ isWalletConnected, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
