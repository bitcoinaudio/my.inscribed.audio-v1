"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import {
  MAGIC_EDEN,
  UNISAT,
  useLaserEyes,
  WalletIcon,
  XVERSE,
  ProviderType,
} from "@omnisat/lasereyes";
import { request } from "sats-connect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { setIinscriptionArray } from "../globalState";
import idesofmarch from "../lib/collections/idesofmarch.json";
import { detectMobileAppBrowser } from "../utils/browserCheck";

// Constants
const appName = "Inscribed Audio";
const nonce = Date.now().toString();
const baseUrl = "https://my.inscribed.audio/mymedia";
const browserUrl = "https://my.inscribed.audio/?inXverse=1";

// Map inscription IDs for faster lookup
const idesOfMarchIDs = new Set(idesofmarch.map((item) => item.id));

// Check Ides of March Ownership
const checkIOMOwnership = (insID) => idesOfMarchIDs.has(insID);

// Main ConnectWallet component
const ConnectWallet = ({ className }) => {
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const { disconnectWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [hasWallet, setHasWallet] = useState({ unisat: false, xverse: false, [MAGIC_EDEN]: false });
  const [myMessage, setMyMessage] = useState("");
  const navigate = useNavigate();
  const [activeBrowser, setActiveBrowser] = useState(detectMobileAppBrowser());

  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

  // Xverse Mobile Connection
  const connectXverseMobile = () => {
    const xverseUrl = `https://connect.xverse.app/browser?url=${encodeURIComponent(browserUrl)}`;
    window.open(xverseUrl);
    navigate("/mymedia");
  };

  // Wallet Button Component
  const WalletButton = ({ wallet, hasWallet, onConnect }) => (
    <Button
      onClick={hasWallet[wallet] ? () => onConnect(wallet) : undefined}
      variant="ghost"
      className={cn(
        "w-full hover:bg-gray-50 dark:hover:bg-gray-700",
        "text-gray-500 font-normal justify-between h-[60px] text-base rounded-xl px-4",
        "border border-gray-100 dark:border-gray-700 transition-colors duration-200 group"
      )}
    >
      <div className="flex items-center gap-3">
        <WalletIcon size={32} walletName={wallet} />
        <span className="text-lg font-bold capitalize">
          {wallet.replace(/[-_]/g, " ")}
        </span>
      </div>
      {hasWallet[wallet] ? (
        <div className="flex items-center">
          <div className="group-hover:hidden flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm">Connect</span>
          </div>
          <ChevronRight className="hidden group-hover:block w-5 h-5" />
        </div>
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </Button>
  );

  // Disconnect handler
  const handleDisconnect = () => {
    disconnectWallet();
    disconnect();
    setIinscriptionArray([]);
    navigate("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button onClick={handleDisconnect} className={cn("w-full", className)}>
          <WalletIcon size={32} walletName={provider} />
          Disconnect {address}
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button className={cn(className, "w-full rounded-xl")}>Connect Mobile Wallet</Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-white/80 dark:bg-gray-800 border-none rounded-xl text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>Select Wallet</DialogTitle>
        </DialogHeader>
        {[XVERSE].map((wallet) => (
          <WalletButton key={wallet} wallet={wallet} hasWallet={hasWallet} onConnect={connectXverseMobile} />
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
