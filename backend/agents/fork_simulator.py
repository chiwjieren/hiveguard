from web3 import Web3
import os

w3 = Web3(Web3.HTTPProvider(os.getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz")))

HIVEGUARD_ENGINE_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "isBlacklisted",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    }
]

def score_simulation(target: str, payload: str) -> int:
    """
    Check if target address is blacklisted on HiveGuardEngine.
    If blacklisted: return 10 (high risk)
    If not blacklisted: return 100 (no history of exploit)
    """
    try:
        engine_address = os.getenv("HIVEGUARD_ENGINE_ADDRESS", "0x996fBA49dBFD37ba7deF90eeCb53733e4bDD0C02")
        contract = w3.eth.contract(address=Web3.to_checksum_address(engine_address), abi=HIVEGUARD_ENGINE_ABI)

        target_checksum = Web3.to_checksum_address(target)
        is_blacklisted = contract.functions.isBlacklisted(target_checksum).call()

        if is_blacklisted:
            return 10
        return 100
    except Exception as e:
        print(f"Simulation error: {e}")
        return 50
