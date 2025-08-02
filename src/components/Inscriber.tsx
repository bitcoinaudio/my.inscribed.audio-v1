import React, { useState } from 'react';
import { useLaserEyes } from '@omnisat/lasereyes-react';
import { REGTEST, TESTNET, UNISAT, XVERSE, MAGIC_EDEN } from '@omnisat/lasereyes-core';
import { UploadCloud } from 'lucide-react';
// --- Reusable UI Components (can be moved to their own files) ---

const Card = ({ children, className = '' }) => (
  <div className={`border border-gray-700 rounded-xl shadow-lg p-6 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export const Input = ({ label, placeholder, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-600 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  </div>
);


const Button = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-4 py-2 font-semibold text-white rounded-md transition-all duration-300 ${
      disabled 
        ? 'bg-gray-600 cursor-not-allowed' 
        : 'bg-red-600 hover:bg-red-700 active:scale-95'
    } ${className}`}
  >
    {children}
  </button>
);


const StatusMessage = ({ message, isError = false }) => (
  <div className={`mt-4 p-3 rounded-md text-sm ${isError ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-blue-900/50 text-blue-300 border border-blue-700'}`}>
    <p style={{ wordBreak: 'break-word' }}>{message}</p>
  </div>
);


// --- Inscription Component ---

