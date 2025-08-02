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
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden, signPsbt, connected, paymentAddress: laserEyesPaymentAddress, network } = useLaserEyes();

  // Add missing handleConnect function
  const handleConnect = async () => {
    try {
      await connect('unisat'); // Default to unisat, or implement wallet selection
    } catch (err) {
      console.error('Connection failed:', err);
      setError('Failed to connect wallet');
    }
  };

  // Custom getUtxos function with your Bitcoin node as primary source
  const getUtxos = async (address) => {
    if (!address) {
      throw new Error('Address is required for UTXO fetching');
    }

    // Parse ord server HTML response to extract UTXOs
    const parseOrdServerResponse = (htmlText) => {
      const utxos = [];
      // Extract UTXO references from the HTML outputs section
      const outputMatches = htmlText.match(/href=\/output\/([a-f0-9]{64}):(\d+)/gi);
      
      if (outputMatches) {
        outputMatches.forEach(match => {
          const [, txid, vout] = match.match(/href=\/output\/([a-f0-9]{64}):(\d+)/);
          if (txid && vout !== undefined) {
            utxos.push({
              txid: txid,
              vout: parseInt(vout, 10),
              value: 0, // We'll need to fetch individual values if needed
              status: { confirmed: true } // Assume confirmed from ord server
            });
          }
        });
      }
      
      console.log(`Parsed ${utxos.length} UTXOs from ord server response`);
      return utxos;
    };

    const networkEndpoints = {
      mainnet: 'https://radinals.bitcoinaudio.co',
      testnet: 'https://radinals.bitcoinaudio.co', // Your server handles all networks
      signet: 'https://radinals.bitcoinaudio.co',
      testnet4: 'https://radinals.bitcoinaudio.co'
    };

    // Determine current network (default to mainnet if not available)
    const currentNetwork = network || 'mainnet';
    const ordEndpoint = networkEndpoints[currentNetwork] || networkEndpoints.mainnet;

    // Primary data sources with your node first, then public APIs as fallback
    const dataSources = [
      {
        name: 'Your Bitcoin Node (ord server)',
        url: `${ordEndpoint}/address/${address}`,
        transform: parseOrdServerResponse,
        isHtml: true
      },
      {
        name: 'Mempool.space (fallback)',
        url: `https://mempool.space${currentNetwork === 'testnet' ? '/testnet' : currentNetwork === 'signet' ? '/signet' : currentNetwork === 'testnet4' ? '/testnet4' : ''}/api/address/${address}/utxo`,
        transform: (data) => data // Mempool format is standard
      },
      {
        name: 'Blockstream (fallback)',
        url: `https://blockstream.info${currentNetwork === 'testnet' ? '/testnet' : ''}/api/address/${address}/utxo`,
        transform: (data) => data.map(utxo => ({
          txid: utxo.txid,
          vout: utxo.vout,
          value: utxo.value,
          status: utxo.status || { confirmed: true }
        }))
      }
    ];

    // Try each data source with exponential backoff
    for (let sourceIndex = 0; sourceIndex < dataSources.length; sourceIndex++) {
      const source = dataSources[sourceIndex];
      console.log(`Attempting to fetch UTXOs from ${source.name}...`);

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(source.url, {
            signal: controller.signal,
            headers: source.isHtml ? {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            } : {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = source.isHtml ? await response.text() : await response.json();
          const transformedData = source.transform(data);
          
          console.log(`Successfully fetched ${transformedData.length} UTXOs from ${source.name}`);
          return transformedData;

        } catch (error) {
          console.warn(`Attempt ${attempt + 1} failed for ${source.name}:`, error.message);
          
          if (attempt < 2) {
            // Exponential backoff: wait 1s, then 2s, then 4s
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    }

    // If all sources fail, throw a comprehensive error
    throw new Error(
      `Failed to fetch UTXOs from all data sources. Please check your internet connection and try again. ` +
      `Address: ${address}, Network: ${currentNetwork}`
    );
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
    console.log("🎯 Inscription selected:", inscription);
    setSelectedInscription(inscription);
    setShowConfirmModal(true);
  };

  // Handle confirming royalty creation
  const handleConfirmRoyalty = async (royaltyFee) => {
    console.log("🎯 Starting royalty confirmation process...");
    console.log("Selected inscription:", selectedInscription);
    console.log("Royalty fee:", royaltyFee);
    console.log("Connected:", connected);
    
    if (!selectedInscription || !connected) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setError('');
    setTxId('');
    setStatus('Finding inscription UTXO...');
    
    try {
      // Find the UTXO for the selected inscription
      console.log("🔍 Finding inscription UTXO...");
      const inscriptionUtxo = await findInscriptionUtxo(selectedInscription.id);
      setStatus('Finding funding UTXO...');
      
      // Find a funding UTXO (exclude the inscription UTXO)
      console.log("💰 Finding funding UTXO...");
      const fundingUtxo = await findFundingUtxo(inscriptionUtxo.outpoint);
      
      // Populate the PSBT creation fields
      console.log("📝 Populating PSBT fields...");
      setOrdinalInput(inscriptionUtxo.outpoint);
      setOrdinalValue(inscriptionUtxo.value.toString());
      setFundingInput(fundingUtxo.outpoint);
      setFundingValue(fundingUtxo.value.toString());
      setRoyaltyAmount(royaltyFee);
      
      setStatus('UTXO information populated. Creating royalty asset...');
      console.log("✅ Populated PSBT fields:", {
        ordinalInput: inscriptionUtxo.outpoint,
        ordinalValue: inscriptionUtxo.value,
        fundingInput: fundingUtxo.outpoint,
        fundingValue: fundingUtxo.value,
        royaltyAmount: royaltyFee,
        address
      });

      // Close the modal and keep the form populated for user to proceed
      setShowConfirmModal(false);
      setStatus('✅ Inscription UTXO found and PSBT fields populated. You can now create the transaction.');

    } catch (err) {
      console.error("❌ Error in royalty confirmation:", err);
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

  // Test function to simulate PSBT field population with mock data
  const testPsbtPopulation = () => {
    console.log("🧪 Testing PSBT population with mock data...");
    
    // Mock inscription and UTXO data for testing
    const mockInscriptionId = "b1ade815da823de16f0dc26417c5bfb9caefc9005f0e9585b1f0072eb7e43605i1536";
    const mockInscriptionUtxo = {
      outpoint: "854016975dd6918b553bd2f4f6022d7f65d06f2d8f630882087c241ea754c6d0:0",
      value: 330
    };
    const mockFundingUtxo = {
      outpoint: "531d2ec0b6178dddaaf8ea22808109aa42f534113f09c5432bc5a03e8f50f14d:0", 
      value: 50000
    };
    const mockRoyaltyFee = "2000";
    
    // Populate the fields
    setOrdinalInput(mockInscriptionUtxo.outpoint);
    setOrdinalValue(mockInscriptionUtxo.value.toString());
    setFundingInput(mockFundingUtxo.outpoint);
    setFundingValue(mockFundingUtxo.value.toString());
    setRoyaltyAmount(mockRoyaltyFee);
    
    console.log("✅ Mock PSBT fields populated:", {
      ordinalInput: mockInscriptionUtxo.outpoint,
      ordinalValue: mockInscriptionUtxo.value,
      fundingInput: mockFundingUtxo.outpoint,
      fundingValue: mockFundingUtxo.value,
      royaltyAmount: mockRoyaltyFee
    });
    
    setStatus("Mock PSBT fields populated successfully!");
  };

  // Helper function to test wallet connection and UTXOs
  const testWalletConnection = async () => {
    console.log("🧪 Testing wallet connection...");
    console.log("Connected:", connected);
    console.log("Address:", address);
    
    if (!connected) {
      console.log("❌ Wallet not connected");
      return;
    }
    
    try {
      const utxos = await getUtxos(laserEyesPaymentAddress || paymentAddress);
      console.log("✅ UTXOs retrieved:", utxos);
      console.log("UTXO count:", utxos?.length || 0);
      
      if (utxos && utxos.length > 0) {
        console.log("Sample UTXO structure:", utxos[0]);
      }
    } catch (error) {
      console.error("❌ Error getting UTXOs:", error);
    }
  };

  // Helper function to find UTXO for inscription
  const findInscriptionUtxo = async (inscriptionId) => {
    console.log("🔍 Finding UTXO for inscription:", inscriptionId);
    
    try {
      // Get all UTXOs from the wallet
      const utxos = await getUtxos(laserEyesPaymentAddress || paymentAddress);
      console.log("📦 Available UTXOs:", utxos);
      
      if (!utxos || utxos.length === 0) {
        throw new Error("No UTXOs found in wallet. Please ensure your wallet has funds.");
      }
      
      // Find the UTXO that contains this inscription
      // The inscription ID format is usually 64-char-txid + 'i' + inscription_number
      // Example: abcd1234...i0
      const inscriptionMatch = inscriptionId.match(/^([a-f0-9]{64})i(\d+)$/);
      if (inscriptionMatch) {
        const txid = inscriptionMatch[1];
        const inscriptionNumber = inscriptionMatch[2];
        console.log("🎯 Parsed inscription - TXID:", txid, "Number:", inscriptionNumber);
        
        // Try to find UTXO by matching txid - inscription usually has vout 0
        const potentialUtxo = utxos.find(utxo => utxo.txid === txid);
        if (potentialUtxo) {
          console.log("✅ Found matching UTXO for inscription:", potentialUtxo);
          return {
            outpoint: `${potentialUtxo.txid}:${potentialUtxo.vout}`,
            value: potentialUtxo.value
          };
        }
      }
      
      // Fallback: try to find by common ordinal values (330 sats or dust limit 546)
      const ordinalUtxo = utxos.find(utxo => utxo.value === 330 || utxo.value === 546);
      if (ordinalUtxo) {
        console.log("⚡ Found potential ordinal UTXO by value:", ordinalUtxo);
        return {
          outpoint: `${ordinalUtxo.txid}:${ordinalUtxo.vout}`,
          value: ordinalUtxo.value
        };
      }
      
      // Last resort: use the smallest UTXO as it's likely the ordinal
      const sortedUtxos = [...utxos].sort((a, b) => a.value - b.value);
      if (sortedUtxos.length > 0) {
        console.log("🔄 Using smallest UTXO as inscription:", sortedUtxos[0]);
        return {
          outpoint: `${sortedUtxos[0].txid}:${sortedUtxos[0].vout}`,
          value: sortedUtxos[0].value
        };
      }
      
      throw new Error("Could not find suitable UTXO for inscription");
    } catch (error) {
      console.error("❌ Error finding inscription UTXO:", error);
      throw error;
    }
  };

  // Helper function to find a funding UTXO
  const findFundingUtxo = async (excludeOutpoint) => {
    console.log("💰 Finding funding UTXO, excluding:", excludeOutpoint);
    
    try {
      const utxos = await getUtxos(laserEyesPaymentAddress || paymentAddress);
      console.log("💳 Available UTXOs for funding:", utxos);
      
      if (!utxos || utxos.length === 0) {
        throw new Error("No UTXOs found in wallet for funding.");
      }
      
      // Find a UTXO that's not the inscription and has enough value for fees + royalty
      const fundingUtxo = utxos.find(utxo => {
        const utxoOutpoint = `${utxo.txid}:${utxo.vout}`;
        return utxoOutpoint !== excludeOutpoint && utxo.value >= 10000; // At least 10k sats for fees and royalty
      });
      
      if (fundingUtxo) {
        console.log("✅ Found suitable funding UTXO:", fundingUtxo);
        return {
          outpoint: `${fundingUtxo.txid}:${fundingUtxo.vout}`,
          value: fundingUtxo.value
        };
      }
      
      // If no large UTXO found, try to find any UTXO that's not the inscription
      const anyFundingUtxo = utxos.find(utxo => {
        const utxoOutpoint = `${utxo.txid}:${utxo.vout}`;
        return utxoOutpoint !== excludeOutpoint;
      });
      
      if (anyFundingUtxo) {
        console.warn("⚠️ Using smaller UTXO for funding, may not cover all fees:", anyFundingUtxo);
        return {
          outpoint: `${anyFundingUtxo.txid}:${anyFundingUtxo.vout}`,
          value: anyFundingUtxo.value
        };
      }
      
      throw new Error("Could not find suitable funding UTXO. You may need more than one UTXO in your wallet.");
    } catch (error) {
      console.error("❌ Error finding funding UTXO:", error);
      throw error;
    }
  };


  // --- PSBT Creation and Signing Logic ---
  const handleCreatePSBT = async () => {
    if (!connected) {
      setError("Please connect your wallet first.");
      return;
    }

    // Validate that we have all the required fields
    if (!ordinalInput || !ordinalValue || !fundingInput || !fundingValue || !royaltyAmount) {
      setError("Please select an inscription first to populate the PSBT fields.");
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
      current_owner: "alice", // This should be derived from the wallet or user session
      royalty_key: "alice",
      new_owner: "bob", // The buyer - in a real app this would be different
      royalty_amount: parseInt(royaltyAmount, 10),
    };

    try {
      // 1. Call our Rust backend to create the PSBT
      setStatus('Calling backend to create PSBT...');
      const response = await fetch(`${API_BASE}/api/create-psbt`, {
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

      // 2. Ask the user's wallet to sign the PSBT using LaserEyes
      setStatus('Please sign the transaction in your wallet...');
      
      try {
        // Sign the PSBT with LaserEyes
        const signedPsbt = await signPsbt(psbt_base64, true, false);
        
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
        setStatus('Transaction broadcasted successfully!');
        
      } catch (signError) {
        if (signError.message?.includes('user reject') || signError.message?.includes('cancelled')) {
          setError('Signing cancelled by user.');
        } else {
          setError(`Signing failed: ${signError.message}`);
        }
        setStatus('');
      }

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
        <header className="flex justify-center items-center gap-4 mb-8">
          <img src={`${bitcoinroyaltyimg}`} alt="Bitcoin Royalty" className="h-16 w-16 rounded-md" />
          <div className="text-left">
            <h1 className="text-4xl font-bold text-red-400">Bitcoin Royalty Kit</h1>
            <p className="text-gray-400 mt-1">Create and purchase royalty-enforced Ordinal listings.</p>
          </div>
        </header>
       
        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
               {/* <Inscribe /> */}
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

              {!connected ? (
                <div className="text-center">
                  <p className="mb-4 text-gray-300">Connect your wallet to get started.</p>
                  <Button onClick={handleConnect}>Connect Wallet</Button>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-red-300 mb-4 text-center">Create PSBT</h2>
                  <div className="text-xs space-y-2 text-gray-400 mb-4">
                    <p><strong>Ordinals Address:</strong> {address}</p>
                    <p><strong>Payment Address:</strong> {address}</p>
                    <p className="text-yellow-400 mt-2">
                      💡 Select an inscription from the carousel above to auto-populate these fields
                    </p>
                    <div className="mt-2">
                      <Button 
                        onClick={testWalletConnection} 
                        className="!w-auto !px-3 !py-1 !text-xs !bg-blue-600 !hover:bg-blue-700 mr-2"
                      >
                        🧪 Test Wallet & UTXOs
                      </Button>
                      <Button 
                        onClick={testPsbtPopulation} 
                        className="!w-auto !px-3 !py-1 !text-xs !bg-purple-600 !hover:bg-purple-700"
                      >
                        🔧 Test PSBT Fields
                      </Button>
                    </div>
                  </div>
                  {/* PSBT fields */}
                  <div className="space-y-4">
                    <Input label="Ordinal Input (txid:vout)" placeholder="abcd...:0" value={ordinalInput} onChange={e => setOrdinalInput(e.target.value)} />
                    <Input label="Ordinal Value (sats)" placeholder="777" value={ordinalValue} onChange={e => setOrdinalValue(e.target.value)} type="number" />
                    <Input label="Buyer's Funding Input (txid:vout)" placeholder="efgh...:1" value={fundingInput} onChange={e => setFundingInput(e.target.value)} />
                    <Input label="Funding Value (sats)" placeholder="10000" value={fundingValue} onChange={e => setFundingValue(e.target.value)} type="number" />
                    <Input label="Royalty Amount (sats)" placeholder="2000" value={royaltyAmount} onChange={e => setRoyaltyAmount(e.target.value)} type="number" />

                    {ordinalInput && ordinalValue && fundingInput && fundingValue && royaltyAmount && (
                      <div className="bg-green-900/20 border border-green-600 rounded-md p-3">
                        <p className="text-green-400 text-sm">✅ All fields populated from selected inscription</p>
                      </div>
                    )}

                    <Button onClick={handleCreatePSBT} disabled={isLoading}>
                      {isLoading ? 'Processing...' : 'Create Listing & Sign'}
                    </Button>
                  </div>

                  {/* Transaction Status Section */}
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

            {connected && (
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
