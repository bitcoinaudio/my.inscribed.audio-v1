import React, { useState } from 'react';
import { useAppContext, BitcoinNetwork, NETWORK_CONFIGS } from '../context/AppContext';

export function NetworkSelector() {
  const { state, dispatch } = useAppContext();
  const [isChanging, setIsChanging] = useState(false);

  const handleNetworkChange = async (network: BitcoinNetwork) => {
    setIsChanging(true);
    try {
      dispatch({ type: 'SET_NETWORK', payload: network });
      
      // You could also call the API to switch network on the backend
      // const api = new ApiClient(NETWORK_CONFIGS[network].apiBaseUrl);
      // await api.switchNetwork(network);
      
    } catch (error) {
      console.error('Failed to switch network:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to switch network' });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="network-selector">
      <label htmlFor="network-select" className="block text-sm font-medium mb-2">
        Bitcoin Network
      </label>
      <select
        id="network-select"
        value={state.selectedNetwork}
        onChange={(e) => handleNetworkChange(e.target.value as BitcoinNetwork)}
        disabled={isChanging}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-bitcoin focus:border-bitcoin"
      >
        <option value="regtest">Regtest (Local Development)</option>
        <option value="testnet4">Testnet4 (Latest Testnet)</option>
        <option value="testnet">Testnet (Legacy)</option>
        <option value="signet">Signet</option>
        <option value="mainnet">Mainnet (Production)</option>
      </select>
      
      <div className="mt-2 text-sm text-gray-600">
        <div>RPC: {state.networkConfig.rpcUrl}</div>
        <div>API: {state.networkConfig.apiBaseUrl}</div>
        {state.networkConfig.ordServerUrl && (
          <div>Ord Server: {state.networkConfig.ordServerUrl}</div>
        )}
      </div>
      
      {isChanging && (
        <div className="mt-2 text-sm text-blue-600">
          Switching network...
        </div>
      )}
    </div>
  );
}
