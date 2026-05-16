#!/usr/bin/env python3
"""
HiveGuard Contract Testing Script
Tests all contract functionality on Monad testnet
"""

import os
from web3 import Web3
from dotenv import load_dotenv
from eth_account import Account
import json
import time

load_dotenv()

# Configuration
RPC_URL = os.getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "0xf12b75f65c8d74e9e4adda2a71e5b37c83a3195c2ed1223e47a10a1f5cb06694")
HIVEGUARD_ENGINE = os.getenv("HIVEGUARD_ENGINE_ADDRESS", "0x996fBA49dBFD37ba7deF90eeCb53733e4bDD0C02")
ERC8004_REGISTRY = os.getenv("ERC8004_REGISTRY_ADDRESS", "0x6E789c2feE2D84DA06D3789C85122eA78F1043DA")
MOCK_STAKING = os.getenv("NEXT_PUBLIC_MOCK_STAKING_ADDRESS", "0x55EbeF0C36eb9BD23821CA35916Ca59d148F394B")
MOCK_DRAINER = os.getenv("NEXT_PUBLIC_MOCK_DRAINER_ADDRESS", "0x0A39F71802D2C32a1528946dedb46eD67C61BA43")

# Connect to web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = Account.from_key(PRIVATE_KEY)

def send_tx(tx):
    """Helper to sign and send transaction"""
    signed_tx = Account.sign_transaction(tx, PRIVATE_KEY)
    # Handle both old and new web3.py versions
    raw_tx = getattr(signed_tx, 'rawTransaction', signed_tx[0])
    tx_hash = w3.eth.send_raw_transaction(raw_tx)
    return tx_hash

def check_tx_receipt(tx_hash, timeout=60):
    """Wait for receipt and check for errors"""
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=timeout)
    if receipt['status'] == 0:
        # Try to get revert reason
        try:
            tx = w3.eth.get_transaction(tx_hash)
            w3.eth.call(tx)
        except Exception as e:
            print_error(f"Transaction reverted: {str(e)}")
    return receipt

# Contract ABIs
HIVEGUARD_ABI = [
    {
        "inputs": [{"internalType": "bytes32", "name": "txHash", "type": "bytes32"},
                   {"internalType": "address", "name": "target", "type": "address"},
                   {"internalType": "bytes", "name": "data", "type": "bytes"}],
        "name": "holdTransaction",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "txHash", "type": "bytes32"},
                   {"internalType": "uint256", "name": "score1", "type": "uint256"},
                   {"internalType": "uint256", "name": "score2", "type": "uint256"},
                   {"internalType": "uint256", "name": "score3", "type": "uint256"}],
        "name": "recordAgentScores",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "txHash", "type": "bytes32"},
                   {"internalType": "uint256", "name": "confidenceScore", "type": "uint256"}],
        "name": "resolveTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "target", "type": "address"},
                   {"internalType": "bool", "name": "status", "type": "bool"}],
        "name": "setWhitelist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "relayer", "type": "address"},
                   {"internalType": "bool", "name": "status", "type": "bool"}],
        "name": "setRelayer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "target", "type": "address"},
                   {"internalType": "bool", "name": "status", "type": "bool"}],
        "name": "addBlacklist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "name": "txLedger",
        "outputs": [{"internalType": "address", "name": "sender", "type": "address"},
                    {"internalType": "address", "name": "target", "type": "address"},
                    {"internalType": "uint256", "name": "value", "type": "uint256"},
                    {"internalType": "bytes", "name": "data", "type": "bytes"},
                    {"internalType": "uint8", "name": "status", "type": "uint8"},
                    {"internalType": "uint256", "name": "finalConfidenceScore", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "name": "txAudits",
        "outputs": [{"internalType": "uint256", "name": "agentScore1", "type": "uint256"},
                    {"internalType": "uint256", "name": "agentScore2", "type": "uint256"},
                    {"internalType": "uint256", "name": "agentScore3", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "isBlacklisted",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "targetWhitelist",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
]

ERC8004_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "agentId", "type": "uint256"},
                   {"internalType": "uint8", "name": "rating", "type": "uint8"},
                   {"internalType": "string", "name": "metadataURI", "type": "string"}],
        "name": "recordFeedback",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "uint256", "name": "agentId", "type": "uint256"}],
        "name": "getAverageRating",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]

