export type DeeplinkWallet = 'unisat' | 'xverse';

type DeeplinkOptions = {
  from?: string;
  nonce?: string;
  returnUrl?: string;
};

export type WalletReturnState = {
  hasWalletReturn: boolean;
  wallet: DeeplinkWallet | null;
  status: 'success' | 'cancelled' | 'error' | 'unknown';
  message: string;
};

const FALLBACK_DEEPLINK_BASES: Record<DeeplinkWallet, string> = {
  unisat: 'unisat://request',
  xverse: 'xverse://connect',
};

const appendQuery = (base: string, params: URLSearchParams) => {
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}${params.toString()}`;
};

const getEnvBase = (wallet: DeeplinkWallet) => {
  if (typeof import.meta === 'undefined') return FALLBACK_DEEPLINK_BASES[wallet];

  if (wallet === 'unisat') {
    return import.meta.env.VITE_UNISAT_DEEPLINK_BASE || FALLBACK_DEEPLINK_BASES.unisat;
  }

  return import.meta.env.VITE_XVERSE_DEEPLINK_BASE || FALLBACK_DEEPLINK_BASES.xverse;
};

export const buildWalletReturnUrl = (wallet: DeeplinkWallet) => {
  if (typeof window === 'undefined') return '';
  const configured = import.meta.env.VITE_WALLET_CONNECT_RETURN_URL;

  const base = configured || `${window.location.origin}${window.location.pathname}`;
  const url = new URL(base, window.location.origin);
  url.searchParams.set('walletReturn', '1');
  url.searchParams.set('wallet', wallet);
  url.searchParams.set('status', 'success');
  return url.toString();
};

export const buildWalletDeeplink = (wallet: DeeplinkWallet, options: DeeplinkOptions = {}) => {
  const params = new URLSearchParams();
  params.set('method', 'connect');
  params.set('wallet', wallet);
  params.set('from', options.from || 'my.inscribed.audio');
  params.set('nonce', options.nonce || Date.now().toString());

  if (options.returnUrl) {
    params.set('returnUrl', options.returnUrl);
  }

  return appendQuery(getEnvBase(wallet), params);
};

export const buildWalletReentryDeeplink = (wallet: DeeplinkWallet) => {
  if (typeof window === 'undefined') return '';

  const currentUrl = buildWalletReturnUrl(wallet);
  const template = wallet === 'unisat'
    ? import.meta.env.VITE_UNISAT_BROWSER_OPEN_TEMPLATE
    : import.meta.env.VITE_XVERSE_BROWSER_OPEN_TEMPLATE;

  if (template && template.includes('{url}')) {
    return template.replace('{url}', encodeURIComponent(currentUrl));
  }

  return buildWalletDeeplink(wallet, {
    from: 'my.inscribed.audio',
    returnUrl: currentUrl,
  });
};

export const parseWalletReturnState = (): WalletReturnState => {
  if (typeof window === 'undefined') {
    return { hasWalletReturn: false, wallet: null, status: 'unknown', message: '' };
  }

  const params = new URLSearchParams(window.location.search);
  const walletParam = (params.get('wallet') || '').toLowerCase();
  const wallet: DeeplinkWallet | null = walletParam === 'unisat' || walletParam === 'xverse'
    ? walletParam
    : params.has('inUnisat')
      ? 'unisat'
      : params.has('inXverse')
        ? 'xverse'
        : null;

  const hasMarker =
    params.has('wallet') ||
    params.has('inXverse') ||
    params.has('inUnisat') ||
    params.has('walletReturn') ||
    params.has('wallet_status') ||
    params.has('status') ||
    params.has('error') ||
    params.has('cancelled') ||
    params.has('data');

  if (!hasMarker) {
    return { hasWalletReturn: false, wallet, status: 'unknown', message: '' };
  }

  const statusParam = (params.get('status') || params.get('wallet_status') || '').toLowerCase();
  const hasError = params.has('error');
  const cancelled = params.get('cancelled') === 'true' || statusParam === 'cancelled';

  let status: WalletReturnState['status'] = 'unknown';
  if (hasError || statusParam === 'error') {
    status = 'error';
  } else if (cancelled) {
    status = 'cancelled';
  } else if (statusParam === 'success' || params.has('data') || params.has('walletReturn')) {
    status = 'success';
  } else if (params.get('walletReturn') === '1') {
    status = 'success';
  }

  const message =
    params.get('message') ||
    params.get('error') ||
    (status === 'success'
      ? 'Returned from wallet app. Continue connection.'
      : status === 'cancelled'
        ? 'Wallet connection was cancelled.'
        : status === 'error'
          ? 'Wallet app returned an error.'
          : 'Wallet app opened. Continue connection when ready.');

  return {
    hasWalletReturn: true,
    wallet,
    status,
    message,
  };
};
