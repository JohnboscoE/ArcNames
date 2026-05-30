# ◈ ArcNames

> **The Decentralized Name System built on Arc** — Register your `.arc` identity, link it to your wallet, and let anyone send you USDC using just your name instead of a hex address.

[![Built on Arc](https://img.shields.io/badge/Built%20on-Arc%20Testnet-0EA5E9?style=flat-square)](https://arc.io)
[![Powered by Circle](https://img.shields.io/badge/Powered%20by-Circle-0369A1?style=flat-square)](https://circle.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## What is ArcNames?

ArcNames is a decentralized domain name registry built on Arc's stablecoin Layer-1 blockchain. Instead of sharing a 42-character hex address, users register a human-readable `.arc` name that resolves directly to their wallet.

Think of it as ENS (Ethereum Name Service) — but built entirely on Arc, paid for in USDC, with sub-second settlement and no volatile gas fees.

```
0xc2abed551C696Aa42f0a8d681843C442319C341c  →  james.arc
```

---

## Features

- 🔍 **Name search** — Check availability of any `.arc` name in real time
- 📝 **Register** — Claim your `.arc` name for 5 USDC per year (up to 10 years)
- 🔗 **Resolution** — Resolve any `.arc` name to its wallet address instantly
- 🔄 **Reverse lookup** — Find the primary `.arc` name for any wallet address
- 💎 **NFT ownership** — Each registered name is an ERC-721 NFT, fully transferable
- 🔁 **Renew** — Extend your name registration before it expires
- 📋 **My Names** — View all `.arc` names registered to your wallet
- ↗ **Send with names** — Send USDC or EURC to `james.arc` instead of `0x...`
- 📊 **Registration history** — Live table of all registered names with timestamps and tx links
- 🌐 **Global wallet** — Connect once, stay connected across all pages
- ⚡ **Sub-second finality** — All transactions confirm in under 1 second on Arc
- ⛽ **Gas in USDC** — No ETH needed — all fees are paid in USDC

---

## How It Works

```
User searches "james"
    ↓
Frontend checks availability via backend API
    ↓
User connects MetaMask + approves 5 USDC
    ↓
ArcNames.sol registers the name as an ERC-721 NFT
    ↓
james.arc → 0xc2ab...341c (on-chain mapping)
    ↓
Anyone can now send USDC to "james.arc"
    ↓
Backend resolves james.arc → 0xc2ab... → USDC arrives
```

---

## Tech Stack

### Blockchain & Smart Contracts
| Tool | Purpose |
|---|---|
| **Arc Testnet** (Chain ID: 5042002) | Layer-1 stablecoin blockchain |
| **Solidity 0.8.20** | Smart contract language |
| **Foundry (Forge)** | Contract compilation, testing, and deployment |
| **OpenZeppelin ERC-721** | Audited NFT base contract for name ownership |
| **Viem** | Ethereum interaction library |

### Backend
| Tool | Purpose |
|---|---|
| **Node.js + TypeScript** | Server runtime |
| **Express 4** | REST API framework |
| **Viem** | On-chain event watching and contract reads |
| **JSON file (db.json)** | Lightweight persistence for name records |
| **Railway** | Backend hosting and deployment |

### Frontend
| Tool | Purpose |
|---|---|
| **React + TypeScript** | UI framework |
| **Vite** | Frontend build tool |
| **React Router** | Client-side routing |
| **React Context** | Global wallet state management |
| **Axios** | HTTP client for backend API |
| **Vercel** | Frontend hosting and deployment |

---

## Smart Contract

### `ArcNames.sol`

A combined ERC-721 NFT registry and name resolution system.

**Registration Rules:**
- Names must be 3–32 characters
- Only lowercase letters (a-z), numbers (0-9), and hyphens allowed
- Cost: 5 USDC per year (max 10 years at once)
- Each name is minted as a unique NFT to the registrant

**Key Functions:**

| Function | Description |
|---|---|
| `register(name, numYears)` | Register a new .arc name |
| `renew(name, numYears)` | Extend an existing registration |
| `resolve(name)` | Get the wallet address for a name |
| `reverseLookup(address)` | Get the primary name for a wallet |
| `isAvailable(name)` | Check if a name can be registered |
| `setPrimaryName(name)` | Set your display name |
| `nameInfo(name)` | Get full details for a name |
| `transferFrom(from, to, tokenId)` | Transfer name NFT to another wallet |

**Deployed Address (Arc Testnet):**
```
ArcNames Contract: 0x578dBd5734f13BCA66a1355CcA296C07823892A2
USDC:              0x3600000000000000000000000000000000000000
EURC:              0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
```

---

## Project Structure

```
ArcNames/
│
├── contracts/                      # Foundry smart contracts
│   ├── src/
│   │   └── ArcNames.sol            # Main registry + NFT contract
│   ├── test/
│   │   └── ArcNames.t.sol          # Foundry tests
│   ├── script/
│   │   └── Deploy.s.sol            # Deployment script
│   └── foundry.toml
│
├── backend/                        # Node.js + TypeScript API
│   ├── src/
│   │   ├── index.ts                # Express server entry point
│   │   ├── db.ts                   # JSON file persistence
│   │   ├── routes/
│   │   │   └── names.ts            # All name endpoints
│   │   ├── services/
│   │   │   └── arc.ts              # Viem client + event watcher
│   │   └── abi/
│   │       └── ArcNames.json       # Compiled contract ABI
│   ├── Dockerfile
│   └── package.json
│
└── frontend/                       # React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Home.tsx            # Explore + search + history
    │   │   ├── Register.tsx        # Name registration form
    │   │   ├── Profile.tsx         # Name details page
    │   │   ├── MyNames.tsx         # User's registered names
    │   │   └── Send.tsx            # Send tokens by .arc name
    │   ├── components/
    │   │   ├── Navbar.tsx          # Global nav + wallet connect
    │   │   ├── NameCard.tsx        # Name display card
    │   │   └── SearchBar.tsx       # Live availability search
    │   └── lib/
    │       ├── arc.ts              # Viem client for Arc Testnet
    │       ├── api.ts              # Backend API wrapper
    │       └── WalletContext.tsx   # Global wallet state
    └── vercel.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `GET` | `/api/names/all` | Get all registered names |
| `GET` | `/api/names/check/:name` | Check name availability |
| `GET` | `/api/names/resolve/:name` | Resolve name to address |
| `GET` | `/api/names/reverse/:address` | Reverse lookup address to name |
| `GET` | `/api/names/info/:name` | Full name details |
| `GET` | `/api/names/owner/:address` | All names owned by address |
| `GET` | `/api/names/stats` | Platform statistics |

---

## Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org)
- [Foundry](https://getfoundry.sh)
- [MetaMask](https://metamask.io) browser extension
- [Circle Developer Account](https://console.circle.com) — free

### 1. Clone the repo

```bash
git clone https://github.com/JohnboscoE/ArcNames.git
cd ArcNames
```

### 2. Set up contracts

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

Create `contracts/.env`:
```
PRIVATE_KEY=0xYourPrivateKey
PLATFORM_ADDRESS=0xYourWalletAddress
USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

Deploy to Arc Testnet:
```bash
forge script script/Deploy.s.sol --rpc-url https://rpc.testnet.arc.network --broadcast
```

### 3. Set up the backend

```bash
cd ../backend
npm install
```

Create `backend/.env`:
```
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret
PLATFORM_WALLET_ADDRESS=0xYourWalletAddress
PLATFORM_PRIVATE_KEY=0xYourPrivateKey
ARC_NAMES_ADDRESS=0xDeployedContractAddress
ARC_NAMES_DEPLOY_BLOCK=your_deployment_block
ARC_RPC=https://rpc.testnet.arc.network
USDC_ADDRESS=0x3600000000000000000000000000000000000000
PORT=3001
```

Run:
```bash
npm run dev
```

### 4. Set up the frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
VITE_ARC_RPC=https://rpc.testnet.arc.network
VITE_USDC_ADDRESS=0x3600000000000000000000000000000000000000
VITE_ARC_NAMES_ADDRESS=0xDeployedContractAddress
```

Run:
```bash
npm run dev
```

Open `http://localhost:5173`

### 5. Add Arc Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | Arc Testnet |
| RPC URL | `https://rpc.testnet.arc.network` |
| Chain ID | `5042002` |
| Symbol | `USDC` |
| Explorer | `https://testnet.arcscan.app` |

### 6. Get testnet USDC

Visit [faucet.circle.com](https://faucet.circle.com), select **Arc Testnet**, and request USDC.

---

## Running Tests

```bash
cd contracts
forge test -vv
```

Expected:
```
[PASS] test_RegisterName()
[PASS] test_ResolveName()
[PASS] test_ReverseLookup()
[PASS] test_CannotRegisterTakenName()
[PASS] test_RenewName()
[PASS] test_SetPrimaryName()
[PASS] test_InvalidNameTooShort()
[PASS] test_InvalidNameUppercase()
```

---

## Deployment

### Backend → Railway

1. Connect GitHub repo to [Railway](https://railway.app)
2. Set **Root Directory** to `backend`
3. Set **Builder** to `Dockerfile`
4. Add all environment variables
5. Go to **Settings → Networking → Generate Domain**

### Frontend → Vercel

1. Connect GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`
4. Add environment variables with Railway URL as `VITE_API_URL`

---

## Name Pricing

| Duration | Cost |
|---|---|
| 1 year | 5 USDC |
| 2 years | 10 USDC |
| 3 years | 15 USDC |
| 5 years | 25 USDC |
| 10 years | 50 USDC |

---

## Arc Testnet Resources

| Resource | Link |
|---|---|
| Block Explorer | [testnet.arcscan.app](https://testnet.arcscan.app) |
| RPC URL | `https://rpc.testnet.arc.network` |
| Circle Faucet | [faucet.circle.com](https://faucet.circle.com) |
| Arc Docs | [docs.arc.io](https://docs.arc.io) |
| Circle Console | [console.circle.com](https://console.circle.com) |

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Built With ◈ on Arc

ArcNames is built on [Arc](https://arc.io) — the stablecoin Layer-1 blockchain by Circle. Arc uses USDC as the native gas token, delivers sub-second deterministic finality, and is fully EVM-compatible — making it the perfect chain for a decentralized name system where every interaction is settled in stablecoins.

> *"Your identity. On-chain. In stablecoins."*