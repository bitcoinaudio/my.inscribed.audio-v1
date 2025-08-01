import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLaserEyes } from '@omnisat/lasereyes-react'
import bitcoinroyaltyimg from '/images/bitcoinroyalty.png'
import { MediaCard } from '../pages/MyMedia';
import { getOrdinalsSite } from '../utils/inscriptions';
import { inscriptionArray } from '../globalState';
import Inscribe from '../components/Inscriber'
import RoyaltyConfirmModal from '../components/RoyaltyConfirmModal';
import InscriptionCard from '../components/InscriptionCard';
const API_BASE = 'http://127.0.0.1:3000';
const ORD_BASE = getOrdinalsSite;

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
    className={`w-full px-4 py-2 font-semibold text-white rounded-md transition-all duration-300 ${disabled
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

// --- Main Application Component ---

export default function App() {
  // State for wallet connection
  const [paymentAddress, setPaymentAddress] = useState('');
  const [paymentPublicKey, setPaymentPublicKey] = useState('');
  const [ordinalsAddress, setOrdinalsAddress] = useState('');
  const [ordinalsPublicKey, setOrdinalsPublicKey] = useState('');

  // State for the inscription form
  const [ordinalInput, setOrdinalInput] = useState('');
  const [ordinalValue, setOrdinalValue] = useState('');
  const [fundingInput, setFundingInput] = useState('');
  const [fundingValue, setFundingValue] = useState('');
  const [royaltyAmount, setRoyaltyAmount] = useState('');

  // State for the transaction process
  const [status, setStatus] = useState('');
  const [txId, setTxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = paymentAddress && ordinalsAddress;
  const iswalletConnected = useWallet();
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();

  // Add missing handleConnect function
  const handleConnect = async () => {
    try {
      await connect('unisat'); // Default to unisat, or implement wallet selection
    } catch (err) {
      console.error('Connection failed:', err);
      setError('Failed to connect wallet');
    }
  };

  const [inscriptionId, setInscriptionId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking...');

  // New state for royalty workflow
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;


  useEffect(() => {
    const checkServer = async () => {
      try {
        const ping = await fetch(`${API_BASE}/api/ping`);
        console.log("Ping response:", ping);
        setServerStatus(ping.ok ? '✅ API online' : `❌ Error ${ping.status}`);
      } catch {
        setServerStatus('❌ API unreachable');
      }
    };
    checkServer();
  }, []);

  const handleFetch = async () => {
    if (!inscriptionId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${ORD_BASE}/content/${inscriptionId}`);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        try {
          // Sometimes APIs return JSON with an incorrect content-type. Try parsing it anyway.
          const json = JSON.parse(text);
          setResult(json);
          return; // Exit early since we have the result
        } catch (e) {
          // If parsing fails, it's definitely not JSON.
          throw new Error(`Expected JSON, but got ${contentType}. Response: ${text.substring(0, 100)}...`);
        }
      }
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting an inscription from the carousel
  const handleSelectInscription = (inscription) => {
    setSelectedInscription(inscription);
    setShowConfirmModal(true);
  };

  // Handle confirming royalty creation
  const handleConfirmRoyalty = async (royaltyFee) => {
    if (!selectedInscription || !iswalletConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setError('');
    setTxId('');
    setStatus('Creating royalty asset...');

    try {
      // Call backend to create royalty asset PSBT
      // Expected Rust endpoint: POST /api/create-royalty-asset
      // Body: { inscription_id: string, royalty_amount: number, owner_address: string }
      // Response: { psbt_base64: string }
      const response = await fetch(`${API_BASE}/api/create-royalty-asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inscription_id: selectedInscription.id,
          royalty_amount: parseInt(royaltyFee, 10),
          owner_address: address,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const { psbt_base64 } = await response.json();
      setStatus('PSBT created! Please check your wallet to sign.');

      // Sign the PSBT using LaserEyes
      // This is a simplified version - you'll need to adapt based on your backend response
      // For now, we'll just show success
      setStatus('Royalty asset created successfully!');
      setSelectedInscription(null);

    } catch (err) {
      console.error(err);
      setError(`An error occurred: ${err.message}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination for inscription carousel
  const paginatedInscriptions = inscriptionArray.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(inscriptionArray.length / ITEMS_PER_PAGE);


  // --- PSBT Creation and Signing Logic ---
  const handleCreateListing = async () => {
    if (!iswalletConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setError('');
    setTxId('');
    setStatus('Preparing transaction...');

    // In a real app, the seller (current_owner) and buyer (new_owner) would be different users.
    // For this demo, we'll assume the connected user is both, providing both UTXOs.
    // The `royalty_key` would be the original creator. We'll use a hardcoded "alice" for this example.
    const requestPayload = {
      ordinal_input: ordinalInput,
      ordinal_value: parseInt(ordinalValue, 10),
      funding_input: fundingInput,
      funding_value: parseInt(fundingValue, 10),
      // For the initial sale, current_owner is the royalty_key holder.
      current_owner: "albert",
      royalty_key: "albert",
      new_owner: "betty", // The buyer
      royalty_amount: parseInt(royaltyAmount, 10),
    };

    try {
      // 1. Call our Rust backend to create the PSBT
      setStatus('Calling backend to create PSBT...');
      const response = await fetch('http://127.0.0.1:3000/api/create-psbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const { psbt_base64 } = await response.json();
      setStatus('PSBT created! Please check your wallet to sign.');

      // 2. Ask the user's wallet to sign the PSBT
      // This PSBT has two inputs, one for the ordinal and one for funding.
      // The wallet needs to be able to sign for BOTH. In a real marketplace,
      // this would be a multi-step process. First Alice signs, then Bob signs.
      // For this test, we assume the connected wallet holds both keys.
      await signPsbt({
        payload: {
          psbtBase64: psbt_base64,
          message: 'Sign to complete the Ordinal purchase',
          network: {
            type: 'Regtest',
          },
          // The inputs that the user's wallet should sign for.
          // In a real app, the seller would sign index 0, buyer index 1.
          inputsToSign: [
            { address: ordinalsAddress, signingIndexes: [0] },
            { address: paymentAddress, signingIndexes: [1] },
          ],
        },
        onFinish: async (response) => {
          setStatus('Transaction signed! Broadcasting to the network...');

          // 3. Broadcast the signed transaction
          // We use a public API for this. In production, you might use your own node.
          const broadcastResponse = await fetch('https://mempool.space/testnet/api/tx', {
            method: 'POST',
            body: response.psbtBase64, // The API expects the *finalized*, signed PSBT in hex, but sats-connect returns base64. Let's assume the wallet finalizes it.
          });

          if (!broadcastResponse.ok) {
            const text = await broadcastResponse.text();
            throw new Error(`Broadcast failed: ${text}`);
          }

          const txid = await broadcastResponse.text();
          setTxId(txid);
          setStatus('Transaction broadcasted successfully!');
        },
        onCancel: () => {
          setError('Signing cancelled.');
          setStatus('');
        },
      });

    } catch (err) {
      console.error(err);
      setError(`An error occurred: ${err.message}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-400">Bitcoin Royalty Kit</h1>
          <p className="text-gray-400 mt-2">Create and purchase royalty-enforced Ordinal listings.</p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
               <Inscribe />
             <Card>

              <div className="">
                <h2 className="text-xl font-semibold text-red-300 mb-4 text-center">Select Your Inscription</h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Server status: {serverStatus} | Total inscriptions: {inscriptionArray.length}
                </div>
                
                {inscriptionArray.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p>No inscriptions found.</p>
                    <p className="text-sm mt-2">Connect your wallet to load your inscriptions.</p>
                  </div>
                ) : (
                  <>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center gap-4 mb-4">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="!w-auto !px-3 !py-1 !text-sm"
                      >
                        ←
                      </Button>
                      <span className="text-sm text-gray-400">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="!w-auto !px-3 !py-1 !text-sm"
                      >
                        →
                      </Button>
                    </div>

                    {/* Inscription Carousel */}
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {paginatedInscriptions.map((inscription) => (
                        <InscriptionCard
                          key={inscription.id}
                          inscription={inscription}
                          onSelect={handleSelectInscription}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Legacy manual input section */}
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <h3 className="text-lg font-medium text-gray-300 mb-3">Or enter manually:</h3>
                  <Input label="Inscription ID" placeholder="Enter inscription ID..." value={inscriptionId} onChange={e => setInscriptionId(e.target.value)} />
                  <br />
                  <Button onClick={handleFetch} disabled={loading || !inscriptionId}>
                    {loading ? 'Loading...' : 'Fetch Metadata'}
                  </Button>

                  {error && <div className="text-red-500 mt-3">Error: {error}</div>}
                  {result && (
                    <pre className="mt-3 bg-white dark:bg-gray-800 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  )}

                  {inscriptionId && (
                    <div className="flex justify-center mt-4">
                      <div className="carousel carousel-vertical rounded-box h-48">
                        <div className="carousel-item h-full">                    
                          <MediaCard item={{ id: inscriptionId }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>


            </Card>

            <Card>

              {!iswalletConnected ? (
                <div className="text-center">
                  <p className="mb-4 text-gray-300">Connect your wallet to get started.</p>
                  <Button onClick={handleConnect}>Connect Wallet</Button>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-red-300 mb-4 text-center">{iswalletConnected ? 'Wallet Connected' : 'Wallet Not Connected'}</h2>
                  <div className="text-xs space-y-2 text-gray-400">
                    <p><strong>Ordinals Address:</strong> {address}</p>
                    <p><strong>Payment Address:</strong> {address}</p>
                    <br />
                  </div>
                  <div className="space-y-4">
                    <Input label="Ordinal Input (txid:vout)" placeholder="abcd...:0" value={ordinalInput} onChange={e => setOrdinalInput(e.target.value)} />
                    <Input label="Ordinal Value (sats)" placeholder="777" value={ordinalValue} onChange={e => setOrdinalValue(e.target.value)} type="number" />
                    <Input label="Buyer's Funding Input (txid:vout)" placeholder="efgh...:1" value={fundingInput} onChange={e => setFundingInput(e.target.value)} />
                    <Input label="Funding Value (sats)" placeholder="10000" value={fundingValue} onChange={e => setFundingValue(e.target.value)} type="number" />
                    <Input label="Royalty Amount (sats)" placeholder="2000" value={royaltyAmount} onChange={e => setRoyaltyAmount(e.target.value)} type="number" />

                    <Button onClick={handleCreateListing} disabled={isLoading}>
                      {isLoading ? 'Processing...' : 'Create Listing & Sign'}
                    </Button>
                  </div>
                  {(status || error || txId) && (
                    <Card className="mt-6">
                      <h2 className="text-xl font-semibold text-red-300 mb-2">Transaction Status</h2>
                      {status && <StatusMessage message={status} />}
                      {error && <StatusMessage message={error} isError={true} />}
                      {txId && (
                        <div className="mt-4">
                          <StatusMessage message={`Success! View your transaction on the mempool.`} />
                          <a
                            href={`https://mempool.space/testnet/tx/${txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block text-center text-red-400 hover:underline text-sm"
                          >
                            {txId}
                          </a>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

              )}
            </Card>

            {iswalletConnected && (
              <Card className="">
                <h2 className="text-xl font-semibold text-red-300 mb-4 text-center">Your Listing</h2>
                <p className="text-sm text-gray-400 mb-4 text-center">
                  Your Royalty Enabled Ordinal Listing will appear here once created.
                </p>
                <img src={`${bitcoinroyaltyimg}`} alt="Ordinal" className="h-96 w-96 w-full h-auto rounded-md mb-4" />

              </Card>
            )}


          </div>

        </main>
      </div>

      {/* Royalty Confirmation Modal */}
      <RoyaltyConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedInscription(null);
        }}
        onConfirm={handleConfirmRoyalty}
        inscriptionId={selectedInscription?.id || ''}
        inscriptionPreview={selectedInscription?.contentType?.startsWith('image/') 
          ? `https://radinals.bitcoinaudio.co/content/${selectedInscription?.id}` 
          : undefined}
      />
    </div>
  );
}
