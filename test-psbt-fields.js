// Test Script for PSBT Field Population
// Run this in the browser console when on the Royalty Kit page

console.log("🚀 Starting PSBT field population test...");

// Test 1: Check if LaserEyes is available
console.log("Test 1: LaserEyes availability");
if (typeof window.laserEyes !== 'undefined') {
  console.log("✅ LaserEyes is available");
  console.log("Connection status:", window.laserEyes.connected);
  console.log("Address:", window.laserEyes.address);
} else {
  console.log("❌ LaserEyes not available");
}

// Test 2: Check if inscriptions are loaded
console.log("\nTest 2: Inscription data");
if (typeof window.inscriptionArray !== 'undefined' && window.inscriptionArray.length > 0) {
  console.log("✅ Inscriptions loaded:", window.inscriptionArray.length);
  console.log("First inscription:", window.inscriptionArray[0]);
} else {
  console.log("❌ No inscriptions loaded");
}

// Test 3: Check backend connectivity
console.log("\nTest 3: Backend connectivity");
fetch('http://localhost:3000/api/ping')
  .then(response => {
    if (response.ok) {
      return response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log("✅ Backend is responsive:", data);
  })
  .catch(error => {
    console.log("❌ Backend not reachable:", error.message);
  });

// Test 4: Simulate inscription selection
console.log("\nTest 4: Simulate inscription selection");
console.log("To test inscription selection:");
console.log("1. Click on an inscription in the carousel");
console.log("2. Set a royalty fee (e.g., 0.0001)");
console.log("3. Click 'Create Royalty Asset'");
console.log("4. Check console for detailed UTXO finding logs");

console.log("\n🧪 Test complete. Check browser console for any errors.");
