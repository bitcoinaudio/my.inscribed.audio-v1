"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';  
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
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
import { setHtmlArray } from "../globalState";
import idesofmarch from '../lib/collections/idesofmarch.json';

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

  async function getBRC420(inscriptionId: string) {
    try {
      const response = await fetch(`https://ordinals.com/content/${inscriptionId}`);
      const text = await response.text();
      return text.trim().startsWith('/content/')
        ? { isBRC420: true, brc420Url: `https://ordinals.com${text.trim()}` }
        : { isBRC420: false, brc420Url: '' };
    } catch (error) {
      console.error("Error fetching BRC420:", error);
      return { isBRC420: false, brc420Url: '' };
    }
  }

  const fetchInscriptions = async (fetchFunction: Function) => {
    try {
      const rawInscriptions = await fetchFunction();
      const processedInscriptions = await Promise.all(
        rawInscriptions.map(async (inscription: any) => {
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
    } catch (error) {
      console.error("Error fetching UniSat total inscriptions:", error);
      return 0;
    }
  };

  const getUnisatInscriptions = async () => {
    
    try {
      setHtmlArray([]);
      setHtmlInscriptions([]);
      
      const res = await window['unisat'].getInscriptions(0, 100);
      console.log("Response from getInscriptions:", res);
      if (!res || !res.list) {
        console.error("Invalid response from UniSat API");
        return [];
      }

      const processedInscriptions = await Promise.all(
        res.list.map(async (inscription: any) => {
          if (inscription.contentType.startsWith("text/html")) {
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

    switch (walletName as never) {
      case 'unisat':
        await getUnisatInscriptions();
        navigate('/mymedia');
        break;
      case 'xverse':
        await fetchInscriptions(getXverseInscriptions);
        navigate('/mymedia');
        break;
    }

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
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button className={buttonClass}>{isWalletConnected ? "Connecting..." : "Connect Mobile Wallet"}</Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-white dark:bg-gray-800 border-none text-black dark:text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle>Connect on Desktop while we work on mobile wallet connect</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {/* {Object.values(SUPPORTED_WALLETS).map(wallet => (
            hasWallet[wallet.name] && (
              <Button key={wallet.name} onClick={() => handleConnect(wallet.name)} className={buttonClass}>
                <WalletIcon size={24} walletName={wallet.name} /> Connect 
              </Button>
            )
          ))} */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
