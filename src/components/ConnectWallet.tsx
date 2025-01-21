"use client";
import React, { useState, useEffect, memo } from "react";
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

type WalletName = keyof typeof SUPPORTED_WALLETS;

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

  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

       
  const handleConnect = async (walletName: WalletName) => {
    if (provider === walletName) {
      await disconnect();
      disconnectWallet();
      console.log("disconnecting", provider, walletName);

    } else {
      setIsOpen(false);
      await connect(walletName);
      connectWallet();
       if (walletName === 'unisat') {
        setIsWalletName(walletName);
        getUnisatInscriptions();
        console.log("unisat", walletName);
      } else if (walletName === 'xverse') {
        setIsWalletName(walletName);
        getXverseInscriptions();
        console.log("xverse", walletName);
      } else if (walletName === MAGIC_EDEN) {
        setIsWalletName(walletName);
        getMagicEdenInscriptions();
        console.log("magic eden", walletName);
      }

    }
    console.log("isWalletConnected", isWalletConnected);

  };
let htmlArray = [];
  const getUnisatInscriptions = async () => {
    htmlArray = [];
    try {
      console.log("isWalletName", isWalletName);
      const res = await window[isWalletName].getInscriptions();
      for (const inscription of res.list) {
        if (inscription.contentType === 'text/html') {  
          htmlArray.push(inscription.inscriptionId);
        }
      }
      console.log("unisat", htmlArray);
    } catch (e) {
      console.log(e);
    }
  };

  const getXverseInscriptions = async () => {
    htmlArray = [];
    try {
      console.log("xverse", isWalletName);
      const response = await request('wallet_connect', null);
      if (response.status === 'success') {
      const response2 = await request('ord_getInscriptions', { offset: 0, limit: 50 });

        for (const address of response.result.addresses) {
          if (address.addressType === 'p2tr') { 
            const inscriptions = response2;
            for (const inscription of inscriptions.result.inscriptions) {
              console.log("xverse", inscription.inscriptionId)
              console.log("xverse", inscription.contentType);
              htmlArray.push(inscription.inscriptionId);
            }
            
          }
        }
        console.log("xverse", htmlArray);
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
  };

  const getMagicEdenInscriptions = async () => {
    htmlArray = [];
     

    
    console.log("magic eden");
  };
  
  
  const buttonClass = cn(
    "btn btn-ghost text-black dark:text-white font-bold rounded-lg transition duration-300",
    "bg-white dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700",
    className
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button onClick={() => disconnect()} className={buttonClass}>
          <div className="flex items-center gap-2">
            <WalletIcon size={32} walletName={provider as ProviderType} className="!w-[32px] !h-[32px]" />
            Disconnect
          </div>
          <span className="text-lg">{address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''}</span>
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
          <DialogTitle className="text-center text-[22px] font-medium text-black dark:text-white">Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6">
          <DialogDescription className="flex flex-col gap-2 w-full">
            {Object.values(SUPPORTED_WALLETS).map((wallet) => (
              <WalletButton key={wallet.name} wallet={wallet} hasWallet={hasWallet} onConnect={handleConnect} />
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
