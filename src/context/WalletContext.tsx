import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Wallet, { AddressPurpose, MessageSigningProtocols } from 'sats-connect';
import {
  createWalletNonce,
  getWalletSession,
  logoutWalletSession,
  verifyWalletSignature,
} from '../utils/walletAuthClient';
import type { WalletRole } from '../constants/walletRoles';

type WalletProviderName = 'unisat' | 'xverse' | null;
type AuthStatus = 'idle' | 'pending' | 'authenticated' | 'unavailable' | 'error';
type ConnectedWalletProvider = Exclude<WalletProviderName, null>;

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
  }
}

const WalletContext = createContext({
  isWalletConnected: false,
  provider: null as WalletProviderName,
  address: '',
  hasContent: false,
  contentCount: 0,
  availableWallets: { unisat: false, xverse: true },
  authStatus: 'idle' as AuthStatus,
  authRoles: [] as WalletRole[],
  authSessionToken: '',
  authError: '',
  connectWallet: async (_provider: Exclude<WalletProviderName, null>) => '',
  disconnectWallet: () => {},
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
  const [contentCount, setContentCount] = useState(0);
  const [availableWallets, setAvailableWallets] = useState({ unisat: false, xverse: true });
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authRoles, setAuthRoles] = useState<WalletRole[]>([]);
  const [authSessionToken, setAuthSessionToken] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasUnisat = Boolean(window.unisat);
    const hasXverse = Boolean(window.BitcoinProvider || window.XverseProviders);
    setAvailableWallets({ unisat: hasUnisat, xverse: hasXverse || true });
  }, []);

  const disconnectWallet = useCallback(() => {
    if (authSessionToken) {
      logoutWalletSession(authSessionToken).catch(() => {});
    }
    setProvider(null);
    setAddress('');
    setContentCount(0);
    setAuthStatus('idle');
    setAuthRoles([]);
    setAuthSessionToken('');
    setAuthError('');
  }, [authSessionToken]);

  const connectWallet = useCallback(async (walletProvider: Exclude<WalletProviderName, null>) => {
    if (walletProvider === 'unisat') {
      if (!window?.unisat) throw new Error('UniSat wallet not detected');
      const accounts =
        (await window.unisat.requestAccounts?.()) ||
        (await window.unisat.getAccounts?.()) ||
        [];
      const nextAddress = accounts[0];
      if (!nextAddress) throw new Error('No UniSat account available');
      setProvider('unisat');
      setAddress(nextAddress);
      return nextAddress;
    }

    if (walletProvider === 'xverse') {
      const response = await Wallet.request('getAccounts', {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: 'Connect wallet to verify ownership and load inscriptions.',
      });
      if (response.status !== 'success') {
        throw new Error('Xverse connection failed');
      }
      const addresses = response.result || [];
      const ordinals = addresses.find((entry) => entry.purpose === AddressPurpose.Ordinals);
      const nextAddress = ordinals?.address || addresses[0]?.address || '';
      if (!nextAddress) throw new Error('No Xverse account available');
      setProvider('xverse');
      setAddress(nextAddress);
      return nextAddress;
    }

    throw new Error('Unsupported wallet provider');
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
      const response = await Wallet.request('ord_getInscriptions', { offset: 0, limit });
      if (response.status !== 'success') return [];
      const payload = response.result;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.inscriptions || payload?.list || [];
      const normalized = normalizeInscriptions(rows);
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
      const response = await Wallet.request('signMessage', {
        address,
        message,
        protocol: MessageSigningProtocols.BIP322,
      });

      if (response.status !== 'success') {
        throw new Error('Xverse signMessage rejected');
      }

      const signature = (response.result as { signature?: string })?.signature || '';

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
    hasContent: contentCount > 0,
    contentCount,
    availableWallets,
    authStatus,
    authRoles,
    authSessionToken,
    authError,
    connectWallet,
    disconnectWallet,
    fetchInscriptions,
    authenticateWallet,
    hasRole: (role: WalletRole) => authRoles.includes(role),
    hasAnyRole: (roles: readonly WalletRole[]) => roles.some((role) => authRoles.includes(role)),
  }), [
    provider,
    address,
    contentCount,
    availableWallets,
    authStatus,
    authRoles,
    authSessionToken,
    authError,
    connectWallet,
    disconnectWallet,
    fetchInscriptions,
    authenticateWallet,
    authRoles,
  ]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
