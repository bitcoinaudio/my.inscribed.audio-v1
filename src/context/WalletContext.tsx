import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createWalletNonce,
  getWalletSession,
  logoutWalletSession,
  verifyWalletSignature,
} from '../utils/walletAuthClient';
import { buildWalletDeeplink, buildWalletReturnUrl, parseWalletReturnState } from '../utils/walletDeeplink';
import { getWalletRuntime, type WalletRuntime } from '../utils/walletRuntime';
import type { WalletRole } from '../constants/walletRoles';

type WalletProviderName = 'unisat' | 'xverse' | null;
type AuthStatus = 'idle' | 'pending' | 'authenticated' | 'unavailable' | 'error';
type ConnectedWalletProvider = Exclude<WalletProviderName, null>;
type ConnectWalletOptions = { skipDeeplink?: boolean };
type WalletMediaItem = {
  id: string;
  contentType?: string;
  isIOM?: boolean;
  isDust?: boolean;
  isEnhanced?: boolean;
  attributes?: unknown;
  isBRC420?: boolean;
  brc420Url?: string;
  isBitmap?: boolean;
  bitmap?: string;
  isBeatBlock?: boolean;
};

const ORDINALS_PURPOSE = 'ordinals';
const PAYMENT_PURPOSE = 'payment';

type RawInscription = {
  inscriptionId?: string;
  id?: string;
  contentType?: string;
  mimeType?: string;
  content_type?: string;
};

declare global {
  interface Window {
    unisat?: {
      getAccounts?: () => Promise<string[]>;
      requestAccounts?: () => Promise<string[]>;
      getInscriptions?: (cursor: number, size: number) => Promise<{ list: RawInscription[] }>;
      signMessage?: (message: string, type?: string) => Promise<string>;
    };
    BitcoinProvider?: unknown;
    XverseProviders?: unknown;
    bitcoin?: {
      isXverse?: boolean;
      request?: (method: string, params?: unknown) => Promise<unknown>;
    };
  }
}

type XverseProvider = {
  request?: (method: string, params?: unknown) => Promise<unknown>;
  getAccounts?: (params?: unknown) => Promise<unknown>;
  getInscriptions?: (offset: number, limit: number) => Promise<unknown>;
  signMessage?: (params: unknown) => Promise<unknown>;
};

type XverseAccount = {
  address?: string;
  purpose?: string;
};

const extractXverseAccounts = (payload: unknown): XverseAccount[] => {
  const roots: unknown[] = [
    payload,
    (payload as { result?: unknown })?.result,
    (payload as { data?: unknown })?.data,
    (payload as { accounts?: unknown })?.accounts,
    (payload as { addresses?: unknown })?.addresses,
  ];

  for (const root of roots) {
    const rows = Array.isArray(root)
      ? root
      : Array.isArray((root as { addresses?: unknown })?.addresses)
        ? (root as { addresses: unknown[] }).addresses
        : null;

    if (!rows) continue;

    const accounts = rows
      .map((entry) => {
        const row = entry as {
          address?: string;
          addressString?: string;
          btcAddress?: string;
          paymentAddress?: string;
          purpose?: string;
          type?: string;
        };

        return {
          address: row.address || row.addressString || row.btcAddress || row.paymentAddress,
          purpose: row.purpose || row.type,
        };
      })
      .filter((item) => Boolean(item.address));

    if (accounts.length > 0) return accounts;
  }

  return [];
};

const extractXverseInscriptions = (payload: unknown): RawInscription[] => {
  const roots: unknown[] = [
    payload,
    (payload as { result?: unknown })?.result,
    (payload as { data?: unknown })?.data,
  ];

  for (const root of roots) {
    const rows = Array.isArray(root)
      ? root
      : (root as { inscriptions?: unknown[]; list?: unknown[]; items?: unknown[]; results?: unknown[] });

    const source = Array.isArray(rows)
      ? rows
      : rows.inscriptions || rows.list || rows.items || rows.results || [];

    if (!Array.isArray(source) || source.length === 0) continue;

    return source.map((entry) => {
      const row = entry as {
        inscriptionId?: string;
        inscription_id?: string;
        id?: string;
        contentType?: string;
        mimeType?: string;
        mediaType?: string;
        content_type?: string;
      };

      return {
        inscriptionId: row.inscriptionId || row.inscription_id || row.id,
        contentType: row.contentType || row.mimeType || row.mediaType || row.content_type,
      };
    });
  }

  return [];
};

