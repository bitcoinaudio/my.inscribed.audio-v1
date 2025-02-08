"use client";
import React, { useState, useEffect } from "react";
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
  ProviderType,
} from "@omnisat/lasereyes";
import { request } from "sats-connect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { setHtmlArray } from "../globalState";
import idesofmarch from '../lib/collections/idesofmarch.json';
import { detectMobileAppBrowser, isXverseBrowser } from '../utils/browserCheck';

const mobileWallets = [UNISAT, XVERSE, MAGIC_EDEN];
const appName = "Inscribed Audio";  
const nonce = Date.now().toString();
const browserUrl = "http://localhost:3333/";
const xversebrowserUrl = 'https://dev.inscribed.audio//?inXverse=1';
const unisatbrowserUrl = 'https://dev.inscribed.audio/';
const magicedenbrowserUrl = 'https://dev.inscribed.audio/?inMagicEden=1';
const callbackUrl = 'https://dev.inscribed.audio/myinscriptions?unisat-connected=1';
const text = "sampleText"; // Define the text variable
const type = "sampleType"; // Define the type variable
const data = "[text, type]";
const message = JSON.stringify(data);
const walletResponse = `unisat://response?data=${data}&nonce=${nonce}`;


const mobileWalletDeepLink = {
  // unisat: `unisat://request?method=connect&from=${appName}&nonce=${nonce}`,
  unisat: `unisat://request?method=signMessage&data=${message}from=${appName}&nonce=${nonce}&callbackUrl=${callbackUrl}`,
  xverse: `https://connect.xverse.app/browser?url=${encodeURIComponent(xversebrowserUrl)}`,
  magiceden: `magiceden://connect?from=${appName}&nonce=${nonce}&browserUrl=${encodeURIComponent(magicedenbrowserUrl)}`,
};



type WalletName = keyof typeof SUPPORTED_WALLETS;
const idesOfMarchIDs = idesofmarch.map((item) => item.id);

function checkIOMOwnership(insID: string) {
  return idesOfMarchIDs.includes(insID);
}

interface HtmlInscription {
  id: string;
  isIOM: boolean;
  isBRC420: boolean;
  brc420Url: string;
}

