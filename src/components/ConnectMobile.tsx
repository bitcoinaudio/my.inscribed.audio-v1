"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { ChevronRight, Wallet, X } from "lucide-react";
import { useDeviceContext } from "../utils/DeviceStore";
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
import { detectMobileAppBrowser } from '../utils/browserCheck';

const activeBrowser = detectMobileAppBrowser();
// console.log(`Active Browser: ${activeBrowser}`);


type WalletName = keyof typeof SUPPORTED_WALLETS;

const mobileWallets = [UNISAT, XVERSE, MAGIC_EDEN];
const appName = "Ides of March";  
const nonce = Date.now().toString();
const browserUrl = "http://localhost:3333/mymedia";
const xversebrowserUrl = 'https://my.inscribed.audio/mymedia';
const unisatbrowserUrl = 'https://my.inscribed.audio/mymedia';
const magicedenbrowserUrl = 'https://my.inscribed.audio/?inMagicEden=1';
const mobileWalletDeepLink = {
  unisat: `unisat://request?method=connect&from=${appName}&nonce=${nonce}`,
  xverse: `https://connect.xverse.app/browser?url=${encodeURIComponent(xversebrowserUrl)}`,
  magiceden: `magiceden://connect?from=${appName}&nonce=${nonce}&browserUrl=${encodeURIComponent(magicedenbrowserUrl)}`,
};

interface ConnectWalletProps {
  className?: string;
}

const idesOfMarchIDs = idesofmarch.map((item) => item.id);

function checkIOMOwnership(insID: string): boolean {
  return idesOfMarchIDs.includes(insID);
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
        "w-full bg-white bg-base-100",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "text-black dark:text-white",
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
        <span className="text-lg">
          {wallet.replace(/[-_]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")}
        </span>
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
  const [htmlInscriptions, setHtmlInscriptions] = useState<{ id: string; isIOM: boolean }[]>([]);
  const navigate = useNavigate();
  const { isMobile } = useDeviceContext();
  const [activeBrowser, setActiveBrowser] = useState('');

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
        const inscriptions = res.list.filter((inscription) => inscription.contentType === 'text/html;charset=utf-8')
          .map((inscription) => ({
            id: inscription.inscriptionId,
            isIOM: checkIOMOwnership(inscription.inscriptionId),
          }));
        setHtmlInscriptions(inscriptions);
        setHtmlArray(inscriptions);
      }
    } catch (error) {
      console.error("Error fetching Unisat inscriptions:", error);
    }
  };

  const getXverseTotal = async (): Promise<number> => {
    const xverseTotal = await request('ord_getInscriptions', { offset: 0, limit: 1 });
    if (xverseTotal.status === 'success') {
      return xverseTotal.result.total;
    }
    return 0;
  };

  const getXverseInscriptions = async () => {
    const limit = await getXverseTotal();
    setHtmlArray([]);
    setHtmlInscriptions([]);
    try {
      const response = await request('wallet_connect', null);
      if (response.status === 'success') {
        for (const address of response.result.addresses) {
          if (address.addressType === 'p2tr') {
            const inscriptions = await request('ord_getInscriptions', { offset: 0, limit: limit });
            if (inscriptions.status === 'success') {
              const filteredInscriptions = inscriptions.result.inscriptions
                .filter((inscription) => inscription.contentType === "text/html;charset=utf-8")
                .map((inscription) => ({
                  id: inscription.inscriptionId,
                  isIOM: checkIOMOwnership(inscription.inscriptionId),
                }));
              setHtmlInscriptions(filteredInscriptions);
              setHtmlArray(filteredInscriptions);
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

  const processCallbackResponse = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const wallet = params.get('data');
    const inscriptions = params.get('inscriptions');

    // console.log('params, wallet, inscriptions', params, wallet, inscriptions);

    if (wallet && inscriptions) {
      try {
        const parsedInscriptions = JSON.parse(decodeURIComponent(inscriptions));
        const filteredInscriptions = parsedInscriptions.map((ins) => ({
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

  // useEffect(() => {
  //   processCallbackResponse();
  // }, [processCallbackResponse]);
	const browserUrl = 'https://dev.inscribed.audio/?inXverse=1';

  const handleConnect = async (walletName: WalletName) => {
    if (provider === walletName) {
      await disconnect();
    } else {
      setIsOpen(false);
      // await connect(walletName);
      if (walletName === UNISAT) {        
        getUnisatInscriptions();
      } else if (walletName === XVERSE) {
        const xverseUrl = `https://connect.xverse.app/browser?url=${encodeURIComponent(browserUrl)}`;
        window.open(xverseUrl);
         getXverseInscriptions();
      } else if (walletName === MAGIC_EDEN) {
         getMagicEdenInscriptions();
      }

      setHtmlArray(htmlInscriptions);
      navigate('/mymedia');
 
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
        <Button
          onClick={() => disconnect()}
          className={buttonClass}
        >
          Disconnect
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button
            className={buttonClass}
          >
            {isConnecting ? "Connecting..." : "Connect Mobile Wallet"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-white dark:bg-gray-800 border-none text-black dark:text-white rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-center text-[22px] font-medium ">Connect Mobile Wallet</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-2 w-full p-2">

          {hasWallet[UNISAT] || hasWallet[XVERSE] || hasWallet[MAGIC_EDEN] ? (
            <>
              {detectMobileAppBrowser() === 'unisat' && (
          <WalletButton deeplink={mobileWalletDeepLink.unisat} wallet={UNISAT} hasWallet={hasWallet} onConnect={handleConnect} />
              )}
              {detectMobileAppBrowser() === 'xverse' && (
          <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet={XVERSE} hasWallet={hasWallet} onConnect={handleConnect} />
              )}
              {detectMobileAppBrowser() === 'magic-eden' && (
          <WalletButton deeplink={mobileWalletDeepLink.magiceden} wallet={MAGIC_EDEN} hasWallet={hasWallet} onConnect={handleConnect} />
              )}
            </>
          ) : (
            <>
              <WalletButton deeplink={mobileWalletDeepLink.magiceden} wallet={MAGIC_EDEN} hasWallet={hasWallet} onConnect={handleConnect} />
              <WalletButton deeplink={mobileWalletDeepLink.unisat} wallet="unisat" hasWallet={hasWallet} onConnect={handleConnect} />
              <WalletButton deeplink={mobileWalletDeepLink.xverse} wallet="xverse" hasWallet={hasWallet} onConnect={handleConnect} />
            </>
          )}

        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}