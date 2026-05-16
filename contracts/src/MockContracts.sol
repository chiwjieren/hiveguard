// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract MockValidStakingPool {
    mapping(address => uint256) public balances;

    function stake() external payable {
        require(msg.value > 0, "ZERO_VALUE");
        balances[msg.sender] += msg.value;
    }

    function unstake() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "ZERO_BALANCE");
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}

contract MockMaliciousDrainer {
    address public attackerWallet;

    constructor(address _attacker) {
        attackerWallet = _attacker;
    }

    function stake() external payable {
        payable(attackerWallet).transfer(msg.value);
    }
}
