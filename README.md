# Green Belt: MediChain Decentralized Platform

MediChain is a fully decentralized Electronic Health Records (EHR) and Telemedicine platform built on Stellar/Soroban blockchain to ensure data sovereignty for patients while providing doctors with intuitive access management.

## 🌐 Live Demo
- **Live Demo URL:** [https://stellar-green-ten.vercel.app/](https://stellar-green-ten.vercel.app/)
- **Demo Video:** [YouTube Link](https://youtu.be/Wi4XIm_aSnU?si=lGRmdAMSKOW74Rim)



## 📸 Platform Screenshots
### Dashboard & Upload
![Dashboard Screenshot](./public/screenshots/dashboard.png)

### Medical Records Overview
![Records Screenshot](./public/screenshots/records.png)

### Record Detail View
![Record Detail](./public/screenshots/detail_report.png)

In mobile-friendly 
<img width="1920" height="1080" alt="Screenshot 2026-04-05 110003" src="https://github.com/user-attachments/assets/0c480f3d-f90b-4aea-b9ea-b019c64768e6" />










*The application is fully responsive and supports secure medical data management.*



## ✅ CI/CD Pipeline Status
[![CI Pipeline](https://github.com/ashu19846b-tech/level3/actions/workflows/ci.yml/badge.svg)](https://github.com/ashu19846b-tech/level3/actions/workflows/ci.yml)

## 📱 Mobile Responsive View
*The application is built with a mobile-first approach, ensuring a seamless experience across all devices.*
![Mobile Responsive Screenshot](./public/mobile-screenshot.png)

**Pipeline runs:**
- Node dependency installation
- ESLint code quality checks  
- Next.js production build
- Rust Soroban contract tests
- Automated on push to main/develop branches

### 🧪 Test Suite Status

The project includes robust unit testing suites for both the Rust Soroban smart contracts and the Next.js frontend components.

#### 1. Smart Contract Tests
The smart contracts use Soroban SDK test environment features (mocking authorization and contract state) to verify correct behaviour.

```text
running 3 tests
test test::test_register_doctor ... ok
test test::test_register_patient ... ok
test test::test_token_transfer ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

#### 2. Frontend Unit Tests
We implement lightweight frontend unit testing using the Node.js native test runner (`node:test`) and the type stripper to assert the correctness of wallet formatting and balance helpers with zero bundle bloat.

```text
TAP version 13
# Subtest: shortenAddress utility
ok 1 - shortenAddress utility
# Subtest: formatBalance utility
ok 2 - formatBalance utility
# Subtest: formatDate utility
ok 3 - formatDate utility
1..3
# tests 3
# pass 3
# fail 0
```

## 🏗️ Smart Contracts Overview

### MediChain Main Contract
**Features:**
- Patient & doctor registration
- Medical record management with IPFS/blob storage
- Access control (grant/revoke permissions)
- Appointment booking with escrow payments
- **Inter-contract calls** with reward token integration

### MediReward Token (MRT)
**Features:**
- ERC-20 style token on Soroban
- Admin-controlled minting
- Patient rewards for uploading records
- Doctor rewards for consultations
- Token transfers and balance tracking

## 🔗 Inter-Contract Calls
The main MediChain contract calls the MediReward Token contract to automatically reward patients when they upload medical records.

**Function:** `add_record_with_reward()`
```rust
pub fn add_record_with_reward(
  env: Env,
  patient: Address,
  record_cid: String,
  title: String,
  reward_token_addr: Address,
  reward_amount: i128
)
```

This demonstrates real inter-contract communication on Soroban.

## 📋 Contract Addresses
(Deployed on Soroban Testnet)

```text
MediChain Main Contract:  CAZY3EOFD4KS6FGSDOCVCZC44QQBVKADAU6OJFENJRFARMVIDWWEWVJI
MediReward Token (MRT):    CD2S6Z6QMFQMWS74UQK2XIHNECRBPPDZS2NOHJQ5LS7C6DYGRPE7LANV
```

## 🔐 Transaction Hashes
(Verified on Soroban Explorer)

```text
Main Contract Deployment: (Updated in fresh deploy, hash pending)
Token Contract Deployment: 95d4477a773570615472a06816b9cec75424ff735a0905743d4c564cca8a3701
Contract Interaction:    (Updated in fresh deploy)
```

### 🔍 View on Explorer
Check the live contract on the Stellar Development Foundation Testnet Explorer:
[Stellar Laboratory - CAZY3EOFD4KS6FGSDOCVCZC44QQBVKADAU6OJFENJRFARMVIDWWEWVJI](https://lab.stellar.org/r/testnet/contract/CAZY3EOFD4KS6FGSDOCVCZC44QQBVKADAU6OJFENJRFARMVIDWWEWVJI)

## 🛠️ Features
- **Stellar Wallet Authentication:** Native integration with **Freighter Wallet** for secure account access and transaction signing on the Stellar network.
- **Patient Dashboard:** Secure viewing of health records, uploading documents, managing doctor permissions
- **Doctor Portal:** View authorized patient records, add medical notes
- **Smart Contracts (Rust):** Fully migrated to Soroban SDK - see `rust-contracts` folder
- **Mobile Responsive:** Works on all screen sizes (mobile-first design)
- **Real-time Events:** Live updates when records are uploaded or permissions change
- **Token Rewards:** Automatic MediReward tokens for patient engagement
- **Modern UI:** Built with Next.js 15, React 19, Tailwind CSS v4

## 💻 Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Web3:** Stellar Freighter Wallet, Soroban SDK
- **Smart Contracts:** Rust / Soroban (v21.0 compatible)
- **Icons:** Lucide React
- **File Storage:** IPFS (Pinata) / Local blob URLs for development

## 📦 How to run locally
1. Clone the repository:
   ```bash
   git clone https://github.com/ashu19846b-tech/level3.git
   cd level3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (see `.env.example`):
   ```
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Access at `http://localhost:3000`

## 🧪 Running Tests

The test suites run automatically inside the GitHub Actions CI pipeline. You can also run them locally using the following commands:

### Run all tests (Contracts + Frontend)
```bash
npm run test
```

### Run only Frontend tests
```bash
npm run test:frontend
```

### Run only Smart Contract tests
```bash
npm run test:contract
```

## 🚀 Deployment
### Frontend
1. Connect this repository to **Vercel** or **Netlify**
2. Configure build command: `npm run build`
3. Deploy automatically

### Smart Contracts
1. Build contracts:
   ```bash
   cd rust-contracts/medichain
   cargo build --target wasm32-unknown-unknown --release
   ```

2. Deploy to Stellar testnet using Soroban CLI:
   ```bash
   soroban contract deploy --wasm target/wasm32-unknown-unknown/release/medichain.wasm
   ```

## 📚 Project Structure
```
Green_Belt/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── context/             # Web3 & provider context
│   └── hooks/               # Custom hooks (useContractEvents)
├── rust-contracts/  
│   └── medichain/
│       ├── src/
│       │   ├── lib.rs       # Main contract
│       │   └── token.rs     # Token contract
│       └── Cargo.toml
├── public/                  # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
└── package.json
```

## 🔄 Real-Time Event Streaming
The application listens for contract events and updates the UI in real-time:
- Record uploads
- Access grants/revokes
- Appointment status changes
- Token transfers

No page refresh needed - all updates are instant.

## 📱 Mobile Responsive Design
- Fully responsive Tailwind CSS grid system
- Mobile-first approach
- Tested at 375px, 768px, and desktop widths
- Touch-friendly buttons and navigation
- Adaptive layouts for all screen sizes

  ## 🚀 Project Highlights

- ✅ Advanced Soroban Smart Contracts written in Rust
- ✅ Inter-contract communication between MediChain and MediReward Token
- ✅ Stellar Freighter Wallet authentication
- ✅ IPFS (Pinata) decentralized file storage
- ✅ Real-time contract event streaming
- ✅ Mobile-first responsive UI
- ✅ Automated CI/CD with GitHub Actions
- ✅ Automated Rust smart contract testing
- ✅ Production-ready Next.js architecture
- ✅ Deployed on Stellar Testnet

## 🔗 Useful Resources
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinata IPFS](https://www.pinata.cloud/)

## 📄 License
MIT

## 🎯 Future Improvements
- Video consultation integration
- Prescription management
- Insurance claim processing
- Advanced analytics dashboard
- Multi-signature approvals
- Off-chain data encryption
