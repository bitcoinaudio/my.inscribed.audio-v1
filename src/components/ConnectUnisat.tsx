import React, { useState, useEffect } from 'react';
import logounisat from '/images/logo-unisat.png';  
import { useNavigate } from 'react-router-dom';
import { WalletIcon } from '@omnisat/lasereyes';  
import idesofmarch from '../lib/collections/idesofmarch.json';

// Mock functions to replace Svelte store handling (for demonstration purposes)
const useWalletConnected = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletUnisatConnected, setWalletUnisatConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const checkIOMOwnership = (insID) => {
    return idesofmarch.some((item) => item.id === insID);
  };

  const [htmlArray, setHtmlArray] = useState([]);

  // Mock connection for mobile and desktop
  const winuni = window.unisat;

 

  useEffect(() => {
    checkWalletConnection();
    // Check if mobile or desktop
    const userAgent = navigator.userAgent;
    setIsMobile(/mobile/i.test(userAgent));
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    setIsAndroid(/Android/i.test(userAgent));
  }, []);

  const handleConnectWallet = async () => {
    if (winuni) {
      try {
        const accounts = await winuni.requestAccounts();
        // Set the accounts in state (you can replace this with a store in a larger app)
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('connectionTime', Date.now().toString());
        setWalletUnisatConnected(true);
        setWalletConnected(true);
        await getMyMedia();
      } catch (error) {
        console.error('Error connecting to UniSat Wallet:', error);
      }
    } else {
      console.warn('UniSat Wallet is not installed or unavailable.');
    }
  };

  const handleDisconnectWallet = () => {
    setHtmlArray([]);
    setWalletUnisatConnected(false);
    setWalletConnected(false);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('connectionTime');
    window.location.href = '/';
  };

  const handleConnectUnisatMobile = () => {
    if (isMobile) {
      const deeplink = `unisat://request?method=connect&from=Inscribed Audio&nonce=${Date.now().toString()}`;
      window.location.href = deeplink;
      setWalletUnisatConnected(true);
      setWalletConnected(true);
      getMyMedia();
    }
  };

  const getMyMedia = async () => {
    if (!walletUnisatConnected) {
      console.log('Wallet not connected, cannot fetch media.');
      return;
    }
    try {
      const limit = 50;
      if (isMobile) {
        const url = new URL(window.location.href);
        const base64Data = url.searchParams.get('data');
        if (base64Data) {
          try {
            const decodedData = atob(base64Data);
            console.log('UniSat returned data:', decodedData);
          } catch (err) {
            console.error('Failed to decode UniSat data:', err);
          }
        }
      } else {
        const walletInscriptions = await winuni.getInscriptions(0, limit);
        if (!walletInscriptions?.list) {
          setHtmlArray([]);
          return;
        }

        const filteredInscriptions = walletInscriptions.list
          .filter((ins) => ins.contentType && ins.contentType.startsWith('text/html'))
          .map((ins) => {
            return { id: ins.inscriptionId, isIOM: checkIOMOwnership(ins.inscriptionId) };
          });
        setHtmlArray(filteredInscriptions);
      }
    } catch (e) {
      console.error('Error fetching media from UniSat:', e);
    }
  };

  return (
    <div className="wallet">
      {walletUnisatConnected ? (
        <button className="wallet-btn" onClick={handleDisconnectWallet}>
          <img className="wallet-logo" src={logounisat} alt="UniSat Logo" /> Disconnect?
        </button>
      ) : isMobile ? (
        <button className="wallet-btn" onClick={handleConnectUnisatMobile}>
          <img className="wallet-logo" src={logounisat} alt="UniSat Logo" /> Connect?
        </button>
      ) : (
        <button className="wallet-btn" onClick={handleConnectWallet}>
          <img className="wallet-logo" src={logounisat} alt="UniSat Logo" /> Connect?
        </button>
      )}
    </div>
  );
};

export default ConnectUnisat;
