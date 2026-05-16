# HiveGuard Setup Guide

Complete step-by-step instructions to get HiveGuard running locally.

## Prerequisites

- **Node.js** 18+ (https://nodejs.org/)
- **Python** 3.9+ (https://python.org/)
- **Git** (for version control)
- **Foundry** (optional, for contract compilation/testing)

Verify installations:
```bash
node --version
python --version
git --version
```

## 1️⃣ Backend Setup (Python FastAPI)

### Install dependencies
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Configure environment
Create/edit `backend/.env`:
```
MONAD_RPC_URL=https://rpc.testnet.monad.xyz
HIVEGUARD_ENGINE_ADDRESS=0x0000000000000000000000000000000000000000
BACKEND_PORT=8000
```

### Run backend
```bash
python main.py
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

Backend is ready at `http://localhost:8000`

**Test the backend:**
```bash
curl -X GET http://localhost:8000/health
# Response: {"status":"ok"}
```

---

## 2️⃣ Frontend Setup (Next.js)

### Install dependencies
```bash
cd frontend
npm install
```

### Configure environment
Create/edit `frontend/.env.local`:
```
NEXT_PUBLIC_PRIVY_APP_ID=mock-id
NEXT_PUBLIC_MONAD_RPC=https://rpc.testnet.monad.xyz
NEXT_PUBLIC_HIVEGUARD_ENGINE_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

> **Note:** For production Privy integration, get your App ID from https://dashboard.privy.io/

### Run frontend
```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 14.0.0
  ✓ Ready in 2.5s
  ◇ Listening on http://localhost:3000
```

Frontend is ready at `http://localhost:3000`

---

## 3️⃣ Smart Contracts (Foundry Optional)

If you want to compile and test the contracts locally, install Foundry:
https://book.getfoundry.sh/getting-started/installation

### Compile contracts
```bash
cd contracts
forge build
```

### Run tests
```bash
cd contracts
forge test
```

Expected output:
```
Running 8 tests for test/HiveGuardEngine.t.sol
[PASS] testDuplicateTxHash
[PASS] testHoldTransaction
[PASS] testOnlyOwnerCanSetWhitelist
[PASS] testOnlyRelayerCanResolve
[PASS] testResolveTransactionFail
[PASS] testResolveTransactionPass
[PASS] testWhitelistedBypass
[PASS] testWhitelistBypass

Test result: ok. 8 passed
```

### Deploy to Monad Testnet
First, create `.env` in contracts directory:
```
PRIVATE_KEY=0xyourprivatekeyhere
```

Then deploy:
```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.monad.xyz \
  --broadcast
```

**Note:** Get testnet ETH from the Monad faucet: https://faucet.testnet.monad.xyz

---

## 🎯 Full Stack Verification

### 1. Start all services
Terminal 1 (Backend):
```bash
cd backend && python main.py
```

Terminal 2 (Frontend):
```bash
cd frontend && npm run dev
```

### 2. Test in browser
1. Open http://localhost:3000
2. Click "🔓 Activate EIP-7702"
3. Click "✅ Test Valid Protocol" 
4. Watch the log stream show:
   - Agent 402-A score
   - Agent 402-B score
   - Agent 402-C score
   - Consensus score
   - PASS/REVERT result

### 3. Verify backend logs
Check your backend terminal for request logs:
```
POST /api/v1/audit
Request: {txHash: "0x...", targetContract: "0x...", payloadData: "0x..."}
Response: {consensusScore: 88, breakdown: {...}, action: "PASS"}
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
# On Windows: netstat -ano | findstr :8000
# On macOS/Linux: lsof -i :8000

# If in use, kill the process or change port in main.py
```

### Frontend can't reach backend
- Ensure backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Verify CORS is enabled (it is, in `main.py`)

### "Module not found" errors in Python
```bash
# Reinstall in venv
pip install -r requirements.txt --force-reinstall
```

### "React version mismatch" in frontend
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Project Structure

```
hiveguard/
├── contracts/          # Foundry Solidity project
│   ├── src/
│   │   ├── HiveGuardEngine.sol     # Main escrow contract
│   │   ├── MockContracts.sol       # Test targets
│   │   └── interfaces/IERC8004Registry.sol
│   ├── test/HiveGuardEngine.t.sol  # Tests
│   ├── script/Deploy.s.sol         # Deployment script
│   └── foundry.toml
│
├── backend/            # Python FastAPI
│   ├── main.py         # API + consensus engine
│   ├── models.py       # Pydantic schemas
│   ├── agents/         # Code review, social scan, simulation
│   ├── requirements.txt
│   └── .env
│
├── frontend/           # Next.js 14
│   ├── src/
│   │   ├── app/layout.tsx     # Root layout
│   │   ├── app/page.tsx       # Security lab page
│   │   ├── components/        # UI components
│   │   ├── utils/             # Utilities
│   │   └── styles/globals.css
│   ├── package.json
│   └── .env.local
│
└── README.md           # Project overview
```

---

## 🚀 Next Steps

1. ✅ Setup complete
2. Run all three services
3. Test with valid/malicious protocols
4. Integrate with real Privy App ID for production
5. Deploy contracts to Monad testnet
6. Connect real wallet for testing

---

## 📚 Resources

- Monad Docs: https://docs.monad.xyz
- Foundry: https://book.getfoundry.sh
- Privy: https://docs.privy.io
- FastAPI: https://fastapi.tiangolo.com
- Next.js: https://nextjs.org/docs

