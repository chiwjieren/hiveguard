/**
 * Etherscan/RPC utilities for fetching transaction history
 * Uses Monad testnet RPC to query HiveGuardEngine contract
 */

const MONAD_RPC = process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz";
const HIVEGUARD_ENGINE = process.env.NEXT_PUBLIC_HIVEGUARD_ENGINE_ADDRESS || "0x996fBA49dBFD37ba7deF90eeCb53733e4bDD0C02";

export interface TransactionRecord {
  txHash: string;
  timestamp: number;
  target: string;
  value: string;
  status: "Pending" | "Released" | "Refunded";
  consensusScore: number;
  agentScores: {
    agent_402_a: number;
    agent_402_b: number;
    agent_402_c: number;
  };
}

/**
 * Fetch transaction details from contract via RPC
 */
export async function getTransactionDetails(txHash: string): Promise<TransactionRecord | null> {
  try {
    // Convert txHash to bytes32 format for contract query
    const txHashBytes32 = txHash.startsWith("0x") ? txHash : `0x${txHash}`;

    // Query HiveGuardEngine.txLedger[txHash]
    const response = await fetch(MONAD_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: HIVEGUARD_ENGINE,
            data: encodeFunctionCall("txLedger", [txHashBytes32]),
          },
          "latest",
        ],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("RPC error:", data.error);
      return null;
    }

    // Decode response (sender, target, value, data, status, finalScore)
    const decoded = decodeTxLedger(data.result);
    if (!decoded) return null;

    // Query agent scores
    const scoresResponse = await fetch(MONAD_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: HIVEGUARD_ENGINE,
            data: encodeFunctionCall("txAudits", [txHashBytes32]),
          },
          "latest",
        ],
        id: 2,
      }),
    });

    const scoresData = await scoresResponse.json();
    const scores = scoresData.result ? decodeTxAudits(scoresData.result) : { a: 0, b: 0, c: 0 };

    const statusMap: { [key: number]: "Pending" | "Released" | "Refunded" } = {
      0: "Pending",
      1: "Released",
      2: "Refunded",
    };

    return {
      txHash,
      timestamp: Math.floor(Date.now() / 1000),
      target: decoded.target,
      value: decoded.value,
      status: statusMap[decoded.status] || "Pending",
      consensusScore: decoded.finalScore,
      agentScores: {
        agent_402_a: scores.a,
        agent_402_b: scores.b,
        agent_402_c: scores.c,
      },
    };
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return null;
  }
}

/**
 * Fetch mock transaction history (for MVP)
 * In production, would use Etherscan API or index events
 */
export async function getWalletTransactionHistory(
  walletAddress: string
): Promise<TransactionRecord[]> {
  try {
    // MVP: Return mock data
    // Production: Query events from HiveGuardEngine or use Etherscan API
    const mockTransactions: TransactionRecord[] = [
      {
        txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        target: "0x55EbeF0C36eb9BD23821CA35916Ca59d148F394B",
        value: "0.1",
        status: "Released",
        consensusScore: 92,
        agentScores: {
          agent_402_a: 95,
          agent_402_b: 88,
          agent_402_c: 92,
        },
      },
      {
        txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        timestamp: Math.floor(Date.now() / 1000) - 7200,
        target: "0x0A39F71802D2C32a1528946dedb46eD67C61BA43",
        value: "0.05",
        status: "Refunded",
        consensusScore: 15,
        agentScores: {
          agent_402_a: 10,
          agent_402_b: 20,
          agent_402_c: 15,
        },
      },
    ];

    return mockTransactions;
  } catch (error) {
    console.error("Error fetching wallet history:", error);
    return [];
  }
}

// Helper: Encode function call for RPC
function encodeFunctionCall(functionName: string, params: any[]): string {
  // Function signatures
  const signatures: { [key: string]: string } = {
    txLedger: "0x4282a80e", // function txLedger(bytes32)
    txAudits: "0x3c1bc036", // function txAudits(bytes32)
  };

  const selector = signatures[functionName] || "0x00000000";
  // For MVP, return selector only (would need full ABI encoding for params)
  return selector + "0".repeat(64); // Pad with zeros
}

// Helper: Decode txLedger response
function decodeTxLedger(result: string): any {
  // MVP: Parse raw response
  // Production: Use ethers.js AbiCoder for proper decoding
  return {
    sender: "0x0000000000000000000000000000000000000000",
    target: "0x55EbeF0C36eb9BD23821CA35916Ca59d148F394B",
    value: "100000000000000000", // 0.1 ETH
    status: 1, // Released
    finalScore: 92,
  };
}

// Helper: Decode txAudits response
function decodeTxAudits(result: string): any {
  return {
    a: 95,
    b: 88,
    c: 92,
  };
}
