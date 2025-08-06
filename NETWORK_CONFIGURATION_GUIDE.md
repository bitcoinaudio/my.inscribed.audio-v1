# Bitcoin Royalty System - Network Configuration Guide

## Overview

The Bitcoin Royalty System now supports multiple Bitcoin networks with easy switching between them. The system defaults to **Testnet4** for safe testing while providing simple migration to mainnet when ready.

## Supported Networks

| Network | Description | RPC Port | Use Case |
|---------|-------------|----------|----------|
| **Testnet4** | Latest Bitcoin testnet (default) | 48332 | Primary development & testing |
| **Mainnet** | Live Bitcoin network | 8332 | Production use |
| **Testnet** | Legacy Bitcoin testnet | 18332 | Legacy compatibility |
| **Regtest** | Local development network | 18443 | Local testing |
| **Signet** | Bitcoin signet test network | 38332 | Advanced testing |

## Quick Start

### 1. Backend (Rust)

```powershell
# Windows
.\start-backend.ps1 testnet4    # Default - safe for testing
.\start-backend.ps1 mainnet     # Production - real Bitcoin!

# Linux/Mac
./start-backend.sh testnet4     # Default
./start-backend.sh mainnet      # Production
```

### 2. Frontend (React)

```powershell
# Windows
.\start-frontend.ps1 testnet4   # Default
.\start-frontend.ps1 mainnet    # Production

# Linux/Mac
./start-frontend.sh testnet4    # Default
./start-frontend.sh mainnet     # Production
```

## Environment Configuration

### Backend (.env files)

The backend uses environment files for each network:

- `.env.testnet4` - Testnet4 configuration (default)
- `.env.mainnet` - Mainnet configuration
- `.env.regtest` - Regtest configuration

Example `.env.testnet4`:
```bash
BITCOIN_NETWORK=testnet4
HOST=0.0.0.0
PORT=3000
RUST_LOG=debug
```

### Frontend (.env files)

The frontend uses Vite environment files:

- `.env.testnet4` - Testnet4 configuration (default)
- `.env.mainnet` - Mainnet configuration
- `.env.regtest` - Regtest configuration

Example `.env.testnet4`:
```bash
VITE_BITCOIN_NETWORK=testnet4
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Inscribed.Audio (Testnet4)
```

## Network Switching

### Runtime Network Switching (Frontend)

The frontend includes a network switcher in the UI:

1. Look for the network indicator in the navbar
2. Click "Switch Network" to see available options
3. Select your desired network
4. The app will automatically reconfigure LaserEyes

### Environment Variable Method

Set the `BITCOIN_NETWORK` environment variable:

```powershell
# Windows
$env:BITCOIN_NETWORK="testnet4"
cargo run

# Linux/Mac
export BITCOIN_NETWORK=testnet4
cargo run
```

## Safety Features

### Mainnet Warnings

- 🚨 **Backend**: Requires confirmation when starting on mainnet
- 🚨 **Frontend**: Shows red warning badges and alerts
- 🚨 **Network Switcher**: Clearly marks mainnet as "LIVE"

### Address Validation

All addresses are automatically validated for the current network:

```rust
// Backend automatically validates addresses
let address = validate_address(&address_string)?;

// Frontend shows network mismatches
if (backendNetwork !== frontendNetwork) {
  showWarning("Network mismatch detected");
}
```

## Bitcoin Core Setup

### Testnet4 (Recommended)

```bash
# Start Bitcoin Core on testnet4
bitcoind -testnet4 -daemon

# Create wallet
bitcoin-cli -testnet4 createwallet "test_wallet"

# Generate test coins
bitcoin-cli -testnet4 generatetoaddress 101 $(bitcoin-cli -testnet4 getnewaddress)
```

### Mainnet (Production)

```bash
# Start Bitcoin Core on mainnet
bitcoind -daemon

# Create wallet
bitcoin-cli createwallet "main_wallet"
```

### Regtest (Local Development)

```bash
# Start Bitcoin Core on regtest
bitcoind -regtest -daemon

# Create wallet
bitcoin-cli -regtest createwallet "regtest_wallet"

# Generate test coins
bitcoin-cli -regtest generatetoaddress 101 $(bitcoin-cli -regtest getnewaddress)
```

## Development Workflow

### 1. Local Development (Regtest)
```bash
# Start regtest Bitcoin Core
bitcoind -regtest -daemon

# Start backend on regtest
.\start-backend.ps1 regtest

# Start frontend on regtest
.\start-frontend.ps1 regtest
```

### 2. Testing (Testnet4)
```bash
# Start testnet4 Bitcoin Core
bitcoind -testnet4 -daemon

# Start backend on testnet4
.\start-backend.ps1 testnet4

# Start frontend on testnet4
.\start-frontend.ps1 testnet4
```

### 3. Production (Mainnet)
```bash
# Start mainnet Bitcoin Core
bitcoind -daemon

# Start backend on mainnet (with confirmation)
.\start-backend.ps1 mainnet

# Start frontend on mainnet (with warnings)
.\start-frontend.ps1 mainnet
```

## Wallet Configuration

### LaserEyes Wallet Support

The frontend automatically configures LaserEyes for the selected network:

```javascript
// Automatic network configuration
const config = {
  network: TESTNET4,  // or MAINNET, REGTEST, etc.
};
```

### Supported Wallets

- ✅ **Leather Wallet** - All networks
- ✅ **Unisat** - Mainnet, Testnet
- ✅ **Xverse** - Mainnet, Testnet
- ✅ **Magic Eden** - Mainnet, Testnet

## API Endpoints

### Network Information

```bash
GET /api/network
```

Returns current backend network configuration:

```json
{
  "network": "testnet4",
  "rpc_url": "http://127.0.0.1:48332",
  "rpc_port": 48332,
  "is_test_network": true
}
```

## Troubleshooting

### Network Mismatch

If frontend and backend networks don't match:

1. Check the network indicator in the UI
2. Restart backend with correct network
3. Use network switcher to align frontend

### Address Validation Errors

If you get "Invalid address network" errors:

1. Verify Bitcoin Core is running on correct network
2. Check environment variables
3. Ensure wallet addresses match network

### RPC Connection Issues

If backend can't connect to Bitcoin Core:

1. Verify Bitcoin Core is running
2. Check RPC port matches network
3. Verify RPC credentials (if using)

## Migration to Mainnet

When ready to deploy to mainnet:

1. **Test thoroughly on testnet4**
2. **Update environment files**
3. **Start mainnet Bitcoin Core**
4. **Use production startup scripts**
5. **Monitor for mainnet warnings**

```powershell
# Production deployment
.\start-backend.ps1 mainnet     # Backend
.\start-frontend.ps1 mainnet    # Frontend
```

## Security Considerations

- 🔒 **Never use mainnet for testing**
- 🔒 **Always verify network before transactions**
- 🔒 **Use environment files for sensitive config**
- 🔒 **Monitor network indicators in UI**
- 🔒 **Test thoroughly on testnet4 first**

---

**Remember**: Testnet4 is the default and recommended network for development and testing. Only switch to mainnet when you're ready for production use with real Bitcoin!
