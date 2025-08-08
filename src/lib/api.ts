import { useAppContext, ApiResponse, BitcoinNetwork } from '../context/AppContext';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Generic API call method
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health check
  async ping() {
    return this.apiCall<{ status: string; network: string; version: string }>('/api/ping');
  }

  // Network operations
  async getNetworkInfo() {
    return this.apiCall<{
      network: string;
      rpc_url: string;
      ord_server_url?: string;
      block_height?: number;
      is_connected: boolean;
    }>('/api/network/info');
  }

  async switchNetwork(network: BitcoinNetwork) {
    return this.apiCall<{ network: string }>('/api/network/switch', {
      method: 'POST',
      body: JSON.stringify({ network }),
    });
  }

  // Collection operations
  async getCollections(page = 1, limit = 20) {
    return this.apiCall<any[]>(`/api/collections?page=${page}&limit=${limit}`);
  }

  async getCollection(id: string) {
    return this.apiCall<any>(`/api/collections/${id}`);
  }

  async createCollection(data: {
    name: string;
    description?: string;
    creator_address: string;
    royalty_percentage: number;
  }) {
    return this.apiCall<any>('/api/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Ordinal operations
  async getOrdinals(page = 1, limit = 20) {
    return this.apiCall<any[]>(`/api/ordinals?page=${page}&limit=${limit}`);
  }

  async getOrdinal(inscriptionId: string) {
    return this.apiCall<any>(`/api/ordinals/${inscriptionId}`);
  }

  // Marketplace operations
  async getListings(page = 1, limit = 20) {
    return this.apiCall<any[]>(`/api/listings?page=${page}&limit=${limit}`);
  }

  async getListing(id: string) {
    return this.apiCall<any>(`/api/listings/${id}`);
  }

  async createListing(data: {
    ordinal_id: string;
    seller_address: string;
    price_sats: number;
  }) {
    return this.apiCall<any>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Minting operations
  async createMintRequest(data: {
    content: string;
    content_type: string;
    creator_address: string;
    royalty_percentage: number;
    collection_id?: string;
  }) {
    return this.apiCall<{
      request_id: string;
      funding_address: string;
      required_amount: number;
    }>('/api/mint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMintStatus(requestId: string) {
    return this.apiCall<{
      status: string;
      inscription_id?: string;
      txid?: string;
    }>(`/api/mint/status/${requestId}`);
  }

  // PSBT operations
  async createSalePsbt(data: {
    ordinal_inscription_id: string;
    sale_price_sats: number;
    buyer_address: string;
    marketplace_fee_sats?: number;
  }) {
    return this.apiCall<{
      psbt_base64: string;
      transaction_summary: any;
    }>('/api/psbt/create-sale', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitSignedPsbt(data: {
    psbt_base64: string;
    broadcast: boolean;
  }) {
    return this.apiCall<{
      txid?: string;
      success: boolean;
    }>('/api/psbt/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPsbt(psbtBase64: string) {
    return this.apiCall<{
      is_valid: boolean;
      has_all_utxos: boolean;
      has_required_signatures: boolean;
      is_finalized: boolean;
      errors: string[];
      warnings: string[];
    }>('/api/psbt/verify', {
      method: 'POST',
      body: JSON.stringify({ psbt_base64: psbtBase64 }),
    });
  }

  // Transaction operations
  async getTransaction(txid: string) {
    return this.apiCall<any>(`/api/transactions/${txid}`);
  }

  async getTransactions(page = 1, limit = 20) {
    return this.apiCall<any[]>(`/api/transactions?page=${page}&limit=${limit}`);
  }

  // Wallet operations
  async generateWallet(network: BitcoinNetwork) {
    return this.apiCall<{
      name: string;
      addresses: Record<string, any>;
      master_xpub: string;
    }>('/api/wallet/generate', {
      method: 'POST',
      body: JSON.stringify({ network }),
    });
  }

  async importWallet(data: {
    name: string;
    mnemonic?: string;
    xpriv?: string;
    network: BitcoinNetwork;
  }) {
    return this.apiCall<{
      name: string;
      addresses: Record<string, any>;
    }>('/api/wallet/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWalletAddresses(walletName: string) {
    return this.apiCall<Record<string, any>>(`/api/wallet/${walletName}/addresses`);
  }

  // Legacy compatibility methods
  async createPsbtLegacy(data: {
    ordinal_input: string;
    ordinal_value: number;
    funding_input: string;
    funding_value: number;
    current_owner: string;
    royalty_key: string;
    new_owner: string;
    royalty_amount: number;
  }) {
    return this.apiCall<{
      psbt_base64: string;
      royalty_verified: boolean;
      royalty_verification_message: string;
    }>('/api/create-psbt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createRoyaltyAsset(data: {
    inscription_id: string;
    royalty_amount: number;
    owner_address: string;
  }) {
    return this.apiCall<{
      psbt_base64: string;
    }>('/api/create-royalty-asset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async inscribe(formData: FormData) {
    return this.apiCall<{
      inscription_id: string;
      funding_address: string;
      total_fees: number;
    }>('/api/inscribe', {
      method: 'POST',
      headers: {}, // Let fetch set Content-Type for FormData
      body: formData,
    });
  }
}

// React hook for using the API client
export function useApiClient() {
  const { state } = useAppContext();
  return new ApiClient(state.networkConfig.apiBaseUrl);
}
