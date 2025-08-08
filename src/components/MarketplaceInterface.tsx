import React, { useState, useEffect } from 'react';
import { useApiClient } from '../lib/api';
import { useAppContext, ListingWithOrdinal } from '../context/AppContext';

export function MarketplaceInterface() {
  const { state, dispatch } = useAppContext();
  const apiClient = useApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingWithOrdinal | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [buyerAddress, setBuyerAddress] = useState('');

  useEffect(() => {
    loadListings();
  }, [state.selectedNetwork]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getListings();
      if (response.success && response.data) {
        dispatch({ type: 'SET_LISTINGS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load listings' });
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load listings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = (listing: ListingWithOrdinal) => {
    setSelectedListing(listing);
    setBuyerAddress(state.walletAddress || '');
    setShowBuyDialog(true);
  };

  const handlePurchase = async () => {
    if (!selectedListing || !buyerAddress) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Create sale PSBT
      const psbtResponse = await apiClient.createSalePsbt({
        ordinal_inscription_id: selectedListing.ordinal.inscription_id,
        sale_price_sats: selectedListing.price_sats,
        buyer_address: buyerAddress,
        marketplace_fee_sats: Math.floor(selectedListing.price_sats * 0.01), // 1% marketplace fee
      });

      if (psbtResponse.success && psbtResponse.data) {
        // In a real app, you'd sign this PSBT with the user's wallet
        alert(`PSBT created! In a real implementation, this would be signed by your wallet.\n\nPSBT: ${psbtResponse.data.psbt_base64.substring(0, 50)}...`);
        
        // For now, just close the dialog
        setShowBuyDialog(false);
        setSelectedListing(null);
      } else {
        dispatch({ type: 'SET_ERROR', payload: psbtResponse.error || 'Failed to create purchase PSBT' });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create purchase' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const formatSats = (sats: number) => {
    return (sats / 100000000).toFixed(8) + ' BTC';
  };

  const formatSatsToUSD = (sats: number, btcPrice = 45000) => {
    const btc = sats / 100000000;
    return '$' + (btc * btcPrice).toFixed(2);
  };

  return (
    <div className="marketplace-interface">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ordinals Marketplace</h2>
        <button
          onClick={loadListings}
          disabled={isLoading}
          className="bg-bitcoin text-white px-4 py-2 rounded-md hover:bg-bitcoin-dark disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {state.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold truncate">
                  Inscription #{listing.ordinal.inscription_id.split(':')[0].substring(0, 8)}...
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <strong>Creator:</strong> {listing.ordinal.creator_address.substring(0, 8)}...
                </div>
                <div>
                  <strong>Owner:</strong> {listing.ordinal.owner_address.substring(0, 8)}...
                </div>
                <div>
                  <strong>Royalty:</strong> {listing.ordinal.royalty_amount} sats
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-xl font-bold text-bitcoin mb-2">
                  {listing.price_sats.toLocaleString()} sats
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  {formatSats(listing.price_sats)} • {formatSatsToUSD(listing.price_sats)}
                </div>
                
                {listing.status === 'active' && (
                  <button
                    onClick={() => handleBuyClick(listing)}
                    className="w-full bg-bitcoin text-white py-2 px-4 rounded-md hover:bg-bitcoin-dark transition-colors"
                  >
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.listings.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No listings available</div>
          <div className="text-gray-400">
            Be the first to list an ordinal for sale!
          </div>
        </div>
      )}

      {/* Buy Dialog */}
      {showBuyDialog && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Purchase Ordinal</h3>
            
            <div className="space-y-4">
              <div>
                <strong>Inscription ID:</strong>
                <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                  {selectedListing.ordinal.inscription_id}
                </div>
              </div>
              
              <div>
                <strong>Price:</strong>
                <div className="text-lg text-bitcoin">
                  {selectedListing.price_sats.toLocaleString()} sats
                </div>
              </div>
              
              <div>
                <strong>Royalty Fee:</strong>
                <div className="text-sm text-gray-600">
                  {selectedListing.ordinal.royalty_amount} sats to creator
                </div>
              </div>
              
              <div>
                <strong>Marketplace Fee (1%):</strong>
                <div className="text-sm text-gray-600">
                  {Math.floor(selectedListing.price_sats * 0.01)} sats
                </div>
              </div>
              
              <div>
                <label htmlFor="buyerAddress" className="block text-sm font-medium mb-2">
                  Your Address
                </label>
                <input
                  type="text"
                  id="buyerAddress"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="bc1p..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-bitcoin focus:border-bitcoin"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBuyDialog(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!buyerAddress || state.loading}
                className="flex-1 bg-bitcoin text-white py-2 px-4 rounded-md hover:bg-bitcoin-dark disabled:opacity-50"
              >
                {state.loading ? 'Processing...' : 'Create Purchase PSBT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
