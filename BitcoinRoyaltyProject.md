Here's an execution roadmap for rebuilding your ordinal‑royalty marketplace from the ground up.  I’ve taken into account current best practices (e.g. PSBTv2 support and silent‑payment proposals), the need for royalty enforcement via Miniscript and Taproot, and your desire to use a Rust backend with a React/TypeScript frontend.

### 1 High‑level architecture

| Component                     | Role                                                                                                                                                                                                                                                | Notes                                                                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React/TypeScript frontend** | Client UI for minting, listing, buying and managing ordinals. Provides wallet interaction, PSBT signing assistance and network switching.                                                                                                           | Uses React 18+ with TypeScript, Axios (or React Query) for API calls and optional `bitcoinjs-lib` if local PSBT signing is desired.                                                        |
| **Rust backend (API)**        | RESTful service that encapsulates all Bitcoin logic. Handles key management, inscription/royalty script creation, PSBT construction, signature verification, transaction finalisation and broadcasting. Exposes endpoints consumed by the frontend. | Use `axum` or `warp` for HTTP, `rust-bitcoin` (0.32+) for core types and PSBTv2, `miniscript` for script policies, `bdk` for wallet functions, and `serde`/`serde_json` for serialization. |
| **Bitcoin Core nodes**        | Provide RPC access to mainnet, testnet4 and local regtest/signet. Running separate instances allows quick switching via configuration.                                                                                                              | Use docker‑compose to spin up multiple nodes with distinct datadirs and RPC ports.                                                                                                         |
| **Database / state store**    | Maintain metadata like collections, royalty percentages, listings, user wallet fingerprints and transaction status.                                                                                                                                 | A simple SQLite or Postgres instance is sufficient at first.                                                                                                                               |

### 2 PSBT and marketplace flow

Recent articles summarise how ordinals marketplaces operate using PSBT: a PSBT is created describing the sale, circulated to participants for signatures, finalised and broadcast.  Your backend will perform these steps:

1. **Create the transaction**.  When a seller lists an ordinal, build a PSBT that spends the ordinal‑UTXO and includes outputs for:

   * buyer’s new ordinal output (inscription continues on the same satoshi),
   * royalty payment to the current royalty holder,
   * optional marketplace fee,
   * change outputs (buyer’s remaining funds, seller’s change).
     For robust royalties, encode the ordinal’s transfer policy as a Taproot script path containing a Miniscript 2‑of‑2 multisig (owner + royalty‑holder).  That script is only revealed on non‑cooperative transfers; cooperative transfers use the key path for efficiency and privacy.
2. **Signatures**.  Return the base64‑encoded PSBT to the frontend.  The UI instructs the seller and buyer (via their wallets) to sign their respective inputs.  Recent PSBT improvements (BIP370/PSBTv2) let you include extra fields (e.g. descriptors and pre‑images) and support Taproot signatures; the `rust-bitcoin` crate supports these features.
3. **Finalisation**.  Once all required signatures are collected, finalise the PSBT and broadcast.  Finalisation can be done via the backend using Bitcoin Core RPC `finalizepsbt` and `sendrawtransaction`.
4. **State update**.  Mark the ordinal as sold, transfer the royalty rights (if required) and record the transaction ID.

### 3 Backend implementation plan (Rust)

1. **Project skeleton**.  Create a new Rust workspace with crates for `api`, `wallet` and `psbt`.  Use `axum` for routing and `tokio` for async runtime.
2. **Network configuration**.  Load network settings from an environment file; allow switching between `Mainnet`, `Testnet`, `Signet` and `Regtest` by passing the desired `bitcoin::Network` and RPC endpoint to the wallet layer.
3. **Key & address management**.

   * Generate seeds using `bip39`, derive extended private/public keys (xprv/xpub) via `bitcoin_bip32`, and store xpubs in the database.  Avoid hard‑coding or reusing pre‑derived keys.
   * Provide endpoints to export xpubs to users and import xprivs for signing if the user chooses server‑side signing (not recommended for security; ideally signing should happen client‑side or with hardware wallets).
4. **Miniscript & Taproot**.

   * Define a generic Miniscript policy for royalty enforcement.  For example, `and_v(v:pk(owner),pk(royalty))` enforces that both current owner and royalty holder must sign the ordinal transfer.
   * Use `miniscript::Descriptor::new_tr` to create Taproot descriptors with script paths for royalties.
   * Provide endpoints to create new ordinal descriptors and return corresponding addresses for minting.
