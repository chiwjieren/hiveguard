# HiveGuard: AI-Powered Transaction Firewall

A decentralized security framework that uses three specialized AI agents to evaluate and protect DeFi transactions in real-time.

## 🏗️ Architecture

- **Contracts (Foundry)** — Smart escrow engine on Monad testnet
- **Backend (FastAPI)** — AI swarm orchestration with three agents
- **Frontend (Next.js)** — Real-time security dashboard with Privy wallet integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Foundry (for contract development)

### 1. Setup Contracts
```bash
cd contracts
forge test
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🤖 Three-Agent Swarm

1. **Agent 402-A: Code Reviewer** — Scans bytecode for malicious patterns
2. **Agent 402-B: Social Scanner** — Checks reputation against known exploits
3. **Agent 402-C: Fork Simulator** — Simulates transaction execution

Consensus score = (A × 0.4) + (B × 0.2) + (C × 0.4). Pass threshold: 75/100

## 📋 Key Files

| Path | Purpose |
|------|---------|
| `contracts/src/HiveGuardEngine.sol` | Master escrow contract |
| `backend/main.py` | FastAPI consensus engine |
| `frontend/src/app/page.tsx` | Security lab dashboard |

## ✅ Testing

```bash
# Run contract tests
cd contracts && forge test

# Test backend
cd backend && python -m pytest  # (when added)

# Manual frontend testing
cd frontend && npm run dev
# Visit http://localhost:3000
```

## 🔧 Environment Setup

### Backend (.env)
```
MONAD_RPC_URL=https://rpc.testnet.monad.xyz
HIVEGUARD_ENGINE_ADDRESS=0x...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_MONAD_RPC=https://rpc.testnet.monad.xyz
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 📊 Workflow

1. User activates HiveGuard via EIP-7702
2. User initiates transaction with a protocol
3. Frontend sends audit request to backend
4. Three agents evaluate in parallel
5. Backend returns consensus score
6. Frontend shows PASS/REVERT result
7. Transaction either executes or reverts with refund

## 📝 Development Notes

- All state is immutable (React) or event-driven (Solidity)
- No complex scoring logic; fixed weights keep tokens low
- RPC results cached for 60s to minimize calls
- All agents run in parallel for speed
