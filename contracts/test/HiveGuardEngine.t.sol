// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {HiveGuardEngine, TxStatus} from "../src/HiveGuardEngine.sol";
import {MockValidStakingPool, MockMaliciousDrainer} from "../src/MockContracts.sol";

contract HiveGuardEngineTest is Test {
    HiveGuardEngine engine;
    MockValidStakingPool validStaking;
    MockMaliciousDrainer maliciousDrainer;
    address relayer;
    address user;

    function setUp() public {
        engine = new HiveGuardEngine();
        validStaking = new MockValidStakingPool();
        maliciousDrainer = new MockMaliciousDrainer(address(this));
        relayer = address(0x123);
        user = address(0x456);

        engine.setRelayer(relayer, true);
    }

    function testWhitelistBypass() public {
        engine.setWhitelist(address(validStaking), true);
        assert(engine.targetWhitelist(address(validStaking)));
    }

    function testHoldTransaction() public {
        bytes32 txHash = keccak256(abi.encode("test-tx-1"));
        bytes memory data = abi.encodeWithSignature("stake()");

        vm.prank(user);
        engine.holdTransaction{value: 1 ether}(txHash, address(validStaking), data);

        assert(engine.txLedger(txHash).sender == user);
        assert(engine.txLedger(txHash).target == address(validStaking));
        assert(engine.txLedger(txHash).value == 1 ether);
    }

    function testWhitelistedBypass() public {
        engine.setWhitelist(address(validStaking), true);
        bytes32 txHash = keccak256(abi.encode("test-tx-bypass"));
        bytes memory data = abi.encodeWithSignature("stake()");

        vm.prank(user);
        vm.expectRevert("TARGET_WHITELISTED");
        engine.holdTransaction{value: 1 ether}(txHash, address(validStaking), data);
    }

    function testResolveTransactionPass() public {
        bytes32 txHash = keccak256(abi.encode("test-tx-pass"));
        bytes memory data = abi.encodeWithSignature("stake()");

        vm.prank(user);
        engine.holdTransaction{value: 1 ether}(txHash, address(validStaking), data);

        vm.prank(relayer);
        engine.resolveTransaction(txHash, 95);

        assert(uint8(engine.txLedger(txHash).status) == uint8(TxStatus.Released));
        assert(engine.txLedger(txHash).finalConfidenceScore == 95);
    }

    function testResolveTransactionFail() public {
        bytes32 txHash = keccak256(abi.encode("test-tx-fail"));
        bytes memory data = abi.encodeWithSignature("stake()");

        uint256 initialBalance = user.balance;

        vm.prank(user);
        engine.holdTransaction{value: 1 ether}(txHash, address(maliciousDrainer), data);

        uint256 balanceAfterHold = user.balance;

        vm.prank(relayer);
        engine.resolveTransaction(txHash, 12);

        assert(uint8(engine.txLedger(txHash).status) == uint8(TxStatus.Refunded));
        assert(user.balance == balanceAfterHold + 1 ether);
    }

    function testDuplicateTxHash() public {
        bytes32 txHash = keccak256(abi.encode("test-tx-dup"));
        bytes memory data = abi.encodeWithSignature("stake()");

        vm.prank(user);
        engine.holdTransaction{value: 1 ether}(txHash, address(validStaking), data);

        vm.prank(user);
        vm.expectRevert("DUPLICATE_TX_HASH");
        engine.holdTransaction{value: 1 ether}(txHash, address(validStaking), data);
    }

    function testOnlyOwnerCanSetWhitelist() public {
        vm.prank(user);
        vm.expectRevert("NOT_OWNER");
        engine.setWhitelist(address(validStaking), true);
    }

    function testOnlyRelayerCanResolve() public {
        bytes32 txHash = keccak256(abi.encode("test-tx-auth"));
        bytes memory data = abi.encodeWithSignature("stake()");

        vm.prank(user);
        engine.holdTransaction{value: 1 ether}(txHash, address(validStaking), data);

        vm.prank(user);
        vm.expectRevert("NOT_AUTHORIZED_RELAYER");
        engine.resolveTransaction(txHash, 95);
    }

    function testRecordAgentScores() public {
        bytes32 txHash = keccak256(abi.encode("test-tx-scores"));
        bytes memory data = abi.encodeWithSignature("stake()");

        vm.prank(user);
        engine.holdTransaction{value: 1 ether}(txHash, address(validStaking), data);

        vm.prank(relayer);
        engine.recordAgentScores(txHash, 95, 88, 92);

        assert(engine.txAudits(txHash).agentScore1 == 95);
        assert(engine.txAudits(txHash).agentScore2 == 88);
        assert(engine.txAudits(txHash).agentScore3 == 92);
    }

    function testAddBlacklist() public {
        engine.addBlacklist(address(maliciousDrainer), true);
        assert(engine.isBlacklisted(address(maliciousDrainer)));

        engine.addBlacklist(address(maliciousDrainer), false);
        assert(!engine.isBlacklisted(address(maliciousDrainer)));
    }

    function testOnlyOwnerCanBlacklist() public {
        vm.prank(user);
        vm.expectRevert("NOT_OWNER");
        engine.addBlacklist(address(maliciousDrainer), true);
    }

    function testThresholdChanged() public {
        assert(engine.securityThreshold() == 80);
    }
}
