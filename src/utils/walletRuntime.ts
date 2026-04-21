export type WalletBrowserType = "unisat" | "xverse" | null;

export type WalletRuntime = {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  inWalletBrowser: boolean;
  walletBrowserType: WalletBrowserType;
};

const MOBILE_UA_REGEX = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i;

export const getWalletRuntime = (): WalletRuntime => {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      inWalletBrowser: false,
      walletBrowserType: null,
    };
  }

  const userAgent = navigator.userAgent || "";
  const isMobile = MOBILE_UA_REGEX.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const search = window.location.search;

  const walletBrowserType =
    /unisat/i.test(userAgent) || /inUnisat=1|\bwallet=unisat\b/i.test(search)
      ? "unisat"
      : /xverse/i.test(userAgent) || /inXverse=1|\bwallet=xverse\b/i.test(search)
        ? "xverse"
        : null;

  const inWalletBrowser =
    /xverse|unisat|okx|tokenpocket/i.test(userAgent) ||
    /inXverse=1|inUnisat=1|wallet=/i.test(search);

  return {
    isMobile,
    isIOS,
    isAndroid,
    inWalletBrowser,
    walletBrowserType,
  };
};
