"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "../lib/utils";
import {
  getBRC420Data,
  getBitmapData,
  getInscriptionAttributes,
  isBeatBlockInscription,
  isEnhancedInscription,
} from "../utils/inscriptions";
import { buildWalletDeeplink, buildWalletReentryDeeplink, buildWalletReturnUrl } from "../utils/walletDeeplink";
import { useWallet } from "../context/WalletContext";
import { useDeviceContext } from "../utils/DeviceStore";
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

type WalletConnectError = Error & {
  code?: string;
  deeplink?: string;
  walletProvider?: WalletName;
};

type MobilePromptState = {
  wallet: WalletName;
  deeplink: string;
  message: string;
};

const WALLET_OPTIONS: Array<{ name: WalletName; label: string }> = [
  { name: "unisat", label: "UniSat" },
  { name: "xverse", label: "Xverse" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ConnectWallet = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const { isMobile, inWalletBrowser } = useDeviceContext();
  const {
    isWalletConnected,
    provider,
    address,
    availableWallets,
    authStatus,
    authError,
    connectWallet,
    disconnectWallet,
    setWalletItems,
    fetchInscriptions,
    authenticateWallet,
    mobileConnectNotice,
    clearMobileConnectNotice,
    mobileResumeWallet,
    consumeMobileResumeWallet,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState<WalletName | null>(null);
  const [mobilePrompt, setMobilePrompt] = useState<MobilePromptState | null>(null);
  const [isAutoResuming, setIsAutoResuming] = useState(false);
  const [pendingWalletHint, setPendingWalletHint] = useState<WalletName | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshPending = () => {
      const pending = window.sessionStorage.getItem("myinscribed.pendingMobileWallet");
      if (pending === "unisat" || pending === "xverse") {
        setPendingWalletHint(pending);
      } else {
        setPendingWalletHint(null);
      }
    };

    refreshPending();
    window.addEventListener("focus", refreshPending);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshPending();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshPending);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!mobileConnectNotice) return;

    setMobilePrompt((current: MobilePromptState | null) => {
      if (current) return { ...current, message: mobileConnectNotice };
      return {
        wallet: (mobileResumeWallet || "unisat") as WalletName,
        deeplink: "",
        message: mobileConnectNotice,
      };
    });
  }, [mobileConnectNotice, mobileResumeWallet]);

  const idesOfMarchIDs = useMemo(
    () => new Set(idesofmarch.map((item: { id: string }) => item.id)),
    []
  );
  const dustIDs = useMemo(
    () => new Set(dust.map((item: { id: string }) => item.id)),
    []
  );

  const processInscriptions = useCallback(async (raw: RawWalletInscription[]): Promise<ProcessedInscription[]> => {
    const results = await Promise.all(
      raw.map(async (inscription: RawWalletInscription) => {
        const id = inscription.inscriptionId;
        if (!id) return null;

        let brc420 = {};
        let bitmap = {};
        try {
          [brc420, bitmap] = await Promise.all([getBRC420Data(id), getBitmapData(id)]);
        } catch (error) {
          console.warn(`Metadata enrichment failed for inscription ${id}:`, error);
        }

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
  }, [idesOfMarchIDs, dustIDs]);

  const fetchInscriptionsWithRetry = useCallback(async (walletName: WalletName) => {
    const shouldRetry = walletName === "xverse" && isMobile;
    const maxAttempts = shouldRetry ? 4 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const inscriptions = await fetchInscriptions(100, walletName);
        if (inscriptions.length > 0) {
          return inscriptions;
        }
      } catch (error) {
        if (attempt === maxAttempts) {
          console.error(`Failed to fetch inscriptions for ${walletName}:`, error);
        } else {
          console.warn(`Retrying inscription fetch for ${walletName} (attempt ${attempt + 1}/${maxAttempts})`, error);
        }
      }

      if (attempt < maxAttempts) {
        await sleep(350 * attempt);
      }
    }

    return [];
  }, [fetchInscriptions, isMobile]);

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletItems([]);
    navigate("/");
  };

  const completeWalletConnection = useCallback(async (
    walletName: WalletName,
    options?: { skipDeeplink?: boolean }
  ) => {
    await connectWallet(walletName, options);
    setIsOpen(false);
    const inscriptions = await fetchInscriptionsWithRetry(walletName);
    const processed = await processInscriptions(inscriptions);
    setWalletItems(processed);
    const inscriptionIds = processed.map((item) => item.id);
    await authenticateWallet(inscriptionIds);
    navigate("/mymedia");
  }, [
    connectWallet,
    fetchInscriptionsWithRetry,
    processInscriptions,
    setWalletItems,
    authenticateWallet,
    navigate,
  ]);

  const handleConnect = async (walletName: WalletName) => {
    if (isLoading) return;

    if (provider === walletName && isWalletConnected) {
      handleDisconnect();
      return;
    }

    setIsLoading(true);
    setWalletLoading(walletName);
    setMobilePrompt(null);

    try {
      await completeWalletConnection(walletName);
    } catch (error) {
      const walletError = error as WalletConnectError;
      if (walletError.code === "DEEPLINK_LAUNCHED" && walletError.deeplink) {
        setMobilePrompt({
          wallet: walletName,
          deeplink: walletError.deeplink,
          message: `Opening ${walletName === "unisat" ? "UniSat" : "Xverse"}. If it did not open, use the button below.`,
        });
        setIsOpen(true);
        return;
      }

      console.error(`Connection to ${walletName} failed:`, error);
    } finally {
      setWalletLoading(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mobileResumeWallet || isLoading) return;

    let active = true;

    const resumeWalletConnect = async () => {
      setIsAutoResuming(true);
      setIsLoading(true);
      setWalletLoading(mobileResumeWallet);

      try {
        await completeWalletConnection(mobileResumeWallet, { skipDeeplink: true });
      } catch (error) {
        if (!active) return;

        console.error(`Auto-resume connection to ${mobileResumeWallet} failed:`, error);
        const retryDeeplink = buildWalletDeeplink(mobileResumeWallet, {
          from: "my.inscribed.audio",
          returnUrl: buildWalletReturnUrl(mobileResumeWallet),
        });

        setMobilePrompt({
          wallet: mobileResumeWallet,
          deeplink: retryDeeplink,
          message: `We couldn't access your wallet in this browser. Open this site in ${
            mobileResumeWallet === "unisat" ? "UniSat" : "Xverse"
          } and try again.`,
        });
      } finally {
        if (active) {
          consumeMobileResumeWallet();
          setWalletLoading(null);
          setIsLoading(false);
          setIsAutoResuming(false);
          if (typeof window !== "undefined") {
            const pending = window.sessionStorage.getItem("myinscribed.pendingMobileWallet");
            if (pending === "unisat" || pending === "xverse") {
              setPendingWalletHint(pending);
            } else {
              setPendingWalletHint(null);
            }
          }
        }
      }
    };

    resumeWalletConnect();

    return () => {
      active = false;
      setIsAutoResuming(false);
    };
  }, [
    mobileResumeWallet,
    isLoading,
    completeWalletConnection,
    consumeMobileResumeWallet,
  ]);

  const handleOpenWalletApp = () => {
    if (!mobilePrompt?.deeplink) return;
    window.location.href = mobilePrompt.deeplink;
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
      <div className="w-full">
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

        {isAutoResuming ? (
          <span className="mt-1 block text-center text-[10px] text-base-content/70">
            Resuming wallet connection and syncing My Media...
          </span>
        ) : null}

        {isMobile && !inWalletBrowser && !isWalletConnected && pendingWalletHint ? (
          <div className="mt-1 rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-[10px] text-blue-900 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
            <div>This browser can't access {pendingWalletHint === "unisat" ? "UniSat" : "Xverse"} directly after switching apps.</div>
            <button
              className="mt-1 underline"
              onClick={() => {
                const deeplink = buildWalletReentryDeeplink(pendingWalletHint);
                if (deeplink) {
                  window.location.href = deeplink;
                }
              }}
            >
              Open in {pendingWalletHint === "unisat" ? "UniSat" : "Xverse"}
            </button>
            <div className="mt-1">If it opens here again, open this URL from your wallet browser or connect on desktop.</div>
          </div>
        ) : null}
      </div>

      <DialogContent className="bg-white dark:bg-gray-800 border-none text-black dark:text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {WALLET_OPTIONS.map((wallet) => (
            (() => {
              const canConnect =
                availableWallets[wallet.name] ||
                (isMobile && !inWalletBrowser);

              return (
            <Button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              className={buttonClass}
              disabled={isLoading || walletLoading === wallet.name || !canConnect}
            >
              {walletLoading === wallet.name ? "Connecting..." : `Connect ${wallet.label}`}
            </Button>
              );
            })()
          ))}

          {isMobile && mobilePrompt ? (
            <div className="mt-3 rounded-lg border border-base-300 bg-base-100 p-3 text-sm">
              <p className="mb-2 text-base-content/80">{mobilePrompt.message}</p>
              <div className="flex gap-2">
                {mobilePrompt.deeplink ? (
                  <Button className="btn btn-sm" onClick={handleOpenWalletApp}>
                    Open {mobilePrompt.wallet === "unisat" ? "UniSat" : "Xverse"}
                  </Button>
                ) : null}
                <Button
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    setMobilePrompt(null);
                    clearMobileConnectNotice();
                  }}
                >
                  Dismiss
                </Button>
              </div>
              {!inWalletBrowser ? (
                <p className="mt-2 text-xs text-base-content/70">Mobile web uses wallet deeplinks first. Open this site inside your wallet browser for direct connect.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
