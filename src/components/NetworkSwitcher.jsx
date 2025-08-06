import React from 'react';
import { useNetwork } from '../hooks/useNetwork';

const NetworkSwitcher = () => {
  const { currentNetwork, config, backendNetwork, switchNetwork, availableNetworks, isMainnet } = useNetwork();

  return (
    <div className="flex flex-col gap-2">
      {/* Current Network Display */}
      <div className={`badge ${isMainnet ? 'badge-error' : 'badge-success'} gap-2`}>
        <div className={`w-2 h-2 rounded-full ${isMainnet ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
        {config.display}
      </div>

      {/* Network Selector */}
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-outline">
          Switch Network
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          {availableNetworks.map((network) => (
            <li key={network}>
              <button
                onClick={() => switchNetwork(network)}
                className={`${currentNetwork === network ? 'active' : ''} ${network === 'mainnet' ? 'text-error' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{network.charAt(0).toUpperCase() + network.slice(1)}</span>
                  {network === 'mainnet' && (
                    <div className="badge badge-error badge-xs">LIVE</div>
                  )}
                  {currentNetwork === network && (
                    <div className="badge badge-success badge-xs">Active</div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Backend Status */}
      {backendNetwork && (
        <div className="text-xs opacity-60">
          Backend: {backendNetwork.network}
          {backendNetwork.network !== currentNetwork && (
            <span className="text-warning ml-1">⚠️ Mismatch</span>
          )}
        </div>
      )}

      {/* Mainnet Warning */}
      {isMainnet && (
        <div className="alert alert-error text-xs p-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Real Bitcoin Network!
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher;