const WalletButton = ({deeplink, wallet, hasWallet, onConnect }: { deeplink: any, wallet: any, hasWallet: any, onConnect: (wallet: WalletName) => void }) => {
  const isConnected = hasWallet[wallet.name];
  const isMissingWallet = !hasWallet[wallet.name];

  return (
    <Button
      key={wallet}
      onClick={isMissingWallet ? undefined : () => onConnect(wallet as WalletName)}
      variant="ghost"
      className={cn(
        "w-full ",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "text-grey-500",
        "font-normal justify-between",
        "h-[60px] text-base rounded-xl px-4",
        "border border-gray-100 dark:border-gray-700",
        "transition-colors duration-200",
        "group"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-[32px] min-h-[32px] w-[32px] h-[32px] flex items-center justify-center">
          <WalletIcon size={32} walletName={wallet} className="!w-[32px] !h-[32px]" />
        </div>
        <span className="text-lg text-grey-500 font-bold">
          {wallet.replace(/[-_]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")}
        </span>
      </div>
      {hasWallet[wallet] ? (
        <div className="flex items-center">
          <div className="flex items-center gap-2 group-hover:hidden">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm ttext-grey-500">Installed</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 hidden group-hover:block" />
        </div>
      ) : (
        <a href={deeplink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-grey-500 hover:text-grey-600" onClick={(e) => e.stopPropagation()}>
          <ChevronRight className="w-4 h-4" />
          <span className="text-sm">Connect</span>
        </a>
      )}
    </Button>
  );
};




const ConnectWallet = ({ className }: { className?: string }) => {
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const { isWalletConnected, connectWallet, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletName, setIsWalletName] = useState('');
  const [hasWallet, setHasWallet] = useState({ unisat: false, xverse: false, [MAGIC_EDEN]: false });
  const [htmlInscriptions, setHtmlInscriptions] = useState<HtmlInscription[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

  const [activeBrowser, setActiveBrowser] = useState(detectMobileAppBrowser());

 

useEffect(() => {
  const browser = detectMobileAppBrowser();
  setActiveBrowser(browser);
  console.log(`Active Browser: ${browser}`);
}, []);



const getBRC420 = async (inscriptionId: string) => {
  try {
    const response = await fetch(`https://ordinals.com/content/${inscriptionId}`);
    const text = await response.text();
    const isBRC420 = text.trim().startsWith('/content/');
    return {
      isBRC420,
      brc420Url: isBRC420 ? `https://ordinals.com${text.trim()}` : ''
    };
  } catch (error) {
    console.error("Error fetching BRC420:", error);
    return { isBRC420: false, brc420Url: '' };
  }
};

  const fetchInscriptions = async (fetchFunction: Function, transformFunction: Function) => {
    try {
      const rawInscriptions = await fetchFunction();
      const processedInscriptions = await Promise.all(
        rawInscriptions.map(transformFunction)
      );
      const filteredInscriptions = processedInscriptions.filter(Boolean);
      setHtmlInscriptions(filteredInscriptions);
      setHtmlArray(filteredInscriptions);
    } catch (error) {
      console.error("Error fetching inscriptions:", error);
    }
  };
  
  const getUnisatInscriptions = async () => {
    
    try {
      setHtmlArray([]);
      setHtmlInscriptions([]);
      const accounts = await window['unisat'].getAccounts();
      console.log("Accounts from UniSat:", accounts);
      const res = await window['unisat'].getInscriptions(0, 100);
      console.log("Response from getInscriptions:", res);
      if (!res || !res.list) {
        console.error("Invalid response from UniSat API");
        return [];
      }

      const processedInscriptions = await Promise.all(
        res.list.map(async (inscription: any) => {
          if (inscription.contentType === "text/html;charset=utf-8" || inscription.contentType === "text/html") {
            const brc420Data = await getBRC420(inscription.inscriptionId);
            return {
              id: inscription.inscriptionId,
              isIOM: checkIOMOwnership(inscription.inscriptionId),
              ...brc420Data,
            };
          }
          return null;
        })
      );

      const filteredInscriptions = processedInscriptions.filter(Boolean);
      setHtmlInscriptions(filteredInscriptions);
      setHtmlArray([...filteredInscriptions]);

      return filteredInscriptions;
    } catch (error) {
      console.error("Error fetching UniSat inscriptions:", error);
      return [];
    }
  };

  const getXverseInscriptions = async () => {
    try {
      const response = await request('wallet_connect', null);
      if (response.status !== 'success') return [];

      for (const address of response.result.addresses) {
        if (address.addressType === 'p2tr') {
          const inscriptions = await request('ord_getInscriptions', { offset: 0, limit: 100 });
          return inscriptions.status === 'success' ? inscriptions.result.inscriptions : [];
        }
      }
    } catch (error) {
      console.error("Error fetching Xverse inscriptions:", error);
    }
    return [];
  };

  const getmagicEdenInscriptions = async () => {
    try {
      const response = await request('wallet_connect', null);
      if (response.status !== 'success') return [];

      for (const address of response.result.addresses) {
        if (address.addressType === 'p2tr') {
          const inscriptions = await request('ord_getInscriptions', { offset: 0, limit: 100 });
          return inscriptions.status === 'success' ? inscriptions.result.inscriptions : [];
        }
      }
    } catch (error) {
      console.error("Error fetching Magic Eden inscriptions:", error);
    }
    return [];
  };

  const handleConnect = async (walletName: WalletName) => {
    if (provider === walletName) {
      disconnectWallet();
      disconnect();
      setHtmlArray([]);
      setHtmlInscriptions([]);
      navigate('/');
      return;
    }

    setIsOpen(false);
    await connect(walletName as never);
    
    connectWallet();
    const browser = detectMobileAppBrowser();

    switch (walletName as never) {
      case 'unisat':
         window.open(mobileWalletDeepLink.unisat);
        await getUnisatInscriptions();
        navigate('/mymedia');
        break;
      case 'xverse':
          window.open(mobileWalletDeepLink.xverse);
        await getXverseInscriptions();
        navigate('/mymedia');
        break;
        case 'magic-eden':
          window.open(mobileWalletDeepLink.magiceden);
         await getmagicEdenInscriptions();
        navigate('/mymedia');
        break;
    }

  };
   const buttonClass = cn(
      "btn btn-ghost text-black dark:text-white font-bold rounded-lg transition duration-300 w-full mb-2",
      "bg-white dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700 w-full mb-2",
      className
    );


    const renderWalletButton = (wallet: WalletName, deeplink: string) => (
      <WalletButton 
        deeplink={deeplink} 
        wallet={wallet} 
        hasWallet={hasWallet} 
        onConnect={handleConnect} 
      />
    );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
       {address ? (
        <Button onClick={() => handleConnect(provider)} className={buttonClass}>
          <WalletIcon size={32} walletName={provider as ProviderType} className="!w-[32px] !h-[32px]" />
          Disconnect <span className="text-lg">{address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''}</span>
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button className={buttonClass}>{isWalletConnected ? "Connecting..." : "Connect Mobile Wallet"}</Button>
        </DialogTrigger>
      )}

<DialogContent className="bg-white/80 dark:bg-gray-800 border-none text-black dark:text-white rounded-2xl">
 
    <DialogHeader>
      <DialogTitle>Connect on Desktop while we work on mobile wallet connect</DialogTitle>
    </DialogHeader>

    {/* <WalletButton deeplink={mobileWalletDeepLink.magiceden} wallet={MAGIC_EDEN} hasWallet={hasWallet} onConnect={handleConnect} />
    <WalletButton deeplink={mobileWalletDeepLink.unisat} wallet={UNISAT} hasWallet={hasWallet} onConnect={handleConnect} />
    <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet={XVERSE} hasWallet={hasWallet} onConnect={handleConnect} /> */}


    <div className="p-4">
      {hasWallet[UNISAT] || hasWallet[XVERSE] || hasWallet[MAGIC_EDEN] ? (
        activeBrowser === 'unisat' ? 
        <WalletButton deeplink={mobileWalletDeepLink.unisat} wallet={UNISAT} hasWallet={hasWallet} onConnect={handleConnect} />
        :
        activeBrowser === 'xverse' ?         
        <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet={XVERSE} hasWallet={hasWallet} onConnect={handleConnect} />
        :
        activeBrowser === 'magic-eden' ?  
        <WalletButton deeplink={mobileWalletDeepLink.magiceden} wallet={MAGIC_EDEN} hasWallet={hasWallet} onConnect={handleConnect} />
        :
        null
      ) : (
        <>
        <WalletButton deeplink={mobileWalletDeepLink.magiceden} wallet={MAGIC_EDEN} hasWallet={hasWallet} onConnect={handleConnect} />
        <WalletButton deeplink={mobileWalletDeepLink.unisat} wallet={UNISAT} hasWallet={hasWallet} onConnect={handleConnect} />
        <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet={XVERSE} hasWallet={hasWallet} onConnect={handleConnect} />
        </>
      )}
      {isXverseBrowser() && 
      <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet={XVERSE} hasWallet={hasWallet} onConnect={handleConnect} />}
    </div>
  </DialogContent>

     </Dialog>
  );
};

export default ConnectWallet;
