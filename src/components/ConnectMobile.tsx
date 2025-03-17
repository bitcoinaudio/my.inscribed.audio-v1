"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLaserEyes, WalletIcon, XVERSE, MAGIC_EDEN, UNISAT } from "@omnisat/lasereyes";
import { request } from "sats-connect";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import { setIinscriptionArray } from "../globalState";
import idesofmarch from "../lib/collections/idesofmarch.json";
import { detectMobileAppBrowser } from "../utils/browserCheck";

const nonce = Date.now().toString();
const browserUrl = "https://my.inscribed.audio/?inXverse=1";

const idesOfMarchIDs = new Set(idesofmarch.map((item) => item.id));

const checkIOMOwnership = (insID) => idesOfMarchIDs.has(insID);

const ConnectWallet = ({ className }) => {
  const navigate = useNavigate();
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();

  const [isOpen, setIsOpen] = useState(false);
  const [hasWallet, setHasWallet] = useState({ unisat: false, xverse: false, [MAGIC_EDEN]: false });

  useEffect(() => {
    setHasWallet({ unisat: hasUnisat, xverse: hasXverse, [MAGIC_EDEN]: hasMagicEden });
  }, [hasUnisat, hasXverse, hasMagicEden]);

  const handleDisconnect = () => {
    disconnect();
    setIinscriptionArray([]);
    navigate("/");
  };

  const handleConnectXverseMobile = () => {
    const xverseUrl = `https://connect.xverse.app/browser?url=${encodeURIComponent(browserUrl)}`;
    window.open(xverseUrl, "_blank");
    navigate("/mymedia");
  };

  const WalletButton = ({ wallet, hasWallet, onConnect }) => (
    <Button
      onClick={onConnect}
      variant="ghost"
      className={cn(
        "w-full hover:bg-gray-50 dark:hover:bg-gray-700",
        "text-gray-500 font-normal justify-between h-[60px] text-base rounded-xl px-4",
        "border border-gray-100 dark:border-gray-700 transition-colors duration-200 group"
      )}
    >
      <div className="flex items-center gap-3">
        <WalletIcon size={32} walletName={wallet} />
        <span className="text-lg font-bold capitalize">{wallet}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {address ? (
        <Button onClick={handleDisconnect} className={cn("w-full", className)}>
          <WalletIcon size={32} walletName={provider} />
          Disconnect {address.slice(0, 5)}...{address.slice(-5)}
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
        <WalletButton wallet={XVERSE} hasWallet={hasWallet} onConnect={handleConnectXverseMobile} />
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
