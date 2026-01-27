# Frontend BORES Integration Guide

This guide provides complete instructions for aligning your frontend application with the BORES (Bitcoin Ordinals Royalty Enforcement System) API.

## 🎯 **API Endpoint Migration**

### **Use BORES v1 API Instead of Legacy Endpoints**

**Replace Legacy Calls:**
```javascript
// ❌ OLD - Don't use these anymore
POST /api/create-psbt
POST /api/verify-royalty

// ✅ NEW - Use these BORES v1 endpoints
POST /v1/policies          // Create royalty policies
GET  /v1/policies/{id}     // Get policy details  
POST /v1/royalties/quote   // Calculate royalty amounts
POST /v1/validate          // Validate PSBTs
GET  /health               // Health checks
```

## 🔐 **Authentication Implementation**

### **Add HMAC-SHA256 Request Signing**

For `/v1/*` endpoints, implement HMAC authentication:

```javascript
// Required headers for BORES v1 API
const headers = {
  'Content-Type': 'application/json',
  'X-BORES-KEY-ID': 'beatfeed-v1',
  'X-BORES-TIMESTAMP': Date.now().toString(),
  'X-BORES-SIGNATURE': calculateHMACSignature(requestData)
};

function calculateHMACSignature(method, path, body, timestamp, secret) {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const signingString = `${timestamp}.${method}.${path}.${bodyHash}`;
  return crypto.createHmac('sha256', secret).update(signingString).digest('hex');
}

function getAuthenticatedHeaders(method = 'POST', path = '', body = '') {
  const timestamp = Date.now().toString();
  const signature = calculateHMACSignature(method, path, body, timestamp, BORES_CONFIG.hmacSecret);
  
  return {
    'Content-Type': 'application/json',
    'X-BORES-KEY-ID': BORES_CONFIG.keyId,
    'X-BORES-TIMESTAMP': timestamp,
    'X-BORES-SIGNATURE': signature
  };
}
```

## 📋 **Policy-Based Workflow Implementation**

### **1. Policy Creation Flow**

```javascript
async function createRoyaltyPolicy(creatorInfo, royaltyPercentage) {
  const requestBody = JSON.stringify({
    scheme: "taproot_2of2_miniscript",
    royalty_bps: royaltyPercentage * 100, // Convert % to basis points
    royalty_recipient: {
      type: "pubkey",
      pubkey_hex: creatorInfo.publicKey
    },
    creator: {
      display_name: creatorInfo.name,
      wallet_address_hint: creatorInfo.address
    },
    metadata: {
      product_id: creatorInfo.productId,
      artifact_id: creatorInfo.artifactId
    }
  });

  const response = await fetch(`${BORES_CONFIG.baseUrl}/v1/policies`, {
    method: 'POST',
    headers: getAuthenticatedHeaders('POST', '/v1/policies', requestBody),
    body: requestBody
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create policy: ${response.statusText}`);
  }
  
  const { policy_id } = await response.json();
  return policy_id; // Store this for future transfers
}
```

### **2. Royalty Calculation Flow**

```javascript
async function calculateRoyalty(policyId, saleAmount) {
  const response = await fetch(`${BORES_CONFIG.baseUrl}/v1/royalties/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      policy_id: policyId,
      sale_amount: {
        amount: saleAmount,
        currency: "SATS"
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to calculate royalty: ${response.statusText}`);
  }
  
  const { royalty_amount, royalty_bps } = await response.json();
  return {
    amount: royalty_amount.amount, // Royalty in satoshis
    percentage: royalty_bps / 100   // Percentage for display
  };
}
```

### **3. PSBT Validation Flow**

```javascript
async function validateRoyaltyPSBT(policyId, psbtBase64) {
  const requestBody = JSON.stringify({
    policy_id: policyId,
    network: BORES_CONFIG.network,
    psbt_base64: psbtBase64
  });

  const response = await fetch(`${BORES_CONFIG.baseUrl}/v1/validate`, {
    method: 'POST',
    headers: getAuthenticatedHeaders('POST', '/v1/validate', requestBody),
    body: requestBody
  });
  
  if (!response.ok) {
    throw new Error(`PSBT validation failed: ${response.statusText}`);
  }
  
  const { ok, checks, message } = await response.json();
  
  // Return detailed validation results
  return {
    valid: ok,
    royaltyOutputPresent: checks.royalty_output_present,
    royaltyAmountOk: checks.royalty_amount_ok,
    scriptPathEnforced: checks.script_path_enforced,
    feeReasonable: checks.fee_reasonable,
    message: message
  };
}
```

### **4. Policy Retrieval**

```javascript
async function getPolicy(policyId) {
  const response = await fetch(`${BORES_CONFIG.baseUrl}/v1/policies/${policyId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to retrieve policy: ${response.statusText}`);
  }
  
  return await response.json();
}

