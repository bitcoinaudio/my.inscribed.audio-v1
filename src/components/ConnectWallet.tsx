"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  const [isWalletName, setIsWalletName] = useState('');
  const [hasWallet, setHasWallet] = useState({ unisat: false, xverse: false, [MAGIC_EDEN]: false });
  const [htmlInscriptions, setHtmlInscriptions] = useState<HtmlInscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  // Memoized constants
  const idesOfMarchIDs = useMemo(() => idesofmarch.map(item => item.id), []);
  const dustIDs = useMemo(() => dust.map(item => item.id), []);
  const beatblockPrefix = "808f2bcdf19691342041adfa507abba33003bfb2643496bb256897a2c8dc1808i";

  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

  const checkEnhancedInscription = useCallback((id: string) => idesOfMarchIDs.includes(id) || dustIDs.includes(id), []);
  const getAttributes = useCallback((id: string) => idesofmarch.find(item => item.id === id)?.meta?.attributes ?? null, []);
  const isBeatBlock = useCallback((id: string) => id.startsWith(beatblockPrefix), []);

  const getBRC420 = async (id: string) => {
    const ordinalsSite = await checkOrdinalsSite();
    try {
      const res = await fetch(`${ordinalsSite}/content/${id}`, { headers: { Accept: "application/json" } });
      const text = await res.text();
      return text.startsWith("/content/")
        ? { isBRC420: true, brc420Url: `${ordinalsSite}${text.trim()}` }
        : { isBRC420: false, brc420Url: '' };
    } catch {
      return { isBRC420: false, brc420Url: '' };
    }
  };

  const getBitmap = async (id: string) => {
        const ordinalsSite = await checkOrdinalsSite();

    const regex = /^(?:0|[1-9][0-9]*).bitmap$/;
    try {
      const res = await fetch(`${ordinalsSite}/content/${id}`, { headers: { Accept: "application/json" } });
      const text = await res.text();
      return regex.test(text)
        ? { isBitmap: true, bitmap: text.split(".")[0] }
        : { isBitmap: false, bitmap: '' };
    } catch {
      return { isBitmap: false, bitmap: '' };
    }
  };

  const processInscriptions = async (raw: any[]): Promise<HtmlInscription[]> => {
    const result = await Promise.all(
      raw.map(async (insc) => {
        const id = insc.inscriptionId;
        const [brc420, bmp] = await Promise.all([getBRC420(id), getBitmap(id)]);

        return {
          id,
          isIOM: idesOfMarchIDs.includes(id),
          isDust: dustIDs.includes(id),
          contentType: insc.contentType,
          isEnhanced: checkEnhancedInscription(id),
          attributes: getAttributes(id),
          isBeatBlock: isBeatBlock(id),
          ...brc420,
          ...bmp,
        };
      })
    );

    const clean = result.filter(Boolean);
    setHtmlInscriptions(clean);
    setIinscriptionArray(clean);
    return clean;
  };

  const getUnisatInscriptions = async () => {
    if (!window?.unisat?.getInscriptions) {
      console.warn("UniSat wallet not available.");
      return [];
    }

    try {
      setIsLoading(true);
      const res = await window.unisat.getInscriptions(0, 100);
      if (res?.list) return await processInscriptions(res.list);
    } catch (e) {
      console.error("Error fetching from UniSat:", e);
    } finally {
      setIsLoading(false);
    }

    return [];
  };

  const getXverseInscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await request("wallet_connect", null);
      if (response.status === "success") {
        const p2tr = response.result.addresses.find(addr => addr.addressType === 'p2tr');
        if (p2tr) {
          const res = await request("ord_getInscriptions", { offset: 0, limit: 100 });
          if (res.status === "success") return await processInscriptions(res.result.inscriptions);
        }
      }
    } catch (e) {
      console.error("Error fetching from Xverse:", e);
    } finally {
      setIsLoading(false);
    }

    return [];
  };

  const handleConnect = async (walletName: WalletName) => {
    if (provider === walletName) {
      disconnectWallet();
      disconnect();
      setHtmlInscriptions([]);
      setIinscriptionArray([]);
      setIsConnected(false);
      navigate('/');
      return;
    }

    setIsOpen(false);
    setIsLoading(true);

    try {
      await connect(walletName as never);
      connectWallet();
      setIsWalletName(walletName);
      setIsConnected(true);

      if (walletName === 'unisat') await getUnisatInscriptions();
      else if (walletName === 'xverse') await getXverseInscriptions();

      navigate('/mymedia');
    } catch (err) {
      console.error(`Connection to ${walletName} failed:`, err);
      if (isConnected) {
        disconnectWallet();
        disconnect();
        setIsConnected(false);
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button onClick={() => handleConnect(provider)} className={buttonClass} disabled={isLoading}>
          <WalletIcon size={32} walletName={provider as ProviderType} className="!w-[32px] !h-[32px]" />
          Disconnect <span className="text-lg">{`${address.slice(0, 5)}...${address.slice(-5)}`}</span>
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
