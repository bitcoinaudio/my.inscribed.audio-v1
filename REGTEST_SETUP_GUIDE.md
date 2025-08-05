# Regtest End-to-End Testing Setup Guide

## Prerequisites

1. **Bitcoin Core running in regtest mode**
2. **Ord server connected to regtest**
3. **Your Rust API server running**
4. **Leather Wallet browser extension**

## Step 1: Configure Bitcoin Core for Regtest

```bash
# Start bitcoind in regtest mode
bitcoind -regtest -daemon -rpcuser=test -rpcpassword=test -rpcbind=127.0.0.1 -rpcallowip=127.0.0.1

# Create test wallets
bitcoin-cli -regtest createwallet albert
bitcoin-cli -regtest createwallet betty  
bitcoin-cli -regtest createwallet chuck

# Generate initial coins
bitcoin-cli -regtest -rpcwallet=albert getnewaddress
bitcoin-cli -regtest generatetoaddress 101 <albert_address>
```

## Step 2: Setup Leather Wallet

1. **Install Leather Wallet** from Chrome Web Store
2. **Configure Custom Network:**
   - Open Leather → Settings → Network
   - Click "Add Custom Network"
   - Enter:
     ```
     Network Name: Bitcoin Regtest
     Network Type: Bitcoin
     RPC URL: http://127.0.0.1:18443
     RPC Username: test
     RPC Password: test
     ```

3. **Import Regtest Keys:**
   ```bash
   # Get private keys from your regtest wallets
   bitcoin-cli -regtest -rpcwallet=albert dumpprivkey <address>
   bitcoin-cli -regtest -rpcwallet=betty dumpprivkey <address>
   bitcoin-cli -regtest -rpcwallet=chuck dumpprivkey <address>
   ```
   - Import these keys into Leather Wallet

## Step 3: Update Frontend for Regtest

Add regtest detection to your LaserEyes configuration:

```javascript
// In App.jsx
const networkConfig = {
  network: process.env.NODE_ENV === 'development' ? REGTEST : MAINNET
};

<LaserEyesProvider config={networkConfig}>
```

## Step 4: Test Scenarios

### Test 1: Create Inscription with Royalty
1. Connect albert wallet in Leather
2. Go to `/royaltykit` in your app
3. Upload a test file
4. Set royalty amount (e.g., 5000 sats)
5. Create inscription
6. Sign PSBT in Leather
7. Verify inscription created

### Test 2: Transfer with Royalty (Albert → Betty)
1. Switch to betty wallet in Leather
2. Find albert's inscription
3. Create transfer PSBT
4. Verify royalty output to albert
5. Sign and broadcast
6. Check royalty payment received

### Test 3: Second Transfer (Betty → Chuck)
1. Switch to chuck wallet  
2. Transfer inscription from betty
3. Verify royalty STILL goes to albert (persistence)
4. Complete transaction

## Step 5: Debugging

### Check PSBT Details
```bash
# Use your debug tools
.\psbt_debug.ps1 -PsbtFile "psbts\test_transfer.psbt"
```

### Verify Transactions
```bash
# Check transaction details
bitcoin-cli -regtest getrawtransaction <txid> true

# Check wallet balances
bitcoin-cli -regtest -rpcwallet=albert getbalance
bitcoin-cli -regtest -rpcwallet=betty getbalance
```

### Monitor Royalty Payments
```bash
# Check if royalties are being paid correctly
bitcoin-cli -regtest -rpcwallet=albert listtransactions
```

## Common Issues & Solutions

### Issue: Leather can't connect to regtest
**Solution:** Ensure Bitcoin Core RPC is accessible:
```bash
curl -u test:test -d '{"jsonrpc":"1.0","id":"test","method":"getblockchaininfo","params":[]}' -H 'Content-Type: application/json' http://127.0.0.1:18443/
```

### Issue: Insufficient funds for fees
**Solution:** Generate more regtest coins:
```bash
bitcoin-cli -regtest generatetoaddress 10 <address>
```

### Issue: PSBT signing fails
**Solution:** Check UTXO information:
```bash
# Debug PSBT
curl -X POST http://localhost:3000/api/debug-psbt \
  -H "Content-Type: application/json" \
  -d '{"psbt_base64":"your_psbt_here"}'
```

## Expected Results

- ✅ Inscriptions created with embedded royalty information
- ✅ Transfers automatically include royalty payments
- ✅ Royalties persist across multiple sales
- ✅ All transactions broadcast successfully to regtest
- ✅ Balances update correctly for all parties
