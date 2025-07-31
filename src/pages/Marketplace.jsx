import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLaserEyes } from '@omnisat/lasereyes';
import bitcoinroyaltyimg from '../../public/images/bitcoinroyalty.png'
// import { getAddress, signPsbt } from 'sats-connect';

// --- Helper Components for a nicer UI ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

const Input = ({ label, placeholder, value, onChange, type = 'text' }) => (
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
  const [error, setError] = useState('');
  const [txId, setTxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = paymentAddress && ordinalsAddress;
  const iswalletConnected = useWallet();
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  

  // --- Wallet Connection Logic ---

//   const handleConnect = async () => {
//     try {
//       setError('');
//       setStatus('Connecting to wallet...');
//       const response = await getAddress({
//         payload: {
//           purposes: ['ordinals', 'payment'],
//           message: 'Connect to create your Ordinal Royalty Listing',
//           network: {
//             type: 'Testnet', // Use 'Mainnet' for production
//           },
//         },
//         onFinish: (response) => {
//           const ordinalsAccount = response.addresses.find(a => a.purpose === 'ordinals');
//           const paymentAccount = response.addresses.find(a => a.purpose === 'payment');
          
//           if (ordinalsAccount) {
//             setOrdinalsAddress(ordinalsAccount.address);
//             setOrdinalsPublicKey(ordinalsAccount.publicKey);
//           }
//           if (paymentAccount) {
//             setPaymentAddress(paymentAccount.address);
//             setPaymentPublicKey(paymentAccount.publicKey);
//           }
//           setStatus('Wallet connected successfully!');
//         },
//         onCancel: () => {
//           setError('Wallet connection cancelled.');
//           setStatus('');
//         },
//       });
//     } catch (err) {
//       console.error(err);
//       setError('Error connecting wallet. See console for details.');
//       setStatus('');
//     }
//   };

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
      current_owner: "alice", 
      royalty_key: "alice",
      new_owner: "bob", // The buyer
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
    <div className="bg-gray-600 rounded-xl shadow-lg min-h-screen text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-400">Ordinal Royalty Marketplace</h1>
          <p className="text-gray-400 mt-2">Create and purchase royalty-enforced Ordinal listings.</p>
        </header>

        <main>
          <Card>
            {!iswalletConnected ? (
              <div className="text-center">
                <p className="mb-4 text-gray-300">Connect your wallet to get started.</p>
                {/* <Button onClick={handleConnect}>Connect Wallet</Button> */}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-red-300 mb-4">Wallet Connected</h2>
                <div className="text-xs space-y-2 text-gray-400">
                  <p><strong>Ordinals Address:</strong> {address}</p>
                  <p><strong>Payment Address:</strong> {address}</p>
                </div>
              </div>
            )}
          </Card>

          {iswalletConnected && (
            <Card className="mt-6">
              <h2 className="text-xl font-semibold text-red-300 mb-4">Create Your Listing</h2>
              <p className="text-sm text-gray-400 mb-4">
                Enter the details of the Ordinal you are selling and the funding UTXO from the buyer.
              </p>
              <img src={`${bitcoinroyaltyimg}`} alt="Ordinal" className="h-96 w-96 w-full h-auto rounded-md mb-4" />
              <div className="space-y-4">
                <Input label="Ordinal Input (txid:vout)" placeholder="abcd...:0" value={ordinalInput} onChange={e => setOrdinalInput(e.target.value)} />
                <Input label="Ordinal Value (sats)" placeholder="777" value={ordinalValue} onChange={e => setOrdinalValue(e.target.value)} type="number"/>
                <Input label="Buyer's Funding Input (txid:vout)" placeholder="efgh...:1" value={fundingInput} onChange={e => setFundingInput(e.target.value)} />
                <Input label="Funding Value (sats)" placeholder="10000" value={fundingValue} onChange={e => setFundingValue(e.target.value)} type="number"/>
                <Input label="Royalty Amount (sats)" placeholder="2000" value={royaltyAmount} onChange={e => setRoyaltyAmount(e.target.value)} type="number"/>
                
                <Button onClick={handleCreateListing} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Create Listing & Sign'}
                </Button>
              </div>
            </Card>
          )}

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
        </main>
      </div>
    </div>
  );
}
