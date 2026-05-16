def score_social(address: str) -> int:
    """
    Evaluate social/reputation indicators.
    MVP: Hardcoded known exploit list. No live API calls.
    Heuristic: Known bad address = 5, otherwise = 90.
    """
    KNOWN_EXPLOIT_ADDRESSES = [
        "0x0000000000000000000000000000000000000001",
    ]

    if address.lower() in [addr.lower() for addr in KNOWN_EXPLOIT_ADDRESSES]:
        return 5

    return 90