async function listAllPolicies() {
  const response = await fetch(`${BORES_CONFIG.baseUrl}/v1/policies`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to list policies: ${response.statusText}`);
  }
  
  return await response.json();
}
```

## 🔄 **Updated Transfer Workflow**

### **Complete Policy-Based Transfer Flow**

```javascript
// ✅ NEW - Policy-based transfer workflow
async function transferOrdinalWithBORES(ordinalData, buyerInfo, salePrice) {
  try {
    // Step 1: Get or create policy for this ordinal
    let policyId = ordinalData.policyId;
    if (!policyId) {
      policyId = await createRoyaltyPolicy(ordinalData.creatorInfo, ordinalData.royaltyPercentage);
    }
    
    // Step 2: Calculate exact royalty amount
    const royaltyResult = await calculateRoyalty(policyId, salePrice);
    
    // Step 3: Create PSBT (using legacy endpoint for now)
    const psbtResponse = await fetch(`${BORES_CONFIG.baseUrl}/api/create-psbt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ordinal_input: ordinalData.utxo,
        ordinal_value: ordinalData.value,
        funding_input: buyerInfo.fundingUtxo,
        funding_value: buyerInfo.fundingAmount,
        current_owner_address: ordinalData.currentOwner,
        royalty_recipient_keys: ordinalData.creatorKeys,
        new_owner_keys: buyerInfo.keys,
        royalty_amount: royaltyResult.amount // Use calculated amount
      })
    });
    
    if (!psbtResponse.ok) {
      throw new Error(`PSBT creation failed: ${psbtResponse.statusText}`);
    }
    
    const { psbt_base64, royalty_verified } = await psbtResponse.json();
    
    // Step 4: Validate with BORES
    const validation = await validateRoyaltyPSBT(policyId, psbt_base64);
    
    // Step 5: Show validation results to user
    if (!validation.valid) {
      throw new Error(`BORES validation failed: ${validation.message}`);
    }
    
    return { 
      psbt_base64, 
      validation, 
      policyId,
      royaltyAmount: royaltyResult.amount,
      royaltyPercentage: royaltyResult.percentage
    };
    
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
}

// Helper function for getting or creating policies
async function getOrCreatePolicy(creatorInfo) {
  // First, try to find existing policy
  const policies = await listAllPolicies();
  const existingPolicy = policies.find(p => 
    p.creator.display_name === creatorInfo.name &&
    p.metadata.product_id === creatorInfo.productId
  );
  
  if (existingPolicy) {
    return existingPolicy.policy_id;
  }
  
  // Create new policy if none exists
  return await createRoyaltyPolicy(creatorInfo, creatorInfo.royaltyPercentage);
}
```

## 🔧 **Configuration Updates**

### **Environment Configuration**

```javascript
// Add to your config file
const BORES_CONFIG = {
  baseUrl: process.env.BORES_BASE_URL || 'http://127.0.0.1:3000',
  keyId: process.env.BORES_KEY_ID || 'beatfeed-v1',
  hmacSecret: process.env.BORES_HMAC_SECRET, // Get from backend team
  network: process.env.BITCOIN_NETWORK || 'regtest', // 'mainnet'/'testnet'/'regtest'
  defaultScheme: 'taproot_2of2_miniscript',
  
  // Validation settings
  dustLimit: 546, // Minimum satoshi amount
  maxRoyaltyBps: 10000, // 100% maximum
  
  // Timeout settings
  requestTimeout: 30000, // 30 seconds
  authWindow: 300000     // 5 minutes for timestamp validation
};