const getXverseProvider = (): XverseProvider | null => {
  if (typeof window === 'undefined') return null;

  const providers: unknown[] = [window.BitcoinProvider, window.bitcoin, window.XverseProviders];

  for (const candidate of providers) {
    if (!candidate || typeof candidate !== 'object') continue;

    const provider = candidate as XverseProvider;
    if (typeof provider.request === 'function' || typeof provider.getAccounts === 'function') {
      return provider;
    }

    const nested = Object.values(candidate as Record<string, unknown>);
    for (const item of nested) {
      if (!item || typeof item !== 'object') continue;
      const nestedProvider = item as XverseProvider;
      if (typeof nestedProvider.request === 'function' || typeof nestedProvider.getAccounts === 'function') {
        return nestedProvider;
      }
    }
  }

  return null;
};

const unwrapXverseResult = (payload: unknown) => {
  const response = payload as { status?: string; result?: unknown };
  if (response?.status === 'success') return response.result;
  if (response?.status && response.status !== 'success') {
    throw new Error('Xverse request failed');
  }
  return payload;
};

const tryXverseRequest = async (provider: XverseProvider, method: string, params?: unknown): Promise<unknown> => {
  if (typeof provider.request !== 'function') {
    throw new Error('Xverse request method unavailable');
  }

  const attempts: Array<() => Promise<unknown>> = [
    () => provider.request!(method, params),
    () => provider.request!({ method, params }),
  ];

  let lastError: unknown = null;
  for (const run of attempts) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('Xverse request failed'));
};

const requestXverse = async (method: string, params?: unknown): Promise<unknown> => {
  const provider = getXverseProvider();
  if (!provider) throw new Error('Xverse wallet not detected');

  if (typeof provider.request === 'function') {
    try {
      const response = await tryXverseRequest(provider, method, params);
      return unwrapXverseResult(response);
    } catch (requestError) {
      if (!provider.getAccounts && !provider.getInscriptions && !provider.signMessage) {
        throw requestError;
      }
    }
  }

  if (method === 'getAccounts' && typeof provider.getAccounts === 'function') {
    const response = await provider.getAccounts(params);
    return unwrapXverseResult(response);
  }

  if ((method === 'ord_getInscriptions' || method === 'getInscriptions') && typeof provider.getInscriptions === 'function') {
    const query = params as { offset?: number; limit?: number };
    const response = await provider.getInscriptions(query?.offset || 0, query?.limit || 100);
    return unwrapXverseResult(response);
  }

  if (method === 'signMessage' && typeof provider.signMessage === 'function') {
    const response = await provider.signMessage(params);
    return unwrapXverseResult(response);
  }

  throw new Error(`Xverse provider does not support method: ${method}`);
};

type WalletConnectError = Error & {
  code?: string;
  deeplink?: string;
  walletProvider?: WalletProviderName;
};

const PENDING_MOBILE_WALLET_KEY = 'myinscribed.pendingMobileWallet';
const PENDING_MOBILE_WALLET_TS_KEY = 'myinscribed.pendingMobileWalletTs';
const PENDING_MOBILE_WALLET_MAX_AGE_MS = 10 * 60 * 1000;
const CONNECTED_WALLET_KEY = 'myinscribed.connectedWallet';

