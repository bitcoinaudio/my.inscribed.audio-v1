"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Button } from "./ui/button";

import { request } from "sats-connect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { setIinscriptionArray } from "../globalState";
import { getOrdinalsSite, getBRC420Data, getBitmapData, isEnhancedInscription, getInscriptionAttributes, isBeatBlockInscription } from "../utils/inscriptions";
import idesofmarch from '../lib/collections/idesofmarch.json';
import dust from '../lib/collections/dust.json';


import { WalletIcon } from '@omnisat/lasereyes-react'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { 
  SUPPORTED_WALLETS,
  ProviderType,
  UNISAT, 
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE
} from '@omnisat/lasereyes-core'

declare global {
  interface Window {
    unisat?: {
      getInscriptions: (cursor: number, size: number) => Promise<{ list: any[] }>;
    };
  }
}

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
  isBeatBlock?: boolean;
}
const ordSite1 = "https://radinals.bitcoinaudio.co";
const ordSite2 = "https://ordinals.com";
// check if ordSite1 is availbale, if not use ordSite2
const checkOrdinalsSite = async () => {
  try {
    const response = await fetch(ordSite1, { method: 'HEAD' });
    if (response.status === 200) {
      return ordSite1;
    }else {
       return ordSite2;
    }
  } catch (error) {
    console.error("Error checking ordinals site:", error);
  }
 }
const ConnectWallet = ({ className }: { className?: string }) => {
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const { connectWallet, disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [hasWallet, setHasWallet] = useState({ [UNISAT]: false, [XVERSE]: false, [MAGIC_EDEN]: false });
  const [htmlInscriptions, setHtmlInscriptions] = useState<HtmlInscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const idesOfMarchIDs = useMemo(() => new Set(idesofmarch.map(item => item.id)), []);
  const dustIDs = useMemo(() => new Set(dust.map(item => item.id)), []);

  useEffect(() => {
    setHasWallet({ [UNISAT]: hasUnisat, [XVERSE]: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

  const processInscriptions = async (raw) => {
    const results = await Promise.all(raw.map(async (insc) => {
      const id = insc.inscriptionId;
      const [brc420, bmp] = await Promise.all([
        getBRC420Data(id),
        getBitmapData(id),
      ]);

      return {
        id,
        isIOM: idesOfMarchIDs.has(id),
        isDust: dustIDs.has(id),
        contentType: insc.contentType,
        isEnhanced: isEnhancedInscription(id, idesOfMarchIDs, dustIDs),
        attributes: getInscriptionAttributes(id),
        isBeatBlock: isBeatBlockInscription(id),
        ...brc420,
        ...bmp,
      };
    }));

    const clean = results.filter(Boolean);
    setHtmlInscriptions(clean);
    setIinscriptionArray(clean);
    return clean;
  };

  const getUnisatInscriptions = async () => {
    if (!window?.unisat?.getInscriptions) return [];
    try {
      setWalletLoading('unisat');
      const res = await window.unisat.getInscriptions(0, 100);
      return res?.list ? await processInscriptions(res.list) : [];
    } catch (e) {
      console.error("UniSat error:", e);
      return [];
    } finally {
      setWalletLoading(null);
    }
  };

  const getXverseInscriptions = async () => {
    try {
      setWalletLoading('xverse');
      const response = await request("wallet_connect", null);
      if (response.status === 'success') {
        const p2tr = response.result.addresses?.find(addr => addr.addressType === 'p2tr');
        if (p2tr) {
          const res = await request("ord_getInscriptions", { offset: 0, limit: 100 });
          if (res.status === 'success') {
            return res.result.inscriptions ? await processInscriptions(res.result.inscriptions) : [];
          }
        }
      }
      return [];
    } catch (e) {
      console.error("Xverse error:", e);
      return [];
    } finally {
      setWalletLoading(null);
    }
  };

  const handleConnect = async (walletName) => {
    if (provider === walletName) {
      disconnectWallet();
      disconnect();
      setHtmlInscriptions([]);
      setIinscriptionArray([]);
      navigate('/');
      return;
    }

    setIsOpen(false);
    setIsLoading(true);

    try {
      await connect(walletName);
      connectWallet();
      if (walletName === 'unisat') await getUnisatInscriptions();
      else if (walletName === 'xverse') await getXverseInscriptions();
      navigate('/mymedia');
    } catch (err) {
      console.error(`Connection to ${walletName} failed:`, err);
      disconnectWallet();
      disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = cn(
    "btn btn-ghost text-black dark:text-white font-bold rounded-lg transition duration-300 w-full mb-2",
    "bg-white dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700",
    isLoading && "opacity-50 cursor-not-allowed",
    className
  );

  const shortAddress = useMemo(() =>
    address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ""
  , [address]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button onClick={() => handleConnect(provider)} className={buttonClass} disabled={isLoading}>
          <WalletIcon size={32} walletName={provider} className="!w-[32px] !h-[32px]" />
          Disconnect <span className="text-lg">{shortAddress}</span>
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
                disabled={walletLoading === wallet.name}
              >
                <WalletIcon size={24} walletName={wallet.name} />
                {walletLoading === wallet.name ? "Connecting..." : `Connect ${wallet.name}`}
              </Button>
            )
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
