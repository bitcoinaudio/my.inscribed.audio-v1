// Custom Regtest Wallet Provider for end-to-end testing
// This simulates a browser wallet but connects directly to your regtest

import * as bitcoin from 'bitcoinjs-lib';

export class RegtestWalletProvider {
  constructor() {
    this.network = bitcoin.networks.regtest;
    this.rpcUrl = 'http://127.0.0.1:18443';
    this.rpcUser = 'your_rpc_user';
    this.rpcPassword = 'your_rpc_password';
    this.currentWallet = null;
    this.wallets = {
      albert: {
        privateKey: 'your_albert_private_key_wif',
        address: 'your_albert_regtest_address'
      },
      betty: {
        privateKey: 'your_betty_private_key_wif', 
        address: 'your_betty_regtest_address'
      },
      chuck: {
        privateKey: 'your_chuck_private_key_wif',
        address: 'your_chuck_regtest_address'
      }
    };
  }

  // Simulate LaserEyes interface
  async connect(walletName = 'albert') {
    this.currentWallet = this.wallets[walletName];
    return true;
  }

  async getAddress() {
    return this.currentWallet?.address;
  }

  async getPublicKey() {
    if (!this.currentWallet) throw new Error('No wallet connected');
    
    const keyPair = bitcoin.ECPair.fromWIF(
      this.currentWallet.privateKey, 
      this.network
    );
    return keyPair.publicKey.toString('hex');
  }

  async getUtxos() {
    // Call your regtest Bitcoin Core RPC
    const response = await fetch('/api/regtest-utxos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        address: this.currentWallet.address 
      })
    });
    return response.json();
  }

  async signPsbt(psbtBase64) {
    // Use bitcoinjs-lib to sign with regtest keys
    const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
    const keyPair = bitcoin.ECPair.fromWIF(
      this.currentWallet.privateKey,
      this.network
    );
    
    // Sign all inputs that belong to this wallet
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    
    return psbt.toBase64();
  }

  // Helper method to switch between test users
  switchWallet(walletName) {
    if (this.wallets[walletName]) {
      this.currentWallet = this.wallets[walletName];
      return true;
    }
    return false;
  }
}

// Integration with your existing LaserEyes setup
export const createRegtestProvider = () => {
  return new RegtestWalletProvider();
};
