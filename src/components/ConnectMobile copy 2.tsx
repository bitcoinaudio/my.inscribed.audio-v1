"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { useDeviceContext } from "../utils/DeviceStore";
import {
  MAGIC_EDEN,
  UNISAT,
  useLaserEyes,
  WalletIcon,
  XVERSE,
} from "@omnisat/lasereyes-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { htmlArray, setHtmlArray } from "../globalState";
import idesofmarch from '../lib/collections/idesofmarch.json';

const appName = encodeURIComponent("Ides of March");
const nonce = Date.now().toString();

const mobileWalletDeepLink = {
  unisat: `unisat://request?method=connect&from=${appName}&nonce=${nonce}`,
  xverse: `https://connect.xverse.app/browser?url=${encodeURIComponent(window.location.origin + '/mymedia')}`,
  magiceden: "https://magiceden.io/app",
};

const idesOfMarchIDs = idesofmarch.map((item) => item.id);
const checkIOMOwnership = (insID) => idesOfMarchIDs.includes(insID);

interface ConnectWalletProps {
  className?: string;
}

const WalletButton = ({ deeplink, wallet, hasWallet, onConnect }) => {
  const isMissingWallet = !hasWallet[wallet];

  return (
    <Button
      key={wallet}
      onClick={isMissingWallet ? undefined : () => onConnect(wallet)}
      variant="ghost"
      className={cn(
        "w-full bg-white bg-base-100 hover:bg-gray-50 dark:hover:bg-gray-700",
        "text-black dark:text-white font-normal justify-between",
        "h-[60px] text-base rounded-xl px-4 border border-gray-100 dark:border-gray-700 transition-colors duration-200 group"
      )}
    >
      <div className="flex items-center gap-3">
        <WalletIcon size={32} walletName={wallet} className="!w-[32px] !h-[32px]" />
        <span className="text-lg capitalize">{wallet.replace(/[-_]/g, " ")}</span>
      </div>
      {hasWallet[wallet] ? (
        <div className="flex items-center">
          <div className="flex items-center gap-2 group-hover:hidden">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Installed</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 hidden group-hover:block" />
        </div>
      ) : (
        <a href={deeplink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
          <ChevronRight className="w-4 h-4" />
          <span className="text-sm">Install</span>
        </a>
      )}
    </Button>
  );
};

export default function ConnectWallet({ className }: ConnectWalletProps) {
  const { connect, disconnect, isConnecting, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useDeviceContext();

  const hasWallet = {
    unisat: hasUnisat,
    xverse: hasXverse,
    [MAGIC_EDEN]: hasMagicEden,
  };

  const processCallbackResponse = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const wallet = params.get('wallet');
    const inscriptions = params.get('inscriptions');

    if (wallet && inscriptions) {
      try {
        const parsedInscriptions = JSON.parse(decodeURIComponent(inscriptions));
        const filteredInscriptions = parsedInscriptions.map(ins => ({
          id: ins.inscriptionId,
          isIOM: checkIOMOwnership(ins.inscriptionId),
        }));

        setHtmlArray(filteredInscriptions);
        console.log(`Received inscriptions from ${wallet}:`, filteredInscriptions);
      } catch (error) {
        console.error("Error parsing inscription data:", error);
      }
    }
  }, [location.search]);

  useEffect(() => {
    processCallbackResponse();
  }, [processCallbackResponse]);

  const handleConnect = async (walletName) => {
    if (provider === walletName) {
      await disconnect();
    } else {
      setIsOpen(false);
      window.location.href = mobileWalletDeepLink[walletName];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button
          onClick={() => disconnect()}
          className={cn(
            "btn btn-ghost mb-4 text-black dark:text-white font-bold py-6 px-12 rounded-lg transition duration-300",
            "bg-white bg-base-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700",
            className
          )}
        >
          Disconnect
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button
            className={cn(
              "btn btn-ghost mb-4 text-black dark:text-white font-bold py-6 px-12 rounded-lg transition duration-300",
              "bg-white bg-base-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700",
              className
            )}
          >
            {isConnecting ? "Connecting..." : "Connect Mobile Wallet"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className={cn(
        "bg-white dark:bg-gray-900 border-none text-black dark:text-white rounded-3xl mx-auto",
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
        "w-[380px] max-h-[560px] flex flex-col overflow-hidden p-0"
      )}>
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-center text-[22px] font-medium">Connect Mobile Wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 w-full p-2">
          <WalletButton deeplink={mobileWalletDeepLink.unisat} wallet="unisat" hasWallet={hasWallet} onConnect={handleConnect} />
          <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet="xverse" hasWallet={hasWallet} onConnect={handleConnect} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
