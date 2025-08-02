# my.inscribed.audio## Features

- **🔒 Native Bitcoin Royalties**
  - First-ever protocol-level royalty enforcement for Bitcoin Ordinals
  - Creators receive persi## Contributing

We welcome contributions! Please open issues or pull requests for any improvements or new features.

### Development Guidelines
- **Frontend**: React/Next.js with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and context
- **Testing**: Jest and React Testing Library
- **Wallet Integration**: LaserEyes framework

### Royalty System Development
- **Backend**: Rust with Axum web framework
- **Bitcoin Integration**: rust-bitcoin and miniscript crates
- **PSBT Creation**: Taproot script path enforcement
- **Testing**: Regtest environment with end-to-end tests

## 📚 Documentation

- **`ROYALTY_KIT_IMPLEMENTATION.md`** - Detailed royalty system integration
- **Backend README** - Complete API server documentation
- **`end-to-end-test.md`** - Full testing guide for royalty system

## 🔗 Related Projects

- **[ordinals-royalty-rust-gemini](../ordinals-royalty-rust-gemini)** - Backend royalty API server
- **[LaserEyes](https://github.com/omnisat/lasereyes-react)** - Bitcoin wallet integration framework
- **[Bitcoin Ordinals](https://ordinals.com)** - Ordinals protocol documentation

## License

This project is open source and available under the [MIT License](LICENSE).

---

**🎵 Don't trust? Verify.**  
Explore the [source code](https://github.com/bitcoinaudio/my.inscribed.audio-v1) and join the decentralized audio revolution on Bitcoin with native royalty enforcement!

### 🚀 **World's First Protocol-Level Bitcoin Royalties**
*Empowering creators with permanent, trustless revenue streams on the Bitcoin blockchain.*ts from all future sales
  - Taproot + Miniscript smart contract integration
  - No trusted third parties or middlemen required

- **Immutable Data**
  - Digital assets (audio, video, images, 3D models, text) are permanently stored on the Bitcoin blockchain.
  
- **Ordinals Protocol Support**
  - Full compatibility with all MIME types.
  - Collect, display, and manage Ordinals and BRC420 assets.
  - Enhanced with royalty-enabled PSBTs for transfers.

- **Decentralized & Open Source**
  - No reliance on centralized storage or platforms.
  - 100% open source—[don't trust, verify](https://github.com/bitcoinaudio/my.inscribed.audio-v1).

- **Gallery & Discovery**
  - Browse and preview featured and historic inscribed audio/art collections.
  - Collect unique assets and view detailed attributes.
  - See royalty information for creator-enabled inscriptions.

- **Personal Media Dashboard**
  - Connect your Unisat, Xverse, or Magic Eden wallet to view and manage your inscribed assets.udio** is a decentralized web platform for discovering, collecting, and showcasing digital audio and multimedia assets inscribed on the Bitcoin blockchain using Ordinals, **with native Bitcoin royalty enforcement**.

## 🌟 New: Bitcoin Royalty System

This platform now features the **world's first native Bitcoin royalty system** for Ordinals, enabling creators to receive persistent royalty payments from all future sales, enforced at the Bitcoin protocol level using Taproot and Miniscript.

### Royalty Features
- **Persistent Royalties**: Creators receive payments from ALL future sales
- **Protocol-Level Enforcement**: No trusted third parties required
- **Taproot Integration**: Uses Bitcoin's latest smart contract capabilities
- **PSBT Workflow**: Seamless integration with Bitcoin wallets
- **Ord Server Integration**: Real-time inscription and UTXO data

## Overview

Welcome to the future of music and digital ownership, where legendary creative works meet Bitcoin innovation with built-in royalty enforcement. my.inscribed.audio empowers artists, collectors, and enthusiasts to enjoy and manage their digital assets in a truly decentralized, immutable way while ensuring creators are fairly compensated for their work.

Featured collection: [The Ides of March](https://gamma.io/ordinals/collections/ides-of-march) — a pioneering music NFT series on Bitcoin Ordinals.

## Features

- **Immutable Data**
  - Digital assets (audio, video, images, 3D models, text) are permanently stored on the Bitcoin blockchain.
  
- **Ordinals Protocol Support**
  - Full compatibility with all MIME types.
  - Collect, display, and manage Ordinals and BRC420 assets.

- **Decentralized & Open Source**
  - No reliance on centralized storage or platforms.
  - 100% open source—[don’t trust, verify](https://github.com/bitcoinaudio/my.inscribed.audio-v1).

- **Gallery & Discovery**
  - Browse and preview featured and historic inscribed audio/art collections.
  - Collect unique assets and view detailed attributes.

- **Personal Media Dashboard**
  - Connect your Unisat, Xverse, or Magic Eden wallet to view and manage your inscribed assets.
  - Filter assets by MIME type (audio, image, video, model, text, etc.).
  - Enhanced Ordinals and BRC420 support for collectors.
  - **RoyaltyKit integration** for creating and managing royalty-enabled transfers.

- **Enhanced Playback**
  - Built-in media player for audio and video.
  - 3D model viewer and lazy loading for optimal performance.

- **Mobile Ready**
  - Responsive design with mobile wallet connection support.
  - Full royalty system support on mobile devices.

- **Mobile Ready**
  - Responsive design with mobile wallet connection support.

## Getting Started

### Prerequisites
1. **Bitcoin Royalty API Server** (for royalty functionality):
   ```bash
   # In a separate terminal, start the royalty server
   cd ordinals-royalty-rust-gemini
   cargo run
   # Server starts on http://127.0.0.1:3000
   ```

### Frontend Setup
1. **Clone the repo:**
   ```bash
   git clone https://github.com/bitcoinaudio/my.inscribed.audio-v1.git
   cd my.inscribed.audio-v1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```

4. **Connect your Bitcoin Ordinals-compatible wallet (Unisat, Xverse, Magic Eden) to view and manage your assets.**

5. **Enable Royalty Features** (optional):
   - Ensure the royalty API server is running on port 3000
   - Use the RoyaltyKit component for royalty-enabled transfers
   - Connect to ord server at `radinals.bitcoinaudio.co` for inscription data

## 🏗️ Architecture

### Frontend Components
- **React/Next.js** - Modern web framework with Tailwind CSS
- **LaserEyes Integration** - Bitcoin wallet connectivity (@omnisat/lasereyes-react)
- **RoyaltyKit Component** - Royalty system integration
- **Ord Server Integration** - Real-time inscription and UTXO data

### Backend Integration
- **Royalty API Server** - Rust-based PSBT creation service
- **Taproot + Miniscript** - Protocol-level royalty enforcement
- **Bitcoin Core** - Full Bitcoin node for transaction processing

### Data Sources
- **Ord Server** (`radinals.bitcoinaudio.co`) - Primary inscription data
- **Mempool.space API** - Fallback UTXO data
- **Blockstream API** - Additional Bitcoin data

## 🔄 Royalty Workflow

### For Creators
1. **Create/Select Inscription** - Choose existing ordinal or create new one
2. **Enable Royalty** - Set royalty percentage and recipient address
3. **Generate PSBT** - System creates royalty-enabled transfer PSBT
4. **List for Sale** - Ordinal is now available with embedded royalty

### For Buyers
1. **Select Ordinal** - Browse available royalty-enabled ordinals
2. **Initiate Purchase** - Provide funding UTXO for purchase
3. **Sign PSBT** - Approve transaction with connected wallet
4. **Receive Ordinal** - Get ownership with royalty enforcement preserved

### For Future Sales
1. **Automatic Royalty** - Creator receives payment on every future sale
2. **Protocol Enforcement** - No trusted parties required
3. **Persistent Rights** - Royalties continue indefinitely

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_ROYALTY_API_URL=http://127.0.0.1:3000
NEXT_PUBLIC_ORD_SERVER_URL=https://radinals.bitcoinaudio.co
NEXT_PUBLIC_BITCOIN_NETWORK=regtest
```

### Wallet Configuration
The platform supports multiple Bitcoin wallets:
- **Unisat Wallet** - Primary wallet integration
- **Xverse Wallet** - Multi-asset wallet support  
- **Magic Eden Wallet** - NFT-focused wallet
- **LaserEyes Framework** - Universal wallet abstraction

## Contributing

We welcome contributions! Please open issues or pull requests for any improvements or new features.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Don’t trust? Verify.**  
Explore the [source code](https://github.com/bitcoinaudio/my.inscribed.audio-v1) and join the decentralized audio revolution on Bitcoin!
