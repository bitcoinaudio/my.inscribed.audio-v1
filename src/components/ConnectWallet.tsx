"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';  
import { Button } from "./ui/button";
import {
  MAGIC_EDEN,
  useLaserEyes,
  WalletIcon,
  SUPPORTED_WALLETS,
  ProviderType,
} from "@omnisat/lasereyes";
import { request } from "sats-connect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { setIinscriptionArray } from "../globalState";
import idesofmarch from '../lib/collections/idesofmarch.json';
import dust from '../lib/collections/dust.json';

// Types
type WalletName = keyof typeof SUPPORTED_WALLETS;

interface HtmlInscription {
  id: string;
  isIOM: boolean;
  isDust: boolean;
  contentType?: string;
  isEnhanced: boolean;
  attributes?: any;
  isBRC420: boolean;
  brc420Url?: string;
  isBitmap?: boolean;
  bitmap?: string;
}

const ConnectWallet = ({ className }: { className?: string }) => {
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const { connectWallet, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletName, setIsWalletName] = useState('');
  const [hasWallet, setHasWallet] = useState({ unisat: false, xverse: false, [MAGIC_EDEN]: false });
  const [htmlInscriptions, setHtmlInscriptions] = useState<HtmlInscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isValidBitmap, setIsValidBitmap] = useState(false);

  // Match the original code's approach for collection lookups
  const idesOfMarchIDs = idesofmarch.map((item) => item.id);
  const dustIDs = dust.map((item) => item.id);

  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

  function checkIOMOwnership(insID: string) {
    return idesOfMarchIDs.includes(insID);
  }
  
  function checkDustOwnership(insID: string) {
    return dustIDs.includes(insID);
  }
  
  function checkEnhancedInscription(insID: string) {
    return idesOfMarchIDs.includes(insID) || dustIDs.includes(insID);
  } 
  
  function getAttrbutes(insID: string) {
    const matchedItem = idesofmarch.find(item => item.id === insID);
    return matchedItem ? matchedItem.meta.attributes : null;
  }

  async function getBRC420(inscriptionId: string) {
    try {
      const response = await fetch(`https://radinals.bitcoinaudio.co/content/${inscriptionId}`, {
        headers: {
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      return text.trim().startsWith('/content/')
        ? { isBRC420: true, brc420Url: `https://radinals.bitcoinaudio.co${text.trim()}` }
        : { isBRC420: false, brc420Url: '' };
    } catch (error) {
      console.error("Error fetching BRC420:", error);
      return { isBRC420: false, brc420Url: '' };
    }
  }

  async function getBitmap(inscriptionId: string) {
    const regexBitmap = /^(?:0|[1-9][0-9]*).bitmap$/;
    try {
      const response = await fetch(`https://radinals.bitcoinaudio.co/content/${inscriptionId}`, {
        headers: {
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      const bitmapText = regexBitmap.test(text);
       
      if(bitmapText) {
        const inscriptionParts = text.split(".");
        console.log("bitmapText", inscriptionParts);
        return bitmapText
          ? { isBitmap: true, bitmap: inscriptionParts[0], valid: isValidBitmap }
          : { isBitmap: false, bitmap: '' };
      }
      return { isBitmap: false, bitmap: '' };
    } catch (error) {
      console.error("Error fetching Bitmap:", error);
      return { isBitmap: false, bitmap: '' };
    }
  }

  async function checkifDelegate(inscriptionId: string) {
    try {
      const response = await fetch(`https://radinals.bitcoinaudio.co/inscription/${inscriptionId}`, {
        headers: {
          "Accept": "application/json"
        }
      });
      const text = await response.text();
      console.log("checkifDelegate", response);
      return text
        ? { isDelegate: true, delegateUrl: `https://radinals.bitcoinaudio.co${text.trim()}` }
        : { isDelegate: false, delegateUrl: '' };
    } catch (error) {
      console.error("Error fetching BRC420:", error);
      return { isDelegate: false, delegateUrl: '' };
    }
  }

  const processInscriptions = async (rawInscriptions) => {
    try {
      const processedInscriptions = await Promise.all(
        rawInscriptions.map(async (inscription) => {
          const brc420Data = await getBRC420(inscription.inscriptionId);
          const bmp = await getBitmap(inscription.inscriptionId);
          // console.log("bmp", bmp);
          
          if(checkIOMOwnership(inscription.inscriptionId)) {
            return {
              id: inscription.inscriptionId,
              isIOM: checkIOMOwnership(inscription.inscriptionId),
              isDust: checkDustOwnership(inscription.inscriptionId),
              contentType: inscription.contentType,
              isEnhanced: checkEnhancedInscription(inscription.inscriptionId),
              attributes: getAttrbutes(inscription.inscriptionId),
              // isDelegate: checkifDelegate(inscription.inscriptionId),
              ...bmp,
              ...brc420Data,
            };
          } else {
            return {
              id: inscription.inscriptionId,
              isIOM: checkIOMOwnership(inscription.inscriptionId),
              isDust: checkDustOwnership(inscription.inscriptionId),
              contentType: inscription.contentType,
              isEnhanced: checkEnhancedInscription(inscription.inscriptionId),
              attributes: null,
              // isDelegate: checkifDelegate(inscription.inscriptionId),
              ...bmp,
              ...brc420Data,
            };
          }
        })
      );

      const filteredInscriptions = processedInscriptions.filter(Boolean);
      setHtmlInscriptions(filteredInscriptions);
      setIinscriptionArray([...filteredInscriptions]);
      
      return filteredInscriptions;
    } catch (error) {
      console.error("Error processing inscriptions:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getUnisatInscriptions = async () => {
    try {
      setIsLoading(true);
      // Clear previous data - important for correct operation
      setIinscriptionArray([]);
      setHtmlInscriptions([]);
      
      const res = await window['unisat'].getInscriptions(0, 100);
      console.log("Response from getInscriptions:", res);
      if (!res || !res.list) {
        console.error("Invalid response from UniSat API");
        return [];
      }

      return await processInscriptions(res.list);
    } catch (error) {
      console.error("Error fetching UniSat inscriptions:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getXverseInscriptions = async () => {
    try {
      setIsLoading(true);
      // Clear previous data - important for correct operation
      setIinscriptionArray([]);
      setHtmlInscriptions([]);
      
      const response = await request('wallet_connect', null);
      if (response.status !== 'success') return [];

      for (const address of response.result.addresses) {
        if (address.addressType === 'p2tr') {
          const inscriptions = await request('ord_getInscriptions', { offset: 0, limit: 100 });
          if (inscriptions.status === 'success') {
            return await processInscriptions(inscriptions.result.inscriptions);
          }
        }
      }
      return [];
    } catch (error) {
      console.error("Error fetching Xverse inscriptions:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (walletName: WalletName) => {
    // Disconnect case - matches original logic
    if (provider === walletName) {
      disconnectWallet();
      disconnect();
      setIinscriptionArray([]);
      setHtmlInscriptions([]);
      setIsConnected(false);
      navigate('/');
      return;
    }

    setIsOpen(false);
    setIsLoading(true);
    try {
      // Connect wallet first
      await connect(walletName as never);
      connectWallet();
      setIsConnected(true);
      
      // Then fetch inscriptions based on wallet type
      switch (walletName) {
        case 'unisat':
          await getUnisatInscriptions();
          break;
        case 'xverse':
          await getXverseInscriptions();
          break;
      }
      
      navigate('/mymedia');
    } catch (error) {
      console.error(`Error connecting to ${walletName}:`, error);
      // Only disconnect if connection was attempted but failed
      if (isConnected) {
        disconnectWallet();
        disconnect();
        setIsConnected(false);
      }
      setIsLoading(false);
    }
  };

  const buttonClass = cn(
    "btn btn-ghost text-black dark:text-white font-bold rounded-lg transition duration-300 w-full mb-2",
    "bg-white dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700 w-full mb-2",
    isLoading && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button 
          onClick={() => handleConnect(provider)} 
          className={buttonClass}
          disabled={isLoading}
        >
          <WalletIcon 
            size={32} 
            walletName={provider as ProviderType} 
            className="!w-[32px] !h-[32px]" 
          />
          Disconnect <span className="text-lg">{address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''}</span>
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button className={buttonClass} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-white dark:bg-gray-800 border-none text-black dark:text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle>Connect Desktop Wallet</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {Object.values(SUPPORTED_WALLETS).map(wallet => (
            hasWallet[wallet.name] && (
              <Button 
                key={wallet.name} 
                onClick={() => handleConnect(wallet.name)} 
                className={buttonClass}
                disabled={isLoading}
              >
                <WalletIcon size={24} walletName={wallet.name} /> Connect 
              </Button>
            )
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;