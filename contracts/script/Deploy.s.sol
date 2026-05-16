// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {HiveGuardEngine} from "../src/HiveGuardEngine.sol";
import {ERC8004Registry} from "../src/ERC8004Registry.sol";
import {MockValidStakingPool, MockMaliciousDrainer} from "../src/MockContracts.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        HiveGuardEngine engine = new HiveGuardEngine();
        ERC8004Registry registry = new ERC8004Registry();
        MockValidStakingPool validStaking = new MockValidStakingPool();
        MockMaliciousDrainer maliciousDrainer = new MockMaliciousDrainer(msg.sender);

        // Load whitelist addresses from env
        string memory whitelistStr = vm.envString("WHITELIST_ADDRESSES");
        if (bytes(whitelistStr).length > 0) {
            // For MVP, manually set known addresses
            // Format: "0xAddress1,0xAddress2,0xAddress3"
            // In production, parse the comma-separated string
            engine.setWhitelist(address(validStaking), true);
        } else {
            // Default: whitelist the mock staking pool
            engine.setWhitelist(address(validStaking), true);
        }

        vm.stopBroadcast();
    }
}
