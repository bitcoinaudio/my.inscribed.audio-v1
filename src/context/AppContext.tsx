import { createContext, useContext, useReducer, ReactNode } from 'react';

// Network types matching Rust backend
export type BitcoinNetwork = 'mainnet' | 'testnet' | 'testnet4' | 'signet' | 'regtest';

export interface NetworkConfig {
  network: BitcoinNetwork;
  rpcUrl: string;
  ordServerUrl?: string;
  apiBaseUrl: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  creator_address: string;
  royalty_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Ordinal {
  id: string;
  inscription_id: string;
  collection_id?: string;
  owner_address: string;
  creator_address: string;
  royalty_address: string;
  royalty_amount: number;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  ordinal_id: string;
  seller_address: string;
  price_sats: number;
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ListingWithOrdinal extends Listing {
  ordinal: Ordinal;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// PSBT related types
export interface PsbtRequest {
  ordinal_input: string;
  ordinal_value: number;
  funding_input: string;
  funding_value: number;
  current_owner: string;
  royalty_key: string;
  new_owner: string;
  royalty_amount: number;
}

export interface PsbtResponse {
  psbt_base64: string;
  royalty_verified: boolean;
  royalty_verification_message: string;
  transaction_summary: TransactionSummary;
}

export interface TransactionSummary {
  inputs: InputSummary[];
  outputs: OutputSummary[];
  total_input_value: number;
  total_output_value: number;
  fees: number;
  royalty_amount: number;
  sale_amount: number;
}

export interface InputSummary {
  outpoint: string;
  value: number;
  address: string;
  input_type: string;
}

export interface OutputSummary {
  value: number;
  address: string;
  output_type: string;
}

// Application state
export interface AppState {
  networkConfig: NetworkConfig;
  collections: Collection[];
  ordinals: Ordinal[];
  listings: ListingWithOrdinal[];
  loading: boolean;
  error: string | null;
  walletConnected: boolean;
  walletAddress: string | null;
  selectedNetwork: BitcoinNetwork;
}

// Actions
export type AppAction =
  | { type: 'SET_NETWORK'; payload: BitcoinNetwork }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_ORDINALS'; payload: Ordinal[] }
  | { type: 'SET_LISTINGS'; payload: ListingWithOrdinal[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WALLET_CONNECTED'; payload: { connected: boolean; address?: string } }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'ADD_ORDINAL'; payload: Ordinal }
  | { type: 'ADD_LISTING'; payload: ListingWithOrdinal }
  | { type: 'UPDATE_ORDINAL_OWNER'; payload: { inscription_id: string; new_owner: string } };

// Network configurations
export const NETWORK_CONFIGS: Record<BitcoinNetwork, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    rpcUrl: 'https://bitcoin-mainnet-rpc.com',
    ordServerUrl: 'https://ordinals.com',
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  },
  testnet: {
    network: 'testnet',
    rpcUrl: 'https://bitcoin-testnet-rpc.com',
    ordServerUrl: 'https://testnet.ordinals.com',
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  },
  testnet4: {
    network: 'testnet4',
    rpcUrl: 'https://bitcoin-testnet4-rpc.com',
    ordServerUrl: 'https://testnet4.ordinals.com',
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  },
  signet: {
    network: 'signet',
    rpcUrl: 'https://bitcoin-signet-rpc.com',
    ordServerUrl: 'https://signet.ordinals.com',
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  },
  regtest: {
    network: 'regtest',
    rpcUrl: 'http://127.0.0.1:18443',
    ordServerUrl: 'http://127.0.0.1:8080',
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  },
};

// Initial state
const initialState: AppState = {
  networkConfig: NETWORK_CONFIGS.regtest,
  collections: [],
  ordinals: [],
  listings: [],
  loading: false,
  error: null,
  walletConnected: false,
  walletAddress: null,
  selectedNetwork: 'regtest',
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_NETWORK':
      return {
        ...state,
        selectedNetwork: action.payload,
        networkConfig: NETWORK_CONFIGS[action.payload],
        // Clear data when switching networks
        collections: [],
        ordinals: [],
        listings: [],
      };
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload };
    case 'SET_ORDINALS':
      return { ...state, ordinals: action.payload };
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_WALLET_CONNECTED':
      return {
        ...state,
        walletConnected: action.payload.connected,
        walletAddress: action.payload.address || null,
      };
    case 'ADD_COLLECTION':
      return {
        ...state,
        collections: [...state.collections, action.payload],
      };
    case 'ADD_ORDINAL':
      return {
        ...state,
        ordinals: [...state.ordinals, action.payload],
      };
    case 'ADD_LISTING':
      return {
        ...state,
        listings: [...state.listings, action.payload],
      };
    case 'UPDATE_ORDINAL_OWNER':
      return {
        ...state,
        ordinals: state.ordinals.map(ordinal =>
          ordinal.inscription_id === action.payload.inscription_id
            ? { ...ordinal, owner_address: action.payload.new_owner }
            : ordinal
        ),
      };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
