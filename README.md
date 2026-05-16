```markdown
<div align="center">
  <img src="https://github.com/chiwjieren/hiveguard/raw/main/public/hivereadme2.png" alt="HiveGuard Banner" width="800">
  
  # HiveGuard
  ### AI-Powered Transaction Firewall for DeFi
  
  [![Network: Monad Testnet](https://img.shields.io/badge/Network-Monad_Testnet-blueviolet?style=flat-square)](https://monad.xyz)
  [![Stack: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com)
  [![Stack: Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=flat-square)](https://nextjs.org)
  [![Testing: Foundry](https://img.shields.io/badge/Smart_Contracts-Foundry-FF3E00?style=flat-square)](https://book.getfoundry.sh)

  <p align="center">
    A decentralized security framework that leverages a specialized AI agent swarm to evaluate, score, and protect DeFi transactions in real-time before they hit the blockchain.
  </p>
</div>

---

## ⚡ Overview

**HiveGuard** acts as an intelligent circuit breaker for your web3 interactions. Operating via EIP-7702 account abstraction, it intercepts outbound transactions, routes them through a tri-agent LLM consensus matrix, and dynamically approves or quarantines assets into a smart escrow engine on the Monad testnet.

### Core Stack
*   **Contracts (Foundry):** Secure escrow logic optimized for high-throughput EVM environments.
*   **Backend (FastAPI):** Asynchronous AI swarm orchestration and consensus scoring.
*   **Frontend (Next.js):** Real-time analytics dashboard secured with Privy wallet integration.

---

## 🤖 The AI Agent Swarm

HiveGuard utilizes three specialized agents executing in parallel to keep latency minimal and security bulletproof.


```

```
              ┌───────────────────────────┐
              │    Inbound Transaction    │
              └─────────────┬─────────────┘
                            │
     ┌──────────────────────┼──────────────────────┐
     ▼                      ▼                      ▼

```

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   Agent 402-A    │   │   Agent 402-B    │   │   Agent 402-C    │
│  Code Reviewer   │   │  Social Scanner  │   │  Whitelist Check │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
│                      │                      │
└──────────────────────┼──────────────────────┘
▼
┌─────────────────────────┐
│ Consensus Score Engine  │
└─────────────────────────┘

```

*   **Agent 402-A: Code Reviewer (Weight: 40%)** — Scans targets and contract bytecode for malicious logic, signature traps, and hidden drains.
*   **Agent 402-B: Social Scanner (Weight: 20%)** — cross-references off-chain data, security feeds, and threat intelligence reports for active exploits.
*   **Agent 402-C: Whitelist Checker (Weight: 40%)** — Verifies addresses against trusted registries, verified factory contracts, and historical interaction footprints.

### 📊 Consensus Formula
$$Score = (A \times 0.4) + (B \times 0.2) + (C \times 0.4)$$

> **Pass Threshold:** $\ge 75/100$. Transactions scoring below this threshold are automatically routed to the escrow defense layer or rejected.

---

## 🗺️ Architecture & Workflow

<div align="center">
  <img src="https://github.com/chiwjieren/hiveguard/raw/main/public/hive_architecture.png" alt="HiveGuard Architecture Flow" width="850">
</div>

1. **Activation:** User activates HiveGuard's firewall capabilities natively using an EIP-7702 upgrade.
2. **Interception:** The user initiates a transaction with an external DeFi protocol.
3. **Ingestion:** The Next.js frontend captures the payload and dispatches an audit payload to the FastAPI gateway.
4. **Analysis:** The three-agent swarm processes the data in parallel to maintain execution speed.
5. **Evaluation:** The backend applies the consensus formula and returns the final risk matrix.
6. **Resolution:** The UI presents a **PASS** or **REVERT** status. Transactions failing validation trigger an immediate escrow halt and asset refund.

---

## 📋 Repository Structure

| Path | Purpose |
| :--- | :--- |
| `contracts/src/HiveGuardEngine.sol` | Master escrow contract handles transaction bridging and emergency rollbacks. |
| `backend/main.py` | FastAPI engine coordinating parallel agent tasks and parsing LLM scores. |
| `frontend/src/app/page.tsx` | Main developer security lab dashboard and user workspace. |

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)
```env
MONAD_RPC_URL=[https://rpc.testnet.monad.xyz](https://rpc.testnet.monad.xyz)
HIVEGUARD_ENGINE_ADDRESS=0x...

```

### Frontend Setup (`frontend/.env.local`)

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_MONAD_RPC=[https://rpc.testnet.monad.xyz](https://rpc.testnet.monad.xyz)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

```

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* Python 3.9+
* Foundry

### 1. Smart Contracts

```bash
cd contracts
forge testing

```

### 2. Backend Orchestrator

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python main.py

```

*API engine defaults to:* `http://localhost:8000`

### 3. Frontend Interface

```bash
cd frontend
npm install
npm run dev

```

*Dashboard defaults to:* `http://localhost:3000`

---

## 🔧 Development Insights

* **Low-Latency Architecture:** Agent interactions rely on fixed scoring weights to optimize response speed and reduce token overhead.
* **State Management:** Fully deterministic state handling. Frontend updates remain event-driven (Solidity tracking) or immutable (React context).
* **Caching Layer:** RPC requests and repetitive agent queries are cached for 60 seconds to mitigate network strain and rate-limiting blocks.

```

```