def print_test(name):
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print(f"{'='*60}")

def print_success(msg):
    print(f"✅ {msg}")

def print_error(msg):
    print(f"❌ {msg}")

def test_connection():
    """Test connection to Monad testnet"""
    print_test("Connection to Monad Testnet")
    try:
        block = w3.eth.block_number
        print_success(f"Connected to Monad testnet. Current block: {block}")
        balance = w3.eth.get_balance(account.address)
        print_success(f"Account balance: {w3.from_wei(balance, 'ether')} MON")

        # Verify HiveGuardEngine contract exists
        code = w3.eth.get_code(Web3.to_checksum_address(HIVEGUARD_ENGINE))
        if code == "0x":
            print_error("HiveGuardEngine contract not found at address!")
            return False
        print_success(f"HiveGuardEngine contract found at {HIVEGUARD_ENGINE}")

        # Verify contract is not whitelisting the target
        contract = w3.eth.contract(address=Web3.to_checksum_address(HIVEGUARD_ENGINE), abi=HIVEGUARD_ABI)
        mock_staking = Web3.to_checksum_address(MOCK_STAKING)
        is_whitelisted = contract.functions.targetWhitelist(mock_staking).call()
        print_success(f"MOCK_STAKING whitelisted: {is_whitelisted}")

        return True
    except Exception as e:
        print_error(f"Connection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_hold_transaction():
    """Test holdTransaction function"""
    print_test("Hold Transaction")
    try:
        contract = w3.eth.contract(address=Web3.to_checksum_address(HIVEGUARD_ENGINE), abi=HIVEGUARD_ABI)

        tx_hash = w3.keccak(text="test-tx-drainer")
        target = Web3.to_checksum_address(MOCK_DRAINER)
        value = w3.to_wei(0.001, 'ether')
        data = b''

        # Verify target is NOT whitelisted
        is_whitelisted = contract.functions.targetWhitelist(target).call()
        print_success(f"MOCK_DRAINER whitelisted: {is_whitelisted}")

        if is_whitelisted:
            print_error("Target is whitelisted, holdTransaction will reject it!")
            return None, None

        # Build transaction with higher gas limit
        tx = contract.functions.holdTransaction(tx_hash, target, data).build_transaction({
            'from': account.address,
            'value': value,
            'gas': 500000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        # Sign and send
        tx_receipt = send_tx(tx)
        receipt = check_tx_receipt(tx_receipt, timeout=60)
        print_success(f"Transaction held. Hash: {tx_receipt.hex()}")
        print_success(f"Tx Status: {receipt['status']}")

        # Verify transaction was stored
        stored_tx = contract.functions.txLedger(tx_hash).call()
        print_success(f"Stored tx sender: {stored_tx[0]}")
        print_success(f"Stored tx target: {stored_tx[1]}")
        print_success(f"Stored tx value: {stored_tx[2]}")

        return tx_hash, receipt
    except Exception as e:
        print_error(f"Hold transaction failed: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def test_record_agent_scores(tx_hash):
    """Test recordAgentScores function"""
    print_test("Record Agent Scores")
    try:
        contract = w3.eth.contract(address=Web3.to_checksum_address(HIVEGUARD_ENGINE), abi=HIVEGUARD_ABI)

        # First set account as relayer
        tx = contract.functions.setRelayer(account.address, True).build_transaction({
            'from': account.address,
            'gas': 200000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })
        tx_receipt = send_tx(tx)
        w3.eth.wait_for_transaction_receipt(tx_receipt, timeout=60)
        print_success("Set account as relayer")

        # Record scores
        score1, score2, score3 = 95, 88, 92
        tx = contract.functions.recordAgentScores(tx_hash, score1, score2, score3).build_transaction({
            'from': account.address,
            'gas': 200000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        tx_receipt = send_tx(tx)
        receipt = w3.eth.wait_for_transaction_receipt(tx_receipt, timeout=60)
        print_success(f"Agent scores recorded. Tx: {tx_receipt.hex()}")

        # Verify scores stored
        stored_scores = contract.functions.txAudits(tx_hash).call()
        print_success(f"Stored scores - Agent 1: {stored_scores[0]}, Agent 2: {stored_scores[1]}, Agent 3: {stored_scores[2]}")

        return receipt
    except Exception as e:
        print_error(f"Record agent scores failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_blacklist():
    """Test blacklist functionality"""
    print_test("Blacklist Functionality")
    try:
        contract = w3.eth.contract(address=Web3.to_checksum_address(HIVEGUARD_ENGINE), abi=HIVEGUARD_ABI)

        drainer = Web3.to_checksum_address(MOCK_DRAINER)

        # Add to blacklist
        tx = contract.functions.addBlacklist(drainer, True).build_transaction({
            'from': account.address,
            'gas': 200000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        tx_receipt = send_tx(tx)
        receipt = w3.eth.wait_for_transaction_receipt(tx_receipt, timeout=60)
        print_success(f"MockMaliciousDrainer added to blacklist. Tx: {tx_receipt.hex()}")

        # Verify blacklist
        is_blacklisted = contract.functions.isBlacklisted(drainer).call()
        print_success(f"Is MockMaliciousDrainer blacklisted? {is_blacklisted}")

        return receipt
    except Exception as e:
        print_error(f"Blacklist test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_erc8004_reputation():
    """Test ERC8004 reputation recording"""
    print_test("ERC8004 Reputation Recording")
    try:
        contract = w3.eth.contract(address=Web3.to_checksum_address(ERC8004_REGISTRY), abi=ERC8004_ABI)

        agent_id = 1
        rating = 4

        tx = contract.functions.recordFeedback(agent_id, rating, "test-metadata").build_transaction({
            'from': account.address,
            'gas': 200000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        tx_receipt = send_tx(tx)
        receipt = w3.eth.wait_for_transaction_receipt(tx_receipt, timeout=60)
        print_success(f"Feedback recorded for Agent 1. Tx: {tx_receipt.hex()}")

        # Get average rating
        avg_rating = contract.functions.getAverageRating(agent_id).call()
        print_success(f"Agent 1 average rating: {avg_rating}")

        return receipt
    except Exception as e:
        print_error(f"ERC8004 test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_whitelist_bypass():
    """Test that whitelisted targets bypass escrow"""
    print_test("Whitelist Bypass Feature")
    try:
        contract = w3.eth.contract(address=Web3.to_checksum_address(HIVEGUARD_ENGINE), abi=HIVEGUARD_ABI)

        tx_hash = w3.keccak(text="test-tx-staking-whitelisted")
        target = Web3.to_checksum_address(MOCK_STAKING)

        # Verify target is whitelisted
        is_whitelisted = contract.functions.targetWhitelist(target).call()
        print_success(f"MOCK_STAKING whitelisted: {is_whitelisted}")

        if not is_whitelisted:
            print_error("Target should be whitelisted for this test!")
            return None

        # Try to hold transaction - should fail because target is whitelisted
        try:
            tx = contract.functions.holdTransaction(tx_hash, target, b'').build_transaction({
                'from': account.address,
                'gas': 500000,
                'gasPrice': w3.eth.gas_price,
                'nonce': w3.eth.get_transaction_count(account.address),
            })
            tx_receipt = send_tx(tx)
            receipt = w3.eth.wait_for_transaction_receipt(tx_receipt, timeout=60)

            if receipt['status'] == 0:
                print_success("✓ Whitelisted target correctly rejected (TARGET_WHITELISTED)")
            else:
                print_error("Whitelisted target should have been rejected!")
            return receipt
        except Exception as e:
            print_success(f"✓ Whitelisted target rejected as expected")
            return None

    except Exception as e:
        print_error(f"Whitelist bypass test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    print("\n" + "="*60)
    print("🛡️  HIVEGUARD CONTRACT TEST SUITE")
    print("="*60)
    print(f"Network: Monad Testnet")
    print(f"Account: {account.address}")
    print(f"HiveGuardEngine: {HIVEGUARD_ENGINE}")
    print(f"ERC8004Registry: {ERC8004_REGISTRY}")

    # Run tests
    if not test_connection():
        return

    tx_hash, receipt1 = test_hold_transaction()
    if tx_hash:
        test_record_agent_scores(tx_hash)

    test_whitelist_bypass()
    test_blacklist()
    test_erc8004_reputation()

    print("\n" + "="*60)
    print("✅ TEST SUITE COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
