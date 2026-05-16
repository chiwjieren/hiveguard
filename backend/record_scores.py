"""
Helper module for recording agent scores to HiveGuardEngine contract.
"""
import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz")
HIVEGUARD_ENGINE = os.getenv("HIVEGUARD_ENGINE_ADDRESS", "0x996fBA49dBFD37ba7deF90eeCb53733e4bDD0C02")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = Account.from_key(PRIVATE_KEY) if PRIVATE_KEY else None

HIVEGUARD_ABI = [
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
        "inputs": [{"internalType": "address", "name": "relayer", "type": "address"},
                   {"internalType": "bool", "name": "status", "type": "bool"}],
        "name": "setRelayer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]

def send_tx(tx):
    """Sign and send transaction"""
    if not account:
        raise ValueError("PRIVATE_KEY not set in environment")
    signed_tx = Account.sign_transaction(tx, PRIVATE_KEY)
    raw_tx = getattr(signed_tx, 'rawTransaction', signed_tx[0])
    tx_hash = w3.eth.send_raw_transaction(raw_tx)
    return tx_hash

def record_agent_scores_on_chain(tx_hash: str, score1: int, score2: int, score3: int) -> dict:
    """
    Record agent scores to HiveGuardEngine contract.

    Args:
        tx_hash: Transaction hash (0x-prefixed)
        score1: Agent 402-A score (0-100)
        score2: Agent 402-B score (0-100)
        score3: Agent 402-C score (0-100)

    Returns:
        dict with success, receipt, and tx_hash
    """
    try:
        if not account:
            return {
                "success": False,
                "error": "PRIVATE_KEY not configured. Scores not recorded on-chain.",
                "tx_hash": None
            }

        contract = w3.eth.contract(
            address=Web3.to_checksum_address(HIVEGUARD_ENGINE),
            abi=HIVEGUARD_ABI
        )

        # Convert tx_hash string to bytes32
        tx_hash_bytes = bytes.fromhex(tx_hash.replace('0x', ''))

        # Build transaction
        tx = contract.functions.recordAgentScores(
            tx_hash_bytes, score1, score2, score3
        ).build_transaction({
            'from': account.address,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        # Sign and send
        tx_receipt = send_tx(tx)
        receipt = w3.eth.wait_for_transaction_receipt(tx_receipt, timeout=60)

        return {
            "success": receipt['status'] == 1,
            "tx_hash": tx_receipt.hex(),
            "receipt": {
                "status": receipt['status'],
                "blockNumber": receipt['blockNumber'],
                "gasUsed": receipt['gasUsed']
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "tx_hash": None
        }
