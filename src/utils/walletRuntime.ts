export type WalletBrowserType = 'unisat' | 'xverse' | null;

export type WalletRuntime = {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  inWalletBrowser: boolean;
  walletBrowserType: WalletBrowserType;
};

const getUserAgent = () => (typeof window !== 'undefined' ? window.navigator.userAgent || '' : '');

const detectWalletBrowserType = (): WalletBrowserType => {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const walletParam = (params.get('wallet') || '').toLowerCase();

  if (params.has('inUnisat') || walletParam === 'unisat') return 'unisat';
  if (params.has('inXverse') || walletParam === 'xverse') return 'xverse';

  if (window.unisat) return 'unisat';

  const bitcoinProvider = (window as Window & { bitcoin?: { isXverse?: boolean } }).bitcoin;
  if (bitcoinProvider?.isXverse || window.BitcoinProvider || window.XverseProviders) return 'xverse';

  const userAgent = getUserAgent();
  if (/unisat/i.test(userAgent)) return 'unisat';
  if (/xverse/i.test(userAgent)) return 'xverse';

  return null;
};

const detectMobileRuntime = () => {
  if (typeof window === 'undefined') {
    return { isMobile: false, isIOS: false, isAndroid: false };
  }

  const userAgent = getUserAgent();
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileByUA = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
  const isSmallViewport = window.innerWidth <= 960;

  return {
    isMobile: isMobileByUA || (isSmallViewport && isTouch),
    isIOS,
    isAndroid,
  };
};

export const getWalletRuntime = (): WalletRuntime => {
  const device = detectMobileRuntime();
  const walletBrowserType = detectWalletBrowserType();

  return {
    ...device,
    inWalletBrowser: Boolean(walletBrowserType),
    walletBrowserType,
  };
};
