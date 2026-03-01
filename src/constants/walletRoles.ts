export const WALLET_ROLES = {
  ADMIN: 'admin',
  CREATOR: 'creator',
  LISTENER: 'listener',
} as const;

export type WalletRole =
  | (typeof WALLET_ROLES)[keyof typeof WALLET_ROLES]
  | (string & {});

export const ADMIN_ONLY_ROLES: readonly WalletRole[] = [WALLET_ROLES.ADMIN];
export const CREATOR_OR_ADMIN_ROLES: readonly WalletRole[] = [
  WALLET_ROLES.ADMIN,
  WALLET_ROLES.CREATOR,
];

export const AUTHENTICATED_ROLES: readonly WalletRole[] = [
  WALLET_ROLES.LISTENER,
  WALLET_ROLES.CREATOR,
  WALLET_ROLES.ADMIN,
];
