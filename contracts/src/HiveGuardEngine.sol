// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IERC8004Registry {
    function verifyAgent(uint256 agentId) external view returns (bool);
    function recordFeedback(uint256 agentId, uint8 confidenceRating, string calldata metadataURI) external;
}

enum TxStatus { NonExistent, Pending, Released, Refunded }

struct TransactionGuard {
    address sender;
    address target;
    uint256 value;
    bytes data;
    TxStatus status;
    uint256 finalConfidenceScore;
}

struct TransactionAudit {
    uint256 agentScore1;
    uint256 agentScore2;
    uint256 agentScore3;
}

contract HiveGuardEngine {
    address public owner;
    uint256 public securityThreshold = 80;

    mapping(bytes32 => TransactionGuard) public txLedger;
    mapping(bytes32 => TransactionAudit) public txAudits;
    mapping(address => bool) public targetWhitelist;
    mapping(address => bool) public authorizedSwarmRelayers;
    mapping(address => bool) public isBlacklisted;

    event TransactionHeld(bytes32 indexed txHash, address indexed sender, address indexed target, uint256 value);
    event TransactionResolved(bytes32 indexed txHash, TxStatus status, uint256 confidenceScore);
    event AgentScoresRecorded(bytes32 indexed txHash, uint256 agent1, uint256 agent2, uint256 agent3);
    event AddressBlacklisted(address indexed target, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyRelayer() {
        require(authorizedSwarmRelayers[msg.sender], "NOT_AUTHORIZED_RELAYER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setWhitelist(address target, bool status) external onlyOwner {
        targetWhitelist[target] = status;
    }

    function setRelayer(address relayer, bool status) external onlyOwner {
        authorizedSwarmRelayers[relayer] = status;
    }

    function setSecurityThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= 100, "INVALID_THRESHOLD");
        securityThreshold = newThreshold;
    }

    function holdTransaction(bytes32 txHash, address target, bytes calldata data) external payable {
        require(txLedger[txHash].status == TxStatus.NonExistent, "DUPLICATE_TX_HASH");
        require(!targetWhitelist[target], "TARGET_WHITELISTED");

        txLedger[txHash] = TransactionGuard({
            sender: msg.sender,
            target: target,
            value: msg.value,
            data: data,
            status: TxStatus.Pending,
            finalConfidenceScore: 0
        });

        emit TransactionHeld(txHash, msg.sender, target, msg.value);
    }

    function resolveTransaction(bytes32 txHash, uint256 confidenceScore) external onlyRelayer {
        TransactionGuard storage managedTx = txLedger[txHash];
        require(managedTx.status == TxStatus.Pending, "TRANSACTION_NOT_PENDING");

        managedTx.finalConfidenceScore = confidenceScore;

        if (confidenceScore >= securityThreshold) {
            managedTx.status = TxStatus.Released;
            (bool success, ) = managedTx.target.call{value: managedTx.value}(managedTx.data);
            require(success, "EXECUTION_FAILED");
            emit TransactionResolved(txHash, TxStatus.Released, confidenceScore);
        } else {
            managedTx.status = TxStatus.Refunded;
            payable(managedTx.sender).transfer(managedTx.value);
            emit TransactionResolved(txHash, TxStatus.Refunded, confidenceScore);
        }
    }

    function recordAgentScores(bytes32 txHash, uint256 score1, uint256 score2, uint256 score3) external onlyRelayer {
        require(txLedger[txHash].status != TxStatus.NonExistent, "TRANSACTION_NOT_FOUND");
        txAudits[txHash] = TransactionAudit(score1, score2, score3);
        emit AgentScoresRecorded(txHash, score1, score2, score3);
    }

    function addBlacklist(address target, bool status) external onlyOwner {
        isBlacklisted[target] = status;
        emit AddressBlacklisted(target, status);
    }
}
