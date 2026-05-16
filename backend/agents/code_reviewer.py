from web3 import Web3
import os

w3 = Web3(Web3.HTTPProvider(os.getenv("MONAD_RPC_URL", "https://rpc.testnet.monad.xyz")))

def score_code(address: str) -> int:
    """
    Scan bytecode for transfer patterns & honeypot markers.
    Heuristic: empty code (EOA) = 100, transfer sig found = 10, otherwise = 95.
    """
    try:
        checksum_addr = Web3.to_checksum_address(address)
        bytecode = w3.eth.get_code(checksum_addr).hex()

        if bytecode == "0x" or bytecode == "":
            return 100

        if "a9059cbb" in bytecode:
            return 10

        return 95
    except Exception as e:
        print(f"Code review error: {e}")
        return 50
