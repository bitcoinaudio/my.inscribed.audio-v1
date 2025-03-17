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
import { setIinscriptionArray } from "../globalState";
import idesofmarch from '../lib/collections/idesofmarch.json';
import { detectMobileAppBrowser, isXverseBrowser } from '../utils/browserCheck';

const mobileWallets = [UNISAT, XVERSE, MAGIC_EDEN];
const appName = "Inscribed Audio";  
const nonce = Date.now().toString();
const browserUrl = "http://localhost:3333/";
const xversebrowserUrl = 'https://dev.inscribed.audio/';
const unisatbrowserUrl = 'https://dev.inscribed.audio/';
const magicedenbrowserUrl = 'https://dev.inscribed.audio/?inMagicEden=1';
const callbackUrl = 'https://dev.inscribed.audio/myinscriptions?unisat-connected=1';
const text = "sampleText"; // Define the text variable
const type = "sampleType"; // Define the type variable
const data = "[text, type]";
const message = JSON.stringify(data);
const walletResponse = `unisat://response?data=${data}&nonce=${nonce}`;


const baseUrl = 'https://my.inscribed.audio/';
const mobileWalletDeepLink = {
  unisat: `unisat://request?method=signMessage&data=${message}&from=${appName}&nonce=${nonce}&callbackUrl=${baseUrl}myinscriptions?unisat-connected=1`,
  xverse: `https://connect.xverse.app/browser?url=${encodeURIComponent(baseUrl)}`,
  magiceden: `magiceden://connect?from=${appName}&nonce=${nonce}&browser?url=${encodeURIComponent(baseUrl + '?inMagicEden=1')}`,
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

const WalletButton = ({wallet, hasWallet, onConnect }: {  wallet: any, hasWallet: any, onConnect: (wallet: WalletName) => void }) => {
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
            <span className="text-sm ttext-grey-500">Connect</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 hidden group-hover:block" />
        </div>
      ) : (
        
        <a href={mobileWalletDeepLink.xverse} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-grey-500 hover:text-grey-600" onClick={(e) => e.stopPropagation()}>
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
  const [myMessage, setMyMessage] = useState('');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [inXverseWallet, setInXverseWallet] = useState(false);

  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

  const [activeBrowser, setActiveBrowser] = useState(detectMobileAppBrowser());

 

  useEffect(() => {
    const browser = detectMobileAppBrowser();
    console.log(browser)
    setActiveBrowser(browser);
   }, []);
  


const getBRC420 = async (inscriptionId: string) => {
  try {
    const response = await fetch(`https://radinals.bitcoinaudio.co/content/${inscriptionId}`);
    const text = await response.text();
    const isBRC420 = text.trim().startsWith('/content/');
    return {
      isBRC420,
      brc420Url: isBRC420 ? `https://radinals.bitcoinaudio.co${text.trim()}` : ''
    };
  } catch (error) {
    console.error("Error fetching BRC420:", error);
    return { isBRC420: false, brc420Url: '' };
  }
};

const fetchInscriptions = async (fetchFunction, transformFunction) => {
  try {
    const rawInscriptions = await fetchFunction();
    const processedInscriptions = await Promise.all(
      rawInscriptions.map(transformFunction)
    );
    const filteredInscriptions = processedInscriptions.filter(Boolean);

    setHtmlInscriptions(filteredInscriptions);
    setIinscriptionArray(filteredInscriptions);
  } catch (error) {
    console.error("Error fetching inscriptions:", error);
  }
};
  
const getUnisatInscriptions = async () => {
  try {
    const accounts = await window['unisat'].getAccounts();
    console.log("Accounts from UniSat:", accounts);

    const res = await window['unisat'].getInscriptions(0, 100);
    if (!res || !res.list) throw new Error("Invalid response from UniSat API");

    return res.list.map(async (inscription) => {
      if (inscription.contentType.includes("text/html")) {
        const brc420Data = await getBRC420(inscription.inscriptionId);
        return {
          id: inscription.inscriptionId,
          isIOM: checkIOMOwnership(inscription.inscriptionId),
          ...brc420Data,
        };
      }
      return null;
    });
  } catch (error) {
    console.error("Error fetching UniSat inscriptions:", error);
    return [];
  }
};

  const getXverseInscriptions = async () => {
    setMyMessage('Fetching Xverse Inscriptions');
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


  // const browserUrl = 'https://dev.inscribed.audio/';
	const browserUrl = 'https://my.inscribed.audio/?inXverse=1';

 
  const handleMobileConnect = async (walletName: WalletName) => {

    if (provider === walletName) {
      disconnectWallet();
      disconnect();
      setIinscriptionArray([]);
      setHtmlInscriptions([]);
      navigate('/');
      return;
    }

    try {
    setMyMessage('Connecting Mobile Wallet'); 
    await connect(walletName as never);
 
    ConnectXverseMobile();    
    getXverseInscriptions();
    // navigate('/mymedia');
    } catch (error) {4
      setMyMessage('Error connecting mobile wallet');
      console.error("Error connecting mobile wallet:", error);
    }
  };

  function ConnectXverseMobile() {
    const xverseUrl = `https://connect.xverse.app/browser?url=${encodeURIComponent(browserUrl)}`;
    try {
      window.open(xverseUrl);
      setIsMobile(true);
      setInXverseWallet(true);
      getXverseInscriptions();
      navigate('/mymedia');

    } catch (error) {
      alert(error)
    }
 
    // window.open(xverseUrl);
   
 }

 const handleConnect = async (walletName) => {
  if (walletName === provider) {
    disconnect();
    navigate('/');
    return;
  }

  switch (walletName) {
    case UNISAT:
      await connect('unisat');
      break;
    case XVERSE:
    
      try {
        window.open(`https://connect.xverse.app/browser?url=${encodeURIComponent(baseUrl)}`);
        setIsMobile(true);
      } catch (error) {
        alert(error)
      }

      break;
    case MAGIC_EDEN:
      window.open(mobileWalletDeepLink.magiceden);
      break;
    default:
      console.error("Unsupported wallet");
  }

  navigate('/mymedia');
};

 
 const buttonClass = cn(
      "btn btn-ghost text-black dark:text-white font-bold rounded-lg transition duration-300 w-full mb-2",
      "bg-white dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700 w-full mb-2",
      className
    );

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {address ? (
          <Button onClick={() => handleConnect(provider)} className={buttonClass}>
            <WalletIcon size={32} walletName={provider as ProviderType} className="!w-[32px] !h-[32px]" />
            Disconnect <span className="text-lg">{address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''}</span>
            <span className="text-sm">{myMessage}</span>
          </Button>
        ) : (
          <DialogTrigger asChild>
            <Button className={buttonClass}>
              {isWalletConnected ? "Connecting..." : "Connect Mobile Wallet"}
            </Button>
          </DialogTrigger>
        )}
    
        <DialogContent className="bg-white/80 dark:bg-gray-800 border-none text-black dark:text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>Connect on Desktop while we work on mobile wallet connect</DialogTitle>
          </DialogHeader>
    
          {[ 'xverse'].map((wallet) => (
            <WalletButton key={wallet} wallet={wallet} hasWallet={hasWallet} onConnect={ConnectXverseMobile} />
          ))}

            {inXverseWallet && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              You are currently in the Xverse Wallet browser.
              <WalletButton key={"xverse"} wallet={"xverse"} hasWallet={hasWallet} onConnect={ConnectXverseMobile} />

            </div>
            )}

        </DialogContent>
      </Dialog>
    );
    };

export default ConnectWallet;