// Validate configuration on startup
function validateBORESConfig() {
  if (!BORES_CONFIG.hmacSecret) {
    throw new Error('BORES_HMAC_SECRET environment variable is required');
  }
  
  if (!['mainnet', 'testnet', 'regtest'].includes(BORES_CONFIG.network)) {
    throw new Error('Invalid BITCOIN_NETWORK. Must be mainnet, testnet, or regtest');
  }
  
  console.log(`✅ BORES configured for ${BORES_CONFIG.network} network`);
}
```

### **Address Format Validation**

```javascript
// ✅ Use correct address format for network
function validateAddressFormat(address, network = BORES_CONFIG.network) {
  const addressPrefixes = {
    'regtest': 'bcrt1p',
    'testnet': 'tb1p',
    'mainnet': 'bc1p'
  };
  
  const expectedPrefix = addressPrefixes[network];
  if (!address.startsWith(expectedPrefix)) {
    throw new Error(`${network} addresses must start with ${expectedPrefix}, got: ${address}`);
  }
  
  return address;
}

function convertAddressToNetwork(address, targetNetwork) {
  // Remove current prefix and add target network prefix
  const addressBody = address.substring(address.indexOf('1p') + 2);
  const targetPrefix = {
    'regtest': 'bcrt1p',
    'testnet': 'tb1p', 
    'mainnet': 'bc1p'
  }[targetNetwork];
  
  return targetPrefix + addressBody;
}
```

## 📊 **UI/UX Updates**

### **Policy Management Interface**

```javascript
// Policy creation form component
function PolicyCreationForm({ onPolicyCreated }) {
  const [formData, setFormData] = useState({
    displayName: '',
    royaltyPercentage: 5, // Default 5%
    productId: '',
    artifactId: '',
    publicKey: '',
    walletAddress: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const policyId = await createRoyaltyPolicy({
        name: formData.displayName,
        publicKey: formData.publicKey,
        address: formData.walletAddress,
        productId: formData.productId,
        artifactId: formData.artifactId
      }, formData.royaltyPercentage);
      
      onPolicyCreated(policyId);
      alert(`✅ Policy created successfully! ID: ${policyId}`);
    } catch (error) {
      alert(`❌ Policy creation failed: ${error.message}`);
    }
  };
  
  // Form JSX here...
}

