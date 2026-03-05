# my.inscribed.audio

**my.inscribed.audio** is a decentralized web platform for discovering, collecting, and showcasing digital audio and multimedia assets inscribed on the Bitcoin blockchain using Ordinals.

## Overview

Welcome to the future of music and digital ownership, where legendary creative works meet Bitcoin innovation. my.inscribed.audio empowers artists, collectors, and enthusiasts to enjoy and manage their digital assets in a truly decentralized, immutable way.

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
  - Connect your Unisat or Xverse wallet to view and manage your inscribed assets.
  - Filter assets by MIME type (audio, image, video, model, text, etc.).
  - Enhanced Ordinals and BRC420 support for collectors.

- **Enhanced Playback**
  - Built-in media player for audio and video.
  - 3D model viewer and lazy loading for optimal performance.

- **Mobile Ready**
  - Responsive design with mobile wallet connection support.

## Getting Started

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
  npm run dev
   ```

  **For LAN/mobile testing (wallet in-app browsers):**
  ```bash
  npm run dev:lan
  ```

4. **Connect your Bitcoin Ordinals-compatible wallet (Unisat or Xverse) to view and manage your assets.**

## Integration Notes

- Integration env vars are intentionally minimal; wallet auth API base is configurable.
- Ordinals endpoints are currently code-level constants in [src/utils/inscriptions.ts](src/utils/inscriptions.ts).
- Wallet auth API base can be set with `VITE_WALLET_AUTH_BASE_URL` (defaults to same-origin).
- Mobile wallet deeplink bases can be configured with `VITE_UNISAT_DEEPLINK_BASE` and `VITE_XVERSE_DEEPLINK_BASE`.
- Deeplink return target can be overridden with `VITE_WALLET_CONNECT_RETURN_URL` (defaults to current page URL).
- Backend wallet auth verifier is strict-by-default and validates signatures server-side.
- Optional (trusted local dev only): `WALLET_AUTH_ALLOW_UNVERIFIED=true` can bypass signature verification.
- Role policy inputs on API service:
  - `WALLET_ROLE_ADMIN_INSCRIPTIONS` (comma-separated inscription IDs)
  - `WALLET_ROLE_CREATOR_INSCRIPTIONS` (comma-separated inscription IDs)
  - `WALLET_AUTH_TRUST_CLIENT_INSCRIPTIONS=true` (disabled by default; keep false in production)
- Backend ownership lookup inputs on API service:
  - `WALLET_AUTH_ORDINALS_ADDRESS_URL_TEMPLATES` (comma-separated URL templates containing `{address}`)
  - `WALLET_AUTH_REQUIRE_OWNERSHIP_LOOKUP=true` (fail auth when ownership lookup fails)
  - `WALLET_AUTH_OWNERSHIP_TIMEOUT_MS` (default 10000)

### Wallet Role Contract

This frontend consumes canonical Beatfeed wallet-auth role names directly:

- `listener`
- `creator`
- `admin`

Role constants are centralized in [src/constants/walletRoles.ts](src/constants/walletRoles.ts).

Current behavior in this app:

- roles are requested and stored after wallet auth session verification
- `/mymedia` requires an authenticated wallet role (`listener`, `creator`, or `admin`)
- if wallet-auth backend is unavailable, `/mymedia` guard allows access to avoid local-dev lockout
- wallet connect policy is desktop-direct, mobile deeplink-first, with direct connect when already inside wallet in-app browsers

When role-gated UI is introduced, use these same canonical role names and keep backend/frontend naming synchronized.

## Contributing

We welcome contributions! Please open issues or pull requests for any improvements or new features.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Don’t trust? Verify.**  
Explore the [source code](https://github.com/bitcoinaudio/my.inscribed.audio-v1) and join the decentralized audio revolution on Bitcoin!
