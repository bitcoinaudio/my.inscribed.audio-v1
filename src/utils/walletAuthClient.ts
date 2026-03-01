type WalletName = "unisat" | "xverse";

type NonceResponse = {
  nonceId: string;
  message: string;
  issuedAt: string;
  expiresAt: string;
  verificationConfigured?: boolean;
};

type VerifyResponse = {
  sessionToken: string;
  session: {
    wallet: WalletName;
    address: string;
    roles: string[];
    issuedAt: string;
    expiresAt: string;
  };
};

type SessionResponse = {
  authenticated: boolean;
  wallet: WalletName;
  address: string;
  roles: string[];
  issuedAt: string;
  expiresAt: string;
};

const DEFAULT_BASE_URL =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_WALLET_AUTH_BASE_URL as string | undefined) ||
  "";

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${DEFAULT_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error || `Wallet auth request failed (${response.status})`);
    (error as Error & { code?: string; status?: number }).code = data?.code;
    (error as Error & { code?: string; status?: number }).status = response.status;
    throw error;
  }

  return data as T;
}

export async function createWalletNonce(wallet: WalletName, address: string): Promise<NonceResponse> {
  return requestJson<NonceResponse>("/api/wallet-auth/nonce", {
    method: "POST",
    body: JSON.stringify({ wallet, address }),
  });
}

export async function verifyWalletSignature(payload: {
  wallet: WalletName;
  address: string;
  nonceId: string;
  signature: string;
  inscriptionIds: string[];
}): Promise<VerifyResponse> {
  return requestJson<VerifyResponse>("/api/wallet-auth/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getWalletSession(sessionToken: string): Promise<SessionResponse> {
  return requestJson<SessionResponse>("/api/wallet-auth/session", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
}

export async function logoutWalletSession(sessionToken: string): Promise<{ ok: true }> {
  return requestJson<{ ok: true }>("/api/wallet-auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
}