// Policy viewer component
function PolicyViewer({ policyId }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadPolicy() {
      try {
        const policyData = await getPolicy(policyId);
        setPolicy(policyData);
      } catch (error) {
        console.error('Failed to load policy:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPolicy();
  }, [policyId]);
  
  if (loading) return <div>Loading policy...</div>;
  if (!policy) return <div>Policy not found</div>;
  
  return (
    <div className="policy-viewer">
      <h3>Royalty Policy Details</h3>
      <div className="policy-details">
        <p><strong>Creator:</strong> {policy.creator.display_name}</p>
        <p><strong>Royalty Rate:</strong> {policy.royalty_bps / 100}%</p>
        <p><strong>Scheme:</strong> {policy.scheme}</p>
        <p><strong>Created:</strong> {new Date(policy.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
```

### **Enhanced Validation Display**

```javascript
function BORESValidationDisplay({ validation }) {
  const getStatusIcon = (status) => status ? '✅' : '❌';
  const getStatusClass = (status) => status ? 'validation-pass' : 'validation-fail';
  
  return (
    <div className="bores-validation">
      <h3>🔒 BORES Validation Results</h3>
      
      <div className="validation-checks">
        <div className={`check-item ${getStatusClass(validation.royaltyOutputPresent)}`}>
          <span className="check-icon">{getStatusIcon(validation.royaltyOutputPresent)}</span>
          <span className="check-label">Royalty Output Present</span>
        </div>
        
        <div className={`check-item ${getStatusClass(validation.royaltyAmountOk)}`}>
          <span className="check-icon">{getStatusIcon(validation.royaltyAmountOk)}</span>
          <span className="check-label">Royalty Amount Correct</span>
        </div>
        
        <div className={`check-item ${getStatusClass(validation.scriptPathEnforced)}`}>
          <span className="check-icon">{getStatusIcon(validation.scriptPathEnforced)}</span>
          <span className="check-label">Script Path Enforced</span>
        </div>
        
        <div className={`check-item ${getStatusClass(validation.feeReasonable)}`}>
          <span className="check-icon">{getStatusIcon(validation.feeReasonable)}</span>
          <span className="check-label">Fee Reasonable</span>
        </div>
      </div>
      
      <div className={`validation-summary ${validation.valid ? 'valid' : 'invalid'}`}>
        <strong>Status:</strong> {validation.valid ? '✅ VALID' : '❌ INVALID'}
        {validation.message && <p className="validation-message">{validation.message}</p>}
      </div>
    </div>
  );
}

// Royalty calculator component
function RoyaltyCalculator({ policyId, onRoyaltyCalculated }) {
  const [saleAmount, setSaleAmount] = useState('');
  const [royalty, setRoyalty] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleCalculate = async () => {
    if (!saleAmount || !policyId) return;
    
    setLoading(true);
    try {
      const result = await calculateRoyalty(policyId, parseInt(saleAmount));
      setRoyalty(result);
      onRoyaltyCalculated && onRoyaltyCalculated(result);
    } catch (error) {
      alert(`Calculation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="royalty-calculator">
      <h4>💰 Royalty Calculator</h4>
      <div className="calculator-input">
        <label>Sale Amount (sats):</label>
        <input
          type="number"
          value={saleAmount}
          onChange={(e) => setSaleAmount(e.target.value)}
          placeholder="Enter sale amount..."
        />
        <button onClick={handleCalculate} disabled={loading || !saleAmount}>
          {loading ? 'Calculating...' : 'Calculate Royalty'}
        </button>
      </div>
      
      {royalty && (
        <div className="royalty-result">
          <p><strong>Royalty Amount:</strong> {royalty.amount} sats</p>
          <p><strong>Royalty Rate:</strong> {royalty.percentage}%</p>
          <p><strong>Creator Receives:</strong> {royalty.amount} sats</p>
          <p><strong>Seller Receives:</strong> {parseInt(saleAmount) - royalty.amount} sats</p>
        </div>
      )}
    </div>
  );
}
```

### **CSS Styles for BORES Components**

```css
/* BORES Validation Styles */
.bores-validation {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background: #f8fafc;
}

.validation-checks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
}

.check-item.validation-pass {
  background: #dcfce7;
  color: #166534;
}

.check-item.validation-fail {
  background: #fef2f2;
  color: #dc2626;
}

.validation-summary {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
}

.validation-summary.valid {
  background: #dcfce7;
  color: #166534;
  border: 2px solid #22c55e;
}

.validation-summary.invalid {
  background: #fef2f2;
  color: #dc2626;
  border: 2px solid #ef4444;
}

.validation-message {
  margin-top: 8px;
  font-weight: normal;
  font-style: italic;
}

/* Policy Components */
.policy-viewer {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 16px;
  background: white;
}

.policy-details p {
  margin: 8px 0;
}

/* Royalty Calculator */
.royalty-calculator {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 16px;
  background: white;
}

.calculator-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calculator-input label {
  font-weight: 500;
}

.calculator-input input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.calculator-input button {
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.calculator-input button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.royalty-result {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #3b82f6;
}

.royalty-result p {
  margin: 4px 0;
}
```

## 🚨 **Error Handling & User Feedback**

### **Comprehensive Error Handling**

```javascript
// Error handling utility
class BORESError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'BORESError';
    this.code = code;
    this.details = details;
  }
}

async function handleBORESRequest(requestFn, errorContext) {
  try {
    return await requestFn();
  } catch (error) {
    if (error.name === 'BORESError') {
      throw error;
    }
    
    // Handle specific HTTP errors
    if (error.message.includes('401')) {
      throw new BORESError(
        'Authentication failed. Please check your BORES credentials.',
        'AUTH_FAILED',
        { context: errorContext, originalError: error.message }
      );
    }
    
    if (error.message.includes('404')) {
      throw new BORESError(
        `Resource not found: ${errorContext}`,
        'NOT_FOUND',
        { context: errorContext, originalError: error.message }
      );
    }
    
    if (error.message.includes('400')) {
      throw new BORESError(
        'Invalid request data. Please check your input.',
        'BAD_REQUEST',
        { context: errorContext, originalError: error.message }
      );
    }
    
    // Generic error
    throw new BORESError(
      `BORES request failed: ${error.message}`,
      'REQUEST_FAILED',
      { context: errorContext, originalError: error.message }
    );
  }
}

// User-friendly error messages
function getUserFriendlyErrorMessage(error) {
  const errorMessages = {
    'AUTH_FAILED': '🔑 Authentication failed. Please contact support.',
    'NOT_FOUND': '🔍 The requested item could not be found.',
    'BAD_REQUEST': '⚠️ Please check your input and try again.',
    'NETWORK_ERROR': '🌐 Network error. Please check your connection.',
    'VALIDATION_FAILED': '❌ Royalty validation failed. Transaction cannot proceed.',
    'POLICY_NOT_FOUND': '📋 Royalty policy not found. Please create one first.',
    'INSUFFICIENT_FUNDS': '💰 Insufficient funds for transaction and royalty payment.'
  };
  
  return errorMessages[error.code] || `❌ ${error.message}`;
}
```

### **Loading States & User Feedback**

```javascript
// Loading state management
function useBORESOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = async (operation, errorContext) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await handleBORESRequest(operation, errorContext);
      return result;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { execute, loading, error };
}

// Progress indicator component
function BORESOperationStatus({ operation, status, error }) {
  const statusIcons = {
    'idle': '⏳',
    'creating_policy': '📋',
    'calculating_royalty': '💰',
    'creating_psbt': '🔨',
    'validating': '🔍',
    'completed': '✅',
    'error': '❌'
  };
  
  return (
    <div className="bores-operation-status">
      <div className="status-indicator">
        <span className="status-icon">{statusIcons[status]}</span>
        <span className="status-text">{operation}</span>
      </div>
      
      {error && (
        <div className="error-message">
          {getUserFriendlyErrorMessage(error)}
        </div>
      )}
    </div>
  );
}
```

## ⚠️ **Important Migration Notes**

### **Gradual Migration Strategy**

1. **Phase 1 - Add BORES Support**
   - Implement BORES API integration alongside existing code
   - Add policy creation and management
   - Test with regtest environment

2. **Phase 2 - Enhance Validation**
   - Replace basic royalty validation with BORES validation
   - Add comprehensive error handling
   - Improve user feedback

3. **Phase 3 - Full Migration**
   - Migrate all transfers to policy-based workflow
   - Remove legacy validation code
   - Deploy to production network

### **Backward Compatibility**

```javascript
// Maintain backward compatibility during migration
async function createTransferPSBT(ordinalData, buyerInfo, salePrice, options = {}) {
  if (options.useBORES && ordinalData.policyId) {
    // Use new BORES workflow
    return await transferOrdinalWithBORES(ordinalData, buyerInfo, salePrice);
  } else {
    // Fall back to legacy workflow
    return await legacyTransferWorkflow(ordinalData, buyerInfo, salePrice);
  }
}
```

### **Testing Checklist**

- [ ] HMAC authentication working correctly
- [ ] Policy creation and retrieval
- [ ] Royalty calculation accuracy
- [ ] PSBT validation with all checks
- [ ] Error handling for all failure cases
- [ ] Address format validation
- [ ] Network configuration (regtest/mainnet)
- [ ] UI components render correctly
- [ ] Loading states and error messages
- [ ] Backward compatibility maintained

### **Environment Variables**

Add these to your `.env` file:

```bash
# BORES Configuration
BORES_BASE_URL=http://127.0.0.1:3000
BORES_KEY_ID=beatfeed-v1
BORES_HMAC_SECRET=your_hmac_secret_here
BITCOIN_NETWORK=regtest

# Optional: Override defaults
BORES_REQUEST_TIMEOUT=30000
BORES_AUTH_WINDOW=300000
```

## 🎉 **Benefits After Migration**

After completing this integration, your frontend will provide:

- **🤖 Automatic royalty calculation** based on sale price and policy
- **🔍 Enhanced validation** with detailed BORES checks
- **📋 Policy persistence** across all transfers  
- **🔐 Secure authentication** with HMAC signing
- **🎯 Better error reporting** with actionable feedback
- **🏗️ Future-proof architecture** aligned with protocol standards
- **👥 Improved user experience** with clear validation status
- **⚡ Real-time royalty quotes** for transparent pricing

This migration ensures your frontend is fully compatible with the BORES royalty enforcement system while maintaining a seamless user experience and robust error handling.