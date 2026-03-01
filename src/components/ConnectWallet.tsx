"use client";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { setIinscriptionArray } from "../globalState";
import {
  getBRC420Data,
  getBitmapData,
  getInscriptionAttributes,
  isBeatBlockInscription,
  isEnhancedInscription,
} from "../utils/inscriptions";
import { useWallet } from "../context/WalletContext";
import idesofmarch from "../lib/collections/idesofmarch.json";
import dust from "../lib/collections/dust.json";

type WalletName = "unisat" | "xverse";

type ProcessedInscription = {
  id: string;
  isIOM: boolean;
  isDust: boolean;
  contentType?: string;
  isEnhanced: boolean;
  attributes?: unknown;
  isBRC420: boolean;
  brc420Url?: string;
  isBitmap?: boolean;
  bitmap?: string;
  isBeatBlock?: boolean;
};

type RawWalletInscription = {
  inscriptionId?: string;
  contentType?: string;
};

const WALLET_OPTIONS: Array<{ name: WalletName; label: string }> = [
  { name: "unisat", label: "UniSat" },
  { name: "xverse", label: "Xverse" },
];

const ConnectWallet = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const {
    isWalletConnected,
    provider,
    address,
    availableWallets,
    authStatus,
    authError,
    connectWallet,
    disconnectWallet,
    fetchInscriptions,
    authenticateWallet,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState<WalletName | null>(null);

  const idesOfMarchIDs = useMemo(
    () => new Set(idesofmarch.map((item: { id: string }) => item.id)),
    []
  );
  const dustIDs = useMemo(
    () => new Set(dust.map((item: { id: string }) => item.id)),
    []
  );

  const processInscriptions = async (raw: RawWalletInscription[]): Promise<ProcessedInscription[]> => {
    const results = await Promise.all(
      raw.map(async (inscription: RawWalletInscription) => {
        const id = inscription.inscriptionId;
        if (!id) return null;

        const [brc420, bitmap] = await Promise.all([getBRC420Data(id), getBitmapData(id)]);

        return {
          id,
          isIOM: idesOfMarchIDs.has(id),
          isDust: dustIDs.has(id),
          contentType: inscription.contentType,
          isEnhanced: isEnhancedInscription(id, idesOfMarchIDs, dustIDs),
          attributes: getInscriptionAttributes(id),
          isBeatBlock: isBeatBlockInscription(id),
          ...brc420,
          ...bitmap,
        };
      })
    );

    return results.filter(Boolean) as ProcessedInscription[];
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIinscriptionArray([]);
    navigate("/");
  };

  const handleConnect = async (walletName: WalletName) => {
    if (provider === walletName && isWalletConnected) {
      handleDisconnect();
      return;
    }

    setIsOpen(false);
    setIsLoading(true);
    setWalletLoading(walletName);

    try {
      await connectWallet(walletName);
      const inscriptions = await fetchInscriptions(100, walletName);
      const processed = await processInscriptions(inscriptions);
      setIinscriptionArray(processed);
      const inscriptionIds = processed.map((item) => item.id);
      await authenticateWallet(inscriptionIds);
      navigate("/mymedia");
    } catch (error) {
      console.error(`Connection to ${walletName} failed:`, error);
      disconnectWallet();
      setIinscriptionArray([]);
    } finally {
      setWalletLoading(null);
      setIsLoading(false);
    }
  };

  const buttonClass = cn(
    "btn btn-ghost text-black dark:text-white font-bold rounded-lg transition duration-300 w-full mb-2",
    "bg-white dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700",
    isLoading && "opacity-50 cursor-not-allowed",
    className
  );

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ""),
    [address]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {isWalletConnected ? (
        <Button onClick={handleDisconnect} className={buttonClass} disabled={isLoading}>
          Disconnect <span className="text-lg">{shortAddress}</span>
          {authStatus === "authenticated" ? <span className="text-xs ml-2">verified</span> : null}
          {authStatus === "error" && authError ? <span className="text-xs ml-2">auth failed</span> : null}
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
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {WALLET_OPTIONS.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              className={buttonClass}
              disabled={walletLoading === wallet.name || !availableWallets[wallet.name]}
            >
              {walletLoading === wallet.name ? "Connecting..." : `Connect ${wallet.label}`}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
