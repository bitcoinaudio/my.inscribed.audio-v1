import { useState } from 'react'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { 
  MAINNET,
  REGTEST, 
  UNISAT, 
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE
} from '@omnisat/lasereyes-core'

// Main App Component
export default function App() {
  return (
    <LaserEyesProvider config={{ network: REGTEST }}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
         <WalletDemo />
      </div>
    </LaserEyesProvider>
  )
}

// Wallet Demo Component
function WalletDemo() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address, 
    balance, 
    sendBTC 
  } = useLaserEyes()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txId, setTxId] = useState('')

  // Connect wallet function
  const connectWallet = async (provider) => {
    setError('')
    setLoading(true)
    try {
      await connect(provider)
    } catch (error) {
      setError(error.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  // Format balance from satoshis to BTC
  const formatBalance = () => {
    if (!balance) return '0'
    return (Number(balance) / 100000000).toFixed(8)
  }


  if (!connected) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => connectWallet(UNISAT)}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Connect UniSat
          </button>
          <button
            onClick={() => connectWallet(XVERSE)}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Connect Xverse
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Wallet Info</h2>
        <p className="mb-2">Address: {address}</p>
        <p className="mb-4">Balance: {formatBalance()} BTC</p>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>

     </div>
  )
}