export default function Inscribe() {
  const { 
    connected, 
    address, 
    paymentAddress, 
    connect, 
    signPsbt,
    hasUnisat,
    hasXverse,
    hasMagicEden,
    getUtxos, 
  } = useLaserEyes();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  
  const [fundingOutpoint, setFundingOutpoint] = useState('');
  const [fundingValue, setFundingValue] = useState('');
  const [royaltyAmount, setRoyaltyAmount] = useState('');
  const [enableRoyalty, setEnableRoyalty] = useState(false);

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [txId, setTxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreview(reader.result);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleConnect = async (walletType: any) => {
    try {
      setError('');
      await connect(walletType);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    }
  };

  const handleInscribe = async () => {
    const walletAddress = paymentAddress || address;
    
    // Enhanced validation
    if (!file) {
      setError('Please select a file to inscribe.');
      return;
    }
    
    if (!walletAddress) {
      setError('Please connect your wallet.');
      return;
    }
    
    if (!fundingOutpoint || !fundingValue) {
      setError('Please provide funding UTXO details.');
      return;
    }
    
    if (enableRoyalty && (!royaltyAmount || parseInt(royaltyAmount) <= 0)) {
      setError('Please specify a valid royalty amount.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setStatus('Uploading file and preparing inscription...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('funding_outpoint', fundingOutpoint);
    formData.append('funding_value', fundingValue);
    formData.append('royalty_amount', royaltyAmount);
    formData.append('enable_royalty', enableRoyalty.toString());
    // In a real app, you'd get the user's name/ID after they log in.
    // We'll use a hardcoded name that matches a key file on the server.
    formData.append('inscriber_name', 'alice');

    try {
      // 1. Call Rust backend to create the commit and reveal transactions
      const response = await fetch('http://127.0.0.1:3000/api/inscribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const { reveal_psbt_base64, commit_tx_hex, inscription_id } = await response.json();
      setStatus('Transactions created. Please check your wallet to sign.');

      // In a real-world scenario, you would first broadcast the commit_tx_hex,
      // wait for it to confirm, and then sign and broadcast the reveal transaction.
      // For this regtest demo, we'll proceed directly to signing the reveal PSBT.
      
      // 2. Sign the reveal transaction PSBT using LaserEyes
      try {
        setStatus('Please sign the transaction in your wallet...');
        const signedPsbt = await signPsbt(reveal_psbt_base64, true, false);
        
        if (!signedPsbt?.signedPsbtHex) {
          throw new Error('Failed to get signed transaction hex');
        }
        
        setStatus('Transaction signed! Broadcasting to the network...');
        
        // 3. Broadcast the signed transaction  
        const broadcastResponse = await fetch('https://mempool.space/testnet/api/tx', {
          method: 'POST',
          body: signedPsbt.signedPsbtHex,
        });

        if (!broadcastResponse.ok) {
           const text = await broadcastResponse.text();
           throw new Error(`Broadcast failed: ${text}`);
        }
        
        const txid = await broadcastResponse.text();
        setTxId(txid);
        
        // If royalty was enabled, show success message
        if (enableRoyalty) {
          setStatus('Inscription complete with royalty enabled!');
        } else {
          setStatus('Inscription complete!');
        }
        
      } catch (signError: any) {
        if (signError.message?.includes('user reject') || signError.message?.includes('cancelled')) {
          setError('Signing cancelled by user.');
        } else {
          setError(`Signing failed: ${signError.message}`);
        }
      }

    } catch (err) {
      console.error(err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <Card className="w-full  ">
      <h2 className="text-xl font-semibold text-red-300 mb-4 text-center">Create New Inscription</h2>
      
      {!connected ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-300 text-center">Connect Your Wallet</h3>
          <div className="grid grid-cols-1 gap-3">
            {hasUnisat && (
              <Button onClick={() => handleConnect(UNISAT)} className="bg-orange-600 hover:bg-orange-700">
                Connect UniSat
              </Button>
            )}
            {hasXverse && (
              <Button onClick={() => handleConnect(XVERSE)} className="bg-blue-600 hover:bg-blue-700">
                Connect Xverse
              </Button>
            )}
            {hasMagicEden && (
              <Button onClick={() => handleConnect(MAGIC_EDEN)} className="bg-purple-600 hover:bg-purple-700">
                Connect Magic Eden
              </Button>
            )}
            {!hasUnisat && !hasXverse && !hasMagicEden && (
              <div className="text-center text-gray-400">
                <p>No supported wallets detected.</p>
                <p className="text-sm mt-2">Please install UniSat, Xverse, or Magic Eden wallet.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className=" border border-gray-600 rounded-lg p-4 w-full bg-gray-600 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Connected Wallet</h3>
            <p className="text-xs text-gray-400 break-all">{paymentAddress || address}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {preview ? (
                  <img src={preview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                )}
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-red-300 hover:text-red-500 focus-within:outline-none">
                    <span>{file ? 'Change file' : 'Select a file'}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">{file ? file.name : 'or drag and drop'}</p>
                </div>
                <p className="text-xs text-gray-500">Any file type up to 10MB</p>
              </div>
            </div>
          </div>

          <Input label="Funding UTXO (txid:vout)" placeholder="abcd...:0" value={fundingOutpoint} onChange={e => setFundingOutpoint(e.target.value)} />
          <Input label="Funding UTXO Value (sats)" placeholder="20000" value={fundingValue} onChange={e => setFundingValue(e.target.value)} type="number"/>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableRoyalty"
                checked={enableRoyalty}
                onChange={(e) => setEnableRoyalty(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="enableRoyalty" className="text-sm font-medium text-gray-300">
                Make this a royalty asset
              </label>
            </div>
            
            {enableRoyalty && (
              <Input 
                label="Royalty Fee (sats)" 
                placeholder="5000" 
                value={royaltyAmount} 
                onChange={e => setRoyaltyAmount(e.target.value)} 
                type="number"
              />
            )}
          </div>
          
          <Button onClick={handleInscribe} disabled={isLoading || !file}>
            {isLoading ? 'Inscribing...' : enableRoyalty ? 'Inscribe with Royalty' : 'Inscribe File'}
          </Button>
        </div>
      )}

      {(status || error || txId) && (
        <div className="mt-6">
          {status && <StatusMessage message={status} />}
          {error && <StatusMessage message={error} isError={true} />}
          {txId && (
            <div className="mt-4">
              <StatusMessage message={`Success! View your transaction on the mempool.`} />
              <a 
                href={`https://mempool.space/testnet/tx/${txId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 block text-center text-purple-400 hover:underline text-sm"
              >
                {txId}
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
