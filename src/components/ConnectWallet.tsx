"use client";
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';  
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import {
  MAGIC_EDEN,
  UNISAT,
  useLaserEyes,
  WalletIcon,
  XVERSE,
  SUPPORTED_WALLETS,
  LaserEyesLogo,
  ProviderType,
} from "@omnisat/lasereyes";

import { AddressPurpose, BitcoinNetworkType, request, RpcErrorCode } from "sats-connect";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { htmlArray, setHtmlArray } from "../globalState";
import idesofmarch from '../lib/collections/idesofmarch.json';

type WalletName = keyof typeof SUPPORTED_WALLETS;
let htmlarray = [];

const idesOfMarchIDs = idesofmarch.map((item) => item.id);
 
function checkIOMOwnership(insID) {
  return idesOfMarchIDs.includes(insID);
}

interface ConnectWalletProps {
  className?: string;
}

const WalletButton = memo(({ wallet, hasWallet, onConnect }: { wallet: any; hasWallet: any; onConnect: (wallet: WalletName) => void }) => {
const isConnected = hasWallet[wallet.name];

  return (
    <Button
      key={wallet.name}
      onClick={isConnected ? () => onConnect(wallet.name) : undefined}
      variant="ghost"
      className={cn(
        "w-full bg-white dark:bg-gray-800", 
        "text-black dark:text-white", 
        "font-normal justify-between", 
        "h-[60px] text-base rounded-xl px-4", 
        "border border-gray-100 dark:border-gray-700", 
        "hover:bg-gray-50 dark:hover:bg-gray-700", 
        "transition-colors duration-200", 
        "group"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-[32px] min-h-[32px] w-[32px] h-[32px] flex items-center justify-center">
          <WalletIcon size={32} walletName={wallet.name} className="!w-[32px] !h-[32px]" />
        </div>
        <span className="text-lg">
          {wallet.name
            .replace(/[-_]/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")}
        </span>
      </div>
      {isConnected ? (
        <div className="flex items-center">
          <div className="flex items-center gap-2 group-hover:hidden">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Installed</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 hidden group-hover:block" />
        </div>
      ) : (
        <a
          href={wallet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronRight className="w-4 h-4" />
          <span className="text-sm">Install</span>
        </a>
      )}
    </Button>
  );
});

const ConnectWallet = ({ className }: ConnectWalletProps) => {
  const { connect, disconnect, isConnecting, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const { isWalletConnected, connectWallet, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletName, setIsWalletName] = useState('');
  const [hasWallet, setHasWallet] = useState({ unisat: false, xverse: false, [MAGIC_EDEN]: false });
  const [htmlInscriptions, setHtmlInscriptions] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);
   
  const getUnisatInscriptions = async () => {
    setHtmlArray([]);
    setHtmlInscriptions([]);
     try {
      const res = await window[isWalletName].getInscriptions();
      console.log("Response from getInscriptions:", res);

      if (res) {
        res.list.forEach((inscription) => {
           if (inscription.contentType === 'text/html;charset=utf-8') {
             htmlInscriptions.push({id: inscription.inscriptionId, isIOM: checkIOMOwnership(inscription.inscriptionId)} as never);
 
          }
        });
       }
       console.log("htmlArray", htmlArray);
     } catch (error) {
      console.error("Error fetching Unisat inscriptions:", error);
    }
    setHtmlArray(htmlInscriptions);
  };


  const getXverseTotal = async () => {
    const xverseTotal = await request('ord_getInscriptions', { offset: 0, limit: 1 });
    if (xverseTotal.status === 'success') {
      return xverseTotal.result.total;
    }
    return 0;
  }


  const getXverseInscriptions = async () => {
   
    const limit = await getXverseTotal();
    setHtmlArray([]);
    setHtmlInscriptions([]);
    console.log("getXverseInscriptions", htmlArray);
     try {
       const response = await request('wallet_connect', null);
      if (response.status === 'success') {
        for (const address of response.result.addresses) {
          if (address.addressType === 'p2tr') { 
            const inscriptions = await request('ord_getInscriptions', { offset: 0, limit: limit });
            if (inscriptions.status === 'success') {
              inscriptions.result.inscriptions.forEach((inscription) => {
                console.log("inscription", inscription);
                if (inscription.contentType === "text/html;charset=utf-8") {
                   htmlInscriptions.push({id: inscription.inscriptionId, isIOM: checkIOMOwnership(inscription.inscriptionId)} as never);
                }
              });
             }
          }
        }
       } else {

        if (response.error?.code === RpcErrorCode.USER_REJECTION) {
          console.log('User rejected permissions request.');
        } else {
          console.error('Error connecting wallet:', response.error);
        }

      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
    }
    setHtmlArray(htmlInscriptions);
  };

  const getMagicEdenInscriptions = async () => {
    const response = await request('ord_getInscriptions', { offset: 0, limit: 100 });
    if (response.status === 'success') {
      response.result.inscriptions.forEach((inscription) => {
        if (inscription.contentType === "text/html;charset=utf-8") {
          htmlInscriptions.push({id: inscription.inscriptionId, isIOM: checkIOMOwnership(inscription.inscriptionId)} as never);
        }
      });
    }
     console.log("magic eden", response);
  };
  
  const handleConnect = async (walletName: WalletName) => {
     if (provider === walletName) {
       disconnectWallet();
       disconnect();
      console.log(provider + " disconnected");
      setHtmlArray([]);
      setHtmlInscriptions([]);
      navigate('/');
       
    } else {
      setIsOpen(false);
      await connect(walletName);
      connectWallet();
      setIsWalletName(walletName);
      
       switch (walletName) {
        case 'unisat':
          await getUnisatInscriptions();
           console.log("Connected to Unisat", walletName);
          break;
        case 'xverse':
          await getXverseInscriptions();
           console.log("Connected to Xverse", walletName);
          break;
        case MAGIC_EDEN:
          await getMagicEdenInscriptions();
           console.log("Connected to Magic Eden", walletName);
          break;
        default:
          console.warn("Unknown wallet name:", walletName);
      }
      setHtmlArray(htmlInscriptions);
      navigate('/mymedia');
      console.log("handleConnect htmlArray", htmlArray);
      console.log("handleConnect htmlInscriptions", htmlInscriptions);

    }
    
  
};
  const buttonClass = cn(
    "btn btn-ghost text-black dark:text-white font-bold rounded-lg transition duration-300",
    "bg-white dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700",
    className
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button onClick={() => handleConnect(provider)} className={buttonClass}>
          <div className="flex items-center gap-2">
            <WalletIcon size={32} walletName={provider as ProviderType} className="!w-[32px] !h-[32px]" />
            Disconnect
          </div>          <span className="text-lg">{address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''}</span>

        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button className={buttonClass}>
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-white dark:bg-gray-800 border-none text-black dark:text-white rounded-2xl  fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  max-h-[560px] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-center text-[22px] font-medium text-black dark:text-white">Connect Desktop Wallet</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6">
          <DialogDescription className="flex flex-col gap-2 w-full">

            {Object.values(SUPPORTED_WALLETS).map((wallet) => (
              hasWallet[wallet.name] && (
              <WalletButton key={wallet.name} wallet={wallet} hasWallet={hasWallet} onConnect={handleConnect} />
              )
            ))}
            
          </DialogDescription>
        </div>

        <div className="w-full bg-gray-50 dark:bg-gray-800 p-4 pt-5 border-t border-gray-200 dark:border-gray-800 group relative">
          <div className="text-gray-500 dark:text-gray-400 text-sm text-center transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0">
            <a href="https://www.lasereyes.build/" target="_blank" rel="noopener noreferrer">
              Powered by LaserEyes
            </a>
          </div>
          <div className="absolute top-5 left-0 right-0 transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100">
            <a href="https://www.lasereyes.build/" target="_blank" rel="noopener noreferrer" className="flex justify-center">
              <LaserEyesLogo width={48} color={"blue"} />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
