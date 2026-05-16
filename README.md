<div align="center">
  <img src="https://github.com/chiwjieren/hiveguard/raw/main/public/hivereadme2.png" alt="HiveGuard Banner" width="800" />

  # HiveGuard

  **AI-Powered Transaction Firewall for DeFi**

  [![Network: Monad Testnet](https://img.shields.io/badge/Network-Monad_Testnet-blueviolet?style=flat-square)](https://monad.xyz)
  [![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com)
  [![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=flat-square)](https://nextjs.org)
  [![Smart Contracts: Foundry](https://img.shields.io/badge/Smart_Contracts-Foundry-FF3E00?style=flat-square)](https://book.getfoundry.sh)

  A decentralized security framework that leverages a specialized AI agent swarm to evaluate, score, and protect DeFi transactions in real time **before** they hit the blockchain.
</div>

---

## Overview

HiveGuard acts as an intelligent circuit breaker for web3 interactions.

It intercepts outbound transactions (via account abstraction / EIP-7702 flow), sends them through a **three-agent AI swarm**, and returns a consensus score and verdict (**PASS** / **REVERT**) before the transaction is broadcast.

If a transaction fails the safety threshold, HiveGuard can either:

- **Reject** the transaction outright, or
- **Route it through an escrow/rollback defense layer** (depending on the configured flow)

---

## Core stack

- **Contracts (Foundry)** — escrow/rollback defense logic on Monad testnet
- **Backend (FastAPI)** — async agent orchestration + consensus scoring
- **Frontend (Next.js)** — real-time dashboard (Privy wallet integration)

---

## The AI agent swarm

HiveGuard uses three specialized agents executing in parallel to keep latency low while improving coverage:

- **Agent A — Code Reviewer (40%)**
  - Scans targets / contract bytecode for malicious logic, signature traps, and hidden drains.
- **Agent B — Social Scanner (20%)**
  - Cross-references off-chain reputation signals and threat intel.
- **Agent C — Whitelist Checker (40%)**
  - Verifies addresses against trusted registries, verified factories, and historical interaction footprints.

### Consensus formula

```text
Score = (A × 0.4) + (B × 0.2) + (C × 0.4)
Pass threshold: 80/100
```

Transactions below the threshold are rejected or routed through the escrow defense layer.

---

## Architecture & workflow

<div align="center">
  <img src="https://github.com/chiwjieren/hiveguard/raw/main/public/hive_architecture.png" alt="HiveGuard Architecture" width="850" />
</div>

1. **Activation:** user enables HiveGuard via an EIP-7702 upgrade.
2. **Interception:** the user initiates a transaction with a DeFi protocol.
3. **Ingestion:** the frontend captures the payload and sends an audit request to the backend.
4. **Analysis:** the three agents evaluate in parallel.
5. **Decision:** the backend returns the consensus score + verdict.
6. **Result:** UI shows **PASS** or **REVERT**; failing flows trigger escrow halt + refund.

---

## Repository structure

| Path | Purpose |
| --- | --- |
| `contracts/src/HiveGuardEngine.sol` | Master escrow contract (bridging / emergency rollback logic) |
| `backend/main.py` | FastAPI consensus engine coordinating the agents |
| `frontend/src/app/page.tsx` | Dashboard UI |

---

## Quick start

### Prerequisites

- Node.js **18+**
- Python **3.9+**
- [Foundry](https://book.getfoundry.sh/) (for contract development)

### 1) Smart contracts

```bash
cd contracts
forge test
```

### 2) Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`.

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

## Environment configuration

### Backend (`backend/.env`)

```env
MONAD_RPC_URL=https://rpc.testnet.monad.xyz
HIVEGUARD_ENGINE_ADDRESS=0x...
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_MONAD_RPC=https://rpc.testnet.monad.xyz
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Development notes

- **Low-latency by design:** fixed scoring weights to keep compute + token usage predictable.
- **State model:** immutable UI state (React) and event-driven onchain logic.
- **Caching:** RPC results cached for ~60s to minimize redundant calls.

---

## Testing

```bash
# Contracts
cd contracts && forge test

# Backend (when tests are added)
cd backend && python -m pytest

# Frontend (manual)
cd frontend && npm run dev
# Visit http://localhost:3000
```