5. **PSBT builder**.

   * Build a service that constructs PSBT v2 transactions using `rust-bitcoin` and `bdk`.  Accept inputs (ordinal UTXO and funding UTXO) and output targets (new owner, royalty payments, fees).  Populate the PSBT with relevant proprietary fields (e.g. inscription metadata) as required.
   * Use `bdk` or direct RPC calls to gather UTXO information and set appropriate sighash flags (e.g. `SIGHASH_DEFAULT` for Taproot).
6. **Signature verification & finalization**.

   * Provide endpoints to merge multiple PSBTs (from buyer and seller signatures), verify that all required inputs are signed, finalise using `finalizepsbt`, and broadcast via `sendrawtransaction`.
   * Include support for PSBTv2 fields and update if BIPs 353/375 for DNSSEC proofs or silent payments become widely adopted.
7. **Marketplace endpoints**.

   * `/collections`: create/list collections of ordinals.
   * `/mint`: accept inscription data (image/text), create Taproot/royalty descriptor, return funding address and expected satoshi amount for the ordinal.  Use `ord` or similar library to inscribe, or integrate with existing ordinals services.
   * `/list-item`: list an ordinal for sale (with price, royalty percentage and royalty holder).
   * `/create-sale-psbt`: generate the sale PSBT as described above.
   * `/submit-signed-psbt`: accept signed PSBT(s), finalise, broadcast and update state.
   * `/transactions/{txid}`: fetch status and details.

### 4 Frontend implementation plan (React/TypeScript)

1. **State management and network toggle**.  Use Redux or React Context to store network selection (`mainnet`, `testnet4`, `signet`, `regtest`) and API base URL.  Provide a toggle in the UI to switch networks.
2. **Wallet integration**.  Allow users to:

   * Generate new wallets (via backend API) and download their mnemonic seeds.
   * Connect external wallets (e.g. Xverse, Ordinals Wallet, Ledger) through deep‑link or PSBT QR scanning.  PSBT files can be encoded as Base64 or animated QR codes; implement scanning and encoding on the frontend.
3. **Minting workflow**.

   * Present a form to upload image/text and set royalty percentage and royalty recipient.
   * Call `/mint` to obtain a funding address; display instructions to send required sats.
   * Wait for confirmation via backend (poll or WebSocket); display success with ordinal ID.
4. **Listing and sale**.

   * Display user’s ordinals, collection metadata and current royalty info.
   * Provide an interface to set sale price and call `/list-item`.
   * Show PSBT details returned by `/create-sale-psbt` and provide a “sign with wallet” button.  After the seller signs, instruct the buyer to sign and finalise.  Use progress indicators for each step (created → signed by seller → signed by buyer → finalised).
5. **Marketplace**.

   * Show a grid of available ordinals with images, metadata, prices and royalty information.
   * Provide filtering and sorting by collection, price, and royalty percentage.
   * When a buyer clicks “Buy”, fetch the PSBT and instruct them to sign.  After finalisation, show confirmation and transaction ID.
6. **Royalty revenue display**.

   * Present accumulated royalties per user; display total fees the marketplace has collected.  This encourages transparency and supports your revenue model.
7. **Security and UX**.

   * Never expose private keys on the frontend.  Encourage users to use hardware or watch‑only wallets.
   * Handle errors gracefully (e.g. insufficient funds, PSBT incomplete).
   * Provide tooltips explaining PSBT stages: creation, signing, finalisation and broadcasting.

### 5 Generating marketplace income

Your marketplace can generate revenue by charging a small service fee (e.g. 1–2 %) on each sale.  Incorporate this fee as an additional output in the PSBT directed to a marketplace address.  Because PSBTs support multiple outputs, you can add this fee without affecting the royalty payment structure.  Clearly display the fee to buyers and sellers in the UI.  Over time, you could add premium services (inscription as a service, featured listings, analytics) to diversify revenue.

### 6 Further considerations

* **Versioning & upgrades**: Stay up‑to‑date with PSBTv2 and related BIPs for silent payments, MuSig2 and descriptor extensions.  Design your code to be modular so that new PSBT fields can be integrated easily.
* **Compliance**: Consider the regulatory implications of running a marketplace (KYC/AML depending on jurisdiction).
* **Scalability**: At launch a simple Postgres database is sufficient; as volume grows, consider indexing ordinals and transactions with a dedicated indexer.

By following this plan you can systematically rebuild your ordinal‑royalty marketplace with proper network flexibility and a solid PSBT implementation.