type PersistedConnectedWallet = {
  provider: ConnectedWalletProvider;
  address: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFor = async (check: () => boolean, attempts = 12, delayMs = 250) => {
  for (let index = 0; index < attempts; index += 1) {
    if (check()) return true;
    await sleep(delayMs);
  }
  return check();
};

const readPendingMobileWallet = (): ConnectedWalletProvider | null => {
  if (typeof window === 'undefined') return null;

  const wallet = window.sessionStorage.getItem(PENDING_MOBILE_WALLET_KEY);
  const tsRaw = window.sessionStorage.getItem(PENDING_MOBILE_WALLET_TS_KEY);
  const ts = Number(tsRaw || 0);
  const isFresh = Number.isFinite(ts) && ts > 0 && Date.now() - ts < PENDING_MOBILE_WALLET_MAX_AGE_MS;

  if (!isFresh) {
    window.sessionStorage.removeItem(PENDING_MOBILE_WALLET_KEY);
    window.sessionStorage.removeItem(PENDING_MOBILE_WALLET_TS_KEY);
    return null;
  }

  if (wallet === 'unisat' || wallet === 'xverse') return wallet;
  return null;
};

const writePendingMobileWallet = (wallet: ConnectedWalletProvider) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PENDING_MOBILE_WALLET_KEY, wallet);
  window.sessionStorage.setItem(PENDING_MOBILE_WALLET_TS_KEY, Date.now().toString());
};

const clearPendingMobileWallet = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_MOBILE_WALLET_KEY);
  window.sessionStorage.removeItem(PENDING_MOBILE_WALLET_TS_KEY);
};

const readPersistedConnectedWallet = (): PersistedConnectedWallet | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(CONNECTED_WALLET_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { provider?: string; address?: string };
    const walletProvider = parsed?.provider;
    const walletAddress = parsed?.address;

    if ((walletProvider === 'unisat' || walletProvider === 'xverse') && typeof walletAddress === 'string' && walletAddress) {
      return {
        provider: walletProvider,
        address: walletAddress,
      };
    }
  } catch {
  }

  window.localStorage.removeItem(CONNECTED_WALLET_KEY);
  return null;
};

const writePersistedConnectedWallet = (wallet: PersistedConnectedWallet) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONNECTED_WALLET_KEY, JSON.stringify(wallet));
};

const clearPersistedConnectedWallet = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CONNECTED_WALLET_KEY);
};

const stripWalletReturnParams = () => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const keysToDrop = [
    'wallet',
    'walletReturn',
    'wallet_status',
    'status',
    'inXverse',
    'inUnisat',
    'error',
    'cancelled',
    'data',
    'message',
  ];

  let removed = false;
  keysToDrop.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      removed = true;
    }
  });

  if (removed) {
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, document.title, nextUrl);
  }
};

const WalletContext = createContext({
  isWalletConnected: false,
  provider: null as WalletProviderName,
  address: '',
  walletItems: [] as WalletMediaItem[],
  hasContent: false,
  contentCount: 0,
  availableWallets: { unisat: false, xverse: true },
  authStatus: 'idle' as AuthStatus,
  authRoles: [] as WalletRole[],
  authSessionToken: '',
  authError: '',
  runtime: {
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    inWalletBrowser: false,
    walletBrowserType: null,
  } as WalletRuntime,
  mobileConnectNotice: '',
  mobileResumeWallet: null as ConnectedWalletProvider | null,
  connectWallet: async (_provider: Exclude<WalletProviderName, null>, _options?: ConnectWalletOptions) => '',
  disconnectWallet: () => {},
  setWalletItems: (_items: WalletMediaItem[]) => {},
  clearMobileConnectNotice: () => {},
  consumeMobileResumeWallet: () => {},
  fetchInscriptions: async (_limit = 100, _provider?: ConnectedWalletProvider) => [] as RawInscription[],
  authenticateWallet: async (_inscriptionIds: string[] = []) => ({
    ok: false,
    status: 'idle' as AuthStatus,
    roles: [] as WalletRole[],
  }),
  hasRole: (_role: WalletRole) => false,
  hasAnyRole: (_roles: readonly WalletRole[]) => false,
});

