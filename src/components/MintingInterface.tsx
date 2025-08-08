import React, { useState } from 'react';
import { useApiClient } from '../lib/api';
import { useAppContext } from '../context/AppContext';

interface MintFormData {
  content: string;
  contentType: string;
  creatorAddress: string;
  royaltyPercentage: number;
  collectionId?: string;
}

export function MintingInterface() {
  const { state, dispatch } = useAppContext();
  const apiClient = useApiClient();
  const [formData, setFormData] = useState<MintFormData>({
    content: '',
    contentType: 'text/plain',
    creatorAddress: state.walletAddress || '',
    royaltyPercentage: 5.0,
    collectionId: '',
  });
  const [mintResult, setMintResult] = useState<{
    request_id: string;
    funding_address: string;
    required_amount: number;
  } | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'royaltyPercentage' ? parseFloat(value) : value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        contentType: file.type || 'application/octet-stream',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      let content = formData.content;
      
      // If file is selected, read it as base64
      if (selectedFile) {
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:mime;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      const response = await apiClient.createMintRequest({
        content,
        content_type: formData.contentType,
        creator_address: formData.creatorAddress,
        royalty_percentage: formData.royaltyPercentage,
        collection_id: formData.collectionId || undefined,
      });

      if (response.success && response.data) {
        setMintResult(response.data);
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to create mint request' });
      }
    } catch (error) {
      console.error('Minting error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create mint request' });
    } finally {
      setIsMinting(false);
    }
  };

  const checkMintStatus = async () => {
    if (!mintResult) return;

    try {
      const response = await apiClient.getMintStatus(mintResult.request_id);
      if (response.success && response.data) {
        if (response.data.status === 'completed' && response.data.inscription_id) {
          // Mint completed successfully
          alert(`Inscription created successfully! ID: ${response.data.inscription_id}`);
          setMintResult(null);
          setFormData({
            content: '',
            contentType: 'text/plain',
            creatorAddress: state.walletAddress || '',
            royaltyPercentage: 5.0,
            collectionId: '',
          });
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error('Error checking mint status:', error);
    }
  };

  return (
    <div className="minting-interface max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Mint Ordinal with Royalty</h2>
      
      {!mintResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content input */}
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, contentType: 'text/plain' }))}
                className={`px-4 py-2 rounded ${formData.contentType === 'text/plain' ? 'bg-bitcoin text-white' : 'bg-gray-200'}`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, contentType: 'image/png' }))}
                className={`px-4 py-2 rounded ${formData.contentType.startsWith('image/') ? 'bg-bitcoin text-white' : 'bg-gray-200'}`}
              >
                Image
              </button>
            </div>
          </div>

          {formData.contentType === 'text/plain' ? (
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Text Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required={!selectedFile}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-bitcoin focus:border-bitcoin"
                placeholder="Enter the text content to inscribe..."
              />
            </div>
          ) : (
            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-2">
                Select File
              </label>
              <input
                type="file"
                id="file"
                accept="image/*"
                onChange={handleFileSelect}
                required={!formData.content}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-bitcoin focus:border-bitcoin"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          )}

          {/* Creator address */}
          <div>
            <label htmlFor="creatorAddress" className="block text-sm font-medium mb-2">
              Creator Address
            </label>
            <input
              type="text"
              id="creatorAddress"
              name="creatorAddress"
              value={formData.creatorAddress}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-bitcoin focus:border-bitcoin"
              placeholder="bc1p..."
            />
          </div>

          {/* Royalty percentage */}
          <div>
            <label htmlFor="royaltyPercentage" className="block text-sm font-medium mb-2">
              Royalty Percentage (%)
            </label>
            <input
              type="number"
              id="royaltyPercentage"
              name="royaltyPercentage"
              value={formData.royaltyPercentage}
              onChange={handleInputChange}
              min="0"
              max="50"
              step="0.1"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-bitcoin focus:border-bitcoin"
            />
          </div>

          {/* Collection (optional) */}
          <div>
            <label htmlFor="collectionId" className="block text-sm font-medium mb-2">
              Collection (Optional)
            </label>
            <select
              id="collectionId"
              name="collectionId"
              value={formData.collectionId}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-bitcoin focus:border-bitcoin"
            >
              <option value="">No Collection</option>
              {state.collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isMinting || (!formData.content && !selectedFile)}
            className="w-full bg-bitcoin text-white py-3 px-6 rounded-md hover:bg-bitcoin-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMinting ? 'Creating Mint Request...' : 'Create Mint Request'}
          </button>
        </form>
      ) : (
        <div className="funding-instructions text-center">
          <h3 className="text-xl font-semibold mb-4">Fund Your Inscription</h3>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-600 mb-2">Send exactly this amount to the funding address:</p>
            <p className="text-2xl font-bold text-bitcoin mb-2">
              {mintResult.required_amount} sats
            </p>
            <p className="text-sm font-mono bg-white p-2 rounded border break-all">
              {mintResult.funding_address}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={checkMintStatus}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Check Status
            </button>
            <button
              onClick={() => setMintResult(null)}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}
    </div>
  );
}
