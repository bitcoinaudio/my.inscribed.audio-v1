# PSBT Fields Population Debug Guide

## Issues Identified and Fixed

### 1. **Wallet Connection Issues**
- **Problem**: Using `useWallet()` hook instead of LaserEyes `connected` state
- **Fix**: Updated all wallet connection checks to use `connected` from LaserEyes

### 2. **Unused Function Interference**
- **Problem**: `BuildCustomTx` function was defined but not used, potentially causing conflicts
- **Fix**: Removed the unused function

### 3. **UTXO Finding Logic**
- **Problem**: Inscription ID parsing was not robust enough
- **Fix**: Enhanced regex pattern to properly parse 64-character txids + 'i' + number format
- **Enhancement**: Added comprehensive logging for debugging

### 4. **Error Handling**
- **Problem**: Limited error feedback during UTXO finding process
- **Fix**: Added detailed console logging and improved error messages

## Testing Steps

### Step 1: Test Wallet Connection
1. Open the app at http://localhost:3333
2. Navigate to the Royalty Kit section
3. Click "Connect Wallet" if not connected
4. Click "🧪 Test Wallet & UTXOs" button
5. Check browser console for wallet connection and UTXO details

### Step 2: Test PSBT Field Population (Mock)
1. Click "🔧 Test PSBT Fields" button
2. Verify that all PSBT fields are populated with mock data
3. Check that the green success indicator appears

### Step 3: Test Real Inscription Selection
1. Ensure you have inscriptions loaded in the carousel
2. Click on an inscription
3. Set a royalty fee in the modal
4. Click "Create Royalty Asset"
5. Check console for detailed logging of the UTXO finding process
6. Verify PSBT fields are populated

## Expected Console Output

When selecting an inscription, you should see:
```
🎯 Inscription selected: {id: "...", ...}
🎯 Starting royalty confirmation process...
🔍 Finding inscription UTXO...
🔍 Finding UTXO for inscription: abc123...i0
📦 Available UTXOs: [...]
🎯 Parsed inscription - TXID: abc123... Number: 0
✅ Found matching UTXO for inscription: {...}
💰 Finding funding UTXO...
💰 Finding funding UTXO, excluding: abc123...:0
💳 Available UTXOs for funding: [...]
✅ Found suitable funding UTXO: {...}
📝 Populating PSBT fields...
✅ Populated PSBT fields: {...}
```

## Common Issues and Solutions

### Issue: "No UTXOs found in wallet"
- **Cause**: Wallet not properly connected or no funds
- **Solution**: Ensure wallet is connected and has UTXOs

### Issue: "Could not find suitable UTXO for inscription"
- **Cause**: Inscription ID format doesn't match expected pattern
- **Solution**: Check inscription ID format in console logs

### Issue: "Could not find suitable funding UTXO"
- **Cause**: Only one UTXO in wallet or insufficient funds
- **Solution**: Ensure wallet has multiple UTXOs with sufficient value

### Issue: PSBT fields not populating
- **Cause**: Error in UTXO finding process
- **Solution**: Check console logs for detailed error information

## Debug Commands

Open browser console and run:

```javascript
// Check wallet connection
console.log("Connected:", window.laserEyes?.connected);
console.log("Address:", window.laserEyes?.address);

// Check available inscriptions
console.log("Inscriptions:", window.inscriptionArray);

// Manual UTXO check (if available)
if (window.laserEyes?.getUtxos) {
  window.laserEyes.getUtxos().then(utxos => {
    console.log("UTXOs:", utxos);
  });
}
```