const normalizeInscriptions = (inscriptions: RawInscription[]) =>
  inscriptions
    .map((item) => ({
      inscriptionId: item.inscriptionId || item.id,
      contentType: item.contentType || item.mimeType || item.content_type,
    }))
    .filter((item) => Boolean(item.inscriptionId));

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState<WalletProviderName>(null);
  const [address, setAddress] = useState('');
  const [walletItems, setWalletItems] = useState<WalletMediaItem[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [availableWallets, setAvailableWallets] = useState({ unisat: false, xverse: true });
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authRoles, setAuthRoles] = useState<WalletRole[]>([]);
  const [authSessionToken, setAuthSessionToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [runtime, setRuntime] = useState<WalletRuntime>(() => getWalletRuntime());
  const [mobileConnectNotice, setMobileConnectNotice] = useState('');
  const [mobileResumeWallet, setMobileResumeWallet] = useState<ConnectedWalletProvider | null>(null);

  useEffect(() => {
    const persistedWallet = readPersistedConnectedWallet();
    if (!persistedWallet) return;

    setProvider((current) => current || persistedWallet.provider);
    setAddress((current) => current || persistedWallet.address);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refreshRuntime = () => {
      const nextRuntime = getWalletRuntime();
      setRuntime(nextRuntime);

      const hasUnisat = Boolean(window.unisat) || nextRuntime.walletBrowserType === 'unisat';
      const hasXverse =
        Boolean(window.BitcoinProvider || window.XverseProviders || window.bitcoin?.isXverse) ||
        nextRuntime.walletBrowserType === 'xverse' ||
        nextRuntime.isMobile;

      setAvailableWallets({ unisat: hasUnisat || nextRuntime.isMobile, xverse: hasXverse });
    };

    refreshRuntime();
    window.addEventListener('resize', refreshRuntime);

    const returnedState = parseWalletReturnState();
    const pendingWallet = readPendingMobileWallet();
    if (returnedState.hasWalletReturn && returnedState.message) {
      setMobileConnectNotice(returnedState.message);
    }

    if (returnedState.hasWalletReturn && returnedState.status === 'success') {
      const resumeWallet = (returnedState.wallet || pendingWallet) as ConnectedWalletProvider | null;
      if (resumeWallet) {
        setMobileResumeWallet(resumeWallet);
        setMobileConnectNotice('Wallet connected. Syncing your media...');
      }
      stripWalletReturnParams();
    } else if (returnedState.hasWalletReturn && returnedState.status !== 'success') {
      stripWalletReturnParams();
    }

    if (!returnedState.hasWalletReturn && pendingWallet) {
      const currentRuntime = getWalletRuntime();
      const hasAnyProvider = Boolean(
        window.unisat || window.BitcoinProvider || window.XverseProviders || window.bitcoin?.isXverse,
      );

      if (currentRuntime.inWalletBrowser || hasAnyProvider) {
        setMobileResumeWallet(pendingWallet);
        setMobileConnectNotice('Resuming your wallet session and syncing media...');
      } else {
        setMobileConnectNotice('This browser cannot access your wallet directly. Continue in your wallet browser or connect on desktop.');
      }
    }

    return () => {
      window.removeEventListener('resize', refreshRuntime);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasUnisat = Boolean(window.unisat);
    const hasXverse = Boolean(window.BitcoinProvider || window.XverseProviders || window.bitcoin?.isXverse);
    setAvailableWallets((current) => ({
      unisat: current.unisat || hasUnisat,
      xverse: current.xverse || hasXverse,
    }));
  }, [runtime.inWalletBrowser, runtime.walletBrowserType]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const attemptResumeFromPending = () => {
      const pendingWallet = readPendingMobileWallet();
      if (!pendingWallet) return;

      const currentRuntime = getWalletRuntime();
      const hasAnyProvider = Boolean(
        window.unisat || window.BitcoinProvider || window.XverseProviders || window.bitcoin?.isXverse,
      );

      if (currentRuntime.inWalletBrowser || hasAnyProvider) {
        setMobileResumeWallet((current) => current || pendingWallet);
        setMobileConnectNotice('Resuming your wallet session and syncing media...');
      }
    };

    const onFocus = () => {
      attemptResumeFromPending();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptResumeFromPending();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const disconnectWallet = useCallback(() => {
    if (authSessionToken) {
      logoutWalletSession(authSessionToken).catch(() => {});
    }
    setProvider(null);
    setAddress('');
    setWalletItems([]);
    setContentCount(0);
    setAuthStatus('idle');
    setAuthRoles([]);
    setAuthSessionToken('');
    setAuthError('');
    clearPendingMobileWallet();
    clearPersistedConnectedWallet();
  }, [authSessionToken]);

  const connectWallet = useCallback(async (walletProvider: Exclude<WalletProviderName, null>, options?: ConnectWalletOptions) => {
    const currentRuntime = getWalletRuntime();
    const skipDeeplink = Boolean(options?.skipDeeplink);
    const shouldUseMobileDeeplink =
      currentRuntime.isMobile &&
      !currentRuntime.inWalletBrowser &&
      !skipDeeplink &&
      (walletProvider === 'unisat' || walletProvider === 'xverse');

    if (shouldUseMobileDeeplink) {
      const deeplink = buildWalletDeeplink(walletProvider, {
        from: 'my.inscribed.audio',
        returnUrl: buildWalletReturnUrl(walletProvider),
      });
      writePendingMobileWallet(walletProvider);

      const connectError = new Error('Wallet deeplink launched') as WalletConnectError;
      connectError.code = 'DEEPLINK_LAUNCHED';
      connectError.deeplink = deeplink;
      connectError.walletProvider = walletProvider;

      window.location.href = deeplink;
      throw connectError;
    }

    if (walletProvider === 'unisat') {
      if (!window?.unisat) {
        await waitFor(() => Boolean(window?.unisat));
      }
      if (!window?.unisat) throw new Error('UniSat wallet not detected');
      const accounts =
        (await window.unisat.requestAccounts?.()) ||
        (await window.unisat.getAccounts?.()) ||
        [];
      const nextAddress = accounts[0];
      if (!nextAddress) throw new Error('No UniSat account available');
      setProvider('unisat');
      setAddress(nextAddress);
      clearPendingMobileWallet();
      writePersistedConnectedWallet({ provider: 'unisat', address: nextAddress });
      return nextAddress;
    }

    if (walletProvider === 'xverse') {
      if (!getXverseProvider()) {
        await waitFor(() => Boolean(getXverseProvider()));
      }
      const result = await requestXverse('getAccounts', {
        purposes: [ORDINALS_PURPOSE, PAYMENT_PURPOSE],
        message: 'Connect wallet to verify ownership and load inscriptions.',
      });
      const addresses = extractXverseAccounts(result);
      const ordinals = addresses.find((entry) => (entry.purpose || '').toLowerCase() === ORDINALS_PURPOSE);
      const nextAddress = ordinals?.address || addresses[0]?.address || '';
      if (!nextAddress) throw new Error('No Xverse account available');
      setProvider('xverse');
      setAddress(nextAddress);
      clearPendingMobileWallet();
      writePersistedConnectedWallet({ provider: 'xverse', address: nextAddress });
      return nextAddress;
    }

    throw new Error('Unsupported wallet provider');
  }, []);

  const clearMobileConnectNotice = useCallback(() => {
    setMobileConnectNotice('');
  }, []);

  const consumeMobileResumeWallet = useCallback(() => {
    setMobileResumeWallet(null);
  }, []);

  const fetchInscriptions = useCallback(async (limit = 100, providerOverride?: ConnectedWalletProvider) => {
    const effectiveProvider = providerOverride || provider;

    if (effectiveProvider === 'unisat') {
      if (!window?.unisat?.getInscriptions) return [];
      const result = await window.unisat.getInscriptions(0, limit);
      const normalized = normalizeInscriptions(result?.list || []);
      setContentCount(normalized.length);
      return normalized;
    }

    if (effectiveProvider === 'xverse') {
      const payload = await requestXverse('ord_getInscriptions', { offset: 0, limit });
      const normalized = normalizeInscriptions(extractXverseInscriptions(payload));
      setContentCount(normalized.length);
      return normalized;
    }

    setContentCount(0);
    return [];
  }, [provider]);

  const signWalletMessage = useCallback(async (message: string) => {
    if (provider === 'unisat') {
      if (!window?.unisat?.signMessage) throw new Error('UniSat signMessage unavailable');
      return window.unisat.signMessage(message, 'bip322-simple');
    }

    if (provider === 'xverse') {
      const result = await requestXverse('signMessage', {
        address,
        message,
        protocol: 'BIP322',
      });

      const resultObj = result as { signature?: string; result?: { signature?: string }; data?: { signature?: string } };
      const signature =
        resultObj?.signature ||
        resultObj?.result?.signature ||
        resultObj?.data?.signature ||
        (typeof result === 'string' ? result : '');

      if (!signature) throw new Error('Xverse signature missing');
      return signature;
    }

    throw new Error('No connected wallet provider for signing');
  }, [provider, address]);

  const authenticateWallet = useCallback(async (inscriptionIds: string[] = []) => {
    if (!provider || !address) {
      return { ok: false, status: 'idle' as AuthStatus, roles: [] };
    }

    try {
      setAuthStatus('pending');
      setAuthError('');
      const nonce = await createWalletNonce(provider, address);
      const signature = await signWalletMessage(nonce.message);

      const verified = await verifyWalletSignature({
        wallet: provider,
        address,
        nonceId: nonce.nonceId,
        signature,
        inscriptionIds,
      });

      const session = await getWalletSession(verified.sessionToken);
      setAuthSessionToken(verified.sessionToken);
      setAuthRoles((session.roles || []) as WalletRole[]);
      setAuthStatus('authenticated');
      return {
        ok: true,
        status: 'authenticated' as AuthStatus,
        roles: (session.roles || []) as WalletRole[],
      };
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const message = (error as { message?: string })?.message || 'Wallet authentication failed';
      if (code === 'WALLET_AUTH_NOT_CONFIGURED') {
        setAuthStatus('unavailable');
        setAuthRoles([]);
        setAuthSessionToken('');
        setAuthError('Wallet auth backend not configured');
        return { ok: false, status: 'unavailable' as AuthStatus, roles: [] };
      }

      setAuthStatus('error');
      setAuthRoles([]);
      setAuthSessionToken('');
      setAuthError(message);
      return { ok: false, status: 'error' as AuthStatus, roles: [] };
    }
  }, [provider, address, signWalletMessage]);

  const value = useMemo(() => ({
    isWalletConnected: Boolean(provider && address),
    provider,
    address,
    walletItems,
    hasContent: walletItems.length > 0 || contentCount > 0,
    contentCount,
    availableWallets,
    authStatus,
    authRoles,
    authSessionToken,
    authError,
    runtime,
    mobileConnectNotice,
    mobileResumeWallet,
    connectWallet,
    disconnectWallet,
    setWalletItems,
    clearMobileConnectNotice,
    consumeMobileResumeWallet,
    fetchInscriptions,
    authenticateWallet,
    hasRole: (role: WalletRole) => authRoles.includes(role),
    hasAnyRole: (roles: readonly WalletRole[]) => roles.some((role) => authRoles.includes(role)),
  }), [
    provider,
    address,
    walletItems,
    contentCount,
    availableWallets,
    authStatus,
    authRoles,
    authSessionToken,
    authError,
    runtime,
    mobileConnectNotice,
    mobileResumeWallet,
    connectWallet,
    disconnectWallet,
    setWalletItems,
    clearMobileConnectNotice,
    consumeMobileResumeWallet,
    fetchInscriptions,
    authenticateWallet,
    authRoles,
  ]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
