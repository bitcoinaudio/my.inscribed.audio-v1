export type DeeplinkWallet = "unisat" | "xverse";

type DeeplinkOptions = {
  from?: string;
  returnUrl?: string;
};

export type WalletReturnState = {
  wallet: DeeplinkWallet | null;
  returned: boolean;
};

const encode = (value: string) => encodeURIComponent(value);

export const buildWalletReturnUrl = (wallet: DeeplinkWallet) => {
  if (typeof window === "undefined") return "";

  const url = new URL(window.location.href);
  url.searchParams.set("wallet", wallet);
  url.searchParams.set("walletReturn", "1");
  return `${url.origin}${url.pathname}${url.search}${url.hash}`;
};

export const buildWalletDeeplink = (wallet: DeeplinkWallet, options: DeeplinkOptions = {}) => {
  const from = options.from || "my.inscribed.audio";
  const returnUrl = encode(options.returnUrl || buildWalletReturnUrl(wallet));

  if (wallet === "xverse") {
    return `https://xverse.app/open-url?url=${returnUrl}`;
  }

  return `unisat://dapp?url=${returnUrl}&from=${encode(from)}`;
};

export const buildWalletReentryDeeplink = (wallet: DeeplinkWallet) =>
  buildWalletDeeplink(wallet, {
    from: "my.inscribed.audio",
    returnUrl: buildWalletReturnUrl(wallet),
  });

export const parseWalletReturnState = (search = typeof window !== "undefined" ? window.location.search : ""): WalletReturnState => {
  const params = new URLSearchParams(search);
  const walletRaw = params.get("wallet");
  const wallet = walletRaw === "unisat" || walletRaw === "xverse" ? walletRaw : null;
  const returned = params.get("walletReturn") === "1";

  return { wallet, returned };
};
