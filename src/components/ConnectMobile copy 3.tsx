"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { ChevronRight, X } from "lucide-react";
import { useDeviceContext } from "../utils/DeviceStore";
// import logounisat from '/images/logo-unisat.png';
// import logoxverse from '/images/logo-xverse.jpg';
import {
  MAGIC_EDEN,
  UNISAT,
  useLaserEyes,
  WalletIcon,
  XVERSE,
  SUPPORTED_WALLETS,
  LaserEyesLogo,
} from "@omnisat/lasereyes-react";
 
import { request, RpcErrorCode } from "sats-connect";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { htmlArray, setHtmlArray } from "../globalState";
import idesofmarch from '../lib/collections/idesofmarch.json';

type WalletName = keyof typeof SUPPORTED_WALLETS;

const mobileWallets = [UNISAT, XVERSE, MAGIC_EDEN];
const appName = "Ides of March";  
const nonce = Date.now().toString();
 const browserUrl = "https://my.inscribed.audio";
const mobileWalletDeepLink = {
  unisat: `unisat://request?method=connect&from=${appName}&nonce=${nonce}`,
  xverse: `https://connect.xverse.app/browser?url=${encodeURIComponent(browserUrl)}`,
  magiceden: "https://magiceden.io/app",
};

interface ConnectWalletProps {
  className?: string;
}

const idesOfMarchIDs = idesofmarch.map((item) => item.id);
 
function checkIOMOwnership(insID) {
  return idesOfMarchIDs.includes(insID);
}

const WalletButton = ({deeplink, wallet, hasWallet, onConnect }: { deeplink: any, wallet: any, hasWallet: any, onConnect: (wallet: WalletName) => void  }) => {
  const isConnected = hasWallet[wallet.name];
  const isMissingWallet = !hasWallet[wallet.name];

  
  return (
    <Button
      key={wallet.name}
      onClick={isMissingWallet ? undefined : () => onConnect(wallet.name)}
      variant="ghost"
      className={cn("w-full bg-white bg-base-100", "hover:bg-gray-50 dark:hover:bg-gray-700", "text-black dark:text-white", "font-normal justify-between", "h-[60px] text-base rounded-xl px-4", "border border-gray-100 dark:border-gray-700", "transition-colors duration-200", "group")}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-[32px] min-h-[32px] w-[32px] h-[32px] flex items-center justify-center">
          <WalletIcon size={32} walletName={wallet} className="!w-[32px] !h-[32px]" />
        </div>
        <span className="text-lg">{wallet.replace(/[-_]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")}</span>
      </div>
      {hasWallet[wallet.name] ? (
        <div className="flex items-center">
          <div className="flex items-center gap-2 group-hover:hidden">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Installed</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 hidden group-hover:block" />
        </div>
      ) : (
        <a href={deeplink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:text-blue-600" onClick={(e) => e.stopPropagation()}>
          <ChevronRight className="w-4 h-4" />
          <span className="text-sm">Connect</span>
        </a>
      )}
    </Button>
  );
};

export default function ConnectWallet({ className }: ConnectWalletProps) {
  const { connect, disconnect, isConnecting, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletName, setIsWalletName] = useState('');
  const [htmlInscriptions, setHtmlInscriptions] = useState([]);
  const navigate = useNavigate();
  const { isMobile } = useDeviceContext();


  const [hasWallet, setHasWallet] = useState({
    unisat: false,
    xverse: false,
    [MAGIC_EDEN]: false,
  });

  useEffect(() => {
    setHasWallet({
      unisat: hasUnisat,
      xverse: hasXverse,
      [MAGIC_EDEN]: hasMagicEden,
    });
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
    
    console.log("magic eden");
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

  const handleConnect = async (walletName: WalletName) => {
    if (provider === walletName) {
      await disconnect();
    } else {
      setIsOpen(false);
      await connect(walletName);
      if (walletName === UNISAT) {
        window.open(mobileWalletDeepLink.unisat);
        getUnisatInscriptions();
      } else if (walletName === XVERSE) {
        window.open(mobileWalletDeepLink.xverse);
        getXverseInscriptions();
      }

      setHtmlArray(htmlInscriptions);
      console.log("mobile",htmlInscriptions);
      navigate('/mymedia');
       
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button
          onClick={() => disconnect()}
          className={cn("btn btn-ghost mb-4 text-black dark:text-white font-bold py-6 px-12 rounded-lg", "transition duration-300", "bg-white bg-base-100", "hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700", className)}
        >
          Disconnect
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button
            className={cn("btn btn-ghost mb-4 text-black dark:text-white font-bold py-6 px-12 rounded-lg", "transition duration-300", "bg-white bg-base-100", "hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700", className)}
          >
            {isConnecting ? "Connecting..." : "Connect Mobile Wallet"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className={cn("bg-white dark:bg-gray-900 border-none", "text-black dark:text-white rounded-3xl mx-auto", "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", "w-[380px] max-h-[560px]", "flex flex-col overflow-hidden p-0")}>
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-center text-[22px] font-medium text-black dark:text-white">Connect Mobile Wallet</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-2 w-full p-2 ">
        {/* <WalletButton deeplink={mobileWalletDeepLink.unisat} wallet="unisat" hasWallet={hasWallet} onConnect={handleConnect} />
          <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet="xverse" hasWallet={hasWallet} onConnect={handleConnect} /> */}

        <button className="wallet-btn flex items-center gap-2" onClick={() => handleConnect(UNISAT)}>
          <WalletIcon size={32} walletName={UNISAT}  /> <span className="text-lg">Connect Unisat</span>
        </button>
        <button className="wallet-btn flex items-center gap-2" onClick={() => handleConnect(XVERSE)}>
          <WalletIcon size={32} walletName={XVERSE}  /> <span className="text-lg">Connect XVERSE</span>
        </button>

          </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
